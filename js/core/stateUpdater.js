// DEADZONE — State Updater (writes state_update data to IndexedDB)

import { saveManager } from '../state/saveManager.js';
import { eventBus } from './eventBus.js';
import { i18n } from './i18n.js';

const TIME_OF_DAY_KEYS = [
  [0, 'time.deepNight'], [5, 'time.dawn'], [7, 'time.morning'], [12, 'time.noon'],
  [14, 'time.afternoon'], [18, 'time.evening'], [21, 'time.night']
];

function getTimeOfDay(hour) {
  for (let i = TIME_OF_DAY_KEYS.length - 1; i >= 0; i--) {
    if (hour >= TIME_OF_DAY_KEYS[i][0]) return i18n.t(TIME_OF_DAY_KEYS[i][1]);
  }
  return i18n.t('time.deepNight');
}

class StateUpdater {
  constructor() {
    eventBus.on('state:update', (data) => this.processUpdate(data));
  }

  async processUpdate(data) {
    if (!data) return;

    try {
      // Update character state
      if (data.charakter && Object.keys(data.charakter).length > 0) {
        await this.updateCharacter(data.charakter);
      }

      // Update scene context — including time tracking and weather
      if (data.szene && Object.keys(data.szene).length > 0) {
        await this.updateScene(data.szene);
        await this.advanceGameTime(data.szene);

      }

      // Update notebook entries
      if (data.notizbuch && data.notizbuch.length > 0) {
        await this.updateNotebook(data.notizbuch);
      }

      // Update world clocks
      if (data.world_clocks && Object.keys(data.world_clocks).length > 0) {
        await this.updateWorldClocks(data.world_clocks);
      }

      // Update NPCs
      if (data.npcs && data.npcs.length > 0) {
        await this.updateNPCs(data.npcs);
      }

      // Update infrastructure status
      if (data.infrastruktur && Object.keys(data.infrastruktur).length > 0) {
        await this.updateInfrastructure(data.infrastruktur);
      }

    } catch (err) {
      console.error('State update failed:', err);
    }
  }

