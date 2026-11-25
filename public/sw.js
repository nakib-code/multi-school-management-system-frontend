// MadrasaOS PWA Service Worker
// Clean network-first handler that enables native "Install App" prompt
// without interfering with Next.js App Router or API caching.

const CACHE_NAME = "madrasaos-pwa-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
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

  // Never intercept non-GET requests, API calls, or Next.js internal assets
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/")
  ) {
    return;
  }

  // Network-first passthrough with graceful cache fallback for offline resilience
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response("Offline", {
        status: 503,
        statusText: "Service Unavailable",
      });
    }),
  );
});
