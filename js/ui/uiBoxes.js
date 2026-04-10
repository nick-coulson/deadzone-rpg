// DEADZONE — UI Box Renderers

function mdToHtml(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\d+h)(\d)/g, '$1 $2')  // "2h30min" → "2h 30min"
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\*\*\s*$/gm, '')        // Remove orphan ** on their own line
    .replace(/\n/g, '<br>')
    .replace(/(<br>\s*){3,}/g, '<br><br>');  // Collapse excessive line breaks
}

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
    pre.innerHTML = mdToHtml(content);
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
      p.innerHTML = mdToHtml(line);
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

      // Click to insert option text into chat input
      const plainText = line.trim();
      opt.addEventListener('click', () => {
        if (opt.classList.contains('disabled')) return;
        const input = document.getElementById('game-input');
        if (input) {
          input.value = plainText;
          input.focus();
        }
      });

      div.appendChild(opt);
    }
    return div;
  },

  combat_player(content, attrs) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';

    const lines = content.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      // Detect option-like lines: "- Action", "1. Action", "[A] Action", "• Action"
      const isOption = /^(\d+[\.\)]\s|[-•]\s|\[[A-Z]\]\s)/.test(trimmed);

      if (isOption) {
        const opt = document.createElement('div');
        opt.className = 'choice-option';
        const highlighted = trimmed
          .replace(/\[([A-Z])\]/g, '<span class="choice-key">[$1]</span>');
        opt.innerHTML = highlighted;

        const plainText = trimmed;
        opt.addEventListener('click', () => {
          if (opt.classList.contains('disabled')) return;
          const input = document.getElementById('game-input');
          if (input) {
            input.value = plainText;
            input.focus();
          }
        });
        div.appendChild(opt);
      } else {
        const p = document.createElement('div');
        p.innerHTML = mdToHtml(trimmed);
        div.appendChild(p);
      }
    }
    return div;
  },

  notebook_update(content) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';
    div.innerHTML = mdToHtml(content);
    return div;
  },

  threat(content, attrs) {
    const div = document.createElement('div');
    div.className = 'ui-box-content';
    div.innerHTML = mdToHtml(content);
    return div;
  },

  status(content, attrs) {
    const div = document.createElement('div');
    div.className = 'ui-box-content status-bars';

    // Split on --- separator: bars section vs text section
    const parts = content.split(/^---$/m);
    const barSection = parts[0] || '';
    const textSection = parts.slice(1).join('---');

    // Parse lines with "key: X/10 | description" format
    const STAT_CONFIG = {
      gesundheit: { label: '❤️ Gesundheit', invert: false, colorHigh: '#4ade50', colorMid: '#f59e0b', colorLow: '#dc2626' },
      hunger:     { label: '🍖 Hunger',     invert: true,  colorHigh: '#dc2626', colorMid: '#f59e0b', colorLow: '#4ade50' },
      durst:      { label: '💧 Durst',      invert: true,  colorHigh: '#dc2626', colorMid: '#f59e0b', colorLow: '#4ade50' },
      müdigkeit:  { label: '😴 Müdigkeit',  invert: true,  colorHigh: '#dc2626', colorMid: '#f59e0b', colorLow: '#4ade50' },
      psyche:     { label: '🧠 Psyche',     invert: false, colorHigh: '#4ade50', colorMid: '#f59e0b', colorLow: '#dc2626' }
    };

    const lines = barSection.split('\n').filter(l => l.trim());
    let hasBar = false;

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(\d+)\s*\/\s*(\d+)\s*\|\s*(.+)/);
      if (match) {
        const [, key, valStr, maxStr, desc] = match;
        const val = parseInt(valStr);
        const max = parseInt(maxStr);
        const config = STAT_CONFIG[key.toLowerCase()];
        if (!config) continue;

        const pct = Math.round((val / max) * 100);
        // For inverted stats (hunger etc), color is based on how BAD it is
        let barColor;
        if (config.invert) {
          barColor = pct <= 30 ? config.colorLow : pct <= 60 ? config.colorMid : config.colorHigh;
        } else {
          barColor = pct >= 70 ? config.colorHigh : pct >= 40 ? config.colorMid : config.colorLow;
        }

        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
          <span class="stat-label">${config.label}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="stat-value">${val}/${max}</span>
          <span class="stat-desc">${desc.trim()}</span>
        `;
        div.appendChild(row);
        hasBar = true;
      }
    }

    // If no X/10 bars parsed, try parsing old █-block format
    if (!hasBar) {
      const blockLines = content.split('\n').filter(l => l.trim());
      for (const line of blockLines) {
        // Match: "Label: ██████▌ (description)" or "Label: █▌ (description)"
        const blockMatch = line.match(/^([^:]+):\s*([█▌░▒▓■□]+)\s*\((.+?)\)/);
        if (blockMatch) {
          const [, rawLabel, blocks, desc] = blockMatch;
          const label = rawLabel.trim();

          // Count full blocks (█) and half blocks (▌)
          const fullBlocks = (blocks.match(/█/g) || []).length;
          const halfBlocks = (blocks.match(/▌/g) || []).length;
          const totalFill = fullBlocks + halfBlocks * 0.5;
          const maxBlocks = 10; // assume 10-block scale
          const pct = Math.min(100, Math.round((totalFill / maxBlocks) * 100));

          // Determine stat type and colors
          const lowerLabel = label.toLowerCase();
          let emoji;
          if (lowerLabel.includes('hunger')) emoji = '🍖';
          else if (lowerLabel.includes('durst')) emoji = '💧';
          else if (lowerLabel.includes('müdigkeit') || lowerLabel.includes('mudigkeit')) emoji = '😴';
          else if (lowerLabel.includes('gesundheit') || lowerLabel.includes('health')) emoji = '❤️';
          else if (lowerLabel.includes('psyche')) emoji = '🧠';
          else emoji = '📊';

          // Old █ format: blocks represent "how much resource remains"
          // More blocks = better for ALL stats (full bar = satt/ausgeruht/gesund)
          let barColor;
          barColor = pct >= 70 ? '#4ade50' : pct >= 40 ? '#f59e0b' : '#dc2626';

          const row = document.createElement('div');
          row.className = 'stat-row';
          row.innerHTML = `
            <span class="stat-label">${emoji} ${label}</span>
            <div class="stat-bar-track">
              <div class="stat-bar-fill" style="width:${pct}%;background:${barColor}"></div>
            </div>
            <span class="stat-value">${Math.round(totalFill)}/${maxBlocks}</span>
            <span class="stat-desc">${desc.trim()}</span>
          `;
          div.appendChild(row);
          hasBar = true;
        } else if (!hasBar) {
          // Non-bar text before any bars found: skip or accumulate
        } else {
          // Text after bars: treat as extra info
          const extra = document.createElement('div');
          extra.className = 'stat-text';
          extra.innerHTML = mdToHtml(line);
          div.appendChild(extra);
        }
      }

      // Still nothing matched? Pure fallback to text
      if (!hasBar) {
        div.innerHTML = mdToHtml(content);
        return div;
      }
    }

    // Render text section after bars
    if (textSection.trim()) {
      const textDiv = document.createElement('div');
      textDiv.className = 'stat-text';
      textDiv.innerHTML = mdToHtml(textSection.trim());
      div.appendChild(textDiv);
    }

    return div;
  }
};

// Default renderer for all others not in BOX_RENDERERS
// (handled in renderUIBox above)
