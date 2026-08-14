// Rode no console do app (ou via navegador headless) e salve a saída em
// analise/schema.json. Fazemos assim, e não com regex sobre o schema.js,
// porque o JS é a única fonte que interpreta o arquivo sem ambiguidade.
JSON.stringify({
  categorias: CATEGORIAS,
  blocos: BLOCKS.map(b => ({
    chave: b.key, titulo: b.title, por_categoria: !!b.porCategoria,
    categorias: b.porCategoria ? categoriasDoBloco(b) : null,
    itens: (b.porCategoria ? b.porCategoria.passos : b.activities)
      .map(x => ({ label: x.label || x.nome, obs: (x.obs||[]).map(o => o.label) })),
  })),
  fechamento: FECHAMENTO_FIELDS.map(f => f.label),
}, null, 2);
