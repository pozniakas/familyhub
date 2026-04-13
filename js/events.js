import {
  getState,
  setTaskFilter,
  setTaskAssigneeFilter,
  setTaskEntityFilter,
} from "./state.js";
import { t } from "./i18n.js";
import { confirmDialog } from "./helpers.js";
import { api } from "./api.js";

/* ===== DRAG-AND-DROP (sections + items) ===== */

let dragState = null; // { id, type, entityId, sectionId }
let touchDragState = null; // { id, type, entityId, sectionId, sourceEl }

export function handleDragStart(e) {
  const el = e.target.closest("[data-drag-type]");
  if (!el) return;
  dragState = {
    id: el.dataset.dragId,
    type: el.dataset.dragType,
    entityId: el.dataset.entityId,
    sectionId: el.dataset.sectionId ?? null,
  };
  e.dataTransfer.effectAllowed = "move";
  // Defer so the class doesn't affect the drag ghost image
  requestAnimationFrame(() => el.classList.add("dragging"));
}

export function handleDragOver(e) {
  if (!dragState) return;
  const el = e.target.closest(`[data-drag-type="${dragState.type}"]`);
  if (!el || el.dataset.dragId === dragState.id) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  document
    .querySelectorAll(".drag-over")
    .forEach((x) => x.classList.remove("drag-over"));
  el.classList.add("drag-over");
}

export function handleDragLeave(e) {
  if (e.target.closest)
    e.target.closest("[data-drag-type]")?.classList.remove("drag-over");
}

export function handleDrop(e) {
  e.preventDefault();
  if (!dragState) return;
  const target = e.target.closest(`[data-drag-type="${dragState.type}"]`);
  if (!target || target.dataset.dragId === dragState.id) return cleanupDrag();

  const { id, type, entityId, sectionId } = dragState;
  const targetId = target.dataset.dragId;
  const s = getState();

  if (type === "section") {
    const entity = s.entities.find((e) => e.id === entityId);
    if (!entity) return cleanupDrag();
    const from = entity.sections.findIndex((s) => s.id === id);
    const to = entity.sections.findIndex((s) => s.id === targetId);
    entity.sections.splice(to, 0, entity.sections.splice(from, 1)[0]);
    render();
    api.reorderSections(
      entityId,
      entity.sections.map((s) => s.id),
    );
  } else if (type === "item") {
    const sec = sectionId;
    const sectionItems = s.items.filter(
      (i) => i.entityId === entityId && i.sectionId === sec,
    );
    const from = sectionItems.findIndex((i) => i.id === id);
    const to = sectionItems.findIndex((i) => i.id === targetId);
    sectionItems.splice(to, 0, sectionItems.splice(from, 1)[0]);
    // Rebuild flat items array preserving other items' positions
    const others = s.items.filter(
      (i) => !(i.entityId === entityId && i.sectionId === sec),
    );
    s.items = [...others, ...sectionItems];
    render();
    api.reorderItems(
      entityId,
      sec,
      sectionItems.map((i) => i.id),
    );
  }

  cleanupDrag();
}

export function handleDragEnd() {
  cleanupDrag();
}

function cleanupDrag() {
  document.querySelectorAll(".dragging, .drag-over").forEach((el) => {
    el.classList.remove("dragging", "drag-over");
  });
  dragState = null;
}

/* ===== TOUCH DRAG-AND-DROP (iOS Safari fallback) ===== */

export function handleTouchStart(e) {
  const handle = e.target.closest(".drag-handle");
  if (!handle) return;
  const el = handle.closest("[data-drag-type]");
  if (!el) return;
  e.preventDefault();
  touchDragState = {
    id: el.dataset.dragId,
    type: el.dataset.dragType,
    entityId: el.dataset.entityId,
    sectionId: el.dataset.sectionId ?? null,
    sourceEl: el,
  };
  requestAnimationFrame(() => el.classList.add("dragging"));
}

