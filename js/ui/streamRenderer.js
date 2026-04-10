// DEADZONE — Stream Renderer (progressive real-time parsing during streaming)
// Renders completed segments immediately, buffers incomplete tags

import { renderUIBox } from './uiBoxes.js';

export class StreamRenderer {
  constructor(outputEl, markdownToHtml) {
    this.outputEl = outputEl;
    this.markdownToHtml = markdownToHtml;
    this.buffer = '';             // Full accumulated response
    this.renderedUpTo = 0;       // How far we've rendered
    this.currentNarrative = null; // Active narrative div being appended to
    this.cursor = null;           // Blinking cursor element
  }

  /** Called on every streaming token */
  appendToken(token) {
    this.buffer += token;
    this._processBuffer();
  }

  /** Process buffer and render completed segments */
  _processBuffer() {
    const text = this.buffer;

    // Find how much we can safely render
    // We need to stop before any incomplete <ui: or <state_update> tag
    let safeEnd = text.length;

    // Check for incomplete <state_update> — hide entirely during streaming
    const stateStart = text.indexOf('<state_update>', this.renderedUpTo);
    if (stateStart !== -1) {
      const stateEnd = text.indexOf('</state_update>', stateStart);
      if (stateEnd === -1) {
        // Incomplete state_update — don't render past its start
        safeEnd = stateStart;
      } else {
        // Complete state_update — skip it entirely (rendered at finishStreaming)
        // Render up to it, then skip past it
        safeEnd = stateStart;
      }
    }

    // Check for incomplete <ui: tags
    const uiTagStart = this._findIncompleteUITag(text, this.renderedUpTo, safeEnd);
    if (uiTagStart !== -1) {
      safeEnd = uiTagStart;
    }

    // Now process from renderedUpTo to safeEnd
    const chunk = text.slice(this.renderedUpTo, safeEnd);
    if (!chunk.trim()) return;

    // Parse complete UI tags in this chunk
    const uiRegex = /<ui:(\w+)(?:\s+([^>]*?))?>([\s\S]*?)<\/ui:\1>/g;
    let lastIdx = 0;
    let match;

    while ((match = uiRegex.exec(chunk)) !== null) {
      // Narrative before this tag
      const before = chunk.slice(lastIdx, match.index).trim();
      if (before) {
        this._appendNarrative(before);
      }

      // Close current narrative block
      this._closeNarrative();

      // Render the UI box
      const segment = {
        type: 'ui',
        component: match[1],
        attributes: this._parseAttrs(match[2] || ''),
        content: match[3].trim()
      };
      const box = renderUIBox(segment);
      this.outputEl.appendChild(box);

      lastIdx = match.index + match[0].length;
    }

    // Remaining narrative after last tag
    const remaining = chunk.slice(lastIdx).trim();
    if (remaining) {
      this._appendNarrative(remaining);
    }

    this.renderedUpTo = safeEnd;
    this._scrollToBottom();
  }

  /** Find start index of an incomplete <ui:...> tag */
  _findIncompleteUITag(text, from, to) {
    const searchArea = text.slice(from, to);
    // Look for <ui: that doesn't have a matching closing tag
    let idx = 0;
    while (true) {
      const openPos = searchArea.indexOf('<ui:', idx);
      if (openPos === -1) return -1;

      // Find closing > of the opening tag
      const tagClose = searchArea.indexOf('>', openPos);
      if (tagClose === -1) return from + openPos; // Tag not even fully opened

      // Extract component name
      const nameMatch = searchArea.slice(openPos).match(/^<ui:(\w+)/);
      if (!nameMatch) return from + openPos;

      const closingTag = `</ui:${nameMatch[1]}>`;
      const closePos = searchArea.indexOf(closingTag, tagClose);
      if (closePos === -1) return from + openPos; // No closing tag yet

      // This tag is complete, continue searching after it
      idx = closePos + closingTag.length;
    }
  }

  /** Append narrative text to current or new narrative block */
  _appendNarrative(text) {
    if (!this.currentNarrative) {
      this.currentNarrative = document.createElement('div');
      this.currentNarrative.className = 'narrative-block fade-in';
      this.outputEl.appendChild(this.currentNarrative);

      // Add cursor
      this.cursor = document.createElement('span');
      this.cursor.className = 'typewriter-cursor';
      this.cursor.textContent = '█';
      this.currentNarrative.appendChild(this.cursor);
    }

    // Re-render full narrative content (to handle markdown correctly)
    const fullText = (this.currentNarrative._rawText || '') + '\n' + text;
    this.currentNarrative._rawText = fullText;

    // Insert HTML before cursor
    const html = this.markdownToHtml(fullText.trim());
    if (this.cursor) {
      this.currentNarrative.innerHTML = html;
      this.currentNarrative.appendChild(this.cursor);
    } else {
      this.currentNarrative.innerHTML = html;
    }
  }

  /** Close current narrative block (remove cursor) */
  _closeNarrative() {
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.remove();
    }
    this.cursor = null;
    this.currentNarrative = null;
  }

  /** Clean up — remove cursor */
  finish() {
    this._closeNarrative();
  }

  /** Get the full buffer for final processing */
  getBuffer() {
    return this.buffer;
  }

  _parseAttrs(str) {
    const attrs = {};
    if (!str) return attrs;
    const r = /(\w+)="([^"]*?)"/g;
    let m;
    while ((m = r.exec(str)) !== null) attrs[m[1]] = m[2];
    return attrs;
  }

  _scrollToBottom() {
    const container = document.getElementById('game-output');
    if (container) {
      requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
    }
  }
}
