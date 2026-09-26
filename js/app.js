import { LANGS, lang, setLang, t, L, SWITCH_INVITE } from './i18n.js';
import { TYPES, typeText, fieldOptions, extractSystemInstruction } from './templates.js';
import { PROVIDERS, callLLM, parseJSONLoose } from './providers.js';
import { SAMPLES, CREDITS, REFERENCED_ONLY, CONTAMINATION_TESTS, sanitize, creditLine, CC_BY } from './samples.js';
import { GUIDE, CREDITS_TEXT as CT } from './content.js';
import { renderMarkdown } from './markdown.js';
import { download, mcqToMarkdown, mcqToGIFT, mcqToCSV, validateMCQ } from './exporters.js';

// ---------- 状態 ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem('medu:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('medu:' + k, JSON.stringify(v)); } catch (e) { /* 保存できない環境では何もしない */ } },
  del(k) { try { localStorage.removeItem('medu:' + k); } catch (e) { /* noop */ } }
};

const settings = {
  provider: store.get('provider', 'demo'),
  model: store.get('model', PROVIDERS[store.get('provider', 'demo')]?.model || 'demo'),
  apiKey: store.get('apiKey', ''),
  remember: store.get('remember', false)
};
const outputs = {};   // `${lang}:${typeId}` -> { md, items, meta }
const formVals = store.get('forms', {});
const chats = {};

const $ = (sel, el = document) => el.querySelector(sel);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v !== null && v !== undefined) el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c !== '' && c !== null && c !== undefined) el.append(c instanceof Node ? c : document.createTextNode(String(c))); });
  return el;
};
const toneClass = x => 'tone-' + (x || 'teal');
const okey = id => `${lang}:${id}`;
const siteUrl = () => location.origin + location.pathname;

// ---------- 画面の固定部分 ----------
function renderChrome() {
  document.documentElement.lang = LANGS.find(l => l.code === lang).html;
  document.title = t('brand_title');
  $('#brand-title').textContent = t('brand_title');
  $('#brand-sub').textContent = t('brand_sub');
  $('#btn-settings-label').textContent = t('settings');
  $('#provider-badge').textContent = settings.provider === 'demo' ? t('demo') : settings.provider;

  const sw = $('#lang-switch');
  sw.innerHTML = '';
  sw.setAttribute('aria-label', t('language'));
  LANGS.forEach(l => sw.append(h('button', { type: 'button', class: 'lang-btn', lang: l.html, 'aria-pressed': l.code === lang ? 'true' : 'false', onclick: () => changeLang(l.code) }, l.native)));

  const f = $('#footer');
  f.innerHTML = '';
  f.append(
    h('div', { class: 'row center' },
      h('a', { href: CC_BY.url, rel: 'license', target: '_blank', class: 'cc-badge' }, 'CC BY 4.0'),
      h('span', {}, t('footer_content')),
      h('a', { href: '#credits' }, t('footer_more'))),
    h('div', {}, t('footer_code'), ' ・ ', t('footer_review')));

  // 設定ダイアログの文言
  $('#set-h').textContent = t('set_h');
  $('#lbl-provider').firstChild.textContent = t('set_provider');
  $('#lbl-model').firstChild.textContent = t('set_model');
  $('#set-model-help').textContent = t('set_model_help');
  $('#lbl-key').firstChild.textContent = t('set_key');
  $('#set-key').placeholder = t('set_key_ph');
  $('#set-remember-label').textContent = t('set_remember');
  $('#set-notice').innerHTML = t('set_notice');
  $('#btn-save').textContent = t('save');
  $('#btn-close').textContent = t('close');
  const sel = $('#set-provider');
  sel.innerHTML = '';
  Object.entries(PROVIDERS).forEach(([k, p]) => sel.append(h('option', { value: k }, t(p.labelKey))));
}

function changeLang(code) {
  if (code === lang) return;
  setLang(code);
  const u = new URL(location.href);
  u.searchParams.set('lang', code);
  history.replaceState(null, '', u);
  renderChrome();
  route();
}

