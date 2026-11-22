// Service worker: permite instalar la app, usarla sin internet y mostrar avisos.
// Cambia CACHE cuando publiques cambios grandes para forzar la limpieza.
const CACHE = 'remedios-v2';
const FILES = ['./', './index.html', './estilos.css', './app.js', './receta.js', './manifest.webmanifest', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Red primero (para recibir cambios al tiro); si no hay internet, la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(m => m || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(ws => ws.length ? ws[0].focus() : self.clients.openWindow('./')));
});
