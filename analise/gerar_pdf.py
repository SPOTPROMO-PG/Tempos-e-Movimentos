# -*- coding: utf-8 -*-
"""
Monta o relatório em PDF entregue ao cliente.

Mesma fonte de dados do Excel e do PowerPoint (as saídas de jornada.py),
para os três entregáveis nunca divergirem entre si. Os gráficos são
gerados com matplotlib e embutidos como imagem.
"""

import json
import os

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, KeepTogether,
                                NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

TMP = 'analise/saida/_fig'
os.makedirs(TMP, exist_ok=True)
os.makedirs('analise/entregaveis', exist_ok=True)

mov = pd.read_csv('analise/saida/jornada_por_canal.csv')
ger = pd.read_csv('analise/saida/jornada_geral.csv')
vis = pd.read_csv('analise/saida/resumo_visitas.csv')
cob = pd.read_csv('analise/saida/cobertura.csv')
meta = json.load(open('analise/saida/meta.json', encoding='utf-8'))
meta['periodo'] = ['{2}/{1}/{0}'.format(*d.split('-')) for d in meta['periodo']]   # ISO -> dd/mm/aaaa
desl = json.load(open('analise/saida/desloc.json', encoding='utf-8'))
extra = json.load(open('analise/saida/extra.json', encoding='utf-8'))
canais = json.load(open('analise/saida/dossie_min.json', encoding='utf-8'))

FORTES = [c for c in canais if c['n'] >= 8]
FRACOS = [c for c in canais if c['n'] < 8]
NOMES_FRACOS = ', '.join(c['canal'] for c in FRACOS)

PETROL, TEAL, CLARO = '#123A4D', '#2C7391', '#E3EEF1'
TERRA, VERDE, CINZA = '#B85042', '#2F6B4F', '#6D7887'
SERIE = ['#123A4D', '#2C7391', '#7DB0C1', '#B85042', '#A9CBD6', '#4A92AA', '#CBE0E6', '#97A9B4']

cP, cT, cC = colors.HexColor(PETROL), colors.HexColor(TEAL), colors.HexColor(CINZA)
LARG = A4[0] - 4 * cm

ss = getSampleStyleSheet()


def st(nome, **kw):
    base = dict(fontName='Helvetica', fontSize=10, leading=14.5,
                textColor=colors.HexColor('#14181D'))
    base.update(kw)
    return ParagraphStyle(nome, **base)


H1 = st('H1', fontName='Helvetica-Bold', fontSize=19, leading=23, textColor=cP, spaceAfter=4)
H2 = st('H2', fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=cP,
        spaceBefore=16, spaceAfter=5)
SUB = st('SUB', fontSize=9.5, leading=13, textColor=cC, spaceAfter=11)
P = st('P', alignment=TA_JUSTIFY, spaceAfter=7)
PQ = st('PQ', fontSize=8.5, leading=12, textColor=cC, spaceAfter=4)
CAP = st('CAP', fontSize=8, leading=11, textColor=cC, spaceBefore=3, spaceAfter=10)
TH = st('TH', fontName='Helvetica-Bold', fontSize=8, leading=10.5, textColor=colors.white)
TD = st('TD', fontSize=8.5, leading=11)
TDb = st('TDb', fontName='Helvetica-Bold', fontSize=8.5, leading=11)


def fig(nome, w, h):
    f, ax = plt.subplots(figsize=(w, h), dpi=200)
    for s in ('top', 'right'):
        ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'):
        ax.spines[s].set_color('#C6CDD8')
    ax.tick_params(colors=CINZA, labelsize=8, length=0)
    return f, ax, os.path.join(TMP, nome + '.png')


def salvar(f, cam, w_cm):
    f.tight_layout(pad=0.4)
    f.savefig(cam, transparent=True, bbox_inches='tight')
    plt.close(f)
    from PIL import Image as PILImage
    iw, ih = PILImage.open(cam).size
    return Image(cam, width=w_cm * cm, height=w_cm * cm * ih / iw)


