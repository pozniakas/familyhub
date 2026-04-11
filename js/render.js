import { getRoute } from "./router.js";
import { renderEntitiesView } from "./views/dashboard.js";
import { renderEntityView } from "./views/entity.js";
import { renderTasksView } from "./views/tasks.js";

/** Dispatch to the correct view and update nav active states */
export function render() {
  const route = getRoute();
  const viewEl = document.getElementById("view");

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
