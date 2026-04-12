/** Escape a value for safe insertion into HTML */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Generate a short unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Drop-in async replacement for window.confirm().
 * Renders a small modal so browser "block dialogs" setting can't suppress it.
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <p class="confirm-msg">${esc(message)}</p>
        <div class="confirm-actions">
          <button class="btn btn-sm btn-ghost" data-r="false">Cancel</button>
          <button class="btn btn-sm btn-destructive" data-r="true">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-r]');
      if (!btn) return;
      e.stopPropagation();
      document.body.removeChild(overlay);
      resolve(btn.dataset.r === 'true');
    });
  });
}

/** Return a translation key for the time-appropriate greeting */
export function greetingKey() {
  const h = new Date().getHours();
  if (h < 5)  return 'greetNight';
  if (h < 12) return 'greetMorning';
  if (h < 17) return 'greetAfternoon';
  if (h < 22) return 'greetEvening';
  return 'greetNight';
}
