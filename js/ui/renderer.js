// DEADZONE — Main Renderer

import { parseResponse, parseStateUpdate } from './responseParser.js';
import { typewriter } from './typewriter.js';
import { renderUIBox } from './uiBoxes.js';
import { eventBus } from '../core/eventBus.js';

class Renderer {
  constructor() {
    this.outputEl = null;
    this.streamTarget = null;
    this.isStreaming = false;
    this.loadingOverlay = null;
  }

  init() {
    this.outputEl = document.getElementById('game-output');
  }

  // Show user message in output
  showUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'user-message';
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  // Show system message (non-AI)
  showSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'system-message';
    div.textContent = text;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  // Show error
  showError(text, retryCallback) {
    const div = document.createElement('div');
    div.className = 'error-block fade-in';

    const msg = document.createElement('div');
    msg.textContent = text;
    div.appendChild(msg);

    if (retryCallback) {
      const btn = document.createElement('button');
      btn.className = 'terminal-btn small retry-btn';
      btn.textContent = 'Wiederholen';
      btn.addEventListener('click', retryCallback);
      div.appendChild(btn);
    }

    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  // Show loading overlay with blur
  showLoading() {
    if (this.loadingOverlay) return;
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'stream-loading-overlay';
    this.loadingOverlay.innerHTML = `
      <div class="stream-loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-text">Generating...</div>
      </div>
    `;
    this.outputEl.appendChild(this.loadingOverlay);
    this.scrollToBottom();
  }

  // Remove loading overlay
  hideLoading() {
    if (this.loadingOverlay && this.loadingOverlay.parentNode) {
      this.loadingOverlay.remove();
    }
    this.loadingOverlay = null;
  }

  // Start streaming — buffer silently, show loading overlay
  startStreaming() {
    this.isStreaming = true;
    // Disable all previous choice options
    this.outputEl.querySelectorAll('.choice-option:not(.disabled)').forEach(opt => {
      opt.classList.add('disabled');
    });
    this.showLoading();
    // Return a compat object for legacy callers
    return { element: document.createElement('div'), append() {}, finish() {} };
  }

  // Append streaming token — no-op visually (buffered in apiClient)
  appendStreamToken(token) {
    // Tokens are buffered by the API client, nothing to display
  }

  // Finish streaming — remove loading, parse and render properly
  finishStreaming(fullResponse) {
    this.isStreaming = false;
    this.hideLoading();

    // Mark where new content starts
    const marker = document.createElement('div');
    marker.className = 'response-start-marker';
    this.outputEl.appendChild(marker);

    // Parse and render the complete response
    const { segments, stateUpdates } = parseResponse(fullResponse);
    this.renderSegments(segments);

    // Process state updates
    for (const update of stateUpdates) {
      const parsed = parseStateUpdate(update);
      eventBus.emit('state:update', parsed);
    }

    // Scroll to the top of the new response, not the bottom
    requestAnimationFrame(() => {
      marker.scrollIntoView({ behavior: 'smooth', block: 'start' });
      marker.remove();
    });
  }

  // Convert basic markdown to safe HTML
  markdownToHtml(text) {
    // Escape HTML first to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Then apply markdown formatting
    return escaped
      .replace(/(\d+h)(\d)/g, '$1 $2')  // "2h30min" → "2h 30min"
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^\*\*\s*$/gm, '')        // Remove orphan ** on their own line
      .replace(/\n/g, '<br>')
      .replace(/(<br>\s*){3,}/g, '<br><br>');  // Collapse excessive breaks
  }

  // Render parsed segments
  renderSegments(segments) {
    for (const segment of segments) {
      if (segment.type === 'narrative') {
        const div = document.createElement('div');
        div.className = 'narrative-block fade-in';
        div.innerHTML = this.markdownToHtml(segment.content);
        this.outputEl.appendChild(div);
      } else if (segment.type === 'ui') {
        const box = renderUIBox(segment);
        this.outputEl.appendChild(box);
      }
    }
  }

  // Show auto-save banner
  showAutoSave() {
    const div = document.createElement('div');
    div.className = 'rotation-banner fade-in';
    div.innerHTML = `Session wird zusammengefasst und gespeichert...<br>Neuer Kontext wird geladen. Dein Fortschritt ist sicher.`;
    this.outputEl.appendChild(div);
    this.scrollToBottom();
  }

  // Clear output
  clear() {
    if (this.outputEl) {
      this.outputEl.innerHTML = '';
    }
  }

  scrollToBottom() {
    const container = document.getElementById('game-output');
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }
}

export const renderer = new Renderer();
