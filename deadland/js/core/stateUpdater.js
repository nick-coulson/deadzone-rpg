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
        if (data.szene.wetter) {
          await this.updateWeather(data.szene.wetter);
        }
      }

      // Update notebook entries
      if (data.notizbuch && data.notizbuch.length > 0) {
        await this.updateNotebook(data.notizbuch);
      }

      // Update world clocks
      if (data.world_clocks && Object.keys(data.world_clocks).length > 0) {
        await this.updateWorldClocks(data.world_clocks);
      }

    } catch (err) {
      console.error('State update failed:', err);
    }
  }

  async updateCharacter(changes) {
    const current = await saveManager.getState('charakter') || '';

    // Simple YAML append for tracking changes
    // In a production system we'd parse and merge YAML properly
    // For now, we track the latest state update as metadata
    const updateNote = `\n# Letztes Update\n${Object.entries(changes).map(([k, v]) => `${k}: ${v}`).join('\n')}`;

    // We append change notes but keep original structure
    // The AI will read the full charakter.yaml and apply changes narratively
    await saveManager.setState('charakter_updates', updateNote);
  }

  async updateScene(scene) {
    const entries = Object.entries(scene).map(([k, v]) => `${k}: "${v}"`).join('\n');
    await saveManager.setState('szene_aktuell', entries);

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
    // Append new entries
    await saveManager.setState('notizbuch', current + '\n' + newEntries);
  }

  async advanceGameTime(scene) {
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

        // Update weather if provided
        if (scene.wetter) {
          await this.updateWeather(scene.wetter);
        }
        return;
      }
    }

    // Fallback: relative time from zeit_verbraucht
    const elapsed = scene.zeit_verbraucht;
    if (!elapsed) return;

    // Parse elapsed time: "30min", "1h", "2h30min", "1 Stunde", etc.
    let minutes = 0;
    const hMatch = elapsed.match(/(\d+)\s*h/i);
    const sMatch = elapsed.match(/(\d+)\s*stunde/i);
    const mMatch = elapsed.match(/(\d+)\s*min/i);
    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
    if (sMatch) minutes += parseInt(sMatch[1]) * 60;
    if (mMatch) minutes += parseInt(mMatch[1]);
    if (minutes === 0) return;

    // Load current time
    const currentTime = await saveManager.getState('game_time') || '08:00';
    const [h, m] = currentTime.split(':').map(Number);
    let totalMin = h * 60 + m + minutes;

    // Check for day rollover
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

    // Advance day counter if needed
    if (dayAdvance > 0) {
      const save = await saveManager.getCurrentSave();
      if (save) {
        const newDay = (save.currentDay || 1) + dayAdvance;
        await saveManager.updateSaveMeta({ currentDay: newDay });
      }
    }

    eventBus.emit('time:updated', { time: newTime, tageszeit: getTimeOfDay(newH), dayAdvance });

    // Update weather if provided
    if (scene.wetter) {
      await this.updateWeather(scene.wetter);
    }
  }

  async updateWeather(wetter) {
    const WEATHER_ICONS = {
      'sonnig': '☀️', 'klar': '☀️', 'heiter': '🌤️',
      'bewölkt': '☁️', 'bedeckt': '☁️', 'wolkig': '⛅',
      'teilweise bewölkt': '⛅', 'leicht bewölkt': '🌤️',
      'regen': '🌧️', 'nieselregen': '🌦️', 'starkregen': '🌧️', 'schauer': '🌦️',
      'gewitter': '⛈️', 'sturm': '🌪️',
      'schnee': '🌨️', 'schneesturm': '🌨️',
      'nebel': '🌫️', 'neblig': '🌫️', 'dunst': '🌫️',
      'wind': '💨', 'windig': '💨', 'stürmisch': '🌪️',
      'nacht': '🌙', 'sternenklar': '🌙',
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
    const current = await saveManager.getState('world_clocks') || '';
    const entries = Object.entries(clocks).map(([k, v]) => `${k}: ${v}`).join('\n');
    await saveManager.setState('world_clocks', entries);
  }
}

export const stateUpdater = new StateUpdater();