export function handleTouchMove(e) {
  if (!touchDragState) return;
  e.preventDefault();
  const touch = e.touches[0];
  touchDragState.sourceEl.style.visibility = "hidden";
  const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  touchDragState.sourceEl.style.visibility = "";
  document
    .querySelectorAll(".drag-over")
    .forEach((x) => x.classList.remove("drag-over"));
  const target = elBelow?.closest(`[data-drag-type="${touchDragState.type}"]`);
  if (target && target.dataset.dragId !== touchDragState.id) {
    target.classList.add("drag-over");
  }
}

export function handleTouchEnd(e) {
  if (!touchDragState) return;
  const touch = e.changedTouches[0];
  touchDragState.sourceEl.style.visibility = "hidden";
  const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  touchDragState.sourceEl.style.visibility = "";
  document
    .querySelectorAll(".drag-over, .dragging")
    .forEach((x) => x.classList.remove("drag-over", "dragging"));

  const target = elBelow?.closest(`[data-drag-type="${touchDragState.type}"]`);
  if (!target || target.dataset.dragId === touchDragState.id) {
    touchDragState = null;
    return;
  }

  const { id, type, entityId, sectionId } = touchDragState;
  const targetId = target.dataset.dragId;
  const s = getState();

  if (type === "section") {
    const entity = s.entities.find((e) => e.id === entityId);
    if (!entity) {
      touchDragState = null;
      return;
    }
    const from = entity.sections.findIndex((s) => s.id === id);
    const to = entity.sections.findIndex((s) => s.id === targetId);
    entity.sections.splice(to, 0, entity.sections.splice(from, 1)[0]);
    render();
    api.reorderSections(
      entityId,
      entity.sections.map((s) => s.id),
    );
  } else if (type === "item") {
    const sec = sectionId;
    const sectionItems = s.items.filter(
      (i) => i.entityId === entityId && i.sectionId === sec,
    );
    const from = sectionItems.findIndex((i) => i.id === id);
    const to = sectionItems.findIndex((i) => i.id === targetId);
    sectionItems.splice(to, 0, sectionItems.splice(from, 1)[0]);
    const others = s.items.filter(
      (i) => !(i.entityId === entityId && i.sectionId === sec),
    );
    s.items = [...others, ...sectionItems];
    render();
    api.reorderItems(
      entityId,
      sec,
      sectionItems.map((i) => i.id),
    );
  }

  touchDragState = null;
}
import { closeModal } from "./modal.js";
import {
  showAddItemModal,
  showEditItemModal,
  showItemDetailModal,
} from "./modals/items.js";
import { showAddTaskModal, showEditTaskModal } from "./modals/tasks.js";
import {
  showAddEntityModal,
  showEditEntityModal,
  showAddSectionModal,
  showEditSectionModal,
} from "./modals/entities.js";
import { render } from "./render.js";

/** Advance a dueDate string by one repeat interval */
function nextDueDate(dueDate, repeat, repeatEvery, repeatFrequency) {
  if (!dueDate || !repeat) return dueDate;
  const hasTime = dueDate.includes("T");
  const date = hasTime
    ? new Date(dueDate)
    : (() => {
        const [y, m, d] = dueDate.split("-").map(Number);
        return new Date(y, m - 1, d);
      })();

  if (repeat === "custom") {
    const n = Math.max(1, repeatEvery || 1);
    switch (repeatFrequency) {
      case "weeks":
        date.setDate(date.getDate() + n * 7);
        break;
      case "months":
        date.setMonth(date.getMonth() + n);
        break;
      case "years":
        date.setFullYear(date.getFullYear() + n);
        break;
      default:
        date.setDate(date.getDate() + n);
        break; // days
    }
  } else {
    switch (repeat) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "biweekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "3months":
        date.setMonth(date.getMonth() + 3);
        break;
      case "6months":
        date.setMonth(date.getMonth() + 6);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  }

  const p = (n) => String(n).padStart(2, "0");
  const dateStr = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
  return hasTime
    ? `${dateStr}T${p(date.getHours())}:${p(date.getMinutes())}`
    : dateStr;
}

