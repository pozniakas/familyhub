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
import { api } from "./api.js";
import { isLoggedIn, setAuth, clearAuth } from "./auth.js";
import { getPushState, subscribePush, unsubscribePush } from "./push.js";
import { showEditTaskModal } from "./modals/tasks.js";

/** Open edit modal for a task ID encoded in the hash as ?edit=<id>, then clean it. */
function checkDeepLink() {
  if (!isLoggedIn()) return;
  // Read edit param from the hash query string: #/tasks?edit=<id>
  const hashQuery = window.location.hash.split("?")[1] || "";
  const taskId = new URLSearchParams(hashQuery).get("edit");
  if (!taskId) return;
  // Strip the query from the hash without adding a history entry
  const cleanHash = window.location.hash.split("?")[0];
  history.replaceState(null, "", window.location.pathname + cleanHash);
  Promise.resolve().then(() => showEditTaskModal(taskId, render));
}

async function init() {
  const viewEl = document.getElementById("view");

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

  // Logout button visibility
  const logoutBtn = document.getElementById("logout-btn");
  function updateLogoutVisibility() {
    if (logoutBtn) logoutBtn.style.display = isLoggedIn() ? "" : "none";
  }
  updateLogoutVisibility();
  logoutBtn?.addEventListener("click", () => {
    clearAuth();
    updateLogoutVisibility();
    updatePushButton();
    render();
  });

  // Push notifications bell button
  const pushBtn = document.getElementById("push-btn");
  const pushIconOff = document.getElementById("push-icon-off");
  const pushIconOn = document.getElementById("push-icon-on");

  async function updatePushButton() {
    if (!pushBtn) return;
    if (!isLoggedIn()) {
      pushBtn.style.display = "none";
      return;
    }
    const state = await getPushState();
    if (state === "unsupported") {
      pushBtn.style.display = "none";
      return;
    }
    pushBtn.style.display = "";
    const on = state === "subscribed";
    pushIconOff.style.display = on ? "none" : "";
    pushIconOn.style.display = on ? "" : "none";
    pushBtn.title = on ? t("pushDisable") : t("pushEnable");
  }

  pushBtn?.addEventListener("click", async () => {
    const state = await getPushState();
    if (state === "denied") {
      alert(t("pushDenied"));
      return;
    }
    try {
      if (state === "subscribed") {
        await unsubscribePush();
      } else {
        await subscribePush();
      }
    } catch (err) {
      console.error("Push toggle failed:", err);
    }
    updatePushButton();
  });

  updatePushButton();

  // Handle session expiry
  window.addEventListener("familyhub:unauthorized", () => {
    updateLogoutVisibility();
    render();
  });

  // If not logged in, just render the login screen (no data fetch needed)
  if (!isLoggedIn()) {
    render();
    window.addEventListener("hashchange", render);
    wireViewEvents(viewEl, updatePushButton);
    return;
  }

  // Logged-in boot: fetch data
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

  render();
  checkDeepLink();
  window.addEventListener("hashchange", () => {
    render();
    checkDeepLink();
  });
  wireViewEvents(viewEl, updatePushButton);

  // Handle messages from the service worker (notificationclick while app is open)
  navigator.serviceWorker?.addEventListener("message", (e) => {
    if (e.data?.type === "open-task") {
      // Just open the modal on top of whatever view is showing.
      // No hash change needed — avoids triggering a re-render race.
      Promise.resolve().then(() => showEditTaskModal(e.data.taskId, render));
    }
  });
}

function wireViewEvents(viewEl, updatePushButton) {
  // Login form — delegated because viewEl is re-rendered on route change
  viewEl.addEventListener("submit", async (e) => {
    const form = e.target.closest("#login-form");
    if (!form) return;
    e.preventDefault();
    const username = form.querySelector("[name=username]").value.trim();
    const password = form.querySelector("[name=password]").value;
    const errorEl = document.getElementById("login-error");
    let loginData;
    try {
      loginData = await api.login(username, password);
    } catch {
      if (errorEl) {
        errorEl.textContent = t("loginError");
        errorEl.style.display = "";
      }
      return;
    }
    setAuth(loginData.token, username);
    document.getElementById("logout-btn").style.display = "";
    updatePushButton();
    try {
      await loadState();
    } catch (err) {
      console.error("Failed to load state after login:", err);
    }
    render();
    checkDeepLink();
  });

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
