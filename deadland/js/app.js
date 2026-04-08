// DEADZONE — App Entry Point

import { loadGenesisPrompt } from './prompt/genesisPrompt.js';
import { gameEngine } from './core/gameEngine.js';
import './core/stateUpdater.js'; // Initialize state updater (side effect)

async function boot() {
  try {
    // Load GENESIS system prompt
    await loadGenesisPrompt();
    console.log('GENESIS System Prompt loaded.');

    // Initialize game engine
    await gameEngine.init();
    console.log('DEADZONE initialized.');

  } catch (err) {
    console.error('DEADZONE boot failed:', err);
    document.body.innerHTML = `
      <div style="padding:40px; color:#ff3333; font-family:monospace; background:#0a0a0a; min-height:100vh;">
        <h1 style="color:#00ff41;">DEADZONE — Fehler</h1>
        <p>${err.message}</p>
        <pre style="color:#888; font-size:12px; margin-top:10px; white-space:pre-wrap;">${err.stack || ''}</pre>
        <p>Versuche einen Hard-Reload: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)</p>
        <button onclick="location.reload(true)" style="margin-top:20px; padding:8px 20px; background:#111; color:#c8c8c8; border:1px solid #333; font-family:monospace; cursor:pointer;">Neu laden</button>
      </div>
    `;
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