def hm(m):
    return '{}h{:02d}'.format(int(m) // 60, int(m) % 60)


# ------------------------------------------------------------- gráficos
# 1 · classificação do tempo
cls = list(extra['classes'].keys())
f, ax, cam = fig('classes', 7.2, 3.0)
vals = [extra['classes'][c]['pct'] for c in cls]
rot = [c.replace(' (agrega valor)', '') for c in cls]
b = ax.barh(rot[::-1], vals[::-1], color=[VERDE, TEAL, TERRA, '#C89A3C'][::-1], height=.62)
ax.bar_label(b, fmt='%.1f%%', padding=4, fontsize=9, color='#14181D', fontweight='bold')
ax.set_xlim(0, max(vals) * 1.22)
ax.get_xaxis().set_visible(False)
G_CLASSES = salvar(f, cam, 15.5)

# 2 · execução por canal
ordf = sorted(FORTES, key=lambda c: -(c['blocos']['Ponto Natural'] + c['blocos']['Ponto Extra']
                                      + c['blocos']['Check Out']) / c['visita_min'])
f, ax, cam = fig('exec', 7.2, 2.7)
pv = [(c['blocos']['Ponto Natural'] + c['blocos']['Ponto Extra'] + c['blocos']['Check Out'])
      / c['visita_min'] * 100 for c in ordf]
b = ax.bar([c['canal'] for c in ordf], pv, color=SERIE[:len(ordf)], width=.62)
ax.bar_label(b, fmt='%.0f%%', padding=3, fontsize=9, color='#14181D', fontweight='bold')
ax.set_ylim(0, max(pv) * 1.2)
ax.get_yaxis().set_visible(False)
G_EXEC = salvar(f, cam, 15.5)

# 3 · composição por canal (empilhado)
BL = ['Entrada', 'Abertura', 'Estoque', 'Check Out', 'Ponto Natural', 'Ponto Extra',
      'Outras Atividades', 'Saída']
ordv = sorted(FORTES, key=lambda c: -c['visita_min'])
f, ax, cam = fig('comp', 7.2, 3.2)
base = [0] * len(ordv)
for i, blo in enumerate(BL):
    v = [c['blocos'][blo] for c in ordv]
    ax.bar([c['canal'] for c in ordv], v, bottom=base, color=SERIE[i], width=.6, label=blo)
    base = [a + b_ for a, b_ in zip(base, v)]
ax.set_ylabel('minutos por visita', fontsize=8, color=CINZA)
ax.legend(fontsize=6.5, ncol=4, frameon=False, loc='upper center',
          bbox_to_anchor=(.5, -.08), labelcolor=CINZA)
G_COMP = salvar(f, cam, 15.5)

# 4 · top movimentos
top = ger.nlargest(10, 'pct_tempo_loja').iloc[::-1]
f, ax, cam = fig('top', 7.2, 3.6)
lab = [(m[:46] + '…') if len(m) > 47 else m for m in top.movimento]
b = ax.barh(lab, top.min_em_8h, color=PETROL, height=.66)
ax.bar_label(b, fmt='%.0f min', padding=4, fontsize=8, color='#14181D', fontweight='bold')
ax.set_xlim(0, top.min_em_8h.max() * 1.2)
ax.get_xaxis().set_visible(False)
ax.tick_params(axis='y', labelsize=7.5)
G_TOP = salvar(f, cam, 15.5)

# 5 · variabilidade
v2 = vis.groupby('canal').tempo_loja_min.agg(['size', 'min', 'median', 'max', 'mean', 'std'])
v2 = v2[v2['size'] >= 8].sort_values('median', ascending=False)
f, ax, cam = fig('var', 7.2, 2.8)
x = range(len(v2))
ax.bar([i - .26 for i in x], v2['min'], width=.26, color='#A9CBD6', label='Mais rápida')
ax.bar(list(x), v2['median'], width=.26, color=TEAL, label='Mediana')
ax.bar([i + .26 for i in x], v2['max'], width=.26, color=PETROL, label='Mais lenta')
ax.set_xticks(list(x))
ax.set_xticklabels(v2.index)
ax.set_ylabel('minutos', fontsize=8, color=CINZA)
ax.legend(fontsize=7.5, frameon=False, labelcolor=CINZA, ncol=3,
          loc='upper center', bbox_to_anchor=(.5, 1.16))
G_VAR = salvar(f, cam, 15.5)

# 6 · projeção x declarado
ordp = sorted(FORTES, key=lambda c: -c['cabe_em_8h'])
f, ax, cam = fig('proj', 7.2, 2.6)
x = range(len(ordp))
b1 = ax.bar([i - .19 for i in x], [c['cabe_em_8h'] for c in ordp], width=.38,
            color=PETROL, label='Projeção pelo tempo medido')
b2 = ax.bar([i + .19 for i in x], [c['lojas_dia'] or 0 for c in ordp], width=.38,
            color='#7DB0C1', label='Rota declarada pelo campo')
for bb in (b1, b2):
    ax.bar_label(bb, fmt='%.1f', padding=2, fontsize=8, color='#14181D')
ax.set_xticks(list(x))
ax.set_xticklabels([c['canal'] for c in ordp])
ax.get_yaxis().set_visible(False)
ax.legend(fontsize=7.5, frameon=False, labelcolor=CINZA, ncol=2,
          loc='upper center', bbox_to_anchor=(.5, 1.18))
G_PROJ = salvar(f, cam, 15.5)


# ------------------------------------------------------------ documento
def tabela(dados, larguras, alinha_dir=()):
    linhas = [[Paragraph(str(c), TH) for c in dados[0]]]
    for r in dados[1:]:
        linhas.append([Paragraph(str(c), TDb if j == 0 else TD) for j, c in enumerate(r)])
    t = Table(linhas, colWidths=[w * cm for w in larguras], repeatRows=1)
    e = [('BACKGROUND', (0, 0), (-1, 0), cP),
         ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
         ('TOPPADDING', (0, 0), (-1, -1), 5),
         ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
         ('LEFTPADDING', (0, 0), (-1, -1), 6),
         ('RIGHTPADDING', (0, 0), (-1, -1), 6),
         ('LINEBELOW', (0, 1), (-1, -2), .4, colors.HexColor('#DCE1E8')),
         ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F6F8FA')])]
    for c in alinha_dir:
        e.append(('ALIGN', (c, 0), (c, -1), 'RIGHT'))
    t.setStyle(TableStyle(e))
    return t


def destaque(titulo, texto, cor=TERRA, fundo='#FBF0EC'):
    t = Table([[Paragraph('<b>{}</b>'.format(titulo), st('x', fontName='Helvetica-Bold',
                                                        fontSize=10.5, textColor=colors.HexColor(cor))),],
               [Paragraph(texto, st('y', fontSize=9.5, leading=13.5, alignment=TA_JUSTIFY))]],
              colWidths=[LARG])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(fundo)),
                           ('TOPPADDING', (0, 0), (-1, 0), 9),
                           ('BOTTOMPADDING', (0, -1), (-1, -1), 9),
                           ('LEFTPADDING', (0, 0), (-1, -1), 11),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 11),
                           ('BOTTOMPADDING', (0, 0), (-1, 0), 3)]))
    return t


