const CACHE = "arewa-shell-v13";
const SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/offline.js",
  "/manifest.webmanifest",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const u = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    u.origin !== self.location.origin ||
    u.pathname.startsWith("/api/") ||
    u.pathname.startsWith("/evidence/")
  )
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html")),
    );
    return;
  }
  if (SHELL.includes(u.pathname))
    event.respondWith(
      fetch(event.request).catch(() => caches.match(u.pathname)),
    );
});
