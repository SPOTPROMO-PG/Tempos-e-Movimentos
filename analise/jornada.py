# -*- coding: utf-8 -*-
"""
Quanto cada movimento consome da jornada de 8h do promotor.

O ponto central do método: as atividades se sobrepõem no tempo. O promotor
atende 2 ou 3 categorias na mesma ida à gôndola e marca a mesma janela para
cada uma. Somar as durações declaradas infla o total em ~2,4x e faria os
percentuais passarem de 100%.

Solução: alocação por minuto. Percorremos a linha do tempo da visita minuto
a minuto; em cada minuto, o tempo é dividido igualmente entre as atividades
ativas naquele minuto. Assim:
  - a soma de todos os movimentos = tempo real dentro da loja (a união dos
    intervalos), não a soma inflada;
  - os percentuais fecham em 100%;
  - dois movimentos feitos em paralelo levam metade do crédito cada,
    que é a leitura honesta de "quanto daquele minuto foi para cada um".

Saídas:
  analise/saida/jornada_geral.csv
  analise/saida/jornada_por_canal.csv
  analise/saida/resumo_visitas.csv
"""

import io
import json
import os
import re

import pandas as pd

RAIZ = '.'
JORNADA_MIN = 8 * 60          # jornada de referência: 8 horas
LIMITE_ATIV_MIN = 240         # acima disso é erro de digitação, não atividade

# Classificação de cada movimento pela natureza do trabalho. "Execução" é o
# que muda a gôndola para o shopper; "deslocamento e busca" é andar e
# procurar; "espera" é portaria, cadastro e EPI. O que sobra é apoio e
# análise — trabalho necessário, mas que não move produto.
EXECUCAO = {
    'Abastecimento e organização (Layout/KBDs etc)', 'Precificar todos os itens',
    'Limpeza antes do abastecimento', 'Limpeza dos móveis antes do abastecimento',
    'Abastecer seguindo o guia de execução', "Abastecer seguindo guia de execução + KBD's",
    'Montagem do display / ponto extra', 'Limpeza do móvel / display',
    "Conferir KBD's (Direcionamentos Chaves)",
}
DESLOCAMENTO = {
    'Deslocamento interno dentro da loja', 'Deslocamento até o estoque',
    'Busca de produtos ou materiais em outros setores', 'Retorno ao setor com os produtos',
    'Buscar itens faltantes no estoque', 'Localizar produtos no estoque',
    'Deslocamento até a saída da loja', 'Localizar o setor / estoque / responsável',
    'Chegada à loja (portaria/entrada)', 'Deixar o setor / estoque',
}
ESPERA = {
    'Espera para autorização / cadastro / liberação',
    'Registro de entrada (app / sistema do cliente)', 'Saída da loja (portaria/catraca)',
    'Guardar pertences / retirar equipamentos / EPIs', 'Guardar equipamentos / materiais',
}


def classe_do(movimento):
    if movimento in EXECUCAO:
        return 'Execução (agrega valor)'
    if movimento in DESLOCAMENTO:
        return 'Deslocamento e busca'
    if movimento in ESPERA:
        return 'Espera e burocracia'
    return 'Apoio e análise'


def para_min(v):
    if pd.isna(v):
        return None
    if hasattr(v, 'hour'):
        return v.hour * 60 + v.minute
    m = re.match(r'^(\d{1,2}):(\d{2})', str(v).strip())
    if not m:
        return None
    h, mi = int(m.group(1)), int(m.group(2))
    return h * 60 + mi if h < 24 and mi < 60 else None


def alocar_por_minuto(intervalos):
    """
    intervalos: lista de (rotulo, inicio_min, fim_min).
    Devolve {rotulo: minutos equivalentes} e o total (união dos intervalos).

    Cada minuto coberto vale 1. Se k atividades estão ativas nele, cada uma
    recebe 1/k. Somando tudo, o resultado é exatamente a união — ou seja, o
    tempo que o promotor de fato passou trabalhando na loja.
    """
    if not intervalos:
        return {}, 0.0
    ini = min(a for _, a, _ in intervalos)
    fim = max(b for _, _, b in intervalos)
    credito, cobertos = {}, 0
    for t in range(ini, fim):                      # cada minuto [t, t+1)
        ativos = [r for r, a, b in intervalos if a <= t < b]
        if not ativos:
            continue
        cobertos += 1
        fatia = 1.0 / len(ativos)
        for r in ativos:
            credito[r] = credito.get(r, 0.0) + fatia
    return credito, float(cobertos)


