/* Tekeningenmodule — gedeelde opslag via Netlify Blobs. */
'use strict';

(() => {
  const old = V.l;
  V.l = slug => {
    const html = old(slug);
    if (!bySlug(slug)) return html;
    const marker = '<div class="panel">\n          <div class="eyebrow panel-head"><span>Contract</span></div>';
    const docs = `<div class="panel docs-panel" data-docs-slug="${esc(slug)}">
      <div class="eyebrow panel-head"><span>Tekeningen</span><span class="sep">·</span><span data-doc-count>laden…</span></div>
      <div data-doc-list><div class="docs-loading">Tekeningen ophalen…</div></div>
      ${state.beheer ? `<div class="docs-admin">
        <button class="btn btn-primary btn-sm" data-doc-upload="${esc(slug)}">${I.doc} Tekening uploaden</button>
        <span class="docs-help">PDF, JPG of PNG · max. 4 MB</span>
      </div>` : ''}
    </div>`;
    return html.replace(marker, docs + marker);
  };

  const fmt = n => n < 1024*1024 ? `${Math.max(1,Math.round(n/1024))} kB` : `${(n/1024/1024).toFixed(1).replace('.',',')} MB`;
  const date = s => { try { return new Intl.DateTimeFormat('nl-NL',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(s)); } catch { return ''; } };

  async function load(panel) {
    const slug = panel.dataset.docsSlug;
    if (!slug || panel.dataset.loading === '1') return;
    panel.dataset.loading = '1';
    const list = panel.querySelector('[data-doc-list]');
    try {
      const r = await fetch(`/api/vri-docs?action=list&slug=${encodeURIComponent(slug)}&_=${Date.now()}`, {
  cache: 'no-store'
});
      if (!r.ok) throw new Error();
      const {docs=[]} = await r.json();
      panel.querySelector('[data-doc-count]').textContent = docs.length === 1 ? '1 bestand' : `${docs.length} bestanden`;
      list.innerHTML = docs.length ? docs.map(d => `<div class="doc-row">
        <a class="doc-main" href="${esc(d.url)}" target="_blank" rel="noopener">
          <span class="doc-icon">${I.doc}</span><span><strong>${esc(d.title || d.name)}</strong><small>${esc(d.name)} · ${fmt(Number(d.size)||0)} · ${date(d.uploadedAt)}</small></span>
        </a>
        ${state.beheer ? `<button class="btn btn-danger btn-sm" data-doc-delete="${esc(d.id)}" data-doc-slug="${esc(slug)}">Verwijderen</button>` : ''}
      </div>`).join('') : `<div class="docs-empty">Voor deze installatie zijn nog geen tekeningen toegevoegd.</div>`;
    } catch {
      panel.querySelector('[data-doc-count]').textContent = 'niet beschikbaar';
      list.innerHTML = `<div class="note">${I.wifi}<span>${navigator.onLine ? 'Tekeningen konden niet worden opgehaald.' : 'Internetverbinding nodig om tekeningen te bekijken.'}</span></div>`;
    } finally { panel.dataset.loading = '0'; }
  }

  function hydrate() { document.querySelectorAll('[data-docs-slug]').forEach(load); }
  new MutationObserver(hydrate).observe(document.getElementById('view'), {childList:true,subtree:true});
  setTimeout(hydrate, 0);

  function sheet(html) {
    let o = document.getElementById('doc-sheet');
    if (!o) { o=document.createElement('div'); o.id='doc-sheet'; o.className='overlay'; document.body.appendChild(o); }
    o.hidden=false; o.innerHTML=`<div class="s-panel">${html}</div>`;
  }
  function close() { const o=document.getElementById('doc-sheet'); if(o){o.hidden=true;o.innerHTML='';} }

  document.addEventListener('click', async e => {
    const t=e.target.closest('[data-doc-upload],[data-doc-delete],[data-doc-close],[data-doc-submit]'); if(!t) return;
    if (t.hasAttribute('data-doc-close')) return close();
    if (t.dataset.docUpload) {
      sheet(`<div class="s-head">${I.doc}<h3>Tekening uploaden</h3></div>
        <p class="s-sub">De tekening wordt gekoppeld aan <strong>${esc(bySlug(t.dataset.docUpload)?.nr || t.dataset.docUpload)}</strong>.</p>
        <label class="s-edit"><span>Titel / omschrijving</span><input class="s-textarea doc-title" id="doc-title" style="min-height:var(--tap)" placeholder="Bijv. Revisietekening regelkast"></label>
        <label class="s-edit"><span>Bestand</span><input id="doc-file" type="file" accept="application/pdf,image/jpeg,image/png"></label>
        <div class="note note-warn" id="doc-error" hidden style="margin-top:var(--s3)">${I.warn}<span></span></div>
        <div class="s-acties"><button class="btn btn-secondary" data-doc-close>Annuleren</button><button class="btn btn-primary" data-doc-submit="${esc(t.dataset.docUpload)}">Uploaden</button></div>`);
      return;
    }
    if (t.dataset.docSubmit) {
      const f=document.getElementById('doc-file').files[0], err=document.getElementById('doc-error');
      if(!f){err.hidden=false;err.querySelector('span').textContent='Kies eerst een bestand.';return;}
      if(f.size>4*1024*1024){err.hidden=false;err.querySelector('span').textContent='Dit bestand is groter dan 4 MB.';return;}
      t.disabled=true; t.textContent='Uploaden…';
      const fd=new FormData(); fd.append('file',f); fd.append('title',document.getElementById('doc-title').value);
      const r=await fetch(`/api/vri-docs?action=upload&slug=${encodeURIComponent(t.dataset.docSubmit)}`,{method:'POST',body:fd});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){t.disabled=false;t.textContent='Uploaden';err.hidden=false;err.querySelector('span').textContent=j.error||'Uploaden mislukt.';return;}
      close(); toast('Tekening toegevoegd'); render(); return;
    }
    if (t.dataset.docDelete) {
      if(!confirm('Deze tekening definitief verwijderen?')) return;
      t.disabled=true;
      const r=await fetch(`/api/vri-docs?action=delete&slug=${encodeURIComponent(t.dataset.docSlug)}&id=${encodeURIComponent(t.dataset.docDelete)}`,{method:'DELETE'});
      if(!r.ok){toast('Verwijderen mislukt');t.disabled=false;return;}
      toast('Tekening verwijderd'); render();
    }
  });

  fetch('/api/vri-admin?action=status',{cache:'no-store'}).then(r=>r.json()).then(j=>{ if(j.authenticated&&!state.beheer){state.beheer=true;render();} }).catch(()=>{});
})();
