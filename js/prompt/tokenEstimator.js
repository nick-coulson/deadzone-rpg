// DEADZONE — Token Estimation

// Approximation: mixed German/English text averages ~3.7 chars per token
const CHARS_PER_TOKEN = 3.7;

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function estimateMessagesTokens(messages) {
  let total = 0;
  for (const msg of messages) {
    // ~4 tokens overhead per message for role/formatting
    total += 4;
    total += estimateTokens(msg.content);
  }
  return total;
}
