import { esc, greetingKey } from "../helpers.js";
import { t } from "../i18n.js";
import {
  getState,
  getTaskFilter,
  getTaskAssigneeFilter,
  getTaskEntityFilter,
} from "../state.js";
import { priorityLabel, priorityBadgeClass } from "../labels.js";

/* ===== DUE DATE HELPERS ===== */

/**
 * Parse a stored dueDate string into a local Date.
 * "2026-04-15"       → midnight local time
 * "2026-04-15T14:30" → local 14:30
 */
function parseDueDate(str) {
  if (!str) return null;
  if (str.includes("T")) return new Date(str);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Return a { label, cls } descriptor for rendering a due date badge,
 * or null if no due date is set.
 */
export function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const date = parseDueDate(dueDate);
  const now = new Date();
  const hasTime = dueDate.includes("T");

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round((dueStart - todayStart) / 86400000);

  const timeStr = hasTime
    ? " · " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  // If it has a specific time and that moment has already passed → overdue
  const isPast = hasTime ? date < now : diffDays < 0;

  if (isPast || diffDays < 0) {
    const dateLabel =
      diffDays === 0
        ? t("dueToday")
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
    return {
      label: t("dueOverdue", { date: `${dateLabel}${timeStr}` }),
      cls: "due-overdue",
    };
  }
  if (diffDays === 0)
    return { label: `${t("dueToday")}${timeStr}`, cls: "due-today" };
  if (diffDays === 1)
    return { label: `${t("dueTomorrow")}${timeStr}`, cls: "due-soon" };
  if (diffDays <= 7)
    return {
      label: date.toLocaleDateString([], { weekday: "long" }) + timeStr,
      cls: "due-soon",
    };
  return {
    label:
      date.toLocaleDateString([], { month: "short", day: "numeric" }) + timeStr,
    cls: "due-future",
  };
}

const CALENDAR_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
</svg>`;

const REPEAT_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
</svg>`;

/* ===== RENDERERS ===== */

/** Render a single task row (used in both the tasks view and the dashboard preview) */
export function renderTaskItem(task) {
  const { entities } = getState();
  const entity = entities.find((e) => e.id === task.entityId);
  const assigned = task.assignedTo
    ? `<span class="task-assigned">→ ${esc(task.assignedTo)}</span>`
    : "";
  const due = formatDueDate(task.dueDate);
  const dueHtml = due
    ? `<div class="task-due ${due.cls}">${CALENDAR_ICON} ${esc(due.label)}${task.repeat ? ` ${REPEAT_ICON}` : ""}</div>`
    : "";

  return `
    <div class="task-item ${task.done ? "done" : ""}" data-task-id="${esc(task.id)}">
      <div class="task-checkbox-wrap">
        <input type="checkbox" class="task-checkbox" data-action="toggle-task"
          data-id="${esc(task.id)}" ${task.done ? "checked" : ""}>
      </div>
      <div class="task-content">
        <div class="task-name">${esc(task.name)}</div>
        <div class="task-meta">
          ${entity ? `<span class="badge badge-entity">${esc(entity.name)}</span>` : ""}
          <span class="badge ${priorityBadgeClass(task.priority)}">${priorityLabel(task.priority)}</span>
        </div>
        ${dueHtml}
        ${assigned}
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit-task" data-id="${esc(task.id)}" title="${t("editTask")}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn danger" data-action="delete-task" data-id="${esc(task.id)}" title="${t("deleteTask")}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>`;
}

/**
 * Sort tasks: due-date tasks first (ascending), then no-due-date tasks
 * (preserving their original order, which is newest-first from unshift).
 */
function sortedTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

/** Render the full tasks view */
export function renderTasksView() {
  const filter = getTaskFilter();
  const assigneeFilter = getTaskAssigneeFilter();
  const entityFilter = getTaskEntityFilter();
  const { tasks, entities } = getState();

  // Collect unique non-empty assignees across all tasks
  const assignees = [
    ...new Set(tasks.map((t) => t.assignedTo).filter(Boolean)),
  ].sort();

  let filtered = tasks;
  if (filter === "todo") filtered = filtered.filter((task) => !task.done);
  if (filter === "done") filtered = filtered.filter((task) => task.done);
  if (assigneeFilter === "__none__")
    filtered = filtered.filter((t) => !t.assignedTo);
  else if (assigneeFilter)
    filtered = filtered.filter((t) => t.assignedTo === assigneeFilter);
  if (entityFilter === "__none__")
    filtered = filtered.filter((t) => !t.entityId);
  else if (entityFilter)
    filtered = filtered.filter((t) => t.entityId === entityFilter);
  filtered = sortedTasks(filtered);

  const filterBtn = (key, label) =>
    `<button class="filter-btn ${filter === key ? "active" : ""}"
       data-action="set-filter" data-filter="${key}">${label}</button>`;

  const assigneeSelect = `
    <select class="filter-select ${assigneeFilter ? "filter-select-active" : ""}" data-action="set-assignee-filter">
      <option value="">${t("filterAssigneeAll")}</option>
      <option value="__none__" ${assigneeFilter === "__none__" ? "selected" : ""}>${t("filterAssigneeNone")}</option>
      ${assignees.map((a) => `<option value="${esc(a)}" ${assigneeFilter === a ? "selected" : ""}>${esc(a)}</option>`).join("")}
    </select>`;

  const entitySelect = `
    <select class="filter-select ${entityFilter ? "filter-select-active" : ""}" data-action="set-entity-filter">
      <option value="">${t("filterEntityAll")}</option>
      <option value="__none__" ${entityFilter === "__none__" ? "selected" : ""}>${t("filterEntityNone")}</option>
      ${entities.map((e) => `<option value="${esc(e.id)}" ${entityFilter === e.id ? "selected" : ""}>${esc(e.name)}</option>`).join("")}
    </select>`;

  const tasksHtml =
    filtered.length === 0
      ? `<div class="empty-state">
        <div class="empty-icon">${filter === "done" ? "📋" : "🎉"}</div>
        <p>${filter === "done" ? t("emptyDone") : t("emptyTodo")}</p>
       </div>`
      : filtered.map((task) => renderTaskItem(task)).join("");

  return `
    <div class="page-header">
      <h2>${t(greetingKey())} 👋</h2>
      <p class="subtitle">${t("tasksSubtitle")}</p>
    </div>
    <div class="page-header-row page-header" style="margin-top:0;padding-top:0">
      <h2>${t("tasksHeading")}</h2>
      <button class="btn btn-primary" data-action="add-task">${t("addTaskBtn")}</button>
    </div>
    <div class="task-filters">
      ${filterBtn("todo", t("filterTodo"))}
      ${filterBtn("done", t("filterDone"))}
      ${filterBtn("all", t("filterAll"))}
    </div>
    <div class="task-dropdowns">
      ${assigneeSelect}
      ${entitySelect}
    </div>
    <div class="task-list">${tasksHtml}</div>`;
}
