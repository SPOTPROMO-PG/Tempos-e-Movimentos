# -*- coding: utf-8 -*-
"""
Consolida as saídas de jornada.py nos JSONs que alimentam os entregáveis.

Rodar sempre depois de jornada.py e antes de gerar_excel / gerar_ppt /
gerar_pdf, para as quatro peças saírem da mesma base.

Gera:
  analise/saida/dossie_min.json   composição por canal (dossiê e deck)
  analise/saida/extra.json        classificação do tempo e variabilidade
  analise/saida/meta.json         período e cobertura
  analise/saida/cobertura.csv     os setores do estudo
  analise/saida/desloc.json       trajetos até a loja
"""

import io
import json
import re
import sys

import pandas as pd

RAIZ = '.'
BLOCOS = ['Entrada', 'Abertura', 'Estoque', 'Check Out', 'Ponto Natural',
          'Ponto Extra', 'Outras Atividades', 'Saída']
LOJAS_DIA_MAX = 12    # acima disso é erro de digitação (houve um "58 lojas")
DESL = 'Deslocamento - Deslocamento até esta loja - {}'


def hhmm(v):
    if pd.isna(v):
        return None
    if hasattr(v, 'hour'):
        return v.hour * 60 + v.minute
    m = re.match(r'^(\d{1,2}):(\d{2})', str(v).strip())
    return int(m.group(1)) * 60 + int(m.group(2)) if m else None


def dedup(df):
    """Mesma chave de jornada.py — ver o comentário lá."""
    ts = pd.to_datetime(df[df.columns[0]], errors='coerce').dt.date
    chave = (df['Promotor'].astype(str).str.upper().str.strip() + '||'
             + df['Loja'].astype(str).str.upper().str.strip() + '||' + ts.astype(str))
    if 'ID Visita' in df.columns:
        chave = df['ID Visita'].where(df['ID Visita'].notna(), chave)
    cols_h = [c for c in df.columns if str(c).endswith(('- Início', '- Término'))]
    ordem = df[cols_h].notna().sum(axis=1).sort_values(ascending=False, kind='mergesort').index
    return df.loc[sorted(chave.loc[ordem].drop_duplicates(keep='first').index)].copy()


