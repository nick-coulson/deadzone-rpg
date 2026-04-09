// DEADZONE — Typewriter Effect

export class Typewriter {
  constructor() {
    this.enabled = true;
    this.speed = 20; // ms per character
    this.currentAnimation = null;
    this.skipRequested = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setSpeed(ms) {
    this.speed = ms;
  }

  skip() {
    this.skipRequested = true;
  }

  async typeText(element, text) {
    if (!this.enabled) {
      element.textContent = text;
      return;
    }

    this.skipRequested = false;
    element.textContent = '';

    // Add cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '█';
    element.appendChild(cursor);

    const textNode = document.createTextNode('');
    element.insertBefore(textNode, cursor);

    for (let i = 0; i < text.length; i++) {
      if (this.skipRequested) {
        textNode.textContent = text;
        break;
      }

      textNode.textContent = text.slice(0, i + 1);

      // Auto-scroll
      const container = document.getElementById('screen-game');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }

      await this.delay(this.speed);
    }

    // Remove cursor
    if (cursor.parentNode) {
      cursor.remove();
    }
  }

  // For streaming: append character by character as they arrive
  createStreamTarget(parent) {
    const el = document.createElement('div');
    el.className = 'narrative-block';
    parent.appendChild(el);

    const textNode = document.createTextNode('');
    el.appendChild(textNode);

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '█';
    el.appendChild(cursor);

    return {
      element: el,
      textNode,
      cursor,
      append(char) {
        textNode.textContent += char;
      },
      finish() {
        if (cursor.parentNode) cursor.remove();
      },
      getText() {
        return textNode.textContent;
      }
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const typewriter = new Typewriter();