/** Change handler — handles task checkbox toggles and dropdown filters via event delegation */
export function handleViewChange(e) {
  if (e.target.classList.contains("task-checkbox")) {
    const id = e.target.dataset.id;
    const task = getState().tasks.find((t) => t.id === id);
    if (!task) return;

    // Recurring task being checked: mark this instance done AND create the next occurrence
    if (e.target.checked && task.repeat && task.dueDate) {
      task.done = true;
      task.completedAt = new Date().toISOString();
      render();
      api.updateTask(id, { done: true });
      // Create the next occurrence in the background — no creation notification
      api
        .createTask({
          name: task.name,
          entityId: task.entityId,
          priority: task.priority,
          assigneeIds: task.assigneeIds ? JSON.parse(task.assigneeIds) : [],
          dueDate: nextDueDate(
            task.dueDate,
            task.repeat,
            task.repeatEvery,
            task.repeatFrequency,
          ),
          repeat: task.repeat,
          repeatEvery: task.repeatEvery,
          repeatFrequency: task.repeatFrequency,
          earlyReminderValue: task.earlyReminderValue ?? null,
          earlyReminderUnit: task.earlyReminderUnit ?? null,
          suppressNotification: true,
        })
        .then((newTask) => {
          getState().tasks.unshift(newTask);
          render();
        });
      return;
    }

    task.done = e.target.checked;
    task.completedAt = task.done ? new Date().toISOString() : null;
    render();
    api.updateTask(id, { done: task.done });
    return;
  }
  if (e.target.dataset.action === "set-assignee-filter") {
    setTaskAssigneeFilter(e.target.value);
    render();
    return;
  }
  if (e.target.dataset.action === "set-entity-filter") {
    setTaskEntityFilter(e.target.value);
    render();
  }
}

/** Central click handler — dispatches on [data-action] attributes */
export async function handleViewClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id, entityId, sectionId, filter } = btn.dataset;

  switch (action) {
    // ── Items ──────────────────────────────────────────────────────────────────
    case "add-item":
      showAddItemModal(entityId, sectionId, render);
      break;

    case "view-item":
      showItemDetailModal(id, render);
      break;

    case "edit-item":
      showEditItemModal(id, render);
      break;

    case "delete-item":
      if (!(await confirmDialog(t("confirmDeleteItem")))) return;
      getState().items = getState().items.filter((i) => i.id !== id);
      render();
      api.deleteItem(id);
      break;

    // ── Tasks ──────────────────────────────────────────────────────────────────
    case "add-task":
      showAddTaskModal(entityId || null, render);
      break;

    case "edit-task":
      showEditTaskModal(id, render);
      break;

    case "delete-task":
      if (!(await confirmDialog(t("confirmDeleteTask")))) return;
      getState().tasks = getState().tasks.filter((t) => t.id !== id);
      render();
      api.deleteTask(id);
      break;

    case "set-filter":
      setTaskFilter(filter);
      render();
      break;

    // ── Entities ───────────────────────────────────────────────────────────────
    case "add-entity":
      showAddEntityModal(render);
      break;

    case "edit-entity":
      showEditEntityModal(entityId, render);
      break;

    case "delete-entity":
      if (!(await confirmDialog(t("confirmDeleteEntity")))) return;
      {
        const s = getState();
        s.entities = s.entities.filter((e) => e.id !== entityId);
        s.items = s.items.filter((i) => i.entityId !== entityId);
        window.location.hash = "#/";
        render();
        api.deleteEntity(entityId);
      }
      break;

    // ── Sections ───────────────────────────────────────────────────────────────
    case "add-section":
      showAddSectionModal(entityId, render);
      break;

    case "edit-section":
      showEditSectionModal(entityId, sectionId, render);
      break;

    case "delete-section":
      if (!(await confirmDialog(t("confirmDeleteSection")))) return;
      {
        const s = getState();
        const entity = s.entities.find((e) => e.id === entityId);
        if (entity)
          entity.sections = entity.sections.filter(
            (sec) => sec.id !== sectionId,
          );
        s.items = s.items.filter(
          (i) => !(i.entityId === entityId && i.sectionId === sectionId),
        );
        render();
        api.deleteSection(entityId, sectionId);
      }
      break;

    // ── Modal ──────────────────────────────────────────────────────────────────
    case "close-modal":
      closeModal();
      break;
  }
}
