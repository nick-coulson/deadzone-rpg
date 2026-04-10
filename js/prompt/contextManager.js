// DEADZONE — Context Manager (Rotation & Summary)
// Narrative-only summaries + structured state from IndexedDB

import { apiClient } from '../api/openRouterClient.js';
import { eventBus } from '../core/eventBus.js';

const MAX_ROLLING_SESSIONS = 3; // keep last 3 session summaries

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
      // 1. Request NARRATIVE-ONLY summary from AI
      const narrativeSummary = await this.requestNarrativeSummary();

      // 2. Clear conversation history
      this.conversationHistory = [];
      this.messageCount = 0;
      this.sessionNumber++;

      // 3. Notify with narrative summary
      eventBus.emit('context:rotated', {
        sessionNumber: this.sessionNumber,
        summary: narrativeSummary
      });

      return narrativeSummary;
    } catch (err) {
      console.error('Context rotation failed:', err);
      eventBus.emit('context:rotation-error', err);
      return null;
    }
  }

  /**
   * AI summarizes ONLY the narrative — no state data.
   * State (inventory, stats, time, weather, scene, world clocks)
   * is persisted in IndexedDB and injected by promptBuilder directly.
   */
  async requestNarrativeSummary() {
    const messages = [
      {
        role: 'system',
        content: `DEADZONE Narrative-Summarizer.
Fasse NUR die GESCHICHTE dieser Session zusammen. MAX 400 Tokens.

WICHTIG: Schreibe KEINE State-Daten (kein Inventar, keine Stats, keine Uhrzeit, kein Wetter, keinen Ort).
Diese werden separat gespeichert und automatisch eingefügt.

FORMAT:
ereignisse: |
  [Was ist passiert? Max 2-3 Absätze. Fokus auf Handlung, Begegnungen, Entdeckungen.]
entscheidungen:
  - "Wichtige Entscheidung 1"
  - "Wichtige Entscheidung 2"
npcs:
  - "Name: Beziehung/Status (z.B. 'Sheriff Cole: misstrauisch, hat uns Hilfe verweigert')"
offene_fäden:
  - "Ungelöste Situation oder Hinweis"
stimmung: "Aktuelle Atmosphäre/Ton der Geschichte"`
      },
      ...this.conversationHistory
    ];

    return await apiClient.send(messages, {
      temperature: 0.3,
      maxTokens: 500
    });
  }

  clear() {
    this.conversationHistory = [];
    this.messageCount = 0;
  }
}

/**
 * Trim rolling summary to keep only last N sessions.
 * Sessions are separated by \n\n---\n\n
 */
export function trimRollingSummary(fullSummary, maxSessions = MAX_ROLLING_SESSIONS) {
  if (!fullSummary) return '';
  const sessions = fullSummary.split('\n\n---\n\n').filter(s => s.trim());
  if (sessions.length <= maxSessions) return fullSummary;
  return sessions.slice(-maxSessions).join('\n\n---\n\n');
}

export const contextManager = new ContextManager();
