// Remedios — lógica de la app.
// Los datos de la receta están en receta.js; aquí no hace falta tocar nada para cambiarlos.
(() => {
'use strict';

const VERSION = '2.0';
const R = window.RECETA;
const MEDS = R.remedios;
const LS = 'remedios-amparo-v1';      // se mantiene la clave para no perder lo ya marcado
const LS_THEME = 'remedios-tema';
const LATE_MIN = 30;                  // minutos de tolerancia antes de marcar en rojo

// ── Utilidades ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const dkey = t => t.getFullYear() + pad(t.getMonth() + 1) + pad(t.getDate());
const hhmm = t => pad(t.getHours()) + ':' + pad(t.getMinutes());
const WD = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WDL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fdate = t => WD[t.getDay()] + ' ' + t.getDate() + ' ' + MO[t.getMonth()];
const fdateLong = t => WDL[t.getDay()] + ' ' + t.getDate() + ' de ' + MO[t.getMonth()];
const RX = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/;
function parseStart(s) {
  const m = RX.exec(s || '') || RX.exec(R.inicio);
  return new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5]);
}
function rel(t, now) {
  const m = Math.round((t - now) / 60000), a = Math.abs(m), h = Math.floor(a / 60), r = a % 60;
  if (a < 1) return 'ahora';
  const s = ((h ? h + ' h ' : '') + (r || !h ? r + ' min' : '')).trim();
  return m >= 0 ? 'en ' + s : 'hace ' + s;
}

// ── Estado ────────────────────────────────────────────────────
let state = { start: R.inicio, done: {} };
let selDay = null, undoSnap = null;
const notified = new Set();

// ── Calendario de tomas ───────────────────────────────────────
let DOSES = [], SLOTS = [], DAYS = [];
function build() {
  const st = parseStart(state.start);
  DOSES = [];
  for (const m of MEDS) {
    const total = m.days * m.h.length, hours = [...m.h].sort((a, b) => a - b);
    const day = new Date(st.getFullYear(), st.getMonth(), st.getDate());
    let c = 0, guard = 0;
    m.list = [];
    while (c < total && guard++ < 400) {
      for (const h of hours) {
        const t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h);
        if (t >= st && c < total) {
          const d = { id: m.id + '-' + dkey(t) + '-' + pad(h), m, t };
          DOSES.push(d); m.list.push(d); c++;
        }
      }
      day.setDate(day.getDate() + 1);
    }
  }
  const map = new Map();
  for (const d of DOSES) {
    const k = d.t.getTime();
    if (!map.has(k)) map.set(k, { t: d.t, items: [] });
    map.get(k).items.push(d);
  }
  SLOTS = [...map.values()].sort((a, b) => a.t - b.t);
  for (const s of SLOTS) s.items.sort((a, b) => (a.m.o || 9) - (b.m.o || 9));
  const dm = new Map();
  for (const s of SLOTS) {
    const k = dkey(s.t);
    if (!dm.has(k)) dm.set(k, { k, t: new Date(s.t.getFullYear(), s.t.getMonth(), s.t.getDate()), slots: [] });
    dm.get(k).slots.push(s);
  }
  DAYS = [...dm.values()];
}
const isDone = d => !!state.done[d.id];
const slotDone = s => s.items.every(isDone);
const isLate = (d, now) => !isDone(d) && d.t < now - LATE_MIN * 60000;

// ── Pintar ────────────────────────────────────────────────────
const ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';
function pill(d, now) {
  const on = isDone(d), late = isLate(d, now);
  const label = `${d.m.n}, ${d.m.d}${on ? ', dado' : late ? ', atrasado' : ''}`;
  return `<button type="button" class="pill${on ? ' on' : ''}${late ? ' late' : ''}" data-id="${d.id}" aria-pressed="${on}" aria-label="${label}">`
    + `<span class="ck">${ICON}</span>`
    + `<span><span class="nm">${d.m.o ? `<span class="ord">${d.m.o}º</span>` : ''}${d.m.n}</span><span class="dt">${d.m.d}</span></span>`
    + (on ? `<span class="gv">dado<br>${hhmm(new Date(state.done[d.id]))}</span>` : late ? `<span class="gv" style="color:var(--lateInk)">atrasado</span>` : '')
    + `</button>`;
}