def main(caminho_xlsx):
    os.makedirs(f'{RAIZ}/analise/saida', exist_ok=True)
    df = pd.read_excel(caminho_xlsx, sheet_name='Respostas')

    # dedup (ver preparar.py: bug de envio duplicado até 14/08).
    #
    # As linhas antigas não têm 'ID Visita', então precisam de uma chave
    # derivada. A primeira versão usava a assinatura das 570 colunas de
    # horário, e isso se mostrou INSTÁVEL: a mesma visita rendia assinaturas
    # diferentes em exportações diferentes da planilha, e a contagem oscilava
    # (95 visitas onde havia 86). Promotor + loja + dia do envio é estável
    # entre exportações e ainda separa revisita legítima (mesma loja em outro
    # dia) da rajada de duplicatas, que chegava toda no mesmo minuto.
    ts = pd.to_datetime(df[df.columns[0]], errors='coerce').dt.date
    chave = (df['Promotor'].astype(str).str.upper().str.strip() + '||'
             + df['Loja'].astype(str).str.upper().str.strip() + '||'
             + ts.astype(str))
    if 'ID Visita' in df.columns:
        chave = df['ID Visita'].where(df['ID Visita'].notna(), chave)

    # Entre as cópias de uma mesma visita fica a MAIS COMPLETA, não a
    # primeira. As duplicatas não são idênticas: o promotor reenviava
    # conforme avançava no formulário, então a última cópia tem mais
    # horários preenchidos que a primeira. Guardar a primeira descartava
    # justamente a versão cheia — foi assim que o bloco Deslocamento
    # apareceu em 6 visitas quando estava preenchido em 14.
    cols_h = [c for c in df.columns if str(c).endswith(('- Início', '- Término'))]
    completude = df[cols_h].notna().sum(axis=1)
    ordem = completude.sort_values(ascending=False, kind='mergesort').index
    manter = chave.loc[ordem].drop_duplicates(keep='first').index
    df = df.loc[sorted(manter)].reset_index(drop=True)

    with io.open(f'{RAIZ}/analise/schema.json', encoding='utf-8') as f:
        sch = json.load(f)

    # mapeia cada par de colunas de horário -> (bloco, movimento)
    mapa = []
    for b in sch['blocos']:
        cats = b['categorias'] if b['por_categoria'] else [None]
        for cat in cats:
            for item in b['itens']:
                pre = (f"{b['titulo']} - {cat} - {item['label']}" if cat
                       else f"{b['titulo']} - {item['label']}")
                mapa.append((b['titulo'], item['label'], cat,
                             f'{pre} - Início', f'{pre} - Término'))

    linhas_mov, linhas_visita, linhas_freq = [], [], []
    for _, r in df.iterrows():
        intervalos = []
        # Duração declarada (soma das janelas do movimento naquela loja), antes
        # de dividir a sobreposição. Serve para responder "quanto dura este
        # movimento quando ele acontece", que é pergunta diferente de "quanto
        # do tempo da loja ele consome".
        declarado = {}
        for bloco, mov, cat, ci, cf in mapa:
            if ci not in df.columns:
                continue
            a, b_ = para_min(r.get(ci)), para_min(r.get(cf))
            if a is None or b_ is None or b_ < a:
                continue                      # inválido: término antes do início
            if b_ - a > LIMITE_ATIV_MIN:
                continue                      # implausível para uma atividade
            intervalos.append((f'{bloco}||{mov}', a, b_))
            declarado[(bloco, mov)] = declarado.get((bloco, mov), 0) + (b_ - a)

        credito, tempo_loja = alocar_por_minuto(intervalos)
        if tempo_loja <= 0:
            continue

        lojas_dia = pd.to_numeric(r.get('Nº total de lojas visitadas no dia'), errors='coerce')
        linhas_visita.append({
            'promotor': r.get('Promotor'), 'canal': r.get('Canal'),
            'rede': r.get('Rede'), 'loja': r.get('Loja'),
            'tempo_loja_min': tempo_loja, 'lojas_no_dia': lojas_dia,
            'movimentos': len(intervalos),
        })
        for k, v in credito.items():
            bloco, mov = k.split('||')
            linhas_mov.append({
                'promotor': r.get('Promotor'), 'canal': r.get('Canal'),
                'loja': r.get('Loja'), 'bloco': bloco, 'movimento': mov,
                'min_equivalente': v, 'tempo_loja_min': tempo_loja,
                'pct_da_visita': v / tempo_loja,
            })
        for (bloco, mov), dur in declarado.items():
            linhas_freq.append({
                'canal': r.get('Canal'), 'loja': r.get('Loja'),
                'bloco': bloco, 'movimento': mov, 'declarado_min': dur,
            })

    mov = pd.DataFrame(linhas_mov)
    vis = pd.DataFrame(linhas_visita)
    vis.to_csv(f'{RAIZ}/analise/saida/resumo_visitas.csv', index=False, encoding='utf-8-sig')

    # --- FREQUÊNCIA x DURAÇÃO ---
    # "Quanto do tempo da loja este movimento consome" e "quanto ele dura
    # quando acontece" são perguntas diferentes, e a distância entre as duas
    # respostas é grande: um movimento que só é cronometrado em metade das
    # lojas tem participação baixa mesmo durando muito nas lojas em que ocorre.
    # Sem esta tabela, a leitura de loja parece levar 30 min quando na verdade
    # leva 53 min nas lojas em que é feita.
    frq = pd.DataFrame(linhas_freq)
    freq = (frq.groupby(['bloco', 'movimento'])
               .agg(lojas_com_tempo=('declarado_min', lambda s: int((s > 0).sum())),
                    dur_mediana=('declarado_min',
                                 lambda s: s[s > 0].median() if (s > 0).any() else 0))
               .reset_index())
    freq['pct_lojas'] = freq.lojas_com_tempo / len(vis)
    freq = freq.sort_values('dur_mediana', ascending=False)
    freq.to_csv(f'{RAIZ}/analise/saida/frequencia.csv', index=False, encoding='utf-8-sig')

    fcan = (frq.groupby(['canal', 'bloco', 'movimento'])
               .agg(lojas_com_tempo=('declarado_min', lambda s: int((s > 0).sum())),
                    dur_mediana=('declarado_min',
                                 lambda s: s[s > 0].median() if (s > 0).any() else 0))
               .reset_index())
    fcan.to_csv(f'{RAIZ}/analise/saida/frequencia_canal.csv', index=False, encoding='utf-8-sig')

    # --- GERAL: participação de cada movimento no tempo de loja ---
    tot = mov.min_equivalente.sum()
    geral = (mov.groupby(['bloco', 'movimento'])
                .agg(min_equiv=('min_equivalente', 'sum'),
                     visitas=('loja', 'size'),
                     mediana_por_visita=('min_equivalente', 'median'))
                .reset_index())
    geral['classe'] = geral.movimento.map(classe_do)
    geral['pct_tempo_loja'] = geral.min_equiv / tot
    geral['min_em_8h'] = geral.pct_tempo_loja * JORNADA_MIN
    geral = geral.sort_values('pct_tempo_loja', ascending=False)
    geral.to_csv(f'{RAIZ}/analise/saida/jornada_geral.csv', index=False, encoding='utf-8-sig')

    # --- POR CANAL ---
    tc = mov.groupby('canal').min_equivalente.sum().rename('tot_canal')
    canal = (mov.groupby(['canal', 'bloco', 'movimento'])
                .agg(min_equiv=('min_equivalente', 'sum'),
                     visitas=('loja', 'nunique'))
                .reset_index().join(tc, on='canal'))
    canal['classe'] = canal.movimento.map(classe_do)
    canal['pct_tempo_loja'] = canal.min_equiv / canal.tot_canal
    canal['min_em_8h'] = canal.pct_tempo_loja * JORNADA_MIN
    canal.to_csv(f'{RAIZ}/analise/saida/jornada_por_canal.csv', index=False, encoding='utf-8-sig')

    print(f'visitas analisadas: {len(vis)}')
    print(f'tempo de loja (mediana): {vis.tempo_loja_min.median():.0f} min')
    print(f'soma dos percentuais: {geral.pct_tempo_loja.sum():.3f}  (deve ser 1,000)')
    print('salvo em analise/saida/')
    return geral, canal, vis


if __name__ == '__main__':
    import sys
    main(sys.argv[1])
