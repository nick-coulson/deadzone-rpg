// DEADZONE — Input Line (history, keyboard shortcuts)

export class InputLine {
  constructor(inputEl, onSubmit) {
    this.inputEl = inputEl;
    this.onSubmit = onSubmit;
    this.history = [];
    this.historyIndex = -1;
    this.enabled = true;

    this.inputEl.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Send button
    const sendBtn = document.getElementById('btn-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.submit());
    }
  }

  handleKeyDown(e) {
    if (!this.enabled) {
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.submit();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
    }
  }

  submit() {
    const value = this.inputEl.value.trim();
    if (!value) return;

    // Add to history
    this.history.push(value);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = -1;

    // Clear input
    this.inputEl.value = '';

    // Callback
    this.onSubmit(value);
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    if (direction === -1) {
      // Up — go back in history
      if (this.historyIndex === -1) {
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      // Down — go forward
      if (this.historyIndex >= 0) {
        this.historyIndex++;
        if (this.historyIndex >= this.history.length) {
          this.historyIndex = -1;
          this.inputEl.value = '';
          return;
        }
      }
    }

    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      this.inputEl.value = this.history[this.historyIndex];
    }
  }

  setCommand(cmd) {
    this.inputEl.value = cmd;
    this.inputEl.focus();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.inputEl.disabled = !enabled;
  }

  focus() {
    this.inputEl.focus();
  }
}
