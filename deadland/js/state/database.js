// DEADZONE — Dexie.js Database Schema & Init

const db = new Dexie('DeadlandDB');

db.version(1).stores({
  saves:          'id, characterName, createdAt, lastPlayed',
  gameState:      '[saveId+key], saveId',
  conversation:   '++id, saveId, role, timestamp',
  sessionArchive: '++id, saveId, sessionNumber, createdAt',
  settings:       'key'
});

export default db;
