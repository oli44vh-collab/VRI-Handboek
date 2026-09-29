/* ══════════════════════════════════════════════════════════════════
   Handboek VRI — Voorstellensysteem (Suggestion System)

   Eén generiek mechanisme waarmee monteurs gecontroleerd kunnen
   bijdragen aan de kwaliteit van het handboek, zónder de officiële
   gegevens rechtstreeks te kunnen wijzigen.

   Drie toestanden, altijd:
     • Officiële gegevens      → LOCATIES (data.js). Enige bron van waarheid.
     • Voorgesteld             → een voorstel met status 'ingediend'.
     • Afgekeurd / goedgekeurd → afgehandelde voorstellen (blijven bewaard).

   Kernregels, op één plek afgedwongen:
     1. Een monteur kan alleen een LEEG officieel veld AANVULLEN, of een
        MELDING doen. Bestaande waarden wijzigen kan hij niet.
     2. Officiële gegevens veranderen UITSLUITEND via applySuggestion(),
        die alleen bereikbaar is vanuit de beheerdersgoedkeuring.
     3. Elk voorstel draagt een volledige audittrail.

   Het systeem is GENERIEK: elk soort informatie (GPS, fabrikant, VRA,
   voltage, opmerking, en later foto/document/contact/procedure) loopt
   via dezelfde workflow. Een nieuw soort toevoegen = één regel in
   SUGGESTION_KINDS. Nergens anders.

   Deze laag hangt ná app.js en wijzigt de bestaande code niet.
   ══════════════════════════════════════════════════════════════════ */

'use strict';

