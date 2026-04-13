import { esc } from "../helpers.js";
import { t } from "../i18n.js";
import { getState } from "../state.js";
import { api } from "../api.js";
import { priorityLabel } from "../labels.js";

import { openModal, closeModal } from "../modal.js";

/* ===== HELPERS ===== */

/** Parse assigneeIds from stored JSON string or array */
export function parseAssigneeIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Radio button group for priority selection (null = nothing selected) */
export function priorityRadios(selected) {
  return ["high", "medium", "low"]
    .map(
      (p) =>
        `<div class="priority-option">
       <input type="radio" id="priority-${p}" name="priority" value="${p}" ${selected === p ? "checked" : ""}>
       <label for="priority-${p}" class="${p}-label">${priorityLabel(p)}</label>
     </div>`,
    )
    .join("");
}

/** Allow clicking the already-selected radio to deselect it */
export function bindPriorityRadios() {
  document.querySelectorAll(".priority-option").forEach((option) => {
    const radio = option.querySelector('input[type="radio"]');
    // Capture checked state on the wrapper so it works whether label or input is tapped
    option.addEventListener("pointerdown", () => {
      radio.dataset.wasChecked = String(radio.checked);
    });
    radio.addEventListener("click", () => {
      if (radio.dataset.wasChecked === "true") {
        radio.checked = false;
      }
    });
  });
}

const REPEAT_OPTIONS = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "3months",
  "6months",
  "yearly",
  "custom",
];

const REPEAT_FREQ_OPTIONS = ["days", "weeks", "months", "years"];

/**
 * Build the due date / time / repeat section HTML.
 * dueDate: "2026-04-15" or "2026-04-15T14:30" or null
 * repeat: one of REPEAT_OPTIONS or null
 * repeatEvery: number (custom interval count, default 1)
 * repeatFrequency: "days"|"weeks"|"months"|"years" (custom unit, default "days")
 */
