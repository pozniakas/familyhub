import { getToken, clearAuth } from './auth.js';

const BASE = '/api';

async function req(method, path, body) {
  const token = getToken();
  const headers = {};
  if (body != null)  headers['Content-Type']  = 'application/json';
  if (token)         headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearAuth();
    // Trigger re-render so the login screen appears
    window.dispatchEvent(new CustomEvent('familyhub:unauthorized'));
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

async function adminReq(method, path, body, adminPassword) {
  const headers = { 'X-Admin-Password': adminPassword };
  if (body != null) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  /** Load the full data snapshot on app start */
  loadAll: () => req('GET', '/data'),

  // ── Auth ───────────────────────────────────────────────────────────────────
  login: (username, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || String(r.status));
      return data;
    }),

  adminLogin: (password) =>
    fetch(`${BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || String(r.status));
      return data;
    }),

  // ── Admin — user management ────────────────────────────────────────────────
  adminGetUsers:       (pw)         => adminReq('GET',    '/admin/users',               null,       pw),
  adminCreateUser:     (pw, data)   => adminReq('POST',   '/admin/users',               data,       pw),
  adminDeleteUser:     (pw, id)     => adminReq('DELETE', `/admin/users/${id}`,          null,       pw),
  adminChangePassword: (pw, id, np) => adminReq('PUT',    `/admin/users/${id}/password`, { password: np }, pw),

  // ── Entities ───────────────────────────────────────────────────────────────
  createEntity:   (data)            => req('POST',   '/entities',                       data),
  updateEntity:   (id, data)        => req('PUT',    `/entities/${id}`,                 data),
  deleteEntity:   (id)              => req('DELETE', `/entities/${id}`),

  // ── Sections ───────────────────────────────────────────────────────────────
  createSection:   (eid, data)      => req('POST',   `/entities/${eid}/sections`,          data),
  updateSection:   (eid, sid, data) => req('PUT',    `/entities/${eid}/sections/${sid}`,   data),
  deleteSection:   (eid, sid)       => req('DELETE', `/entities/${eid}/sections/${sid}`),
  reorderSections: (eid, ids)       => req('PUT',    `/entities/${eid}/sections/reorder`,  { ids }),

  // ── Items ──────────────────────────────────────────────────────────────────
  createItem:  (data)               => req('POST',   '/items',         data),
  updateItem:  (id, data)           => req('PUT',    `/items/${id}`,   data),
  deleteItem:  (id)                 => req('DELETE', `/items/${id}`),
  reorderItems:(eid, sid, ids)      => req('PUT',    '/items/reorder', { entityId: eid, sectionId: sid, ids }),

  // ── Tasks ──────────────────────────────────────────────────────────────────
  createTask: (data)                => req('POST',   '/tasks',         data),
  updateTask: (id, data)            => req('PUT',    `/tasks/${id}`,   data),
  deleteTask: (id)                  => req('DELETE', `/tasks/${id}`),

  // ── Push notifications ────────────────────────────────────────────────────
  getVapidKey:        ()            => req('GET',    '/push/vapid-public-key'),
  pushSubscribe:      (sub)         => req('POST',   '/push/subscribe',   sub),
  pushUnsubscribe:    (endpoint)    => req('DELETE', '/push/subscribe',   { endpoint }),

  // ── Admin — push ──────────────────────────────────────────────────────────
  adminPushTest: (pw, id)           => adminReq('POST', `/admin/push-test/${id}`, null, pw),
};
