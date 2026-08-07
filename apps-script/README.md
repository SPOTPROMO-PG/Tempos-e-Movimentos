# Apps Script — instalação

Passo a passo para conectar o formulário à sua planilha do Google Sheets.
Precisa ser feito por você (a Claude não tem acesso à sua conta Google).

## 1. Abra o Apps Script vinculado à planilha

Na sua planilha do Google Sheets: **Extensões → Apps Script**.
Isso abre um editor já vinculado a essa planilha específica (não precisa
escolher planilha nenhuma, é automático).

## 2. Cole o código

Apague o conteúdo padrão de `Código.gs` (ou `Code.gs`) e cole o conteúdo
de [`Code.gs`](Code.gs) deste repositório. Salve (ícone de disquete ou
`Ctrl+S`).

## 3. Implante como Web App

1. Canto superior direito → **Implantar → Nova implantação**
2. No ícone de engrenagem ao lado de "Selecionar tipo", escolha **App da Web**
3. Configure:
   - **Executar como:** Eu (`seu-email@...`)
   - **Quem pode acessar:** Qualquer pessoa
     *(precisa ser "Qualquer pessoa", não "Qualquer pessoa com Conta
     Google" — senão o formulário no navegador do promotor não consegue
     enviar. Isso não deixa a planilha pública, só permite que essa URL
     específica receba requisições.)*
4. **Implantar**
5. Na primeira vez, o Google vai pedir autorização — clique em
   **Continuar** / **Avançado → Acessar [nome do projeto] (não seguro)**
   se aparecer o aviso padrão do Google (é o app do próprio Google, o
   aviso aparece sempre para scripts não publicados na Play Store)
6. Copie a **URL do app da Web** (termina em `/exec`)

## 4. Me envie a URL

Cole essa URL aqui no chat. Eu coloco em `CONFIG.SCRIPT_URL` dentro de
`assets/js/app.js`, testo o envio de ponta a ponta, e publico.

## 5. Sempre que o código do script mudar

Se no futuro eu (ou você) editar `Code.gs`, é preciso repetir o passo 3
(**Implantar → Gerenciar implantações → editar (ícone de lápis) →
Nova versão → Implantar**). Só salvar o arquivo no editor não atualiza
a versão publicada.

## Onde os dados caem

Uma aba chamada **Respostas** é criada automaticamente na primeira
resposta enviada. Cada linha é uma visita completa; as colunas vão
sendo criadas sozinhas conforme os campos do formulário (não precisa
mexer na planilha manualmente). Tem também uma coluna `payload_json`
com o JSON bruto de cada envio, como backup.

## Segurança (opcional)

Por padrão qualquer requisição POST bem formada para a URL grava uma
linha — não tem trava. Se quiser adicionar uma trava simples:

1. No editor do Apps Script: **Configurações do projeto (ícone de
   engrenagem) → Propriedades do script → Adicionar propriedade do script**
   Nome: `SHARED_TOKEN`, valor: qualquer texto secreto.
2. Em `Code.gs`, mude `REQUIRE_TOKEN` de `false` para `true` e reimplante.
3. Me avise o valor escolhido para eu configurar `CONFIG.SUBMIT_TOKEN` no
   `app.js`.
