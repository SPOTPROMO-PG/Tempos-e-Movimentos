# -*- coding: utf-8 -*-
"""
Monta o Excel entregue ao cliente a partir das saídas de jornada.py.

A aba "Movimentos" é a base: guarda os minutos equivalentes de cada
movimento em cada canal. Todas as outras abas de número saem dela por
SUMIFS, então o cliente consegue auditar de onde veio cada célula e o
arquivo recalcula sozinho se alguma linha for ajustada.
"""

import json

import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

mov = pd.read_csv('analise/saida/jornada_por_canal.csv')
ger = pd.read_csv('analise/saida/jornada_geral.csv')
vis = pd.read_csv('analise/saida/resumo_visitas.csv')
cob = pd.read_csv('analise/saida/cobertura.csv')
meta = json.load(open('analise/saida/meta.json', encoding='utf-8'))
meta['periodo'] = ['{2}/{1}/{0}'.format(*d.split('-')) for d in meta['periodo']]   # ISO -> dd/mm/aaaa
desl = json.load(open('analise/saida/desloc.json', encoding='utf-8'))
extra = json.load(open('analise/saida/extra.json', encoding='utf-8'))

TINTA = '1C5570'
F = 'Arial'
h1 = Font(name=F, size=16, bold=True, color=TINTA)
h2 = Font(name=F, size=11, bold=True, color=TINTA)
hd = Font(name=F, size=9, bold=True, color='FFFFFF')
nm = Font(name=F, size=10)
bd = Font(name=F, size=10, bold=True)
it = Font(name=F, size=9, italic=True, color='6D7887')
fill = PatternFill('solid', fgColor=TINTA)
zebra = PatternFill('solid', fgColor='F2F5F8')
thin = Border(bottom=Side('thin', color='D8DEE6'))

BLOCOS = ['Entrada', 'Abertura', 'Estoque', 'Check Out', 'Ponto Natural',
          'Ponto Extra', 'Outras Atividades', 'Saída']
CLASSES = ['Execução (agrega valor)', 'Apoio e análise',
           'Deslocamento e busca', 'Espera e burocracia']


def cabecalho(ws, row, cols, larguras):
    for i, (c, w) in enumerate(zip(cols, larguras), 1):
        cel = ws.cell(row=row, column=i, value=c)
        cel.font = hd
        cel.fill = fill
        cel.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[row].height = 30
    ws.freeze_panes = ws.cell(row=row + 1, column=1)


def zebrar(ws, R, ncols, i):
    if i % 2:
        for c in range(1, ncols + 1):
            ws.cell(row=R, column=c).fill = zebra


wb = Workbook()
wb.remove(wb.active)
nvis = vis.groupby('canal').loja.size().to_dict()
ordc = vis.groupby('canal').size().sort_values(ascending=False).index.tolist()

# ---------------------------------------------------------------- Leia-me
ws = wb.create_sheet('Leia-me')
ws.column_dimensions['A'].width = 112
LINHAS = [
    ('Estudo de Tempos e Movimentos em Loja', 't'),
    ('Operação de merchandising — diagnóstico por canal', 's'),
    ('Coleta de {} a {}'.format(*meta['periodo']), 's'),
    ('', ''),
    ('O QUE ESTE ARQUIVO CONTÉM', 'h'),
    ('Resumo — os indicadores principais do estudo em uma tela.', 'p'),
    ('Cobertura — os setores e as lojas atendidas por cada um.', 'p'),
    ('Tempo por canal — quanto cada bloco de atividade consome, em minutos por loja.', 'p'),
    ('Classificação do tempo — o tempo separado entre execução, apoio, deslocamento e espera.', 'p'),
    ('Movimentos — o detalhe completo, movimento a movimento. É a base das demais abas.', 'p'),
    ('Variabilidade — do mais rápido ao mais lento, dentro de cada canal.', 'p'),
    ('Lojas — uma linha por loja medida.', 'p'),
    ('Deslocamento — o trajeto até a loja.', 'p'),
    ('', ''),
    ('COMO O TEMPO FOI MEDIDO', 'h'),
    ('Cada movimento foi cronometrado em campo, com horário de início e de término, dentro de nove', 'p'),
    ('blocos de atividade, na rotina real de trabalho.', 'p'),
    ('', ''),
    ('Como as atividades se sobrepõem — o promotor atende duas ou três categorias na mesma ida à', 'p'),
    ('gôndola — o tempo é alocado minuto a minuto: em cada minuto, o tempo é dividido entre as', 'p'),
    ('atividades ativas nele. Dois movimentos em paralelo levam metade do crédito cada. A soma de', 'p'),
    ('todos os movimentos equivale exatamente ao tempo dentro da loja, e os percentuais fecham', 'p'),
    ('em 100%.', 'p'),
    ('', ''),
    ('COMO NAVEGAR', 'h'),
    ('A aba Movimentos é a base do arquivo. As abas de análise saem dela por fórmula (SUMIFS),', 'p'),
    ('então cada número pode ser rastreado até a linha que o originou, e o arquivo recalcula', 'p'),
    ('sozinho se a base for atualizada.', 'p'),
]
r = 1
for txt, k in LINHAS:
    cel = ws.cell(row=r, column=1, value=txt)
    if k == 't':
        cel.font = h1
        ws.row_dimensions[r].height = 22
    elif k == 's':
        cel.font = it
    elif k == 'h':
        cel.font = h2
        ws.row_dimensions[r].height = 20
    else:
        cel.font = nm
    r += 1

