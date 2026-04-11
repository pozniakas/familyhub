import { esc } from "../helpers.js";
import { t } from "../i18n.js";
import { getState } from "../state.js";

/** Build entity cards HTML (shared between Entities and Overview views) */
function buildEntityCards() {
  const { entities, items } = getState();

  const addCard = `
    <button class="entity-card entity-card-add" data-action="add-entity">
      <span class="entity-card-add-icon">＋</span>
      <span class="entity-card-add-label">${t("newEntityCard")}</span>
    </button>`;

  const cards = entities
    .map((entity) => {
      const entityItems = items.filter((i) => i.entityId === entity.id);
      const urgent = entityItems.filter((i) => i.status === "urgent").length;
      const soon = entityItems.filter((i) => i.status === "soon").length;
      const ok = entityItems.filter((i) => i.status === "ok").length;
      const total = entityItems.length;

      const counts =
        total === 0
          ? `<span class="status-count">
           <span class="status-dot ok"></span>
           <span class="status-count-label">${t("noItemsYet")}</span>
         </span>`
          : [
              urgent
                ? `<span class="status-count"><span class="status-dot urgent"></span><span class="status-count-label">${t("statusUrgent", { n: urgent })}</span></span>`
                : "",
              soon
                ? `<span class="status-count"><span class="status-dot soon"></span><span class="status-count-label">${t("statusSoon", { n: soon })}</span></span>`
                : "",
              ok
                ? `<span class="status-count"><span class="status-dot ok"></span><span class="status-count-label">${t("statusOk", { n: ok })}</span></span>`
                : "",
            ]
              .filter(Boolean)
              .join("");

      const trackedKey = total === 1 ? "itemsTracked" : "itemsTrackedPlural";

      return `
      <a class="entity-card" href="#/entity/${esc(entity.id)}">
        <div class="entity-card-header">
          <span class="entity-emoji">${entity.emoji}</span>
          <span class="entity-name">${esc(entity.name)}</span>
        </div>
        <div class="entity-status-summary">${counts}</div>
        <div class="entity-card-footer">${t(trackedKey, { n: total })}</div>
      </a>`;
    })
    .join("");

  return `${cards}${addCard}`;
}

/** Render the Entities view: entity grid only */
export function renderEntitiesView() {
  return `
    <div class="page-header-row page-header">
      <h2>${t("entitiesHeading")}</h2>
      <button class="btn btn-primary" data-action="add-entity">${t("addEntityBtn")}</button>
    </div>
    <div class="entity-grid">${buildEntityCards()}</div>`;
}
