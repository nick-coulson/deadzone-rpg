// DEADZONE — Context Manager (Rotation & Summary)

import { apiClient } from '../api/openRouterClient.js';
import { eventBus } from '../core/eventBus.js';

class ContextManager {
  constructor() {
    this.messageCount = 0;
    this.maxMessages = 20;
    this.sessionNumber = 1;
    this.conversationHistory = [];
  }

  setMaxMessages(n) { this.maxMessages = n; }
  setSessionNumber(n) { this.sessionNumber = n; }

  addMessage(role, content) {
    this.conversationHistory.push({ role, content });
    if (role === 'user') {
      this.messageCount++;
    }
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  getLastN(n) {
    return this.conversationHistory.slice(-n);
  }

  getMessageCount() {
    return this.messageCount;
  }

  shouldRotate() {
    return this.messageCount >= this.maxMessages;
  }

  async rotate(onStatus) {
    if (onStatus) onStatus('Session wird zusammengefasst...');

    try {
      // 1. Request summary from AI
      const summaryYAML = await this.requestSummary();

      // 2. Clear conversation history
      this.conversationHistory = [];
      this.messageCount = 0;
      this.sessionNumber++;

      // 3. Notify
      eventBus.emit('context:rotated', {
        sessionNumber: this.sessionNumber,
        summary: summaryYAML
      });

      return summaryYAML;
    } catch (err) {
      console.error('Context rotation failed:', err);
      eventBus.emit('context:rotation-error', err);
      return null;
    }
  }

  async requestSummary() {
    const messages = [
      {
        role: 'system',
        content: `DEADZONE Save-Manager. Fasse Session zusammen. MAX 500 Tokens.
KRITISCH: Inventar VOLLSTÄNDIG auflisten!

FORMAT:
zusammenfassung: |
  [Max 2 Absätze — was ist passiert?]
inventar: ["item1", "item2", "...ALLE items"]
entscheidungen: ["..."]
zustand:
  charakter: "HP/Verletzungen"
  gruppe: "Begleiter+Status"
  basis: "falls vorhanden"
  welt: "Lage/Bedrohungen"
offene_fäden: ["..."]
ort: "aktueller Ort"
zeit: "Tag X, HH:MM"`
      },
      ...this.conversationHistory
    ];

    return await apiClient.send(messages, {
      temperature: 0.3,
      maxTokens: 600
    });
  }

  clear() {
    this.conversationHistory = [];
    this.messageCount = 0;
  }
}

export const contextManager = new ContextManager();
