/* ══════════════════════════════════════════════════════════════════
   Handboek VRI — applicatie
   Geen framework, geen build-stap, geen dependencies.
   Bewuste keuze: dit moet over tien jaar nog te openen en te
   begrijpen zijn door iemand die dit bestand nooit eerder zag.
   ══════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Iconen (Lucide-stijl + eigen domein-glyphs) ────────────────── */
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  home:   svg('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
  search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  star:   svg('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
  more:   svg('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'),
  doc:    svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
  clock:  svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  warn:   svg('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
  list:   svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  link:   svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"/>'),
  chart:  svg('<path d="M3 3v18h18"/><path d="M7 15v3M12 9v9M17 5v13"/>'),
  copy:   svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  phone:  svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  map:    svg('<path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3z"/><path d="M9 7v13M15 4v13"/>'),
  check:  svg('<path d="M20 6 9 17l-5-5"/>'),
  back:   svg('<path d="m15 18-6-6 6-6"/>'),
  chev:   svg('<path d="m9 18 6-6-6-6"/>'),
  info:   svg('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),
  ext:    svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>'),
  pin:    svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
  lock:   svg('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  users:  svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'),
  wifi:   svg('<path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>'),
  moon:   svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>'),
  vri:    svg('<rect x="7" y="2" width="10" height="17" rx="2"/><path d="M9 22h6"/><circle cx="12" cy="6.5" r="1.2"/><circle cx="12" cy="10.5" r="1.2"/><circle cx="12" cy="14.5" r="1.2"/>'),
  halte:  svg('<path d="M12 21V9"/><rect x="5" y="3" width="14" height="6" rx="1"/><path d="M9 21h6"/>'),
  koffer: svg('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
};
const typeIcon = t => (t === 'halte' ? I.halte : I.vri);

/* ── Hulpfuncties ───────────────────────────────────────────────── */
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m]));
const C = id => CONTRACTEN.find(c => c.id === id);
const bySlug = s => LOCATIES.find(l => l.s === s);
const norm = s => String(s ?? '').toLowerCase().replace(/[\s.\-–—'"]/g, '');

/* Lokale opslag — faalt stil (bv. bij file:// of privémodus) */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('vri.' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('vri.' + k, JSON.stringify(v)); } catch {} },
};

/* ── Toestand ───────────────────────────────────────────────────── */
const state = {
  route: 'start', param: null, q: '',
  online: navigator.onLine,
  beheer: false,
  favorieten: new Set(store.get('fav', [])),
  gedaan: new Set(store.get('gedaan', [])),
  toonPw: false,
  import: null,
  palIdx: 0, palHits: [],
};
let DATA_VERSIE = VERSIE;

/* ══════════════════════════════════════════════════════════════════
   ZOEKEN — inverted index over 2.349 records, in de browser gebouwd
   ══════════════════════════════════════════════════════════════════ */

const INDEX = LOCATIES.map(l => ({
  l,
  nr:  norm(l.nr),
  txt: norm([l.nr, l.l, l.g, l.f, l.v, l.ob, C(l.c).naam].filter(Boolean).join(' ')),
}));

function zoek(q, limiet = 60) {
  const n = norm(q);
  if (n.length < 1) return [];
  const hits = [];
  for (const e of INDEX) {
    let score = 0;
    if (e.nr === n) score = 100;
    else if (e.nr.startsWith(n)) score = 80;
    else if (e.nr.includes(n)) score = 60;
    else if (n.length >= 2 && e.txt.includes(n)) score = 30;
    if (score) hits.push({ l: e.l, score });
    if (hits.length > 400) break;
  }
  hits.sort((a, b) => b.score - a.score || a.l.nr.localeCompare(b.l.nr));
  return hits.slice(0, limiet).map(h => h.l);
}

const mark = (tekst, q) => {
  const n = norm(q);
  if (!n) return esc(tekst);
  const i = norm(tekst).indexOf(n);
  if (i < 0) return esc(tekst);
  // Positie terugrekenen naar de originele string (normalisatie verwijdert tekens)
  let orig = 0, gen = 0;
  while (gen < i && orig < tekst.length) { if (norm(tekst[orig])) gen++; orig++; }
  let eind = orig, tel = 0;
  while (tel < n.length && eind < tekst.length) { if (norm(tekst[eind])) tel++; eind++; }
  return esc(tekst.slice(0, orig)) + '<mark>' + esc(tekst.slice(orig, eind)) + '</mark>' + esc(tekst.slice(eind));
};

/* ══════════════════════════════════════════════════════════════════
   COMPONENTEN — pure functies, geen bijwerkingen
   ══════════════════════════════════════════════════════════════════ */

const Unknown = (titel = 'Niet vastgelegd in de bron') =>
  `<span class="unknown" title="${esc(titel)}">—</span>`;

const val = v => (v ? esc(v) : Unknown());

const Voltage = v => !v ? Unknown()
  : v === '230V' ? '<span class="badge badge-amber">230V</span>'
  : `<span class="mono" style="color:var(--text-secondary)">${esc(v)}</span>`;

function SlaBadge(cid) {
  const c = C(cid);
  if (!c) return '';
  if (c.type === 'nvt') return '<span class="badge">n.v.t.</span>';
  const tone = c.type === 'bis' ? 'badge-accent' : c.type === 'uitzondering' ? 'badge-amber' : 'badge-green';
  return `<span class="badge ${tone}">${esc(c.urgent)}</span>`;
}

/** Kaart-deeplinks. Zonder coördinaat: terugvallen op adres.
    Een minder precieze knop is beter dan een dode knop. */
const mapsNav = l => l.y
  ? `https://www.google.com/maps/dir/?api=1&destination=${l.y},${l.x}&travelmode=driving`
  : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([l.l, l.g].filter(Boolean).join(', '))}&travelmode=driving`;
const mapsView = l => `https://www.google.com/maps/search/?api=1&query=${l.y},${l.x}`;

/** LocationCard — de opdrachtgever staat er ALTIJD bij.
    K001 bestaat in Delft, Gouda én Voorne aan Zee. Zonder dat
    label is een zoekresultaat niet onvolledig maar misleidend. */
function LocationCard(l, q = '') {
  const c = C(l.c);
  return `
    <button class="card" data-route="l" data-param="${l.s}">
      <div class="card-head">
        <span class="card-id">${typeIcon(l.t)}${mark(l.nr, q)}</span>
        ${SlaBadge(l.c)}
      </div>
      <div class="card-title">${l.l ? mark(l.l, q) : Unknown('Geen locatienaam in de bron')}</div>
      <div class="card-meta">
        <strong>${esc(c.naam)}</strong>
        ${l.g && l.g !== c.naam ? `<span class="sep">·</span><span>${esc(l.g)}</span>` : ''}
        ${l.f ? `<span class="sep">·</span><span>${esc(l.f)}</span>` : ''}
        ${l.y ? `<span class="sep">·</span><span style="display:inline-flex;color:var(--signal-green)" title="Coördinaat bekend">${I.pin}</span>` : ''}
      </div>
    </button>`;
}

function ContractCard(c) {
  return `
    <button class="card" data-route="c" data-param="${c.id}">
      <div class="card-head">
        <span class="card-id">${I.doc}${esc(c.naam)}</span>
        ${SlaBadge(c.id)}
      </div>
      <div class="card-meta" style="margin-top:var(--s3)">
        <span class="mono">${c.n.toLocaleString('nl-NL')}</span>
        <span>${c.id === 'htm' ? 'haltes' : 'locaties'}</span>
        ${c.regime ? `<span class="sep">·</span><span>${esc(c.regime)}</span>` : ''}
      </div>
      <div class="card-meta">Schade: ${c.schade ? esc(c.schade) : Unknown()}</div>
    </button>`;
}

/** ResponsePanel — de afspraak uit het contract. Een tabel.
    Er wordt niets berekend. */
