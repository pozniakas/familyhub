const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body != null ? { 'Content-Type': 'application/json' } : {},
    body:    body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  /** Load the full data snapshot on app start */
  loadAll: () => req('GET', '/data'),

  // ── Entities ───────────────────────────────────────────────────────────────
  createEntity: (data)            => req('POST',   '/entities',                        data),
  updateEntity: (id, data)        => req('PUT',    `/entities/${id}`,                  data),
  deleteEntity: (id)              => req('DELETE', `/entities/${id}`),

  // ── Sections ───────────────────────────────────────────────────────────────
  createSection:  (eid, data)      => req('POST',   `/entities/${eid}/sections`,           data),
  updateSection:  (eid, sid, data) => req('PUT',    `/entities/${eid}/sections/${sid}`,    data),
  deleteSection:  (eid, sid)       => req('DELETE', `/entities/${eid}/sections/${sid}`),
  reorderSections:(eid, ids)       => req('PUT',    `/entities/${eid}/sections/reorder`,   { ids }),

  // ── Items ──────────────────────────────────────────────────────────────────
  createItem:  (data)              => req('POST',   '/items',        data),
  updateItem:  (id, data)          => req('PUT',    `/items/${id}`,  data),
  deleteItem:  (id)                => req('DELETE', `/items/${id}`),
  reorderItems:(eid, sid, ids)     => req('PUT',    '/items/reorder',{ entityId: eid, sectionId: sid, ids }),

  // ── Tasks ──────────────────────────────────────────────────────────────────
  createTask: (data)              => req('POST',   '/tasks',                           data),
  updateTask: (id, data)          => req('PUT',    `/tasks/${id}`,                     data),
  deleteTask: (id)                => req('DELETE', `/tasks/${id}`),
};
