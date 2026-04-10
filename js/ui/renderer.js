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
    this.streamBuffer = '';  // Full raw response during streaming
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
    this.streamBuffer = '';
    this.streamTarget = typewriter.createStreamTarget(this.outputEl);
    this.scrollToBottom();
    return this.streamTarget;
  }

  // Append streaming token — filter out <ui:...> and <state_update> tags
  appendStreamToken(token) {
    if (!this.streamTarget) return;

    this.streamBuffer += token;

    // Build the visible text: strip all <ui:...>...</ui:...> and <state_update>...</state_update>
    // Also strip incomplete tags at the end (still being streamed)
    const visible = this._getVisibleStreamText(this.streamBuffer);
    this.streamTarget.setText(visible);
    this.scrollToBottom();
  }

  // Extract only the narrative text that should be shown during streaming
  _getVisibleStreamText(raw) {
    let text = raw;

    // Remove complete <state_update>...</state_update> blocks
    text = text.replace(/<state_update>[\s\S]*?<\/state_update>/g, '');

    // Remove complete <ui:xyz ...>...</ui:xyz> blocks
    text = text.replace(/<ui:(\w+)(?:\s+[^>]*?)?>[\s\S]*?<\/ui:\1>/g, '');

    // Hide incomplete <state_update> at the end (started but not closed)
    const stateStart = text.indexOf('<state_update>');
    if (stateStart !== -1) {
      text = text.slice(0, stateStart);
    }

    // Hide incomplete <ui: tag at the end (started but not closed)
    // Find the last <ui: that doesn't have a matching </ui:
    const lastUiOpen = text.lastIndexOf('<ui:');
    if (lastUiOpen !== -1) {
      // Check if there's a closing tag after it
      const afterOpen = text.slice(lastUiOpen);
      const nameMatch = afterOpen.match(/^<ui:(\w+)/);
      if (nameMatch) {
        const closingTag = `</ui:${nameMatch[1]}>`;
        if (!afterOpen.includes(closingTag)) {
          text = text.slice(0, lastUiOpen);
        }
      } else {
        // Tag name not even complete yet
        text = text.slice(0, lastUiOpen);
      }
    }

    return text.trim();
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
    this.streamBuffer = '';

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