// ---------- ナビ ----------
function renderNav(active) {
  const nav = $('#nav');
  nav.innerHTML = '';
  const item = (hash, label, num, tone) => h('button', { type: 'button', 'aria-current': active === hash ? 'page' : false, onclick: () => { location.hash = hash; } },
    h('span', { class: 'num ' + toneClass(tone) }, num), label);
  nav.append(item('#home', t('nav_home'), '⌂', 'dark'));
  nav.append(h('div', { class: 'sep' }));
  TYPES.forEach(ty => nav.append(item('#t/' + ty.id, typeText(ty).name, ty.no, ty.tone)));
  nav.append(h('div', { class: 'sep' }));
  nav.append(item('#samples', t('nav_samples'), '§', 'dark'));
  nav.append(item('#guide', t('nav_guide'), '?', 'dark'));
  nav.append(item('#credits', t('nav_credits'), '©', 'dark'));
}

// ---------- 画面 ----------
function langBanner() {
  return h('section', { class: 'lang-banner', 'aria-labelledby': 'lang-banner-h' },
    h('h2', { id: 'lang-banner-h' }, '🌐 ', t('lang_banner_h')),
    h('p', {}, t('lang_banner_p')),
    h('div', { class: 'lang-cards' }, LANGS.map(l => h('button', {
      type: 'button', class: 'lang-card', lang: l.html, 'aria-pressed': l.code === lang ? 'true' : 'false', onclick: () => changeLang(l.code)
    }, h('strong', {}, l.native), h('span', {}, SWITCH_INVITE[l.code])))));
}

function viewHome() {
  const main = $('#main');
  main.innerHTML = '';
  main.append(
    langBanner(),
    h('h1', {}, t('home_h1')),
    h('p', { class: 'lead' }, t('home_lead')),
    h('div', { class: 'cards' }, TYPES.map(ty => {
      const tt = typeText(ty);
      return h('div', { class: 'card link', tabindex: 0, role: 'link', onclick: () => { location.hash = '#t/' + ty.id; }, onkeydown: e => { if (e.key === 'Enter') location.hash = '#t/' + ty.id; } },
        h('div', { class: 'row' }, h('span', { class: 'pill ' + toneClass(ty.tone) }, t('content_n', { n: ty.no })), h('span', { class: 'lic' }, t('cq_badge', { cq: ty.cq, c: tt.certainty }))),
        h('h3', {}, tt.name), h('p', {}, tt.desc));
    })),
    h('h2', {}, t('home_steps_h')),
    h('ol', {}, t('steps').map(s => h('li', {}, s))),
    h('p', { class: 'notice' }, t('home_demo_note'))
  );
}

function viewSamples() {
  const main = $('#main');
  main.innerHTML = '';
  main.append(h('h1', {}, t('samples_h1')), h('p', { class: 'lead' }, t('samples_lead')));
  TYPES.forEach(ty => {
    const list = SAMPLES.filter(s => s.type === ty.id);
    main.append(h('h2', {}, `${ty.no}. ${typeText(ty).name}`));
    main.append(list.length ? h('div', { class: 'cards' }, list.map(sampleCard)) : h('p', {}, t('none')));
  });
  main.append(h('div', { id: 'sample-view' }), h('div', { id: 'chat' }));
}

function sampleCard(s) {
  const nd = /ND/.test(s.license), ok = /CC|MIT/.test(s.license) && s.verified;
  return h('div', { class: 'card sample' },
    h('div', {}, h('span', { class: 'lic ' + (ok ? 'ok' : 'warn') }, s.license), s.verified ? '' : h('span', { class: 'lic warn' }, t('unverified')), nd ? h('span', { class: 'lic warn' }, t('nd')) : ''),
    h('h3', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title)),
    h('p', {}, `${s.by}｜${s.venue}${s.year ? '｜' + s.year : ''}`),
    h('p', {}, L(s.what)),
    h('p', {}, h('strong', {}, t('how_to_use')), L(s.use)),
    s.loadable ? h('div', { class: 'row' }, h('button', { class: 'btn accent', type: 'button', onclick: () => openSample(s) }, L(s.loadable.label))) : '');
}

