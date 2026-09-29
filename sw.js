/* Service worker — offline-first.
   Alles wordt bij installatie gecachet. Daarna werkt de app volledig
   zonder netwerk. De cachenaam bevat de versie: bump die bij een
   nieuwe data.js, dan krijgen de monteurs vanzelf een updatemelding. */

const CACHE = 'vri-2026.09-docs-1';

const BESTANDEN = [
  './',
  './index.html',
  './assets/styles.css',
  './assets/data.js',
  './assets/app.js',
  './assets/suggestions.js',
  './assets/documents.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(BESTANDEN))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Externe systemen (logboek, CityView, Maps) nooit cachen — niet van ons.
  if (url.origin !== location.origin && !url.host.includes('fonts.')) return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request)
        .then(res => {
          if (res.ok && e.request.method === 'GET') {
            const kopie = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, kopie));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