(function () {

/* ── Opslag ─────────────────────────────────────────────────────────
   Voorstellen staan STRIKT gescheiden van de officiële data.
   Officieel = LOCATIES. Voorstellen = eigen sleutel.

   Let op — belangrijk voor de uitrol: localStorage is per toestel.
   Een voorstel van monteur A verschijnt op dít toestel; niet vanzelf
   bij de beheerder. Voor echt gedeeld gebruik moet de opslag naar een
   gedeelde bron. Dat is bewust een VERWISSELBARE laag: alleen de vier
   functies hieronder (load/save/exportQueue/importQueue) hoeven dan te
   verwijzen naar een /api-eindpunt in plaats van localStorage. De rest
   van dit bestand — het model, de workflow, de audittrail — blijft
   ongewijzigd. Zie LEESMIJ.md, sectie Voorstellensysteem. */

const KEY = 'suggesties';
let VOORSTELLEN = store.get(KEY, []);
const bewaar = () => store.set(KEY, VOORSTELLEN);

const nu = () => new Date().toISOString();
const genId = () => 'sg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);

/* ── Identiteit ─────────────────────────────────────────────────────
   Voor de audittrail ("wie heeft het ingediend"). Nu: één keer een
   naam vragen, lokaal onthouden. In productie levert Entra ID de
   identiteit automatisch (x-ms-client-principal); dan vervalt de vraag. */
const getMonteur = () => store.get('monteur', null);
const setMonteur = n => { store.set('monteur', n); };
const getBeheerder = () => store.get('beheerder-naam', 'Beheerder');

/* ══════════════════════════════════════════════════════════════════
   REGISTER VAN SOORTEN — dít is het uitbreidingspunt.

   Elk soort verklaart:
     mode      'add'    vult een leeg officieel veld aan
               'report' meldt iets over bestaande data — wijzigt niets
               'note'   vrije bijdrage — hangt aan de locatie, geen veld
     field     welk officieel veld het raakt ('geo','f','v','e') of null
     applies   wanneer mag een monteur dit voorstellen voor deze locatie?
     leeg      is het officiële veld nog leeg? (bewaakt regel 1)
     validate  hergebruikt dezelfde controles als de CSV-import
     apply     schrijft het officiële veld — ALLEEN aangeroepen bij
               goedkeuring, alleen voor mode 'add'
     toon      hoe render je een voorgestelde waarde leesbaar
   ══════════════════════════════════════════════════════════════════ */

const SUGGESTION_KINDS = {

  geo: {
    id: 'geo', label: 'GPS-coördinaat', icon: 'pin', mode: 'add', field: 'geo', beschikbaar: true,
    applies: l => !l.y,
    leeg:    l => !l.y,
    huidig:  l => (l.y != null ? { y: l.y, x: l.x } : null),
    validate: v => {
      const y = getal(v && v.y), x = getal(v && v.x);
      if (y == null || x == null) return { ok: false, reden: 'Coördinaat onvolledig' };
      if (!inNL(y, x)) return { ok: false, reden: 'Coördinaat ligt buiten Nederland' };
      return { ok: true };
    },
    apply: (l, v) => { l.y = +(+v.y).toFixed(6); l.x = +(+v.x).toFixed(6); if (l.q === 'fout') delete l.q; },
    toon: v => (v && v.y != null ? `${(+v.y).toFixed(5)}, ${(+v.x).toFixed(5)}` : '—'),
  },

  geo_report: {
    id: 'geo_report', label: 'Locatie klopt niet', icon: 'warn', mode: 'report', field: null, beschikbaar: true,
    applies: l => !!l.y,
    huidig:  l => (l.y != null ? { y: l.y, x: l.x } : null),
    validate: v => (v && String(v.reden || '').trim().length >= 3 ? { ok: true } : { ok: false, reden: 'Geef kort aan wat er niet klopt' }),
    apply: () => {},
    toon: v => esc((v && v.reden) || ''),
  },

  fabrikant: {
    id: 'fabrikant', label: 'Fabrikant', icon: 'doc', mode: 'add', field: 'f', beschikbaar: true,
    applies: l => l.t !== 'halte' && !l.f,
    leeg:    l => !l.f,
    huidig:  l => l.f || null,
    validate: v => (fabResolve(v) ? { ok: true } : { ok: false, reden: 'Kies een bekende fabrikant' }),
    apply: (l, v) => { l.f = fabResolve(v); },
    toon: v => esc(fabResolve(v) || v || ''),
  },

  vra: {
    id: 'vra', label: 'VRA-nummer', icon: 'doc', mode: 'add', field: 'v', beschikbaar: true,
    applies: l => l.t !== 'halte' && !l.v,
    leeg:    l => !l.v,
    huidig:  l => l.v || null,
    validate: v => (/^[A-Za-z0-9.\-/]{3,24}$/.test(String(v || '').trim()) ? { ok: true } : { ok: false, reden: 'Ongeldig VRA-formaat' }),
    apply: (l, v) => { l.v = String(v).trim(); },
    toon: v => esc(v || ''),
  },

  voltage: {
    id: 'voltage', label: 'Voltage', icon: 'doc', mode: 'add', field: 'e', beschikbaar: true,
    applies: l => l.t !== 'halte' && !l.e,
    leeg:    l => !l.e,
    huidig:  l => l.e || null,
    validate: v => (VOLTAGES.includes(v) ? { ok: true } : { ok: false, reden: 'Moet ' + VOLTAGES.join(' of ') + ' zijn' }),
    apply: (l, v) => { l.e = v; },
    toon: v => esc(v || ''),
  },

  opmerking: {
    id: 'opmerking', label: 'Opmerking', icon: 'info', mode: 'note', field: null, beschikbaar: true,
    applies: () => true,
    validate: v => (String((v && v.tekst) || '').trim().length >= 3 ? { ok: true } : { ok: false, reden: 'Schrijf een korte opmerking' }),
    apply: () => {},
    toon: v => esc((v && v.tekst) || ''),
  },

  /* ── Toekomstig — het register kent ze al, de workflow verandert niet.
     'beschikbaar:false' houdt ze uit de monteur-UI tot ze zijn afgebouwd.
     Foto's en documenten vragen om blob-opslag (niet localStorage); die
     komen tegelijk met de gedeelde backend. Zie LEESMIJ.md. */
  foto:      { id: 'foto',      label: "Foto toevoegen",        icon: 'doc',   mode: 'note', field: null, beschikbaar: false, applies: () => true, validate: () => ({ ok: false, reden: 'Nog niet beschikbaar' }), apply: () => {}, toon: () => '—' },
  document:  { id: 'document',  label: 'Document toevoegen',    icon: 'doc',   mode: 'note', field: null, beschikbaar: false, applies: () => true, validate: () => ({ ok: false, reden: 'Nog niet beschikbaar' }), apply: () => {}, toon: () => '—' },
  contact:   { id: 'contact',   label: 'Contactpersoon',        icon: 'users', mode: 'note', field: null, beschikbaar: false, applies: () => true, validate: () => ({ ok: false, reden: 'Nog niet beschikbaar' }), apply: () => {}, toon: () => '—' },
  procedure: { id: 'procedure', label: 'Procedure verbeteren',  icon: 'list',  mode: 'note', field: null, beschikbaar: false, applies: () => true, validate: () => ({ ok: false, reden: 'Nog niet beschikbaar' }), apply: () => {}, toon: () => '—' },
};

const KIND = id => SUGGESTION_KINDS[id];

/* ══════════════════════════════════════════════════════════════════
   WORKFLOW
   ══════════════════════════════════════════════════════════════════ */

/** Een voorstel indienen. Dwingt regel 1 af: 'add' mag alleen op een
    leeg veld; bestaande waarden kunnen alleen via 'report'. */
function indienen(kindId, slug, waarde, toelichting) {
  const k = KIND(kindId);
  const l = bySlug(slug);
  if (!k || !l) return { error: 'Onbekend soort of locatie' };
  if (!k.beschikbaar) return { error: 'Dit soort voorstel is nog niet beschikbaar' };
  if (!k.applies(l)) return { error: 'Niet van toepassing op deze locatie' };

  if (k.mode === 'add' && !k.leeg(l)) {
    // Officieel veld is al gevuld → aanvullen mag niet. Alleen melden.
    return { error: 'Dit veld is al ingevuld. Je kunt het niet wijzigen — alleen melden.' };
  }

  const v = k.validate(waarde);
  if (!v.ok) return { error: v.reden };

  const voorstel = {
    id: genId(),
    soort: kindId,
    slug,
    modus: k.mode,
    veld: k.field,
    oud: k.mode === 'add' ? (k.huidig ? k.huidig(l) : null) : (k.huidig ? k.huidig(l) : null),
    nieuw: waarde,
    toelichting: (toelichting || '').trim() || null,
    status: 'ingediend',
    // audit
    ingediend_door: getMonteur() || 'Onbekend',
    ingediend_op: nu(),
    beoordeeld_door: null,
    beoordeeld_op: null,
    beoordeling_opmerking: null,
    toegepast_waarde: null,
  };
  VOORSTELLEN.unshift(voorstel);
  bewaar();
  return { ok: true, voorstel };
}

/** Goedkeuren. De ENIGE weg waarlangs officiële data verandert.
    Voor 'add': schrijft het veld — maar alleen als het nog leeg is.
    Is het intussen gevuld (door een eerdere goedkeuring), dan blokkeert
    dit tenzij de beheerder bewust overschrijft. Nooit stilzwijgend. */
function goedkeuren(id, opties) {
  opties = opties || {};
  const s = VOORSTELLEN.find(x => x.id === id);
  if (!s) return { error: 'Voorstel niet gevonden' };
  if (s.status !== 'ingediend') return { error: 'Dit voorstel is al beoordeeld' };

  const k = KIND(s.soort);
  const l = bySlug(s.slug);
  if (!k || !l) return { error: 'Onbekend soort of locatie' };

  const waarde = (opties.gewijzigd != null ? opties.gewijzigd : s.nieuw);

  if (k.mode === 'add') {
    const val = k.validate(waarde);
    if (!val.ok) return { error: val.reden };
    if (!k.leeg(l) && !opties.overschrijf) {
      return { conflict: true, huidig: k.huidig ? k.huidig(l) : null,
               reden: 'Dit veld is inmiddels gevuld. Overschrijven vereist een bevestiging.' };
    }
    k.apply(l, waarde);
    s.toegepast_waarde = waarde;
  }
  // mode 'report' en 'note': geen wijziging aan officiële data — goedkeuren
  // betekent hier "erkend / afgehandeld".

  s.status = 'goedgekeurd';
  s.beoordeeld_door = opties.beheerder || getBeheerder();
  s.beoordeeld_op = nu();
  s.beoordeling_opmerking = (opties.opmerking || '').trim() || null;
  bewaar();
  return { ok: true, geschreven: k.mode === 'add' };
}

function afwijzen(id, opties) {
  opties = opties || {};
  const s = VOORSTELLEN.find(x => x.id === id);
  if (!s) return { error: 'Voorstel niet gevonden' };
  if (s.status !== 'ingediend') return { error: 'Dit voorstel is al beoordeeld' };
  s.status = 'afgewezen';
  s.beoordeeld_door = opties.beheerder || getBeheerder();
  s.beoordeeld_op = nu();
  s.beoordeling_opmerking = (opties.opmerking || '').trim() || null;
  bewaar();
  return { ok: true };
}

const alle = () => VOORSTELLEN.slice();
const voorSlug = slug => VOORSTELLEN.filter(s => s.slug === slug);
const openstaand = () => VOORSTELLEN.filter(s => s.status === 'ingediend');
const stats = () => ({
  ingediend: VOORSTELLEN.filter(s => s.status === 'ingediend').length,
  goedgekeurd: VOORSTELLEN.filter(s => s.status === 'goedgekeurd').length,
  afgewezen: VOORSTELLEN.filter(s => s.status === 'afgewezen').length,
});

/** Wachtrij exporteren/importeren als bestand — de brugoplossing die
    zónder backend werkt: monteur exporteert, stuurt via Teams/mail,
    beheerder importeert in de console. Zie LEESMIJ.md. */
function exportQueue(alleenOpenstaand) {
  const set = alleenOpenstaand ? openstaand() : VOORSTELLEN;
  return JSON.stringify({ type: 'vri-voorstellen', versie: 1, geexporteerd: nu(), voorstellen: set }, null, 1);
}
function importQueue(tekst) {
  let data;
  try { data = JSON.parse(tekst); } catch { return { error: 'Geen geldig JSON-bestand' }; }
  const lijst = Array.isArray(data) ? data : (data && data.voorstellen);
  if (!Array.isArray(lijst)) return { error: 'Bestand bevat geen voorstellen' };
  let nieuw = 0, dubbel = 0;
  lijst.forEach(v => {
    if (!v || !v.id || !v.soort || !v.slug) return;
    if (VOORSTELLEN.some(x => x.id === v.id)) { dubbel++; return; }
    VOORSTELLEN.unshift(v); nieuw++;
  });
  bewaar();
  return { ok: true, nieuw, dubbel };
}

/* Publieke API — ook het aanhechtpunt voor tests en voor een latere
   remote-opslag. */
window.SUG = {
  KINDS: SUGGESTION_KINDS, KIND,
  indienen, goedkeuren, afwijzen,
  alle, voorSlug, openstaand, stats,
  exportQueue, importQueue,
  getMonteur, setMonteur, getBeheerder,
  _reset: () => { VOORSTELLEN = []; bewaar(); },
};

/* ══════════════════════════════════════════════════════════════════
   UI — losse laag boven op de bestaande app
   ══════════════════════════════════════════════════════════════════ */

const ic = (naam) => (I[naam] || I.info);

/* ── Overlay / sheet ──────────────────────────────────────────────── */
let sheet;
function zorgSheet() {
  if (sheet) return;
  sheet = document.createElement('div');
  sheet.className = 'overlay';
  sheet.id = 's-sheet';
  sheet.hidden = true;
  sheet.addEventListener('click', e => { if (e.target === sheet) sluitSheet(); });
  document.body.appendChild(sheet);
}
function openSheet(html) {
  zorgSheet();
  sheet.innerHTML = `<div class="s-panel">${html}</div>`;
  sheet.hidden = false;
}
function sluitSheet() { if (sheet) { sheet.hidden = true; sheet.innerHTML = ''; } vernietigMap(); }

/* ── Identiteit vragen (één keer) ─────────────────────────────────── */
function metIdentiteit(vervolg) {
  if (getMonteur()) return vervolg();
  openSheet(`
    <div class="s-head">${ic('users')}<h3>Wie ben je?</h3></div>
    <p class="s-sub">Je naam komt bij je voorstel te staan, zodat de beheerder weet wie het heeft ingediend. Eenmalig — daarna onthoudt de app het.</p>
    <label class="search" style="margin-top:var(--s4)">${ic('users')}
      <input id="s-naam" placeholder="Voor- en achternaam" autocomplete="name">
    </label>
    <div class="s-acties">
      <button class="btn btn-subtle" data-s-close>Annuleer</button>
      <button class="btn btn-primary" data-s-identity>Verder</button>
    </div>`);
  setTimeout(() => document.getElementById('s-naam')?.focus(), 30);
  window.__naVerder = vervolg;
}

/* ══════════════════════════════════════════════════════════════════
   Bijdrage-sectie op de locatiepagina
   ══════════════════════════════════════════════════════════════════ */

function statusBadge(st) {
  const m = { ingediend: ['badge-amber', 'In behandeling'], goedgekeurd: ['badge-green', 'Goedgekeurd'], afgewezen: ['badge', 'Afgewezen'] };
  const [cls, txt] = m[st] || ['badge', st];
  return `<span class="badge ${cls}">${txt}</span>`;
}

function bijdrageSectie(slug) {
  const l = bySlug(slug);
  if (!l) return '';
  const mine = voorSlug(slug);
  const open = mine.filter(s => s.status === 'ingediend');

  // Welke aanvullingen kan de monteur doen? (alleen lege velden)
  const aanvul = ['fabrikant', 'vra', 'voltage'].map(KIND).filter(k => k.applies(l));

  const gps = !l.y
    ? `<button class="btn btn-primary btn-block" data-s-capture="${slug}">${ic('pin')} Locatie vastleggen</button>
       <p class="s-hint">Deze locatie heeft nog geen coördinaat. Leg hem vast met een pin op de kaart — je GPS is alleen het startpunt.</p>`
    : `<div class="s-inline">
         <button class="btn btn-secondary" data-s-map="${slug}">${ic('map')} Kaart tonen</button>
         <button class="btn btn-secondary" data-s-report="${slug}">${ic('warn')} Locatie klopt niet</button>
       </div>
       <p class="s-hint">De coördinaat is officieel vastgelegd en alleen-lezen. Klopt hij niet? Meld het — de beheerder kijkt ernaar.</p>`;

  return `
    <div class="panel s-panel-block">
      <div class="eyebrow panel-head"><span>Bijdragen</span>${open.length ? `<span class="sep">·</span><span>${open.length} in behandeling</span>` : ''}</div>

      <div class="s-group">
        <div class="s-group-t">${ic('pin')} Locatie</div>
        ${gps}
      </div>

      ${aanvul.length ? `
      <div class="s-group">
        <div class="s-group-t">${ic('doc')} Gegevens aanvullen</div>
        <div class="s-inline">
          ${aanvul.map(k => `<button class="pill" data-s-field="${k.id}" data-slug="${slug}">+ ${k.label}</button>`).join('')}
        </div>
        <p class="s-hint">Alleen lege velden kun je aanvullen. Ingevulde gegevens blijven ongemoeid.</p>
      </div>` : ''}

      <div class="s-group">
        <button class="btn btn-subtle btn-sm" data-s-comment="${slug}">${ic('info')} Opmerking plaatsen</button>
      </div>

      ${mine.length ? `
      <div class="s-group">
        <div class="s-group-t">Jouw voorstellen voor dit kruispunt</div>
        <div class="s-list">
          ${mine.slice(0, 8).map(s => `
            <div class="s-row-mini">
              <span class="s-row-kind">${esc(KIND(s.soort)?.label || s.soort)}</span>
              <span class="s-row-val mono">${KIND(s.soort)?.toon(s.nieuw) || ''}</span>
              ${statusBadge(s.status)}
            </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="cred-note">${ic('info')}<span>Voorstellen wijzigen de officiële gegevens niet. Pas na goedkeuring door een beheerder worden ze onderdeel van het handboek.</span></div>
    </div>`;
}

/* De locatiepagina uitbreiden zonder app.js aan te raken: de originele
   V.l inpakken en de bijdrage-sectie eronder hangen. */
const _Vl = V.l;
V.l = function (slug) {
  const basis = _Vl(slug);
  if (!bySlug(slug)) return basis;
  return basis + `<div class="section">${bijdrageSectie(slug)}</div>`;
};

/* ══════════════════════════════════════════════════════════════════
   Kaart (Leaflet, lui geladen). Alleen deze functie heeft internet
   nodig; de rest van de app blijft offline werken.
   ══════════════════════════════════════════════════════════════════ */

let leafletBezig = null;
function laadLeaflet() {
  if (window.L) return Promise.resolve();
  if (leafletBezig) return leafletBezig;
  leafletBezig = new Promise((res, rej) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = res;
    js.onerror = () => rej(new Error('leaflet'));
    document.head.appendChild(js);
    setTimeout(() => { if (!window.L) rej(new Error('timeout')); }, 7000);
  });
  return leafletBezig;
}

let kaart, kaartMarker;
function vernietigMap() { if (kaart) { try { kaart.remove(); } catch {} kaart = null; kaartMarker = null; } }

/* Redelijk startpunt zonder GPS: het zwaartepunt van de bekende
   coördinaten binnen hetzelfde contract. Beter dan het midden van NL. */
function contractMidden(l) {
  const punten = LOCATIES.filter(x => x.c === l.c && x.y);
  if (!punten.length) return [52.15, 5.4];
  const y = punten.reduce((a, p) => a + p.y, 0) / punten.length;
  const x = punten.reduce((a, p) => a + p.x, 0) / punten.length;
  return [y, x];
}

function tegels() {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap',
  });
}

/* ── Locatie vastleggen (bewerkbaar) ──────────────────────────────── */
function openCapture(slug) {
  const l = bySlug(slug);
  if (!l) return;
  metIdentiteit(() => {
    if (!navigator.onLine) return captureOffline(slug);
    openSheet(`
      <div class="s-head">${ic('pin')}<h3>Locatie vastleggen — ${esc(l.nr)}</h3></div>
      <p class="s-sub">Sleep de pin naar de kast. Je GPS is alleen het startpunt; opslaan gebeurt pas als jíj bevestigt.</p>
      <div id="s-map" class="s-map"></div>
      <div class="s-coord"><span class="mono" id="s-coord-txt">—</span><span id="s-gps-status" class="s-gps"></span></div>
      <div class="s-acties">
        <button class="btn btn-subtle" data-s-close>Annuleer</button>
        <button class="btn btn-primary" id="s-confirm" data-s-confirm="${slug}" disabled>Bevestig locatie</button>
      </div>`);
    laadLeaflet().then(() => initCaptureMap(l)).catch(() => captureOffline(slug, true));
  });
}

function initCaptureMap(l) {
  const start = contractMidden(l);
  vernietigMap();
  kaart = L.map('s-map', { zoomControl: true }).setView(start, 13);
  tegels().addTo(kaart);
  kaartMarker = L.marker(start, { draggable: true }).addTo(kaart);

  const lees = () => {
    const p = kaartMarker.getLatLng();
    window.__capture = { y: p.lat, x: p.lng };
    document.getElementById('s-coord-txt').textContent = `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
    const btn = document.getElementById('s-confirm');
    if (btn) btn.disabled = !inNL(p.lat, p.lng);
  };
  kaartMarker.on('move', lees);
  kaart.on('click', e => { kaartMarker.setLatLng(e.latlng); lees(); });
  lees();

  const gps = document.getElementById('s-gps-status');
  if (navigator.geolocation) {
    gps.textContent = 'GPS zoeken…';
    navigator.geolocation.getCurrentPosition(
      pos => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        if (inNL(c[0], c[1])) { kaart.setView(c, 17); kaartMarker.setLatLng(c); lees(); gps.textContent = 'Startpunt: jouw GPS'; }
        else gps.textContent = 'GPS buiten NL — plaats de pin handmatig';
      },
      () => { gps.textContent = 'Geen GPS — plaats de pin handmatig'; },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  } else gps.textContent = 'Geen GPS — plaats de pin handmatig';
  setTimeout(() => kaart && kaart.invalidateSize(), 60);
}

/* Offline of kaart onbereikbaar: geen kaart, maar ook nooit automatisch
   opslaan. De monteur bevestigt zijn GPS-punt bewust; het voorstel wordt
   gemarkeerd als 'niet op kaart gecontroleerd', zodat de beheerder dat ziet. */
function captureOffline(slug, kaartFaalde) {
  const l = bySlug(slug);
  const doorgaan = (c) => {
    window.__capture = c ? { y: c[0], x: c[1], ongeverifieerd: true } : null;
    openSheet(`
      <div class="s-head">${ic('pin')}<h3>Locatie vastleggen — ${esc(l.nr)}</h3></div>
      <div class="note note-warn">${ic('warn')}<span>${kaartFaalde ? 'De kaart kon niet laden.' : 'Je bent offline.'} De interactieve kaart is nu niet beschikbaar.</span></div>
      ${c ? `
        <p class="s-sub">Je huidige GPS-locatie:</p>
        <div class="s-coord"><span class="mono">${c[0].toFixed(5)}, ${c[1].toFixed(5)}</span></div>
        <p class="s-hint">Sta je precies bij de kast? Dan kun je dit punt als voorstel indienen. Het wordt gemarkeerd als 'niet op kaart gecontroleerd', zodat de beheerder het nog nakijkt.</p>
        <div class="s-acties">
          <button class="btn btn-subtle" data-s-close>Annuleer</button>
          <button class="btn btn-primary" data-s-confirm="${slug}">Dit punt voorstellen</button>
        </div>`
      : `<p class="s-hint">Geen GPS beschikbaar. Probeer het opnieuw als je verbinding en satellietbereik hebt — dan kun je de pin op de kaart plaatsen.</p>
        <div class="s-acties"><button class="btn btn-secondary" data-s-close>Sluiten</button></div>`}`);
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => doorgaan(inNL(pos.coords.latitude, pos.coords.longitude) ? [pos.coords.latitude, pos.coords.longitude] : null),
      () => doorgaan(null), { enableHighAccuracy: true, timeout: 8000 });
  } else doorgaan(null);
}

/* ── Bestaande coördinaat: alleen-lezen kaart ─────────────────────── */
function openReadonly(slug) {
  const l = bySlug(slug);
  if (!l || !l.y) return;
  if (!navigator.onLine) {
    openSheet(`<div class="s-head">${ic('map')}<h3>Kaart — ${esc(l.nr)}</h3></div>
      <div class="note note-warn">${ic('warn')}<span>De kaart heeft internet nodig. De coördinaat is: <span class="mono">${l.y.toFixed(5)}, ${l.x.toFixed(5)}</span></span></div>
      <div class="s-acties"><button class="btn btn-secondary" data-s-close>Sluiten</button></div>`);
    return;
  }
  openSheet(`
    <div class="s-head">${ic('map')}<h3>Locatie — ${esc(l.nr)}</h3></div>
    <p class="s-sub">Officieel vastgelegd, alleen-lezen. <span class="mono">${l.y.toFixed(5)}, ${l.x.toFixed(5)}</span></p>
    <div id="s-map" class="s-map"></div>
    <div class="s-acties">
      <button class="btn btn-secondary" data-s-report="${slug}">${ic('warn')} Locatie klopt niet</button>
      <button class="btn btn-subtle" data-s-close>Sluiten</button>
    </div>`);
  laadLeaflet().then(() => {
    vernietigMap();
    kaart = L.map('s-map', { zoomControl: true }).setView([l.y, l.x], 17);
    tegels().addTo(kaart);
    L.marker([l.y, l.x]).addTo(kaart);
    setTimeout(() => kaart && kaart.invalidateSize(), 60);
  }).catch(() => {});
}

/* ── Melding: locatie klopt niet ──────────────────────────────────── */
function openReport(slug) {
  const l = bySlug(slug);
  if (!l) return;
  metIdentiteit(() => openSheet(`
    <div class="s-head">${ic('warn')}<h3>Locatie klopt niet — ${esc(l.nr)}</h3></div>
    <p class="s-sub">Je meldt dat de vastgelegde coördinaat niet klopt. De officiële gegevens veranderen hier niet door; de beheerder krijgt je melding.</p>
    <textarea id="s-tekst" class="s-textarea" placeholder="Wat klopt er niet? Bijvoorbeeld: de pin staat aan de overkant, bij de andere mast."></textarea>
    <div class="s-acties">
      <button class="btn btn-subtle" data-s-close>Annuleer</button>
      <button class="btn btn-primary" data-s-submit="geo_report" data-slug="${slug}">Melding versturen</button>
    </div>`));
}

/* ── Veld aanvullen (fabrikant / vra / voltage) ───────────────────── */
function openField(kindId, slug) {
  const k = KIND(kindId);
  const l = bySlug(slug);
  if (!k || !l) return;
  let invoer = '';
  if (kindId === 'fabrikant')
    invoer = `<select id="s-input" class="s-select"><option value="">— kies fabrikant —</option>${FABRIKANTEN.map(f => `<option>${esc(f)}</option>`).join('')}</select>`;
  else if (kindId === 'voltage')
    invoer = `<div class="seg" id="s-volt">${VOLTAGES.map(v => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div><input type="hidden" id="s-input">`;
  else
    invoer = `<input id="s-input" class="s-select" placeholder="VRA-nummer" autocomplete="off">`;

  metIdentiteit(() => {
    openSheet(`
      <div class="s-head">${ic(k.icon)}<h3>${k.label} aanvullen — ${esc(l.nr)}</h3></div>
      <p class="s-sub">Dit veld is nog leeg. Je voorstel gaat eerst naar de beheerder.</p>
      ${invoer}
      <div id="s-err" class="note note-warn" hidden>${ic('warn')}<span id="s-err-t"></span></div>
      <div class="s-acties">
        <button class="btn btn-subtle" data-s-close>Annuleer</button>
        <button class="btn btn-primary" data-s-submit="${kindId}" data-slug="${slug}">Voorstel indienen</button>
      </div>`);
    if (kindId === 'voltage') {
      const seg = document.getElementById('s-volt');
      seg.addEventListener('click', e => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        [...seg.children].forEach(c => c.setAttribute('aria-pressed', c === b));
        document.getElementById('s-input').value = b.dataset.v;
      });
    }
  });
}

/* ── Opmerking ────────────────────────────────────────────────────── */
function openComment(slug) {
  const l = bySlug(slug);
  if (!l) return;
  metIdentiteit(() => openSheet(`
    <div class="s-head">${ic('info')}<h3>Opmerking — ${esc(l.nr)}</h3></div>
    <p class="s-sub">Iets wat de beheerder moet weten over dit kruispunt.</p>
    <textarea id="s-tekst" class="s-textarea" placeholder="Je opmerking…"></textarea>
    <div class="s-acties">
      <button class="btn btn-subtle" data-s-close>Annuleer</button>
      <button class="btn btn-primary" data-s-submit="opmerking" data-slug="${slug}">Plaatsen</button>
    </div>`));
}

/* ── Indienen afronden ────────────────────────────────────────────── */
function verstuur(kindId, slug) {
  let waarde;
  if (kindId === 'geo') waarde = window.__capture;
  else if (kindId === 'geo_report') waarde = { reden: document.getElementById('s-tekst')?.value || '' };
  else if (kindId === 'opmerking') waarde = { tekst: document.getElementById('s-tekst')?.value || '' };
  else waarde = document.getElementById('s-input')?.value || '';

  const r = indienen(kindId, slug, waarde, null);
  if (r.error) {
    const e = document.getElementById('s-err');
    if (e) { e.hidden = false; document.getElementById('s-err-t').textContent = r.error; }
    else toast(r.error);
    return;
  }
  window.__capture = null;
  sluitSheet();
  toast('Voorstel ingediend — de beheerder kijkt ernaar');
  render();
}

/* ══════════════════════════════════════════════════════════════════
   BEHEERDERSOMGEVING — reviewconsole
   ══════════════════════════════════════════════════════════════════ */

let reviewFilter = 'ingediend';

V.voorstellen = function () {
  if (!state.beheer) return `<div class="empty">${ic('lock')}
    <h3>Voorstellen is afgeschermd</h3>
    <p>De reviewomgeving is alleen voor de beheerder. Ontgrendel in Instellingen.</p>
    <div class="suggestions"><button class="pill" data-route="instellingen">Naar Instellingen</button></div></div>`;

  const st = stats();
  const lijst = alle().filter(s => reviewFilter === 'alle' ? true : s.status === reviewFilter);
  const tel = { alle: alle().length, ingediend: st.ingediend, goedgekeurd: st.goedgekeurd, afgewezen: st.afgewezen };

  return `
    <div class="section">
      <h1 style="font:var(--t-display)">Voorstellen</h1>
      <div class="card-meta">Bijdragen van monteurs · goedkeuren voordat ze officieel worden</div>
    </div>

    <div class="section">
      <div class="s-inline">
        ${[['ingediend', 'In behandeling'], ['goedgekeurd', 'Goedgekeurd'], ['afgewezen', 'Afgewezen'], ['alle', 'Alle']].map(([k, lbl]) =>
          `<button class="pill" data-s-filter="${k}" aria-pressed="${reviewFilter === k}">${lbl} <span class="count">${tel[k]}</span></button>`).join('')}
        <span style="flex:1"></span>
        <button class="btn btn-subtle btn-sm" data-s-import>${ic('doc')} Importeer</button>
        <button class="btn btn-subtle btn-sm" data-s-export>${ic('doc')} Exporteer log</button>
      </div>
    </div>

    ${!lijst.length ? `<div class="empty">${ic('check')}<h3>Niets ${reviewFilter === 'ingediend' ? 'in behandeling' : 'hier'}</h3><p>${reviewFilter === 'ingediend' ? 'Alle voorstellen zijn beoordeeld.' : 'Geen voorstellen met deze status.'}</p></div>`
      : `<div class="tablewrap"><table>
          <thead><tr><th>Kruispunt</th><th>Soort</th><th>Voorgesteld</th><th class="col-gem">Door</th><th class="col-fab">Wanneer</th><th></th></tr></thead>
          <tbody>${lijst.map(reviewRij).join('')}</tbody>
        </table></div>`}

    <input type="file" id="s-import-file" accept=".json,application/json" hidden>`;
};

function reviewRij(s) {
  const l = bySlug(s.slug);
  const k = KIND(s.soort);
  return `<tr data-s-detail="${s.id}">
    <td class="c-id">${esc(l ? l.nr : s.slug)}</td>
    <td>${esc(k?.label || s.soort)} ${s.modus === 'report' ? '<span class="badge">melding</span>' : s.modus === 'note' ? '<span class="badge">notitie</span>' : ''}</td>
    <td class="c-loc">${k ? k.toon(s.nieuw) : ''}${s.nieuw && s.nieuw.ongeverifieerd ? ' <span class="badge badge-amber">niet op kaart</span>' : ''}</td>
    <td class="col-gem">${esc(s.ingediend_door)}</td>
    <td class="col-fab">${datum(s.ingediend_op)}</td>
    <td class="c-r">${statusBadge(s.status)}</td>
  </tr>`;
}

const datum = iso => { try { return new Date(iso).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return iso; } };
const haversine = (a, b) => {
  const R = 6371000, r = x => x * Math.PI / 180;
  const dy = r(b.y - a.y), dx = r(b.x - a.x);
  const h = Math.sin(dy / 2) ** 2 + Math.cos(r(a.y)) * Math.cos(r(b.y)) * Math.sin(dx / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};

/* ── Detail: vergelijken, aanpassen, goed-/afkeuren ───────────────── */
function openDetail(id) {
  const s = alle().find(x => x.id === id);
  if (!s) return;
  const l = bySlug(s.slug);
  const k = KIND(s.soort);
  const afgehandeld = s.status !== 'ingediend';

  // Vergelijking huidig ↔ voorgesteld
  let vergelijk;
  if (s.soort === 'geo') {
    const oud = s.oud, nieuw = s.nieuw;
    const afst = oud && nieuw ? haversine(oud, nieuw) : null;
    vergelijk = `
      <div class="s-compare">
        <div class="s-cmp-col"><div class="s-cmp-lbl">Nu officieel</div><div class="s-cmp-val mono">${oud ? `${(+oud.y).toFixed(5)}, ${(+oud.x).toFixed(5)}` : 'leeg'}</div></div>
        <div class="s-cmp-arrow">${ic('chev')}</div>
        <div class="s-cmp-col"><div class="s-cmp-lbl">Voorgesteld</div><div class="s-cmp-val mono" style="color:var(--signal-green)">${k.toon(nieuw)}</div></div>
      </div>
      ${afst != null ? `<p class="s-hint">Verschil: ${afst} m van de huidige positie.</p>` : ''}
      ${nieuw && nieuw.ongeverifieerd ? `<div class="note note-warn">${ic('warn')}<span>Ingediend zonder kaartcontrole (offline). Controleer voor goedkeuring.</span></div>` : ''}`;
  } else if (s.modus === 'report' || s.modus === 'note') {
    vergelijk = `<div class="s-cmp-single"><div class="s-cmp-lbl">${s.modus === 'report' ? 'Melding' : 'Opmerking'}</div><div class="s-cmp-val">${k.toon(s.nieuw)}</div></div>
      ${s.oud ? `<p class="s-hint">Huidige coördinaat: <span class="mono">${(+s.oud.y).toFixed(5)}, ${(+s.oud.x).toFixed(5)}</span></p>` : ''}`;
  } else {
    vergelijk = `
      <div class="s-compare">
        <div class="s-cmp-col"><div class="s-cmp-lbl">Nu officieel</div><div class="s-cmp-val">${s.oud ? esc(s.oud) : '<span class="unknown">leeg</span>'}</div></div>
        <div class="s-cmp-arrow">${ic('chev')}</div>
        <div class="s-cmp-col"><div class="s-cmp-lbl">Voorgesteld</div><div class="s-cmp-val" style="color:var(--signal-green)">${k.toon(s.nieuw)}</div></div>
      </div>`;
  }

  // Aanpasveld (beheerder mag de waarde bijstellen vóór toepassen) — voor tekstuele add-velden
  const kanBewerken = !afgehandeld && s.modus === 'add' && ['vra'].includes(s.soort);
  const bewerk = kanBewerken
    ? `<label class="s-edit"><span>Aanpassen vóór toepassen</span><input id="s-edit-val" class="s-select" value="${esc(s.nieuw)}"></label>` : '';

  const audit = `
    <div class="s-audit">
      <div class="s-group-t">Audittrail</div>
      <dl class="kv">
        <dt>Ingediend door</dt><dd>${esc(s.ingediend_door)}</dd>
        <dt>Ingediend op</dt><dd class="mono">${datum(s.ingediend_op)}</dd>
        <dt>Status</dt><dd>${statusBadge(s.status)}</dd>
        ${s.beoordeeld_door ? `<dt>Beoordeeld door</dt><dd>${esc(s.beoordeeld_door)}</dd>
          <dt>Beoordeeld op</dt><dd class="mono">${datum(s.beoordeeld_op)}</dd>` : ''}
        ${s.beoordeling_opmerking ? `<dt>Opmerking</dt><dd>${esc(s.beoordeling_opmerking)}</dd>` : ''}
        ${s.toegepast_waarde != null ? `<dt>Toegepast</dt><dd class="mono">${esc(k.toon(s.toegepast_waarde))}</dd>` : ''}
      </dl>
    </div>`;

  const acties = afgehandeld ? `<div class="s-acties"><button class="btn btn-secondary" data-s-close>Sluiten</button></div>`
    : `
      ${s.modus === 'add' ? `<label class="s-edit"><span>Opmerking bij beoordeling (optioneel)</span><input id="s-note" class="s-select" placeholder="bijv. gecontroleerd tegen CityView"></label>` : `<label class="s-edit"><span>Opmerking (optioneel)</span><input id="s-note" class="s-select"></label>`}
      <div class="s-acties">
        <button class="btn btn-danger" data-s-reject="${id}">${ic('warn')} Afwijzen</button>
        <button class="btn btn-primary" data-s-approve="${id}">${ic('check')} ${s.modus === 'add' ? 'Goedkeuren & toepassen' : 'Erkennen'}</button>
      </div>`;

  openSheet(`
    <div class="s-head">${ic(k?.icon || 'info')}<h3>${esc(k?.label || s.soort)} — ${esc(l ? l.nr : s.slug)}</h3></div>
    <p class="s-sub">${esc(l ? [C(l.c).naam, l.l].filter(Boolean).join(' · ') : '')}</p>
    ${vergelijk}
    ${s.toelichting ? `<div class="note">${ic('info')}<span>${esc(s.toelichting)}</span></div>` : ''}
    ${bewerk}
    ${acties}
    ${audit}`);
}

function doeGoedkeuren(id, overschrijf) {
  const note = document.getElementById('s-note')?.value || '';
  const edit = document.getElementById('s-edit-val')?.value;
  const r = goedkeuren(id, { opmerking: note, gewijzigd: edit != null ? edit : undefined, overschrijf, beheerder: getBeheerder() });
  if (r.conflict) {
    if (confirm(r.reden + '\n\nHuidige waarde overschrijven?')) return doeGoedkeuren(id, true);
    return;
  }
  if (r.error) { toast(r.error); return; }
  sluitSheet();
  toast(r.geschreven ? 'Goedgekeurd en toegepast — vergeet niet data.js te exporteren' : 'Erkend');
  render();
}
function doeAfwijzen(id) {
  const note = document.getElementById('s-note')?.value || '';
  const r = afwijzen(id, { opmerking: note, beheerder: getBeheerder() });
  if (r.error) { toast(r.error); return; }
  sluitSheet();
  toast('Afgewezen');
  render();
}

/* ══════════════════════════════════════════════════════════════════
   Bedrading
   ══════════════════════════════════════════════════════════════════ */

// Reviewomgeving in het beheermenu.
NAV_BEHEER.push(['voorstellen', I.users, 'Voorstellen']);

document.addEventListener('click', e => {
  const t = e.target.closest('[data-s-capture],[data-s-map],[data-s-report],[data-s-field],[data-s-comment],[data-s-submit],[data-s-confirm],[data-s-close],[data-s-identity],[data-s-filter],[data-s-detail],[data-s-approve],[data-s-reject],[data-s-export],[data-s-import]');
  if (!t) return;

  if (t.hasAttribute('data-s-close')) { sluitSheet(); return; }
  if (t.hasAttribute('data-s-identity')) {
    const n = (document.getElementById('s-naam')?.value || '').trim();
    if (!n) { document.getElementById('s-naam')?.focus(); return; }
    setMonteur(n); sluitSheet();
    if (window.__naVerder) { const f = window.__naVerder; window.__naVerder = null; f(); }
    return;
  }

  if (t.dataset.sCapture) return openCapture(t.dataset.sCapture);
  if (t.dataset.sMap)     return openReadonly(t.dataset.sMap);
  if (t.dataset.sReport)  return openReport(t.dataset.sReport);
  if (t.dataset.sField)   return openField(t.dataset.sField, t.dataset.slug);
  if (t.dataset.sComment) return openComment(t.dataset.sComment);
  if (t.dataset.sConfirm) return verstuur('geo', t.dataset.sConfirm);
  if (t.dataset.sSubmit)  return verstuur(t.dataset.sSubmit, t.dataset.slug);

  if (t.dataset.sFilter)  { reviewFilter = t.dataset.sFilter; render(); return; }
  if (t.dataset.sDetail)  return openDetail(t.dataset.sDetail);
  if (t.dataset.sApprove) return doeGoedkeuren(t.dataset.sApprove, false);
  if (t.dataset.sReject)  return doeAfwijzen(t.dataset.sReject);

  if (t.hasAttribute('data-s-export')) {
    const blob = new Blob([exportQueue(false)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `voorstellen-log-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Log geëxporteerd'); return;
  }
  if (t.hasAttribute('data-s-import')) { document.getElementById('s-import-file')?.click(); return; }
});

document.addEventListener('change', e => {
  if (e.target.id !== 's-import-file') return;
  const f = e.target.files?.[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const res = importQueue(r.result);
    if (res.error) return toast(res.error);
    toast(`${res.nieuw} geïmporteerd${res.dubbel ? `, ${res.dubbel} al aanwezig` : ''}`);
    render();
  };
  r.readAsText(f, 'UTF-8');
});

// Esc sluit de sheet.
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet && !sheet.hidden) sluitSheet(); });

/* Kleine badge met het aantal openstaande voorstellen op de nav-link,
   na elke render. Niet-invasief: leest alleen de DOM die app.js opbouwt. */
const _render = render;
render = function () {
  _render();
  try {
    const n = stats().ingediend;
    const link = document.querySelector('#nav-beheer-links [data-route="voorstellen"]');
    if (link && n && !link.querySelector('.s-navbadge')) {
      const b = document.createElement('span');
      b.className = 's-navbadge'; b.textContent = n;
      link.appendChild(b);
    }
  } catch {}
};

// Eén keer opnieuw tekenen zodat de nieuwe nav-link en wraps meelopen.
render();

})();