function dueDateSection(
  dueDate,
  repeat,
  repeatEvery,
  repeatFrequency,
  earlyReminderValue,
  earlyReminderUnit,
) {
  const datePart = dueDate ? dueDate.split("T")[0] : "";
  const timePart =
    dueDate && dueDate.includes("T") ? dueDate.split("T")[1] : "";
  const hasDate = !!datePart;
  const isCustom = repeat === "custom";
  const everyVal = repeatEvery ?? 1;
  const freqVal = repeatFrequency ?? "days";

  const repeatOptions = REPEAT_OPTIONS.map(
    (r) =>
      `<option value="${r}" ${repeat === r ? "selected" : ""}>${t("repeat" + r.charAt(0).toUpperCase() + r.slice(1))}</option>`,
  ).join("");

  const freqOptions = REPEAT_FREQ_OPTIONS.map(
    (f) =>
      `<option value="${f}" ${freqVal === f ? "selected" : ""}>${t("repeatFreq" + f.charAt(0).toUpperCase() + f.slice(1))}</option>`,
  ).join("");

  return `
    <div class="form-group">
      <label class="form-label">
        ${t("fieldDueDate")}
        <span style="font-weight:400;text-transform:none;letter-spacing:0"> ${t("optional")}</span>
      </label>
      <div class="due-picker">
        <div class="due-row" id="due-date-row">
          <div class="due-input-wrap">
            <svg class="due-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input type="date" class="form-input due-date-input" name="dueDate"
              id="modal-due-date" value="${esc(datePart)}">
          </div>
          <button type="button" class="due-clear-btn" id="due-date-clear"
            style="${hasDate ? "" : "display:none"}" title="Clear date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="due-row due-time-row" id="due-time-row" style="${hasDate ? "" : "display:none"}">
          <div class="due-input-wrap">
            <svg class="due-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <input type="time" class="form-input due-time-input" name="dueTime"
              id="modal-due-time" value="${esc(timePart)}"
              placeholder="Add a time (optional)">
          </div>
          <button type="button" class="due-clear-btn" id="due-time-clear"
            style="${timePart ? "" : "display:none"}" title="Clear time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="due-row due-repeat-row" id="due-repeat-row" style="${hasDate ? "" : "display:none"}">
          <div class="due-input-wrap">
            <svg class="due-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <select class="form-input due-repeat-select" name="repeat" id="modal-repeat">
              <option value="">${t("repeatNever")}</option>
              ${repeatOptions}
            </select>
          </div>
        </div>
        <div class="due-row due-repeat-row" id="due-custom-row" style="${hasDate && isCustom ? "" : "display:none"}">
          <div class="due-custom-fields">
            <div class="due-custom-field">
              <label class="due-custom-label">${t("fieldRepeatEvery")}</label>
              <input type="number" class="form-input due-custom-number" name="repeatEvery"
                id="modal-repeat-every" min="1" max="999" value="${everyVal}">
            </div>
            <div class="due-custom-field">
              <label class="due-custom-label">${t("fieldRepeatFrequency")}</label>
              <select class="form-input" name="repeatFrequency" id="modal-repeat-freq">
                ${freqOptions}
              </select>
            </div>
          </div>
        </div>
        <div class="due-row due-reminder-row" id="due-reminder-row" style="${hasDate ? "" : "display:none"}">
          <div class="due-custom-fields">
            <div class="due-custom-field">
              <label class="due-custom-label">${t("fieldEarlyReminder")}</label>
              <input type="number" class="form-input due-custom-number" name="earlyReminderValue"
                id="modal-early-reminder-value" min="1" max="200"
                placeholder="${t("earlyReminderNone")}" value="${earlyReminderValue || ""}">
            </div>
            <div class="due-custom-field">
              <label class="due-custom-label">&nbsp;</label>
              <select class="form-input" name="earlyReminderUnit" id="modal-early-reminder-unit">
                <option value="minutes" ${earlyReminderUnit === "minutes" ? "selected" : ""}>${t("earlyReminderMinutes")}</option>
                <option value="hours"   ${earlyReminderUnit === "hours" ? "selected" : ""}>${t("earlyReminderHours")}</option>
                <option value="days"    ${!earlyReminderUnit || earlyReminderUnit === "days" ? "selected" : ""}>${t("earlyReminderDays")}</option>
                <option value="weeks"   ${earlyReminderUnit === "weeks" ? "selected" : ""}>${t("earlyReminderWeeks")}</option>
                <option value="months"  ${earlyReminderUnit === "months" ? "selected" : ""}>${t("earlyReminderMonths")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/** Wire up the interactive date/time/repeat picker behaviour after the modal is in the DOM */
function bindDuePicker() {
  const dateInput = document.getElementById("modal-due-date");
  const timeInput = document.getElementById("modal-due-time");
  const timeRow = document.getElementById("due-time-row");
  const repeatRow = document.getElementById("due-repeat-row");
  const customRow = document.getElementById("due-custom-row");
  const reminderRow = document.getElementById("due-reminder-row");
  const reminderValueInput = document.getElementById(
    "modal-early-reminder-value",
  );
  const repeatSelect = document.getElementById("modal-repeat");
  const repeatEvery = document.getElementById("modal-repeat-every");
  const dateClear = document.getElementById("due-date-clear");
  const timeClear = document.getElementById("due-time-clear");

  dateInput.addEventListener("change", () => {
    const hasDate = !!dateInput.value;
    timeRow.style.display = hasDate ? "" : "none";
    repeatRow.style.display = hasDate ? "" : "none";
    reminderRow.style.display = hasDate ? "" : "none";
    dateClear.style.display = hasDate ? "" : "none";
    if (!hasDate) {
      timeInput.value = "";
      timeClear.style.display = "none";
      repeatSelect.value = "";
      customRow.style.display = "none";
      reminderValueInput.value = "";
    }
  });

  dateClear.addEventListener("click", () => {
    dateInput.value = "";
    timeInput.value = "";
    repeatSelect.value = "";
    timeRow.style.display = "none";
    repeatRow.style.display = "none";
    customRow.style.display = "none";
    reminderRow.style.display = "none";
    dateClear.style.display = "none";
    timeClear.style.display = "none";
    reminderValueInput.value = "";
  });

  repeatSelect.addEventListener("change", () => {
    const isCustom = repeatSelect.value === "custom";
    customRow.style.display = isCustom ? "" : "none";
    if (isCustom && repeatEvery) repeatEvery.value = repeatEvery.value || 1;
  });

  timeInput.addEventListener("change", () => {
    timeClear.style.display = timeInput.value ? "" : "none";
  });

  timeClear.addEventListener("click", () => {
    timeInput.value = "";
    timeClear.style.display = "none";
  });
}

/** Combine date + time form fields into the stored dueDate value (or null) */
function buildDueDate(d) {
  if (!d.dueDate) return null;
  return d.dueTime ? `${d.dueDate}T${d.dueTime}` : d.dueDate;
}

/** Extract repeat value from form data (null when no date or "Never" selected) */
function buildRepeat(d) {
  if (!d.dueDate) return null;
  return d.repeat || null;
}

/** Extract custom repeat fields (only meaningful when repeat === "custom") */
function buildRepeatCustom(d) {
  return {
    repeatEvery:
      d.repeat === "custom"
        ? Math.max(1, parseInt(d.repeatEvery, 10) || 1)
        : null,
    repeatFrequency: d.repeat === "custom" ? d.repeatFrequency || "days" : null,
  };
}

/** Multi-checkbox user picker for the "Assigned to" field */
function assigneePicker(selectedIds = []) {
  const { users } = getState();
  if (!users.length) return "";
  const checkboxes = users
    .map(
      (u) => `
    <label class="assignee-option">
      <input type="checkbox" name="assigneeIds" value="${esc(u.id)}"
        ${selectedIds.includes(u.id) ? "checked" : ""}>
      <span>${esc(u.username)}</span>
    </label>`,
    )
    .join("");
  return `
    <div class="form-group">
      <label class="form-label">${t("fieldAssignedTo")} <span style="font-weight:400;text-transform:none;letter-spacing:0">${t("optional")}</span></label>
      <div class="assignee-picker">${checkboxes}</div>
    </div>`;
}

/** Build the entity select HTML for the "Related to" field */
function entitySelect(selectedEntityId) {
  const { entities } = getState();
  return `
    <div class="form-group">
      <label class="form-label" for="task-entity">${t("fieldRelatedTo")}</label>
      <select class="form-select" id="task-entity" name="entityId">
        <option value="">— ${t("noEntity")} —</option>
        ${entities
          .map(
            (e) =>
              `<option value="${esc(e.id)}" ${e.id === selectedEntityId ? "selected" : ""}>${esc(e.name)}</option>`,
          )
          .join("")}
      </select>
    </div>`;
}

/* ===== MODALS ===== */

/**
 * Open the "add task" modal.
 * @param {string|null} preSelectedEntityId - pre-select an entity (optional)
 * @param {Function}    renderFn
 */
export function showAddTaskModal(preSelectedEntityId, renderFn) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t("modalAddTask")}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="task-form">
      <div class="form-group">
        <label class="form-label" for="task-name">${t("fieldTaskName")}</label>
        <input class="form-input" id="task-name" name="name" type="text"
          placeholder="${t("placeholderTask")}" required>
      </div>
      ${entitySelect(preSelectedEntityId)}
      <div class="form-group">
        <label class="form-label">${t("fieldPriority")}</label>
        <div class="priority-options">${priorityRadios(null)}</div>
      </div>
      ${dueDateSection(null, null, null, null, null, null)}
      ${assigneePicker([])}
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t("btnCancel")}</button>
        <button type="submit" class="btn btn-primary">${t("btnAddTask")}</button>
      </div>
    </form>`);

  bindDuePicker();
  bindPriorityRadios();

  document.getElementById("task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const assigneeIds = [
      ...e.target.querySelectorAll('[name="assigneeIds"]:checked'),
    ].map((cb) => cb.value);
    const { repeatEvery, repeatFrequency } = buildRepeatCustom(d);
    const earlyVal = d.earlyReminderValue
      ? parseInt(d.earlyReminderValue, 10)
      : null;
    const task = await api.createTask({
      name: d.name.trim(),
      entityId: d.entityId || null,
      priority: d.priority || null,
      assigneeIds,
      dueDate: buildDueDate(d),
      repeat: buildRepeat(d),
      repeatEvery,
      repeatFrequency,
      earlyReminderValue: earlyVal,
      earlyReminderUnit: earlyVal ? d.earlyReminderUnit || "days" : null,
    });
    getState().tasks.unshift(task);
    closeModal();
    renderFn();
  });
}