def capa(c, d):
    c.saveState()
    c.setFillColor(cP)
    c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    c.setFillColor(colors.HexColor('#7DB0C1'))
    c.setFont('Helvetica-Bold', 11)
    c.drawString(2 * cm, A4[1] - 6.4 * cm, 'ESTUDO DE TEMPOS E MOVIMENTOS')
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 30)
    c.drawString(2 * cm, A4[1] - 8.3 * cm, 'Como o promotor usa')
    c.drawString(2 * cm, A4[1] - 9.6 * cm, 'a jornada de 8 horas')
    c.setFillColor(colors.HexColor('#A9CBD6'))
    c.setFont('Helvetica', 12)
    c.drawString(2 * cm, A4[1] - 11.2 * cm, 'Diagnóstico por canal — operação de merchandising')
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#7DB0C1'))
    c.drawString(2 * cm, 3.6 * cm, '{} visitas medidas · {} promotores · {} de {} setores'.format(
        len(vis), vis.promotor.nunique(), meta['setores'], meta['setores_total']))
    c.drawString(2 * cm, 3.0 * cm, 'Coleta de {} a {}'.format(*meta['periodo']))
    c.restoreState()


def miolo(c, d):
    c.saveState()
    c.setFont('Helvetica', 7.5)
    c.setFillColor(cC)
    c.drawString(2 * cm, 1.35 * cm, 'Estudo de Tempos e Movimentos · {} visitas · {} a {}'.format(
        len(vis), *meta['periodo']))
    c.setFont('Helvetica-Bold', 8)
    c.drawRightString(A4[0] - 2 * cm, 1.35 * cm, str(c.getPageNumber() - 1))
    c.setStrokeColor(colors.HexColor('#DCE1E8'))
    c.setLineWidth(.4)
    c.line(2 * cm, 1.75 * cm, A4[0] - 2 * cm, 1.75 * cm)
    c.restoreState()


