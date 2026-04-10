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
        content: `Du bist der Save-Manager von DEADZONE.
Fasse die aktuelle Session zusammen im folgenden YAML-Format.
MAX 700 Tokens. KRITISCH: Das Inventar und alle Gegenstände MÜSSEN VOLLSTÄNDIG aufgelistet werden — nichts weglassen!

FORMAT:
zusammenfassung: |
  [Freitext, max 3 Absätze — was ist passiert?]
aktuelles_inventar:
  - "Gegenstand 1"
  - "Gegenstand 2"
  - "[JEDEN einzelnen Gegenstand den der Spieler besitzt auflisten!]"
wichtige_entscheidungen:
  - "..."
veränderungen:
  charakter: "Aktueller Zustand, Verletzungen, Zustand"
  gruppe: "Begleiter und deren Status"
  basis: "Basis-Zustand falls vorhanden"
  welt: "Weltlage, bekannte Bedrohungen"
offene_fäden:
  - "..."
aktueller_ort: "Wo ist der Spieler gerade?"
aktuelle_uhrzeit: "Tag X, HH:MM"`
      },
      ...this.conversationHistory
    ];

    return await apiClient.send(messages, {
      temperature: 0.3,
      maxTokens: 800
    });
  }

  clear() {
    this.conversationHistory = [];
    this.messageCount = 0;
  }
}

export const contextManager = new ContextManager();
