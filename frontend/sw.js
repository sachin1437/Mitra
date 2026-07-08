// Mitra — minimal service worker (makes it an installable PWA + fast shell load).
// Chat replies always go to the network; only the static shell is cached.
const CACHE = "mitra-v4";
const SHELL = ["./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./favicon.ico", "./favicon-32x32.png", "./favicon-16x16.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // never cache API/model calls or cross-origin (Gemini backend, Firebase, fonts)
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  // HTML: network-first. Always fetch the current file so local edits show up
  // immediately; only fall back to the cached copy if the network is down
  // (offline). This is what prevents "I edited the file but nothing changed."
  const isHTML = e.request.mode === "navigate" || url.pathname.endsWith(".html");
  if (isHTML){
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // everything else (icons, manifest): cache-first, since these rarely change
  // and this keeps the app loading instantly.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});