/**
 * Open the "edit task" modal.
 * @param {string}   taskId
 * @param {Function} renderFn
 */
export function showEditTaskModal(taskId, renderFn) {
  const task = getState().tasks.find((task) => task.id === taskId);
  if (!task) return;

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t("modalEditTask")}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="task-form">
      <div class="form-group">
        <label class="form-label" for="task-name">${t("fieldTaskName")}</label>
        <input class="form-input" id="task-name" name="name" type="text"
          value="${esc(task.name)}" required>
      </div>
      ${entitySelect(task.entityId)}
      <div class="form-group">
        <label class="form-label">${t("fieldPriority")}</label>
        <div class="priority-options">${priorityRadios(task.priority)}</div>
      </div>
      ${dueDateSection(task.dueDate ?? null, task.repeat ?? null, task.repeatEvery ?? null, task.repeatFrequency ?? null, task.earlyReminderValue ?? null, task.earlyReminderUnit ?? null)}
      ${assigneePicker(parseAssigneeIds(task.assigneeIds))}
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t("btnCancel")}</button>
        <button type="submit" class="btn btn-primary">${t("btnSaveChanges")}</button>
      </div>
    </form>`);

  bindDuePicker();
  bindPriorityRadios();

  document.getElementById("task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const assigneeIds = [
      ...e.target.querySelectorAll('[name="assigneeIds"]:checked'),
    ].map((cb) => cb.value);
    const { repeatEvery, repeatFrequency } = buildRepeatCustom(d);
    const earlyVal = d.earlyReminderValue
      ? parseInt(d.earlyReminderValue, 10)
      : null;
    const updates = {
      name: d.name.trim(),
      entityId: d.entityId || null,
      priority: d.priority || null,
      assigneeIds,
      dueDate: buildDueDate(d),
      repeat: buildRepeat(d),
      repeatEvery,
      repeatFrequency,
      earlyReminderValue: earlyVal,
      earlyReminderUnit: earlyVal ? d.earlyReminderUnit || "days" : null,
    };
    Object.assign(task, updates);
    closeModal();
    renderFn();
    await api.updateTask(task.id, updates);
  });
}
