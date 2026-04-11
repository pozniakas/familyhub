import { esc } from "../helpers.js";
import { t } from "../i18n.js";
import { getState } from "../state.js";
import { renderTaskItem } from "./tasks.js";

const EDIT_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>`;

const DRAG_HANDLE = `<span class="drag-handle" title="Drag to reorder">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9"  cy="5"  r="2"/><circle cx="15" cy="5"  r="2"/>
    <circle cx="9"  cy="12" r="2"/><circle cx="15" cy="12" r="2"/>
    <circle cx="9"  cy="19" r="2"/><circle cx="15" cy="19" r="2"/>
  </svg>
</span>`;

const DELETE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6"/><path d="M14 11v6"/>
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`;

function renderOverviewTab(entity, items) {
  const eid = entity.id;

  const sectionsHtml =
    entity.sections.length === 0
      ? `<div class="empty-category" style="padding:32px">${t("noSectionsYet")}</div>`
      : entity.sections
          .map((sec) => {
            const secItems = items.filter(
              (i) => i.entityId === eid && i.sectionId === sec.id,
            );

            const itemsHtml =
              secItems.length === 0
                ? `<div class="empty-category">${t("nothingHere")}</div>`
                : secItems
                    .map(
                      (item) => `
              <div class="item" draggable="true"
                data-drag-type="item" data-drag-id="${esc(item.id)}"
                data-entity-id="${esc(eid)}" data-section-id="${esc(sec.id)}">
                ${DRAG_HANDLE}
                <div class="item-main" data-action="view-item" data-id="${esc(item.id)}">
                  <div class="item-name">${esc(item.name)}</div>
                  ${item.notes ? `<div class="item-notes">${esc(item.notes)}</div>` : ""}
                </div>
                <span class="status-dot status-dot-item ${item.status}"></span>
                <div class="item-actions">
                  <button class="icon-btn" data-action="edit-item" data-id="${esc(item.id)}" title="${t("editItem")}">
                    ${EDIT_ICON}
                  </button>
                  <button class="icon-btn danger" data-action="delete-item" data-id="${esc(item.id)}" title="${t("deleteItem")}">
                    ${DELETE_ICON}
                  </button>
                </div>
              </div>`,
                    )
                    .join("");

            return `
          <div class="category" draggable="true"
            data-drag-type="section" data-drag-id="${esc(sec.id)}" data-entity-id="${esc(eid)}">
            <div class="category-header">
              <span class="category-name">
                ${DRAG_HANDLE}
                ${esc(sec.name)}
                <span class="category-count">${secItems.length}</span>
              </span>
              <div class="category-header-actions">
                <button class="btn btn-sm btn-ghost" data-action="add-item"
                  data-entity-id="${esc(eid)}" data-section-id="${esc(sec.id)}">
                  ${t("addItemBtn")}
                </button>
                <button class="icon-btn" data-action="edit-section"
                  data-entity-id="${esc(eid)}" data-section-id="${esc(sec.id)}" title="${t("renameSection")}">
                  ${EDIT_ICON}
                </button>
                <button class="icon-btn danger" data-action="delete-section"
                  data-entity-id="${esc(eid)}" data-section-id="${esc(sec.id)}" title="${t("deleteSection")}">
                  ${DELETE_ICON}
                </button>
              </div>
            </div>
            <div class="item-list">${itemsHtml}</div>
          </div>`;
          })
          .join("");

  return `
    <div class="categories">
      ${sectionsHtml}
      <button class="add-section-btn" data-action="add-section" data-entity-id="${esc(eid)}">
        ${t("addSectionBtn")}
      </button>
    </div>`;
}

function renderTasksTab(entity, tasks) {
  const entityTasks = tasks.filter((task) => task.entityId === entity.id);

  const tasksHtml =
    entityTasks.length === 0
      ? `<div class="empty-state" style="padding:40px 0">
         <div class="empty-icon">✅</div>
         <p>${t("noEntityTasks")}</p>
       </div>`
      : entityTasks.map((task) => renderTaskItem(task)).join("");

  return `
    <div class="page-header-row" style="margin-bottom:16px">
      <span></span>
      <button class="btn btn-primary btn-sm" data-action="add-task" data-entity-id="${esc(entity.id)}">
        ${t("addTaskBtn")}
      </button>
    </div>
    <div class="task-list">${tasksHtml}</div>`;
}

/** Render the detail view for a single entity */
export function renderEntityView(entityId, tab = "overview") {
  const { entities, items, tasks } = getState();
  const entity = entities.find((e) => e.id === entityId);
  if (!entity) {
    return `<p style="padding:40px;color:var(--text-secondary)">${t("entityNotFound")}</p>`;
  }

  const openTaskCount = tasks.filter(
    (task) => task.entityId === entityId && !task.done,
  ).length;

  const tabContent =
    tab === "tasks"
      ? renderTasksTab(entity, tasks)
      : renderOverviewTab(entity, items);

  return `
    <a href="#/entities" class="back-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      ${t("backBtn")}
    </a>
    <div class="entity-page-header">
      <div class="entity-page-title">
        <span class="entity-page-emoji">${entity.emoji}</span>
        <h2>${esc(entity.name)}</h2>
      </div>
      <div class="entity-header-actions">
        <button class="icon-btn" data-action="edit-entity" data-entity-id="${esc(entityId)}" title="${t("editEntityTitle")}">
          ${EDIT_ICON}
        </button>
        <button class="icon-btn danger" data-action="delete-entity" data-entity-id="${esc(entityId)}" title="${t("deleteEntityTitle")}">
          ${DELETE_ICON}
        </button>
      </div>
    </div>
    <div class="entity-tabs">
      <a class="entity-tab ${tab === "overview" ? "active" : ""}" href="#/entity/${esc(entityId)}">
        ${t("tabOverview")}
      </a>
      <a class="entity-tab ${tab === "tasks" ? "active" : ""}" href="#/entity/${esc(entityId)}/tasks">
        ${t("tabTasks")}
        ${openTaskCount > 0 ? `<span class="tab-count">${openTaskCount}</span>` : ""}
      </a>
    </div>
    ${tabContent}`;
}
