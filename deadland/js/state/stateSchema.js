// DEADZONE — State Schema (YAML Templates for new games)

export const PHASE_LABELS = {
  pre_outbreak: 'Vor dem Ausbruch',
  outbreak: 'Der Ausbruch',
  early_apocalypse: 'Frühe Apokalypse',
  years_later: 'Jahre danach'
};

export const PHASE_CONTEXTS = {
  pre_outbreak: `Phase: Vor dem Ausbruch (7 Tage vor Tag 0)
Die Welt funktioniert noch normal. Erste mysteriöse Berichte und Gerüchte.
Geschäfte offen, Strom an, Internet verfügbar, Polizei aktiv.
Der Spieler hat genau 7 Spieltage bis zum Ausbruch.
Einzigartige Mechanik: Glaubwürdigkeits-System.
Ton: Paranoia, Normalität die bröckelt, Kassandra-Gefühl.`,

  outbreak: `Phase: Der Ausbruch (Tag 0 bis Tag 7)
Chaos, Panik, zusammenbrechende Ordnung. Militär versucht zu kontrollieren.
Sirenen, Explosionen, Menschenmassen, erste Zombies auf den Straßen.
Handynetze brechen zusammen, Strom flackert, Supermärkte werden gestürmt.
Einzigartige Mechanik: Echtzeit-Eskalation — Chaos steigert sich mit jeder Stunde.
Ton: Adrenalin, Panik, Schockmomente, alles geht schnell.`,

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
