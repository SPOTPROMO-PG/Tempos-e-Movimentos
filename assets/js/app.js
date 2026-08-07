/**
 * Pesquisa de Tempos e Movimentos — motor do formulário
 * Lê a estrutura de schema.js, renderiza passo a passo (estilo "forms"),
 * salva progresso localmente (localStorage) e envia o resultado final a
 * um Google Apps Script Web App (ver apps-script/Code.gs e apps-script/README.md).
 */

const CONFIG = {
  STORAGE_KEY: 'tm_survey_state_v1',
  SUBMISSIONS_KEY: 'tm_survey_submissions_v1',
  LOGIN_KEY: 'tm_login_v1',
  // URL do Web App do Apps Script (termina em /exec). Ver apps-script/README.md.
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwkmlM59FIGxsfDvHmRriqN66dZ1xGDz-3T5ob8h5pgrJ1_FUUy5YoYM-0V8_-f85ia/exec',
  // Só necessário se REQUIRE_TOKEN estiver true em apps-script/Code.gs.
  SUBMIT_TOKEN: '',
};

/* ---------------- State ---------------- */

function defaultState() {
  return {
    cadastro: {},
    blocks: {},
    categorias: {},
    fechamento: {},
    meta: { currentStep: 0, startedAt: new Date().toISOString() },
  };
}

let state = loadState();
let saveTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) { console.warn('Falha ao carregar estado salvo', e); }
  return defaultState();
}

function saveState(showToast = false) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
    if (showToast) toast('Progresso salvo');
  }, 250);
}

function getPath(obj, path) {
  return path.reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setPath(obj, path, val) {
  let o = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (o[k] == null || typeof o[k] !== 'object') o[k] = {};
    o = o[k];
  }
  o[path[path.length - 1]] = val;
}

/* ---------------- Login (Setor -> Loja) ----------------
 * Portão de identificação antes do questionário. Usa o catálogo de
 * assignação (catalogo.js) — hoje uma amostra de 20 setores, já que só
 * esse grupo de promotores está respondendo a pesquisa por enquanto.
 * Fica salvo à parte do state da pesquisa, então sobrevive a um "Iniciar
 * nova visita" (o promotor normalmente continua na mesma loja/setor).
 */

