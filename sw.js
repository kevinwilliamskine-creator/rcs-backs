// RCS Backs — service worker. Quand tu modifies index.html, augmente VERSION (v2, v3…) : les téléphones verront « Nouvelle version disponible ».
// Le contenu (data/contenu.json) est toujours repris d'Internet en premier : rien à changer ici quand tu modifies seulement le contenu.
const VERSION = 'rcs-backs-v1';
const CORE = ['./', 'index.html', 'data/contenu.json', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'img/stade.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.headers.has('range') || u.pathname.endsWith('.mp4')) return; // vidéos : lues directement
  const fresh = r.mode === 'navigate' || u.pathname.endsWith('/contenu.json') || u.pathname.endsWith('/index.html');
  if (fresh) {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(x => x.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(VERSION).then(x => x.put(r, c)); } return res; })));
});
