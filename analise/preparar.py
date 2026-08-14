# -*- coding: utf-8 -*-
"""
Converte a planilha de respostas (formato largo, 1 linha por visita) em um
formato longo: 1 linha por EVENTO cronometrado. É essa tabela que serve
para qualquer análise de tempos e movimentos.

A leitura dos nomes de coluna é feita a partir do próprio schema.js, e não
por adivinhação de separadores — assim atividades cujo nome contém " - "
não são quebradas no lugar errado.

Saída: analise/eventos.csv
"""

import io
import json
import re
import sys

import pandas as pd

RAIZ = '.'


def carregar_schema():
    """
    Lê analise/schema.json, que é gerado executando o JS real do app
    (ver analise/extrair_schema.js).

    Tentar interpretar o schema.js com expressão regular não funciona: nomes
    de atividade com aspas simples dentro ("Conferir KBD's") ficam de fora,
    e as observações (Qtd. divergente, Tipo) são confundidas com passos.
    """
    with io.open(f'{RAIZ}/analise/schema.json', encoding='utf-8') as f:
        d = json.load(f)
    blocos = [{
        'chave': b['chave'], 'titulo': b['titulo'],
        'por_categoria': b['por_categoria'],
        'categorias': b['categorias'] or d['categorias'],
        'itens': [i['label'] for i in b['itens']],
        'obs': {i['label']: i['obs'] for i in b['itens']},
    } for b in d['blocos']]
    return blocos, d['categorias']


def para_minutos(v):
    """'08:35' -> 515. Aceita datetime/time vindos do Excel."""
    if pd.isna(v):
        return None
    if hasattr(v, 'hour'):
        return v.hour * 60 + v.minute
    s = str(v).strip()
    m = re.match(r'^(\d{1,2}):(\d{2})', s)
    if not m:
        return None
    h, mi = int(m.group(1)), int(m.group(2))
    if h > 23 or mi > 59:
        return None
    return h * 60 + mi


def duracao(ini, fim):
    """
    Minutos entre início e término.

    Término antes do início é tratado como INVÁLIDO (None), não como virada
    de meia-noite. Uma atividade dentro da loja não cruza a madrugada: nos
    dados reais, 100% desses casos eram inversão de digitação (ex.: 16:38 ->
    14:42). Somar 24h transformava esses erros em durações de 22h que
    contaminariam qualquer média.
    """
    a, b = para_minutos(ini), para_minutos(fim)
    if a is None or b is None:
        return None
    d = b - a
    if d < 0:
        return None
    return d


def main(caminho_xlsx):
    df = pd.read_excel(caminho_xlsx, sheet_name='Respostas')
    blocos, categorias = carregar_schema()

    # Deduplicação: até 13/08 o app gravava uma linha por toque no botão de
    # enviar (faltava trava). A mesma visita aparece várias vezes, com os
    # mesmos horários e segundos de diferença. Mantemos o primeiro envio.
    cols_h = [c for c in df.columns
              if str(c).endswith(('- Início', '- Término'))]
    chave = (df['Promotor'].astype(str) + '|' + df['Loja'].astype(str) + '|'
             + df[cols_h].astype(str).agg(lambda r: '|'.join(map(str, r)), axis=1))
    if 'ID Visita' in df.columns:
        # envios da versão corrigida trazem ID próprio; ele tem prioridade
        chave = df['ID Visita'].fillna(chave)
    antes = len(df)
    df = df.loc[~chave.duplicated(keep='first')].reset_index(drop=True)
    if antes != len(df):
        print(f'duplicatas removidas: {antes - len(df)} (de {antes} linhas)')

    ident = ['Promotor', 'Setor', 'Executivo', 'Loja', 'Rede', 'Canal',
             'Cidade', 'Estado', 'servidor_timestamp']
    ident = [c for c in ident if c in df.columns]

    linhas = []
    for idx, r in df.iterrows():
        base = {c: r.get(c) for c in ident}
        base['visita_id'] = idx + 2          # nº da linha na planilha

        for b in blocos:
            if b['por_categoria']:
                for cat in b['categorias']:   # só as categorias daquele bloco
                    st = r.get(f"{b['titulo']} - {cat} - Status")
                    for passo in b['itens']:
                        pre = f"{b['titulo']} - {cat} - {passo}"
                        d = duracao(r.get(f'{pre} - Início'), r.get(f'{pre} - Término'))
                        if d is None and (pd.isna(st) or st == 'na'):
                            continue
                        linhas.append({**base, 'bloco': b['titulo'], 'categoria': cat,
                                       'atividade': passo, 'status': st,
                                       'inicio': r.get(f'{pre} - Início'),
                                       'fim': r.get(f'{pre} - Término'),
                                       'duracao_min': d})
            else:
                for ativ in b['itens']:
                    pre = f"{b['titulo']} - {ativ}"
                    d = duracao(r.get(f'{pre} - Início'), r.get(f'{pre} - Término'))
                    if d is None and pd.isna(r.get(f'{pre} - Início')):
                        continue
                    linhas.append({**base, 'bloco': b['titulo'], 'categoria': None,
                                   'atividade': ativ, 'status': None,
                                   'inicio': r.get(f'{pre} - Início'),
                                   'fim': r.get(f'{pre} - Término'),
                                   'duracao_min': d})

    ev = pd.DataFrame(linhas)
    ev.to_csv(f'{RAIZ}/analise/eventos.csv', index=False, encoding='utf-8-sig')
    print(f'visitas: {len(df)} | eventos cronometrados: {len(ev)}')
    print(f'salvo em analise/eventos.csv')
    return ev


if __name__ == '__main__':
    main(sys.argv[1])
