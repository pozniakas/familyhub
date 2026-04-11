import { esc } from '../helpers.js';
import { t } from '../i18n.js';
import { getState } from '../state.js';
import { api } from '../api.js';
import { statusLabel, statusBadgeClass } from '../labels.js';
import { openModal, closeModal } from '../modal.js';

/** Radio button group for status selection */
export function statusRadios(selected) {
  return ['ok', 'soon', 'urgent'].map(s =>
    `<div class="status-option">
       <input type="radio" id="status-${s}" name="status" value="${s}" ${selected === s ? 'checked' : ''}>
       <label for="status-${s}" class="${s}-label">${statusLabel(s)}</label>
     </div>`
  ).join('');
}

/**
 * Open a read-only detail view for an item.
 * @param {string} itemId
 * @param {Function} renderFn  — passed through so the Edit button can open the edit modal
 */
export function showItemDetailModal(itemId, renderFn) {
  const { items, entities } = getState();
  const item    = items.find(i => i.id === itemId);
  if (!item) return;
  const entity  = entities.find(e => e.id === item.entityId);
  const section = entity?.sections.find(s => s.id === item.sectionId);

  const breadcrumb = [entity?.name, section?.name].filter(Boolean).join(' / ');
  const notesHtml  = item.notes
    ? `<div class="item-detail-notes">${esc(item.notes).replace(/\n/g, '<br>')}</div>`
    : '';

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalViewItem')}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <div class="item-detail">
      ${breadcrumb ? `<div class="item-detail-breadcrumb">${esc(breadcrumb)}</div>` : ''}
      <div class="item-detail-name">${esc(item.name)}</div>
      <span class="badge ${statusBadgeClass(item.status)}" style="align-self:flex-start">
        ${statusLabel(item.status)}
      </span>
      ${notesHtml}
    </div>
    <div class="form-actions" style="margin-top:8px">
      <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
      <button type="button" class="btn btn-primary" id="item-detail-edit">${t('btnEdit')}</button>
    </div>`);

  document.getElementById('item-detail-edit').addEventListener('click', () => {
    closeModal();
    showEditItemModal(itemId, renderFn);
  });
}

/**
 * Open the "add item" modal.
 * @param {string} entityId
 * @param {string} sectionId
 * @param {Function} renderFn
 */
export function showAddItemModal(entityId, sectionId, renderFn) {
  const entity  = getState().entities.find(e => e.id === entityId);
  const section = entity?.sections.find(s => s.id === sectionId);

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalAddItem', { section: section?.name ?? '' })}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="item-form">
      <input type="hidden" name="entityId"  value="${esc(entityId)}">
      <input type="hidden" name="sectionId" value="${esc(sectionId)}">
      <div class="form-group">
        <label class="form-label" for="item-name">${t('fieldName')}</label>
        <input class="form-input" id="item-name" name="name" type="text" placeholder="${t('placeholderItem')}" required>
      </div>
      <div class="form-group">
        <label class="form-label">${t('fieldStatus')}</label>
        <div class="status-options">${statusRadios('ok')}</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="item-notes">
          ${t('fieldNotes')} <span style="font-weight:400;text-transform:none;letter-spacing:0">${t('optional')}</span>
        </label>
        <textarea class="form-textarea" id="item-notes" name="notes" placeholder="${t('placeholderNotes')}"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
        <button type="submit" class="btn btn-primary">${t('btnAddItem')}</button>
      </div>
    </form>`);

  document.getElementById('item-form').addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const item = await api.createItem({
      entityId:  d.entityId,
      sectionId: d.sectionId,
      name:      d.name.trim(),
      status:    d.status,
      notes:     (d.notes ?? '').trim(),
    });
    getState().items.push(item);
    closeModal();
    renderFn();
  });
}

/**
 * Open the "edit item" modal.
 * @param {string} itemId
 * @param {Function} renderFn
 */
export function showEditItemModal(itemId, renderFn) {
  const item = getState().items.find(i => i.id === itemId);
  if (!item) return;

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalEditItem')}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="item-form">
      <div class="form-group">
        <label class="form-label" for="item-name">${t('fieldName')}</label>
        <input class="form-input" id="item-name" name="name" type="text" value="${esc(item.name)}" required>
      </div>
      <div class="form-group">
        <label class="form-label">${t('fieldStatus')}</label>
        <div class="status-options">${statusRadios(item.status)}</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="item-notes">
          ${t('fieldNotes')} <span style="font-weight:400;text-transform:none;letter-spacing:0">${t('optional')}</span>
        </label>
        <textarea class="form-textarea" id="item-notes" name="notes">${esc(item.notes)}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
        <button type="submit" class="btn btn-primary">${t('btnSaveChanges')}</button>
      </div>
    </form>`);

  document.getElementById('item-form').addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const updates = {
      name:   d.name.trim(),
      status: d.status,
      notes:  (d.notes ?? '').trim(),
    };
    Object.assign(item, updates);
    closeModal();
    renderFn();
    await api.updateItem(item.id, updates);
  });
}
