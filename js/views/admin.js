import { esc } from "../helpers.js";
import { t } from "../i18n.js";
import { api } from "../api.js";

/** Admin password lives only in memory — page refresh clears it automatically */
let adminPassword = null;

export function isAdminAuthed() {
  return !!adminPassword;
}

/** Render the admin view — either password gate or user management */
export function renderAdminView() {
  if (!adminPassword) return renderAdminGate();
  return renderUserManager();
}

function renderAdminGate() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo" style="font-size:16px;margin-bottom:4px">FamilyHub</div>
        <h3 style="text-align:center;margin-bottom:24px;font-size:20px">${t("adminHeading")}</h3>
        <form class="form" id="admin-gate-form">
          <div class="form-group">
            <label class="form-label" for="admin-gate-pw">${t("adminPasswordLabel")}</label>
            <input class="form-input" id="admin-gate-pw" name="password"
              type="password" required autofocus>
          </div>
          <p class="login-error" id="admin-gate-error" style="display:none"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px">
            ${t("adminLoginBtn")}
          </button>
        </form>
      </div>
    </div>`;
}

function renderUserManager(users = [], feedback = "") {
  const rows = users
    .map(
      (u) => `
    <div class="admin-user-row" data-user-id="${esc(u.id)}">
      <div class="admin-user-info">
        <span class="admin-username">${esc(u.username)}</span>
        <span class="admin-user-date">${new Date(u.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="admin-user-actions">
        ${u.hasPush ? `<button class="btn btn-sm btn-ghost" data-action="admin-push-test" data-id="${esc(u.id)}">🔔 ${t("adminPushTest")}</button>` : ""}
        <button class="btn btn-sm btn-ghost" data-action="admin-change-pw" data-id="${esc(u.id)}">
          ${t("adminChangePassword")}
        </button>
        <button class="btn btn-sm btn-ghost danger" data-action="admin-delete-user" data-id="${esc(u.id)}" data-username="${esc(u.username)}">
          ${t("adminDeleteUser")}
        </button>
      </div>
    </div>
    <div class="admin-change-pw-form" id="pw-form-${esc(u.id)}" style="display:none">
      <form class="admin-inline-form" data-action="admin-save-pw" data-id="${esc(u.id)}">
        <input class="form-input" type="password" name="password"
          placeholder="${t("adminNewPassword")}" required style="flex:1">
        <button type="submit" class="btn btn-sm btn-primary">${t("adminSaveBtn")}</button>
        <button type="button" class="btn btn-sm btn-ghost" data-action="admin-cancel-pw" data-id="${esc(u.id)}">${t("btnCancel")}</button>
      </form>
    </div>`,
    )
    .join("");

  return `
    <div class="page-header">
      <h2>${t("adminHeading")}</h2>
    </div>

    ${feedback ? `<p class="admin-feedback">${esc(feedback)}</p>` : ""}

    <div class="admin-section">
      <h3 class="admin-section-title">${t("adminUsers")}</h3>
      <div id="admin-user-list">
        ${rows.length ? rows : `<p style="color:var(--text-secondary);padding:16px 0">${t("adminNoUsers")}</p>`}
      </div>
    </div>

    <div class="admin-section">
      <h3 class="admin-section-title">${t("adminAddUser")}</h3>
      <form class="admin-inline-form" id="admin-create-form">
        <input class="form-input" name="username" type="text"
          placeholder="${t("adminUsernameLabel")}" required style="flex:1">
        <input class="form-input" name="password" type="password"
          placeholder="${t("loginPassword")}" required style="flex:1">
        <button type="submit" class="btn btn-primary btn-sm">${t("adminCreateBtn")}</button>
      </form>
      <p class="login-error" id="admin-create-error" style="display:none"></p>
    </div>`;
}

/**
 * Called once after renderAdminView() is injected into the DOM.
 * Wires up the password gate and, once authed, the user management actions.
 */
export function bindAdminView(rerender) {
  const gate = document.getElementById("admin-gate-form");
  if (gate) {
    gate.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pw = gate.querySelector('[name="password"]').value;
      const errorEl = document.getElementById("admin-gate-error");
      try {
        await api.adminLogin(pw);
        adminPassword = pw;
        rerender();
      } catch {
        errorEl.textContent = t("adminPasswordError");
        errorEl.style.display = "";
      }
    });
    return;
  }

  // Already authed — load users and wire management actions
  loadAndBindUsers(rerender);
}

async function loadAndBindUsers(rerender) {
  try {
    const users = await api.adminGetUsers(adminPassword);
    const listEl = document.getElementById("admin-user-list");
    if (!listEl) return;

    // Re-render just the user list rows
    listEl.innerHTML = users.length
      ? users
          .map(
            (u) => `
          <div class="admin-user-row" data-user-id="${esc(u.id)}">
            <div class="admin-user-info">
              <span class="admin-username">${esc(u.username)}</span>
              <span class="admin-user-date">${new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="admin-user-actions">
              ${u.hasPush ? `<button class="btn btn-sm btn-ghost" data-action="admin-push-test" data-id="${esc(u.id)}">🔔 ${t("adminPushTest")}</button>` : ""}
              <button class="btn btn-sm btn-ghost" data-action="admin-change-pw" data-id="${esc(u.id)}">
                ${t("adminChangePassword")}
              </button>
              <button class="btn btn-sm btn-ghost danger" data-action="admin-delete-user" data-id="${esc(u.id)}" data-username="${esc(u.username)}">
                ${t("adminDeleteUser")}
              </button>
            </div>
          </div>
          <div class="admin-change-pw-form" id="pw-form-${esc(u.id)}" style="display:none">
            <form class="admin-inline-form" data-action="admin-save-pw" data-id="${esc(u.id)}">
              <input class="form-input" type="password" name="password"
                placeholder="${t("adminNewPassword")}" required style="flex:1">
              <button type="submit" class="btn btn-sm btn-primary">${t("adminSaveBtn")}</button>
              <button type="button" class="btn btn-sm btn-ghost" data-action="admin-cancel-pw" data-id="${esc(u.id)}">${t("btnCancel")}</button>
            </form>
          </div>`,
          )
          .join("")
      : `<p style="color:var(--text-secondary);padding:16px 0">${t("adminNoUsers")}</p>`;

    bindUserActions(rerender);
  } catch {
    // If admin password was rejected (e.g. changed on server), reset
    adminPassword = null;
    rerender();
  }

  // Create user form — use the same AbortController as bindUserActions so
  // this listener is also cleaned up on the next loadAndBindUsers() call.
  document.getElementById("admin-create-form")?.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();
      const form = e.target;
      const username = form.querySelector('[name="username"]').value.trim();
      const password = form.querySelector('[name="password"]').value;
      const errorEl = document.getElementById("admin-create-error");
      try {
        await api.adminCreateUser(adminPassword, { username, password });
        form.reset();
        errorEl.style.display = "none";
        loadAndBindUsers(rerender);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = "";
      }
    },
    { signal: bindUserActions._signal },
  );
}

function bindUserActions(rerender) {
  // Use an AbortController so every call cleanly removes previous listeners
  // before attaching new ones — prevents duplicate handlers on re-renders.
  // The signal is also shared with the create form listener in loadAndBindUsers.
  if (bindUserActions._abort) bindUserActions._abort.abort();
  const controller = new AbortController();
  bindUserActions._abort = controller;
  bindUserActions._signal = controller.signal;
  const signal = controller.signal;

  document.getElementById("admin-user-list")?.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const { action, id, username } = btn.dataset;

      if (action === "admin-push-test") {
        btn.disabled = true;
        btn.textContent = "…";
        try {
          const { sent } = await api.adminPushTest(adminPassword, id);
          btn.textContent = sent > 0 ? t("adminPushTestSent") : t("adminPushTestNone");
        } catch {
          btn.textContent = "✗";
        }
        setTimeout(() => loadAndBindUsers(rerender), 1500);
        return;
      }

      if (action === "admin-delete-user") {
        if (!confirm(t("adminConfirmDelete", { username }))) return;
        await api.adminDeleteUser(adminPassword, id);
        loadAndBindUsers(rerender);
      }

      if (action === "admin-change-pw") {
        const form = document.getElementById(`pw-form-${id}`);
        if (form)
          form.style.display = form.style.display === "none" ? "" : "none";
      }

      if (action === "admin-cancel-pw") {
        const form = document.getElementById(`pw-form-${id}`);
        if (form) form.style.display = "none";
      }
    },
    { signal },
  );

  // The password change forms are siblings of the user rows, not children of
  // #admin-user-list, so listen on the parent section instead.
  document.querySelector(".admin-section")?.addEventListener(
    "submit",
    async (e) => {
      const form = e.target.closest('[data-action="admin-save-pw"]');
      if (!form) return;
      e.preventDefault();
      const { id } = form.dataset;
      const password = form.querySelector('[name="password"]').value;
      await api.adminChangePassword(adminPassword, id, password);
      const wrap = document.getElementById(`pw-form-${id}`);
      if (wrap) wrap.style.display = "none";
      form.reset();
    },
    { signal },
  );
}
