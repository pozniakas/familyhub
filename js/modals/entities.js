import { esc } from '../helpers.js';
import { t } from '../i18n.js';
import { getState } from '../state.js';
import { api } from '../api.js';
import { openModal, closeModal } from '../modal.js';

/* ===== EMOJI PICKER ===== */

const EMOJIS = [
  '🏠','🏡','🏢','🚗','🚙','🚕','💰','📈','📉','🌿','🔧','🛠️',
  '💡','🏥','🐾','✈️','🎓','💼','🛒','🍽️','📱','💻','🎮','🎵',
  '📚','🏋️','🌍','🏖️','🎨','🔑','🏦','⚡','🌊','📋','💊','🧰',
  '🧹','🛁','🛏️','🌱','🐶','🐱','👶','❤️','🎁','📦','🔐','📷',
];

function emojiPicker(selected) {
  return `
    <div class="emoji-picker-wrap">
      <div class="emoji-preview" id="emoji-preview">${selected || '📁'}</div>
      <input type="hidden" name="emoji" id="emoji-value" value="${esc(selected || '📁')}">
      <div class="emoji-grid">
        ${EMOJIS.map(e =>
          `<button type="button" class="emoji-opt ${e === (selected || '📁') ? 'selected' : ''}"
             data-emoji="${e}">${e}</button>`
        ).join('')}
      </div>
    </div>`;
}

function bindEmojiPicker() {
  const preview = document.getElementById('emoji-preview');
  const hidden  = document.getElementById('emoji-value');
  document.querySelectorAll('.emoji-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      preview.textContent = btn.dataset.emoji;
      hidden.value        = btn.dataset.emoji;
    });
  });
}

/* ===== ENTITY MODALS ===== */

export function showAddEntityModal(renderFn) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalNewEntity')}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="entity-form">
      <div class="form-group">
        <label class="form-label" for="entity-name">${t('fieldName')}</label>
        <input class="form-input" id="entity-name" name="name" type="text"
          placeholder="${t('placeholderEntity')}" required>
      </div>
      <div class="form-group">
        <label class="form-label">${t('fieldEmoji')}</label>
        ${emojiPicker('')}
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
        <button type="submit" class="btn btn-primary">${t('btnCreateEntity')}</button>
      </div>
    </form>`);

  bindEmojiPicker();

  document.getElementById('entity-form').addEventListener('submit', async e => {
    e.preventDefault();
    const d      = Object.fromEntries(new FormData(e.target));
    const entity = await api.createEntity({ name: d.name.trim(), emoji: d.emoji });
    getState().entities.push(entity);
    closeModal();
    renderFn();
  });
}

export function showEditEntityModal(entityId, renderFn) {
  const entity = getState().entities.find(e => e.id === entityId);
  if (!entity) return;

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalEditEntity')}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="entity-form">
      <div class="form-group">
        <label class="form-label" for="entity-name">${t('fieldName')}</label>
        <input class="form-input" id="entity-name" name="name" type="text"
          value="${esc(entity.name)}" required>
      </div>
      <div class="form-group">
        <label class="form-label">${t('fieldEmoji')}</label>
        ${emojiPicker(entity.emoji)}
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
        <button type="submit" class="btn btn-primary">${t('btnSaveChanges')}</button>
      </div>
    </form>`);

  bindEmojiPicker();

  document.getElementById('entity-form').addEventListener('submit', async e => {
    e.preventDefault();
    const d       = Object.fromEntries(new FormData(e.target));
    const updates = { name: d.name.trim(), emoji: d.emoji };
    Object.assign(entity, updates);
    closeModal();
    renderFn();
    await api.updateEntity(entityId, updates);
  });
}

/* ===== SECTION MODALS ===== */

export function showAddSectionModal(entityId, renderFn) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalAddSection')}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="section-form">
      <div class="form-group">
        <label class="form-label" for="section-name">${t('fieldSectionName')}</label>
        <input class="form-input" id="section-name" name="name" type="text"
          placeholder="${t('placeholderSection')}" required>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
        <button type="submit" class="btn btn-primary">${t('btnAddSection')}</button>
      </div>
    </form>`);

  document.getElementById('section-form').addEventListener('submit', async e => {
    e.preventDefault();
    const d       = Object.fromEntries(new FormData(e.target));
    const section = await api.createSection(entityId, { name: d.name.trim() });
    const entity  = getState().entities.find(en => en.id === entityId);
    if (entity) entity.sections.push(section);
    closeModal();
    renderFn();
  });
}

export function showEditSectionModal(entityId, sectionId, renderFn) {
  const entity  = getState().entities.find(e => e.id === entityId);
  const section = entity?.sections.find(s => s.id === sectionId);
  if (!section) return;

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${t('modalRenameSection')}</h3>
      <button class="modal-close" data-action="close-modal">×</button>
    </div>
    <form class="form" id="section-form">
      <div class="form-group">
        <label class="form-label" for="section-name">${t('fieldSectionName')}</label>
        <input class="form-input" id="section-name" name="name" type="text"
          value="${esc(section.name)}" required>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">${t('btnCancel')}</button>
        <button type="submit" class="btn btn-primary">${t('btnSave')}</button>
      </div>
    </form>`);

  document.getElementById('section-form').addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    section.name = d.name.trim();
    closeModal();
    renderFn();
    await api.updateSection(entityId, sectionId, { name: section.name });
  });
}
