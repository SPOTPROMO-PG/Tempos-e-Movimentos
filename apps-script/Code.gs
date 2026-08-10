/**
 * Tempos & Movimentos — recebe as respostas enviadas pelo formulário
 * (index.html / assets/js/app.js) e grava uma linha por visita na planilha.
 *
 * Como instalar: ver apps-script/README.md no repositório.
 *
 * Design: o front-end (assets/js/app.js, função buildReadablePayload) já
 * manda os dados achatados com rótulos legíveis — as mesmas perguntas do
 * formulário (ex: "Pré-Chegada - Saída da origem - Início") — no formato
 * clássico de planilha de respostas: 1 linha por visita, 1 coluna por
 * pergunta. Este script só grava: gerencia o cabeçalho sozinho (se o
 * formulário ganhar um campo novo, uma coluna nova aparece no final,
 * sem precisar editar este arquivo) e guarda o JSON bruto do `state`
 * completo numa coluna à parte, como backup.
 */

const SHEET_NAME = 'Respostas';

// Proteção opcional contra envios de fora do app: defina uma chave em
// Project Settings > Script properties com o nome SHARED_TOKEN, mude
// REQUIRE_TOKEN para true, e configure o mesmo valor em
// CONFIG.SUBMIT_TOKEN dentro de assets/js/app.js.
const REQUIRE_TOKEN = false;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!e || !e.postData) {
      return jsonResponse({ ok: false, error: 'Requisição sem corpo (postData ausente).' });
    }

    const payload = JSON.parse(e.postData.contents);

    if (REQUIRE_TOKEN) {
      const expected = PropertiesService.getScriptProperties().getProperty('SHARED_TOKEN');
      if (!expected || payload.token !== expected) {
        return jsonResponse({ ok: false, error: 'Token inválido.' });
      }
    }

    // "_raw" (backup do state aninhado) e "token" não são perguntas do
    // formulário — tiram fora antes de virarem coluna.
    const rawBackup = payload._raw;
    delete payload._raw;
    delete payload.token;

    const sheet = getOrCreateSheet();
    const flat = flatten(payload); // já vem achatado; flatten() aqui é só uma rede de segurança
    flat['servidor_timestamp'] = new Date();
    flat['payload_json'] = rawBackup || JSON.stringify(payload);

    writeRow(sheet, flat);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// GET só para conferir que o deploy está no ar (abra a URL /exec no navegador).
function doGet() {
  return jsonResponse({ ok: true, message: 'Tempos & Movimentos — endpoint ativo.' });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function writeRow(sheet, flat) {
  const lastCol = sheet.getLastColumn();
  let headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  const newKeys = Object.keys(flat).filter((k) => headers.indexOf(k) === -1);
  if (newKeys.length > 0) {
    headers = headers.concat(newKeys);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const row = headers.map((h) => (h in flat ? formatValue(flat[h]) : ''));
  sheet.appendRow(row);
}

function formatValue(v) {
  if (v instanceof Date) return v;
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return v;
}

// Achata um objeto aninhado em chaves "a.b.c" -> valor (rede de segurança:
// o payload que chega já vem achatado do front-end, então isso normalmente
// não faz nada além de devolver o próprio objeto).
function flatten(obj, prefix, out) {
  out = out || {};
  prefix = prefix || '';
  Object.keys(obj || {}).forEach((key) => {
    const value = obj[key];
    const path = prefix ? prefix + '.' + key : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out[path] = value;
    }
  });
  return out;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


/* ==========================================================================
 * MANUTENÇÃO — para rodar à mão no editor do Apps Script.
 *
 * Nada aqui roda sozinho: o formulário nunca chama estas funções, e elas
 * não fazem parte do Web App (não é preciso reimplantar por causa delas).
 *
 * Uso:
 *   1) Rode `verLimpeza()`  -> só RELATA o que seria apagado, não apaga nada
 *   2) Confira o relatório em "Registro de execução"
 *   3) Rode `fazerLimpeza()` -> aí sim apaga
 * ========================================================================== */

// Colunas de controle que nunca devem ser removidas.
const COLUNAS_PROTEGIDAS = ['servidor_timestamp', 'payload_json'];

// Uma linha é considerada teste se "TESTE" aparecer na identificação ou nas
// observações. Todas as linhas de teste geradas durante o desenvolvimento
// foram marcadas assim de propósito.
function _ehLinhaDeTeste(headers, row) {
  const pegar = (nome) => {
    const i = headers.indexOf(nome);
    return i === -1 ? '' : String(row[i] === null || row[i] === undefined ? '' : row[i]);
  };
  const alvo = [
    pegar('Setor'), pegar('Loja'), pegar('Promotor'),
    pegar('Observações gerais do dia'),
  ].join(' ').toUpperCase();
  return alvo.indexOf('TESTE') !== -1;
}

function _analisar() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return { erro: 'A aba "' + SHEET_NAME + '" não existe.' };

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return { erro: 'A aba está vazia.' };

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const dados = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];

  const linhasTeste = [];
  const linhasReais = [];
  dados.forEach((row, i) => {
    const numeroDaLinha = i + 2; // +1 cabeçalho, +1 base 1
    if (_ehLinhaDeTeste(headers, row)) linhasTeste.push({ n: numeroDaLinha, row });
    else linhasReais.push({ n: numeroDaLinha, row });
  });

  // Coluna órfã = fica totalmente vazia depois que as linhas de teste saem.
  // Isso pega sozinho tudo que a estrutura antiga deixou para trás
  // (Pré-Chegada, "Categoria ...", colunas de bloco antigas etc).
  const colunasOrfas = [];
  headers.forEach((h, c) => {
    if (!h) return;
    if (COLUNAS_PROTEGIDAS.indexOf(h) !== -1) return;
    const temValor = linhasReais.some((l) => {
      const v = l.row[c];
      return v !== '' && v !== null && v !== undefined;
    });
    if (!temValor) colunasOrfas.push({ nome: h, col: c + 1 });
  });

  return { sheet, headers, linhasTeste, linhasReais, colunasOrfas };
}

