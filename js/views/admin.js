import { esc, confirmDialog } from '../helpers.js';
import { t } from '../i18n.js';
import { api } from '../api.js';

/** Admin password lives only in memory — page refresh clears it automatically */
let adminPassword = null;

export function isAdminAuthed() {
  return !!adminPassword;
}

/** Render the admin view — either password gate or tenant manager shell */
export function renderAdminView() {
  if (!adminPassword) return renderAdminGate();
  return `
    <div class="page-header">
      <h2>${t('adminHeading')}</h2>
      <a href="#/" class="btn btn-ghost btn-sm">${t('backBtn')}</a>
    </div>
    <div id="admin-body"></div>`;
}

function renderAdminGate() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo" style="font-size:16px;margin-bottom:4px">FamilyHub</div>
        <h3 style="text-align:center;margin-bottom:24px;font-size:20px">${t('adminHeading')}</h3>
        <form class="form" id="admin-gate-form">
          <div class="form-group">
            <label class="form-label" for="admin-gate-pw">${t('adminPasswordLabel')}</label>
            <input class="form-input" id="admin-gate-pw" name="password"
              type="password" required autofocus>
          </div>
          <p class="login-error" id="admin-gate-error" style="display:none"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px">
            ${t('adminLoginBtn')}
          </button>
        </form>
        <div class="login-admin-link">
          <a href="#/">${t('backBtn')}</a>
        </div>
      </div>
    </div>`;
}

/* ── Rendering helpers ────────────────────────────────────────────────────── */

function renderTenantCard(tenant) {
  const userRows = tenant.users.map((u) => `
    <div class="admin-user-row" data-user-id="${esc(u.id)}">
      <div class="admin-user-info">
        <span class="admin-username">${esc(u.username)}</span>
        <span class="admin-user-date">${new Date(u.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="admin-user-actions">
        ${u.hasPush ? `<button class="btn btn-sm btn-ghost" data-action="admin-push-test" data-id="${esc(u.id)}">🔔 ${t('adminPushTest')}</button>` : ''}
        <button class="btn btn-sm btn-ghost" data-action="admin-change-pw" data-id="${esc(u.id)}">
          ${t('adminChangePassword')}
        </button>
        <button class="btn btn-sm btn-ghost danger" data-action="admin-delete-user"
          data-id="${esc(u.id)}" data-username="${esc(u.username)}">
          ${t('adminDeleteUser')}
        </button>
      </div>
    </div>
    <div class="admin-change-pw-form" id="pw-form-${esc(u.id)}" style="display:none">
      <form class="admin-inline-form" data-action="admin-save-pw" data-id="${esc(u.id)}">
        <input class="form-input" type="password" name="password"
          placeholder="${t('adminNewPassword')}" required style="flex:1">
        <button type="submit" class="btn btn-sm btn-primary">${t('adminSaveBtn')}</button>
        <button type="button" class="btn btn-sm btn-ghost" data-action="admin-cancel-pw"
          data-id="${esc(u.id)}">${t('btnCancel')}</button>
      </form>
    </div>`).join('');

  return `
    <div class="admin-tenant-card" data-tenant-id="${esc(tenant.id)}">
      <div class="admin-tenant-header">
        <span class="admin-tenant-name">${esc(tenant.name)}</span>
        <div class="admin-tenant-header-actions">
          <button class="btn btn-sm btn-ghost" data-action="admin-rename-tenant"
            data-id="${esc(tenant.id)}" data-name="${esc(tenant.name)}">${t('adminRenameTenant')}</button>
          <button class="btn btn-sm btn-ghost danger" data-action="admin-delete-tenant"
            data-id="${esc(tenant.id)}" data-name="${esc(tenant.name)}">${t('adminDeleteUser')}</button>
        </div>
      </div>
      <div class="admin-rename-form" id="rename-form-${esc(tenant.id)}" style="display:none">
        <form class="admin-inline-form" data-action="admin-rename-tenant-submit" data-id="${esc(tenant.id)}">
          <input class="form-input" name="name" type="text"
            value="${esc(tenant.name)}" required style="flex:1">
          <button type="submit" class="btn btn-sm btn-primary">${t('adminSaveBtn')}</button>
          <button type="button" class="btn btn-sm btn-ghost" data-action="admin-cancel-rename"
            data-id="${esc(tenant.id)}">${t('btnCancel')}</button>
        </form>
      </div>
      <div class="admin-user-list-inner">
        ${userRows || `<p style="color:var(--text-secondary);padding:8px 0;font-size:14px">${t('adminNoUsers')}</p>`}
      </div>
      <div class="admin-add-user-section">
        <form class="admin-inline-form" data-action="admin-create-user" data-tenant-id="${esc(tenant.id)}">
          <input class="form-input" name="username" type="text"
            placeholder="${t('adminUsernameLabel')}" required style="flex:1">
          <input class="form-input" name="password" type="password"
            placeholder="${t('loginPassword')}" required style="flex:1">
          <button type="submit" class="btn btn-primary btn-sm">${t('adminCreateBtn')}</button>
        </form>
        <p class="login-error" data-create-error="${esc(tenant.id)}" style="display:none"></p>
      </div>
    </div>`;
}

function renderAdminBody(tenants) {
  const tenantCards = tenants.length
    ? tenants.map(renderTenantCard).join('')
    : `<p style="color:var(--text-secondary);padding:16px 0">${t('adminNoTenants')}</p>`;

  return `
    <div class="admin-section">
      <h3 class="admin-section-title">${t('adminTenants')}</h3>
      <div id="admin-tenant-list">${tenantCards}</div>
    </div>
    <div class="admin-section">
      <h3 class="admin-section-title">${t('adminAddTenant')}</h3>
      <form class="admin-inline-form" id="admin-create-tenant-form">
        <input class="form-input" name="name" type="text"
          placeholder="${t('adminTenantName')}" required style="flex:1">
        <button type="submit" class="btn btn-primary btn-sm">${t('adminCreateTenantBtn')}</button>
      </form>
      <p class="login-error" id="admin-create-tenant-error" style="display:none"></p>
    </div>`;
}

/* ── Binding ──────────────────────────────────────────────────────────────── */

/**
 * Called once after renderAdminView() is injected into the DOM.
 * On each reload, #admin-body is fully replaced — so listeners never stack up.
 */
export function bindAdminView(rerender) {
  const gate = document.getElementById('admin-gate-form');
  if (gate) {
    gate.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = gate.querySelector('[name="password"]').value;
      const errorEl = document.getElementById('admin-gate-error');
      try {
        await api.adminLogin(pw);
        adminPassword = pw;
        rerender();
      } catch {
        errorEl.textContent = t('adminPasswordError');
        errorEl.style.display = '';
      }
    });
    return;
  }

  loadAndRender(rerender);
}

async function loadAndRender(rerender) {
  const body = document.getElementById('admin-body');
  if (!body) return;

  try {
    const tenants = await api.adminGetTenants(adminPassword);
    // Replace the element itself so all previous event listeners are discarded
    const fresh = document.createElement('div');
    fresh.id = 'admin-body';
    fresh.innerHTML = renderAdminBody(tenants);
    body.replaceWith(fresh);
    bindActions(fresh, rerender);
  } catch {
    adminPassword = null;
    rerender();
  }
}

function bindActions(body, rerender) {
  const reload = () => loadAndRender(rerender);

  // ── Click delegation ──────────────────────────────────────────────────────
  body.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id, username, name } = btn.dataset;

    if (action === 'admin-delete-tenant') {
      if (!await confirmDialog(t('adminConfirmDeleteTenant', { name }))) return;
      await api.adminDeleteTenant(adminPassword, id);
      reload();
    }

    if (action === 'admin-rename-tenant') {
      const form = document.getElementById(`rename-form-${id}`);
      if (form) form.style.display = form.style.display === 'none' ? '' : 'none';
    }

    if (action === 'admin-cancel-rename') {
      const form = document.getElementById(`rename-form-${id}`);
      if (form) form.style.display = 'none';
    }

    if (action === 'admin-delete-user') {
      if (!await confirmDialog(t('adminConfirmDelete', { username }))) return;
      await api.adminDeleteUser(adminPassword, id);
      reload();
    }

    if (action === 'admin-change-pw') {
      const form = document.getElementById(`pw-form-${id}`);
      if (form) form.style.display = form.style.display === 'none' ? '' : 'none';
    }

    if (action === 'admin-cancel-pw') {
      const form = document.getElementById(`pw-form-${id}`);
      if (form) form.style.display = 'none';
    }

    if (action === 'admin-push-test') {
      btn.disabled = true;
      btn.textContent = '…';
      try {
        const { sent } = await api.adminPushTest(adminPassword, id);
        btn.textContent = sent > 0 ? t('adminPushTestSent') : t('adminPushTestNone');
      } catch {
        btn.textContent = '✗';
      }
      setTimeout(reload, 1500);
    }
  });

  // ── Submit delegation ─────────────────────────────────────────────────────
  body.addEventListener('submit', async (e) => {
    // Create tenant
    const createTenantForm = e.target.closest('#admin-create-tenant-form');
    if (createTenantForm) {
      e.preventDefault();
      const name = createTenantForm.querySelector('[name="name"]').value.trim();
      const errorEl = document.getElementById('admin-create-tenant-error');
      try {
        await api.adminCreateTenant(adminPassword, { name });
        reload();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = '';
      }
      return;
    }

    // Rename tenant
    const renameForm = e.target.closest('[data-action="admin-rename-tenant-submit"]');
    if (renameForm) {
      e.preventDefault();
      const { id } = renameForm.dataset;
      const name = renameForm.querySelector('[name="name"]').value.trim();
      if (name) await api.adminRenameTenant(adminPassword, id, name);
      reload();
      return;
    }

    // Change password
    const savePwForm = e.target.closest('[data-action="admin-save-pw"]');
    if (savePwForm) {
      e.preventDefault();
      const { id } = savePwForm.dataset;
      const password = savePwForm.querySelector('[name="password"]').value;
      await api.adminChangePassword(adminPassword, id, password);
      reload();
      return;
    }

    // Create user in tenant
    const createUserForm = e.target.closest('[data-action="admin-create-user"]');
    if (createUserForm) {
      e.preventDefault();
      const tenantId = createUserForm.dataset.tenantId;
      const username = createUserForm.querySelector('[name="username"]').value.trim();
      const password = createUserForm.querySelector('[name="password"]').value;
      const errorEl = body.querySelector(`[data-create-error="${tenantId}"]`);
      try {
        await api.adminCreateUser(adminPassword, { username, password, tenantId });
        reload();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.style.display = '';
        }
      }
    }
  });
}
