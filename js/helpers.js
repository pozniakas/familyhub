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

/** Return a translation key for the time-appropriate greeting */
export function greetingKey() {
  const h = new Date().getHours();
  if (h < 5)  return 'greetNight';
  if (h < 12) return 'greetMorning';
  if (h < 17) return 'greetAfternoon';
  if (h < 22) return 'greetEvening';
  return 'greetNight';
}
