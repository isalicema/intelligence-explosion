/**
 * Procedural Sci-Fi Telemetry & Observatory Audio Engine (Web Audio API)
 * Zero external audio files required. Muted by default; toggleable via HUD [S].
 */

export class TelemetryAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.droneGain = null;
    this.oscA = null;
    this.oscB = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      if (this.ensureContext()) {
        this.startAmbientDrone();
        this.playChime(520, 0.12);
      }
    } else {
      this.stopAmbientDrone();
    }
    return this.enabled;
  }

  startAmbientDrone() {
    if (!this.ctx || this.droneGain) return;
    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.028, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);

    const oscA = this.ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(55, now); // A1 sub-bass

    const oscB = this.ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.setValueAtTime(82.41, now); // E2 fifth

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    oscA.start(now);
    oscB.start(now);

    this.droneGain = gain;
    this.droneFilter = filter;
    this.oscA = oscA;
    this.oscB = oscB;
  }

  stopAmbientDrone() {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;
    this.droneGain.gain.setTargetAtTime(0.0001, now, 0.18);
    const oscA = this.oscA;
    const oscB = this.oscB;
    setTimeout(() => {
      try {
        oscA?.stop();
        oscB?.stop();
      } catch {}
    }, 500);
    this.droneGain = null;
    this.oscA = null;
    this.oscB = null;
  }

  playSlideShift(direction = 'forward', actNumber = 1) {
    if (!this.enabled || !this.ensureContext()) return;
    const now = this.ctx.currentTime;

    // Subtle crystalline telemetry pulse
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const baseFreq = direction === 'forward' ? 220 + actNumber * 44 : 196 + actNumber * 36;
    const targetFreq = direction === 'forward' ? baseFreq * 1.498 : baseFreq * 0.75;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    if (this.droneFilter) {
      this.droneFilter.frequency.setTargetAtTime(120 + actNumber * 32, now, 0.4);
    }
  }

  playTick(ratio = 0.5) {
    if (!this.enabled || !this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340 + ratio * 680, now);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playChime(freq = 660, duration = 0.22) {
    if (!this.enabled || !this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
}
