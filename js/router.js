/**
 * Parse the current URL hash and return a route descriptor.
 * Supported routes:
 *   #/                    → { view: 'tasks' }
 *   #/tasks               → { view: 'tasks' }
 *   #/entities            → { view: 'entities' }
 *   #/entity/:id          → { view: 'entity', entityId, tab: 'overview' }
 *   #/entity/:id/tasks    → { view: 'entity', entityId, tab: 'tasks' }
 *   #/admin               → { view: 'admin' }
 *
 * Query params in the hash (e.g. #/tasks?edit=<id>) are stripped before
 * route matching — they are handled separately by checkDeepLink() in main.js.
 */
export function getRoute() {
  const full = window.location.hash.replace(/^#/, "") || "/";
  // Strip any query string from the hash path before matching
  const hash = full.split("?")[0];
  if (hash === "/" || hash === "/tasks") return { view: "tasks" };
  if (hash === "/entities") return { view: "entities" };
  if (hash === "/admin") return { view: "admin" };
  const mt = hash.match(/^\/entity\/([^/]+)\/tasks$/);
  if (mt) return { view: "entity", entityId: mt[1], tab: "tasks" };
  const m = hash.match(/^\/entity\/([^/]+)$/);
  if (m) return { view: "entity", entityId: m[1], tab: "overview" };
  return { view: "not-found" };
}
