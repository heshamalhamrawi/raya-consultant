// Raya consultant platform — offline cache (works 100% offline once warmed)
const V = 'rc-202611241115-ba384571b7';
// the app shell + everything the first screen needs: saved at install, one missing file never blocks the install
const CORE = ['./', './index.html', './config.js', './manifest.webmanifest', './img/icon-192.png', './img/icon-512.png', './img/icon-maskable-512.png', './img/raya-logo-white.png', './offline-files.json'];
const CFG = './config.js';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((ca) => Promise.allSettled(CORE.map((u) => fetch(u, { cache: 'reload' }).then((r) => (r.ok ? ca.put(u, r) : null))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  // a new release keeps the saved data, pictures and game (no 2.5 MB re-download); only the app page itself is fresh
  e.waitUntil(caches.open(V).then((now) => caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.open(k)
    .then((old) => old.keys().then((reqs) => Promise.all(reqs.filter((r) => /\/(data|img|saheb-elbeit)\//.test(r.url)).map((r) => old.match(r).then((res) => res && now.match(r).then((has) => has || now.put(r, res)))))))
    .then(() => caches.delete(k)))))).then(() => self.clients.claim()));
});

async function rangeFrom(req) {
  const hit = await caches.match(req.url, { ignoreSearch: true });
  if (!hit) return fetch(req);
  const buf = await hit.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  const start = m && m[1] ? +m[1] : 0, end = m && m[2] ? Math.min(+m[2], size - 1) : size - 1;
  return new Response(buf.slice(start, end + 1), { status: 206, headers: { 'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
const put = (req, r) => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(V).then((ca) => ca.put(req, c)); } return r; };
// exact copy first, then the same file with any ?v= / ?t= (so a version bump offline still finds the last copy)
const fromCache = (req) => caches.match(req).then((hit) => hit || caches.match(req, { ignoreSearch: true }));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin && !u.host.includes('fonts.g')) return;
  // Google Sheet API calls, internal paths, and audio/video range requests are never cached
  const gameAudio = u.pathname.includes('/saheb-elbeit/audio/') || u.pathname.includes('/listen/')
  // the game's sound effects are kept too: a player's range request is answered from the saved file
  if (gameAudio && req.headers.has('range')) { e.respondWith(rangeFrom(req)); return; }
  if (u.search.includes('action=') || u.pathname.includes('__') || req.headers.has('range') || (!gameAudio && /\.(mp3|mp4|wav|ogg|webm)$/i.test(u.pathname))) return;

  // the platform page: show the saved copy instantly, refresh it in the background
  if (req.mode === 'navigate' && !u.pathname.includes('/saheb-elbeit/') && (u.pathname.endsWith('/') || u.pathname.endsWith('/index.html'))) {
    const net = fetch(req);
    e.waitUntil(net.then((r) => { if (r.ok) { const c = r.clone(); return caches.open(V).then((ca) => ca.put(req, c)); } }).catch(() => {}));
    e.respondWith(caches.open(V).then((ca) => ca.match(req, { ignoreSearch: true })).then((hit) => hit || net.catch(() => caches.match('./index.html'))));
    return;
  }
  // config.js?t=…: network first, saved under one fixed key, the last copy when offline
  if (u.pathname.endsWith('/config.js')) {
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(CFG, c)); } return r; }).catch(() => caches.match(CFG).then((hit) => hit || fromCache(req))));
    return;
  }
  // the game «صاحب البيت» and other pages: saved copy at once, refreshed in the background
  if (u.pathname.includes('/saheb-elbeit/') || u.pathname.endsWith('.html') || u.pathname.endsWith('/') || u.pathname.endsWith('offline-files.json')) {
    const net = fetch(req).then((r) => put(req, r));
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(req).then((hit) => hit || net.catch(() => fromCache(req))));
    return;
  }
  // versioned data, images, fonts: cache first; offline → any saved version of the same file
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => put(req, r)).catch(() => fromCache(req).then((h) => h || Response.error()))));
});