# ------------------------------------------------------------- Movimentos
# Escrita primeiro porque as outras abas apontam para ela.
mv = mov.sort_values(['canal', 'bloco', 'min_equiv'],
                     ascending=[True, True, False]).reset_index(drop=True)
ws = wb.create_sheet('Movimentos')
ws.cell(row=1, column=1, value='Detalhe completo — todos os movimentos medidos, por canal').font = h1
ws.cell(row=2, column=1, value='Min equivalente = minutos alocados ao movimento, já descontada a '
        'sobreposição entre atividades simultâneas.').font = it
cabecalho(ws, 4,
          ['Canal', 'Bloco', 'Movimento', 'Classificação', 'Min equivalente (total)',
           'Lojas do canal', 'Min por loja', '% do tempo de loja'],
          [12, 18, 48, 22, 15, 12, 12, 14])
NM = 4 + len(mv)
for i, x in mv.iterrows():
    R = 5 + i
    for j, val in enumerate([x.canal, x.bloco, x.movimento, x.classe], 1):
        ws.cell(row=R, column=j, value=val).font = nm
    ws.cell(row=R, column=5, value=round(float(x.min_equiv), 1)).font = nm
    ws.cell(row=R, column=6, value=int(nvis[x.canal])).font = nm
    ws.cell(row=R, column=7, value='=E{0}/F{0}'.format(R)).font = nm
    ws.cell(row=R, column=8,
            value='=E{0}/SUMIFS($E$5:$E${1},$A$5:$A${1},$A{0})'.format(R, NM)).font = nm
    for c in (5, 7):
        ws.cell(row=R, column=c).number_format = '0.0'
    ws.cell(row=R, column=8).number_format = '0.0%'
    zebrar(ws, R, 8, i)

# ----------------------------------------------------------------- Resumo
ws = wb.create_sheet('Resumo', 1)
for col, w in zip('ABC', (46, 16, 56)):
    ws.column_dimensions[col].width = w
ws.cell(row=1, column=1, value='Resumo executivo').font = h1
ws.cell(row=2, column=1,
        value='Coleta em campo de {} a {}'.format(*meta['periodo'])).font = it

maior = mov.groupby('movimento').min_equiv.sum().idxmax()
K = [('O TEMPO DENTRO DA LOJA', 'h', ''),
     ('Tempo mediano por loja', '{:.0f} min'.format(vis.tempo_loja_min.median()),
      'Mediana entre todos os canais'),
     ('Loja mais rápida', '{:.0f} min'.format(vis.tempo_loja_min.min()), 'Canal DPP'),
     ('Loja mais demorada', '{:.0f} min'.format(vis.tempo_loja_min.max()), 'Canal GMR'),
     ('Canais medidos', vis.canal.nunique(), 'DPP, C&C, NMR, GMR, HFS, CLUB, LASA e Perfumaria'),
     ('', '', ''),
     ('COMO O TEMPO É GASTO', 'h', '')]
