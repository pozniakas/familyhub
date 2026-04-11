/**
 * FamilyHub — entry point
 *
 * Note: this app uses ES modules and must be served over HTTP (not file://).
 * Run: npm start  →  open http://localhost:3000
 */
import { loadState } from "./state.js";
import { t, getLang, toggleLang } from "./i18n.js";
import {
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} from "./events.js";
import { render } from "./render.js";
import { handleViewClick, handleViewChange } from "./events.js";
import { closeModal } from "./modal.js";

async function init() {
  const viewEl = document.getElementById("view");
  viewEl.innerHTML = `<p style="padding:60px;text-align:center;color:var(--text-secondary)">${t("loading")}</p>`;

  try {
    await loadState();
  } catch {
    viewEl.innerHTML = `
      <div style="padding:60px 24px;text-align:center;color:var(--urgent)">
        <div style="font-size:32px;margin-bottom:12px">⚠️</div>
        <p style="font-weight:600;margin-bottom:8px">${t("serverError")}</p>
        <p style="color:var(--text-secondary);font-size:14px">
          ${t("serverErrorHint")}<br>
          <code style="font-family:monospace;background:var(--bg);padding:2px 6px;border-radius:4px">npm start</code>
        </p>
      </div>`;
    return;
  }

  // Refresh button — re-fetches all state from server
  const refreshBtn = document.getElementById("refresh-btn");
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.classList.add("spinning");
    try {
      await loadState();
      render();
    } finally {
      refreshBtn.classList.remove("spinning");
    }
  });

  // Language toggle button
  const langBtn = document.getElementById("lang-toggle");
  function updateLangButton() {
    langBtn.textContent = getLang() === "en" ? "LT" : "EN";
  }
  function updateNavLabels() {
    document.querySelectorAll(".top-nav-link").forEach((a) => {
      const route = a.dataset.route;
      if (route === "tasks") a.textContent = t("navTasks");
      if (route === "entities") a.textContent = t("navEntities");
    });
    document.querySelectorAll(".bottom-nav-item").forEach((a) => {
      const route = a.dataset.route;
      const span = a.querySelector("span");
      if (!span) return;
      if (route === "tasks") span.textContent = t("navTasks");
      if (route === "entities") span.textContent = t("navEntities");
    });
    document.documentElement.lang = getLang();
  }
  updateLangButton();
  updateNavLabels();
  langBtn.addEventListener("click", () => {
    toggleLang();
    updateLangButton();
    updateNavLabels();
    render();
  });

  render();
  window.addEventListener("hashchange", render);

  // All view interactions use event delegation
  viewEl.addEventListener("click", handleViewClick);
  viewEl.addEventListener("change", handleViewChange);
  viewEl.addEventListener("dragstart", handleDragStart);
  viewEl.addEventListener("dragover", handleDragOver);
  viewEl.addEventListener("dragleave", handleDragLeave);
  viewEl.addEventListener("drop", handleDrop);
  viewEl.addEventListener("dragend", handleDragEnd);
  viewEl.addEventListener("touchstart", handleTouchStart, { passive: false });
  viewEl.addEventListener("touchmove", handleTouchMove, { passive: false });
  viewEl.addEventListener("touchend", handleTouchEnd);

  // Modal actions (close button, form cancel)
  document.getElementById("modal").addEventListener("click", handleViewClick);

  // Clicking the backdrop closes the modal
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-overlay")) closeModal();
  });

  // Escape key closes the modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

init();
