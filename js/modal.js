/** Show the modal with the given HTML content and auto-focus the first input */
export function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('modal-content').querySelector('input,textarea,select')?.focus();
  }, 50);
}

/** Close and clear the modal */
export function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}
