import { getRoute } from "./router.js";
import { renderEntitiesView } from "./views/dashboard.js";
import { renderEntityView } from "./views/entity.js";
import { renderTasksView } from "./views/tasks.js";
import { renderLoginView } from "./views/login.js";
import { renderAdminView, bindAdminView } from "./views/admin.js";
import { isLoggedIn } from "./auth.js";

/** Dispatch to the correct view and update nav active states */
export function render() {
  const route = getRoute();
  const viewEl = document.getElementById("view");

  const topNav = document.querySelector(".top-nav");
  const bottomNav = document.getElementById("bottom-nav");

  // Admin route — no auth required, handled separately
  if (route.view === "admin") {
    if (topNav) topNav.style.display = "none";
    if (bottomNav) bottomNav.style.display = "none";
    document
      .querySelectorAll(".top-nav-link, .bottom-nav-item")
      .forEach((el) => {
        el.classList.remove("active");
      });
    viewEl.innerHTML = renderAdminView();
    bindAdminView(render);
    return;
  }

  // All other routes require login
  if (!isLoggedIn()) {
    if (topNav) topNav.style.display = "none";
    if (bottomNav) bottomNav.style.display = "none";
    document
      .querySelectorAll(".top-nav-link, .bottom-nav-item")
      .forEach((el) => {
        el.classList.remove("active");
      });
    viewEl.innerHTML = renderLoginView();
    return;
  }

  // Logged in — show nav
  if (topNav) topNav.style.display = "";
  if (bottomNav) bottomNav.style.display = "";

  const activeRoute = route.view === "entity" ? "entities" : route.view;
  document.querySelectorAll(".top-nav-link, .bottom-nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.route === activeRoute);
  });

  switch (route.view) {
    case "tasks":
      viewEl.innerHTML = renderTasksView();
      break;
    case "entities":
      viewEl.innerHTML = renderEntitiesView();
      break;
    case "entity":
      viewEl.innerHTML = renderEntityView(route.entityId, route.tab);
      break;
    default:
      viewEl.innerHTML =
        '<p style="padding:40px;color:var(--text-secondary)">Page not found.</p>';
  }
}
