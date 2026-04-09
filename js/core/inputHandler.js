// DEADZONE — Input Handler (routes player input)

import { promptBuilder } from '../prompt/promptBuilder.js';
import { saveManager } from '../state/saveManager.js';
import { eventBus } from './eventBus.js';

// System commands that never go to the AI
const SYSTEM_COMMANDS = [
  'speichern', 'laden', 'exportieren', 'einstellungen',
  'session-info', 'kosten', 'modell', 'hilfe-system',
  'minimal', 'voll', 'quit'
];

// Game commands that go to AI but load on-demand data
const GAME_COMMANDS = [
  { pattern: /^(status|wie geht es mir)/i, type: 'status', loadData: ['charakter'] },
  { pattern: /^(inventar|was habe ich)/i, type: 'inventory', loadData: ['charakter'] },
  { pattern: /^(karte|wo bin ich)/i, type: 'map', loadData: ['welt/weltzustand'] },
  { pattern: /^(gruppe|wer ist bei mir)/i, type: 'group', loadData: ['npcs/gruppe'] },
  { pattern: /^(basis|wie steht es um)/i, type: 'base', loadData: ['basis/hauptbasis'] },
  { pattern: /^(notizbuch|was weiss ich)/i, type: 'notebook', loadData: ['notizbuch'] },
  { pattern: /^(zeit|welcher tag)/i, type: 'time', loadData: [] },
  { pattern: /^(hilfe|help)$/i, type: 'help', loadData: [] }
];

export class InputHandler {
  constructor() {
    this.onSendToLLM = null;
    this.onSystemCommand = null;
  }

  async processInput(rawInput) {
    const input = rawInput.trim();
    if (!input) return;

    const lower = input.toLowerCase();

    // 1. Check system commands
    if (SYSTEM_COMMANDS.includes(lower)) {
      if (this.onSystemCommand) {
        this.onSystemCommand(lower);
      }
      return;
    }

    // 2. Check game commands (on-demand data loading)
    for (const cmd of GAME_COMMANDS) {
      if (cmd.pattern.test(lower)) {
        await this.loadOnDemandData(cmd.loadData);
        break;
      }
    }

    // 3. Send to LLM
    if (this.onSendToLLM) {
      this.onSendToLLM(input);
    }
  }

  async loadOnDemandData(dataKeys) {
    for (const key of dataKeys) {
      const data = await saveManager.getState(key);
      if (data) {
        const label = key.toUpperCase().replace(/\//g, ' — ');
        promptBuilder.addOnDemandData(label, data);
      }
    }
  }
}
