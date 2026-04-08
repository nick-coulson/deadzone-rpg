// DEADZONE — Cost Tracker

import { calculateCost, getModelConfig } from './modelConfig.js';
import { estimateTokens } from '../prompt/tokenEstimator.js';
import { eventBus } from '../core/eventBus.js';

class CostTracker {
  constructor() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCost = 0;
    this.modelId = '';
    this.budgetLimit = 5.0;
    this.callCount = 0;
  }

  setModel(modelId) {
    this.modelId = modelId;
  }

  setBudgetLimit(limit) {
    this.budgetLimit = limit;
  }

  trackCall(inputTokens, outputTokens) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.callCount++;

    const callCost = calculateCost(inputTokens, outputTokens, this.modelId);
    this.totalCost += callCost;

    eventBus.emit('cost:updated', this.getStats());

    // Budget warnings
    if (this.budgetLimit > 0) {
      const pct = this.totalCost / this.budgetLimit;
      if (pct >= 1.0) {
        eventBus.emit('cost:budget-exceeded', this.getStats());
      } else if (pct >= 0.95) {
        eventBus.emit('cost:budget-warning', { level: 95, ...this.getStats() });
      } else if (pct >= 0.80) {
        eventBus.emit('cost:budget-warning', { level: 80, ...this.getStats() });
      }
    }

    return callCost;
  }

  // Estimate cost from text before sending
  estimateInputCost(text) {
    const tokens = estimateTokens(text);
    const config = getModelConfig(this.modelId);
    return (tokens / 1_000_000) * config.inputPrice;
  }

  getStats() {
    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCost: this.totalCost,
      callCount: this.callCount,
      budgetLimit: this.budgetLimit,
      budgetUsedPct: this.budgetLimit > 0 ? (this.totalCost / this.budgetLimit) * 100 : 0,
      modelId: this.modelId
    };
  }

  reset() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCost = 0;
    this.callCount = 0;
  }

  getSnapshot() {
    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCost: this.totalCost,
      callCount: this.callCount,
      modelId: this.modelId
    };
  }

  restoreSnapshot(data) {
    if (!data) return;
    this.totalInputTokens = data.totalInputTokens || 0;
    this.totalOutputTokens = data.totalOutputTokens || 0;
    this.totalCost = data.totalCost || 0;
    this.callCount = data.callCount || 0;
    if (data.modelId) this.modelId = data.modelId;
    eventBus.emit('cost:updated', this.getStats());
  }

  formatCost() {
    return `$${this.totalCost.toFixed(4)}`;
  }
}

export const costTracker = new CostTracker();