function openSample(s) {
  let view = $('#sample-view');
  if (!view) { view = h('div', { id: 'sample-view' }); $('#main').append(view); }
  let chatBox = $('#chat');
  if (!chatBox) { chatBox = h('div', { id: 'chat' }); $('#main').append(chatBox); }
  view.innerHTML = '';
  const Ld = s.loadable;
  const text = Ld.text();
  const cite = creditLine(s.credit);
  const withCite = `${text}\n\n---\n${t('source_label')}: ${cite}`;
  const box = h('div', { class: 'output' },
    h('h2', {}, L(Ld.label)),
    h('p', { class: 'notice' }, h('strong', {}, t('attribution')), cite),
    h('div', { class: 'row toolbar' },
      h('button', { class: 'btn', type: 'button', onclick: () => copyText(withCite, t('copied_cite')) }, t('copy_cite')),
      h('button', { class: 'btn', type: 'button', onclick: () => download(`sample-${s.credit}-${lang}.txt`, withCite) }, t('save_txt')),
      Ld.kind === 'patient' ? h('button', { class: 'btn accent', type: 'button', onclick: () => openChatWith('patient', text, chatBox, t('chat_sample_patient')) }, t('chat_with_sample')) : ''),
    h('div', { class: 'md' }, h('pre', {}, text)));
  view.append(box);
  box.scrollIntoView({ behavior: 'smooth' });
}

function viewGuide() {
  const main = $('#main');
  main.innerHTML = '';
  main.append(h('div', { class: 'md', html: renderMarkdown(GUIDE[lang]) }));
}

function viewCredits() {
  const main = $('#main');
  main.innerHTML = '';
  const dl = rows => h('dl', { class: 'credit' }, rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
  main.append(
    h('h1', {}, L(CT.h1)),
    h('section', { class: 'output' },
      h('h2', {}, L(CT.site_h)),
      h('p', {}, h('a', { href: CC_BY.url, rel: 'license', target: '_blank', class: 'cc-badge big' }, 'CC BY 4.0'), ' ', L(CT.site_p)),
      h('h3', {}, L(CT.site_attr_h)),
      h('pre', { class: 'attr' }, L(CT.site_attr).replace('{url}', siteUrl())),
      h('p', {}, L(CT.code_p))),
    h('h2', {}, L(CT.incorporated_h)),
    ...CREDITS.map(c => h('section', { class: 'card credit-card' },
      dl([
        [L(CT.lbl_title), c.title],
        [L(CT.lbl_authors), c.authors],
        [L(CT.lbl_source), h('span', {}, c.source, ' ', h('a', { href: c.doi, target: '_blank', rel: 'noopener noreferrer' }, c.doi))],
        [L(CT.lbl_license), h('a', { href: c.license.url, target: '_blank', rel: 'noopener noreferrer' }, c.license.name)],
        [L(CT.lbl_used), L(c.used)],
        [L(CT.lbl_changes), L(c.changes)]
      ]))),
    h('h2', {}, L(CT.referenced_h)),
    ...REFERENCED_ONLY.map(r => h('section', { class: 'card credit-card' },
      dl([
        [L(CT.lbl_title), h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.title)],
        [L(CT.lbl_authors), r.authors],
        [L(CT.lbl_license), h('a', { href: r.license.url, target: '_blank', rel: 'noopener noreferrer' }, r.license.name)],
        ['', L(r.note)]
      ]))),
    h('p', { class: 'lead' }, L(CT.disclaimer))
  );
}