SAIDA = 'analise/entregaveis/Tempos e Movimentos - Relatorio.pdf'
doc = BaseDocTemplate(SAIDA, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm,
                      topMargin=2 * cm, bottomMargin=2.2 * cm,
                      title='Estudo de Tempos e Movimentos — Diagnóstico por canal',
                      author='SPOT', subject='Tempos e movimentos em loja')
quadro = Frame(2 * cm, 2.2 * cm, LARG, A4[1] - 4.2 * cm, id='n')
doc.addPageTemplates([PageTemplate(id='capa', frames=[quadro], onPage=capa),
                      PageTemplate(id='miolo', frames=[quadro], onPage=miolo)])

E = [NextPageTemplate('miolo'), PageBreak()]

# ---------------------------------------------------- sumário executivo
E += [Paragraph('Sumário executivo', H1),
      Paragraph('O que o estudo mediu, e o que os números dizem.', SUB)]
kp = [['Visitas medidas', 'Promotores', 'Setores', 'Canais', 'Visita mediana'],
      [str(len(vis)), str(vis.promotor.nunique()),
       '{}/{}'.format(meta['setores'], meta['setores_total']),
       str(vis.canal.nunique()), '{:.0f} min'.format(vis.tempo_loja_min.median())]]
t = Table([[Paragraph(x, st('k1', fontSize=8, textColor=cC, alignment=TA_CENTER)) for x in kp[0]],
           [Paragraph(x, st('k2', fontName='Helvetica-Bold', fontSize=17, textColor=cP,
                            alignment=TA_CENTER)) for x in kp[1]]],
          colWidths=[LARG / 5] * 5)
t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(CLARO)),
                       ('TOPPADDING', (0, 0), (-1, 0), 10), ('BOTTOMPADDING', (0, 0), (-1, 0), 1),
                       ('TOPPADDING', (0, 1), (-1, 1), 0), ('BOTTOMPADDING', (0, 1), (-1, 1), 11)]))
E += [t, Spacer(1, 14)]