def main(caminho_xlsx):
    vis = pd.read_csv(f'{RAIZ}/analise/saida/resumo_visitas.csv')
    can = pd.read_csv(f'{RAIZ}/analise/saida/jornada_por_canal.csv')
    ger = pd.read_csv(f'{RAIZ}/analise/saida/jornada_geral.csv')

    vd = vis.copy()
    vd.loc[vd.lojas_no_dia > LOJAS_DIA_MAX, 'lojas_no_dia'] = pd.NA
    nvis = vis.groupby('canal').loja.size()

    # --- composição por canal ---
    mv = can.join(nvis.rename('nv'), on='canal')
    mv['por_loja'] = mv.min_equiv / mv.nv
    bl = mv.groupby(['canal', 'bloco']).por_loja.sum().unstack(fill_value=0)
    for b in BLOCOS:
        if b not in bl.columns:
            bl[b] = 0.0
    bl = bl[BLOCOS]
    movs = mv.groupby(['canal', 'bloco', 'movimento']).por_loja.sum().reset_index()

    base = vis.groupby('canal').agg(n=('loja', 'size'), prom=('promotor', 'nunique'),
                                    visita=('tempo_loja_min', 'mean')).round(1)
    saida = []
    for ch in base.sort_values('n', ascending=False).index:
        b = base.loc[ch]
        v = float(b.visita)
        fx = 480 / v
        ld = vd[vd.canal == ch].lojas_no_dia.median()
        saida.append({
            'canal': ch, 'n': int(b.n), 'promotores': int(b.prom), 'visita_min': round(v),
            'lojas_dia': None if pd.isna(ld) else float(ld), 'cabe_em_8h': round(fx, 1),
            'blocos': {k: round(float(x)) for k, x in bl.loc[ch].items()},
            'blocos_8h': {k: round(float(x) * fx) for k, x in bl.loc[ch].items()},
            'top': [{'mov': r.movimento, 'bloco': r.bloco, 'min': round(float(r.por_loja), 1),
                     'pct': round(float(r.por_loja) / v * 100, 1),
                     'min_8h': round(float(r.por_loja) * fx)}
                    for _, r in movs[movs.canal == ch].nlargest(6, 'por_loja').iterrows()],
        })
    io.open(f'{RAIZ}/analise/saida/dossie_min.json', 'w', encoding='utf-8').write(
        json.dumps(saida, ensure_ascii=False, separators=(',', ':')))

    # --- classificação e variabilidade ---
    cl = ger.groupby('classe').agg(p=('pct_tempo_loja', 'sum'),
                                   m=('min_em_8h', 'sum')).sort_values('p', ascending=False)
    pt = can.groupby(['canal', 'classe']).pct_tempo_loja.sum().unstack(fill_value=0) * 100
    dv = vis.groupby('canal').tempo_loja_min.agg(['size', 'mean', 'std', 'min', 'max', 'median'])
    json.dump({
        'classes': {i: {'pct': round(r.p * 100, 1), 'min_8h': int(r.m)} for i, r in cl.iterrows()},
        'classes_canal': {k: {kk: round(vv, 1) for kk, vv in r.items()} for k, r in pt.iterrows()},
        'variab': {i: {'n': int(r['size']), 'media': round(r['mean']), 'mediana': round(r['median']),
                       'min': round(r['min']), 'max': round(r['max']),
                       'cv': round(r['std'] / r['mean'] * 100) if pd.notna(r['std']) else 0}
                   for i, r in dv.iterrows()},
    }, io.open(f'{RAIZ}/analise/saida/extra.json', 'w', encoding='utf-8'), ensure_ascii=False)

    # --- cobertura, período e deslocamento (precisam do xlsx cru) ---
    df = pd.read_excel(caminho_xlsx, sheet_name='Respostas')
    ts = pd.to_datetime(df[df.columns[0]], errors='coerce')
    d = dedup(df)

    txt = io.open(f'{RAIZ}/assets/js/catalogo.js', encoding='utf-8').read()
    cat = json.loads(txt[txt.index('['):txt.rindex(']') + 1])
    cob = pd.DataFrame([{'Setor': c['setor'], 'Promotor': c['promotor'],
                         'Executivo': c['executivo'], 'Canais': '/'.join(c['canais']),
                         'Lojas assignadas': len(c['lojas'])} for c in cat])
    envios = d.groupby(d['Setor'].astype(str).str.upper().str.strip()).size()
    cob['Visitas enviadas'] = cob.Setor.str.upper().str.strip().map(envios).fillna(0).astype(int)
    cob['Status'] = cob['Visitas enviadas'].apply(lambda n: 'Respondeu' if n else 'Pendente')
    cob.to_csv(f'{RAIZ}/analise/saida/cobertura.csv', index=False, encoding='utf-8-sig')

    json.dump({'periodo': [str(ts.min().date()), str(ts.max().date())],
               'linhas_brutas': len(df), 'visitas': len(vis),
               'promotores': int(vis.promotor.nunique()),
               'setores': int((cob.Status == 'Respondeu').sum()), 'setores_total': len(cob)},
              io.open(f'{RAIZ}/analise/saida/meta.json', 'w', encoding='utf-8'), ensure_ascii=False)

    # Cada trajeto tem horário próprio, então é contado como evento — não
    # depende do dedup de visita.
    ci, cf, co = (DESL.format(x) for x in ('Início', 'Término', 'De onde veio'))
    w = df[df[ci].notna() & df[cf].notna()].copy()
    w['ini'] = w[ci].map(hhmm)
    w['fim'] = w[cf].map(hhmm)
    w['dia'] = ts[w.index].dt.date
    w['P'] = w['Promotor'].astype(str).str.upper().str.strip()
    u = w.drop_duplicates(subset=['P', 'Loja', 'dia', 'ini', 'fim'])
    u = u[u.ini.notna() & u.fim.notna()]
    u = u.assign(min=u.fim - u.ini)
    u = u[(u['min'] > 0) & (u['min'] <= 240)]
    json.dump({'n': int(len(u)), 'mediana': int(u['min'].median()),
               'promotores': int(u.P.nunique()),
               'por_origem': {k: {'n': int(r['size']), 'mediana': int(r['median'])}
                              for k, r in u.groupby(co)['min'].agg(['size', 'median']).iterrows()}},
              io.open(f'{RAIZ}/analise/saida/desloc.json', 'w', encoding='utf-8'), ensure_ascii=False)

    print(f'canais {len(saida)} | cobertura {(cob.Status == "Respondeu").sum()}/{len(cob)} '
          f'| trajetos {len(u)}')
    for c in cl.index:
        print(f'  {c:26} {cl.loc[c, "p"] * 100:5.1f}%')


if __name__ == '__main__':
    main(sys.argv[1])
