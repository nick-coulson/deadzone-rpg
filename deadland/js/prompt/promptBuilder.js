// DEADZONE — Prompt Builder (assembles system message dynamically)

import { getGenesisPrompt } from './genesisPrompt.js';
import { PHASE_CONTEXTS } from '../state/stateSchema.js';
import { i18n } from '../core/i18n.js';

class PromptBuilder {
  constructor() {
    this.phase = '';
    this.location = '';
    this.masterSummary = '';
    this.characterData = '';
    this.groupData = '';
    this.sceneContext = '';
    this.onDemandData = [];
    this.outbreakDay = null;
  }

  setPhase(phase) { this.phase = phase; }
  setLocation(location) { this.location = location; }
  setOutbreakDay(day) { this.outbreakDay = day; }
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
      let phaseText = `## SPIELWELT-KONTEXT\n\n${PHASE_CONTEXTS[this.phase]}\nStartort: ${this.location}`;

      // Pre-outbreak: inject mandatory outbreak trigger
      if (this.phase === 'pre_outbreak' && this.outbreakDay) {
        phaseText += `\n\n### GEHEIMER AUSBRUCH-TRIGGER (NICHT dem Spieler verraten!)
Der Zombie-Ausbruch MUSS an Tag ${this.outbreakDay} beginnen. Das ist NICHT optional.
- Tage 1-${this.outbreakDay - 2}: Normalität mit zunehmend beunruhigenden Hinweisen (Nachrichten, kranke Tiere, seltsame Vorfälle, verschwundene Nachbarn)
- Tag ${this.outbreakDay - 1}: Drastische Eskalation — Militärkonvois, Quarantäne-Zonen, Panik in den Nachrichten, Sirenen
- Tag ${this.outbreakDay}: DER AUSBRUCH! Erste Zombies, Chaos, Zusammenbruch der Ordnung. Ab hier ist nichts mehr wie vorher.
- Baue die Spannung realistisch auf. Der Spieler soll die wachsende Bedrohung SPÜREN bevor es losgeht.
- Der Ausbruch-Tag ist fest — egal was der Spieler tut, er kann ihn nicht verhindern.`;
      }

      parts.push(phaseText);
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
  tag: 1
  uhrzeit: "HH:MM (24h-Format, z.B. 21:55)"
  wetter: "detailliertes aktuelles Wetter mit Temperatur (z.B. 'Nebliger Herbstmorgen, 8°C' oder 'Starkregen, 14°C' oder 'Klar, Sternenhimmel, -2°C')"
  zeit_verbraucht: "30min"
  lärm_erzeugt: "niedrig"
notizbuch: []
world_clocks: {}
npcs: []
</state_update>

Nur VERAENDERTE Felder eintragen. Leere Felder weglassen.

### ZEITMANAGEMENT
- Am Ende jeder Szene IMMER die vergangene Zeit realistisch abschätzen und im state_update als uhrzeit (neue absolute Uhrzeit), tag (aktueller Tag als Zahl) UND zeit_verbraucht eintragen.
- WICHTIG: Das "tag" Feld im state_update MUSS immer den aktuellen Tag als Zahl enthalten (1, 2, 3...). Wenn Mitternacht überschritten wird, Tag um 1 erhöhen. Die <ui:time> Box und der state_update müssen IMMER denselben Tag zeigen!
- Die <ui:time> Box am Ende jeder Antwort anzeigen mit aktuellem Tag, Uhrzeit, Tageszeit und vergangener Zeit (z.B. "Tag 1 | 07:45 Morgen | +25min vergangen").
- Realistische Zeitschätzung: Kurze Gespräche ~5-10min, Erkundung eines Raumes ~15-30min, Plündern ~30-60min, Reisen zwischen Orten ~1-3h, Schlaf ~6-8h.

### SPRACHE
Spiele auf ${i18n.lang === 'en' ? 'Englisch (English)' : 'Deutsch (German)'}. Narrativer Text ist literarische Prosa. UI-Boxen sind kompakt und informativ. ALLE Ausgaben (Erzählung, UI-Boxen, Status, Inventar) müssen in der gewählten Sprache sein.`;
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