dcls = extra['classes']
E += [Paragraph('Os três achados', H2),
      Paragraph('<b>1. Menos da metade do tempo em loja agrega valor.</b> A execução em gôndola — abastecer, '
                'precificar, limpar e montar — ocupa {:.1f}% do tempo dentro da loja, o equivalente a {} de uma '
                'jornada de 8 horas. O restante sustenta a execução, mas não é ela.'.format(
                    dcls['Execução (agrega valor)']['pct'], hm(dcls['Execução (agrega valor)']['min_8h'])), P),
      Paragraph('<b>2. O canal define a rotina mais do que qualquer outro fator.</b> No NMR, {:.0f}% da visita é '
                'execução; no DPP, {:.0f}%. A causa não é ritmo de trabalho — é o número de lojas: quem faz 4 lojas '
                'por dia paga 4 vezes o custo fixo de chegar, se cadastrar e se localizar.'.format(
                    max(pv), min(pv)), P),
      Paragraph('<b>3. Quase duas horas por jornada são deslocamento e busca.</b> Andar dentro da loja e procurar '
                'produto no estoque somam {:.1f}% do tempo, ou {} por jornada. É a maior oportunidade isolada do '
                'estudo, e a mais acionável: depende de layout, endereçamento e ruptura.'.format(
                    dcls['Deslocamento e busca']['pct'], hm(dcls['Deslocamento e busca']['min_8h'])), P),
      Spacer(1, 6),
      destaque('Antes de usar estes números',
               'O estudo mede o tempo <b>dentro</b> da loja. O trajeto entre lojas tem apenas {} medições e não entra '
               'em nenhuma projeção de jornada — uma rota real é mais curta do que a projeção sugere. Os canais '
               '{} têm menos de 8 visitas e aparecem como indício, não como média.'.format(desl['n'], NOMES_FRACOS))]

# --------------------------------------------------------- metodologia
E += [PageBreak(), Paragraph('Como o tempo foi medido', H1),
      Paragraph('O método precisa lidar com atividades que acontecem ao mesmo tempo.', SUB),
      Paragraph('Cada promotor registrou, pelo aplicativo, o horário de início e de término de cada movimento da '
                'visita, movimento a movimento, dentro de nove blocos de atividade. A coleta foi feita em campo, '
                'na rotina real de trabalho.', P),
      Paragraph('O problema central é a simultaneidade. O promotor atende duas ou três categorias na mesma ida à '
                'gôndola e registra a mesma janela de horário para cada uma. Somar as durações declaradas infla o '
                'total em cerca de 2,4 vezes e faria os percentuais passarem de 100%.', P),
      Paragraph('A solução foi alocar o tempo minuto a minuto: percorre-se a linha do tempo da visita e, em cada '
                'minuto, o tempo é dividido igualmente entre as atividades ativas naquele minuto. Dois movimentos '
                'feitos em paralelo levam metade do crédito cada. Assim a soma de todos os movimentos equivale '
                'exatamente ao tempo real dentro da loja, e os percentuais fecham em 100%.', P),
      Paragraph('Tratamento da base', H2),
      Paragraph('Foram descartadas as atividades com término anterior ao início (inversão de digitação) e as com '
                'mais de quatro horas de duração. Envios repetidos da mesma visita foram consolidados, mantendo-se '
                'a versão mais completa de cada uma. Ao todo, {} envios foram consolidados em {} visitas '
                'analisáveis.'.format(meta['linhas_brutas'], len(vis)), P)]

# ------------------------------------------------- 1 · classificação
E += [PageBreak(), Paragraph('Para onde vai o tempo em loja', H1),
      Paragraph('Todo o tempo medido, separado por natureza da atividade.', SUB),
      G_CLASSES,
      Paragraph('Percentuais sobre o tempo dentro da loja, média ponderada de todos os canais.', CAP)]
lin = [['Natureza da atividade', '% do tempo', 'Em 8 horas', 'O que inclui']]
DESCR = {'Execução (agrega valor)': 'Abastecer, precificar, limpar a gôndola, montar ponto extra',
         'Apoio e análise': 'Leitura de loja, conferir encarte, negociar, validar estoque virtual',
         'Deslocamento e busca': 'Andar na loja, ir ao estoque, procurar e localizar produto',
         'Espera e burocracia': 'Portaria, cadastro, liberação, guardar pertences, EPIs'}
for c in cls:
    lin.append([c, '{:.1f}%'.format(dcls[c]['pct']), hm(dcls[c]['min_8h']), DESCR[c]])
