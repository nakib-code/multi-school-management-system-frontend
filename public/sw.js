// MadrasaOS PWA Service Worker
// App-shell precaching + network-first runtime caching with offline fallback.

const CACHE_NAME = "madrasaos-pwa-v2";
const APP_SHELL_ASSETS = ["/", "/manifest.webmanifest", "/favicon.ico"];

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Offline — MadrasaOS</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f8fafc; color:#0f172a; }
    .card { max-width:420px; padding:2rem; border-radius:1rem; background:#fff; border:1px solid #e2e8f0; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,.04); }
    h1 { font-size:1.25rem; margin:0 0 .5rem; }
    p { font-size:.875rem; color:#475569; margin:0 0 1.25rem; }
    button { background:#00a99d; color:#fff; border:0; padding:.625rem 1.25rem; border-radius:.5rem; font-weight:600; cursor:pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You are currently offline</h1>
    <p>Please check your internet connection and try again to access MadrasaOS.</p>
    <button onclick="window.location.reload()">Retry</button>
  </div>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(APP_SHELL_ASSETS.map((asset) => cache.add(asset))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return;
  }

  // Cache-first for immutable Next.js static chunks & images
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Network-first for navigations & pages with runtime cache update + offline HTML fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return new Response(OFFLINE_HTML, {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }),
  );
});
