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
    'phase.preOutbreak.desc': 'Die Welt ist noch normal. Erste mysteriöse Berichte tauchen auf. Gerüchte, seltsame Krankheitsfälle. Niemand glaubt es — noch nicht. (~1 Woche bis zum Ausbruch)',
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
    'loc.suburb.desc': 'Ruhiges Wohngebiet, Einfamilienhäuser, Nachbarschaften',
    'loc.rural': 'Ländlich',
    'loc.rural.desc': 'Bauernhöfe, Scheunen, weite Felder, abgelegen',
    'loc.industrial': 'Industriegebiet',
    'loc.industrial.desc': 'Fabriken, Lagerhallen, Werkstätten, Gleisanschluss',
    'loc.downtown': 'Innenstadt',
    'loc.downtown.desc': 'Hochhäuser, Büros, dichter Verkehr, viele Menschen',
    'loc.military': 'Militärbasis',
    'loc.military.desc': 'Kasernen, Übungsplätze, Waffenlager, Sicherheitszonen',
    'loc.forest': 'Waldgebiet',
    'loc.forest.desc': 'Dichter Wald, Wanderwege, Jagdhütten, Natur pur',
    'loc.hospital': 'Krankenhaus',
    'loc.hospital.desc': 'Großklinik, Notaufnahme, Labore, viel Betrieb',
    'loc.mall': 'Einkaufszentrum',
    'loc.mall.desc': 'Geschäfte, Food Court, Parkhaus, immer belebt',

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
    'bg.soldier': 'Soldat',
    'bg.soldier.desc': 'Kampferfahrung, Waffen, taktisches Denken',
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
    'quick.worldClocks': '🌍 Welt',
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
    'settings.music': '🎵 Musik',
    'settings.musicEnabled': 'Hintergrundmusik aktiv',
    'settings.musicVolume': 'Lautstärke:',
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

    // FAQ
    'faq.button': '❓ FAQ',
    'faq.title': '❓ FAQ',
    'faq.whatIsTitle': 'Was ist DEADZONE?',
    'faq.whatIsText': 'DEADZONE ist ein textbasiertes AI Zombie Survival RPG. Eine KI übernimmt die Rolle des Spielleiters und erzählt deine Geschichte in Echtzeit. Jeder Durchlauf ist einzigartig.',
    'faq.apiKeyTitle': 'Was ist ein API-Key?',
    'faq.apiKeyText': 'Du brauchst einen OpenRouter API-Key um zu spielen. OpenRouter verbindet dich mit verschiedenen KI-Modellen. Erstelle einen kostenlosen Account auf openrouter.ai/keys und kopiere deinen Key.',
    'faq.costTitle': 'Was kostet das Spiel?',
    'faq.costText': 'DEADZONE selbst ist kostenlos. Du zahlst nur die API-Kosten an OpenRouter — typisch $0.01–0.05 pro Nachricht je nach Modell. Mit Llama 3.3 (Free) ist es komplett kostenlos. Die aktuellen Kosten siehst du oben rechts im Spiel.',
    'faq.modelsTitle': 'Welches Modell soll ich wählen?',
    'faq.modelsText': 'DeepSeek V3.2 bietet das beste Preis-Leistungs-Verhältnis. Llama 3.3 ist komplett kostenlos, aber etwas weniger kreativ. Für das beste Rollenspiel-Erlebnis empfehlen wir Qwen 3.6 Plus oder Aion-RP.',
    'faq.featuresTitle': 'Features',
    'faq.featuresText': '<b>🎭 Dynamische Story</b> — Jede Entscheidung beeinflusst die Handlung<br><b>⏰ Echtzeit-Zeitverlauf</b> — Uhrzeit, Wetter und Tageszeit ändern sich realistisch<br><b>🎒 Inventar & Status</b> — Hunger, Müdigkeit, Verletzungen werden getrackt<br><b>👥 NPCs & Gruppen</b> — Triff Überlebende, bilde Gruppen, handle<br><b>🗺️ Karte & Orte</b> — Erkunde verschiedene Locations<br><b>📓 Notizbuch</b> — Wichtige Entdeckungen werden automatisch gespeichert<br><b>🌍 DE/EN</b> — Vollständig auf Deutsch und Englisch spielbar',
    'faq.quickButtonsTitle': 'Quick Buttons',
    'faq.quickButtonsText': 'Die Buttons unter dem Chat (Status, Inventar, Karte, Gruppe, Basis, Notizbuch) senden automatisch den passenden Befehl an die KI. Du kannst aber auch frei tippen was du willst.',
    'faq.saveTitle': 'Speichern & Laden',
    'faq.saveText': 'Dein Spielstand wird automatisch nach jeder Nachricht gespeichert (IndexedDB im Browser). Über die Einstellungen kannst du manuell speichern, exportieren (.deadzone Datei) oder mehrere Spielstände verwalten.',
    'faq.contextTitle': '🔧 Context Rotation (technisch)',
    'faq.contextText': 'KI-Modelle haben begrenzte Kontextfenster. Nach 20 Nachrichten wird die bisherige Konversation von der KI zusammengefasst und als „Master Summary" gespeichert. Dann startet ein neuer Kontext mit dieser Zusammenfassung. So bleibt die KI performant und vergisst trotzdem nichts Wichtiges. Dieser Vorgang passiert automatisch im Hintergrund.',
    'faq.outbreakTitle': 'Vor dem Ausbruch — Modus',
    'faq.outbreakText': 'Wenn du „Vor dem Ausbruch" wählst, startet die Welt noch normal. Der Zombie-Ausbruch beginnt zufällig zwischen Tag 4–8. Du weißt nicht genau wann — aber die Spannung steigt jeden Tag.',
    'faq.privacyTitle': 'Datenschutz',
    'faq.privacyText': 'Alle Daten bleiben lokal in deinem Browser (IndexedDB + localStorage). DEADZONE hat keinen eigenen Server. Dein API-Key wird nur direkt an OpenRouter gesendet.',

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
    // World Clocks
    'worldClocks.title': '🌍 Welt-Ereignisse',
    'worldClocks.empty': 'Keine aktiven Ereignisse',

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
    'phase.preOutbreak.desc': 'The world is still normal. First mysterious reports surface. Rumors, strange illnesses. Nobody believes it — not yet. (~1 week until the outbreak)',
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
    'loc.suburb.desc': 'Quiet residential area, family homes, neighborhoods',
    'loc.rural': 'Rural',
    'loc.rural.desc': 'Farmsteads, barns, open fields, remote location',
    'loc.industrial': 'Industrial Zone',
    'loc.industrial.desc': 'Factories, warehouses, workshops, rail connections',
    'loc.downtown': 'Downtown',
    'loc.downtown.desc': 'High-rises, offices, dense traffic, many people',
    'loc.military': 'Military Base',
    'loc.military.desc': 'Barracks, training grounds, armory, secure zones',
    'loc.forest': 'Forest',
    'loc.forest.desc': 'Dense woodland, hiking trails, hunting lodges, nature',
    'loc.hospital': 'Hospital',
    'loc.hospital.desc': 'Large clinic, ER, laboratories, busy operation',
    'loc.mall': 'Shopping Mall',
    'loc.mall.desc': 'Shops, food court, parking garage, always busy',

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
    'bg.soldier': 'Soldier',
    'bg.soldier.desc': 'Combat experience, weapons, tactical thinking',
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
    'quick.worldClocks': '🌍 World',
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
    'settings.music': '🎵 Music',
    'settings.musicEnabled': 'Background music active',
    'settings.musicVolume': 'Volume:',
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

    // FAQ
    'faq.button': '❓ FAQ',
    'faq.title': '❓ FAQ',
    'faq.whatIsTitle': 'What is DEADZONE?',
    'faq.whatIsText': 'DEADZONE is a text-based AI Zombie Survival RPG. An AI takes the role of game master and narrates your story in real-time. Every playthrough is unique.',
    'faq.apiKeyTitle': 'What is an API key?',
    'faq.apiKeyText': 'You need an OpenRouter API key to play. OpenRouter connects you to various AI models. Create a free account at openrouter.ai/keys and copy your key.',
    'faq.costTitle': 'How much does it cost?',
    'faq.costText': 'DEADZONE itself is free. You only pay API costs to OpenRouter — typically $0.01–0.05 per message depending on the model. With Llama 3.3 (Free) it\'s completely free. Current costs are shown in the top right during gameplay.',
    'faq.modelsTitle': 'Which model should I choose?',
    'faq.modelsText': 'DeepSeek V3.2 offers the best value. Llama 3.3 is completely free but slightly less creative. For the best roleplay experience, we recommend Qwen 3.6 Plus or Aion-RP.',
    'faq.featuresTitle': 'Features',
    'faq.featuresText': '<b>🎭 Dynamic Story</b> — Every decision shapes the narrative<br><b>⏰ Real-time Progression</b> — Time, weather, and day cycle change realistically<br><b>🎒 Inventory & Status</b> — Hunger, fatigue, injuries are tracked<br><b>👥 NPCs & Groups</b> — Meet survivors, form groups, trade<br><b>🗺️ Map & Locations</b> — Explore different locations<br><b>📓 Notebook</b> — Important discoveries are saved automatically<br><b>🌍 DE/EN</b> — Fully playable in German and English',
    'faq.quickButtonsTitle': 'Quick Buttons',
    'faq.quickButtonsText': 'The buttons below the chat (Status, Inventory, Map, Group, Base, Notebook) automatically send the matching command to the AI. You can also freely type whatever you want.',
    'faq.saveTitle': 'Save & Load',
    'faq.saveText': 'Your game is automatically saved after every message (IndexedDB in browser). Via settings you can manually save, export (.deadzone file), or manage multiple saves.',
    'faq.contextTitle': '🔧 Context Rotation (technical)',
    'faq.contextText': 'AI models have limited context windows. After 20 messages, the conversation is summarized by the AI and stored as a "Master Summary". Then a new context starts with this summary. This keeps the AI performant while retaining all important information. This process happens automatically in the background.',
    'faq.outbreakTitle': 'Pre-Outbreak Mode',
    'faq.outbreakText': 'If you choose "Before the Outbreak", the world starts normally. The zombie outbreak begins randomly between day 4–8. You don\'t know exactly when — but the tension rises every day.',
    'faq.privacyTitle': 'Privacy',
    'faq.privacyText': 'All data stays local in your browser (IndexedDB + localStorage). DEADZONE has no server. Your API key is only sent directly to OpenRouter.',

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
    // World Clocks
    'worldClocks.title': '🌍 World Events',
    'worldClocks.empty': 'No active events',

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