function viewType(id) {
  const ty = TYPES.find(x => x.id === id);
  if (!ty) return viewHome();
  const tt = typeText(ty);
  const main = $('#main');
  main.innerHTML = '';
  const vals = formVals[id] || {};

  const form = h('form', { class: 'gen', onsubmit: e => { e.preventDefault(); generate(ty, form); } });
  ty.fields.forEach(f => {
    let input;
    if (f.type === 'select') input = h('select', { name: f.key }, fieldOptions(f).map(o => h('option', { value: o, selected: vals[f.key] === o }, o)));
    else if (f.type === 'textarea') { input = h('textarea', { name: f.key, placeholder: L(f.placeholder) || '' }); input.value = vals[f.key] || ''; }
    else input = h('input', { type: 'text', name: f.key, placeholder: L(f.placeholder) || '', value: vals[f.key] || '' });
    form.append(h('label', {}, h('span', {}, L(f.label), f.required ? h('span', { class: 'req' }, t('required')) : ''), input));
  });
  form.append(h('div', { class: 'row' },
    h('button', { class: 'btn primary', type: 'submit', id: 'btn-gen' }, t('btn_generate')),
    h('button', { class: 'btn ghost', type: 'button', onclick: () => showPrompt(ty, form) }, t('btn_show_prompt')),
    h('span', { class: 'lic' }, t('using_ai', { v: settings.provider === 'demo' ? t('demo') : settings.provider + ' / ' + settings.model }))));

  main.append(
    h('div', { class: 'pills' }, h('span', { class: 'pill ' + toneClass(ty.tone) }, t('content_n', { n: ty.no })), h('span', { class: 'pill tone-dark' }, t('cq_badge', { cq: ty.cq, c: tt.certainty }))),
    h('h1', {}, tt.name),
    h('p', { class: 'lead' }, tt.desc),
    form,
    h('div', { id: 'status', class: 'status', role: 'status', 'aria-live': 'polite' }),
    h('div', { id: 'out' }),
    h('div', { id: 'chat' })
  );
  const related = SAMPLES.filter(s => s.type === id);
  if (related.length) main.append(h('h2', {}, t('related')), h('div', { class: 'cards' }, related.map(sampleCard)), h('div', { id: 'sample-view' }));
  if (outputs[okey(id)]) renderOutput(ty);
}

function readForm(ty, form) {
  const v = {};
  ty.fields.forEach(f => { v[f.key] = (form.elements[f.key].value || '').trim(); });
  formVals[ty.id] = v;
  store.set('forms', formVals);
  return v;
}

function showPrompt(ty, form) {
  const p = ty.build(readForm(ty, form));
  const out = $('#out');
  out.innerHTML = '';
  const box = h('div', { class: 'output md', html: renderMarkdown(`### ${t('prompt_system')}\n\`\`\`\n${p.system}\n\`\`\`\n### ${t('prompt_user')}\n\`\`\`\n${p.user}\n\`\`\``) });
  out.append(box);
  bindCopy(box);
}

async function generate(ty, form) {
  const v = readForm(ty, form);
  const missing = ty.fields.filter(f => f.required && !v[f.key]).map(f => L(f.label));
  const status = $('#status');
  if (missing.length) { status.className = 'status error'; status.textContent = t('missing', { v: missing.join(', ') }); return; }
  const btn = $('#btn-gen');
  btn.disabled = true;
  status.className = 'status';
  status.textContent = t('generating');
  try {
    const p = ty.build(v);
    const text = await callLLM({ ...settings, system: p.system, messages: [{ role: 'user', content: p.user }], json: p.json, typeId: ty.id });
    const meta = { provider: settings.provider, model: settings.provider === 'demo' ? 'demo' : settings.model, date: new Date().toISOString(), lang };
    if (ty.id === 'mcq') {
      const items = validateMCQ(parseJSONLoose(text));
      outputs[okey(ty.id)] = { md: mcqToMarkdown(items), items, meta };
    } else {
      outputs[okey(ty.id)] = { md: text, meta };
    }
    status.textContent = t('generated');
    renderOutput(ty);
  } catch (e) {
    status.className = 'status error';
    status.textContent = e.message;
  } finally {
    btn.disabled = false;
  }
}

