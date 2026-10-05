// Web Audio API romantic music synthesizer & sound effects engine

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private melodyInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private currentStep = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft romantic piano/chime note
  public playTone(freq: number, duration = 0.6, type: OscillatorType = 'triangle', gainFactor = 0.3) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Soft envelope (gentle attack, soft decay)
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainFactor, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio might be blocked by user policy until gesture
    }
  }

  // Countdown chime (exact frequencies from demo: 523.25, 587.33, 659.25)
  public playCountdownChime(count: number) {
    const freqs = [659.25, 587.33, 523.25]; // 3, 2, 1
    const idx = Math.max(0, Math.min(2, 3 - count));
    this.playTone(freqs[idx] || 523.25, 0.45, 'sine', 0.4);
  }

  // Firework burst whoosh and pop
  public playFireworkBurst() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Noise buffer for firework pop
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start(now);

      // Harmonic sparkling sparkle
      setTimeout(() => {
        this.playTone(880, 0.3, 'triangle', 0.15);
        this.playTone(1320, 0.4, 'sine', 0.1);
      }, 50);
    } catch {
      // Audio fallback
    }
  }

  // Camera shutter snap for polaroid gallery
  public playCameraShutter() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Quick double click
      const click = (timeOffset: number) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(40, now + timeOffset + 0.05);

        gain.gain.setValueAtTime(0.3, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.05);
      };

      click(0);
      click(0.08);

      // Film ejection motor whirr
      setTimeout(() => {
        this.playTone(440, 0.25, 'triangle', 0.08);
      }, 140);
    } catch {
      // fallback
    }
  }

  // Candle blow puff
  public playBlowCandle() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.Q.setValueAtTime(2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch {
      // fallback
    }
  }

  // Satisfying balloon pop sound with melodic sparkle
  public playBalloonPop(index = 0) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // Pop burst (punchy pitch drop)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550 + (index % 6) * 45, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);

      // Noise puff
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.012));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);

      // Pentatonic sparkle chime for musical feedback
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const freq = scale[index % scale.length];
      setTimeout(() => {
        this.playTone(freq, 0.35, 'triangle', 0.2);
      }, 30);
    } catch {
      // fallback
    }
  }

  // Magical sparkle sound for opening envelope / gift
  public playMagicSparkle() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C, E, G, C, E
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.5, 'sine', 0.2);
      }, idx * 70);
    });
  }

  // Background romantic piano melody progression (Canon / Romance in D)
  private romanticMelodyNotes = [
    // Chord 1 (D Major: D4, F#4, A4, D5)
    [293.66, 369.99, 440.0, 587.33],
    // Chord 2 (A Major: A3, C#4, E4, A4)
    [220.0, 277.18, 329.63, 440.0],
    // Chord 3 (B Minor: B3, D4, F#4, B4)
    [246.94, 293.66, 369.99, 493.88],
    // Chord 4 (F# Minor: F#3, A3, C#4, F#4)
    [185.0, 220.0, 277.18, 369.99],
    // Chord 5 (G Major: G3, B3, D4, G4)
    [196.0, 246.94, 293.66, 392.0],
    // Chord 6 (D Major: D3, F#3, A3, D4)
    [146.83, 184.99, 220.0, 293.66],
    // Chord 7 (G Major: G3, B3, D4, G4)
    [196.0, 246.94, 293.66, 392.0],
    // Chord 8 (A7: A3, C#4, E4, G4)
    [220.0, 277.18, 329.63, 392.0]
  ];

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public startMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentStep = 0;

    const playNextChord = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const chord = this.romanticMelodyNotes[this.currentStep % this.romanticMelodyNotes.length];

      // Arpeggiate the romantic chord
      chord.forEach((note, noteIdx) => {
        setTimeout(() => {
          if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = noteIdx === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(note, this.ctx.currentTime);

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + 2.5);
          } catch {
            // ignore
          }
        }, noteIdx * 240);
      });

      this.currentStep++;
    };

    // Play initial chord immediately
    playNextChord();
    // Loop chords every 2.4 seconds
    this.melodyInterval = window.setInterval(playNextChord, 2400);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.melodyInterval !== null) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
  }
}

export const sound = new SoundEngine();
