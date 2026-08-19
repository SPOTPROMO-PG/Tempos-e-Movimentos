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

    // Idempotência: cada visita carrega um "ID Visita" gerado no celular.
    // Se a mesma visita chegar de novo (toque repetido no botão, reenvio
    // automático, retentativa de rede), respondemos ok sem gravar outra
    // linha — senão a planilha enche de cópias da mesma visita.
    const idVisita = payload['ID Visita'];
    if (idVisita && jaRegistrada(sheet, idVisita)) {
      return jsonResponse({ ok: true, duplicada: true });
    }

    const flat = flatten(payload); // já vem achatado; flatten() aqui é só uma rede de segurança
    flat['servidor_timestamp'] = new Date();
    flat['payload_json'] = rawBackup || JSON.stringify(payload);

    writeRow(sheet, flat);

    // Sem isto, a gravação fica em buffer e só é comitada depois que o
    // finally solta a trava — então a próxima execução lê a planilha sem
    // enxergar esta linha, jaRegistrada() devolve false e a mesma visita
    // entra de novo. Foi exatamente o que aconteceu com 2 visitas que
    // chegaram por reenvio: 13 linhas para 2 IDs. O flush força o commit
    // ainda dentro da trava.
    SpreadsheetApp.flush();

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

// Procura o ID da visita na coluna "ID Visita". Lê só essa coluna, e não a
// planilha inteira, para continuar rápido conforme as respostas crescem.
function jaRegistrada(sheet, idVisita) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return false;

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const col = headers.indexOf('ID Visita');
  if (col === -1) return false; // coluna ainda não existe: nada a comparar

  const valores = sheet.getRange(2, col + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < valores.length; i++) {
    if (String(valores[i][0]) === String(idVisita)) return true;
  }
  return false;
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


/* ==========================================================================
 * ACOMPANHAMENTO - rodar a mao no editor do Apps Script.
 *
 * Rode `verResumo()` e leia o resultado em "Registro de execucao".
 * So le a planilha; nao altera nada.
 * ========================================================================== */

// Quem e esperado responder. Gerado a partir de assets/js/catalogo.js -
// se o catalogo do app mudar, atualize esta lista tambem.
const ESPERADOS = [
  ['PR10', 'FERNANDO JOSE COELHO MARTIM'],
  ['PR107', 'DANIELA RODRIGUES DA CRUZ'],
  ['PR151', 'LUCIANE APARECIDA VESSELOVITZ'],
  ['PR18', 'FRANCIELI LUANI GOMES'],
  ['PR208', 'KAUA HENRIQUE SANTOS MORENO'],
  ['PR221', 'ANGELA CRISTINA BARBOZA LIMA'],
  ['PR256', 'ANDRESSA STEFANI DA SILVA'],
  ['PR275', 'KAUANY DANIELLI MAYNARD DE OLIVEIRA'],
  ['PR38', 'GELSON APARECIDO ALVES SANT ANA'],
  ['PR49', 'KEILA DE ANDRADE MARTINS'],
  ['RS12', 'KATIA EUFRASE SILVA'],
  ['RS137', 'JULIA EDUARDA MARTINS'],
  ['RS148', 'ARIEL WEBER'],
  ['RS150', 'BRUNA JUVENCIO'],
  ['RS177', 'NESTOR JORGE'],
  ['RS185', 'ANTÔNIO DOS SANTOS'],
  ['RS196', 'MURIELE ONGARATTO KINGESK'],
  ['RS258', 'ISADORA BARBOSA'],
  ['RS60', 'JOSSANE DE FREITAS MELO'],
  ['SC113', 'SUZANA GOMES DE ASSIS SOUZA'],
  ['SC167', 'LUIS CLAUDIO SANTOS DOS SANTOS'],
  ['SC209', 'LUIS VINICIUS SILVA COSTA'],
  ['SC21', 'ANA KAROLYNE PEDROSO GELBARI'],
  ['SC223', 'JOÃO VIOTOR DA SILVA CARDOSO'],
  ['SC241', 'ARIANA SILVA'],
  ['SC29', 'SAMANTA SILVA NUNES'],
  ['SC31', 'ADRIANA RRODRIGUES'],
  ['SC33', 'FRANCIELA RITA COSTA'],
  ['SC34', 'YASMIM MANGER MARQUES'],
  ['SC63', 'CAMIOLA PEREIRA DA SILVA'],
  ['SC71', 'AYLLA GABRIEL HISSI'],
  ['SPI02', 'ELAINE'],
  ['SPI11', 'EVERTON'],
  ['SPI187', 'AMANDA'],
  ['SPI193', 'LAIZ DE SOUZA LIMA'],
  ['SPI203', 'ROUSIANE FERREIRA NUNES'],
  ['SPI234', 'MARIA'],
  ['SPI263', 'VANESSA'],
  ['SPI273', 'B RUNA LEME SILVA'],
  ['SPI282', 'LUIS HENRIQUE FERNANDES DE OLIVEIRA'],
  ['SPI288', 'SUELEN'],
  ['SPI315', 'CLAUDIA CRISTINA DE OLIVEIRA TARCITANO'],
  ['SPI369', 'KATIA REGINA SANCHES'],
  ['SPI426', 'MARIANA'],
  ['SPI454', 'LEONARDO'],
  ['SPI475', 'ISAAC'],
  ['SPI524', 'VANUSA'],
  ['SPI57', 'NATIELE APARECIDA BARBOSA'],
];