  async updateCharacter(changes) {
    // Store general character updates as notes
    const updateNote = `\n# Letztes Update\n${Object.entries(changes).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
    await saveManager.setState('charakter_updates', updateNote);

    // Persist inventory changes
    if (changes.inventar_add || changes.inventar_remove) {
      const invRaw = await saveManager.getState('inventar');
      let inventory = [];
      if (invRaw) {
        try { inventory = JSON.parse(invRaw); } catch (e) { inventory = []; }
      }

      if (changes.inventar_add && Array.isArray(changes.inventar_add)) {
        for (const item of changes.inventar_add) {
          if (item && !inventory.includes(item)) {
            inventory.push(item);
          }
        }
      }
      if (changes.inventar_remove && Array.isArray(changes.inventar_remove)) {
        for (const item of changes.inventar_remove) {
          inventory = inventory.filter(i => i.toLowerCase() !== item.toLowerCase());
        }
      }

      await saveManager.setState('inventar', JSON.stringify(inventory));
      eventBus.emit('inventar:updated', inventory);
    }

    // Extract and persist numeric stats separately
    const STAT_KEYS = ['gesundheit', 'hunger', 'durst', 'müdigkeit', 'psyche'];
    const hasStats = STAT_KEYS.some(k => changes[k] !== undefined);

    if (hasStats) {
      const currentRaw = await saveManager.getState('character_stats');
      let current = { gesundheit: 10, hunger: 0, durst: 0, müdigkeit: 0, psyche: 10 };
      if (currentRaw) {
        try { current = JSON.parse(currentRaw); } catch (e) {}
      }

      for (const key of STAT_KEYS) {
        if (changes[key] !== undefined) {
          const val = parseInt(changes[key]);
          if (!isNaN(val) && val >= 0 && val <= 10) {
            current[key] = val;
          }
        }
      }

      await saveManager.setState('character_stats', JSON.stringify(current));
      eventBus.emit('characterstats:updated', current);
    }
  }

  async updateScene(scene) {
    const entries = Object.entries(scene).map(([k, v]) => `${k}: "${v}"`).join('\n');
    await saveManager.setState('szene_aktuell', entries);
    eventBus.emit('scene:updated', entries);

    // Sync day counter from AI if provided
    if (scene.tag) {
      const day = parseInt(scene.tag);
      if (day > 0) {
        const save = await saveManager.getCurrentSave();
        if (save && save.currentDay !== day) {
          await saveManager.updateSaveMeta({ currentDay: day });
          eventBus.emit('day:updated', { day });
        }
      }
    }
  }

  async updateNotebook(entries) {
    const current = await saveManager.getState('notizbuch') || '';
    const newEntries = entries.join('\n');
    const updated = (current + '\n' + newEntries).trim();
    await saveManager.setState('notizbuch', updated);
    eventBus.emit('notizbuch:updated', updated);
  }

  async advanceGameTime(scene) {
    let timeUpdated = false;

    // Prefer absolute time from AI if provided (e.g. uhrzeit: "21:55")
    const absoluteTime = scene.uhrzeit;
    if (absoluteTime && /^\d{1,2}:\d{2}$/.test(absoluteTime.trim())) {
      const [absH, absM] = absoluteTime.trim().split(':').map(Number);
      if (absH >= 0 && absH < 24 && absM >= 0 && absM < 60) {
        const newTime = `${String(absH).padStart(2, '0')}:${String(absM).padStart(2, '0')}`;

        // Check for day rollover (if new time is earlier than current time)
        const currentTime = await saveManager.getState('game_time') || '08:00';
        const [curH] = currentTime.split(':').map(Number);
        let dayAdvance = 0;
        if (absH < curH && (curH - absH) > 2) {
          dayAdvance = 1;
        }

        await saveManager.setState('game_time', newTime);
        await saveManager.setState('tageszeit', getTimeOfDay(absH));

        if (dayAdvance > 0) {
          const save = await saveManager.getCurrentSave();
          if (save) {
            await saveManager.updateSaveMeta({ currentDay: (save.currentDay || 1) + dayAdvance });
          }
        }

        eventBus.emit('time:updated', { time: newTime, tageszeit: getTimeOfDay(absH), dayAdvance });
        timeUpdated = true;
      }
    }

    // Fallback: relative time from zeit_verbraucht (only if absolute time wasn't used)
    if (!timeUpdated) {
      const elapsed = scene.zeit_verbraucht;
      if (elapsed) {
        // Parse elapsed time: "30min", "1h", "2h30min", "1 Stunde", etc.
        let minutes = 0;
        const hMatch = elapsed.match(/(\d+)\s*h/i);
        const sMatch = elapsed.match(/(\d+)\s*stunde/i);
        const mMatch = elapsed.match(/(\d+)\s*min/i);
        if (hMatch) minutes += parseInt(hMatch[1]) * 60;
        if (sMatch) minutes += parseInt(sMatch[1]) * 60;
        if (mMatch) minutes += parseInt(mMatch[1]);

        if (minutes > 0) {
          const currentTime = await saveManager.getState('game_time') || '08:00';
          const [h, m] = currentTime.split(':').map(Number);
          let totalMin = h * 60 + m + minutes;

          let dayAdvance = 0;
          while (totalMin >= 1440) {
            totalMin -= 1440;
            dayAdvance++;
          }

          const newH = Math.floor(totalMin / 60);
          const newM = totalMin % 60;
          const newTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

          await saveManager.setState('game_time', newTime);
          await saveManager.setState('tageszeit', getTimeOfDay(newH));

          if (dayAdvance > 0) {
            const save = await saveManager.getCurrentSave();
            if (save) {
              const newDay = (save.currentDay || 1) + dayAdvance;
              await saveManager.updateSaveMeta({ currentDay: newDay });
            }
          }

          eventBus.emit('time:updated', { time: newTime, tageszeit: getTimeOfDay(newH), dayAdvance });
        }
      }
    }

    // Always update weather if provided (independent of time)
    if (scene.wetter) {
      await this.updateWeather(scene.wetter);
    }
  }

  async updateWeather(wetter) {
    const WEATHER_ICONS = {
      // German
      'sonnig': '☀️', 'klar': '☀️', 'heiter': '🌤️',
      'bewölkt': '☁️', 'bedeckt': '☁️', 'wolkig': '⛅',
      'teilweise bewölkt': '⛅', 'leicht bewölkt': '🌤️',
      'regen': '🌧️', 'nieselregen': '🌦️', 'starkregen': '🌧️', 'schauer': '🌦️',
      'gewitter': '⛈️', 'sturm': '🌪️',
      'schnee': '🌨️', 'schneesturm': '🌨️',
      'nebel': '🌫️', 'neblig': '🌫️', 'dunst': '🌫️',
      'wind': '💨', 'windig': '💨', 'stürmisch': '🌪️',
      'nacht': '🌙', 'sternenklar': '🌙',
      // English
      'sunny': '☀️', 'clear': '☀️', 'bright': '🌤️',
      'cloudy': '☁️', 'overcast': '☁️', 'partly cloudy': '⛅',
      'rain': '🌧️', 'drizzle': '🌦️', 'heavy rain': '🌧️', 'shower': '🌦️', 'downpour': '🌧️',
      'thunder': '⛈️', 'storm': '🌪️', 'lightning': '⛈️',
      'snow': '🌨️', 'blizzard': '🌨️', 'sleet': '🌨️',
      'fog': '🌫️', 'foggy': '🌫️', 'mist': '🌫️', 'haze': '🌫️', 'hazy': '🌫️',
      'windy': '💨', 'gusty': '💨',
      'night': '🌙', 'starry': '🌙',
      'hot': '🔥', 'humid': '🔥',
    };

    const lower = wetter.toLowerCase().trim();
    let icon = '⛅'; // default
    for (const [key, emoji] of Object.entries(WEATHER_ICONS)) {
      if (lower.includes(key)) { icon = emoji; break; }
    }

    await saveManager.setState('wetter', wetter);
    await saveManager.setState('wetter_icon', icon);
    eventBus.emit('weather:updated', { wetter, icon });
  }

  async updateWorldClocks(clocks) {
    // Load existing clocks as JSON
    const currentRaw = await saveManager.getState('world_clocks');
    let current = {};
    if (currentRaw) {
      try { current = JSON.parse(currentRaw); } catch (e) { current = {}; }
    }

    // Merge new clocks into existing
    const merged = { ...current };
    for (const [key, value] of Object.entries(clocks)) {
      const lower = value.toLowerCase().trim();
      // Remove completed clocks
      if (lower === 'abgeschlossen' || lower === 'erledigt' || lower === 'completed' || lower === 'done') {
        delete merged[key];
      } else {
        merged[key] = value;
      }
    }

    await saveManager.setState('world_clocks', JSON.stringify(merged));
    eventBus.emit('worldclocks:updated', merged);
  }

  async updateNPCs(npcs) {
    const current = await saveManager.getState('npcs') || '';
    const newEntries = npcs.join('\n');
    await saveManager.setState('npcs', current ? current + '\n' + newEntries : newEntries);
  }

  async updateInfrastructure(infra) {
    // Merge with existing infrastructure state
    const currentRaw = await saveManager.getState('infrastructure');
    let current = {};
    if (currentRaw) {
      try { current = JSON.parse(currentRaw); } catch (e) { current = {}; }
    }
    const merged = { ...current, ...infra };
    await saveManager.setState('infrastructure', JSON.stringify(merged));
    eventBus.emit('infrastructure:updated', merged);
  }
}

export const stateUpdater = new StateUpdater();
