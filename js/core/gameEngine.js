// DEADZONE — Game Engine (main game loop, state machine)

import { apiClient } from '../api/openRouterClient.js';
import { costTracker } from '../api/costTracker.js';
import { promptBuilder } from '../prompt/promptBuilder.js';
import { contextManager } from '../prompt/contextManager.js';
import { saveManager } from '../state/saveManager.js';
import { renderer } from '../ui/renderer.js';
import { typewriter } from '../ui/typewriter.js';
import { InputHandler } from './inputHandler.js';
import { InputLine } from '../ui/inputLine.js';
import { eventBus } from './eventBus.js';
import { showOverlay, hideOverlay, showLoading, hideLoading } from '../ui/overlays.js';
import { exportSave } from '../state/exportImport.js';
import { PHASE_LABELS } from '../state/stateSchema.js';
import { parseResponse } from '../ui/responseParser.js';
import { i18n } from './i18n.js';
import { bgMusic } from '../ui/bgMusic.js';


// Game states
const STATE = {
  SETUP: 'SETUP',
  MODEL: 'MODEL',
  SAVEGAMES: 'SAVEGAMES',
  NEWGAME: 'NEWGAME',
  PLAYING: 'PLAYING'
};

class GameEngine {
  constructor() {
    this.state = STATE.SETUP;
    this.inputHandler = new InputHandler();
    this.inputLine = null;
    this.currentSave = null;
    this.isProcessing = false;
  }

  async init() {
    renderer.init();

    // Wire up input handler
    this.inputHandler.onSendToLLM = (input) => this.handlePlayerInput(input);
    this.inputHandler.onSystemCommand = (cmd) => this.handleSystemCommand(cmd);

    // Wire up event listeners
    this.setupEventListeners();

    // Sync character stats updates to prompt builder
    eventBus.on('characterstats:updated', (stats) => {
      promptBuilder.setCharacterStats(stats);
    });

    // Sync world clocks updates to prompt builder + UI panel
    eventBus.on('worldclocks:updated', (clocks) => {
      promptBuilder.setWorldClocks(clocks);
      this.renderWorldClocksPanel(clocks);
    });

    // Sync infrastructure updates to prompt builder
    eventBus.on('infrastructure:updated', (infra) => {
      promptBuilder.setInfrastructure(infra);
    });

    // Sync inventory updates to prompt builder
    eventBus.on('inventar:updated', (items) => {
      promptBuilder.setInventory(items);
    });

    // Check for saved API key
    const savedKey = localStorage.getItem('deadzone_api_key');
    if (savedKey) {
      document.getElementById('api-key-input').value = savedKey;
    }

    // Check for existing saves and show resume button
    const saves = await saveManager.listSaves();
    if (saves.length > 0) {
      this.lastSave = saves[0]; // Most recent save
      const resumeBtn = document.getElementById('btn-resume');
      if (resumeBtn) {
        resumeBtn.textContent = `Fortsetzen: ${this.lastSave.characterName} — Tag ${this.lastSave.currentDay || '?'}`;
        resumeBtn.classList.remove('hidden');
      }
    }

    // Load settings
    const scanlines = await saveManager.getSetting('scanlines');
    if (scanlines) document.body.classList.add('scanlines');

    const twEnabled = await saveManager.getSetting('typewriter');
    if (twEnabled !== undefined) typewriter.setEnabled(twEnabled);
    else typewriter.setEnabled(true);
  }

  // Safe event binding — logs missing elements instead of crashing
  _on(id, event, handler) {
    const el = document.getElementById(id);
    if (!el) { console.warn(`Element #${id} not found`); return; }
    el.addEventListener(event, handler);
  }