E += [tabela(lin, [4.6, 2.0, 2.0, 8.4], alinha_dir=(1, 2)), Spacer(1, 10),
      Paragraph('A leitura correta não é "60% do tempo é desperdício". Apoio e análise é trabalho necessário: '
                'ler a loja, conferir encarte e negociar com o gerente sustentam a execução. O que merece ataque '
                'é a terceira linha — {} por jornada andando e procurando produto.'.format(
                    hm(dcls['Deslocamento e busca']['min_8h'])), P)]

it = ger[ger.classe == 'Deslocamento e busca'].nlargest(5, 'min_em_8h')
lin = [['Movimento', 'Bloco', 'Min em 8h']]
for _, r in it.iterrows():
    lin.append([r.movimento, r.bloco, '{:.0f}'.format(r.min_em_8h)])
E += [Paragraph('Os cinco maiores itens de deslocamento e busca', H2),
      tabela(lin, [8.6, 4.4, 4.0], alinha_dir=(2,))]

# --------------------------------------------------- 2 · canal a canal
E += [PageBreak(), Paragraph('O canal define a rotina', H1),
      Paragraph('Participação da execução em gôndola no tempo de visita, por canal.', SUB),
      G_EXEC,
      Paragraph('Canais com menos de 8 visitas ({}) ficam fora do gráfico.'.format(NOMES_FRACOS), CAP),
      Paragraph('A diferença entre o topo e a base da escala não é produtividade individual: é o desenho da '
                'rota. Quem faz uma loja por dia diluí o custo fixo de entrada em uma visita longa; quem faz '
                'quatro paga esse custo quatro vezes.', P),
      Spacer(1, 4),
      Paragraph('Composição do tempo por bloco', H2), G_COMP,
      Paragraph('Minutos médios por visita. Ponto Natural é o maior bloco em todos os canais de amostra adequada.', CAP)]

lin = [['Canal', 'Visitas', 'Visita média', 'Execução', 'Projeção 8h', 'Declarado', 'Amostra']]
for c in canais:
    lin.append([c['canal'], c['n'], '{} min'.format(c['visita_min']),
                '{:.0f}%'.format((c['blocos']['Ponto Natural'] + c['blocos']['Ponto Extra']
                                  + c['blocos']['Check Out']) / c['visita_min'] * 100),
                '{:.1f}'.format(c['cabe_em_8h']).replace('.', ','),
                '—' if c['lojas_dia'] is None else '{:.0f}'.format(c['lojas_dia']),
                'Reduzida' if c['n'] < 8 else 'Adequada'])
E += [Spacer(1, 6), tabela(lin, [2.4, 1.9, 2.6, 2.3, 2.5, 2.2, 3.1], alinha_dir=(1, 2, 3, 4, 5))]

# ------------------------------------------------------ 3 · movimentos
E += [PageBreak(), Paragraph('Os movimentos que mais consomem a jornada', H1),
      Paragraph('Os dez movimentos de maior peso, projetados em uma jornada de 8 horas.', SUB),
      G_TOP,
      Paragraph('Soma de todos os canais, ponderada pelo tempo medido.', CAP),
      Paragraph('Abastecer a gôndola é, como esperado, o maior item isolado. O segundo não é execução: é '
                'buscar no estoque o item que faltava. Os dois primeiros movimentos somam {:.0f} minutos da '
                'jornada — e apenas um deles agrega valor.'.format(
                    float(top.min_em_8h.iloc[-1]) + float(top.min_em_8h.iloc[-2])), P)]

# --------------------------------------------------- 4 · variabilidade
E += [PageBreak(), Paragraph('A mesma tarefa leva tempos muito diferentes', H1),
      Paragraph('Dispersão do tempo de visita dentro de cada canal.', SUB),
      G_VAR,
      Paragraph('Canais com amostra reduzida omitidos.', CAP)]
