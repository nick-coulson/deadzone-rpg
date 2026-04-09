// DEADZONE — Overlay Management

export function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

export function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

export function showLoading(text = 'Lade...') {
  document.getElementById('loading-text').textContent = text;
  showOverlay('overlay-loading');
}

export function hideLoading() {
  hideOverlay('overlay-loading');
}
