// Service worker: a build tölti ki a verziót és a fájllistát (vite.config.js, pwaPrecache).
const CACHE = 'helpfulai-' + '1.0.0-rc.1 · #1 · 2026.11.01-2202-cd52e43';
const PRECACHE = ["./","THIRD_PARTY_LICENSES.txt","apple-touch-icon.png","assets/befejezesek-DHrnUI0d.js","assets/endingart-B879BAiY.css","assets/endingart-DBnIiVWP.js","assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2","assets/inter-latin-wght-normal-Dx4kXJAl.woff2","assets/jetbrains-mono-latin-ext-wght-normal-DBQx-q_a.woff2","assets/jetbrains-mono-latin-wght-normal-B9CIFXIH.woff2","assets/main-200AQO-b.js","assets/main-Wi78aCSB.css","assets/minijatekok-Dz0imH2m.js","assets/sound-BsUYOdne.css","assets/sound-CmMZybw0.js","assets/space-grotesk-latin-ext-wght-normal-D9tNdqV9.woff2","assets/space-grotesk-latin-wght-normal-BhU9QXUp.woff2","assets/wipe-Bqb7EJIB.css","assets/wipe-YOU3RzdX.js","befejezesek.html","favicon-32.png","favicon.svg","icon-192.png","icon-256.png","icon-512.png","icon.svg","index.html","manifest.webmanifest","minijatekok.html"];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE.map((p) => new URL(p, self.registration.scope).href))),
    // nincs skipWaiting: az új verzió vár, az oldal üzenettel (SKIP_WAITING) engedi át, amikor biztonságos
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('helpfulai-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // navigáció: hálózat, hiba esetén a gyorsítótárazott index
    e.respondWith(
      fetch(req).catch(() => caches.match(new URL('./', self.registration.scope).href)
        .then((r) => r || caches.match(new URL('index.html', self.registration.scope).href))),
    );
    return;
  }
  // statikus fájl: cache-first, a hiányzót lekéri és eltárolja
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
