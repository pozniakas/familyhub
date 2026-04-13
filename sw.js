// ─── FamilyHub Service Worker ────────────────────────────────────────────────
//
// Strategy:
//   • Static assets (HTML, CSS, JS, manifest, icons) → cache-first
//   • API calls (/api/*)  → network-first, silent fail when offline
//
// CACHE_NAME is injected automatically by the server on every startup —
// no need to touch this file manually when deploying changes.

const CACHE_NAME = "__CACHE_VERSION__";

const APP_SHELL = [
  "/",
  "/manifest.json",
  // CSS
  "/css/base.css",
  "/css/layout.css",
  "/css/components.css",
  "/css/tasks.css",
  "/css/modal.css",
  "/css/responsive.css",
  "/css/auth.css",
  // JS entry + core modules
  "/js/main.js",
  "/js/state.js",
  "/js/api.js",
  "/js/render.js",
  "/js/router.js",
  "/js/events.js",
  "/js/modal.js",
  "/js/helpers.js",
  "/js/labels.js",
  "/js/i18n.js",
  "/js/data.js",
  "/js/auth.js",
  "/js/push.js",
  // Views
  "/js/views/login.js",
  "/js/views/admin.js",
  "/js/views/dashboard.js",
  "/js/views/entity.js",
  "/js/views/tasks.js",
  // Modals
  "/js/modals/entities.js",
  "/js/modals/items.js",
  "/js/modals/tasks.js",
];

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate: delete stale caches ────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
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

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "FamilyHub", body: "You have a new notification." };
  try {
    if (e.data) data = { ...data, ...e.data.json() };
  } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { taskId: data.taskId },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const taskId = e.notification.data?.taskId;
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        if (clients.length) {
          // App is open — focus and message every window client.
          // Use includeUncontrolled so we catch the PWA window even when
          // the SW update cycle means it isn't the "controller" yet.
          clients.forEach((c) => {
            c.focus();
            if (taskId) c.postMessage({ type: "open-task", taskId });
          });
          return;
        }
        // App is closed — open it with the task id encoded in the hash.
        const url = taskId ? `/#/tasks?edit=${taskId}` : "/";
        return self.clients.openWindow(url);
      }),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // API calls: network-first — if offline the app already shows a friendly error
  if (request.url.includes("/api/")) {
    e.respondWith(fetch(request));
    return;
  }

  // Everything else: cache-first, fall back to network and cache the result
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      });
    }),
  );
});