function verLimpeza() {
  const a = _analisar();
  if (a.erro) { Logger.log(a.erro); return; }

  Logger.log('=== ESTADO ATUAL ===');
  Logger.log('Colunas: %s | Linhas de resposta: %s', a.headers.length, a.linhasTeste.length + a.linhasReais.length);
  Logger.log('');
  Logger.log('Linhas de TESTE (serão apagadas): %s', a.linhasTeste.length);
  a.linhasTeste.forEach((l) => {
    const i = a.headers.indexOf('Loja');
    Logger.log('   linha %s  %s', l.n, i === -1 ? '' : l.row[i]);
  });
  Logger.log('');
  Logger.log('Linhas que serão MANTIDAS: %s', a.linhasReais.length);
  a.linhasReais.forEach((l) => {
    const i = a.headers.indexOf('Loja');
    Logger.log('   linha %s  %s', l.n, i === -1 ? '' : l.row[i]);
  });
  Logger.log('');
  Logger.log('Colunas que ficariam vazias (serão apagadas): %s', a.colunasOrfas.length);
  a.colunasOrfas.forEach((c) => Logger.log('   %s', c.nome));
  Logger.log('');
  if (a.linhasReais.length === 0) {
    Logger.log('>>> Nenhuma resposta real na planilha. fazerLimpeza() vai zerar a aba');
    Logger.log('>>> inteira (cabeçalho incluso). Ela se recria sozinha no próximo envio.');
  } else {
    Logger.log('>>> Confira a lista acima. Se estiver certo, rode fazerLimpeza().');
  }
}

function fazerLimpeza() {
  const a = _analisar();
  if (a.erro) { Logger.log(a.erro); return; }

  // Caso comum aqui: só existiam linhas de teste. Zerar a aba é mais limpo
  // do que apagar coluna por coluna — ela se reconstrói no próximo envio.
  if (a.linhasReais.length === 0) {
    a.sheet.clear();
    Logger.log('Aba zerada (%s linhas de teste removidas, %s colunas removidas).',
      a.linhasTeste.length, a.headers.length);
    Logger.log('O cabeçalho volta sozinho no próximo envio do formulário.');
    return;
  }

  // Apaga de baixo para cima para os índices não escorregarem.
  a.linhasTeste.slice().sort((x, y) => y.n - x.n).forEach((l) => a.sheet.deleteRow(l.n));
  a.colunasOrfas.slice().sort((x, y) => y.col - x.col).forEach((c) => a.sheet.deleteColumn(c.col));

  Logger.log('Pronto: %s linha(s) de teste e %s coluna(s) órfã(s) removidas.',
    a.linhasTeste.length, a.colunasOrfas.length);
  Logger.log('Restaram %s resposta(s).', a.linhasReais.length);
}
