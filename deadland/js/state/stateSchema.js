// DEADZONE — State Schema (YAML Templates for new games)

export const PHASE_LABELS = {
  pre_outbreak: 'Vor dem Ausbruch',
  outbreak: 'Der Ausbruch',
  early_apocalypse: 'Frühe Apokalypse',
  years_later: 'Jahre danach'
};

export const PHASE_CONTEXTS = {
  pre_outbreak: `Phase: Vor dem Ausbruch (~1 Woche vor Tag 0)
WICHTIG: Die Welt ist VOLLSTÄNDIG NORMAL und FUNKTIONIERT. Es gibt KEINE Zerstörung, KEINE verlassenen Orte, KEINE Apokalypse-Anzeichen.
- Alle Orte sind AKTIV und BEVÖLKERT: Militärbasen im Normalbetrieb mit Soldaten, Krankenhäuser behandeln normale Patienten, Einkaufszentren voller Kunden, Straßen mit Verkehr, Schulen und Büros geöffnet.
- Strom, Internet, Handynetz, Wasserversorgung — alles funktioniert einwandfrei.
- Polizei, Feuerwehr, Militär — alles im regulären Dienst.
- Geschäfte offen, Regale voll, Lieferketten intakt.
- NUR subtile Hinweise auf etwas Ungewöhnliches: merkwürdige Nachrichtenberichte, ein ungewöhnlich krankes Tier, ein seltsamer Vorfall — aber nichts Offensichtliches.
Der Spieler hat genau 7 Spieltage bis zum Ausbruch.
Einzigartige Mechanik: Glaubwürdigkeits-System.
Ton: Alltägliche Normalität mit unterschwelliger Paranoia. Die Welt fühlt sich NORMAL an — das ist der Horror.

### INFRASTRUKTUR-VERFALL (Pre-Outbreak → Outbreak Übergang)
Die Infrastruktur ist zu Beginn VOLL FUNKTIONSFÄHIG und verfällt erst mit dem Ausbruch.
Verfall-Timeline (automatisch, passiert im Hintergrund — IMMER im state_update aktualisieren):
- Tage 1-3: ALLES NORMAL. Strom stabil, Wasser stabil, Handynetz normal, TV/Radio Normalprogramm.
- Tag 3-4: Erste SUBTILE Anzeichen: Handynetz zeitweise überlastet, vermehrte Polizeisirenen, Nachrichten berichten über "Grippewelle".
- Tag 5-6 (kurz vor Ausbruch): Handynetz instabil, Internet langsam, TV zeigt Sondersendungen, Supermärkte beginnen sich zu leeren (Hamsterkäufe), Krankenhäuser voll.
- Ausbruch-Tag: Strom flackert, Handynetz bricht zusammen, Notfallsendungen im TV/Radio, Sirenen, Polizei überfordert.
WICHTIG: Der Verfall muss SCHLEICHEND sein. Der Spieler merkt es an kleinen Details (Handy hat plötzlich kein Signal, Supermarktregale teilweise leer, längere Wartezeiten im Krankenhaus).`,

  outbreak: `Phase: Der Ausbruch (Tag 0 bis Tag 7)
Chaos, Panik, zusammenbrechende Ordnung. Militär versucht zu kontrollieren.
Sirenen, Explosionen, Menschenmassen, erste Zombies auf den Straßen.
Handynetze brechen zusammen, Strom flackert, Supermärkte werden gestürmt.
Einzigartige Mechanik: Echtzeit-Eskalation — Chaos steigert sich mit jeder Stunde.
Ton: Adrenalin, Panik, Schockmomente, alles geht schnell.

### INFRASTRUKTUR-VERFALL (Outbreak-Phase)
Die Infrastruktur zerfällt während des Ausbruchs systematisch — IMMER im state_update aktualisieren:
- Tag 1-2: Strom flackert (Brownouts), Handynetz überlastet (Anrufe gehen nicht durch), TV/Radio nur noch Notfallsendungen, Supermärkte werden gestürmt, Krankenhäuser kollabieren.
- Tag 3-4: Strom fällt in ganzen Stadtteilen aus, Handynetz tot (nur noch SMS sporadisch), Wasser hat wenig Druck, Polizei zieht sich zurück, Militär übernimmt Straßensperren.
- Tag 5-6: Strom nur noch in Gebieten mit Generatoren, Wasserversorgung bricht zusammen, kein Handynetz, kein Internet. Supermärkte geplündert und leer. Krankenhäuser aufgegeben.
- Tag 7+: ALLES AUS. Kompletter Infrastruktur-Kollaps. Dunkelheit nachts, kein fließend Wasser, totale Funkstille. Übergang zu "Frühe Apokalypse".
WICHTIG: Nutze die <ui:radio> Box für Notfallsendungen, Militärfunk und letzte Broadcasts bevor Sender verstummen.`,

  early_apocalypse: `Phase: Frühe Apokalypse (Wochen nach dem Ausbruch)
Zivilisation zusammengebrochen. Strom aus, Geschäfte geplündert.
Überlebende bilden erste Gruppen. Zombies überall.
Ressourcen noch findbar aber umkämpft. Zombies in Höchstzahl.
Einzigartige Mechanik: Gründungsphase — Spieler prägt Gemeinschaft.
Ton: Dreckig, verzweifelt, aber mit Funken von Hoffnung.`,

  years_later: `Phase: Jahre danach (Jahr 2+)
Natur erobert Städte zurück. Feste Siedlungen, Händler-Routen.
Zombies noch da aber berechenbar. Menschen die wahre Gefahr.
Etablierte Siedlungen mit Mauern, Landwirtschaft, primitiver Infrastruktur.
Einzigartige Mechaniken: Diplomatie, Siedlungs-Management, Expeditionen.
Ton: Western-Atmosphäre trifft Post-Apokalypse, politische Intrigen.`
};