function ResponsePanel(cid, uitz = false) {
  const c = C(cid);
  const regels = (c.sla && c.sla.length) ? c.sla : [[c.urgent || '—', 'Alle kruispunten']];

  const urgent = c.type === 'nvt'
    ? `<div style="padding:var(--s3) 0"><span class="unknown">Geen urgente respons afgesproken</span></div>`
    : `<div class="sla-rules">${regels.map(([tijd, wanneer]) => {
        const hit = uitz && /^K|·/.test(wanneer) && !/overige/i.test(wanneer);
        return `<div class="sla-rule ${hit ? 'is-hit' : ''}">
          <span class="sla-time">${esc(tijd)}</span>
          <span class="sla-when">${esc(wanneer)}</span>
          ${hit ? '<span class="badge badge-amber">geldt hier</span>' : ''}
        </div>`;
      }).join('')}</div>`;

  return `<div class="panel">
    <div class="eyebrow panel-head">
      <span>Responstijden</span><span class="sep">·</span><span>afspraak uit het contract</span>
    </div>

    <div class="sla-block">
      <div class="sla-head">Urgente melding</div>
      ${urgent}
    </div>

    <div class="sla-block">
      <div class="sla-head">Niet-urgente melding</div>
      <div class="sla-rules"><div class="sla-rule">
        <span class="sla-time">${c.nietUrgent ? esc(c.nietUrgent) : Unknown()}</span>
        <span class="sla-when">Alle kruispunten</span>
      </div></div>
    </div>

    ${c.type === 'bis' ? `<div class="note">${I.info}<span>De geldende waarde per kruispunt staat in <strong>BIS</strong>.</span></div>` : ''}
    ${c.regime ? `<div class="note">${I.info}<span>Valt onder het <strong>${esc(c.regime)}</strong>-regime.</span></div>` : ''}

    <div class="sla-foot">
      <span>Deze app rekent geen deadline uit — dit is de afspraak.</span>
      <span class="mono">bron ${DATA_VERSIE}</span>
    </div>
  </div>`;
}

/** LocationTable — gevirtualiseerd. HTM heeft 1.140 rijen. */
function LocationTable(rows, id = 'tbl') {
  if (!rows.length) return EmptyState('Geen locaties', 'Er valt niets te tonen onder dit filter.');
  return `
    <div class="t-desk">
      <div class="tablewrap">
        <div class="vscroll" id="${id}" data-vlist>
          <table>
            <thead><tr>
              <th>Nr.</th><th>Locatie</th>
              <th class="col-gem">Gemeente</th><th class="col-fab">Fabrikant</th>
              <th class="col-vra">VRA-nr.</th><th class="col-volt c-r">V</th>
            </tr></thead>
            <tbody id="${id}-body"></tbody>
          </table>
        </div>
        <div class="tablefoot">
          <span>${rows.length.toLocaleString('nl-NL')} locaties</span>
          <span class="mono">bron ${DATA_VERSIE}</span>
        </div>
      </div>
    </div>
    <div class="t-mob">${rows.slice(0, 60).map(l => LocationCard(l)).join('')}
      ${rows.length > 60 ? `<div class="note">${I.info}<span>Eerste 60 van ${rows.length.toLocaleString('nl-NL')} getoond. Gebruik zoeken om een specifiek kruispunt te vinden.</span></div>` : ''}
    </div>`;
}

const tableRow = l => `
  <tr data-route="l" data-param="${l.s}">
    <td class="c-id">${esc(l.nr)}</td>
    <td class="c-loc">${l.l ? esc(l.l) : Unknown()}</td>
    <td class="col-gem">${val(l.g)}</td>
    <td class="col-fab">${val(l.f)}</td>
    <td class="col-vra mono">${val(l.v)}</td>
    <td class="col-volt c-r">${Voltage(l.e)}</td>
  </tr>`;

/** Virtualisatie: alleen zichtbare rijen in de DOM. */
function virtualiseer(id, rows) {
  const box = document.getElementById(id);
  const body = document.getElementById(id + '-body');
  if (!box || !body) return;
  const H = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--row-h')) || 56;
  const BUF = 8;

  const teken = () => {
    const top = box.scrollTop;
    const zicht = Math.ceil(box.clientHeight / H) + BUF * 2;
    const start = Math.max(0, Math.floor(top / H) - BUF);
    const eind = Math.min(rows.length, start + zicht);
    body.innerHTML =
      `<tr class="vspacer" style="height:${start * H}px"><td colspan="6" style="padding:0;height:${start * H}px"></td></tr>` +
      rows.slice(start, eind).map(tableRow).join('') +
      `<tr class="vspacer"><td colspan="6" style="padding:0;height:${(rows.length - eind) * H}px"></td></tr>`;
  };
  box.onscroll = () => requestAnimationFrame(teken);
  teken();
}

function ProcedurePanel(c) {
  if (!c.procedure && !c.stappen) {
    return `<div class="panel">
      <div class="eyebrow panel-head"><span>Werkwijze</span></div>
      <p style="color:var(--text-unknown)">Voor ${esc(c.naam)} is geen aparte werkwijze vastgelegd in het handboek.</p>
    </div>`;
  }
  return `<div class="panel">
    <div class="eyebrow panel-head">
      <span>Werkwijze</span>
      ${c.stappen ? `<span class="sep">·</span><span>${c.stappen.length} stappen</span>` : ''}
    </div>
    ${c.procedure ? `<div class="prose"><p>${esc(c.procedure)}</p></div>` : ''}
    ${c.stappen ? `<ul class="steps">${c.stappen.map((s, i) => `
      <li><button class="step" data-step="${c.id}-p${i}" aria-pressed="${state.gedaan.has(c.id + '-p' + i)}">
        <span class="step-box">${I.check}</span><span class="step-text">${esc(s)}</span>
      </button></li>`).join('')}</ul>` : ''}
    ${c.benodigd ? `<div class="note">${I.koffer}<span>Meenemen: <strong>${c.benodigd.map(esc).join(', ')}</strong></span></div>` : ''}
    ${c.formulier ? `<div class="note">${I.doc}<span>Altijd invullen: <strong>${esc(c.formulier)}</strong></span></div>` : ''}
  </div>`;
}

function SystemCard(key, nr = null) {
  const s = SYSTEMEN[key];
  if (!s) return '';
  const url = s.url && s.tmpl && nr ? s.url.replace('{nr}', encodeURIComponent(nr)) : s.url;
  return `<div class="panel">
    <div class="card-head">
      <span class="card-id">${I.link}${esc(s.naam)}</span>
      ${url ? `<a class="btn btn-secondary btn-sm" href="${url}" target="_blank" rel="noopener">${I.ext} Openen</a>` : ''}
    </div>
    <p style="margin-top:var(--s3);color:var(--text-secondary);font:var(--t-body-sm)">${esc(s.desc)}</p>
    ${s.cred ? CredentialCard(s) : ''}
  </div>`;
}

function CredentialCard(s) {
  const t = state.toonPw;
  return `
    <div style="margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid var(--border-subtle)">
      <dl class="kv">
        <dt>Gebruikersnaam</dt>
        <dd class="mono">${esc(s.cred.u)}
          <button class="iconbtn" data-copy="${esc(s.cred.u)}" aria-label="Kopieer gebruikersnaam">${I.copy}</button>
        </dd>
        <dt>Wachtwoord</dt>
        <dd class="mono">
          <span class="${t ? '' : 'cred-mask'}">${t ? esc(s.cred.p) : '••••••••'}</span>
          <button class="btn btn-subtle btn-sm" data-toonpw>${t ? 'Verberg' : 'Toon'}</button>
          <button class="iconbtn" data-copy="${esc(s.cred.p)}" aria-label="Kopieer wachtwoord">${I.copy}</button>
        </dd>
      </dl>
      <div class="cred-note">${I.info}<span>Kopiëren kan zonder tonen. Verbergt zich automatisch na 30 seconden.</span></div>
    </div>`;
}

function ContactCard(key) {
  const c = CONTACTEN[key];
  if (!c) return '';
  return `<div class="panel">
    <div class="eyebrow panel-head"><span>Contact</span></div>
    <div style="display:flex;align-items:center;gap:var(--s4);flex-wrap:wrap">
      <div class="avatar">${esc(c.init)}</div>
      <div style="flex:1;min-width:120px">
        <div style="font-weight:500">${esc(c.naam)}</div>
        <div style="font:var(--t-body-sm);color:var(--text-tertiary)">${esc(c.rol)}</div>
      </div>
    </div>
    <div class="cred-note">${I.info}<span>${esc(c.kanaal)}</span></div>
  </div>`;
}

function EmptyState(titel, tekst, acties = '') {
  return `<div class="empty">${I.search}
    <h3>${esc(titel)}</h3><p>${tekst}</p>
    ${acties ? `<div class="suggestions">${acties}</div>` : ''}
  </div>`;
}

const SearchBar = () => `
  <label class="search">${I.search}
    <input id="q" type="search" placeholder="Kruispunt, straat, VRA- of objectnummer" value="${esc(state.q)}"
           autocomplete="off" spellcheck="false" aria-label="Zoeken">
    <kbd class="only-desktop">⌘K</kbd>
  </label>`;

