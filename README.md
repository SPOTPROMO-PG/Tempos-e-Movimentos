# Tempos & Movimentos

Pesquisa de campo (tempos e movimentos) para promotores em loja — app web
mobile-first, publicado via GitHub Pages.

**App publicado:** https://spotpromo-pg.github.io/Tempos-e-Movimentos/

## Estrutura

```
index.html            shell da página
assets/css/styles.css  estilo (mobile-first, sem dependências externas)
assets/js/schema.js    estrutura da pesquisa (blocos, atividades, campos)
assets/js/catalogo.js  catálogo Setor -> Lojas assignadas (amostra atual: 20 setores)
assets/js/app.js       lógica: login, navegação, autosave, envio
```

## Como funciona

1. **Login**: o promotor escolhe o Setor e depois a Loja assignada a ele
   (dados vindos de `catalogo.js`). Confirma alguns dados rápidos da visita
   e entra direto na pesquisa.
2. **Pesquisa**: passos guiados (estilo formulário), com cronometragem de
   início/término por atividade, salvos automaticamente no navegador
   (`localStorage`) — não perde progresso se o app fechar.
3. **Envio**: por enquanto os dados ficam salvos no dispositivo e podem ser
   baixados em JSON. A integração com Google Sheets via Apps Script é o
   próximo passo (`CONFIG.SCRIPT_URL` em `assets/js/app.js`).

## Catálogo de setores (amostra)

`assets/js/catalogo.js` contém hoje uma amostra de 20 setores (de ~1.066
no total), escolhidos aleatoriamente — cobre o grupo de promotores que já
está testando a pesquisa. Para regenerar com mais setores, ver o
comentário no topo do próprio arquivo.

As planilhas fonte (`.xlsx`) não ficam neste repositório por conterem
dados internos (CNPJ, endereços, IDs) — seguem só localmente.
