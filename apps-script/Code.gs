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