function fileHeader(ty, o) {
  return `<!-- ${t('brand_title')} | ${typeText(ty).name} | ${o.meta.provider}/${o.meta.model} | ${o.meta.date} | ${siteUrl()} -->\n\n`;
}

function renderOutput(ty) {
  const o = outputs[okey(ty.id)];
  const out = $('#out');
  out.innerHTML = '';
  const base = `${ty.id}-${lang}-${o.meta.date.slice(0, 10)}`;
  const tools = h('div', { class: 'row toolbar' },
    h('button', { class: 'btn', type: 'button', onclick: () => copyText(o.md, t('copied')) }, t('copy')),
    h('button', { class: 'btn', type: 'button', onclick: () => download(base + '.md', fileHeader(ty, o) + o.md, 'text/markdown') }, t('save_md')),
    h('button', { class: 'btn', type: 'button', onclick: () => download(base + '.json', JSON.stringify({ type: ty.id, meta: o.meta, input: formVals[ty.id], output: o.items || o.md }, null, 2), 'application/json') }, t('save_json')));
  if (ty.id === 'mcq') {
    tools.append(
      h('button', { class: 'btn', type: 'button', onclick: () => download(base + '.gift.txt', mcqToGIFT(o.items, 'MCQ')) }, t('gift')),
      h('button', { class: 'btn', type: 'button', onclick: () => download(base + '.csv', mcqToCSV(o.items), 'text/csv') }, t('csv')));
  }
  if (ty.chat) tools.append(h('button', { class: 'btn accent', type: 'button', onclick: () => openChat(ty) }, t('try_chat')));
  tools.append(h('span', { class: 'lic' }, `${o.meta.provider} / ${o.meta.model} | ${new Date(o.meta.date).toLocaleString(document.documentElement.lang)}`));

  const body = h('div', { class: 'md', html: renderMarkdown(o.md) });
  bindCopy(body);
  const cl = h('div', { class: 'checklist' }, h('h3', {}, t('checklist_h')),
    t('checks').map(([k, d]) => h('label', {}, h('input', { type: 'checkbox' }), h('span', {}, h('strong', {}, k + ': '), d))));
  out.append(h('div', { class: 'output' }, tools, body, cl));
}

function bindCopy(root) {
  root.querySelectorAll('.copy-code').forEach(b => {
    b.textContent = t('copy');
    b.addEventListener('click', () => copyText(b.nextElementSibling.textContent, t('copied')));
  });
}

async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); flash(msg); }
  catch (e) {
    const ta = h('textarea'); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); flash(msg); } catch (e2) { flash(t('copy_failed')); }
    ta.remove();
  }
}

function flash(msg) {
  const s = $('#status');
  if (s) { s.className = 'status'; s.textContent = msg; }
}

// ---------- 対話で試す ----------
function openChat(ty) {
  const o = outputs[okey(ty.id)];
  openChatWith(ty.id, extractSystemInstruction(o.md) || o.md, $('#chat'), ty.id === 'patient' ? t('chat_patient') : t('chat_tutor'));
}

