// DEADZONE — Save Manager (IndexedDB CRUD)

import db from './database.js';
import {
  createInitialSummary, createInitialCharacter,
  createInitialNotebook, createInitialWorldState,
  createInitialGroup, createInitialBase
} from './stateSchema.js';
import { eventBus } from '../core/eventBus.js';

class SaveManager {
  constructor() {
    this.currentSaveId = null;
  }

  // === SAVE CRUD ===

  async createNewSave(characterName, phase, location) {
    const id = `${characterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    const save = {
      id,
      characterName,
      phase,
      location,
      currentDay: 1,
      sessionNumber: 1,
      model: '',
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };

    await db.saves.add(save);

    // Create initial state entries
    const stateEntries = [
      { saveId: id, key: 'zusammenfassung', value: createInitialSummary(characterName, phase, location) },
      { saveId: id, key: 'charakter', value: createInitialCharacter(characterName) },
      { saveId: id, key: 'notizbuch', value: createInitialNotebook(characterName) },
      { saveId: id, key: 'welt/weltzustand', value: createInitialWorldState(phase, location) },
      { saveId: id, key: 'npcs/gruppe', value: createInitialGroup() },
      { saveId: id, key: 'basis/hauptbasis', value: createInitialBase() }
    ];

    await db.gameState.bulkAdd(stateEntries);

    this.currentSaveId = id;
    return save;
  }

  async listSaves() {
    return await db.saves.orderBy('lastPlayed').reverse().toArray();
  }

  async loadSave(saveId) {
    const save = await db.saves.get(saveId);
    if (!save) throw new Error('Spielstand nicht gefunden');

    this.currentSaveId = saveId;

    // Load all state
    const states = await db.gameState.where('saveId').equals(saveId).toArray();
    const stateMap = {};
    for (const s of states) {
      stateMap[s.key] = s.value;
    }

    // Load conversation
    const conversation = await db.conversation
      .where('saveId').equals(saveId)
      .sortBy('timestamp');

    // Load session archive
    const archive = await db.sessionArchive
      .where('saveId').equals(saveId)
      .sortBy('sessionNumber');

    return { save, stateMap, conversation, archive };
  }

  async deleteSave(saveId) {
    await db.saves.delete(saveId);
    await db.gameState.where('saveId').equals(saveId).delete();
    await db.conversation.where('saveId').equals(saveId).delete();
    await db.sessionArchive.where('saveId').equals(saveId).delete();

    if (this.currentSaveId === saveId) {
      this.currentSaveId = null;
    }
  }

  // === STATE OPERATIONS ===

  async getCurrentSave() {
    if (!this.currentSaveId) return null;
    return await db.saves.get(this.currentSaveId);
  }

  async getState(key) {
    if (!this.currentSaveId) return null;
    const entry = await db.gameState.get([this.currentSaveId, key]);
    return entry?.value || null;
  }

  async setState(key, value) {
    if (!this.currentSaveId) return;
    await db.gameState.put({ saveId: this.currentSaveId, key, value });
  }

  async updateSaveMeta(updates) {
    if (!this.currentSaveId) return;
    await db.saves.update(this.currentSaveId, {
      ...updates,
      lastPlayed: new Date().toISOString()
    });
  }

  // === CONVERSATION ===

  async addConversationMessage(role, content) {
    if (!this.currentSaveId) return;
    await db.conversation.add({
      saveId: this.currentSaveId,
      role,
      content,
      timestamp: Date.now()
    });
  }

  async getConversation() {
    if (!this.currentSaveId) return [];
    return await db.conversation
      .where('saveId').equals(this.currentSaveId)
      .sortBy('timestamp');
  }

  async clearConversation() {
    if (!this.currentSaveId) return;
    await db.conversation.where('saveId').equals(this.currentSaveId).delete();
  }

  // === SESSION ARCHIVE ===

  async archiveSession(sessionNumber, summaryYAML) {
    if (!this.currentSaveId) return;
    await db.sessionArchive.add({
      saveId: this.currentSaveId,
      sessionNumber,
      summary: summaryYAML,
      createdAt: new Date().toISOString()
    });
  }

  // === SETTINGS ===

  async getSetting(key) {
    const entry = await db.settings.get(key);
    return entry?.value;
  }

  async setSetting(key, value) {
    await db.settings.put({ key, value });
  }
}

export const saveManager = new SaveManager();
