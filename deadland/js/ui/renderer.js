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

  // Start streaming — create target for incoming tokens
  startStreaming() {
    this.isStreaming = true;
    this.streamTarget = typewriter.createStreamTarget(this.outputEl);
    this.scrollToBottom();
    return this.streamTarget;
  }

  // Append streaming token
  appendStreamToken(token) {
    if (this.streamTarget) {
      this.streamTarget.append(token);
      this.scrollToBottom();
    }
  }

  // Finish streaming — parse and re-render properly
  finishStreaming(fullResponse) {
    this.isStreaming = false;

    if (this.streamTarget) {
      this.streamTarget.finish();

      // Remove the raw stream element
      if (this.streamTarget.element.parentNode) {
        this.streamTarget.element.remove();
      }
    }
    this.streamTarget = null;

    // Parse and render the complete response
    const { segments, stateUpdates } = parseResponse(fullResponse);
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
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
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