  setupEventListeners() {
    // === SETUP SCREEN ===
    this._on('btn-start', 'click', () => this.validateAndProceed());
    this._on('btn-resume', 'click', () => this.resumeLastGame());
    this._on('api-key-input', 'keydown', (e) => { if (e.key === 'Enter') this.validateAndProceed(); });

    // === MODEL SCREEN ===
    this._on('btn-model-back', 'click', () => this.showScreen('screen-setup'));
    this._on('btn-model-next', 'click', () => this.selectModel());

    // === SAVEGAME SCREEN ===
    this._on('btn-new-game', 'click', () => this.goToNewGame());
    this._on('import-file-input', 'change', (e) => this.handleImport(e));

    // === NEW GAME WIZARD ===
    this._on('btn-newgame-back', 'click', () => this.showScreen('screen-setup'));
    this._on('btn-start-game', 'click', () => this.startNewGame());

    // Wizard next/prev buttons
    document.querySelectorAll('.wizard-next').forEach(btn => {
      btn.addEventListener('click', () => this.wizardGoTo(parseInt(btn.dataset.next)));
    });
    document.querySelectorAll('.wizard-prev').forEach(btn => {
      btn.addEventListener('click', () => this.wizardGoTo(parseInt(btn.dataset.prev)));
    });

    // Location cards
    document.querySelectorAll('.location-card').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.location-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Gender presets
    document.querySelectorAll('.gender-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gender-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Auto-fill random name on gender change
        const nameInput = document.getElementById('character-name-input');
        if (nameInput) nameInput.value = this._pickRandomName();
      });
    });

    // Background cards
    document.querySelectorAll('.background-card').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.background-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // === QUICK BUTTONS ===
    document.querySelectorAll('.quick-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (this.inputLine) {
          this.inputLine.setCommand(cmd);
          this.inputLine.submit();
        }
      });
    });

    // === FAQ ===
    this._on('btn-faq-start', 'click', () => showOverlay('overlay-faq'));
    this._on('btn-faq-settings', 'click', () => { hideOverlay('overlay-settings'); showOverlay('overlay-faq'); });
    this._on('btn-close-faq', 'click', () => hideOverlay('overlay-faq'));
    this._on('overlay-faq', 'click', (e) => { if (e.target.id === 'overlay-faq') hideOverlay('overlay-faq'); });

    // === SETTINGS ===
    this._on('btn-settings', 'click', () => showOverlay('overlay-settings'));
    this._on('btn-close-settings', 'click', () => this.closeSettings());

    // Close settings by clicking outside the overlay content
    this._on('overlay-settings', 'click', (e) => {
      if (e.target.id === 'overlay-settings') this.closeSettings();
    });
    this._on('btn-forget-key', 'click', () => this.forgetApiKey());
    this._on('btn-save-game', 'click', () => this.manualSave());
    this._on('btn-topbar-save', 'click', () => this.manualSave());
    this._on('btn-export-game', 'click', () => this.exportCurrentGame());
    this._on('btn-load-game', 'click', () => {
      hideOverlay('overlay-settings');
      this.goToSavegames();
    });

    this._on('budget-limit-input', 'change', (e) => {
      costTracker.setBudgetLimit(parseFloat(e.target.value) || 0);
    });

    // === MUSIC SETTINGS ===
    this._on('settings-music-toggle', 'change', () => {
      bgMusic.toggle();
    });
    this._on('settings-music-volume', 'input', (e) => {
      const vol = parseInt(e.target.value) / 100;
      bgMusic.setVolume(vol);
      document.getElementById('music-volume-display').textContent = e.target.value + '%';
    });

    // Restore music settings on init
    const musicToggle = document.getElementById('settings-music-toggle');
    const musicVolume = document.getElementById('settings-music-volume');
    if (musicToggle) musicToggle.checked = bgMusic.isEnabled();
    if (musicVolume) {
      const vol = Math.round(bgMusic.getVolume() * 100);
      musicVolume.value = vol;
      document.getElementById('music-volume-display').textContent = vol + '%';
    }

    // Language switcher — setup screen buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        i18n.setLang(btn.dataset.lang);
        const langSelect = document.getElementById('settings-lang-select');
        if (langSelect) langSelect.value = btn.dataset.lang;
      });
    });

    // Language switcher — settings dropdown
    this._on('settings-lang-select', 'change', (e) => {
      i18n.setLang(e.target.value);
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === e.target.value);
      });
    });

    // Restore saved language on init
    const savedLang = localStorage.getItem('deadzone_lang') || 'de';
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === savedLang);
    });
    const langSelect = document.getElementById('settings-lang-select');
    if (langSelect) langSelect.value = savedLang;

    this._on('settings-model-select', 'change', (e) => {
      const newModel = e.target.value;
      apiClient.setModel(newModel);
      costTracker.setModel(newModel);
      if (this.state === STATE.PLAYING) {
        renderer.showSystemMessage(`Modell gewechselt zu: ${e.target.selectedOptions[0]?.textContent || newModel}`);
      }
    });

    // === KEYBOARD SHORTCUTS ===
    document.addEventListener('keydown', (e) => {
      if (this.state !== STATE.PLAYING) return;

      // Skip typewriter on space/click
      if (e.key === ' ' && document.activeElement !== document.getElementById('game-input')) {
        typewriter.skip();
        return;
      }

      // F-key shortcuts
      const fKeys = { F1: 'Status', F2: 'Inventar', F3: 'Karte', F4: 'Gruppe', F5: 'Basis', F6: 'Notizbuch' };
      if (fKeys[e.key]) {
        e.preventDefault();
        if (this.inputLine) {
          this.inputLine.setCommand(fKeys[e.key]);
          this.inputLine.submit();
        }
      }

      // F7: Toggle World Clocks panel
      if (e.key === 'F7') {
        e.preventDefault();
        this.toggleWorldClocksPanel();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        const overlay = document.getElementById('overlay-settings');
        if (overlay.classList.contains('hidden')) {
          showOverlay('overlay-settings');
        } else {
          this.closeSettings();
        }
      }
    });

    // Skip typewriter on click
    document.getElementById('screen-game')?.addEventListener('click', () => {
      typewriter.skip();
    });

    // Cost updates
    eventBus.on('cost:updated', (stats) => {
      document.getElementById('top-bar-cost').textContent = `$${stats.totalCost.toFixed(4)}`;
    });

    eventBus.on('cost:budget-exceeded', () => {
      renderer.showError(i18n.t('sys.budgetExceeded'));
    });

    eventBus.on('time:updated', ({ time, tageszeit, dayAdvance }) => {
      const timeEl = document.getElementById('top-bar-time');
      if (timeEl) timeEl.textContent = `${time} ${tageszeit}`;
      if (dayAdvance > 0) this.updateTopBar();
    });

    eventBus.on('weather:updated', ({ wetter, icon }) => {
      const iconEl = document.getElementById('top-bar-weather-icon');
      const textEl = document.getElementById('top-bar-weather-text');
      if (iconEl) iconEl.textContent = icon;
      if (textEl) textEl.textContent = wetter;
    });

    eventBus.on('day:updated', ({ day }) => {
      const dayEl = document.getElementById('top-bar-day');
      if (dayEl) dayEl.textContent = `${i18n.t('topbar.day')} ${day}`;
      if (this.currentSave) this.currentSave.currentDay = day;
    });
  }

  // === SCREEN MANAGEMENT ===

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
  }

  // === SETUP FLOW ===

  async resumeLastGame() {
    if (!this.lastSave) return;

    const keyInput = document.getElementById('api-key-input');
    const status = document.getElementById('api-key-status');
    const key = keyInput.value.trim();

    if (!key || key.length < 10) {
      status.textContent = i18n.t('sys.enterApiKey');
      status.className = 'status-message error';
      return;
    }

    apiClient.setApiKey(key);
    if (document.getElementById('save-key-checkbox').checked) {
      localStorage.setItem('deadzone_api_key', key);
    }

    // Use last selected model or default
    const savedModel = await saveManager.getSetting('lastModel');
    if (savedModel) {
      apiClient.setModel(savedModel);
      costTracker.setModel(savedModel);
    }

    // Sync settings dropdown
    const settingsSelect = document.getElementById('settings-model-select');
    if (settingsSelect && apiClient.model) {
      settingsSelect.value = apiClient.model;
    }

    await this.loadGame(this.lastSave.id);
  }

  async validateAndProceed() {
    const keyInput = document.getElementById('api-key-input');
    const status = document.getElementById('api-key-status');
    const key = keyInput.value.trim();

    if (!key) {
      status.textContent = i18n.t('sys.enterApiKey');
      status.className = 'status-message error';
      return;
    }

    if (key.length < 10) {
      status.textContent = 'API-Key zu kurz.';
      status.className = 'status-message error';
      return;
    }

    apiClient.setApiKey(key);

    // Save key if checkbox checked
    if (document.getElementById('save-key-checkbox').checked) {
      localStorage.setItem('deadzone_api_key', key);
    }

    this.goToModelSelect();
  }

  goToModelSelect() {
    this.showScreen('screen-model');
  }

  async selectModel() {
    const selected = document.querySelector('input[name="model"]:checked');
    let modelId = selected.value;

    if (modelId === 'custom') {
      modelId = document.getElementById('custom-model-input').value.trim();
      if (!modelId) {
        alert(i18n.t('sys.enterModelId'));
        return;
      }
    }

    apiClient.setModel(modelId);
    costTracker.setModel(modelId);
    await saveManager.setSetting('lastModel', modelId);

    // Sync settings dropdown
    const settingsSelect = document.getElementById('settings-model-select');
    if (settingsSelect) {
      const option = settingsSelect.querySelector(`option[value="${modelId}"]`);
      if (option) {
        settingsSelect.value = modelId;
      } else {
        // Custom model — add as option
        const customOpt = document.createElement('option');
        customOpt.value = modelId;
        customOpt.textContent = modelId;
        settingsSelect.appendChild(customOpt);
        settingsSelect.value = modelId;
      }
    }

    await this.goToSavegames();
  }

  async goToSavegames() {
    const saves = await saveManager.listSaves();

    if (saves.length === 0) {
      this.goToNewGame();
      return;
    }

    // Render save list
    const listEl = document.getElementById('savegame-list');
    listEl.innerHTML = '';

    for (const save of saves) {
      const entry = document.createElement('div');
      entry.className = 'savegame-entry';

      entry.innerHTML = `
        <div class="savegame-info">
          <span class="savegame-name">${save.characterName}</span>
          <span class="savegame-meta">Tag ${save.currentDay || '?'} — ${PHASE_LABELS[save.phase] || save.phase} — Zuletzt: ${new Date(save.lastPlayed).toLocaleDateString('de-DE')}</span>
        </div>
        <div class="savegame-actions">
          <button class="terminal-btn small btn-load-save" data-id="${save.id}">Laden</button>
          <button class="terminal-btn small btn-export-save" data-id="${save.id}">Export</button>
          <button class="terminal-btn small btn-delete-save" data-id="${save.id}">Löschen</button>
        </div>
      `;

      listEl.appendChild(entry);
    }

    // Wire up buttons
    listEl.querySelectorAll('.btn-load-save').forEach(btn => {
      btn.addEventListener('click', () => this.loadGame(btn.dataset.id));
    });
    listEl.querySelectorAll('.btn-export-save').forEach(btn => {
      btn.addEventListener('click', () => exportSave(btn.dataset.id));
    });
    listEl.querySelectorAll('.btn-delete-save').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(i18n.t('sys.confirmDelete'))) {
          await saveManager.deleteSave(btn.dataset.id);
          await this.goToSavegames();
        }
      });
    });

    this.showScreen('screen-savegames');
  }

  goToNewGame() {
    this.showScreen('screen-newgame');
  }

  _pickRandomName() {
    const NAMES_MALE = [
      'Marcus Weber', 'Jonas Richter', 'Erik Brandt', 'Liam Vogt', 'Tobias Krüger',
      'Niklas Schäfer', 'David Hartmann', 'Finn Lehmann', 'Leon Baumann', 'Maximilian Wolff'
    ];
    const NAMES_FEMALE = [
      'Elena Fischer', 'Mira Hoffmann', 'Sophie Engel', 'Lena Schreiber', 'Nina Kessler',
      'Johanna Ritter', 'Clara Neumann', 'Emilia Berger', 'Freya Seidel', 'Alina Wendt'
    ];
    const gender = document.querySelector('.gender-preset.active')?.dataset.value;
    const pool = gender === 'weiblich' ? NAMES_FEMALE : NAMES_MALE;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  wizardGoTo(step) {
    document.querySelectorAll('.wizard-page').forEach(p => p.classList.remove('active'));
    const page = document.querySelector(`.wizard-page[data-step="${step}"]`);
    if (page) page.classList.add('active');

    document.querySelectorAll('.wizard-dot').forEach(dot => {
      const dotStep = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'done');
      if (dotStep === step) dot.classList.add('active');
      else if (dotStep < step) dot.classList.add('done');
    });

    // Pre-fill random name when entering character step
    if (step === 3) {
      const nameInput = document.getElementById('character-name-input');
      if (nameInput && !nameInput.value.trim()) {
        nameInput.value = this._pickRandomName();
      }
    }

    // Scroll to top of newgame screen
    document.getElementById('screen-newgame')?.scrollTo(0, 0);
  }

  getSelectedLocation() {
    const activeCard = document.querySelector('.location-card.active');
    return activeCard ? activeCard.dataset.value : '';
  }

  getSelectedCharacter() {
    const name = document.getElementById('character-name-input')?.value.trim() || '';
    const gender = document.querySelector('.gender-preset.active')?.dataset.value || 'männlich';
    const backstory = document.getElementById('character-backstory-input')?.value.trim() || '';
    const activeCard = document.querySelector('.background-card.active');
    const background = activeCard?.dataset.value || 'ex_soldat';
    const backgroundLabel = activeCard?.querySelector('.card-option__title')?.textContent || 'Ex-Soldat';
    return { name, gender, backstory, background, backgroundLabel };
  }

  async startNewGame() {
    const phase = document.querySelector('input[name="phase"]:checked').value;
    const location = this.getSelectedLocation();
    const charData = this.getSelectedCharacter();

    if (!location) {
      alert(i18n.t('alert.noLocation'));
      return;
    }
    if (!charData.name) {
      alert(i18n.t('alert.noName'));
      return;
    }

    showLoading(i18n.t('loading.charGen'));

    try {
      const backstoryPart = charData.backstory ? `\nPersönliche Geschichte: ${charData.backstory}` : '';
      const charPrompt = `Name: ${charData.name}, Geschlecht: ${charData.gender}, Hintergrund: ${charData.backgroundLabel}, Phase: ${PHASE_LABELS[phase]}, Startort: ${location}${backstoryPart}`;

      // Generate character sheet
      const messages = [
        {
          role: 'system',
          content: `Du bist der Character-Creator von DEADZONE, einem Zombie-Survival-RPG.
Erstelle aus den Spieler-Angaben ein Charakter-Blatt. Der Hintergrund beeinflusst Stärken, Schwächen, Persönlichkeit und Startausrüstung.
Antworte NUR mit dem Charakter-Blatt, kein weiterer Text.

Hintergrund-Einflüsse:
- Soldat: Kampferfahrung, Waffen-Kenntnis, taktisches Denken, aber PTBS-Risiko
- Arzt: Medizinisches Wissen, Wundversorgung, aber körperlich schwächer
- Mechaniker: Reparatur, Improvisation, handwerklich begabt, robust
- Lehrer: Führungsqualitäten, Allgemeinwissen, aber keine Kampferfahrung
- Sanitäter: Erste Hilfe unter Druck, Belastbarkeit, mittlere Kampffähigkeit
- Farmer: Ausdauer, Nahrungswissen, praktisch veranlagt, zäh
- Polizist: Nahkampf, Schusswaffen-Training, Autorität, Stressresistenz
- Wissenschaftler: Analytisch, Infektionswissen, aber körperlich schwach

FORMAT:
Name: [Name]
Geschlecht: [Geschlecht]
Alter: [passend zum Hintergrund]
Hintergrund: [Kurzbeschreibung basierend auf Beruf]

TAGS (Stärken):
- [Tag 1]: [Kurzbeschreibung]
- [Tag 2]: [Kurzbeschreibung]
- [Tag 3]: [Kurzbeschreibung]

SCHWÄCHEN:
- [Schwäche 1]: [Kurzbeschreibung]
- [Schwäche 2]: [Kurzbeschreibung]

PERSÖNLICHKEIT: [2-3 Sätze]

STARTAUSRÜSTUNG (realistisch für ${PHASE_LABELS[phase]}, ${location}, passend zum Hintergrund):
- [Gegenstand 1]
- [Gegenstand 2]
- [etc.]`
        },
        { role: 'user', content: charPrompt }
      ];

      const charSheet = await apiClient.send(messages, { temperature: 0.7, maxTokens: 800 });

      const characterName = charData.name;

      showLoading(i18n.t('loading.gameCreate'));

      // Create save
      this.currentSave = await saveManager.createNewSave(characterName, phase, location);
      await saveManager.setState('charakter', charSheet);
      await saveManager.setState('charakter_beschreibung', charPrompt);
      await saveManager.setState('game_time', '08:00');
      await saveManager.setState('tageszeit', 'Morgen');

      // If pre_outbreak: set random outbreak day between 4-8
      if (phase === 'pre_outbreak') {
        const outbreakDay = Math.floor(Math.random() * 5) + 4; // 4-8
        await saveManager.setState('outbreak_day', outbreakDay);
        promptBuilder.setOutbreakDay(outbreakDay);
      }

      // Initialize character stats
      const initialStats = { gesundheit: 10, hunger: 0, durst: 0, müdigkeit: 0, psyche: 10 };
      await saveManager.setState('character_stats', JSON.stringify(initialStats));
      promptBuilder.setCharacterStats(initialStats);

      // Initialize infrastructure state (only for pre_outbreak and outbreak)
      if (phase === 'pre_outbreak' || phase === 'outbreak') {
        const { INFRASTRUCTURE_DEFAULTS } = await import('../state/stateSchema.js');
        const infra = INFRASTRUCTURE_DEFAULTS[phase];
        await saveManager.setState('infrastructure', JSON.stringify(infra));
        promptBuilder.setInfrastructure(infra);
      }

      // Setup prompt builder
      promptBuilder.setPhase(phase);
      promptBuilder.setLocation(location);
      promptBuilder.setCharacterData(charSheet);
      promptBuilder.setGroupData('');
      promptBuilder.setMasterSummary('');

      // Enter game and generate intro
      await this.enterGameMode();
      await this.generateIntroScene(phase, location, charSheet);

    } catch (err) {
      console.error('startNewGame error:', err);
      hideLoading();
      const is401 = err.message.includes('401');
      const keyHint = apiClient.apiKey ? ` (Key: ${apiClient.apiKey.substring(0, 8)}...)` : '';
      if (is401) {
        alert(i18n.t('api.invalidKey') + keyHint);
      } else {
        alert(i18n.t('sys.startFailed') + ': ' + err.message);
      }
      return;
    }
    hideLoading();
  }

  async loadGame(saveId) {
    showLoading(i18n.t('loading.saveLoad'));

    try {
      const { save, stateMap, conversation } = await saveManager.loadSave(saveId);
      this.currentSave = save;

      // Setup prompt builder
      promptBuilder.setPhase(save.phase);
      promptBuilder.setLocation(save.location);
      promptBuilder.setCharacterData(stateMap['charakter'] || '');
      promptBuilder.setGroupData(stateMap['npcs/gruppe'] || '');
      promptBuilder.setMasterSummary(stateMap['zusammenfassung'] || '');

      // Restore conversation
      contextManager.clear();
      for (const msg of conversation) {
        contextManager.addMessage(msg.role, msg.content);
      }

      // Restore cost tracker
      const savedCost = stateMap['cost_tracker'];
      if (savedCost) {
        costTracker.restoreSnapshot(savedCost);
      }

      // Restore outbreak day for pre_outbreak phase
      const outbreakDay = stateMap['outbreak_day'];
      if (outbreakDay) {
        promptBuilder.setOutbreakDay(parseInt(outbreakDay));
      }

      // Restore infrastructure state
      const infraRaw = stateMap['infrastructure'];
      if (infraRaw) {
        try {
          promptBuilder.setInfrastructure(JSON.parse(infraRaw));
        } catch (e) { /* ignore parse error */ }
      }

      // Restore character stats
      const statsRaw = stateMap['character_stats'];
      if (statsRaw) {
        try {
          promptBuilder.setCharacterStats(JSON.parse(statsRaw));
        } catch (e) {}
      }

      // Restore inventory
      const invRaw = stateMap['inventar'];
      if (invRaw) {
        try { promptBuilder.setInventory(JSON.parse(invRaw)); } catch (e) {}
      }

      // Restore world clocks
      const clocksRaw = stateMap['world_clocks'];
      if (clocksRaw) {
        try {
          const clocks = JSON.parse(clocksRaw);
          promptBuilder.setWorldClocks(clocks);
          this.renderWorldClocksPanel(clocks);
        } catch (e) { /* ignore parse error */ }
      }

      // Enter game mode
      await this.enterGameMode();

      // Show conversation history
      for (const msg of conversation) {
        if (msg.role === 'user') {
          renderer.showUserMessage(msg.content);
        } else if (msg.role === 'assistant') {
          const { segments } = parseResponse(msg.content);
          renderer.renderSegments(segments);
        }
      }

      // Update top bar
      this.updateTopBar();

      renderer.showSystemMessage(`${i18n.t('sys.gameLoaded')}: ${save.characterName}, ${i18n.t('topbar.day')} ${save.currentDay || '?'}`);

    } catch (err) {
      renderer.showError(i18n.t('sys.loadFailed') + ': ' + err.message);
    } finally {
      hideLoading();
    }
  }

  async enterGameMode() {
    this.state = STATE.PLAYING;

    // Show game UI elements
    this.showScreen('screen-game');
    document.getElementById('top-bar').classList.remove('hidden');
    document.getElementById('input-area').classList.remove('hidden');
    document.getElementById('quick-buttons').classList.remove('hidden');

    // World clocks toggle button
    const wcToggle = document.getElementById('btn-world-clocks');
    if (wcToggle && !wcToggle._bound) {
      wcToggle.addEventListener('click', () => this.toggleWorldClocksPanel());
      wcToggle._bound = true;
    }
    const wcClose = document.getElementById('btn-wc-close');
    if (wcClose && !wcClose._bound) {
      wcClose.addEventListener('click', () => {
        document.getElementById('world-clocks-panel')?.classList.add('hidden');
      });
      wcClose._bound = true;
    }

    // Init input line
    if (!this.inputLine) {
      this.inputLine = new InputLine(
        document.getElementById('game-input'),
        (input) => this.inputHandler.processInput(input)
      );
    }

    this.inputLine.setEnabled(true);
    this.inputLine.focus();

    this.updateTopBar();
  }

  async generateIntroScene(phase, location, charSheet) {
    const messages = promptBuilder.buildMessages([
      {
        role: 'user',
        content: `[SPIELSTART]
Phase: ${PHASE_LABELS[phase]}
Startort: ${location}
Charakter:
${charSheet}

Generiere die Eröffnungsszene. Beschreibe die unmittelbare Umgebung, die Atmosphäre, und die Situation des Charakters.
${phase === 'pre_outbreak' ? 'WICHTIG: Vor dem Ausbruch! Der Startort ist AKTIV, BEVÖLKERT und im NORMALBETRIEB. Nichts ist verlassen, zerstört oder apokalyptisch. Beschreibe einen normalen Alltag mit Menschen, Betrieb und Routine — nur mit minimalen, subtilen Hinweisen dass etwas nicht stimmt.' : ''}
Verwende einen <ui:scene> Tag für den Szenen-Header. Ende mit einer offenen Frage: "Was tust du?"

Vergiss nicht den <state_update> Block am Ende.`
      }
    ]);

    this.isProcessing = true;
    this.inputLine.setEnabled(false);

    const streamTarget = renderer.startStreaming();

    await apiClient.sendStreaming(messages, {
      temperature: 0.85,
      maxTokens: 2048,
      onToken: (token) => {
        renderer.appendStreamToken(token);
      },
      onDone: (fullResponse) => {
        renderer.finishStreaming(fullResponse);
        contextManager.addMessage('user', '[SPIELSTART]');
        contextManager.addMessage('assistant', fullResponse);
        saveManager.addConversationMessage('assistant', fullResponse);
        this.isProcessing = false;
        this.inputLine.setEnabled(true);
        this.inputLine.focus();
      },
      onError: (err) => {
        renderer.hideLoading();
        renderer.showError(err, () => this.generateIntroScene(phase, location, charSheet));
        this.isProcessing = false;
        this.inputLine.setEnabled(true);
      }
    });
  }

  async handlePlayerInput(input) {
    if (this.isProcessing) return;

    // Show user message
    renderer.showUserMessage(input);

    // Save to conversation DB
    await saveManager.addConversationMessage('user', input);
    contextManager.addMessage('user', input);

    // Check if context rotation needed
    if (contextManager.shouldRotate()) {
      await this.performContextRotation();
    }

    // Build messages and send to AI
    const history = contextManager.getHistory();
    const messages = promptBuilder.buildMessages(history);

    this.isProcessing = true;
    this.inputLine.setEnabled(false);

    renderer.startStreaming();

    await apiClient.sendStreaming(messages, {
      temperature: 0.85,
      maxTokens: 2048,
      onToken: (token) => {
        renderer.appendStreamToken(token);
      },
      onDone: async (fullResponse) => {
        renderer.finishStreaming(fullResponse);
        contextManager.addMessage('assistant', fullResponse);
        await saveManager.addConversationMessage('assistant', fullResponse);
        await saveManager.updateSaveMeta({});
        await saveManager.setState('cost_tracker', costTracker.getSnapshot());
        this.isProcessing = false;
        this.inputLine.setEnabled(true);
        this.inputLine.focus();
        this.updateTopBar();
      },
      onError: (err) => {
        renderer.hideLoading();
        renderer.showError(err, () => this.handlePlayerInput(input));
        this.isProcessing = false;
        this.inputLine.setEnabled(true);
      }
    });
  }

  async performContextRotation() {
    renderer.showAutoSave();
    this.inputLine.setEnabled(false);

    const summary = await contextManager.rotate();

    if (summary) {
      // Update master summary
      const currentSummary = await saveManager.getState('zusammenfassung') || '';
      const updatedSummary = currentSummary + '\n\n---\n\n' + summary;
      await saveManager.setState('zusammenfassung', updatedSummary);
      promptBuilder.setMasterSummary(updatedSummary);

      // Archive session
      await saveManager.archiveSession(contextManager.sessionNumber - 1, summary);

      // Clear conversation in DB
      await saveManager.clearConversation();

      renderer.showSystemMessage(i18n.t('sys.contextRotated'));
    }

    this.inputLine.setEnabled(true);
  }

  handleSystemCommand(cmd) {
    switch (cmd) {
      case 'speichern':
        this.manualSave();
        break;
      case 'laden':
        this.goToSavegames();
        break;
      case 'exportieren':
        this.exportCurrentGame();
        break;
      case 'einstellungen':
        showOverlay('overlay-settings');
        break;
      case 'session-info':
        this.showSessionInfo();
        break;
      case 'kosten':
        this.showCostInfo();
        break;
      case 'minimal':
        typewriter.setEnabled(false);
        renderer.showSystemMessage(i18n.t('sys.minimalMode'));
        break;
      case 'voll':
        typewriter.setEnabled(true);
        renderer.showSystemMessage(i18n.t('sys.fullMode'));
        break;
      default:
        renderer.showSystemMessage(`${i18n.t('sys.unknownCommand')}: ${cmd}`);
    }
  }

  async manualSave() {
    if (!saveManager.currentSaveId) return;
    showLoading(i18n.t('sys.saving'));
    try {
      await saveManager.updateSaveMeta({});
      await saveManager.setState('cost_tracker', costTracker.getSnapshot());
      renderer.showSystemMessage(i18n.t('sys.gameSaved'));
    } catch (err) {
      renderer.showError(i18n.t('sys.saveFailed') + ': ' + err.message);
    } finally {
      hideLoading();
    }
  }

  async exportCurrentGame() {
    if (!saveManager.currentSaveId) return;
    try {
      await exportSave(saveManager.currentSaveId);
      renderer.showSystemMessage(i18n.t('sys.gameExported'));
    } catch (err) {
      renderer.showError(i18n.t('sys.exportFailed') + ': ' + err.message);
    }
  }

  async handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    showLoading(i18n.t('sys.importing'));
    try {
      const { importSave } = await import('../state/exportImport.js');
      const save = await importSave(file);
      renderer.showSystemMessage(`${i18n.t('sys.gameImported')}: ${save.characterName}`);
      await this.goToSavegames();
    } catch (err) {
      renderer.showError(i18n.t('sys.importFailed') + ': ' + err.message);
    } finally {
      hideLoading();
      event.target.value = '';
    }
  }

  showSessionInfo() {
    const stats = costTracker.getStats();
    const msgCount = contextManager.getMessageCount();
    const maxMsg = contextManager.maxMessages;
    renderer.showSystemMessage(
      `Session ${contextManager.sessionNumber}\n` +
      `Nachrichten: ${msgCount}/${maxMsg} (nächste Rotation bei ${maxMsg})\n` +
      `API-Calls: ${stats.callCount}\n` +
      `Tokens: ${stats.totalInputTokens} in / ${stats.totalOutputTokens} out\n` +
      `Kosten: $${stats.totalCost.toFixed(4)}`
    );
  }

  showCostInfo() {
    const stats = costTracker.getStats();
    renderer.showSystemMessage(
      `Kosten-Übersicht:\n` +
      `Modell: ${stats.modelId}\n` +
      `Input-Tokens: ${stats.totalInputTokens}\n` +
      `Output-Tokens: ${stats.totalOutputTokens}\n` +
      `Geschätzte Kosten: $${stats.totalCost.toFixed(4)}\n` +
      `Budget: $${stats.budgetLimit.toFixed(2)} (${stats.budgetUsedPct.toFixed(1)}% verbraucht)`
    );
  }

  closeSettings() {
    hideOverlay('overlay-settings');
    if (this.state === STATE.PLAYING && this.inputLine) {
      this.inputLine.focus();
    }
  }

  forgetApiKey() {
    localStorage.removeItem('deadzone_api_key');
    apiClient.setApiKey('');
    hideOverlay('overlay-settings');
    this.showScreen('screen-setup');
    document.getElementById('api-key-input').value = '';
    document.getElementById('api-key-status').textContent = 'API-Key wurde vergessen.';
    document.getElementById('api-key-status').className = 'status-message';
  }

  renderWorldClocksPanel(clocks) {
    const panel = document.getElementById('world-clocks-panel');
    const list = document.getElementById('world-clocks-list');
    if (!panel || !list) return;

    const entries = Object.entries(clocks || {});
    if (entries.length === 0) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');
    list.innerHTML = '';

    for (const [key, value] of entries) {
      const item = document.createElement('div');
      item.className = 'wc-item';

      const label = document.createElement('div');
      label.className = 'wc-label';
      // Convert snake_case to readable: militaer_konvoi → Militär Konvoi
      label.textContent = key.replace(/_/g, ' ');

      const desc = document.createElement('div');
      desc.className = 'wc-desc';
      desc.textContent = value;

      item.appendChild(label);
      item.appendChild(desc);
      list.appendChild(item);
    }
  }

  toggleWorldClocksPanel() {
    const panel = document.getElementById('world-clocks-panel');
    if (!panel) return;

    // If hidden (no clocks yet), show it anyway with empty message
    if (panel.classList.contains('hidden')) {
      const list = document.getElementById('world-clocks-list');
      if (list && list.children.length === 0) {
        list.innerHTML = `<div class="wc-empty">${i18n.t('worldClocks.empty')}</div>`;
      }
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }

  async updateTopBar() {
    if (this.currentSave) {
      // Refresh save data to get latest day count
      const freshSave = await saveManager.getCurrentSave();
      if (freshSave) this.currentSave = freshSave;

      document.getElementById('top-bar-character').textContent = this.currentSave.characterName;
      document.getElementById('top-bar-day').textContent = `Tag ${this.currentSave.currentDay || '?'}`;

      const gameTime = await saveManager.getState('game_time');
      const tageszeit = await saveManager.getState('tageszeit');
      const timeEl = document.getElementById('top-bar-time');
      if (timeEl && gameTime) {
        timeEl.textContent = `${gameTime} ${tageszeit || ''}`;
      }

      const wetterIcon = await saveManager.getState('wetter_icon');
      const wetter = await saveManager.getState('wetter');
      const iconEl = document.getElementById('top-bar-weather-icon');
      const textEl = document.getElementById('top-bar-weather-text');
      if (iconEl) iconEl.textContent = wetterIcon || '⛅';
      if (textEl) textEl.textContent = wetter || '';
    }

    // Update session info in settings
    const infoEl = document.getElementById('session-info-display');
    if (infoEl) {
      const stats = costTracker.getStats();
      infoEl.textContent =
        `Session: ${contextManager.sessionNumber}\n` +
        `Nachrichten: ${contextManager.getMessageCount()}/${contextManager.maxMessages}\n` +
        `Kosten: $${stats.totalCost.toFixed(4)}`;
    }
  }
}

export const gameEngine = new GameEngine();