lin = [['Canal', 'Visitas', 'Mais rápida', 'Mediana', 'Mais lenta', 'CV', 'Amplitude']]
for ch in v2.index:
    x = v2.loc[ch]
    lin.append([ch, int(x['size']), '{:.0f} min'.format(x['min']), '{:.0f} min'.format(x['median']),
                '{:.0f} min'.format(x['max']), '{:.0f}%'.format(x['std'] / x['mean'] * 100),
                '{:.1f}x'.format(x['max'] / x['min']).replace('.', ',')])
E += [tabela(lin, [2.4, 1.9, 2.7, 2.4, 2.7, 1.9, 2.9], alinha_dir=(1, 2, 3, 4, 5, 6)), Spacer(1, 10),
      Paragraph('O CV (coeficiente de variação) mede o quanto o tempo varia em torno da média. Parte dessa '
                'variação é legítima — porte de loja, sortimento, dia da semana. Mas a amplitude entre a visita '
                'mais rápida e a mais lenta é ampla demais para ser explicada só por isso, e é justamente onde '
                'um padrão de execução por canal tem mais a ganhar.', P)]

# --------------------------------------------------------- 5 · jornada
E += [PageBreak(), Paragraph('A rota que o tempo medido comporta', H1),
      Paragraph('Quantas lojas cabem em 8 horas, contra a rota que o campo declara.', SUB),
      G_PROJ,
      Paragraph('Projeção = 480 minutos ÷ tempo médio de visita. Não é meta operacional.', CAP),
      Paragraph('As duas leituras convergem sem que o cálculo force isso: o tempo medido por visita prevê o '
                'tamanho da rota que cada canal declara de forma independente. É um bom indício de que a '
                'cronometragem foi feita com honestidade.', P),
      destaque('Mas isto não prova que a jornada fecha',
               'As duas leituras ignoram o deslocamento entre lojas. Somando o que já se mediu dele, uma rota '
               'de 4 lojas no DPP consome {} dentro das lojas e ainda precisa de 3 trajetos entre elas. A rota '
               'declarada cabe apertada, não folgada.'.format(
                   hm([c for c in canais if c['canal'] == 'DPP'][0]['visita_min'] * 4)))]

# ----------------------------------------------------- 6 · deslocamento
E += [PageBreak(), Paragraph('O trajeto entre lojas', H1),
      Paragraph('Bloco incluído no formulário em 15/08, depois do início da coleta.', SUB),
      Paragraph('O estudo nasceu medindo apenas o tempo dentro da loja. Como a jornada não fecha sem o trajeto, '
                'o bloco foi acrescentado durante a coleta — por isso a amostra é menor que a das demais '
                'medições e ainda não entra nas projeções.', P)]
lin = [['Origem do trajeto', 'Medições', 'Mediana']]
for k, v in desl['por_origem'].items():
    lin.append([k, v['n'], '{} min'.format(v['mediana'])])
E += [tabela(lin, [8.0, 4.5, 4.5], alinha_dir=(1, 2)), Spacer(1, 10),
      Paragraph('A distinção entre os dois trajetos é o dado útil. O deslocamento de casa até a primeira loja é '
                'um custo fixo do dia, pago uma vez. O trajeto entre duas lojas é o que se multiplica a cada loja '
                'a mais na rota — e é bem mais curto. Ao todo foram {} trajetos medidos por {} promotores.'.format(
                    desl['n'], desl['promotores']), P),
      Paragraph('Recomenda-se manter a coleta deste bloco até a amostra estabilizar. É a única peça que falta '
                'para a jornada fechar de ponta a ponta.', P)]

# --------------------------------------------------------- 7 · limites
E += [PageBreak(), Paragraph('O que este estudo ainda não responde', H1),
      Paragraph('Os limites são parte da entrega: sem eles, o número vira decisão errada.', SUB)]
