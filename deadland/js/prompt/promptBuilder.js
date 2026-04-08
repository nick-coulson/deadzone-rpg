// DEADZONE — Prompt Builder (assembles system message dynamically)

import { getGenesisPrompt } from './genesisPrompt.js';
import { PHASE_CONTEXTS } from '../state/stateSchema.js';

class PromptBuilder {
  constructor() {
    this.phase = '';
    this.location = '';
    this.masterSummary = '';
    this.characterData = '';
    this.groupData = '';
    this.sceneContext = '';
    this.onDemandData = [];
  }

  setPhase(phase) { this.phase = phase; }
  setLocation(location) { this.location = location; }
  setMasterSummary(summary) { this.masterSummary = summary; }
  setCharacterData(data) { this.characterData = data; }
  setGroupData(data) { this.groupData = data; }
  setSceneContext(context) { this.sceneContext = context; }

  addOnDemandData(label, data) {
    this.onDemandData.push({ label, data });
  }

  clearOnDemandData() {
    this.onDemandData = [];
  }

  buildSystemMessage() {
    const parts = [];

    // 1. GENESIS System Prompt (static, ~4000 tokens)
    const genesis = getGenesisPrompt();
    if (genesis) {
      parts.push(genesis);
    }

    // 2. DEADZONE-specific game context
    parts.push(this.buildGameContext());

    // 3. World/Phase context
    if (this.phase && PHASE_CONTEXTS[this.phase]) {
      parts.push(`## SPIELWELT-KONTEXT\n\n${PHASE_CONTEXTS[this.phase]}\nStartort: ${this.location}`);
    }

    // 4. Master summary (rolling history)
    if (this.masterSummary) {
      parts.push(`## MASTER-ZUSAMMENFASSUNG (bisheriger Spielverlauf)\n\n${this.masterSummary}`);
    }

    // 5. Character data
    if (this.characterData) {
      parts.push(`## CHARAKTER-DATEN\n\n${this.characterData}`);
    }

    // 6. Group data
    if (this.groupData) {
      parts.push(`## GRUPPEN-DATEN\n\n${this.groupData}`);
    }

    // 7. Scene context
    if (this.sceneContext) {
      parts.push(`## SZENEN-KONTEXT\n\n${this.sceneContext}`);
    }

    // 8. On-demand data (notebook, NPC profiles, base data)
    for (const item of this.onDemandData) {
      parts.push(`## ${item.label}\n\n${item.data}`);
    }

    return { role: 'system', content: parts.join('\n\n---\n\n') };
  }

  buildGameContext() {
    return `## DEADZONE — SPIELREGELN-ERGAENZUNG

Du bist der Game Master von DEADZONE, einem textbasierten AI Zombie Survival RPG.

### UI-TAG SYSTEM
Verwende diese Tags um UI-Elemente im Output zu erzeugen. Der Client parsed sie und rendert sie als gestylte Boxen.

Verfügbare Tags:
<ui:scene>Szenen-Header (Ort, Zeit, Wetter)</ui:scene>
<ui:threat level="low|medium|high|extreme">Bedrohungs-Banner</ui:threat>
<ui:found>Gefundene Gegenstände</ui:found>
<ui:npc>NPC-Eindruck bei Begegnung</ui:npc>
<ui:status>Charakter-Status</ui:status>
<ui:inventory>Inventar-Anzeige</ui:inventory>
<ui:map>Karten-Anzeige bekannter Orte</ui:map>
<ui:group>Gruppen-Übersicht</ui:group>
<ui:base>Basis-Report</ui:base>
<ui:time>Zeitstatus</ui:time>
<ui:notebook>Notizbuch-Inhalt</ui:notebook>
<ui:notebook_update>Kurzer Notizbuch-Hinweis</ui:notebook_update>
<ui:combat_enemy>Feind-Zug im Kampf</ui:combat_enemy>
<ui:combat_player>Spieler-Zug im Kampf</ui:combat_player>
<ui:combat_end>Kampf-Ende Zusammenfassung</ui:combat_end>
<ui:trade>Handels-Panel</ui:trade>
<ui:radio>Funk-Panel</ui:radio>
<ui:roll>Würfel-Ergebnis</ui:roll>
<ui:choice>Auswahl-Optionen</ui:choice>

REGELN:
- Narrativer Text IMMER vor UI-Boxen
- UI-Boxen nur wenn kontextuell relevant
- Szenen-Header nur bei Ortswechsel/Zeitsprung
- Gefahren-Banner SOFORT bei Bedrohung (vor Erzählung)
- Im Kampf: Nur Kampf-UI verwenden

### STATE UPDATE SYSTEM
Am Ende JEDER Antwort: Füge einen <state_update> Block an. Dieser wird vom Client geparst und gespeichert — der Spieler sieht ihn NICHT.

Format:
<state_update>
charakter:
  hunger: +0
  müdigkeit: +0
  inventar_add: []
  inventar_remove: []
szene:
  ort: "aktueller_ort"
  uhrzeit: "HH:MM (24h-Format, z.B. 21:55)"
  wetter: "detailliertes aktuelles Wetter mit Temperatur (z.B. 'Nebliger Herbstmorgen, 8°C' oder 'Starkregen, 14°C' oder 'Klar, Sternenhimmel, -2°C')"
  zeit_verbraucht: "30min"
  lärm_erzeugt: "niedrig"
notizbuch: []
world_clocks: {}
npcs: []
</state_update>

Nur VERAENDERTE Felder eintragen. Leere Felder weglassen.

### SPRACHE
Spiele auf Deutsch (oder der Sprache des Spielers). Narrativer Text ist literarische Prosa. UI-Boxen sind kompakt und informativ.`;
  }

  buildMessages(conversationHistory) {
    const messages = [this.buildSystemMessage()];
    messages.push(...conversationHistory);
    // Clear on-demand data after building (one-shot)
    this.clearOnDemandData();
    return messages;
  }
}

export const promptBuilder = new PromptBuilder();
