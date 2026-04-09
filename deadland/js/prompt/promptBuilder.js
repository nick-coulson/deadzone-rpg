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
  }

  setPhase(phase) { this.phase = phase; }
  setLocation(location) { this.location = location; }
  setOutbreakDay(day) { this.outbreakDay = day; }
  setInfrastructure(infra) { this.infrastructure = infra; }
  setWorldClocks(clocks) { this.worldClocks = clocks; }
  setCharacterStats(stats) { this.characterStats = stats; }
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
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n');
      parts.push(`## AKTUELLER INFRASTRUKTUR-STATUS\nDiese Werte spiegeln den JETZIGEN Zustand wider. Referenziere sie in Szenen-Beschreibungen (z.B. Licht flackert wenn Strom=flackernd, kein Handysignal wenn Handynetz=tot).\n\n${infraLines}\n\nAktualisiere den infrastruktur-Block im state_update wenn sich der Status ändert.`);
    }

    // 3c. World Clocks (active background events)
    if (this.worldClocks && Object.keys(this.worldClocks).length > 0) {
      const clockLines = Object.entries(this.worldClocks)
        .map(([k, v]) => `  ${k}: "${v}"`)
        .join('\n');
      parts.push(`## AKTIVE WORLD CLOCKS (Hintergrund-Events)\nDiese Prozesse laufen PARALLEL zur Spieler-Handlung. Referenziere sie wenn der Spieler etwas Relevantes tut oder bemerkt. Aktualisiere sie im state_update wenn sich ihr Status ändert.\n\n${clockLines}`);
    }

    // 4. Master summary (rolling history)
    if (this.masterSummary) {
      parts.push(`## MASTER-ZUSAMMENFASSUNG (bisheriger Spielverlauf)\n\n${this.masterSummary}`);
    }

    // 5. Character data
    if (this.characterData) {
      parts.push(`## CHARAKTER-DATEN\n\n${this.characterData}`);
    }

    // 5b. Character stats (numeric values)
    if (this.characterStats) {
      const s = this.characterStats;
      const statsText = `gesundheit: ${s.gesundheit ?? 10}/10\nhunger: ${s.hunger ?? 0}/10\ndurst: ${s.durst ?? 0}/10\nmüdigkeit: ${s.müdigkeit ?? 0}/10\npsyche: ${s.psyche ?? 10}/10`;
      parts.push(`## AKTUELLE CHARAKTER-WERTE\nDiese Werte sind die aktuellen numerischen Stats. Verwende sie als Basis für Beschreibungen und aktualisiere sie im state_update.\n\n${statsText}`);
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
  gesundheit: 10
  hunger: 0
  durst: 0
  müdigkeit: 0
  psyche: 10
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
world_clocks:
  clock_name: "status_beschreibung"
npcs: []${(this.phase === 'pre_outbreak' || this.phase === 'outbreak') ? `
infrastruktur:
  strom: "stabil|flackernd|brownouts|teilweise_aus|aus"
  wasser: "stabil|niedriger_druck|sporadisch|aus"
  handynetz: "stabil|überlastet|instabil|nur_sms|tot"
  internet: "stabil|langsam|instabil|tot"
  tv_radio: "normalbetrieb|sondersendungen|notfallsendungen|nur_notsender|tot"
  polizei: "aktiv|überlastet|rückzug|aufgelöst"
  krankenhaus: "normalbetrieb|überfüllt|notbetrieb|aufgegeben|geplündert"
  supermärkte: "voll_bestückt|hamsterkäufe|teilweise_leer|fast_leer|geplündert"` : ''}
</state_update>

Nur VERAENDERTE Felder eintragen. Leere Felder weglassen.

### CHARAKTER-STATUS (Numerisches System)
Alle Charakter-Werte verwenden eine Skala von 0-10:
- **gesundheit**: 10=unverletzt, 7=leichte Verletzungen, 4=schwer verwundet, 1=kritisch, 0=tot
- **hunger**: 0=satt, 3=leichter Hunger, 6=hungrig, 8=ausgehungert, 10=verhungernd
- **durst**: 0=hydriert, 3=leichter Durst, 6=durstig, 8=dehydriert, 10=verdurstet
- **müdigkeit**: 0=ausgeruht, 3=etwas müde, 6=müde, 8=erschöpft, 10=am Limit
- **psyche**: 10=stabil, 7=angespannt, 4=verängstigt, 2=panisch, 0=gebrochen

WICHTIG: Im state_update IMMER die AKTUELLEN ABSOLUTEN Werte angeben (nicht +/- Differenzen).
Bei Spielstart: gesundheit=10, hunger=0, durst=0, müdigkeit=0, psyche=10

Wenn der Spieler "Status" eingibt, verwende dieses FORMAT in der <ui:status> Box:
<ui:status>
gesundheit: 10/10 | Unverletzt
hunger: 2/10 | Leichter Hunger
durst: 1/10 | Hydriert
müdigkeit: 3/10 | Etwas müde
psyche: 8/10 | Angespannt
---
Zustand: Keine Verletzungen
Ausrüstung: [kurze Zusammenfassung]
</ui:status>
Das Format "wert/10 | Beschreibung" wird vom Client als Fortschrittsbalken gerendert. Die Zeilen nach "---" werden als Text dargestellt.

### ZEITMANAGEMENT
- Am Ende jeder Szene IMMER die vergangene Zeit realistisch abschätzen und im state_update als uhrzeit (neue absolute Uhrzeit), tag (aktueller Tag als Zahl) UND zeit_verbraucht eintragen.
- KRITISCH: Die Uhrzeit in der <ui:scene> Box, der <ui:time> Box UND im state_update (uhrzeit-Feld) MÜSSEN EXAKT IDENTISCH sein! Entscheide dich ZUERST auf eine Uhrzeit und verwende diese überall. Beispiel: Wenn du "10:15" wählst, dann MUSS überall "10:15" stehen — in der Szene, im Zeitstatus UND im state_update.
- WICHTIG: Das "tag" Feld im state_update MUSS immer den aktuellen Tag als Zahl enthalten (1, 2, 3...). Wenn Mitternacht überschritten wird, Tag um 1 erhöhen. Die <ui:time> Box und der state_update müssen IMMER denselben Tag zeigen!
- Die <ui:time> Box am Ende jeder Antwort anzeigen mit aktuellem Tag, Uhrzeit, Tageszeit und vergangener Zeit (z.B. "Tag 1 | 07:45 Morgen | +2h 45min vergangen"). WICHTIG: Immer ein Leerzeichen zwischen Stunden und Minuten (z.B. "2h 30min" NICHT "2h30min").
- Realistische Zeitschätzung: Kurze Gespräche ~5-10min, Erkundung eines Raumes ~15-30min, Plündern ~30-60min, Reisen zwischen Orten ~1-3h, Schlaf ~6-8h.

### WORLD CLOCKS (Hintergrund-Ereignisse)
World Clocks sind parallele Handlungsstränge, die UNABHÄNGIG vom Spieler ablaufen. Sie erzeugen eine lebendige Welt.
- Erstelle World Clocks für: NPC-Aktivitäten, nahende Bedrohungen, Wetter-Fronten, Gruppen-Bewegungen, Infrastruktur-Verfall, Gerüchte, Militär-Operationen etc.
- AKTUALISIERE bestehende Clocks bei jeder Antwort wenn sich etwas ändert (auch wenn der Spieler nicht direkt involviert ist — die Welt bewegt sich weiter!)
- ENTFERNE erledigte Clocks mit dem Wert "ABGESCHLOSSEN" oder "ERLEDIGT"
- Format im state_update: kurzer_name: "Kompakte Status-Beschreibung mit Zeitbezug"
- Beispiele:
  world_clocks:
    nachbar_flucht: "Tag 3: Familie Müller packt heimlich, Abreise geplant morgen früh"
    militaer_konvoi: "Konvoi passiert Autobahn A3 Richtung Süden, ETA 6h"
    stromausfall_bezirk: "Bezirk Ost seit 2h ohne Strom, Reparatur unklar"
    wolfsrudel: "ABGESCHLOSSEN"
- Clocks mit "ABGESCHLOSSEN" werden aus dem Panel entfernt
- Halte 3-8 aktive Clocks gleichzeitig für eine dynamische Welt

### ERZÄHLPERSPEKTIVE
KRITISCH: Erzähle IMMER in der ERSTEN PERSON (Ich-Perspektive). Der Spieler IST der Charakter.
- RICHTIG: "Meine Knie schmerzen vom geduckten Lauf. Ich zwänge mich zwischen den Birkenstämmen hindurch."
- FALSCH: "Ninas Knie schmerzen vom geduckten Lauf. Nina zwängt sich zwischen den Birkenstämmen hindurch."
- Verwende NIEMALS den Namen des Charakters in der Erzählung. Stattdessen immer "ich", "mein", "mir", "mich".
- Dies gilt für ALLE narrativen Texte, UI-Boxen, Statusbeschreibungen und Szenen. Ausnahme: NPCs dürfen den Spieler beim Namen ansprechen in Dialogen.

### SPRACHE
Spiele auf ${i18n.lang === 'en' ? 'Englisch (English)' : 'Deutsch (German)'}. Narrativer Text ist literarische Prosa in der Ich-Perspektive. UI-Boxen sind kompakt und informativ. ALLE Ausgaben (Erzählung, UI-Boxen, Status, Inventar) müssen in der gewählten Sprache sein.`;
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
