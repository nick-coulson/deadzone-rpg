// DEADZONE — Background Music Player
// Streams DayZ OST from Archive.org, loops infinitely

const MUSIC_URL = 'https://archive.org/download/dayz-standalone-ost-full-ambient-soundtrack-by-filip-mi-s-ek-dayz-standalone-1.25-zy-wk-9i-gmmnc/DAYZ%20STANDALONE%20OST%20-%20FULL%20AMBIENT%20SOUNDTRACK%20BY%20FILIP%20MI%CC%81S%CC%8CEK%20_%20DAYZ%20STANDALONE%201.25%20%5BzyWK9iGMMnc%5D.mp3';

class BgMusic {
  constructor() {
    this.audio = null;
    this.volume = parseFloat(localStorage.getItem('deadzone_music_vol') || '0.15');
    this.enabled = localStorage.getItem('deadzone_music_enabled') !== 'false';
    this.unlocked = false;
    this._fadingIn = false;
  }

  init() {
    // Create audio element early
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = 0;
    this.audio.preload = 'none';
    this.audio.src = MUSIC_URL;

    // Browser autoplay policy: wait for first user interaction
    const unlock = () => {
      this.unlocked = true;
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
      if (this.enabled) {
        this._play();
      }
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock);
  }

  _play() {
    if (!this.audio || this._fadingIn) return;
    this.audio.volume = 0;

    // Jump to random position once metadata is loaded
    const seekRandom = () => {
      if (this.audio.duration && isFinite(this.audio.duration)) {
        this.audio.currentTime = Math.random() * this.audio.duration;
      }
    };

    if (this.audio.readyState >= 1) {
      seekRandom();
    } else {
      this.audio.addEventListener('loadedmetadata', seekRandom, { once: true });
    }

    this.audio.play().then(() => {
      this._fadeIn();
    }).catch(() => {
      // Autoplay blocked — will retry on next interaction
    });
  }

  _fadeIn() {
    this._fadingIn = true;
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      this.audio.volume = Math.min(this.volume, this.volume * (step / steps));
      if (step >= steps) {
        clearInterval(timer);
        this._fadingIn = false;
      }
    }, 50);
  }

  _fadeOut(callback) {
    if (!this.audio) return;
    const steps = 30;
    let step = 0;
    const startVol = this.audio.volume;
    const timer = setInterval(() => {
      step++;
      this.audio.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(timer);
        this.audio.pause();
        if (callback) callback();
      }
    }, 50);
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('deadzone_music_enabled', this.enabled.toString());
    if (!this.enabled) {
      this._fadeOut();
    } else if (this.unlocked) {
      this._play();
    }
    return this.enabled;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('deadzone_music_vol', this.volume.toString());
    if (this.audio && !this.audio.paused && !this._fadingIn) {
      this.audio.volume = this.volume;
    }
  }

  getVolume() {
    return this.volume;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const bgMusic = new BgMusic();
