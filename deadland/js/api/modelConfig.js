// DEADZONE — Model Configuration & Pricing

export const MODELS = {
  'anthropic/claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    inputPrice: 3.0,    // per million tokens
    outputPrice: 15.0,
    contextWindow: 200000,
    tier: 'recommended'
  },
  'anthropic/claude-opus-4': {
    name: 'Claude Opus 4',
    inputPrice: 15.0,
    outputPrice: 75.0,
    contextWindow: 200000,
    tier: 'recommended'
  },
  'google/gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    inputPrice: 2.5,
    outputPrice: 15.0,
    contextWindow: 1000000,
    tier: 'recommended'
  },
  'anthropic/claude-haiku-4': {
    name: 'Claude Haiku 4',
    inputPrice: 0.8,
    outputPrice: 4.0,
    contextWindow: 200000,
    tier: 'budget'
  },
  'google/gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: 1000000,
    tier: 'budget'
  }
};

export function getModelConfig(modelId) {
  return MODELS[modelId] || {
    name: modelId,
    inputPrice: 1.0,
    outputPrice: 3.0,
    contextWindow: 128000,
    tier: 'custom'
  };
}

export function calculateCost(inputTokens, outputTokens, modelId) {
  const config = getModelConfig(modelId);
  const inputCost = (inputTokens / 1_000_000) * config.inputPrice;
  const outputCost = (outputTokens / 1_000_000) * config.outputPrice;
  return inputCost + outputCost;
}