LIM = [('O trajeto entre lojas',
        'Apenas {} medições. Nenhuma projeção de jornada aqui inclui deslocamento, então a rota real é mais '
        'curta do que a projetada.'.format(desl['n'])),
       ('Canais de amostra reduzida',
        '{} têm menos de 8 visitas. Uma visita atípica move o número inteiro; trate como indício.'.format(NOMES_FRACOS)),
       ('Pausas e imprevistos',
        'Almoço, deslocamento a pé em shopping e esperas fora do previsto não foram isolados na medição.'),
       ('Autodeclaração',
        'Cada promotor cronometrou a própria jornada, sem observador externo. O viés possível é de '
        'arredondamento de horário, não de intenção.'),
       ('Período curto',
        'A coleta cobre {} a {}. Sazonalidade, reposição de fim de semana e picos promocionais não estão '
        'representados.'.format(*meta['periodo']))]
for t_, d_ in LIM:
    E += [Paragraph(t_, st('lt', fontName='Helvetica-Bold', fontSize=10.5, textColor=cP, spaceBefore=9)),
          Paragraph(d_, st('ld', fontSize=9.5, leading=13, alignment=TA_JUSTIFY, spaceAfter=2))]
E += [Spacer(1, 8),
      Paragraph('Nenhum destes pontos invalida os achados. Todos limitam o quanto se pode extrapolar deles.', P)]

# --------------------------------------------------- 8 · recomendações
E += [PageBreak(), Paragraph('Para onde olhar primeiro', H1),
      Paragraph('Ordenado por tamanho da oportunidade e por facilidade de execução.', SUB)]
REC = [('Atacar o tempo de busca no estoque',
        'Buscar item faltante é o segundo maior movimento da jornada inteira. Endereçamento de estoque, '
        'separação prévia e combinação com o repositor da loja atacam direto esse tempo — sem exigir que o '
        'promotor trabalhe mais rápido.'),
       ('Padronizar onde a variação é maior',
        'A faixa entre a visita mais rápida e a mais lenta é larga demais para ser explicada só por porte de '
        'loja. Um padrão de execução por canal, com sequência definida de blocos, reduz a cauda longa sem '
        'penalizar quem já opera bem.'),
       ('Tratar o DPP como operação própria',
        'Com quatro lojas por dia, o custo fixo de entrada pesa quatro vezes. Reduzir fricção de acesso — '
        'cadastro prévio, liberação, localização do setor — vale mais nesse canal do que em qualquer outro.'),
       ('Fechar a medição do deslocamento',
        'É o único bloco que falta para a jornada fechar de ponta a ponta. Manter a coleta até a amostra '
        'estabilizar permite dimensionar a rota com o trajeto incluído.')]
for i, (t_, d_) in enumerate(REC, 1):
    E += [Paragraph('{}. {}'.format(i, t_), st('rt', fontName='Helvetica-Bold', fontSize=11,
                                               textColor=cP, spaceBefore=11)),
          Paragraph(d_, st('rd', fontSize=9.5, leading=13.5, alignment=TA_JUSTIFY, spaceAfter=2))]
E += [Spacer(1, 12),
      destaque('Sobre o dimensionamento de ganho',
               'As recomendações saem do que foi medido. Quanto cada uma economiza, em minutos, só um piloto '
               'controlado responde — este estudo dimensiona o problema, não a solução.', VERDE, '#EEF5F1')]

# ------------------------------------------------------- anexo cobertura
E += [PageBreak(), Paragraph('Anexo — cobertura do estudo', H1),
      Paragraph('Os {} setores selecionados e quantas visitas cada um enviou.'.format(
          meta['setores_total']), SUB)]
lin = [['Setor', 'Executivo', 'Canais', 'Lojas', 'Visitas']]
for _, r in cob.sort_values(['Executivo', 'Setor']).iterrows():
    lin.append([r.Setor, r.Executivo, r.Canais, int(r['Lojas assignadas']), int(r['Visitas enviadas'])])
E += [tabela(lin, [2.8, 4.2, 3.6, 2.6, 3.8], alinha_dir=(3, 4))]

doc.build(E)
print('salvo:', SAIDA)
