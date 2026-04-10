// DEADZONE — Main Renderer

import { parseResponse, parseStateUpdate } from './responseParser.js';
import { typewriter } from './typewriter.js';
import { renderUIBox } from './uiBoxes.js';
import { eventBus } from '../core/eventBus.js';
import { StreamRenderer } from './streamRenderer.js';

class Renderer {
  constructor() {
    this.outputEl = null;
    this.streamTarget = null;
    this.streamRenderer = null;
    this.isStreaming = false;
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

  // Start streaming — create progressive stream renderer
  startStreaming() {
    this.isStreaming = true;
    // Insert a hidden marker so we know where stream content starts
    this.streamMarker = document.createElement('div');
    this.streamMarker.className = 'stream-marker';
    this.streamMarker.style.display = 'none';
    this.outputEl.appendChild(this.streamMarker);
    this.streamRenderer = new StreamRenderer(this.outputEl, this.markdownToHtml.bind(this));
    this.scrollToBottom();
    // Return a compat object for legacy callers
    return { element: document.createElement('div'), append() {}, finish() {} };
  }

  // Append streaming token
  appendStreamToken(token) {
    if (this.streamRenderer) {
      this.streamRenderer.appendToken(token);
    }
  }

  // Finish streaming — replace stream content with final parsed output
  finishStreaming(fullResponse) {
    this.isStreaming = false;

    if (this.streamRenderer) {
      this.streamRenderer.finish();
    }
    this.streamRenderer = null;

    // Remove all elements after the stream marker (stream-rendered content)
    if (this.streamMarker && this.streamMarker.parentNode) {
      while (this.streamMarker.nextSibling) {
        this.streamMarker.nextSibling.remove();
      }
      this.streamMarker.remove();
    }
    this.streamMarker = null;

    // Parse the COMPLETE response for final clean render
    const { segments, stateUpdates } = parseResponse(fullResponse);

    // Render the final clean segments
    this.renderSegments(segments);

    // Process state updates
    for (const update of stateUpdates) {
      const parsed = parseStateUpdate(update);
      eventBus.emit('state:update', parsed);
    }

    this.scrollToBottom();
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