function loadLogin() {
  try {
    const raw = localStorage.getItem(CONFIG.LOGIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Falha ao carregar login salvo', e); }
  return { setor: null, lojaId: null };
}
function saveLogin() {
  localStorage.setItem(CONFIG.LOGIN_KEY, JSON.stringify(loginState));
}
function isLoggedIn() {
  return !!(loginState.setor && loginState.lojaId);
}
function getSetorObj(setor) {
  return CATALOGO.find((s) => s.setor === setor);
}
function getLojaObj(setor, lojaId) {
  const s = getSetorObj(setor);
  return s ? s.lojas.find((l) => l.id === lojaId) : null;
}

// Copia os dados da loja logada para dentro do state da pesquisa, para
// que fiquem gravados junto das respostas (payload final / planilha).
function applyLoginToState() {
  const loja = getLojaObj(loginState.setor, loginState.lojaId);
  if (!loja) return;
  state.cadastro.setor = loginState.setor;
  state.cadastro.lojaId = loja.id;
  state.cadastro.loja = loja.nome;
  state.cadastro.canal = loja.canal;
  state.cadastro.cidade = loja.cidade;
  state.cadastro.estado = loja.estado;
  saveState();
}

function logout() {
  if (!window.confirm('Trocar de loja? Suas respostas desta visita continuam salvas neste dispositivo.')) return;
  loginState = { setor: null, lojaId: null };
  saveLogin();
  boot();
}

let loginState = loadLogin();

function renderLogin() {
  document.querySelector('.topbar').style.display = 'none';
  document.querySelector('.bottombar').style.display = 'none';

  const main = document.getElementById('main');
  main.innerHTML = '';
  main.style.paddingBottom = '40px';

  const wrap = document.createElement('div');
  wrap.className = 'login';
  wrap.innerHTML = `
    <div class="login__brand">
      <span class="mark" aria-hidden="true">TM</span>
      <div>
        <div class="login__brand-title">Tempos &amp; Movimentos</div>
        <div class="login__brand-sub">Identifique-se para iniciar a coleta</div>
      </div>
    </div>
  `;

  const setorSection = document.createElement('div');
  setorSection.className = 'login__section';
  setorSection.innerHTML = '<h2>Setor</h2>';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'login-search';
  searchInput.placeholder = 'Digite o código do setor';
  searchInput.autocomplete = 'off';
  setorSection.appendChild(searchInput);
  const setorList = document.createElement('div');
  setorList.className = 'pick-list';
  setorSection.appendChild(setorList);
  wrap.appendChild(setorSection);

  const lojaSection = document.createElement('div');
  lojaSection.className = 'login__section';
  lojaSection.style.display = 'none';
  lojaSection.innerHTML = '<div class="login__section-head"><h2>Loja</h2></div>';
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'link-back';
  backBtn.textContent = 'Trocar setor';
  lojaSection.querySelector('.login__section-head').appendChild(backBtn);
  const lojaList = document.createElement('div');
  lojaList.className = 'pick-list';
  lojaSection.appendChild(lojaList);
  wrap.appendChild(lojaSection);

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn btn-primary login__confirm';
  confirmBtn.textContent = 'Entrar';
  confirmBtn.disabled = true;
  wrap.appendChild(confirmBtn);

  let selectedSetor = null;
  let selectedLoja = null;

  function refreshConfirm() {
    confirmBtn.disabled = !(selectedSetor && selectedLoja);
  }

  function renderLojas(setorObj) {
    lojaList.innerHTML = '';
    setorObj.lojas.forEach((l) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'pick-item';
      item.innerHTML = `<span class="pick-item__title">${l.nome}</span><span class="pick-item__meta">${l.canal} · ${l.cidade}/${l.estado}</span>`;
      item.addEventListener('click', () => {
        selectedLoja = l.id;
        lojaList.querySelectorAll('.pick-item').forEach((el) => el.classList.remove('active'));
        item.classList.add('active');
        refreshConfirm();
      });
      lojaList.appendChild(item);
    });
  }

  CATALOGO.forEach((s) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'pick-item';
    item.dataset.setor = s.setor.toUpperCase();
    const n = s.lojas.length;
    item.innerHTML = `<span class="pick-item__title">${s.setor}</span><span class="pick-item__meta">${n} loja${n > 1 ? 's' : ''} assignada${n > 1 ? 's' : ''}</span>`;
    item.addEventListener('click', () => {
      selectedSetor = s.setor;
      selectedLoja = null;
      refreshConfirm();
      setorList.querySelectorAll('.pick-item').forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
      renderLojas(s);
      lojaSection.style.display = 'block';
      lojaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    setorList.appendChild(item);
  });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toUpperCase();
    setorList.querySelectorAll('.pick-item').forEach((el) => {
      el.style.display = el.dataset.setor.includes(q) ? '' : 'none';
    });
  });

  backBtn.addEventListener('click', () => {
    lojaSection.style.display = 'none';
    selectedSetor = null;
    selectedLoja = null;
    refreshConfirm();
    setorList.querySelectorAll('.pick-item').forEach((el) => el.classList.remove('active'));
  });

  confirmBtn.addEventListener('click', () => {
    if (confirmBtn.disabled) return;
    loginState = { setor: selectedSetor, lojaId: selectedLoja };
    saveLogin();
    applyLoginToState();
    currentStep = 0;
    boot();
  });

  main.appendChild(wrap);
}

// Decide qual tela mostrar: login (setor/loja) ou o questionário.
function boot() {
  flushPendingSubmissions();
  if (isLoggedIn()) {
    document.querySelector('.topbar').style.display = '';
    document.querySelector('.bottombar').style.display = '';
    document.getElementById('main').style.paddingBottom = '';
    applyLoginToState();
    render();
  } else {
    renderLogin();
  }
}

/* ---------------- Steps ---------------- */

const STEPS = [
  ...BLOCKS.map((b) => ({ type: 'block', block: b, title: b.title, subtitle: b.subtitle })),
  { type: 'categorias', title: 'Categorias', subtitle: 'Tempo de abastecimento por categoria' },
  { type: 'fechamento', title: 'Fechamento', subtitle: 'Encerramento do dia de trabalho' },
  { type: 'review', title: 'Revisão', subtitle: 'Confira antes de enviar' },
];

/* ---------------- Field builders ---------------- */

function fieldWrapper(labelText, required, inner, hint) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  if (labelText) {
    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = labelText;
    if (required) {
      const req = document.createElement('span');
      req.className = 'req';
      req.textContent = '*';
      label.appendChild(req);
    }
    wrap.appendChild(label);
  }
  wrap.appendChild(inner);
  if (hint) {
    const h = document.createElement('div');
    h.className = 'hint';
    h.textContent = hint;
    wrap.appendChild(h);
  }
  return wrap;
}

