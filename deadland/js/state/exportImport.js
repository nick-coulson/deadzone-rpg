// DEADZONE — Export / Import (.deadzone files)

import db from './database.js';
import { saveManager } from './saveManager.js';

export async function exportSave(saveId) {
  const save = await db.saves.get(saveId);
  if (!save) throw new Error('Spielstand nicht gefunden');

  const states = await db.gameState.where('saveId').equals(saveId).toArray();
  const archive = await db.sessionArchive.where('saveId').equals(saveId).toArray();
  const conversation = await db.conversation.where('saveId').equals(saveId).toArray();

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    game: 'DEADZONE',
    save,
    gameState: states,
    sessionArchive: archive,
    conversation
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  const dayStr = save.currentDay || '?';
  const filename = `deadzone_${save.characterName}_tag${dayStr}.deadzone`;

  downloadBlob(blob, filename);
}

export async function importSave(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.game !== 'DEADZONE' && data.game !== 'DEADLAND') {
          throw new Error('Keine gültige DEADZONE-Datei.');
        }

        // Check if save with same ID exists
        const existing = await db.saves.get(data.save.id);
        if (existing) {
          // Append timestamp to make unique
          data.save.id = data.save.id + '_' + Date.now();
          for (const s of data.gameState) s.saveId = data.save.id;
          for (const s of data.sessionArchive) s.saveId = data.save.id;
          for (const s of data.conversation) s.saveId = data.save.id;
        }

        // Import save
        await db.saves.add(data.save);

        // Import game state
        if (data.gameState?.length) {
          await db.gameState.bulkAdd(data.gameState);
        }

        // Import archive
        if (data.sessionArchive?.length) {
          // Remove auto-increment IDs for fresh insert
          for (const entry of data.sessionArchive) {
            delete entry.id;
          }
          await db.sessionArchive.bulkAdd(data.sessionArchive);
        }

        // Import conversation
        if (data.conversation?.length) {
          for (const entry of data.conversation) {
            delete entry.id;
          }
          await db.conversation.bulkAdd(data.conversation);
        }

        resolve(data.save);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsText(file);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
