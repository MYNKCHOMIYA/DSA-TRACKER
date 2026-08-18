// DSA Progress Tracker — Service Worker
const CACHE_NAME = "dsa-tracker-v5";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/onboarding.html",
  "/css/style.css",
  "/js/auth.js",
  "/js/app.js",
  "/js/charts.js",
  "/js/data.js",
  "/js/onboarding.js",
  "/js/effects.js",
  "/js/falling-words.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(
          STATIC_ASSETS.filter(
            (url) =>
              !url.startsWith("https://fonts") &&
              !url.startsWith("https://cdn"),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch — network first for API, cache first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always fetch API calls from network
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: "Offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    return;
  }

  // Cache-first for static assets, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to index.html for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    }),
  );
});
