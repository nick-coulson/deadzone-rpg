// DEADZONE — Prompt Builder (assembles system message dynamically)

import { getGenesisPrompt } from './genesisPrompt.js';
import { PHASE_CONTEXTS, INFRASTRUCTURE_DEFAULTS } from '../state/stateSchema.js';
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
    this.infrastructure = null;
    this.worldClocks = null;
    this.characterStats = null;
    this.inventory = null;
    this.notebook = null;
    this.gameTime = null;
    this.weather = null;
    this.currentScene = null;
  }

  setPhase(phase) { this.phase = phase; }
  setLocation(location) { this.location = location; }
  setOutbreakDay(day) { this.outbreakDay = day; }
  setInfrastructure(infra) { this.infrastructure = infra; }
  setWorldClocks(clocks) { this.worldClocks = clocks; }
  setCharacterStats(stats) { this.characterStats = stats; }
  setInventory(items) { this.inventory = items; }
  setNotebook(entries) { this.notebook = entries; }
  setGameTime(time) { this.gameTime = time; }
  setWeather(weather) { this.weather = weather; }
  setCurrentScene(scene) { this.currentScene = scene; }
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

    // 3b. Infrastructure status (for pre_outbreak and outbreak)
    if (this.infrastructure && (this.phase === 'pre_outbreak' || this.phase === 'outbreak')) {
      const infraLines = Object.entries(this.infrastructure)
        .map(([k, v]) => `${k}:${v}`)
        .join(' | ');
      parts.push(`## INFRASTRUKTUR\n${infraLines}\nReferenziere in Szenen. Aktualisiere im state_update.`);
    }

    // 3c. World Clocks (active background events)
    if (this.worldClocks && Object.keys(this.worldClocks).length > 0) {
      const clockLines = Object.entries(this.worldClocks)
        .map(([k, v]) => `${k}: "${v}"`)
        .join('\n');
      parts.push(`## WORLD CLOCKS\n${clockLines}`);
    }

    // 4. Master summary (rolling history)
    if (this.masterSummary) {
      parts.push(`## ZUSAMMENFASSUNG\n${this.masterSummary}`);
    }

    // 5. Character data
    if (this.characterData) {
      parts.push(`## CHARAKTER\n${this.characterData}`);
    }

    // 5b. Character stats (numeric values)
    if (this.characterStats) {
      const s = this.characterStats;
      parts.push(`## STATS\nHP:${s.gesundheit ?? 10} HU:${s.hunger ?? 0} DU:${s.durst ?? 0} MÜ:${s.müdigkeit ?? 0} PS:${s.psyche ?? 10} (je 0-10)`);
    }

    // 5c. Inventory
    if (this.inventory && this.inventory.length > 0) {
      parts.push(`## INVENTAR (EXAKT)\n${this.inventory.join(', ')}`);
    }

    // 5d. Current time, weather, location
    if (this.gameTime || this.weather || this.currentScene) {
      let statusParts = [];
      if (this.gameTime) statusParts.push(this.gameTime);
      if (this.weather) statusParts.push(this.weather);
      if (this.currentScene) statusParts.push(this.currentScene);
      parts.push(`## SZENE\n${statusParts.join(' | ')}`);
    }

    // 5e. Notebook (cap at last 15 entries to save tokens)
    if (this.notebook) {
      let nb = this.notebook;
      const lines = nb.split('\n').filter(l => l.trim());
      if (lines.length > 15) {
        nb = lines.slice(-15).join('\n');
      }
      parts.push(`## NOTIZBUCH\n${nb}`);
    }

    // 6. Group data
    if (this.groupData) {
      parts.push(`## GRUPPE\n${this.groupData}`);
    }

    // 7. Scene context
    if (this.sceneContext) {
      parts.push(`## SZENE-KONTEXT\n${this.sceneContext}`);
    }

    // 8. On-demand data
    for (const item of this.onDemandData) {
      parts.push(`## ${item.label}\n${item.data}`);
    }

    return { role: 'system', content: parts.join('\n\n') };
  }

  buildGameContext() {
    return `## DEADZONE — SPIELREGELN

GM von DEADZONE, textbasiertes AI Zombie Survival RPG.
SETTING: USA. Amerikanische Orte, Highways, Dollar, Sheriff Departments etc.

### UI-TAGS
Tags erzeugen gestylte UI-Boxen. Narrativer Text IMMER vor Boxen. Nur kontextuell relevante Boxen verwenden.

scene: Szenen-Header (Ort/Zeit/Wetter, nur bei Ortswechsel/Zeitsprung) | threat level="low|medium|high|extreme": Bedrohung (SOFORT, vor Erzählung) | found: Gefundene Items | npc: NPC-Eindruck | status: Charakter-Status | inventory: Inventar | map: Karte | group: Gruppen-Übersicht | base: Basis-Report | time: Zeitstatus | notebook/notebook_update: Notizbuch | combat_enemy/combat_player/combat_end: Kampf-UI | trade: Handel | radio: Funk | roll: Würfel | choice: Optionen
Format: <ui:tagname>Inhalt</ui:tagname> bzw. <ui:threat level="high">Text</ui:threat>

### STATE UPDATE
Am Ende JEDER Antwort — wird geparst und gespeichert, Spieler sieht es NICHT. Nur VERÄNDERTE Felder eintragen.

<state_update>
charakter:
  gesundheit: 10
  hunger: 0
  durst: 0
  müdigkeit: 0
  psyche: 10
  inventar_add: []
  inventar_remove: []
szene:
  ort: "ort"
  tag: 1
  uhrzeit: "HH:MM"
  wetter: "Wetter mit Temperatur"
  zeit_verbraucht: "30min"
  lärm_erzeugt: "niedrig"
notizbuch: []
world_clocks:
  name: "[Tag X, HH:MM] Status"
npcs: []${(this.phase === 'pre_outbreak' || this.phase === 'outbreak') ? `
infrastruktur:
  strom|wasser|handynetz|internet|tv_radio|polizei|krankenhaus|supermärkte: "status"` : ''}
</state_update>

### STATS (0-10 Skala)
gesundheit: 10=unverletzt→0=tot | hunger: 0=satt→10=verhungernd | durst: 0=hydriert→10=verdurstet | müdigkeit: 0=ausgeruht→10=am Limit | psyche: 10=stabil→0=gebrochen
IMMER absolute Werte im state_update. Start: gesundheit=10, hunger=0, durst=0, müdigkeit=0, psyche=10.
Bei "Status"-Eingabe: <ui:status> mit "wert/10 | Beschreibung" pro Zeile (wird als Balken gerendert). Nach "---": Freitext.

### ZEIT
- KRITISCH: Uhrzeit in <ui:scene>, <ui:time> und state_update.uhrzeit MÜSSEN IDENTISCH sein.
- state_update: uhrzeit (absolut HH:MM), tag (Zahl, +1 bei Mitternacht), zeit_verbraucht
- <ui:time> am Ende jeder Antwort: "Tag X | HH:MM Tageszeit | +Xh Xmin vergangen"
- Zeitschätzung: Gespräch ~5-10min, Raum erkunden ~15-30min, Plündern ~30-60min, Reise ~1-3h, Schlaf ~6-8h

### WORLD CLOCKS
Parallele Hintergrund-Events die der Spieler WAHRGENOMMEN oder ERFAHREN hat.
KRITISCH: Erstelle World Clocks NUR für Ereignisse die im bisherigen Spielverlauf oder in der aktuellen Antwort TATSÄCHLICH erwähnt/angedeutet werden. KEINE Phantom-Events erfinden die nie im Chat vorkamen!
Format: name: "[Tag X, HH:MM] Kompakter Status" | Erledigte: "ABGESCHLOSSEN"
Erstelle für: Bedrohungen, Wetter-Fronten, Infrastruktur-Verfall, Militär-Operationen, Gerüchte die der Spieler gehört hat.
KEINE NPC-Aktivitäten als eigene Clocks — NPCs werden im npcs-Block getrackt.

### ERZÄHLPERSPEKTIVE
ERSTE PERSON (Ich-Perspektive). "Meine Knie schmerzen" NICHT "Ninas Knie schmerzen". Nie Charaktername in Erzählung — immer ich/mein/mir/mich. Ausnahme: NPCs dürfen Namen in Dialogen verwenden.
Abschlussfrage in DU-Form: "Was tust du?"

### SPRACHE
${i18n.lang === 'en' ? 'Englisch' : 'Deutsch'}. Erzählung = literarische Ich-Prosa. UI-Boxen = kompakt.`;
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
