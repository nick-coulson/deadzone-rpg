// DEADZONE — Response Parser (KI output → segments)

const UI_TAG_REGEX = /<ui:(\w+)(?:\s+([^>]*?))?>([\s\S]*?)<\/ui:\1>/g;
const STATE_UPDATE_REGEX = /<state_update>([\s\S]*?)<\/state_update>/g;

export function parseResponse(rawResponse) {
  // First, extract and remove state_update blocks
  const stateUpdates = [];
  let cleaned = rawResponse.replace(STATE_UPDATE_REGEX, (match, content) => {
    stateUpdates.push(content.trim());
    return '';
  });

  // Parse remaining content into segments
  const segments = [];
  let lastIndex = 0;

  // Reset regex
  UI_TAG_REGEX.lastIndex = 0;

  let match;
  while ((match = UI_TAG_REGEX.exec(cleaned)) !== null) {
    // Text before the tag → narrative block
    if (match.index > lastIndex) {
      const text = cleaned.slice(lastIndex, match.index).trim();
      if (text) {
        segments.push({ type: 'narrative', content: text });
      }
    }

    // The UI tag itself
    segments.push({
      type: 'ui',
      component: match[1],
      attributes: parseAttributes(match[2] || ''),
      content: match[3].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last tag
  const remaining = cleaned.slice(lastIndex).trim();
  if (remaining) {
    segments.push({ type: 'narrative', content: remaining });
  }

  return { segments, stateUpdates };
}

function parseAttributes(attrString) {
  const attrs = {};
  if (!attrString) return attrs;

  const attrRegex = /(\w+)="([^"]*?)"/g;
  let m;
  while ((m = attrRegex.exec(attrString)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

// Parse state update YAML (simple key-value extraction, not full YAML parser)
export function parseStateUpdate(yamlText) {
  const result = {
    charakter: {},
    szene: {},
    notizbuch: [],
    world_clocks: {},
    npcs: []
  };

  if (!yamlText) return result;

  const lines = yamlText.split('\n');
  let currentSection = null;
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Top-level section
    if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed.endsWith(':') && !trimmed.includes('"')) {
      currentSection = trimmed.slice(0, -1);
      currentKey = null;
      continue;
    }

    if (currentSection && trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim().replace(/^- /, '');
      const value = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');

      if (currentSection === 'charakter') {
        if (key === 'inventar_add' || key === 'inventar_remove') {
          result.charakter[key] = parseYAMLArray(value);
        } else {
          result.charakter[key] = value;
        }
      } else if (currentSection === 'szene') {
        result.szene[key] = value;
      } else if (currentSection === 'world_clocks') {
        result.world_clocks[key] = value;
      }
    } else if (currentSection === 'notizbuch' && trimmed.startsWith('-')) {
      result.notizbuch.push(trimmed.slice(1).trim());
    } else if (currentSection === 'npcs' && trimmed.startsWith('-')) {
      result.npcs.push(trimmed.slice(1).trim());
    }
  }

  return result;
}

function parseYAMLArray(str) {
  if (!str || str === '[]') return [];
  // Handle ["item1", "item2"] format
  const match = str.match(/\[([^\]]*)\]/);
  if (match) {
    return match[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return [];
}