/* ══════════════════════════════════════════════════════════════════
   DATAKWALITEIT — live berekend
   ══════════════════════════════════════════════════════════════════ */

function computeDQ() {
  const vri = LOCATIES.filter(l => l.t !== 'halte');
  const p = f => Math.round(100 * vri.filter(l => l[f]).length / vri.length);
  const m = f => vri.filter(l => !l[f]).length;
  const geoAll = Math.round(100 * LOCATIES.filter(l => l.y).length / LOCATIES.length);
  return [
    { label: 'Fabrikant',   pct: p('f'),  n: m('f') },
    { label: 'VRA-nummer',  pct: p('v'),  n: m('v') },
    { label: 'Voltage',     pct: p('e'),  n: m('e') },
    { label: 'Objectnummer',pct: p('ob'), n: m('ob') },
    { label: 'Coördinaten', pct: geoAll,  n: LOCATIES.filter(l => !l.y).length, alle: true },
  ];
}

function DataQualityPanel() {
  const dq = computeDQ();
  const vri = LOCATIES.filter(l => l.t !== 'halte');
  const leeg = CONTRACTEN.filter(c => {
    const r = vri.filter(l => l.c === c.id);
    return r.length && r.every(l => !l.f);
  });
  return `<div class="panel">
    <div class="eyebrow panel-head"><span>Datakwaliteit</span><span class="sep">·</span><span>bron ${DATA_VERSIE}</span></div>
    ${dq.map(d => `
      <div class="dq-row">
        <span class="dq-label">${d.label}</span>
        <span class="dq-track"><span class="dq-fill ${d.pct === 0 ? 'is-empty' : ''}" data-fill="${d.pct}"></span></span>
        <span class="dq-pct">${d.pct}%</span>
        <span class="dq-n">${d.n === 0 ? '✓' : '−' + d.n}</span>
      </div>`).join('')}
    <div class="cred-note">${I.info}<span>Percentage ingevuld · rechts het aantal ontbrekende velden. Fabrikant, VRA en voltage tellen alleen VRI's; coördinaten tellen alles.</span></div>
    ${leeg.length ? `<div class="note">${I.warn}<span><strong>${leeg.length} contracten zonder enige fabrikantdata:</strong><br>${leeg.map(c => esc(c.naam)).join(' · ')}</span></div>` : ''}
  </div>`;
}

/* ══════════════════════════════════════════════════════════════════
   CSV — export, import, validatie, publicatie
   Excel-NL: puntkomma + UTF-8 BOM + decimale komma. Zonder die drie
   opent het bestand als één kolom met kapotte accenten.
   ══════════════════════════════════════════════════════════════════ */

const KOLOMMEN = ['slug','contract','kruispuntnummer','locatie','gemeente','objectnummer','fabrikant','vra_nummer','voltage','latitude','longitude'];

const cel = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const kom = v => (v == null || v === '' ? '' : String(v).replace('.', ','));

function bouwCSV(alleen) {
  const rows = alleen === 'gaten'
    ? LOCATIES.filter(l => !l.f || !l.v || !l.e || !l.y)
    : LOCATIES;
  const r = [KOLOMMEN.join(';')];
  rows.forEach(l => r.push([
    l.s, C(l.c).naam, l.nr, l.l || '', l.g || '', l.ob || '',
    l.f || '', l.v || '', l.e || '', kom(l.y), kom(l.x),
  ].map(cel).join(';')));
  return { csv: '\uFEFF' + r.join('\r\n'), n: rows.length };
}