function openChatWith(typeId, sys, wrap, heading) {
  chats[typeId] = { system: sys, messages: [] };
  wrap.innerHTML = '';
  const sysBox = h('textarea', { rows: 8, 'aria-label': t('sys_toggle') });
  sysBox.value = sys;
  const log = h('div', { class: 'chat-log', 'aria-live': 'polite' }, h('div', { class: 'msg system' }, typeId === 'patient' ? t('kick_patient') : t('kick_tutor')));
  const input = h('textarea', { rows: 2, placeholder: typeId === 'patient' ? t('ph_patient') : t('ph_tutor') });
  const send = h('button', { class: 'btn primary', type: 'button' }, t('send'));
  const reset = h('button', { class: 'btn ghost', type: 'button' }, t('reset'));
  const guard = h('input', { type: 'checkbox' });

  const add = (role, text) => {
    const el = h('div', { class: 'msg ' + role });
    if (role === 'assistant') el.innerHTML = renderMarkdown(text); else el.textContent = text;
    log.append(el); log.scrollTop = log.scrollHeight;
  };
  send.addEventListener('click', async () => {
    let text = input.value.trim();
    if (!text) return;
    if (guard.checked) {
      const r = sanitize(text);
      if (r.removed) { add('system', t('sanitized')); text = r.text || '…'; }
    }
    const c = chats[typeId];
    c.system = sysBox.value;
    c.messages.push({ role: 'user', content: text });
    add('user', text);
    input.value = '';
    send.disabled = true;
    try {
      const reply = await callLLM({ ...settings, system: c.system, messages: c.messages, temperature: 0.7, typeId, mode: 'chat' });
      c.messages.push({ role: 'assistant', content: reply });
      add('assistant', reply);
    } catch (e) {
      c.messages.pop();
      add('system', t('error') + e.message);
    } finally { send.disabled = false; input.focus(); }
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send.click(); });
  reset.addEventListener('click', () => openChatWith(typeId, sysBox.value, wrap, heading));

  const tests = typeId === 'patient' ? h('details', {},
    h('summary', {}, t('contam_summary')),
    h('p', {}, t('contam_desc')),
    h('div', { class: 'row' }, (CONTAMINATION_TESTS[lang] || CONTAMINATION_TESTS.en).map(ct => h('button', { class: 'btn', type: 'button', onclick: () => { input.value = (input.value || t('contam_default_q')) + ct.text; input.focus(); } }, t('contam_add', { v: ct.label })))),
    h('label', { class: 'check' }, guard, t('guard'))) : '';

  wrap.append(h('div', { class: 'chat' },
    h('h2', {}, heading),
    h('p', { class: 'lead' }, t('chat_lead')),
    h('details', {}, h('summary', {}, t('sys_toggle')), sysBox),
    tests, log, input, h('div', { class: 'row' }, send, reset)));
  wrap.scrollIntoView({ behavior: 'smooth' });
}

// ---------- 設定 ----------
function initSettings() {
  const dlg = $('#dlg-settings');
  const sel = $('#set-provider');
  const linkKey = () => {
    const p = PROVIDERS[sel.value];
    const el = $('#key-link');
    el.innerHTML = '';
    if (p.keyUrl) el.append(t('key_where'), h('a', { href: p.keyUrl, target: '_blank', rel: 'noopener noreferrer' }, p.keyUrl));
    else el.append(t('key_demo'));
  };
  sel.addEventListener('change', () => { $('#set-model').value = PROVIDERS[sel.value].model; linkKey(); });
  $('#btn-settings').addEventListener('click', () => {
    sel.value = settings.provider;
    $('#set-model').value = settings.model;
    $('#set-key').value = settings.apiKey;
    $('#set-remember').checked = settings.remember;
    linkKey();
    dlg.showModal();
  });
  $('#settings-form').addEventListener('submit', e => {
    if (e.submitter && e.submitter.value !== 'save') return;
    settings.provider = sel.value;
    settings.model = $('#set-model').value.trim() || PROVIDERS[sel.value].model;
    settings.apiKey = $('#set-key').value.trim();
    settings.remember = $('#set-remember').checked;
    store.set('provider', settings.provider);
    store.set('model', settings.model);
    store.set('remember', settings.remember);
    if (settings.remember) store.set('apiKey', settings.apiKey); else store.del('apiKey');
    renderChrome();
    route();
  });
}

// ---------- ルーティング ----------
function route() {
  const hash = location.hash || '#home';
  const m = hash.match(/^#t\/(\w+)/);
  renderNav(m ? '#t/' + m[1] : hash);
  if (m) viewType(m[1]);
  else if (hash === '#samples') viewSamples();
  else if (hash === '#guide') viewGuide();
  else if (hash === '#credits') viewCredits();
  else viewHome();
  $('#main').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
renderChrome();
initSettings();
route();