function renderHeader() {
  const total = DOSES.length, done = DOSES.filter(isDone).length;
  $('pbar').style.width = (total ? done / total * 100 : 0) + '%';
  $('pbarWrap').setAttribute('aria-valuenow', Math.round(total ? done / total * 100 : 0));
  $('ptxt').textContent = `${done} de ${total} tomas`;
}

function renderNext(now) {
  const pend = SLOTS.filter(s => !slotDone(s));
  const focus = pend.find(s => s.t >= now - 3 * 3600000);
  const older = pend.filter(s => s.t < now - 3 * 3600000 && s !== focus)
    .reduce((n, s) => n + s.items.filter(d => !isDone(d)).length, 0);
  const olderBtn = older ? `<button class="link note" type="button" data-jump="late">${older} ${older === 1 ? 'toma anterior' : 'tomas anteriores'} sin marcar · ver</button>` : '';
  const nx = $('next');
  if (!focus) {
    nx.className = 'next';
    nx.innerHTML = `<div class="lbl">Próxima toma</div><div class="big">${older ? 'Casi' : '¡Listo!'}</div>`
      + `<p class="when">${older ? 'Quedan tomas antiguas sin marcar.' : 'Tratamiento completo. ¡Bien hecho!'}</p>${olderBtn}`;
    return;
  }
  const late = focus.t < now;
  const pending = focus.items.filter(d => !isDone(d)).length;
  nx.className = 'next' + (late ? ' late' : '');
  nx.innerHTML = `<div class="lbl">${late ? 'Toma pendiente' : 'Próxima toma'}</div>`
    + `<div class="row"><span class="big">${hhmm(focus.t)}</span><p class="when">${fdate(focus.t)} · ${rel(focus.t, now)}</p></div>`
    + `<div class="items">${focus.items.map(d => pill(d, now)).join('')}</div>`
    + `<div class="actions"><button class="btn" type="button" data-all="${focus.t.getTime()}">${pending > 1 ? `Marcar los ${pending} como dados` : 'Marcar como dado'}</button></div>`
    + olderBtn;
}

function renderDays(now) {
  const tk = dkey(now);
  if (!selDay || !DAYS.find(d => d.k === selDay))
    selDay = (DAYS.find(d => d.k === tk) || (now < DAYS[0].t ? DAYS[0] : DAYS[DAYS.length - 1])).k;
  $('days').innerHTML = DAYS.map(d => {
    const its = d.slots.flatMap(s => s.items), dn = its.filter(isDone).length, hl = its.some(x => isLate(x, now));
    return `<button type="button" role="tab" class="day${d.k === selDay ? ' sel' : ''}${d.k === tk ? ' today' : ''}${hl ? ' hasLate' : ''}" data-day="${d.k}" aria-selected="${d.k === selDay}" aria-label="${fdateLong(d.t)}, ${dn} de ${its.length} tomas">`
      + `<small>${d.k === tk ? 'hoy' : WD[d.t.getDay()]}</small><b>${d.t.getDate()}</b><small>${MO[d.t.getMonth()]}</small>`
      + `<span class="mini"><i style="width:${dn / its.length * 100}%"></i></span></button>`;
  }).join('');

  const day = DAYS.find(d => d.k === selDay);
  const its = day.slots.flatMap(s => s.items), dn = its.filter(isDone).length;
  const nowSlot = SLOTS.find(s => !slotDone(s) && s.t >= now - 3 * 3600000);
  const showToday = selDay !== tk && DAYS.some(d => d.k === tk);
  $('dayview').innerHTML =
    `<div class="dayhead"><p><b>${fdateLong(day.t)}</b> · ${dn} de ${its.length} tomas</p>${showToday ? '<button class="link" type="button" data-today>Ir a hoy →</button>' : ''}</div>`
    + day.slots.map(s => {
      const nasal = s.items.filter(d => d.m.o).length > 1;
      return `<div class="slot${s === nowSlot ? ' now' : s.t < now ? ' past' : ''}">`
        + `<div class="time">${hhmm(s.t)}${nasal ? '<small>nasales en orden</small>' : ''}</div>`
        + `<div><div class="items" style="margin-top:0">${s.items.map(d => pill(d, now)).join('')}</div>`
        + (slotDone(s) || s.items.length < 2 ? '' : `<button class="link" type="button" data-all="${s.t.getTime()}">Marcar todo ${hhmm(s.t)}</button>`)
        + `</div></div>`;
    }).join('');
}

