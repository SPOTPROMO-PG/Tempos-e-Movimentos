/**
 * Tempos & Movimentos — recebe as respostas enviadas pelo formulário
 * (index.html / assets/js/app.js) e grava uma linha por visita na planilha.
 *
 * Como instalar: ver apps-script/README.md no repositório.
 *
 * Design: o front-end manda o `state` inteiro em JSON (estrutura livre,
 * definida em assets/js/schema.js). Este script "achata" o objeto em
 * colunas do tipo "blocks.pre_chegada.activities.1.inicio" e gerencia o
 * cabeçalho da planilha sozinho — se o schema do formulário mudar (novo
 * bloco, novo campo), novas colunas aparecem automaticamente no final,
 * sem precisar editar este arquivo. O JSON bruto também é salvo numa
 * coluna à parte, como backup, caso algo se perca no achatamento.
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

    const sheet = getOrCreateSheet();
    const flat = flatten(payload);
    flat['servidor_timestamp'] = new Date();
    flat['payload_json'] = JSON.stringify(payload);

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

// Achata um objeto aninhado em chaves "a.b.c" -> valor.
// Ex: { blocks: { pre_chegada: { activities: { 1: { inicio: "08:00" } } } } }
//  => { "blocks.pre_chegada.activities.1.inicio": "08:00" }
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
