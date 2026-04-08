// DEADZONE — UI Box Renderers

const BOX_HEADERS = {
  scene: 'SZENE',
  threat: 'BEDROHUNG ERKANNT',
  found: 'GEFUNDEN',
  npc: 'BEGEGNUNG',
  status: 'STATUS',
  inventory: 'INVENTAR',
  map: 'BEKANNTE UMGEBUNG',
  group: 'DEINE GRUPPE',
  base: 'BASIS-BERICHT',
  time: 'ZEITSTATUS',
  notebook: 'NOTIZBUCH',
  notebook_update: '',
  combat_enemy: 'FEIND-ZUG',
  combat_player: 'DEIN ZUG',
  combat_end: 'KAMPF VORBEI',
  trade: 'HANDEL',
  radio: 'FUNK',
  save: 'AUTO-SAVE',
  roll: 'WUERFEL',
  choice: 'OPTIONEN'
};

export function renderUIBox(segment) {
  const { component, attributes, content } = segment;

  const box = document.createElement('div');
  box.className = `ui-box ui-${component} fade-in`;

  // Set data attributes
  for (const [key, val] of Object.entries(attributes)) {
    box.setAttribute(`data-${key}`, val);
  }

  // Header
  const headerText = BOX_HEADERS[component];
  if (headerText) {
    const header = document.createElement('div');
    header.className = 'ui-box-header';
    header.textContent = headerText;
    box.appendChild(header);
  }

  // Content — use specific renderer if available
  const renderer = BOX_RENDERERS[component];
  if (renderer) {
    const inner = renderer(content, attributes);
    box.appendChild(inner);
  } else {
    const pre = document.createElement('div');
    pre.className = 'ui-box-content';
    pre.textContent = content;
    box.appendChild(pre);
  }

  // Special effects
  if (component === 'threat') {
    const level = attributes.level || 'medium';
    if (level === 'high' || level === 'extreme') {
      box.classList.add('flash-red');
    }
  }

  if (component === 'combat_enemy') {
    box.classList.add('screen-flicker');
  }

  return box;
}

// === Specific Renderers ===

const BOX_RENDERERS = {
  roll(content, attrs) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';

    // Try to detect roll result for coloring
    const lines = content.split('\n');
    for (const line of lines) {
      const p = document.createElement('div');
      if (line.match(/kritischer?\s*erfolg|devastating|critical.*success/i)) {
        p.className = 'roll-result roll-critical-success';
      } else if (line.match(/erfolg|success|strong/i)) {
        p.className = 'roll-result roll-success';
      } else if (line.match(/kritischer?\s*fehl|critical.*fail/i)) {
        p.className = 'roll-result roll-critical-failure';
      } else if (line.match(/fehl|fail|miss/i)) {
        p.className = 'roll-result roll-failure';
      }
      p.textContent = line;
      div.appendChild(p);
    }
    return div;
  },

  choice(content, attrs) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';

    const lines = content.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const opt = document.createElement('div');
      opt.className = 'choice-option';

      // Highlight [A], [B], [C] etc.
      const highlighted = line.replace(/\[([A-Z])\]/g, '<span class="choice-key">[$1]</span>');
      opt.innerHTML = highlighted;
      div.appendChild(opt);
    }
    return div;
  },

  notebook_update(content) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';
    div.textContent = content;
    return div;
  },

  threat(content, attrs) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';
    div.textContent = content;
    return div;
  }
};

// Default renderer for all others not in BOX_RENDERERS
// (handled in renderUIBox above)