function renderSummary() {
  const nasal = MEDS.filter(m => m.o).sort((a, b) => a.o - b.o);
  $('tip').innerHTML = nasal.length > 1
    ? `<b>Nasales en orden:</b> ${nasal.map(m => `${m.o}º ${m.n}`).join(' → ')}. Los números aparecen junto a cada remedio.`
    : 'Toca cada remedio cuando se lo des.';
  $('sum').tBodies[0].innerHTML = MEDS.map(m => {
    const dn = m.list.filter(isDone).length, last = m.list[m.list.length - 1].t, ended = last < new Date();
    return `<tr${ended ? ' class="fin"' : ''}>`
      + `<td data-l="Remedio"><b>${m.n}</b></td><td data-l="Dosis">${m.d}</td>`
      + `<td data-l="Horario">${m.h.map(h => pad(h) + ':00').join(' · ')}</td>`
      + `<td data-l="Días" class="n">${m.days}</td><td data-l="Termina">${fdate(last)}${ended ? ' ✓' : ''}</td>`
      + `<td data-l="Avance" class="n">${dn}/${m.list.length}<span class="tbar"><i style="width:${dn / m.list.length * 100}%"></i></span></td></tr>`;
  }).join('');
}

function render() {
  const now = new Date();
  renderHeader(); renderNext(now); renderDays(now); renderSummary();
}
function scrollDay() {
  // Centra el día elegido moviendo solo la tira de días, no la página
  const el = document.querySelector('.day.sel'), box = $('days');
  if (el) box.scrollLeft = el.offsetLeft - box.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
}

// ── Guardar ───────────────────────────────────────────────────
function save() {
  try {
    localStorage.setItem(LS, JSON.stringify(state));
    $('status').textContent = 'Guardado en este teléfono · ' + hhmm(new Date());
  } catch (e) {
    $('status').textContent = 'No se pudo guardar (¿modo privado?). Las marcas se perderán al cerrar.';
  }
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || 'null');
    if (s && typeof s === 'object' && s.done && typeof s.done === 'object') state = { start: s.start || R.inicio, done: s.done };
  } catch (e) {}
}

// ── Acciones ──────────────────────────────────────────────────
function commit(msg) {
  render(); save();
  if (msg) toast(msg, () => { if (undoSnap) { state.done = undoSnap; undoSnap = null; render(); save(); toast('Listo, se deshizo'); } });
}
function snapshot() { undoSnap = { ...state.done }; }
function toggle(id) {
  const d = DOSES.find(x => x.id === id); if (!d) return;
  snapshot();
  if (state.done[id]) { delete state.done[id]; commit(d.m.n + ' desmarcado'); }
  else { state.done[id] = Date.now(); commit(d.m.n + ' dado ✓'); }
}
function markAll(ts) {
  const s = SLOTS.find(x => x.t.getTime() === +ts); if (!s) return;
  snapshot();
  const now = Date.now(); let n = 0;
  for (const d of s.items) if (!state.done[d.id]) { state.done[d.id] = now; n++; }
  commit(n === 1 ? '1 remedio marcado' : `${n} remedios marcados`);
}