function verResumo() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log('A aba nao existe ainda - nenhuma resposta chegou.'); return; }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) { Logger.log('Nenhuma resposta registrada ainda.'); return; }

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const dados = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const iSetor = headers.indexOf('Setor');
  const iLoja = headers.indexOf('Loja');
  const iData = headers.indexOf('servidor_timestamp');
  const iObs = headers.indexOf('Observacoes gerais do dia');

  const porSetor = {};
  const porDia = {};
  let testes = 0;
  let ultima = null;

  dados.forEach(function (row) {
    const setor = iSetor === -1 ? '' : String(row[iSetor] || '');
    const obs = iObs === -1 ? '' : String(row[iObs] || '');
    const loja = iLoja === -1 ? '' : String(row[iLoja] || '');
    if ((setor + ' ' + loja + ' ' + obs).toUpperCase().indexOf('TESTE') !== -1) { testes++; return; }

    porSetor[setor] = (porSetor[setor] || 0) + 1;

    if (iData !== -1 && row[iData] instanceof Date) {
      const d = Utilities.formatDate(row[iData], Session.getScriptTimeZone(), 'dd/MM');
      porDia[d] = (porDia[d] || 0) + 1;
      if (!ultima || row[iData] > ultima) ultima = row[iData];
    }
  });

  const responderam = Object.keys(porSetor);
  const faltando = ESPERADOS.filter(function (e) { return responderam.indexOf(e[0]) === -1; });

  Logger.log('===== RESUMO DA COLETA =====');
  Logger.log('Respostas validas: ' + (dados.length - testes));
  if (testes) Logger.log('(linhas de teste ignoradas: ' + testes + ')');
  Logger.log('Promotores que responderam: ' + responderam.length + ' de ' + ESPERADOS.length);
  if (ultima) Logger.log('Ultima resposta: ' + Utilities.formatDate(ultima, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
  Logger.log('');

  Logger.log('--- Respostas por dia ---');
  Object.keys(porDia).sort().forEach(function (d) { Logger.log('  ' + d + ' : ' + porDia[d]); });
  Logger.log('');

  Logger.log('--- Ja responderam (' + responderam.length + ') ---');
  ESPERADOS.forEach(function (e) {
    if (porSetor[e[0]]) Logger.log('  ' + e[0] + '  ' + e[1] + '  (' + porSetor[e[0]] + ')');
  });
  Logger.log('');

  Logger.log('--- AINDA NAO RESPONDERAM (' + faltando.length + ') ---');
  faltando.forEach(function (e) { Logger.log('  ' + e[0] + '  ' + e[1]); });

  const extras = responderam.filter(function (s) {
    return s && !ESPERADOS.some(function (e) { return e[0] === s; });
  });
  if (extras.length) {
    Logger.log('');
    Logger.log('--- Setores fora da lista esperada ---');
    extras.forEach(function (s) { Logger.log('  ' + s + '  (' + porSetor[s] + ')'); });
  }
}