function createField(def, path, opts = {}) {
  const current = getPath(state, path);
  let inner;

  if (def.type === 'select') {
    inner = document.createElement('div');
    inner.className = 'segmented';
    def.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt;
      if (current === opt) btn.classList.add('active');
      btn.addEventListener('click', () => {
        const val = getPath(state, path) === opt ? undefined : opt;
        setPath(state, path, val);
        inner.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        if (val) btn.classList.add('active');
        saveState();
        if (opts.onChange) opts.onChange();
      });
      inner.appendChild(btn);
    });
  } else if (def.type === 'textarea') {
    inner = document.createElement('textarea');
    inner.placeholder = def.placeholder || '';
    inner.value = current || '';
    inner.addEventListener('input', () => { setPath(state, path, inner.value); saveState(); });
  } else {
    const box = def.unit ? document.createElement('div') : null;
    if (box) box.className = 'field-with-unit';
    inner = document.createElement('input');
    inner.type = def.type === 'number' ? 'number' : def.type === 'date' ? 'date' : def.type === 'time' ? 'time' : 'text';
    if (def.placeholder) inner.placeholder = def.placeholder;
    if (def.min !== undefined) inner.min = def.min;
    if (def.step) inner.step = def.step;
    inner.value = current ?? '';
    inner.addEventListener('input', () => {
      setPath(state, path, inner.value === '' ? undefined : inner.value);
      saveState();
      if (opts.onChange) opts.onChange();
    });
    if (box) {
      box.appendChild(inner);
      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.textContent = def.unit;
      box.appendChild(unit);
      inner = box;
    }
  }

  return fieldWrapper(def.label, def.required, inner, def.hint);
}

