import { t } from './i18n.js';

/** Human-readable label for a status value */
export function statusLabel(s) {
  return s === "ok" ? t('statusAllGood') : s === "soon" ? t('statusNeedsAttention') : t('statusUrgentLabel');
}

/** CSS badge class for a status value */
export function statusBadgeClass(s) {
  return s === "ok" ? "badge-ok" : s === "soon" ? "badge-soon" : "badge-urgent";
}

/** Human-readable label for a priority value (null → empty string) */
export function priorityLabel(p) {
  return p === "high" ? t('priorityHigh') : p === "medium" ? t('priorityMedium') : p === "low" ? t('priorityLow') : "";
}

/** CSS badge class for a priority value (null → hidden) */
export function priorityBadgeClass(p) {
  return p === "high"
    ? "badge-high"
    : p === "medium"
      ? "badge-medium"
      : p === "low"
        ? "badge-low"
        : "badge-hidden";
}

/** Cycle status: ok → soon → urgent → ok */
export function cycleStatus(s) {
  return s === "ok" ? "soon" : s === "soon" ? "urgent" : "ok";
}