function download(naam, inhoud, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([inhoud], { type }));
  a.download = naam;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function parseCSV(tekst) {
  const lijnen = tekst.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const split = lijn => {
    const uit = []; let cur = '', q = false;
    for (let i = 0; i < lijn.length; i++) {
      const ch = lijn[i];
      if (q) {
        if (ch === '"' && lijn[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ';') { uit.push(cur); cur = ''; }
      else cur += ch;
    }
    uit.push(cur);
    return uit.map(s => s.trim());
  };
  const kop = split(lijnen[0]).map(k => k.toLowerCase());
  return lijnen.slice(1).filter(Boolean).map((l, i) => {
    const c = split(l), o = { _r: i + 2 };
    kop.forEach((k, j) => (o[k] = c[j] ?? ''));
    return o;
  });
}

const getal = v => {
  const s = String(v ?? '').trim().replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null;
};
const inNL = (y, x) => y >= 50.5 && y <= 53.8 && x >= 3.2 && x <= 7.4;
const fabResolve = v => FABRIKANTEN.find(f => norm(f) === norm(v)) || null;

function valideer(rijen) {
  const wijz = [], fout = [];
  rijen.forEach(r => {
    const l = bySlug(r.slug);
    if (!l) { fout.push({ r: r._r, slug: r.slug || '(leeg)', veld: 'slug', w: r.slug, reden: 'Onbekende locatie — bestaat niet in de dataset' }); return; }

    if (r.fabrikant && r.fabrikant !== (l.f || '')) {
      const f = fabResolve(r.fabrikant);
      if (!f) fout.push({ r: r._r, slug: r.slug, veld: 'fabrikant', w: r.fabrikant, reden: 'Onbekende fabrikant. Toegestaan: ' + FABRIKANTEN.join(', ') });
      else if (f !== l.f) wijz.push({ s: r.slug, nr: l.nr, veld: 'f', van: l.f, naar: f, genorm: f !== r.fabrikant ? r.fabrikant : null });
    }

    if (r.vra_nummer && r.vra_nummer !== (l.v || '')) {
      if (!/^[A-Za-z0-9.\-/]{3,24}$/.test(r.vra_nummer))
        fout.push({ r: r._r, slug: r.slug, veld: 'vra_nummer', w: r.vra_nummer, reden: 'Ongeldig formaat' });
      else wijz.push({ s: r.slug, nr: l.nr, veld: 'v', van: l.v, naar: r.vra_nummer });
    }

    if (r.voltage && r.voltage !== (l.e || '')) {
      if (!VOLTAGES.includes(r.voltage))
        fout.push({ r: r._r, slug: r.slug, veld: 'voltage', w: r.voltage, reden: 'Moet ' + VOLTAGES.join(' of ') + ' zijn' });
      else wijz.push({ s: r.slug, nr: l.nr, veld: 'e', van: l.e, naar: r.voltage });
    }

    if (r.objectnummer && r.objectnummer !== (l.ob || ''))
      wijz.push({ s: r.slug, nr: l.nr, veld: 'ob', van: l.ob, naar: r.objectnummer });

    if (r.latitude || r.longitude) {
      const y = getal(r.latitude), x = getal(r.longitude);
      if (y === null || x === null) {
        fout.push({ r: r._r, slug: r.slug, veld: 'coördinaten', w: `${r.latitude} / ${r.longitude}`, reden: 'Vul latitude én longitude in, allebei als getal' });
      } else if (!inNL(y, x)) {
        fout.push({ r: r._r, slug: r.slug, veld: 'coördinaten', w: `${y}, ${x}`,
          reden: inNL(x, y) ? 'Latitude en longitude staan verwisseld — draai de kolommen om' : 'Ligt buiten Nederland' });
      } else if (y !== l.y || x !== l.x) {
        wijz.push({ s: r.slug, nr: l.nr, veld: 'geo', van: l.y ? `${l.y}, ${l.x}` : null, naar: `${y}, ${x}`, y, x });
      }
    }
  });
  return { wijz, fout, n: rijen.length };
}

function publiceer(wijz, nieuweVersie) {
  wijz.forEach(w => {
    const l = bySlug(w.s);
    if (!l) return;
    if (w.veld === 'geo') { l.y = w.y; l.x = w.x; }
    else l[w.veld] = w.naar;
  });
  DATA_VERSIE = nieuweVersie;
  state.import = null;
}

/** Genereer een nieuw data.js. Dit bestand zet je op de server —
    zo werkt contentbeheer zonder database en zonder backend. */
function exportDataJs() {
  const kort = LOCATIES.map(l => {
    const o = { s: l.s, c: l.c, nr: l.nr };
    ['l','g','t','f','v','e','ob','q'].forEach(k => { if (l[k]) o[k] = l[k]; });
    if (l.y) { o.y = l.y; o.x = l.x; }
    return o;
  });
  const nu = new Date().toISOString().slice(0, 10);
  return `/* ══════════════════════════════════════════════════════════════════
   Handboek VRI — DATA
   Gegenereerd door de app zelf op ${nu}, bronversie ${DATA_VERSIE}.

   Plaats dit bestand in assets/ op de server. Verhoog daarna het
   cachenummer in sw.js (bv. 'vri-${DATA_VERSIE}-1'), anders blijven
   telefoons de oude versie tonen.
   ══════════════════════════════════════════════════════════════════ */

const VERSIE = ${JSON.stringify(DATA_VERSIE)};
const FABRIKANTEN = ${JSON.stringify(FABRIKANTEN)};
const VOLTAGES = ${JSON.stringify(VOLTAGES)};
const CONTRACTEN = ${JSON.stringify(CONTRACTEN, null, 1)};
const SYSTEMEN = ${JSON.stringify(SYSTEMEN, null, 1)};
const CONTACTEN = ${JSON.stringify(CONTACTEN, null, 1)};
const LOCATIES = ${JSON.stringify(kort)};
`;
}

/* ══════════════════════════════════════════════════════════════════
   SCHERMEN
   ══════════════════════════════════════════════════════════════════ */

const V = {};

V.start = () => {
  const snel = [
    ['responstijden', I.clock, 'Responstijden', 'Alle 15 contracten naast elkaar'],
    ['schade',        I.warn,  'Schade-afhandeling', 'NODR of schadeformulier?'],
    ['procedures',    I.list,  'Procedures', 'Werkwijze per opdrachtgever'],
    ['systemen',      I.link,  'Systemen', 'Logboeken en inloggegevens'],
  ];
  return `
    <div class="section">${SearchBar()}</div>

    <div class="section">
      <div class="section-head"><div class="eyebrow"><span>Snel naar</span></div></div>
      <div class="grid grid-2">
        ${snel.map(([r, ic, t, d]) => `
          <button class="card" data-route="${r}">
            <div class="card-head">
              <span class="card-id">${ic}${t}</span>
              <span style="color:var(--text-tertiary);display:flex">${I.chev}</span>
            </div>
            <div class="card-meta">${d}</div>
          </button>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <div class="eyebrow"><span>Contracten</span><span class="sep">·</span><span>${CONTRACTEN.length}</span></div>
        <span class="card-meta"><span class="mono">${LOCATIES.length.toLocaleString('nl-NL')}</span> locaties</span>
      </div>
      <div class="grid grid-3">${CONTRACTEN.map(ContractCard).join('')}</div>
    </div>`;
};

V.zoeken = () => {
  const hits = zoek(state.q);
  const nrs = {};
  hits.forEach(h => (nrs[h.nr] = (nrs[h.nr] || 0) + 1));
  const dubbel = Object.entries(nrs).filter(([, n]) => n > 1);

  const body = !state.q
    ? EmptyState('Waar sta je?', 'Typ een kruispuntnummer, straatnaam, gemeente, VRA- of objectnummer.',
        ['K111','K001','CAP04','Vialis'].map(s => `<button class="pill" data-zoek="${s}">${s}</button>`).join(''))
    : !hits.length
      ? EmptyState(`Geen locatie gevonden voor "${esc(state.q)}"`,
          'Controleer het nummer, of zoek op straatnaam.',
          '<button class="pill" data-route="contracten">Bekijk alle contracten</button>')
      : `${dubbel.length ? `
          <div class="note note-warn" style="margin-bottom:var(--s4)">${I.warn}
            <span><strong>${dubbel.map(([nr, n]) => `${n} locaties delen het nummer ${nr}`).join(', ')}.</strong>
            Kijk goed bij welke opdrachtgever je bent.</span>
          </div>` : ''}
        <div class="grid grid-3">${hits.map(l => LocationCard(l, state.q)).join('')}</div>
        ${hits.length >= 60 ? `<div class="note">${I.info}<span>Eerste 60 resultaten. Verfijn je zoekopdracht voor minder treffers.</span></div>` : ''}`;

  return `<div class="section">${SearchBar()}</div>
    ${state.q && hits.length ? `<div class="section-head"><div class="eyebrow"><span>${hits.length}${hits.length >= 60 ? '+' : ''} resultaten</span></div></div>` : ''}
    ${body}`;
};

V.l = (slug) => {
  const l = bySlug(slug);
  if (!l) return EmptyState('Onbekende locatie', `Er bestaat geen locatie met code "${esc(slug)}".`,
    '<button class="pill" data-route="zoeken">Terug naar zoeken</button>');

  const c = C(l.c);
  const uitz = !!(c.uitz && c.uitz.includes(l.nr));
  const fav = state.favorieten.has(l.s);
  const geenSpecs = !l.f && !l.v && !l.e;

  const stappen = [
    c.systemen.some(s => s.startsWith('vrilogboek')) ? 'VRI-logboek invullen' : null,
    c.systemen.includes('cityview') ? 'Bon bijwerken in CityView' : null,
    c.systemen.includes('ireal') ? "IREAL invullen + foto's toevoegen" : null,
    c.formulier ? c.formulier + ' invullen' : null,
    c.schade ? 'Schade? → ' + c.schade : null,
  ].filter(Boolean);

  const logboek = c.systemen.find(s => s.startsWith('vrilogboek'));
  const sys = logboek ? SYSTEMEN[logboek] : null;
  const logUrl = sys && sys.url ? sys.url.replace('{nr}', encodeURIComponent(l.nr)) : null;

  const acties = `
    <div class="actionbar">
      ${logUrl
        ? `<a class="btn btn-primary btn-block" href="${logUrl}" target="_blank" rel="noopener">${I.ext} Open logboek — ${esc(l.nr)}</a>`
        : `<button class="btn btn-secondary btn-block" disabled title="Geen klantsysteem vastgelegd voor dit contract">${I.ext} Geen logboek vastgelegd</button>`}
      <div class="actionbar-row">
        <a class="btn btn-secondary" href="${mapsNav(l)}" target="_blank" rel="noopener"
           title="${l.y ? 'Navigeer naar het vastgelegde punt' : 'Geen coördinaat — navigeert op straatnaam'}">
          ${I.map} Navigeer${l.y ? '' : ' <span class="badge" style="margin-left:4px">adres</span>'}
        </a>
        <button class="btn btn-secondary" data-copy="${esc(l.nr)}">${I.copy} Kopieer nr.</button>
      </div>
    </div>`;

  const respons = ResponsePanel(l.c, uitz);

  return `
    <div class="loc-layout">
      <div>
        <div class="loc-hero">
          <div class="loc-nr">
            <span>${esc(l.nr)}</span>
            <button class="iconbtn" data-copy="${esc(l.nr)}" aria-label="Kopieer kruispuntnummer">${I.copy}</button>
          </div>
          <h1 class="loc-street">${l.l ? esc(l.l) : Unknown('Geen locatienaam in de bron')}</h1>
          <div class="loc-tags">
            <span class="badge">${l.t === 'halte' ? 'Halte' : 'VRI'}</span>
            <span class="badge">${esc(c.naam)}</span>
            ${l.g ? `<span class="badge">${esc(l.g)}</span>` : ''}
            ${uitz ? '<span class="badge badge-amber">SLA-uitzondering</span>' : ''}
            ${l.q === 'controleren' ? '<span class="badge badge-amber">coördinaat controleren</span>' : ''}
          </div>
        </div>

        <div class="only-narrow">${respons}</div>

        <div class="panel" style="margin-top:var(--s4)">
          <div class="eyebrow panel-head"><span>Specificaties</span><span class="sep">·</span><span>bron ${DATA_VERSIE}</span></div>
          <dl class="kv">
            <dt>Fabrikant</dt><dd>${val(l.f)}</dd>
            <dt>VRA-nummer</dt><dd class="mono">${val(l.v)}</dd>
            <dt>Voltage</dt><dd>${Voltage(l.e)}</dd>
            <dt>Objectnummer</dt><dd class="mono">${val(l.ob)}</dd>
            <dt>Coördinaten</dt>
            <dd>${l.y
              ? `<span class="mono">${l.y.toFixed(5)}, ${l.x.toFixed(5)}</span>
                 <button class="iconbtn" data-copy="${l.y}, ${l.x}" aria-label="Kopieer coördinaten">${I.copy}</button>
                 <a class="btn btn-subtle btn-sm" href="${mapsView(l)}" target="_blank" rel="noopener">${I.ext} Kaart</a>`
              : Unknown('Geen coördinaat in de bron')}</dd>
          </dl>
          ${!l.y ? `<div class="note">${I.map}<span>Geen coördinaat vastgelegd. De navigatieknop zoekt op straatnaam — dat brengt je in de buurt, niet naar de kast.</span></div>` : ''}
          ${geenSpecs ? `<div class="note">${I.info}<span>Fabrikant, VRA en voltage zijn voor het ${esc(c.naam)}-contract nog niet vastgelegd.</span></div>` : ''}
        </div>

        ${stappen.length ? `
        <div class="panel">
          <div class="eyebrow panel-head"><span>Na de storing</span><span class="sep">·</span><span>${stappen.length} stappen</span></div>
          <ul class="steps">${stappen.map((s, i) => `
            <li><button class="step" data-step="${l.s}-${i}" aria-pressed="${state.gedaan.has(l.s + '-' + i)}">
              <span class="step-box">${I.check}</span><span class="step-text">${esc(s)}</span>
            </button></li>`).join('')}</ul>
        </div>` : ''}

        ${(c.procedure || c.stappen) ? ProcedurePanel(c) : ''}
        ${c.contact ? ContactCard(c.contact) : ''}

        <div class="panel">
          <div class="eyebrow panel-head"><span>Contract</span></div>
          <div class="card-head">
            <span class="card-id">${I.doc}${esc(c.naam)}</span>
            <button class="btn btn-subtle btn-sm" data-route="c" data-param="${c.id}">Bekijken ${I.chev}</button>
          </div>
        </div>

        <div class="only-narrow">${acties}</div>
      </div>

      <aside class="loc-aside only-wide">${respons}${acties}</aside>
    </div>`;
};

V.contracten = () => `
  <div class="section">
    <h1 style="font:var(--t-display)">Contracten</h1>
    <div class="card-meta">${CONTRACTEN.length} opdrachtgevers · <span class="mono">${LOCATIES.length.toLocaleString('nl-NL')}</span> locaties · bron ${DATA_VERSIE}</div>
  </div>
  <div class="grid grid-3">${CONTRACTEN.map(ContractCard).join('')}</div>`;

V.c = (id) => {
  const c = C(id);
  if (!c) return EmptyState('Onbekend contract', 'Dit contract bestaat niet.');
  const rows = LOCATIES.filter(l => l.c === id);
  return `
    <div class="section">
      <h1 style="font:var(--t-display)">${esc(c.naam)}</h1>
      <div class="card-meta">
        ${c.regime ? `<span class="badge badge-accent">${esc(c.regime)}</span>` : ''}
        <span class="mono">${c.n.toLocaleString('nl-NL')}</span>
        <span>${id === 'htm' ? 'haltes' : 'locaties'}</span>
        <span class="sep">·</span><span class="mono">bron ${DATA_VERSIE}</span>
      </div>
    </div>

    <div class="section">${ResponsePanel(id)}</div>

    <div class="section grid grid-2">
      <div class="panel" style="margin-top:0">
        <div class="eyebrow panel-head"><span>Schade-afhandeling</span></div>
        <div style="font:var(--t-title)">${c.schade ? esc(c.schade) : Unknown()}</div>
      </div>
      <div class="panel" style="margin-top:0">
        <div class="eyebrow panel-head"><span>Systemen</span></div>
        ${c.systemen.length
          ? c.systemen.map(k => `<div style="display:flex;align-items:center;gap:var(--s2);min-height:32px">
              <span style="color:var(--text-tertiary);display:flex">${I.link}</span><span>${esc(SYSTEMEN[k].naam)}</span></div>`).join('')
          : '<p style="color:var(--text-unknown)">Geen klantsysteem vastgelegd.</p>'}
      </div>
    </div>

    <div class="section">${ProcedurePanel(c)}</div>
    ${c.contact ? `<div class="section">${ContactCard(c.contact)}</div>` : ''}

    <div class="section">
      <div class="section-head"><div class="eyebrow"><span>Locaties</span><span class="sep">·</span><span>${rows.length.toLocaleString('nl-NL')}</span></div></div>
      ${LocationTable(rows, 'ctbl')}
    </div>`;
};

V.responstijden = () => `
  <div class="section">
    <h1 style="font:var(--t-display)">Responstijden</h1>
    <div class="card-meta">Alle ${CONTRACTEN.length} contracten · bron ${DATA_VERSIE}</div>
  </div>
  <div class="tablewrap">
    <table>
      <thead><tr><th>Opdrachtgever</th><th>Urgent</th><th>Niet-urgent</th><th class="col-gem">Schade</th></tr></thead>
      <tbody>
        ${CONTRACTEN.map(c => `
          <tr data-route="c" data-param="${c.id}">
            <td class="c-loc">${esc(c.naam)}${c.regime ? ' <span class="badge" style="margin-left:6px">DS+V</span>' : ''}</td>
            <td>${c.type === 'nvt' ? Unknown()
              : `<span class="mono">${esc(c.urgent)}</span>${c.uitz ? ' <span class="badge badge-amber">uitz.</span>' : ''}${c.type === 'bis' ? ' <span class="badge badge-accent">BIS</span>' : ''}`}</td>
            <td>${c.nietUrgent ? esc(c.nietUrgent) : Unknown()}</td>
            <td class="col-gem">${c.schade ? esc(c.schade) : Unknown()}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="tablefoot">
      <span>uitz. = uitzondering op kruispuntniveau · BIS = waarde staat in een ander systeem</span>
      <span class="mono">bron ${DATA_VERSIE}</span>
    </div>
  </div>`;

V.schade = () => {
  const g = {};
  CONTRACTEN.forEach(c => { const k = c.schade || 'Niet vastgelegd'; (g[k] = g[k] || []).push(c); });
  return `
    <div class="section">
      <h1 style="font:var(--t-display)">Schade-afhandeling</h1>
      <div class="card-meta">Gegroepeerd op methode · bron ${DATA_VERSIE}</div>
    </div>
    ${Object.entries(g).map(([m, cs]) => `
      <div class="section">
        <div class="section-head"><div class="eyebrow"><span>${esc(m)}</span><span class="sep">·</span><span>${cs.length}</span></div></div>
        <div class="grid grid-3">${cs.map(c => `
          <button class="card" data-route="c" data-param="${c.id}">
            <div class="card-head"><span class="card-id">${I.doc}${esc(c.naam)}</span></div>
            <div class="card-meta">${m === 'Niet vastgelegd' ? Unknown() : esc(m)}</div>
          </button>`).join('')}</div>
      </div>`).join('')}`;
};

V.procedures = () => {
  const met = CONTRACTEN.filter(c => c.procedure || c.stappen);
  const zonder = CONTRACTEN.filter(c => !c.procedure && !c.stappen);
  return `
    <div class="section">
      <h1 style="font:var(--t-display)">Procedures</h1>
      <div class="card-meta">${met.length} van ${CONTRACTEN.length} opdrachtgevers heeft een vastgelegde werkwijze</div>
    </div>
    <div class="section">
      <div class="section-head"><div class="eyebrow"><span>Algemeen</span></div></div>
      <div class="grid grid-3">
        ${['Verkeersregelaars','Afzettingen','Vrachtwagen'].map(t => `
          <div class="card" style="cursor:default">
            <div class="card-head"><span class="card-id">${I.list}${t}</span></div>
            <div class="card-meta"><span class="unknown" title="Deze sectie is leeg in het brondocument">Nog niet ingevuld</span></div>
          </div>`).join('')}
      </div>
    </div>
    <div class="section">
      <div class="section-head"><div class="eyebrow"><span>Per opdrachtgever</span><span class="sep">·</span><span>${met.length}</span></div></div>
      <div class="grid grid-2">
        ${met.map(c => `<button class="card" data-route="c" data-param="${c.id}">
          <div class="card-head">
            <span class="card-id">${I.doc}${esc(c.naam)}</span>
            ${c.stappen ? `<span class="badge">${c.stappen.length} stappen</span>` : ''}
          </div>
          <div class="card-title">${esc((c.procedure || c.stappen[0]).slice(0, 100))}…</div>
        </button>`).join('')}
      </div>
    </div>
    <div class="section">
      <div class="section-head"><div class="eyebrow"><span>Zonder werkwijze</span><span class="sep">·</span><span>${zonder.length}</span></div></div>
      <p style="color:var(--text-unknown)">${zonder.map(c => esc(c.naam)).join(' · ')}</p>
    </div>`;
};

V.systemen = () => `
  <div class="section">
    <h1 style="font:var(--t-display)">Systemen</h1>
    <div class="card-meta">Externe systemen en inloggegevens</div>
  </div>
  <div class="grid grid-2">${Object.keys(SYSTEMEN).map(k => SystemCard(k)).join('')}</div>`;

V.favorieten = () => {
  const f = [...state.favorieten].map(bySlug).filter(Boolean);
  if (!f.length) return `<div class="empty">${I.star}
    <h3>Nog geen favorieten</h3>
    <p>Werk je vaker aan dezelfde kruispunten? Tik op de ster bij een locatie om hem hier te bewaren.</p>
    <div class="suggestions"><button class="pill" data-route="zoeken">Zoek een kruispunt</button></div>
  </div>`;
  return `<div class="section">
      <h1 style="font:var(--t-display)">Favorieten</h1>
      <div class="card-meta">${f.length} bewaard op dit toestel</div>
    </div>
    <div class="grid grid-3">${f.map(l => LocationCard(l)).join('')}</div>`;
};

const Lock = wat => `<div class="empty">${I.lock}
  <h3>${esc(wat)} is afgeschermd</h3>
  <p>Dit onderdeel is alleen voor de contentbeheerder. Ontgrendel het in Instellingen.</p>
  <div class="suggestions"><button class="pill" data-route="instellingen">Naar Instellingen</button></div>
</div>`;

V.data = () => {
  if (!state.beheer) return Lock('Databeheer');
  const gaten = bouwCSV('gaten').n;
  const rap = state.import;

  const rapport = !rap ? '' : `
    <div class="panel" style="border-color:${rap.fout.length ? 'var(--signal-amber)' : 'var(--signal-green)'}">
      <div class="eyebrow panel-head"><span>Controle</span><span class="sep">·</span><span>${esc(rap.bestand)}</span></div>
      <div class="import-sum">
        <div class="import-stat"><div class="import-n mono">${rap.n}</div><div class="import-lbl">rijen gelezen</div></div>
        <div class="import-stat"><div class="import-n mono" style="color:var(--signal-green)">${rap.wijz.length}</div><div class="import-lbl">velden gevuld</div></div>
        <div class="import-stat"><div class="import-n mono" style="color:${rap.fout.length ? 'var(--signal-red)' : 'var(--text-tertiary)'}">${rap.fout.length}</div><div class="import-lbl">fout${rap.fout.length === 1 ? '' : 'en'}</div></div>
      </div>

      ${rap.fout.length ? `
        <div class="note note-warn" style="margin-top:var(--s5)">${I.warn}
          <span><strong>${rap.fout.length} rij${rap.fout.length > 1 ? 'en worden' : ' wordt'} overgeslagen.</strong>
          De rest kun je gewoon publiceren — corrigeer deze in Excel en importeer opnieuw.</span>
        </div>
        <div class="tablewrap" style="margin-top:var(--s3)">
          <table><thead><tr><th>Regel</th><th>Kruispunt</th><th>Veld</th><th>Waarde</th><th class="col-gem">Reden</th></tr></thead>
          <tbody>${rap.fout.slice(0, 50).map(f => `<tr>
            <td class="c-id">${f.r}</td><td class="c-id">${esc(f.slug)}</td><td>${esc(f.veld)}</td>
            <td class="c-id" style="color:var(--signal-red)">${esc(f.w)}</td>
            <td class="col-gem">${esc(f.reden)}</td></tr>`).join('')}</tbody></table>
        </div>` : ''}

      ${rap.wijz.length ? `
        <div class="eyebrow" style="margin:var(--s6) 0 var(--s3)"><span>Wat er verandert</span><span class="sep">·</span><span>${rap.wijz.length}</span></div>
        <div class="tablewrap">
          <table><thead><tr><th>Kruispunt</th><th>Veld</th><th>Nu</th><th>Wordt</th></tr></thead>
          <tbody>${rap.wijz.slice(0, 40).map(w => `<tr>
            <td class="c-id">${esc(w.nr)}</td>
            <td>${({ f:'Fabrikant', v:'VRA-nummer', e:'Voltage', ob:'Objectnummer', geo:'Coördinaten' })[w.veld]}</td>
            <td>${w.van ? esc(w.van) : Unknown()}</td>
            <td class="c-id" style="color:var(--signal-green)">${esc(w.naar)}
              ${w.genorm ? `<span class="badge" style="margin-left:6px" title="Ingevoerd als: ${esc(w.genorm)}">genormaliseerd</span>` : ''}
            </td></tr>`).join('')}</tbody></table>
          ${rap.wijz.length > 40 ? `<div class="tablefoot"><span>+ ${rap.wijz.length - 40} meer</span></div>` : ''}
        </div>` : `<div class="note" style="margin-top:var(--s5)">${I.info}<span>Geen wijzigingen — alle waarden staan er al zo in.</span></div>`}

      <div style="display:flex;gap:var(--s2);margin-top:var(--s6);flex-wrap:wrap">
        <button class="btn btn-primary" data-publiceer ${rap.wijz.length ? '' : 'disabled'}>
          ${I.check} Publiceer ${rap.wijz.length} wijziging${rap.wijz.length === 1 ? '' : 'en'}
        </button>
        <button class="btn btn-secondary" data-annuleer>Annuleren</button>
      </div>
    </div>`;

  return `
    <div class="section">
      <h1 style="font:var(--t-display)">Databeheer</h1>
      <div class="card-meta">Bron ${DATA_VERSIE} · <span class="mono">${LOCATIES.length.toLocaleString('nl-NL')}</span> locaties</div>
    </div>

    ${DataQualityPanel()}

    <div class="panel">
      <div class="eyebrow panel-head"><span>Aanvullen via Excel</span></div>
      <ol class="flow">
        <li class="flow-step"><span class="flow-n mono">1</span><div>
          <div class="flow-t">Exporteer</div>
          <div class="flow-d">Puntkomma's, UTF-8 en decimale komma's — opent netjes in Nederlandse Excel.</div>
          <div style="display:flex;gap:var(--s2);margin-top:var(--s3);flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" data-export="gaten">${I.doc} Alleen gaten (${gaten.toLocaleString('nl-NL')})</button>
            <button class="btn btn-subtle btn-sm" data-export="alles">Alles (${LOCATIES.length.toLocaleString('nl-NL')})</button>
          </div>
        </div></li>

        <li class="flow-step"><span class="flow-n mono">2</span><div>
          <div class="flow-t">Vul aan in Excel</div>
          <div class="flow-d">Laat leeg wat je niet weet — die velden blijven ongemoeid. Wijzig nooit de kolom <span class="mono">slug</span>: dat is de sleutel.</div>
        </div></li>

        <li class="flow-step"><span class="flow-n mono">3</span><div>
          <div class="flow-t">Importeer en controleer</div>
          <div class="flow-d">Elk veld wordt gecontroleerd vóórdat er iets verandert. Fouten worden getoond, niet stilzwijgend overgenomen.</div>
          <div style="margin-top:var(--s3)">
            <label class="btn btn-primary btn-sm" style="cursor:pointer">${I.doc} Kies CSV-bestand
              <input type="file" id="csv-in" accept=".csv,text/csv" hidden>
            </label>
          </div>
        </div></li>

        <li class="flow-step"><span class="flow-n mono">4</span><div>
          <div class="flow-t">Publiceer en zet online</div>
          <div class="flow-d">Na publiceren download je het nieuwe <span class="mono">data.js</span> en zet je dat op de server. Zie Instellingen → Beheer.</div>
        </div></li>
      </ol>
    </div>

    ${rapport}`;
};

V.instellingen = () => {
  const el = document.documentElement;
  return `
    <div class="section">
      <h1 style="font:var(--t-display)">Instellingen</h1>
      <div class="card-meta">Bron ${DATA_VERSIE} · app 1.0</div>
    </div>

    <div class="panel">
      <div class="eyebrow panel-head"><span>Weergave</span></div>
      <dl class="kv">
        <dt>Thema</dt><dd><div class="seg">
          <button data-theme-set="dark"  aria-pressed="${el.dataset.theme === 'dark'}">Donker</button>
          <button data-theme-set="light" aria-pressed="${el.dataset.theme === 'light'}">Licht</button>
        </div></dd>
        <dt>Dichtheid</dt><dd><div class="seg">
          <button data-dens-set="veld"   aria-pressed="${el.dataset.density === 'veld'}">Veld</button>
          <button data-dens-set="bureau" aria-pressed="${el.dataset.density === 'bureau'}">Bureau</button>
        </div></dd>
      </dl>
      <div class="cred-note">${I.info}<span>Veld = grotere raakvlakken en tekst, voor handschoenen. Bureau = compact, voor de muis.</span></div>
    </div>

    <div class="panel">
      <div class="eyebrow panel-head"><span>Verbinding</span></div>
      <dl class="kv">
        <dt>Status</dt>
        <dd><span class="dot ${state.online ? 'dot-on' : 'dot-off'}"></span>
          ${state.online ? 'Online' : 'Offline — de app werkt gewoon door'}</dd>
        <dt>Bronversie</dt><dd class="mono">${DATA_VERSIE}</dd>
        <dt>Locaties</dt><dd class="mono">${LOCATIES.length.toLocaleString('nl-NL')}</dd>
      </dl>
      <div class="cred-note">${I.info}<span>Alle gegevens staan op dit toestel. Zoeken, contracten en procedures werken zonder internet. Alleen externe systemen (logboek, CityView, Maps) hebben verbinding nodig.</span></div>
    </div>

    <div class="panel">
      <div class="eyebrow panel-head"><span>Beheer</span></div>
      ${state.beheer ? `
        <div style="display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap">
          <span class="badge badge-green">${I.check} Ontgrendeld</span>
          <button class="btn btn-secondary btn-sm" data-lock style="margin-left:auto">Vergrendel</button>
        </div>
        <div style="display:flex;gap:var(--s2);margin-top:var(--s4);flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" data-route="data">${I.chart} Databeheer</button>
          <button class="btn btn-secondary btn-sm" data-datajs>${I.doc} Download data.js</button>
        </div>
        <div class="cred-note">${I.info}<span>Wijzigingen die je publiceert gelden alleen op dít toestel, totdat je <span class="mono">data.js</span> downloadt en op de server plaatst. Dan zien alle monteurs ze.</span></div>
      ` : `
        <p style="color:var(--text-secondary);font:var(--t-body-sm);margin-bottom:var(--s4)">
          Databeheer is afgeschermd.
        </p>
        <div style="display:flex;gap:var(--s2);flex-wrap:wrap">
          <label class="search" style="flex:1;min-width:200px">${I.lock}
            <input id="pw" type="password" placeholder="Beheerwachtwoord" autocomplete="off">
          </label>
          <button class="btn btn-primary" data-unlock>Ontgrendelen</button>
        </div>
        <div id="pw-err" hidden class="note note-warn" style="margin-top:var(--s3)">${I.warn}<span>Onjuist wachtwoord.</span></div>
        <div class="cred-note">${I.info}<span>Het beheerwachtwoord wordt op de server gecontroleerd. Na inloggen blijft deze browser maximaal 8 uur ontgrendeld.</span></div>
      `}
    </div>

    <div class="panel">
      <div class="eyebrow panel-head"><span>Onderhoud</span></div>
      <div style="display:flex;gap:var(--s2);flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" data-herlaad>Gegevens vernieuwen</button>
        <button class="btn btn-danger btn-sm" data-wis>Lokale gegevens wissen</button>
      </div>
      <div class="cred-note">${I.info}<span>Wissen verwijdert je favorieten, afvinklijstjes en de offline cache. De handboekgegevens blijven.</span></div>
    </div>`;
};

/* ══════════════════════════════════════════════════════════════════
   NAVIGATIE + ROUTER
   ══════════════════════════════════════════════════════════════════ */

const NAV = [
  ['start', I.home, 'Start'], ['zoeken', I.search, 'Zoeken'],
  ['contracten', I.doc, 'Contracten'], ['responstijden', I.clock, 'Responstijden'],
  ['schade', I.warn, 'Schade'], ['procedures', I.list, 'Procedures'],
  ['systemen', I.link, 'Systemen'], ['favorieten', I.star, 'Favorieten'],
];
const NAV_BEHEER = [['data', I.chart, 'Databeheer']];
const TABS = [
  ['start', I.home, 'Start'], ['zoeken', I.search, 'Zoeken'],
  ['favorieten', I.star, 'Favoriet'], ['instellingen', I.more, 'Meer'],
];
const TITELS = {
  start: 'Handboek VRI', zoeken: 'Zoeken', l: 'Locatie', contracten: 'Contracten', c: 'Contract',
  responstijden: 'Responstijden', schade: 'Schade', procedures: 'Procedures', systemen: 'Systemen',
  favorieten: 'Favorieten', data: 'Databeheer', instellingen: 'Instellingen',
};

function go(route, param = null) {
  location.hash = param ? `${route}/${param}` : route;
}

function leesHash() {
  const [r, ...rest] = (location.hash.replace('#', '') || 'start').split('/');
  state.route = V[r] ? r : 'start';
  state.param = rest.join('/') || null;
}

function render() {
  const view = document.getElementById('view');
  view.innerHTML = V[state.route](state.param);

  const nav = document.getElementById('nav-main');
  nav.innerHTML = NAV.map(([r, ic, t]) =>
    `<button class="navlink" data-route="${r}" ${state.route === r ? 'aria-current="page"' : ''}>${ic}<span>${t}</span></button>`).join('');

  const beheer = document.getElementById('nav-beheer');
  beheer.style.display = state.beheer ? '' : 'none';
  document.getElementById('nav-beheer-links').innerHTML = NAV_BEHEER.map(([r, ic, t]) =>
    `<button class="navlink" data-route="${r}" ${state.route === r ? 'aria-current="page"' : ''}>${ic}<span>${t}</span></button>`).join('');

  document.getElementById('bottomnav').innerHTML = TABS.map(([r, ic, t]) =>
    `<button class="tab" data-route="${r}" ${state.route === r ? 'aria-current="page"' : ''}>${ic}<span>${t}</span></button>`).join('');

  const sub = ['l', 'c'].includes(state.route);
  const l = state.route === 'l' ? bySlug(state.param) : null;
  document.getElementById('topbar-left').innerHTML = sub
    ? `<div style="display:flex;align-items:center;gap:var(--s2);min-width:0">
         <button class="iconbtn" data-terug aria-label="Terug">${I.back}</button>
         <div class="crumbs">
           ${l ? `<span>${esc(C(l.c).naam)}</span><span>/</span><span class="mono" style="color:var(--text-primary)">${esc(l.nr)}</span>`
               : `<span style="color:var(--text-primary)">${esc(C(state.param)?.naam || '')}</span>`}
         </div>
       </div>`
    : `<div class="topbar-title">${TITELS[state.route] || ''}</div>`;

  document.getElementById('status-dot').className = 'dot ' + (state.online ? 'dot-on' : 'dot-off');
  document.getElementById('status-text').textContent = state.online ? 'Online · ' + DATA_VERSIE : 'Offline · ' + DATA_VERSIE;

  if (l) {
    const fav = state.favorieten.has(l.s);
    document.querySelector('.topbar-actions').insertAdjacentHTML('afterbegin',
      `<button class="iconbtn ${fav ? 'is-on' : ''}" data-fav="${l.s}" aria-label="Favoriet">${I.star}</button>`);
  }

  if (state.route === 'c') virtualiseer('ctbl', LOCATIES.filter(x => x.c === state.param));

  requestAnimationFrame(() => {
    document.querySelectorAll('[data-fill]').forEach(el => { el.style.width = Math.min(100, +el.dataset.fill) + '%'; });
  });

  if (state.route === 'zoeken') document.getElementById('q')?.focus();
  window.scrollTo(0, 0);
}

/* ══════════════════════════════════════════════════════════════════
   INTERACTIE
   ══════════════════════════════════════════════════════════════════ */

let pwTimer;

document.addEventListener('click', async e => {
  const t = e.target.closest('[data-route],[data-copy],[data-step],[data-fav],[data-zoek],[data-theme-set],[data-dens-set],[data-unlock],[data-lock],[data-toonpw],[data-export],[data-annuleer],[data-publiceer],[data-datajs],[data-herlaad],[data-wis],[data-terug]');
  if (!t) return;

  if (t.hasAttribute('data-terug')) { history.back(); return; }
  if (t.dataset.route) { go(t.dataset.route, t.dataset.param || null); return; }
  if (t.dataset.zoek)  { state.q = t.dataset.zoek; go('zoeken'); return; }

  if (t.dataset.copy) {
    navigator.clipboard?.writeText(t.dataset.copy).catch(() => {});
    navigator.vibrate?.(8);
    toast(`"${t.dataset.copy}" gekopieerd`);
    return;
  }

  if (t.dataset.step) {
    const k = t.dataset.step;
    state.gedaan.has(k) ? state.gedaan.delete(k) : state.gedaan.add(k);
    t.setAttribute('aria-pressed', state.gedaan.has(k));
    store.set('gedaan', [...state.gedaan]);
    navigator.vibrate?.(8);
    return;
  }

  if (t.dataset.fav) {
    const s = t.dataset.fav;
    state.favorieten.has(s) ? state.favorieten.delete(s) : state.favorieten.add(s);
    t.classList.toggle('is-on');
    store.set('fav', [...state.favorieten]);
    toast(state.favorieten.has(s) ? 'Bewaard bij favorieten' : 'Verwijderd uit favorieten');
    return;
  }

  if (t.dataset.themeSet) { document.documentElement.dataset.theme = t.dataset.themeSet; store.set('theme', t.dataset.themeSet); render(); return; }
  if (t.dataset.densSet)  { document.documentElement.dataset.density = t.dataset.densSet; store.set('dens', t.dataset.densSet); render(); return; }

  if (t.hasAttribute('data-toonpw')) {
    state.toonPw = !state.toonPw;
    render();
    clearTimeout(pwTimer);
    if (state.toonPw) pwTimer = setTimeout(() => { state.toonPw = false; render(); }, 30000);
    return;
  }

  if (t.hasAttribute('data-unlock')) {
    const pw = document.getElementById('pw');
    t.disabled = true;
    try {
      const r = await fetch('/api/vri-admin?action=login', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({password:pw.value}) });
      if (r.ok) { state.beheer = true; render(); toast('Beheer ontgrendeld'); }
      else { document.getElementById('pw-err').hidden = false; pw.value = ''; pw.focus(); t.disabled = false; }
    } catch { document.getElementById('pw-err').hidden = false; t.disabled = false; }
    return;
  }
  if (t.hasAttribute('data-lock')) { await fetch('/api/vri-admin?action=logout', {method:'POST'}).catch(()=>{}); state.beheer = false; state.import = null; go('instellingen'); render(); toast('Beheer vergrendeld'); return; }

  if (t.dataset.export) {
    const { csv, n } = bouwCSV(t.dataset.export);
    download(`handboek-vri-${t.dataset.export}-${DATA_VERSIE}.csv`, csv);
    toast(`${n.toLocaleString('nl-NL')} rijen geëxporteerd`);
    return;
  }
  if (t.hasAttribute('data-annuleer')) { state.import = null; render(); return; }
  if (t.hasAttribute('data-publiceer')) {
    const n = state.import.wijz.length;
    const nu = new Date();
    publiceer(state.import.wijz, `${nu.getFullYear()}.${String(nu.getMonth() + 1).padStart(2, '0')}`);
    render();
    toast(`${n} velden gepubliceerd · bron ${DATA_VERSIE}`);
    document.getElementById('updatebar').hidden = false;
    return;
  }
  if (t.hasAttribute('data-datajs')) {
    download('data.js', exportDataJs(), 'text/javascript;charset=utf-8');
    toast('data.js gedownload — plaats hem in assets/ op de server');
    return;
  }
  if (t.hasAttribute('data-herlaad')) { location.reload(); return; }
  if (t.hasAttribute('data-wis')) {
    try { localStorage.clear(); } catch {}
    caches?.keys().then(ks => ks.forEach(k => caches.delete(k)));
    toast('Gewist — de app wordt opnieuw geladen');
    setTimeout(() => location.reload(), 900);
    return;
  }
});

document.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  state.q = e.target.value;
  if (state.route !== 'zoeken') { go('zoeken'); setTimeout(() => document.getElementById('q')?.focus(), 0); return; }
  const pos = e.target.selectionStart;
  document.getElementById('view').innerHTML = V.zoeken();
  const inp = document.getElementById('q');
  inp.focus();
  inp.setSelectionRange(pos, pos);
});

document.addEventListener('change', e => {
  if (e.target.id !== 'csv-in') return;
  const f = e.target.files?.[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const rijen = parseCSV(r.result);
      if (!rijen.length) return toast('Het bestand bevat geen rijen');
      state.import = { ...valideer(rijen), bestand: f.name };
      render();
      document.querySelector('[data-publiceer]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch { toast('Dit bestand kon niet gelezen worden'); }
  };
  r.readAsText(f, 'UTF-8');
});

/* ── Command palette ────────────────────────────────────────────── */
const pal = document.getElementById('palette');
const palQ = document.getElementById('palette-q');
const palB = document.getElementById('palette-body');

const palItem = (l, i) => `
  <button class="palette-item ${i === 0 ? 'is-active' : ''}" data-pal="${l.s}">
    ${typeIcon(l.t)}
    <span class="pi-id">${esc(l.nr)}</span>
    <span class="pi-main">
      <span class="pi-title">${l.l ? esc(l.l) : '—'}</span>
      <span class="pi-meta">${esc(C(l.c).naam)}${l.g ? ' · ' + esc(l.g) : ''}</span>
    </span>
    <span class="pi-hint">⏎</span>
  </button>`;

function renderPal(q) {
  const hits = zoek(q, 25);
  state.palHits = hits;
  state.palIdx = 0;
  if (!q) { palB.innerHTML = `<div style="padding:var(--s6);text-align:center;color:var(--text-tertiary)">Typ een kruispuntnummer of straatnaam</div>`; return; }
  if (!hits.length) { palB.innerHTML = `<div style="padding:var(--s6);text-align:center;color:var(--text-tertiary)">Geen locatie gevonden voor "${esc(q)}"</div>`; return; }
  palB.innerHTML = `<div class="palette-group"><span>Locaties</span><span class="mono">${hits.length}</span></div>` + hits.map(palItem).join('');
}

const openPal = () => { pal.hidden = false; palQ.value = ''; renderPal(''); palQ.focus(); };
const closePal = () => { pal.hidden = true; };

palQ.addEventListener('input', () => renderPal(palQ.value));
palB.addEventListener('click', e => {
  const it = e.target.closest('[data-pal]');
  if (it) { closePal(); go('l', it.dataset.pal); }
});
pal.addEventListener('click', e => { if (e.target === pal) closePal(); });

function palMove(d) {
  const items = [...palB.querySelectorAll('.palette-item')];
  if (!items.length) return;
  items[state.palIdx]?.classList.remove('is-active');
  state.palIdx = (state.palIdx + d + items.length) % items.length;
  items[state.palIdx].classList.add('is-active');
  items[state.palIdx].scrollIntoView({ block: 'nearest' });
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPal(); return; }
  if (e.key === 'Enter' && e.target.id === 'pw') { e.preventDefault(); document.querySelector('[data-unlock]')?.click(); return; }
  if (pal.hidden) return;
  if (e.key === 'Escape') closePal();
  if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
  if (e.key === 'Enter') {
    e.preventDefault();
    const l = state.palHits[state.palIdx];
    if (l) { closePal(); go('l', l.s); }
  }
});

document.getElementById('btn-palette').onclick = openPal;
document.getElementById('btn-theme').onclick = () => {
  const el = document.documentElement;
  el.dataset.theme = el.dataset.theme === 'dark' ? 'light' : 'dark';
  store.set('theme', el.dataset.theme);
};

/* ── Toast ──────────────────────────────────────────────────────── */
let toastT;
function toast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${I.check}<span>${esc(msg)}</span>`;
  document.body.appendChild(el);
  clearTimeout(toastT);
  toastT = setTimeout(() => el.remove(), 2600);
}

/* ── Netwerk ────────────────────────────────────────────────────── */
const netwerk = () => {
  state.online = navigator.onLine;
  const d = document.getElementById('status-dot');
  const t = document.getElementById('status-text');
  if (d) d.className = 'dot ' + (state.online ? 'dot-on' : 'dot-off');
  if (t) t.textContent = (state.online ? 'Online · ' : 'Offline · ') + DATA_VERSIE;
};
addEventListener('online', () => { netwerk(); toast('Weer online'); });
addEventListener('offline', () => { netwerk(); toast('Offline — de app werkt gewoon door'); });

/* ── Service worker ─────────────────────────────────────────────── */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            document.getElementById('updatebar').hidden = false;
          }
        });
      });
    }).catch(() => {});
  });
}
document.getElementById('upd-later').onclick = () => { document.getElementById('updatebar').hidden = true; };
document.getElementById('upd-now').onclick = () => location.reload();

/* ── Start ──────────────────────────────────────────────────────── */
document.documentElement.dataset.theme = store.get('theme', 'dark');
document.documentElement.dataset.density = store.get('dens', matchMedia('(min-width:1024px)').matches ? 'bureau' : 'veld');

addEventListener('hashchange', () => { leesHash(); render(); });
leesHash();
render();
document.getElementById('boot').hidden = true;
