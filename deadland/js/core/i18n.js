// DEADZONE — Internationalization (DE/EN)

const translations = {
  de: {
    // Setup screen
    'setup.subtitle': 'AI Zombie Survival RPG',
    'setup.desc': 'Dieses Spiel benötigt einen OpenRouter API-Key.<br>Du findest deinen Key auf:',
    'setup.apiLabel': 'API Key:',
    'setup.apiHint': 'OpenRouter-Keys beginnen mit sk-or-v1-',
    'setup.saveKey': 'Key im Browser speichern (localStorage)',
    'setup.resume': 'Letzten Spielstand fortsetzen',
    'setup.newGame': 'Neues Spiel / Modell wählen',

    // Model screen
    'model.title': 'Modell-Auswahl',
    'model.pricePerf': 'PREIS-LEISTUNG',
    'model.performance': 'PERFORMANCE',
    'model.specialist': 'SPEZIALIST & KOSTENLOS',
    'model.advanced': 'ERWEITERT',
    'model.deepseek.desc': 'Preis-Leistungs-König — ~90% GPT-5.4-Qualität zu 1/50 der Kosten. Sparse Attention senkt Kosten bei langen Sessions.',
    'model.qwen.desc': 'Lineare Attention + Sparse MoE. Bis 1M Token Kontext — ideal für lange Kampagnen mit konsistenten Storylines.',
    'model.nemotron.desc': 'Hybrid-MoE: 120B Parameter, nur 12B aktiv. 50%+ schnellere Token-Generierung. Flüssiges, schnelles RP.',
    'model.aion.desc': 'Speziell für Roleplay trainiert. Hält Charakter-Stimmen und Handlungsstränge zuverlässig aufrecht.',
    'model.llama.desc': 'Komplett kostenlos! GPT-4-Niveau. Beste Wahl für Einstieg oder Budget null.',
    'model.llama.price': 'Kostenlos',
    'model.custom': 'Beliebiges OpenRouter-Modell',
    'model.customPlaceholder': 'z.B. openai/gpt-4o',
    'btn.back': 'Zurück',
    'btn.next': 'Weiter',

    // Savegame screen
    'saves.title': 'Spielstand-Verwaltung',
    'saves.newGame': 'Neues Spiel starten',
    'saves.import': 'Spielstand importieren (.deadzone)',

    // Wizard Step 1: World State
    'wizard.worldState': 'Welt-Zustand wählen',
    'wizard.worldStateDesc': 'In welcher Phase der Apokalypse beginnt deine Geschichte?',
    'phase.preOutbreak': 'Vor dem Ausbruch',
    'phase.preOutbreak.desc': 'Die Welt ist noch normal. Erste mysteriöse Berichte tauchen auf. Gerüchte, seltsame Krankheitsfälle. Niemand glaubt es — noch nicht.',
    'phase.outbreak': 'Ausbruch',
    'phase.outbreak.desc': 'Die Infektion breitet sich aus. Chaos, Panik, zusammenbrechende Ordnung. Militär versucht zu kontrollieren. Tag 0 bis Tag 7.',
    'phase.earlyApocalypse': 'Frühe Apokalypse',
    'phase.earlyApocalypse.desc': 'Wochen nach dem Ausbruch. Zivilisation zusammengebrochen. Strom fällt aus, Geschäfte geplündert. Zombies überall.',
    'phase.yearsLater': 'Jahre danach',
    'phase.yearsLater.desc': 'Natur erobert Städte zurück. Feste Siedlungen, Händler-Routen, brutale Fraktionen. Menschen sind die wahre Gefahr.',

    // Wizard Step 2: Location
    'wizard.location': 'Startort wählen',
    'wizard.locationDesc': 'Wo beginnt eure Geschichte?',
    'loc.suburb': 'Vorstadt',
    'loc.suburb.desc': 'Wohngebiet, viele Häuser zum Plündern, moderate Zombies',
    'loc.rural': 'Ländlich',
    'loc.rural.desc': 'Farmen, Scheunen, wenig Zombies, weite Wege',
    'loc.industrial': 'Industriegebiet',
    'loc.industrial.desc': 'Fabriken, Werkstätten, Materialien, viele Zombies',
    'loc.downtown': 'Innenstadt',
    'loc.downtown.desc': 'Hochhäuser, extrem gefährlich, beste Beute',
    'loc.military': 'Militärbasis',
    'loc.military.desc': 'Waffen, Munition, starke Zombies, Blockaden',
    'loc.forest': 'Waldgebiet',
    'loc.forest.desc': 'Natur, Jagd, versteckt, wenig Vorräte',
    'loc.hospital': 'Krankenhaus',
    'loc.hospital.desc': 'Medizin, aber Zombie-Hotspot, Infektionsgefahr',
    'loc.mall': 'Einkaufszentrum',
    'loc.mall.desc': 'Vorräte, Kleidung, verteidigbar, aber umzingelt',

    // Wizard Step 3: Character
    'wizard.character': 'Charakter erstellen',
    'wizard.characterDesc': 'Wer bist du in dieser Welt?',
    'char.name': 'Name',
    'char.namePlaceholder': 'z.B. James Cole / Elena Voss',
    'char.gender': 'Geschlecht',
    'char.male': 'Männlich',
    'char.female': 'Weiblich',
    'char.background': 'Hintergrund wählen',
    'char.backgroundDesc': 'Dein Beruf vor dem Ausbruch beeinflusst Stärken, Schwächen und Startausrüstung.',
    'char.backstory': 'Hintergrundgeschichte (optional)',
    'char.backstoryPlaceholder': 'Was hat dein Charakter erlebt? Was treibt ihn an? Dies beeinflusst den Spielstart...',
    'btn.startGame': 'Spiel starten',

    // Backgrounds
    'bg.exSoldier': 'Ex-Soldat',
    'bg.exSoldier.desc': 'Kampferfahrung, Waffen, taktisches Denken',
    'bg.doctor': 'Arzt',
    'bg.doctor.desc': 'Medizin, Wundversorgung, analytisch',
    'bg.mechanic': 'Mechaniker',
    'bg.mechanic.desc': 'Reparatur, Improvisation, handwerklich',
    'bg.teacher': 'Lehrer',
    'bg.teacher.desc': 'Führung, Allgemeinwissen, Motivation',
    'bg.paramedic': 'Sanitäter',
    'bg.paramedic.desc': 'Erste Hilfe unter Druck, belastbar',
    'bg.farmer': 'Farmer',
    'bg.farmer.desc': 'Ausdauer, Nahrungswissen, zäh',
    'bg.police': 'Polizist',
    'bg.police.desc': 'Schusswaffen, Nahkampf, Autorität',
    'bg.scientist': 'Wissenschaftler',
    'bg.scientist.desc': 'Analytisch, Infektionswissen, klug',

    // Top bar
    'topbar.save': '💾 Speichern',
    'topbar.day': 'Tag',

    // Input
    'input.placeholder': 'Was tust du?',
    'input.send': 'Senden',

    // Quick buttons
    'quick.status': 'Status',
    'quick.inventory': 'Inventar',
    'quick.map': 'Karte',
    'quick.group': 'Gruppe',
    'quick.base': 'Basis',
    'quick.notebook': 'Notizbuch',
    'quick.settings': 'Einstellungen',

    // Settings
    'settings.title': 'Einstellungen',
    'settings.model': 'Modell:',
    'settings.forgetKey': 'Gespeicherten API Key löschen',
    'settings.budgetLimit': 'Budget-Limit ($):',
    'settings.saveSection': 'Spielstand',
    'settings.save': 'Speichern',
    'settings.export': 'Exportieren (.deadzone)',
    'settings.loadManage': 'Laden / Verwalten',
    'settings.sessionInfo': 'Session-Info',
    'settings.close': 'Schließen',

    // Loading
    'loading.default': 'Lade...',
    'loading.charGen': 'Charakter wird generiert...',
    'loading.gameCreate': 'Spiel wird erstellt...',
    'loading.saveLoad': 'Spielstand wird geladen...',

    // Language
    'lang.label': 'Sprache:',
    'lang.de': 'Deutsch',
    'lang.en': 'English',

    // Alerts
    'alert.noLocation': 'Bitte wähle einen Startort oder gib einen eigenen ein.',
    'alert.noName': 'Bitte gib einen Charakternamen ein.',

    // System messages
    'sys.contextRotated': 'Kontext rotiert. Session zusammengefasst. Neuer Kontext geladen.',
    'sys.minimalMode': 'Minimaler UI-Modus aktiviert.',
    'sys.fullMode': 'Voller UI-Modus aktiviert.',
    'sys.unknownCommand': 'Unbekannter Befehl',
    'sys.gameSaved': 'Spielstand gespeichert.',
    'sys.saveFailed': 'Speichern fehlgeschlagen',
    'sys.gameExported': 'Spielstand exportiert.',
    'sys.exportFailed': 'Export fehlgeschlagen',
    'sys.saving': 'Speichere...',
    'sys.startFailed': 'Fehler beim Spielstart',
    'sys.loadFailed': 'Fehler beim Laden',
    'sys.importFailed': 'Import fehlgeschlagen',
    'sys.bootError': 'DEADZONE — Fehler',
    'sys.apiError': 'API-Fehler',
    'sys.gameLoaded': 'Spielstand geladen',
    'sys.gameImported': 'Spielstand importiert',

    // API errors
    'api.invalidKey': 'API-Key ungültig oder nicht erkannt. OpenRouter-Keys beginnen mit sk-or-v1-. Bitte prüfe deinen Key auf openrouter.ai/keys',
    'api.noCredit': 'Kein Guthaben auf OpenRouter. Bitte aufladen.',
    'api.rateLimit': 'Server ausgelastet. Bitte kurz warten.',
    'api.serverDown': 'OpenRouter nicht erreichbar. Spielstand ist gesichert.',
    'api.genericError': 'API-Fehler',
    'api.keyTooShort': 'API-Key zu kurz. Bitte prüfen.',
    'api.noKeySet': 'Kein API-Key gesetzt. Bitte Key eingeben.',
    'sys.budgetExceeded': 'Budget-Limit erreicht! Erhöhe das Limit in den Einstellungen oder exportiere deinen Spielstand.',
    'sys.enterApiKey': 'Bitte zuerst API-Key eingeben.',
    'sys.enterModelId': 'Bitte Modell-ID eingeben.',
    'sys.confirmDelete': 'Spielstand wirklich löschen?',
    'sys.importing': 'Importiere Spielstand...',
    'sys.saveNotFound': 'Spielstand nicht gefunden',

    // Time of day
    'time.deepNight': 'Tiefe Nacht',
    'time.dawn': 'Morgendämmerung',
    'time.morning': 'Morgen',
    'time.noon': 'Mittag',
    'time.afternoon': 'Nachmittag',
    'time.evening': 'Abend',
    'time.night': 'Nacht',
  },

  en: {
    // Setup screen
    'setup.subtitle': 'AI Zombie Survival RPG',
    'setup.desc': 'This game requires an OpenRouter API key.<br>Get your key at:',
    'setup.apiLabel': 'API Key:',
    'setup.apiHint': 'OpenRouter keys start with sk-or-v1-',
    'setup.saveKey': 'Save key in browser (localStorage)',
    'setup.resume': 'Resume last save',
    'setup.newGame': 'New Game / Choose Model',

    // Model screen
    'model.title': 'Model Selection',
    'model.pricePerf': 'VALUE',
    'model.performance': 'PERFORMANCE',
    'model.specialist': 'SPECIALIST & FREE',
    'model.advanced': 'ADVANCED',
    'model.deepseek.desc': 'Best value — ~90% GPT-5.4 quality at 1/50 the cost. Sparse Attention reduces cost for long sessions.',
    'model.qwen.desc': 'Linear Attention + Sparse MoE. Up to 1M token context — ideal for long campaigns with consistent storylines.',
    'model.nemotron.desc': 'Hybrid-MoE: 120B parameters, only 12B active. 50%+ faster token generation. Smooth, fast RP.',
    'model.aion.desc': 'Specifically trained for roleplay. Reliably maintains character voices and plot threads.',
    'model.llama.desc': 'Completely free! GPT-4 level. Best choice for getting started or zero budget.',
    'model.llama.price': 'Free',
    'model.custom': 'Any OpenRouter Model',
    'model.customPlaceholder': 'e.g. openai/gpt-4o',
    'btn.back': 'Back',
    'btn.next': 'Next',

    // Savegame screen
    'saves.title': 'Save Management',
    'saves.newGame': 'Start New Game',
    'saves.import': 'Import save (.deadzone)',

    // Wizard Step 1: World State
    'wizard.worldState': 'Choose World State',
    'wizard.worldStateDesc': 'In which phase of the apocalypse does your story begin?',
    'phase.preOutbreak': 'Before the Outbreak',
    'phase.preOutbreak.desc': 'The world is still normal. First mysterious reports surface. Rumors, strange illnesses. Nobody believes it — not yet.',
    'phase.outbreak': 'Outbreak',
    'phase.outbreak.desc': 'The infection is spreading. Chaos, panic, collapsing order. Military tries to contain it. Day 0 to Day 7.',
    'phase.earlyApocalypse': 'Early Apocalypse',
    'phase.earlyApocalypse.desc': 'Weeks after the outbreak. Civilization has collapsed. Power is out, stores looted. Zombies everywhere.',
    'phase.yearsLater': 'Years Later',
    'phase.yearsLater.desc': 'Nature reclaims cities. Established settlements, trade routes, brutal factions. Humans are the real danger.',

    // Wizard Step 2: Location
    'wizard.location': 'Choose Starting Location',
    'wizard.locationDesc': 'Where does your story begin?',
    'loc.suburb': 'Suburbs',
    'loc.suburb.desc': 'Residential area, many houses to loot, moderate zombies',
    'loc.rural': 'Rural',
    'loc.rural.desc': 'Farms, barns, few zombies, long distances',
    'loc.industrial': 'Industrial Zone',
    'loc.industrial.desc': 'Factories, workshops, materials, many zombies',
    'loc.downtown': 'Downtown',
    'loc.downtown.desc': 'High-rises, extremely dangerous, best loot',
    'loc.military': 'Military Base',
    'loc.military.desc': 'Weapons, ammo, strong zombies, blockades',
    'loc.forest': 'Forest',
    'loc.forest.desc': 'Nature, hunting, hidden, few supplies',
    'loc.hospital': 'Hospital',
    'loc.hospital.desc': 'Medicine, but zombie hotspot, infection risk',
    'loc.mall': 'Shopping Mall',
    'loc.mall.desc': 'Supplies, clothing, defensible, but surrounded',

    // Wizard Step 3: Character
    'wizard.character': 'Create Character',
    'wizard.characterDesc': 'Who are you in this world?',
    'char.name': 'Name',
    'char.namePlaceholder': 'e.g. James Cole / Elena Voss',
    'char.gender': 'Gender',
    'char.male': 'Male',
    'char.female': 'Female',
    'char.background': 'Choose Background',
    'char.backgroundDesc': 'Your pre-outbreak profession affects strengths, weaknesses, and starting gear.',
    'char.backstory': 'Backstory (optional)',
    'char.backstoryPlaceholder': 'What has your character experienced? What drives them? This influences the game start...',
    'btn.startGame': 'Start Game',

    // Backgrounds
    'bg.exSoldier': 'Ex-Soldier',
    'bg.exSoldier.desc': 'Combat experience, weapons, tactical thinking',
    'bg.doctor': 'Doctor',
    'bg.doctor.desc': 'Medicine, wound care, analytical',
    'bg.mechanic': 'Mechanic',
    'bg.mechanic.desc': 'Repair, improvisation, handy',
    'bg.teacher': 'Teacher',
    'bg.teacher.desc': 'Leadership, general knowledge, motivation',
    'bg.paramedic': 'Paramedic',
    'bg.paramedic.desc': 'First aid under pressure, resilient',
    'bg.farmer': 'Farmer',
    'bg.farmer.desc': 'Endurance, food knowledge, tough',
    'bg.police': 'Police Officer',
    'bg.police.desc': 'Firearms, close combat, authority',
    'bg.scientist': 'Scientist',
    'bg.scientist.desc': 'Analytical, infection knowledge, smart',

    // Top bar
    'topbar.save': '💾 Save',
    'topbar.day': 'Day',

    // Input
    'input.placeholder': 'What do you do?',
    'input.send': 'Send',

    // Quick buttons
    'quick.status': 'Status',
    'quick.inventory': 'Inventory',
    'quick.map': 'Map',
    'quick.group': 'Group',
    'quick.base': 'Base',
    'quick.notebook': 'Notebook',
    'quick.settings': 'Settings',

    // Settings
    'settings.title': 'Settings',
    'settings.model': 'Model:',
    'settings.forgetKey': 'Delete saved API key',
    'settings.budgetLimit': 'Budget Limit ($):',
    'settings.saveSection': 'Save Game',
    'settings.save': 'Save',
    'settings.export': 'Export (.deadzone)',
    'settings.loadManage': 'Load / Manage',
    'settings.sessionInfo': 'Session Info',
    'settings.close': 'Close',

    // Loading
    'loading.default': 'Loading...',
    'loading.charGen': 'Generating character...',
    'loading.gameCreate': 'Creating game...',
    'loading.saveLoad': 'Loading save...',

    // Language
    'lang.label': 'Language:',
    'lang.de': 'Deutsch',
    'lang.en': 'English',

    // Alerts
    'alert.noLocation': 'Please choose a starting location.',
    'alert.noName': 'Please enter a character name.',

    // System messages
    'sys.contextRotated': 'Context rotated. Session summarized. New context loaded.',
    'sys.minimalMode': 'Minimal UI mode activated.',
    'sys.fullMode': 'Full UI mode activated.',
    'sys.unknownCommand': 'Unknown command',
    'sys.gameSaved': 'Game saved.',
    'sys.saveFailed': 'Save failed',
    'sys.gameExported': 'Save exported.',
    'sys.exportFailed': 'Export failed',
    'sys.saving': 'Saving...',
    'sys.startFailed': 'Error starting game',
    'sys.loadFailed': 'Error loading save',
    'sys.importFailed': 'Import failed',
    'sys.bootError': 'DEADZONE — Error',
    'sys.apiError': 'API Error',
    'sys.gameLoaded': 'Save loaded',
    'sys.gameImported': 'Save imported',

    // API errors
    'api.invalidKey': 'API key invalid or not recognized. OpenRouter keys start with sk-or-v1-. Check your key at openrouter.ai/keys',
    'api.noCredit': 'No credit on OpenRouter. Please top up.',
    'api.rateLimit': 'Server busy. Please wait a moment.',
    'api.serverDown': 'OpenRouter unreachable. Save is safe.',
    'api.genericError': 'API Error',
    'api.keyTooShort': 'API key too short. Please check.',
    'api.noKeySet': 'No API key set. Please enter a key.',
    'sys.budgetExceeded': 'Budget limit reached! Increase the limit in settings or export your save.',
    'sys.enterApiKey': 'Please enter an API key first.',
    'sys.enterModelId': 'Please enter a model ID.',
    'sys.confirmDelete': 'Really delete this save?',
    'sys.importing': 'Importing save...',
    'sys.saveNotFound': 'Save not found',

    // Time of day
    'time.deepNight': 'Deep Night',
    'time.dawn': 'Dawn',
    'time.morning': 'Morning',
    'time.noon': 'Noon',
    'time.afternoon': 'Afternoon',
    'time.evening': 'Evening',
    'time.night': 'Night',
  }
};

class I18n {
  constructor() {
    this.lang = localStorage.getItem('deadzone_lang') || 'de';
  }

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('deadzone_lang', lang);
    document.documentElement.lang = lang;
    this.applyAll();
  }

  t(key) {
    return translations[this.lang]?.[key] || translations['de']?.[key] || key;
  }

  applyAll() {
    // Apply data-i18n text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
    // Apply data-i18n-html (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = this.t(el.dataset.i18nHtml);
    });
    // Apply data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    // Apply data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = this.t(el.dataset.i18nTitle);
    });
  }
}

export const i18n = new I18n();
