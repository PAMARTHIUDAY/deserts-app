const CACHE = "sweet-deserts-v1";
const ASSETS = ["/", "/menu", "/css/style.css", "/js/main.js", "/js/search.js", "/js/cart.js", "/js/wishlist.js", "/js/currency.js", "/manifest.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match("/"))));
});