document.addEventListener('click', e => {
  const t = e.target;
  const p = t.closest('[data-id]'); if (p) return toggle(p.dataset.id);
  const a = t.closest('[data-all]'); if (a) return markAll(a.dataset.all);
  const d = t.closest('[data-day]'); if (d) { selDay = d.dataset.day; render(); scrollDay(); return; }
  if (t.closest('[data-today]')) { selDay = dkey(new Date()); render(); scrollDay(); return; }
  if (t.closest('[data-jump]')) {
    const s = SLOTS.find(s => !slotDone(s));
    if (s) { selDay = dkey(s.t); render(); scrollDay(); $('dia').scrollIntoView({ block: 'start' }); }
    return;
  }
  const th = t.closest('[data-theme-set]'); if (th) setTheme(th.dataset.themeSet);
});

// Inicio del tratamiento
$('saveStart').addEventListener('click', () => {
  const v = $('start').value; if (!v) return;
  state.start = v.slice(0, 16); selDay = null;
  build(); render(); save(); scrollDay();
  const st = parseStart(state.start);
  toast('Inicio actualizado: ' + fdate(st) + ' ' + hhmm(st));
});

// Avisos del navegador
function notifLabel() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    $('notif').textContent = 'Avisos activados';
    $('notifTxt').textContent = 'Te avisaremos a cada hora de toma mientras la app esté abierta.';
  }
}
$('notif').addEventListener('click', async () => {
  try {
    if (!('Notification' in window)) throw 0;
    const r = await Notification.requestPermission();
    if (r === 'granted') notifLabel();
    else $('notifTxt').textContent = 'El navegador no dio permiso. Usa "Agregar alarmas al calendario".';
  } catch (e) {
    $('notifTxt').textContent = 'Este navegador no permite avisos. En iPhone, primero instala la app (Compartir → Agregar a inicio). O usa las alarmas del calendario.';
  }
});

// Descargas
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Alarmas para el calendario (.ics): una por cada hora de toma pendiente
function makeICS() {
  const now = new Date();
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const f = t => dkey(t) + 'T' + pad(t.getHours()) + pad(t.getMinutes()) + '00';
  const fold = l => { const out = []; while (l.length > 60) { out.push(l.slice(0, 60)); l = ' ' + l.slice(60); } out.push(l); return out.join('\r\n'); };
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Remedios//App//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc('Remedios de ' + R.paciente)];
  let n = 0;
  for (const s of SLOTS) {
    if (s.t < now || slotDone(s)) continue;
    const items = s.items.filter(d => !isDone(d));
    L.push('BEGIN:VEVENT', 'UID:' + s.t.getTime() + '-' + dkey(parseStart(state.start)) + '@remedios', 'DTSTAMP:' + stamp,
      'DTSTART:' + f(s.t), 'DTEND:' + f(new Date(s.t.getTime() + 10 * 60000)),
      'SUMMARY:' + esc('💊 ' + hhmm(s.t) + ' · ' + items.map(d => d.m.n).join(', ')),
      'DESCRIPTION:' + esc(items.map(d => (d.m.o ? d.m.o + 'º ' : '• ') + d.m.n + ' — ' + d.m.d).join('\n')),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Hora de remedios'), 'TRIGGER:PT0S', 'END:VALARM', 'END:VEVENT');
    n++;
  }
  L.push('END:VCALENDAR');
  return { text: L.map(fold).join('\r\n'), n };
}
$('ics').addEventListener('click', () => {
  const { text, n } = makeICS();
  if (!n) return toast('No quedan tomas pendientes para agregar');
  download('remedios-' + R.paciente.toLowerCase() + '.ics', text, 'text/calendar');
  toast(`${n} alarmas listas · ábrelas para agregarlas al calendario`);
});

// Respaldo
$('export').addEventListener('click', () => {
  const data = { app: 'remedios', version: VERSION, guardado: new Date().toISOString(), ...state };
  download('remedios-respaldo-' + dkey(new Date()) + '.json', JSON.stringify(data, null, 2), 'application/json');
  toast('Respaldo descargado');
});
$('importBtn').addEventListener('click', () => $('importFile').click());
$('importFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  try {
    const s = JSON.parse(await file.text());
    if (!s || typeof s.done !== 'object') throw 0;
    const n = Object.keys(s.done).length;
    if (!confirm(`El respaldo tiene ${n} tomas marcadas. ¿Reemplazar lo que hay en este teléfono?`)) return;
    snapshot();
    state = { start: RX.test(s.start || '') ? s.start.slice(0, 16) : R.inicio, done: s.done };
    $('start').value = state.start; selDay = null;
    build(); commit('Respaldo restaurado'); scrollDay();
  } catch (err) { toast('Ese archivo no es un respaldo válido'); }
});

