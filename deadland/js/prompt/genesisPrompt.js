// DEADZONE — Genesis Prompt Loader

let cachedPrompt = null;

export async function loadGenesisPrompt() {
  if (cachedPrompt) return cachedPrompt;

  try {
    const res = await fetch('data/genesis_prompt_v2.md');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedPrompt = await res.text();
    return cachedPrompt;
  } catch (err) {
    console.error('Failed to load GENESIS prompt:', err);
    throw new Error('GENESIS System-Prompt konnte nicht geladen werden.');
  }
}

export function getGenesisPrompt() {
  return cachedPrompt;
}
