// DEADZONE — OpenRouter API Client with Streaming

import { costTracker } from './costTracker.js';
import { estimateTokens, estimateMessagesTokens } from '../prompt/tokenEstimator.js';
import { eventBus } from '../core/eventBus.js';

const API_BASE = 'https://openrouter.ai/api/v1';

class OpenRouterClient {
  constructor() {
    this.apiKey = '';
    this.model = 'deepseek/deepseek-chat-v3-0324';
    this.abortController = null;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  setModel(model) {
    this.model = model;
    costTracker.setModel(model);
  }

  async validateKey(key) {
    // Client-side length check only — actual auth is validated on first game API call
    if (!key || key.length < 10) {
      return { valid: false, error: 'API-Key zu kurz. Bitte prüfen.' };
    }
    return { valid: true };
  }

  async sendStreaming(messages, { temperature = 0.85, maxTokens = 2048, onToken, onDone, onError }) {
    this.abortController = new AbortController();
    const inputTokens = estimateMessagesTokens(messages);
    let fullResponse = '';
    let outputTokens = 0;

    try {
      const res = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 0.95,
          stream: true
        }),
        signal: this.abortController.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = this.getErrorMessage(res.status, errorData);
        onError(errMsg, res.status);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              outputTokens = estimateTokens(fullResponse);
              onToken(delta, fullResponse);
            }
          } catch (e) {
            // Skip malformed JSON chunks
          }
        }
      }

      // Track costs
      costTracker.trackCall(inputTokens, outputTokens);
      eventBus.emit('api:response-complete', { inputTokens, outputTokens });

      onDone(fullResponse);

    } catch (err) {
      if (err.name === 'AbortError') {
        onDone(fullResponse); // Return what we have
        return;
      }
      onError('Netzwerkfehler: ' + err.message, 0);
    } finally {
      this.abortController = null;
    }
  }

  // Non-streaming call (for summaries, character generation)
  async send(messages, { temperature = 0.7, maxTokens = 1024 } = {}) {
    const inputTokens = estimateMessagesTokens(messages);

    if (!this.apiKey) {
      throw new Error('Kein API-Key gesetzt. Bitte Key eingeben.');
    }

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    console.log('API call: key length =', this.apiKey.length, ', model =', this.model);

    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const rawMsg = errorData?.error?.message || JSON.stringify(errorData);
      console.error('API error:', res.status, rawMsg, 'Key starts with:', this.apiKey.substring(0, 8) + '...');
      throw new Error(`HTTP ${res.status}: ${rawMsg}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const outputTokens = estimateTokens(content);

    costTracker.trackCall(inputTokens, outputTokens);

    return content;
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  getErrorMessage(status, data) {
    const msg = data?.error?.message || '';
    switch (status) {
      case 401: return 'API-Key ungültig oder nicht erkannt. OpenRouter-Keys beginnen mit sk-or-v1-. Bitte prüfe deinen Key auf openrouter.ai/keys';
      case 402: return 'Kein Guthaben auf OpenRouter. Bitte aufladen.';
      case 429: return 'Server ausgelastet. Bitte kurz warten.';
      case 500: case 502: case 503:
        return 'OpenRouter nicht erreichbar. Spielstand ist gesichert.';
      default:
        return msg || `API-Fehler (HTTP ${status})`;
    }
  }
}

export const apiClient = new OpenRouterClient();