// Borrar todo
$('reset').addEventListener('click', () => {
  if (!confirm('¿Borrar todas las tomas marcadas en este teléfono?')) return;
  snapshot(); state.done = {}; commit('Se borraron todas las marcas');
});

// Tema
function setTheme(v) {
  try { v === 'auto' ? localStorage.removeItem(LS_THEME) : localStorage.setItem(LS_THEME, v); } catch (e) {}
  if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
  for (const b of document.querySelectorAll('[data-theme-set]')) b.setAttribute('aria-pressed', b.dataset.themeSet === v);
}

// Aviso flotante (con "Deshacer" opcional)
let tt;
function toast(msg, undo) {
  const el = $('toast');
  el.textContent = '';
  const sp = document.createElement('span'); sp.textContent = msg; el.append(sp);
  if (undo) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Deshacer';
    b.onclick = () => { el.classList.remove('show'); undo(); };
    el.append(b);
  }
  el.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), undo ? 5000 : 4000);
}

// Navegación: resalta la sección visible
const tabs = [...document.querySelectorAll('nav.tabs a')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) for (const a of tabs) a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
  }, { rootMargin: '-45% 0px -50% 0px' });
  for (const a of tabs) io.observe($(a.getAttribute('href').slice(1)));
}

// Reloj: avisa a la hora de cada toma y refresca la pantalla
function tick() {
  const now = new Date();
  for (const s of SLOTS) {
    const k = s.t.getTime();
    if (k <= now && now - k < 5 * 60000 && !slotDone(s) && !notified.has(k)) {
      notified.add(k);
      const msg = 'Hora de remedios ' + hhmm(s.t) + ': ' + s.items.filter(d => !isDone(d)).map(d => d.m.n).join(', ');
      toast(msg);
      try {
        if (window.Notification && Notification.permission === 'granted') {
          const opts = { body: msg, icon: 'icon-512.png', tag: 'toma-' + k };
          if (navigator.serviceWorker) navigator.serviceWorker.ready.then(r => r.showNotification('Remedios de ' + R.paciente, opts)).catch(() => new Notification('Remedios de ' + R.paciente, opts));
          else new Notification('Remedios de ' + R.paciente, opts);
        }
      } catch (e) {}
    }
  }
  render();
}

// ── Arranque ──────────────────────────────────────────────────
document.title = 'Remedios de ' + R.paciente;
$('titulo').textContent = 'Remedios de ' + R.paciente;
$('origen').textContent = R.origen + ' · toca cada remedio cuando se lo des';
$('ver').textContent = 'versión ' + VERSION;
load();
$('start').value = state.start;
let theme = 'auto'; try { theme = localStorage.getItem(LS_THEME) || 'auto'; } catch (e) {}
setTheme(theme);
build(); render(); scrollDay(); notifLabel();
setInterval(tick, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