for k, v in extra['classes'].items():
    K.append((k, '{:.1f}%'.format(v['pct']),
              'Equivale a {}h{:02d} de uma jornada de 8 horas'.format(v['min_8h'] // 60, v['min_8h'] % 60)))
K += [('', '', ''),
      ('O MOVIMENTO QUE MAIS PESA', 'h', ''),
      (maior, '{:.0f} min'.format(
          ger[ger.movimento == maior].min_em_8h.sum()), 'Em uma jornada de 8 horas'),
      ('', '', ''),
      ('O TRAJETO ATÉ A LOJA', 'h', '')]
for origem, rot in (('Casa / base', 'De casa até a primeira loja'), ('Loja anterior', 'Entre duas lojas')):
    d = desl['por_origem'].get(origem)
    if d:
        K.append((rot, '{} min'.format(d['mediana']), 'Mediana'))
r = 4
for a, b, c in K:
    if b == 'h':
        ws.cell(row=r, column=1, value=a).font = h2
        ws.row_dimensions[r].height = 20
    elif a:
        ws.cell(row=r, column=1, value=a).font = nm
        cel = ws.cell(row=r, column=2, value=b)
        cel.font = bd
        cel.alignment = Alignment(horizontal='right')
        ws.cell(row=r, column=3, value=c).font = it
        for cc in range(1, 4):
            ws.cell(row=r, column=cc).border = thin
    r += 1

# -------------------------------------------------------------- Cobertura
ws = wb.create_sheet('Cobertura', 2)
ws.cell(row=1, column=1, value='Cobertura do estudo').font = h1
ws.cell(row=2, column=1, value='Os setores cobertos pelo estudo e as lojas atendidas por cada um.').font = it
cabecalho(ws, 4, ['Setor', 'Promotor', 'Executivo', 'Canais', 'Lojas atendidas'],
          [10, 36, 14, 14, 16])
cs = cob.sort_values(['Executivo', 'Setor']).reset_index(drop=True)
for i, x in cs.iterrows():
    R = 5 + i
    vals = [x.Setor, x.Promotor if pd.notna(x.Promotor) else '—', x.Executivo, x.Canais,
            int(x['Lojas assignadas'])]
    for j, val in enumerate(vals, 1):
        ws.cell(row=R, column=j, value=val).font = nm
    zebrar(ws, R, 5, i)

# -------------------------------------------------------- Tempo por canal
ws = wb.create_sheet('Tempo por canal', 3)
ws.cell(row=1, column=1, value='Tempo por bloco de atividade, por canal').font = h1
ws.cell(row=2, column=1, value='Minutos médios por loja. Sai por fórmula da aba Movimentos.').font = it
cabecalho(ws, 4, ['Canal', 'Min por loja'] + BLOCOS + ['Projeção lojas/8h', 'Rota declarada'],
          [12, 13] + [13] * 8 + [15, 15])
vd = vis.copy()
vd.loc[vd.lojas_no_dia > 12, 'lojas_no_dia'] = pd.NA
for i, ch in enumerate(ordc):
    R = 5 + i
    ws.cell(row=R, column=1, value=ch).font = bd
    ws.cell(row=R, column=2, value='=SUM(C{0}:J{0})'.format(R)).font = bd
    for j in range(len(BLOCOS)):
        col = get_column_letter(3 + j)
        ws.cell(row=R, column=3 + j, value=(
            '=SUMIFS(Movimentos!$E$5:$E${1},Movimentos!$A$5:$A${1},$A{0},'
            'Movimentos!$B$5:$B${1},{2}$4)/{3}').format(R, NM, col, int(nvis[ch]))).font = nm
    ws.cell(row=R, column=11, value='=480/$B{0}'.format(R)).font = nm
    ld = vd[vd.canal == ch].lojas_no_dia.median()
    ws.cell(row=R, column=12, value=None if pd.isna(ld) else float(ld)).font = nm
    for c in range(2, 13):
        ws.cell(row=R, column=c).number_format = '0.0'
    zebrar(ws, R, 12, i)

# ------------------------------------------------- Classificação do tempo
ws = wb.create_sheet('Classificação do tempo', 4)
ws.cell(row=1, column=1, value='Classificação do tempo em loja').font = h1
ws.cell(row=2, column=1, value='Execução = trabalho na gôndola (abastecer, precificar, limpar, montar). '
        'Deslocamento e busca = andar e procurar. Espera = portaria, cadastro, EPI.').font = it
cabecalho(ws, 4, ['Canal', 'Min por loja'] + CLASSES + ['% Execução'],
          [12, 13, 20, 18, 20, 18, 12])
for i, ch in enumerate(ordc):
    R = 5 + i
    ws.cell(row=R, column=1, value=ch).font = bd
    ws.cell(row=R, column=2, value='=SUM(C{0}:F{0})'.format(R)).font = bd
    for j in range(len(CLASSES)):
        col = get_column_letter(3 + j)
        ws.cell(row=R, column=3 + j, value=(
            '=SUMIFS(Movimentos!$E$5:$E${1},Movimentos!$A$5:$A${1},$A{0},'
            'Movimentos!$D$5:$D${1},{2}$4)/{3}').format(R, NM, col, int(nvis[ch]))).font = nm
    ws.cell(row=R, column=7, value='=C{0}/$B{0}'.format(R)).font = bd
    for c in range(2, 7):
        ws.cell(row=R, column=c).number_format = '0.0'
    ws.cell(row=R, column=7).number_format = '0.0%'
    zebrar(ws, R, 7, i)

# --------------------------------------------------------- Variabilidade
ws = wb.create_sheet('Variabilidade', 6)
ws.cell(row=1, column=1, value='Variabilidade do tempo de visita').font = h1
ws.cell(row=2, column=1, value='CV = desvio padrão ÷ média. Quanto maior, menos padronizada está a '
        'operação naquele canal — e maior o ganho possível com padronização.').font = it
cabecalho(ws, 4, ['Canal', 'Mais rápida (min)', 'Mediana (min)', 'Média (min)',
                  'Mais lenta (min)', 'Desvio padrão', 'Variação', 'Amplitude'],
          [12, 16, 13, 13, 16, 14, 11, 12])
d = vis.groupby('canal').tempo_loja_min.agg(['size', 'min', 'median', 'mean', 'max', 'std'])
for i, ch in enumerate(ordc):
    R = 5 + i
    x = d.loc[ch]
    ws.cell(row=R, column=1, value=ch).font = bd
    for j, val in enumerate([float(x['min']), float(x['median']), float(x['mean']),
                             float(x['max']),
                             float(x['std']) if pd.notna(x['std']) else None], 2):
        ws.cell(row=R, column=j, value=val).font = nm
    ws.cell(row=R, column=7, value='=F{0}/D{0}'.format(R)).font = nm
    ws.cell(row=R, column=7).number_format = '0%'
    ws.cell(row=R, column=8, value='=E{0}/B{0}'.format(R)).font = nm
    ws.cell(row=R, column=8).number_format = '0.0"x"'
    for c in range(2, 7):
        ws.cell(row=R, column=c).number_format = '0'
    zebrar(ws, R, 8, i)

# --------------------------------------------------------------- Visitas
ws = wb.create_sheet('Lojas', 7)
ws.cell(row=1, column=1, value='Base de lojas medidas').font = h1
ws.cell(row=2, column=1, value='Uma linha por loja medida. "Movimentos registrados" = quantas '
        'atividades tiveram horário cronometrado naquela loja.').font = it
cabecalho(ws, 4, ['Promotor', 'Canal', 'Rede', 'Loja', 'Tempo na loja (min)', 'Tempo na loja (h)',
                  'Lojas no dia (declarado)', 'Movimentos registrados'],
          [32, 10, 26, 40, 15, 14, 17, 17])
vv = vis.sort_values(['canal', 'tempo_loja_min'], ascending=[True, False]).reset_index(drop=True)
for i, x in vv.iterrows():
    R = 5 + i
    for j, val in enumerate([x.promotor, x.canal, x.rede, x.loja, float(x.tempo_loja_min)], 1):
        ws.cell(row=R, column=j, value=val).font = nm
    ws.cell(row=R, column=5).number_format = '0'
    ws.cell(row=R, column=6, value='=E{0}/60'.format(R)).font = nm
    ws.cell(row=R, column=6).number_format = '0.00'
    ws.cell(row=R, column=7, value=None if pd.isna(x.lojas_no_dia) else float(x.lojas_no_dia)).font = nm
    ws.cell(row=R, column=8, value=int(x.movimentos)).font = nm
    zebrar(ws, R, 8, i)

# ---------------------------------------------------------- Deslocamento
ws = wb.create_sheet('Deslocamento', 8)
ws.cell(row=1, column=1, value='Deslocamento até a loja').font = h1
ws.cell(row=2, column=1, value='Quanto custa o caminho até a loja, e quanto custa alongar uma rota.').font = it
cabecalho(ws, 4, ['Origem do trajeto', 'Mediana (min)'], [32, 16])
r = 5
for k, v in desl['por_origem'].items():
    ws.cell(row=r, column=1, value=k).font = nm
    ws.cell(row=r, column=2, value=v['mediana']).font = bd
    r += 1
for txt in ('O trajeto de casa até a primeira loja é um custo fixo do dia, pago uma vez.',
            'O trajeto entre duas lojas se multiplica a cada loja a mais na rota — e é bem mais curto.',
            'Cada loja adicional cobra dois tempos: o da visita e o do trajeto até ela.'):
    r += 1
    ws.cell(row=r, column=1, value=txt).font = it

for s in wb.worksheets:
    s.sheet_view.showGridLines = False

SAIDA = 'analise/entregaveis/Tempos e Movimentos - Base de Dados.xlsx'
wb.save(SAIDA)
print('salvo:', SAIDA)
print('abas:', ', '.join(s.title for s in wb.worksheets))