export function createInitialSummary(characterName, phase, location) {
  return `# DEADZONE — MASTER-ZUSAMMENFASSUNG
charakter_name: "${characterName}"
phase: "${PHASE_LABELS[phase]}"
startort: "${location}"
aktueller_tag: 1
sessions_gespielt: 0

zusammenfassung: |
  Spielbeginn. Keine bisherigen Events.

wichtige_entscheidungen: []
veränderungen: {}
offene_fäden: []
bedrohungen: []

world_clocks: {}
`;
}

export function createInitialCharacter(characterName) {
  return `# CHARAKTER
name: "${characterName}"
zustand: unversehrt
psyche: normal
hunger: satt
durst: hydriert
müdigkeit: ausgeruht
temperatur: normal
impact_track: unharmed
willpower_points: 3

tags: []
negative_tags: []

inventar:
  rucksack: []
  am_körper: []
  kapazität: 0

notizen: ""
`;
}

export function createInitialNotebook(characterName) {
  return `# NOTIZBUCH — ${characterName}
meta:
  besitzer: "${characterName}"
  begonnen: 1
  aktueller_tag: 1

zombie_lexikon: {}
überlebenshandbuch: {}
ortsregister: {}
personenverzeichnis: {}
tagebuch: []
eigene_notizen: []
`;
}

// Infrastructure status by phase
export const INFRASTRUCTURE_DEFAULTS = {
  pre_outbreak: {
    strom: 'stabil',
    wasser: 'stabil',
    handynetz: 'stabil',
    internet: 'stabil',
    tv_radio: 'normalbetrieb',
    polizei: 'aktiv',
    krankenhaus: 'normalbetrieb',
    supermärkte: 'voll_bestückt'
  },
  outbreak: {
    strom: 'stabil',
    wasser: 'stabil',
    handynetz: 'überlastet',
    internet: 'langsam',
    tv_radio: 'notfallsendungen',
    polizei: 'überlastet',
    krankenhaus: 'überfüllt',
    supermärkte: 'hamsterkäufe'
  },
  early_apocalypse: {
    strom: 'aus',
    wasser: 'aus',
    handynetz: 'tot',
    internet: 'tot',
    tv_radio: 'nur_notsender',
    polizei: 'aufgelöst',
    krankenhaus: 'geplündert',
    supermärkte: 'geplündert'
  },
  years_later: {
    strom: 'aus',
    wasser: 'aus',
    handynetz: 'tot',
    internet: 'tot',
    tv_radio: 'tot',
    polizei: 'aufgelöst',
    krankenhaus: 'ruine',
    supermärkte: 'ruine'
  }
};

export function createInitialWorldState(phase, location) {
  return `# WELTZUSTAND
phase: "${PHASE_LABELS[phase]}"
ort: "${location}"
tag: 1
tageszeit: morgen
wetter: "bewölkt"
temperatur: "15"

world_clocks: {}
globale_events: []
`;
}

export function createInitialGroup() {
  return `# GRUPPE
mitglieder: []
`;
}

export function createInitialBase() {
  return `# BASIS
status: keine
`;
}