function nowHHMM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function diffLabel(ini, fim) {
  if (!ini || !fim) return null;
  const [ih, im] = ini.split(':').map(Number);
  const [fh, fm] = fim.split(':').map(Number);
  let mins = (fh * 60 + fm) - (ih * 60 + im);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function createTimePair(basePath, onUpdate) {
  const outer = document.createElement('div');
  outer.className = 'timepair-outer';

  const row = document.createElement('div');
  row.className = 'timepair';

  const inputs = {};

  function makeSide(sub, label) {
    const path = [...basePath, sub];
    const side = document.createElement('div');
    side.className = 'timebtn';
    const lab = document.createElement('span');
    lab.className = 'tb-label';
    lab.textContent = label;
    side.appendChild(lab);

    const input = document.createElement('input');
    input.type = 'time';
    input.value = getPath(state, path) || '';
    input.addEventListener('input', () => {
      setPath(state, path, input.value || undefined);
      saveState();
      refreshNowBtn();
      onUpdate();
    });
    side.appendChild(input);
    inputs[sub] = input;
    return side;
  }

  row.appendChild(makeSide('inicio', 'Início'));
  row.appendChild(makeSide('fim', 'Término'));
  outer.appendChild(row);

  // Botão único e afastado dos campos: evita toques acidentais nos inputs de
  // horário. Preenche o próximo horário em aberto (início, depois término).
  const nowBtn = document.createElement('button');
  nowBtn.type = 'button';
  nowBtn.className = 'time-now-btn';
  outer.appendChild(nowBtn);

  function refreshNowBtn() {
    const iniPath = [...basePath, 'inicio'];
    const fimPath = [...basePath, 'fim'];
    const hasIni = !!getPath(state, iniPath);
    const hasFim = !!getPath(state, fimPath);
    if (!hasIni) {
      nowBtn.textContent = 'Marcar início agora';
      nowBtn.disabled = false;
    } else if (!hasFim) {
      nowBtn.textContent = 'Marcar término agora';
      nowBtn.disabled = false;
    } else {
      nowBtn.textContent = 'Horários registrados';
      nowBtn.disabled = true;
    }
  }

  nowBtn.addEventListener('click', () => {
    const hasIni = !!getPath(state, [...basePath, 'inicio']);
    const sub = hasIni ? 'fim' : 'inicio';
    const val = nowHHMM();
    inputs[sub].value = val;
    setPath(state, [...basePath, sub], val);
    saveState();
    refreshNowBtn();
    onUpdate();
  });

  refreshNowBtn();
  return outer;
}

/* ---------------- Section: Activity block ---------------- */

function renderBlock(container, block) {
  block.activities.forEach((act) => {
    const basePath = ['blocks', block.key, 'activities', act.id];
    const card = document.createElement('div');
    card.className = 'activity';

    const head = document.createElement('div');
    head.className = 'activity__head';
    const badge = document.createElement('div');
    badge.className = 'activity__badge';
    badge.textContent = act.id;
    const name = document.createElement('div');
    name.className = 'activity__name';
    name.textContent = act.nome;
    head.appendChild(badge);
    head.appendChild(name);
    card.appendChild(head);

    function refreshState() {
      const ini = getPath(state, [...basePath, 'inicio']);
      const fim = getPath(state, [...basePath, 'fim']);
      card.classList.remove('in-progress', 'done');
      const existingChip = head.querySelector('.duration-chip');
      if (existingChip) existingChip.remove();
      if (ini && fim) {
        card.classList.add('done');
        const chip = document.createElement('span');
        chip.className = 'duration-chip';
        chip.textContent = '✓ ' + (diffLabel(ini, fim) || '');
        head.appendChild(chip);
      } else if (ini) {
        card.classList.add('in-progress');
      }
    }

    card.appendChild(createTimePair(basePath, refreshState));

    if (act.obs && act.obs.length) {
      const obsWrap = document.createElement('div');
      obsWrap.className = 'activity__obs';
      act.obs.forEach((obsDef) => {
        obsWrap.appendChild(createField(obsDef, [...basePath, 'obs', obsDef.key]));
      });
      card.appendChild(obsWrap);
    }

    refreshState();
    container.appendChild(card);
  });

  if (block.extra && block.extra.length) {
    const card = document.createElement('div');
    card.className = 'card';
    block.extra.forEach((def) => {
      card.appendChild(createField(def, ['blocks', block.key, 'extra', def.key]));
    });
    container.appendChild(card);
  }
}

/* ---------------- Section: Categorias (Bloco 8) ---------------- */

function renderCategorias(container) {
  CATEGORIAS.forEach((cat) => {
    const item = document.createElement('div');
    item.className = 'cat-item';

    const head = document.createElement('div');
    head.className = 'cat-item__head';
    const title = document.createElement('div');
    title.className = 'cat-item__title';
    title.textContent = cat;
    const status = document.createElement('span');
    status.className = 'cat-item__status';
    const chevron = document.createElement('span');
    chevron.className = 'cat-item__chevron';
    chevron.textContent = '▸';
    head.appendChild(title);
    head.appendChild(status);
    head.appendChild(chevron);

    const body = document.createElement('div');
    body.className = 'cat-item__body';

    function refreshStatusChip() {
      const st = getPath(state, ['categorias', cat, 'status']);
      status.classList.remove('feito', 'na');
      if (st === 'feito') { status.textContent = 'Feito'; status.classList.add('feito'); }
      else if (st === 'na') { status.textContent = 'N/A'; status.classList.add('na'); }
      else { status.textContent = 'Pendente'; }
    }

    const toggle = document.createElement('div');
    toggle.className = 'cat-status-toggle';
    [['feito', 'Feito'], ['na', 'N/A']].forEach(([v, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.v = v;
      btn.textContent = label;
      if (getPath(state, ['categorias', cat, 'status']) === v) btn.classList.add('active');
      btn.addEventListener('click', () => {
        setPath(state, ['categorias', cat, 'status'], v);
        toggle.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        refreshStatusChip();
        fasesWrap.style.display = v === 'feito' ? 'block' : 'none';
        saveState();
      });
      toggle.appendChild(btn);
    });
    body.appendChild(toggle);

    const fasesWrap = document.createElement('div');
    fasesWrap.style.display = getPath(state, ['categorias', cat, 'status']) === 'feito' ? 'block' : 'none';
    FASES_CATEGORIA.forEach((fase) => {
      const row = document.createElement('div');
      row.className = 'fase-row';
      const label = document.createElement('div');
      label.className = 'fase-row__label';
      label.textContent = fase.label;
      row.appendChild(label);
      row.appendChild(createTimePair(['categorias', cat, 'fases', fase.key], () => {}));
      fasesWrap.appendChild(row);
    });
    body.appendChild(fasesWrap);

    head.addEventListener('click', () => item.classList.toggle('open'));

    refreshStatusChip();
    item.appendChild(head);
    item.appendChild(body);
    container.appendChild(item);
  });
}

/* ---------------- Section: Fechamento ---------------- */

function renderFechamento(container) {
  const card = document.createElement('div');
  card.className = 'card';
  FECHAMENTO_FIELDS.forEach((def) => {
    card.appendChild(createField(def, ['fechamento', def.key]));
  });
  container.appendChild(card);
}

/* ---------------- Section: Review ---------------- */

function countFilled(step) {
  if (step.type === 'block') {
    const total = step.block.activities.length;
    const filled = step.block.activities.filter((a) => {
      const p = ['blocks', step.block.key, 'activities', a.id];
      return getPath(state, [...p, 'inicio']) && getPath(state, [...p, 'fim']);
    }).length;
    return `${filled}/${total} atividades`;
  }
  if (step.type === 'categorias') {
    const filled = CATEGORIAS.filter((c) => getPath(state, ['categorias', c, 'status'])).length;
    return `${filled}/${CATEGORIAS.length} categorias`;
  }
  if (step.type === 'fechamento') {
    const total = FECHAMENTO_FIELDS.length;
    const filled = FECHAMENTO_FIELDS.filter((f) => getPath(state, ['fechamento', f.key])).length;
    return `${filled}/${total}`;
  }
  return '';
}

function renderReview(container) {
  const loja = isLoggedIn() ? getLojaObj(loginState.setor, loginState.lojaId) : null;
  if (loja) {
    const idCard = document.createElement('div');
    idCard.className = 'card id-summary';
    idCard.innerHTML = `
      <div class="id-summary__label">Identificação</div>
      <div class="id-summary__value">${loginState.setor} · ${loja.nome}</div>
    `;
    const trocar = document.createElement('button');
    trocar.className = 'link-back';
    trocar.textContent = 'Trocar';
    trocar.addEventListener('click', logout);
    idCard.appendChild(trocar);
    container.appendChild(idCard);
  }

  const card = document.createElement('div');
  card.className = 'card';
  STEPS.forEach((step, idx) => {
    if (step.type === 'review') return;
    const row = document.createElement('div');
    row.className = 'summary-row';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = `${String(idx + 1).padStart(2, '0')}. ${step.title}`;
    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '10px';
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = countFilled(step);
    const jump = document.createElement('button');
    jump.className = 'jump';
    jump.textContent = 'Editar';
    jump.addEventListener('click', () => goToStep(idx));
    right.appendChild(count);
    right.appendChild(jump);
    row.appendChild(name);
    row.appendChild(right);
    card.appendChild(row);
  });
  container.appendChild(card);

  const submitCard = document.createElement('div');
  submitCard.className = 'card';
  const info = document.createElement('p');
  info.className = 'hint';
  info.style.marginBottom = '14px';
  info.textContent = CONFIG.SCRIPT_URL
    ? 'Ao enviar, os dados serão gravados na planilha Google.'
    : 'Envio automático para o Google Sheets ainda será configurado. Por enquanto você pode baixar as respostas em JSON.';
  submitCard.appendChild(info);

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '10px';

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-success';
  submitBtn.style.width = '100%';
  submitBtn.textContent = 'Finalizar e enviar';
  submitBtn.addEventListener('click', submitSurvey);
  btnRow.appendChild(submitBtn);
  submitCard.appendChild(btnRow);

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'btn btn-ghost';
  downloadBtn.style.width = '100%';
  downloadBtn.style.marginTop = '10px';
  downloadBtn.textContent = 'Baixar respostas (JSON)';
  downloadBtn.addEventListener('click', downloadJSON);
  submitCard.appendChild(downloadBtn);

  container.appendChild(submitCard);
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const loja = (state.cadastro.loja || 'loja').replace(/\s+/g, '_');
  const data = state.cadastro.data || new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `tempos_movimentos_${loja}_${data}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Envia um payload ao Apps Script e devolve true só se o servidor confirmou
// (resposta JSON com ok:true) — sem mode:'no-cors', então dá pra saber de
// verdade se gravou na planilha, em vez de torcer às cegas.
async function sendToSheet(payload) {
  if (!CONFIG.SCRIPT_URL) return false;
  try {
    const resp = await fetch(CONFIG.SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    const result = await resp.json().catch(() => null);
    if (!result || !result.ok) console.warn('Apps Script respondeu com erro', result);
    return !!(result && result.ok);
  } catch (e) {
    console.warn('Falha ao enviar ao Apps Script (sem internet?)', e);
    return false;
  }
}

// Reenvia, em segundo plano, visitas que ficaram salvas localmente mas não
// foram confirmadas na planilha (ex: sem internet no momento do envio).
async function flushPendingSubmissions() {
  if (!CONFIG.SCRIPT_URL || (navigator.onLine === false)) return;
  const submissions = JSON.parse(localStorage.getItem(CONFIG.SUBMISSIONS_KEY) || '[]');
  let changed = false;
  for (const sub of submissions) {
    if (!sub.sentOk) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await sendToSheet(sub.payload);
      if (ok) { sub.sentOk = true; changed = true; }
    }
  }
  if (changed) localStorage.setItem(CONFIG.SUBMISSIONS_KEY, JSON.stringify(submissions));
}

async function submitSurvey() {
  const payload = { ...state, meta: { ...state.meta, submittedAt: new Date().toISOString() } };
  if (CONFIG.SUBMIT_TOKEN) payload.token = CONFIG.SUBMIT_TOKEN;

  const sentOk = await sendToSheet(payload);

  const submissions = JSON.parse(localStorage.getItem(CONFIG.SUBMISSIONS_KEY) || '[]');
  submissions.push({ payload, sentOk });
  localStorage.setItem(CONFIG.SUBMISSIONS_KEY, JSON.stringify(submissions));
  localStorage.removeItem(CONFIG.STORAGE_KEY);

  showDoneScreen(sentOk);
}

function showDoneScreen(sentOk) {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'done-screen';

  let statusMsg;
  if (!CONFIG.SCRIPT_URL) {
    statusMsg = 'Suas respostas foram salvas neste dispositivo.';
  } else if (sentOk) {
    statusMsg = 'Suas respostas foram salvas e enviadas para a planilha.';
  } else {
    statusMsg = 'Suas respostas foram salvas neste dispositivo. Não foi possível confirmar o envio agora — o app tenta de novo sozinho na próxima vez que abrir com internet.';
  }

  wrap.innerHTML = `
    <div class="done-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </div>
    <h1>Pesquisa registrada</h1>
    <p>${statusMsg}</p>
  `;
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.style.width = '100%';
  btn.textContent = 'Iniciar nova visita';
  btn.addEventListener('click', () => {
    state = defaultState();
    applyLoginToState();
    currentStep = 0;
    boot();
  });
  wrap.appendChild(btn);
  main.appendChild(wrap);
  document.querySelector('.bottombar').style.display = 'none';
  document.querySelector('.topbar').style.display = 'none';
}

/* ---------------- Navigation & shell ---------------- */

let currentStep = state.meta.currentStep || 0;

function goToStep(idx) {
  currentStep = Math.max(0, Math.min(STEPS.length - 1, idx));
  state.meta.currentStep = currentStep;
  saveState();
  render();
  document.getElementById('main').scrollTo?.(0, 0);
  window.scrollTo(0, 0);
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1400);
}

function render() {
  const step = STEPS[currentStep];
  const total = STEPS.length;

  document.getElementById('step-badge').textContent = `Etapa ${currentStep + 1} de ${total}`;
  document.getElementById('progress-fill').style.width = `${((currentStep + 1) / total) * 100}%`;
  document.getElementById('stepper-label').textContent = step.title;

  const storeEl = document.getElementById('topbar-store');
  const loja = isLoggedIn() ? getLojaObj(loginState.setor, loginState.lojaId) : null;
  if (loja) {
    storeEl.style.display = 'flex';
    storeEl.innerHTML = `<span class="topbar__store-name">${loja.nome}</span><button type="button" class="topbar__store-change" id="btn-trocar-loja">Trocar</button>`;
    document.getElementById('btn-trocar-loja').addEventListener('click', logout);
  } else {
    storeEl.style.display = 'none';
  }

  const main = document.getElementById('main');
  main.innerHTML = '';

  const headWrap = document.createElement('div');
  headWrap.className = 'section-head';
  headWrap.innerHTML = `
    <h1>${step.title}</h1>
    <p>${step.subtitle || ''}</p>
  `;
  main.appendChild(headWrap);

  if (step.type === 'block') renderBlock(main, step.block);
  else if (step.type === 'categorias') renderCategorias(main);
  else if (step.type === 'fechamento') renderFechamento(main);
  else if (step.type === 'review') renderReview(main);

  const backBtn = document.getElementById('btn-back');
  const nextBtn = document.getElementById('btn-next');
  backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.style.display = step.type === 'review' ? 'none' : 'flex';
  nextBtn.textContent = currentStep === STEPS.length - 2 ? 'Ir para revisão' : 'Próximo';
}

function init() {
  document.getElementById('btn-back').addEventListener('click', () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) goToStep(currentStep + 1);
  });
  boot();
}

document.addEventListener('DOMContentLoaded', init);
