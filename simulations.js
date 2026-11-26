/**
 * 7 Bespoke Interactive Scientific & Mathematical Simulations
 * Supports live EN / ZH-CN language switching and Pause Motion [P].
 */

import { SIM_I18N } from './i18n.js';

export class SimulationManager {
  constructor(audio) {
    this.audio = audio;
    this.lang = 'en';
    this.paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.activeSlideIndex = 0;
    this.sims = new Map();
    this.rafId = null;
    this.lastNow = performance.now();
  }

  initAll() {
    this.sims.set(1, new MindSpaceSim('canvas-mindspace', this.audio));
    this.sims.set(2, new TimeDilationSim('canvas-timedilation', this.audio));
    this.sims.set(4, new HyperbolicSim('canvas-hyperbolic', this.audio));
    this.sims.set(5, new RecursiveLoopsSim('canvas-loops', this.audio));
    this.sims.set(6, new LatentManifoldSim('canvas-latent', this.audio));
    this.sims.set(11, new KardashevSim('canvas-kardashev', this.audio));
    this.sims.set(12, new AlignmentBifurcationSim('canvas-alignment', this.audio));

    window.addEventListener('resize', () => this.resizeActive(), { passive: true });
    this.resizeActive();
    this.startLoop();
  }

  setLang(lang) {
    this.lang = lang;
    for (const sim of this.sims.values()) {
      sim.lang = lang;
      sim.onLangChange?.();
    }
    const active = this.sims.get(this.activeSlideIndex);
    if (active) {
      active.resize();
      active.draw(0, true);
    }
  }

  setActiveSlide(index) {
    this.activeSlideIndex = index;
    const sim = this.sims.get(index);
    if (sim) {
      sim.lang = this.lang;
      sim.onLangChange?.();
      sim.resize();
      sim.draw(0, true);
    }
  }

  setPaused(flag) {
    this.paused = flag;
    const sim = this.sims.get(this.activeSlideIndex);
    if (sim) sim.draw(0, true);
  }

  resizeActive() {
    const sim = this.sims.get(this.activeSlideIndex);
    if (sim) {
      sim.resize();
      sim.draw(0, true);
    }
  }

  startLoop() {
    const loop = (now) => {
      const dt = Math.min((now - this.lastNow) / 1000, 0.06);
      this.lastNow = now;
      const sim = this.sims.get(this.activeSlideIndex);
      if (sim && !this.paused) {
        sim.draw(dt, false);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
}

function fitCanvas(canvas) {
  if (!canvas) return { w: 1, h: 1, dpr: 1 };
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(240, Math.floor(rect.width));
  const h = Math.max(180, Math.floor(rect.height));
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}

/* ==========================================================================
   SIM 1 (Slide 02): UN-ANCHORED MIND-SPACE SPECTRUM ZOOM
   ========================================================================== */
class MindSpaceSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.zoomExp = 0;
    this.targetExp = 0;
    this.time = 0;

    this.slider = document.getElementById('slider-mindspace');
    this.readout = document.getElementById('readout-mindspace');
    this.presetBtns = document.querySelectorAll('[data-mind-zoom]');

    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        this.targetExp = parseFloat(e.target.value);
        this.syncReadout();
        this.audio?.playTick(this.targetExp / 6);
        this.draw(0, true);
      });
    }

    this.presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.targetExp = parseFloat(btn.dataset.mindZoom);
        if (this.slider) this.slider.value = String(this.targetExp);
        this.presetBtns.forEach((b) => b.classList.toggle('is-selected', b === btn));
        this.syncReadout();
        this.audio?.playChime(480 + this.targetExp * 55, 0.14);
        this.draw(0, true);
      });
    });

    this.entities = [
      { pos: 0.10, color: '#7b808e', tier: 'bio', lane: -28 },
      { pos: 0.34, color: '#9ca3b5', tier: 'bio', lane: 28 },
      { pos: 0.58, color: '#ebb04d', tier: 'human', lane: -54 },
      { pos: 0.76, color: '#ebb04d', tier: 'human', lane: 30 },
      { pos: 0.94, color: '#ffd27d', tier: 'human', lane: -26, isPeakHuman: true },
      { pos: 18.0, color: '#5ce1e6', tier: 'ai', lane: -34 },
      { pos: 320.0, color: '#5ce1e6', tier: 'ai', lane: 30 },
      { pos: 14000.0, color: '#52e5a0', tier: 'asi', lane: 34 },
      { pos: 650000.0, color: '#ff4d38', tier: 'cosmic', lane: -30 },
    ];
  }

  onLangChange() {
    this.syncReadout();
  }

  syncReadout() {
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    const scale = Math.pow(10, this.targetExp);
    if (this.readout) {
      this.readout.textContent =
        scale >= 1000 ? `${scale.toLocaleString()}${t.mindZoomSuffix}` : `${scale.toFixed(0)}${t.mindZoomShort}`;
    }
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt, immediate) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    const t = SIM_I18N[this.lang] || SIM_I18N.en;

    this.time += dt;
    if (immediate) {
      this.zoomExp = this.targetExp;
    } else {
      this.zoomExp += (this.targetExp - this.zoomExp) * Math.min(1, dt * 8);
    }

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const padX = 42;
    const axisY = h * 0.62;
    const usableW = w - padX * 2;
    const maxDomain = Math.pow(10, this.zoomExp);

    ctx.strokeStyle = 'rgba(243,239,230,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const gx = padX + (usableW * i) / 8;
      ctx.beginPath();
      ctx.moveTo(gx, 24);
      ctx.lineTo(gx, h - 24);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(243,239,230,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, axisY);
    ctx.lineTo(w - padX, axisY);
    ctx.stroke();

    const hStart = padX + Math.min(1, 0.58 / maxDomain) * usableW;
    const hEnd = padX + Math.min(1, 0.94 / maxDomain) * usableW;
    const spanW = Math.max(2, hEnd - hStart);

    ctx.fillStyle = 'rgba(235, 176, 77, 0.18)';
    ctx.fillRect(hStart, axisY - 50, spanW, 50);
    ctx.strokeStyle = '#ebb04d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px <= spanW; px += 2) {
      const norm = (px / Math.max(spanW, 1) - 0.5) * 3.1;
      const bell = Math.exp(-norm * norm) * 46;
      const x = hStart + px;
      const y = axisY - bell;
      if (px === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const monoFont = '11px "JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';
    if (spanW < 12) {
      ctx.fillStyle = '#ebb04d';
      ctx.font = `600 ${monoFont}`;
      ctx.fillText(t.mindCollapsed(spanW.toFixed(1)), padX + 6, 34);
    } else {
      ctx.fillStyle = 'rgba(235, 176, 77, 0.92)';
      ctx.font = `500 ${monoFont}`;
      ctx.textAlign = 'right';
      ctx.fillText(t.mindTrap, w - padX, 30);
      ctx.textAlign = 'left';
    }

    let lastLabelX = -200;
    this.entities.forEach((ent, idx) => {
      const ratio = ent.pos / maxDomain;
      if (ratio > 1.03) return;
      const x = padX + ratio * usableW;
      const label = t.mindEntities[idx] || '';

      const crushed = spanW < 36 && (ent.tier === 'bio' || ent.tier === 'human') && !ent.isPeakHuman;
      if (crushed) return;

      const pulse = 1 + 0.16 * Math.sin(this.time * 3 + idx);
      ctx.fillStyle = ent.color;
      ctx.beginPath();
      ctx.arc(x, axisY, ent.tier === 'cosmic' ? 6 * pulse : 4.5, 0, Math.PI * 2);
      ctx.fill();

      if (spanW >= 36 || Math.abs(x - lastLabelX) > 74 || ent.tier === 'cosmic' || ent.tier === 'asi') {
        const up = ent.lane < 0;
        const labelY = axisY + ent.lane;
        ctx.strokeStyle = 'rgba(243,239,230,0.22)';
        ctx.beginPath();
        ctx.moveTo(x, axisY);
        ctx.lineTo(x, up ? labelY + 5 : labelY - 11);
        ctx.stroke();

        ctx.fillStyle = ent.color;
        ctx.font = `500 ${monoFont}`;
        const alignRight = x > w - 155;
        ctx.textAlign = alignRight ? 'right' : 'left';
        ctx.fillText(label, alignRight ? x - 4 : x + 4, labelY);
        ctx.textAlign = 'left';
        lastLabelX = x;
      }
    });

    ctx.fillStyle = 'rgba(243,239,230,0.45)';
    ctx.font = '10.5px "JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';
    ctx.fillText(t.mindOrigin, padX, h - 12);
    ctx.textAlign = 'right';
    ctx.fillText(t.mindCeil(maxDomain.toLocaleString()), w - padX, h - 12);
    ctx.textAlign = 'left';
  }
}

/* ==========================================================================
   SIM 2 (Slide 03): SUBJECTIVE TIME & THE 10,000-YEAR WEEKEND
   ========================================================================== */
class TimeDilationSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.multiplier = 10000;
    this.bioSeconds = 0;
    this.subjYears = 0;
    this.milestoneYears = [0.2, 1.8, 7.5, 24.0, 62.5, 190.0, 640.0, 2400.0];

    const btns = document.querySelectorAll('[data-speed-mult]');
    const resetBtn = document.getElementById('btn-reset-clock');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.multiplier = parseFloat(btn.dataset.speedMult);
        btns.forEach((b) => b.classList.toggle('is-selected', b === btn));
        this.audio?.playChime(420 + Math.log10(this.multiplier) * 90, 0.14);
        this.draw(0, true);
      });
    });

    resetBtn?.addEventListener('click', () => {
      this.bioSeconds = 0;
      this.subjYears = 0;
      this.audio?.playTick(0.2);
      this.draw(0, true);
    });
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    const t = SIM_I18N[this.lang] || SIM_I18N.en;

    this.bioSeconds += dt;
    const acceleratedRate = (dt * this.multiplier) / 2600;
    this.subjYears += acceleratedRate;

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const midX = w * 0.37;
    const cjkMono = '"JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';

    ctx.strokeStyle = 'rgba(243,239,230,0.16)';
    ctx.beginPath();
    ctx.moveTo(midX, 12);
    ctx.lineTo(midX, h - 12);
    ctx.stroke();

    ctx.fillStyle = 'rgba(243,239,230,0.5)';
    ctx.font = `10.5px ${cjkMono}`;
    ctx.fillText(t.tdBioHeader, 18, 26);

    ctx.fillStyle = '#f3efe6';
    ctx.font = `600 28px ${cjkMono}`;
    ctx.fillText(`${this.bioSeconds.toFixed(1)}s`, 18, 64);

    ctx.fillStyle = 'rgba(243,239,230,0.55)';
    ctx.font = `11px ${cjkMono}`;
    ctx.fillText(t.tdWallElapsed, 18, 84);

    const cx = midX * 0.5;
    const cy = h * 0.64;
    const beat = Math.pow(Math.max(0, Math.sin(this.bioSeconds * Math.PI)), 8);
    const baseR = Math.min(midX, h) * 0.21;

    ctx.strokeStyle = 'rgba(235,176,77,0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR + beat * 12, 0, Math.PI * 2);
    ctx.stroke();

    const ang = (this.bioSeconds / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#ebb04d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * baseR * 0.85, cy + Math.sin(ang) * baseR * 0.85);
    ctx.stroke();

    ctx.fillStyle = '#ebb04d';
    ctx.font = `10px ${cjkMono}`;
    ctx.textAlign = 'center';
    ctx.fillText(t.tdCardiac, cx, cy + baseR + 24);
    ctx.textAlign = 'left';

    const rx = midX + 20;
    const rw = w - rx - 18;
    ctx.fillStyle = '#5ce1e6';
    ctx.font = `10.5px ${cjkMono}`;
    ctx.fillText(t.tdSynthHeader(this.multiplier.toLocaleString()), rx, 26);

    const weekendYears = (63 * 3600 * this.multiplier) / (365.25 * 86400);
    const weekendStr =
      weekendYears >= 100
        ? `${Math.round(weekendYears).toLocaleString()} ${t.tdSubjUnit}`
        : `${weekendYears.toFixed(2)} ${t.tdSubjUnit}`;

    ctx.fillStyle = '#f3efe6';
    ctx.font = `600 24px ${cjkMono}`;
    ctx.fillText(t.tdSubjYrs(this.subjYears.toFixed(2)), rx, 62);

    ctx.fillStyle = '#ebb04d';
    ctx.font = `11px ${cjkMono}`;
    ctx.fillText(t.tdWeekend(weekendStr), rx, 84);

    const barY = 100;
    const frac = (this.subjYears * 4) % 1;
    ctx.fillStyle = 'rgba(92, 225, 230, 0.14)';
    ctx.fillRect(rx, barY, rw, 6);
    ctx.fillStyle = '#5ce1e6';
    ctx.fillRect(rx, barY, rw * frac, 6);

    let yCursor = 128;
    this.milestoneYears.slice(0, 6).forEach((yr, idx) => {
      const unlocked = this.subjYears >= yr;
      const label = t.tdMilestones[idx] || '';
      ctx.fillStyle = unlocked ? 'rgba(92, 225, 230, 0.95)' : 'rgba(243, 239, 230, 0.34)';
      ctx.font = unlocked ? `600 11px ${cjkMono}` : `400 11px ${cjkMono}`;
      const prefix = unlocked ? '✓' : '·';
      ctx.fillText(`${prefix} [Yr ${yr.toFixed(1).padStart(5, ' ')}] ${label}`, rx, yCursor);
      yCursor += 22;
    });
  }
}

/* ==========================================================================
   SIM 3 (Slide 05): HYPERBOLIC SINGULARITY WALL vs. EXPONENTIAL
   ========================================================================== */
class HyperbolicSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.alpha = 1.65;
    this.time = 0;

    const slider = document.getElementById('slider-alpha');
    this.readout = document.getElementById('readout-alpha');
    this.doublingReadout = document.getElementById('readout-doubling');

    if (slider) {
      slider.addEventListener('input', (e) => {
        this.alpha = parseFloat(e.target.value);
        if (this.readout) this.readout.textContent = `α = ${this.alpha.toFixed(2)}`;
        this.updateDoublingText();
        this.audio?.playTick((this.alpha - 1) / 1.0);
        this.draw(0, true);
      });
    }
    this.updateDoublingText();
  }

  onLangChange() {
    this.updateDoublingText();
  }

  updateDoublingText() {
    if (!this.doublingReadout) return;
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    if (this.alpha <= 1.02) {
      this.doublingReadout.textContent = t.hypMoore;
    } else if (this.alpha < 1.4) {
      this.doublingReadout.textContent = t.hypMid;
    } else {
      this.doublingReadout.textContent = t.hypFast;
    }
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    const tr = SIM_I18N[this.lang] || SIM_I18N.en;
    const cjkMono = '"JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';
    this.time += dt;

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const padL = 48;
    const padR = 32;
    const padT = 28;
    const padB = 34;
    const pw = w - padL - padR;
    const ph = h - padT - padB;

    ctx.strokeStyle = 'rgba(243,239,230,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + ph);
    ctx.lineTo(padL + pw, padT + ph);
    ctx.stroke();

    const k = 0.34;
    const hasAsymptote = this.alpha > 1.005;
    const tc = hasAsymptote ? Math.min(0.96, 1 / (k * (this.alpha - 1) * 3.1 + 0.92)) : 999;

    ctx.strokeStyle = 'rgba(243,239,230,0.34)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const val = 0.06 + t * 0.22;
      const x = padL + t * pw;
      const y = padT + ph - val * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#5ce1e6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const val = (Math.exp(2.35 * t) - 0.85) / 16.0;
      const x = padL + t * pw;
      const y = padT + ph - Math.min(0.95, val) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (hasAsymptote && tc < 0.98) {
      const wallX = padL + tc * pw;
      const glow = ctx.createLinearGradient(wallX - 36, 0, wallX + 8, 0);
      glow.addColorStop(0, 'rgba(255, 77, 56, 0)');
      glow.addColorStop(0.85, 'rgba(255, 77, 56, 0.22)');
      glow.addColorStop(1, 'rgba(255, 77, 56, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(wallX - 36, padT, 44, ph);

      ctx.strokeStyle = '#ff4d38';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wallX, padT);
      ctx.lineTo(wallX, padT + ph);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = '#ebb04d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (hasAsymptote ? tc * 0.992 : 1.0);
      let val;
      if (!hasAsymptote) {
        val = (Math.exp(2.35 * t) - 0.85) / 16.0;
      } else {
        const denom = Math.max(0.015, 1 - t / tc);
        val = 0.06 * Math.pow(denom, -1 / (this.alpha - 1));
      }
      const clamped = Math.min(1.0, val);
      const x = padL + t * pw;
      const y = padT + ph - clamped * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      if (val >= 1.0) break;
    }
    ctx.stroke();

    if (hasAsymptote && tc < 0.98) {
      const wallX = padL + tc * pw;
      const badgeText = tr.hypWall;
      ctx.font = `600 10px ${cjkMono}`;
      const tw = ctx.measureText(badgeText).width + 14;
      const bx = wallX + tw + 12 < w - padR ? wallX + 8 : wallX - tw - 8;
      const by = padT + 6;
      ctx.fillStyle = 'rgba(8, 9, 14, 0.92)';
      ctx.fillRect(bx, by, tw, 20);
      ctx.strokeStyle = 'rgba(255, 77, 56, 0.65)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, tw, 20);
      ctx.fillStyle = '#ff4d38';
      ctx.fillText(badgeText, bx + 7, by + 13.5);
    }

    ctx.font = `11px ${cjkMono}`;
    ctx.fillStyle = '#ebb04d';
    ctx.fillText(tr.hypLeg1(this.alpha.toFixed(2)), padL + 14, padT + 36);
    ctx.fillStyle = '#5ce1e6';
    ctx.fillText(tr.hypLeg2, padL + 14, padT + 54);
    ctx.fillStyle = 'rgba(243,239,230,0.5)';
    ctx.fillText(tr.hypLeg3, padL + 14, padT + 72);

    ctx.fillStyle = 'rgba(243,239,230,0.45)';
    ctx.textAlign = 'right';
    ctx.fillText(tr.hypTime, padL + pw, padT + ph + 22);
    ctx.textAlign = 'left';
  }
}

/* ==========================================================================
   SIM 4 (Slide 06): THREE COUPLED RECURSIVE LOOPS REACTOR
   ========================================================================== */
class RecursiveLoopsSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.loops = [true, false, false];
    this.angle = 0;
    this.particles = Array.from({ length: 42 }, (_, i) => ({
      ring: i % 3,
      theta: (i / 42) * Math.PI * 2,
      speed: 0.8 + (i % 5) * 0.18,
    }));

    this.btns = document.querySelectorAll('[data-loop-idx]');
    this.gainReadout = document.getElementById('readout-loop-gain');

    this.btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.loopIdx, 10);
        this.loops[idx] = !this.loops[idx];
        btn.classList.toggle('is-selected', this.loops[idx]);
        this.syncGain();
        const count = this.loops.filter(Boolean).length;
        this.audio?.playChime(360 + count * 140, 0.18);
        this.draw(0, true);
      });
    });

    const igniteAll = document.getElementById('btn-ignite-loops');
    igniteAll?.addEventListener('click', () => {
      this.loops = [true, true, true];
      this.btns.forEach((b) => b.classList.add('is-selected'));
      this.syncGain();
      this.audio?.playChime(880, 0.28);
      this.draw(0, true);
    });

    this.syncGain();
  }

  onLangChange() {
    this.syncGain();
  }

  syncGain() {
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    const count = this.loops.filter(Boolean).length;
    if (this.gainReadout) {
      this.gainReadout.textContent = t.loopGains[count];
      this.gainReadout.style.color = count === 3 ? '#ff4d38' : count === 2 ? '#ebb04d' : '#5ce1e6';
    }
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    const cjkMono = '"JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';

    const activeCount = this.loops.filter(Boolean).length;
    const speedFactor = 0.35 + activeCount * activeCount * 0.55;
    this.angle += dt * speedFactor;

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.52;
    const cy = h * 0.52;
    const maxR = Math.min(w, h) * 0.37;

    const ringDefs = [
      { r: maxR * 0.44, name: t.loopRings[0], col: '#5ce1e6' },
      { r: maxR * 0.72, name: t.loopRings[1], col: '#ebb04d' },
      { r: maxR * 1.0, name: t.loopRings[2], col: '#ff4d38' },
    ];

    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxR * (0.28 + activeCount * 0.14));
    coreGrad.addColorStop(0, activeCount === 3 ? 'rgba(255,220,140,0.95)' : 'rgba(235,176,77,0.55)');
    coreGrad.addColorStop(0.5, activeCount === 3 ? 'rgba(255,77,56,0.28)' : 'rgba(92,225,230,0.12)');
    coreGrad.addColorStop(1, 'rgba(5,5,8,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ringDefs.forEach((rd, idx) => {
      const closed = this.loops[idx];
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.angle * (idx % 2 === 0 ? 1 : -0.8));

      ctx.strokeStyle = closed ? rd.col : 'rgba(243,239,230,0.16)';
      ctx.lineWidth = closed ? 2.2 : 1.2;
      if (!closed) ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, rd.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.fillStyle = closed ? rd.col : 'rgba(243,239,230,0.42)';
      ctx.font = `600 10.5px ${cjkMono}`;
      ctx.fillText(`${closed ? t.loopClosed : t.loopGated} // ${rd.name}`, 16, 22 + idx * 19);
    });

    this.particles.forEach((p) => {
      if (!this.loops[p.ring]) return;
      p.theta += dt * p.speed * speedFactor;
      const rd = ringDefs[p.ring];
      const px = cx + Math.cos(p.theta) * rd.r;
      const py = cy + Math.sin(p.theta) * rd.r;

      ctx.fillStyle = rd.col;
      ctx.beginPath();
      ctx.arc(px, py, activeCount === 3 ? 3.2 : 2.3, 0, Math.PI * 2);
      ctx.fill();

      if (activeCount >= 2 && p.speed > 1.25) {
        ctx.strokeStyle = 'rgba(255,210,125,0.14)';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }
    });
  }
}

/* ==========================================================================
   SIM 5 (Slide 07): 4D ALIEN LATENT MANIFOLD vs. 1D TOKEN SHADOW
   ========================================================================== */
class LatentManifoldSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.rotXW = 0.4;
    this.rotZW = 0.2;
    this.rotXY = 0.3;

    this.verts4D = [];
    for (let i = 0; i < 16; i++) {
      this.verts4D.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
    }
    this.edges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) {
          this.edges.push([i, j]);
        }
      }
    }

    const slider = document.getElementById('slider-latent');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.rotXW = parseFloat(e.target.value);
        this.audio?.playTick(this.rotXW / 6.28);
        this.draw(0, true);
      });
    }
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    const cjkMono = '"JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';

    this.rotXW += dt * 0.55;
    this.rotZW += dt * 0.37;
    this.rotXY += dt * 0.24;

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.42;
    const scale = Math.min(w, h) * 0.21;
    const shadowY = h - 34;

    const projected = this.verts4D.map(([x, y, z, ww]) => {
      const c1 = Math.cos(this.rotXW), s1 = Math.sin(this.rotXW);
      const x1 = x * c1 - ww * s1;
      const w1 = x * s1 + ww * c1;
      const c2 = Math.cos(this.rotZW), s2 = Math.sin(this.rotZW);
      const z2 = z * c2 - w1 * s2;
      const w2 = z * s2 + w1 * c2;
      const c3 = Math.cos(this.rotXY), s3 = Math.sin(this.rotXY);
      const x3 = x1 * c3 - y * s3;
      const y3 = x1 * s3 + y * c3;

      const persp4 = 1 / (2.5 - w2 * 0.65);
      const px3 = x3 * persp4;
      const py3 = y3 * persp4;
      const pz3 = z2 * persp4;
      const persp3 = 1 / (2.4 - pz3 * 0.55);

      return {
        sx: cx + px3 * persp3 * scale * 2.8,
        sy: cy + py3 * persp3 * scale * 2.8,
        depth: w2,
      };
    });

    ctx.strokeStyle = 'rgba(235, 176, 77, 0.12)';
    ctx.lineWidth = 1;
    projected.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(p.sx, p.sy);
      ctx.lineTo(p.sx, shadowY);
      ctx.stroke();
    });

    this.edges.forEach(([a, b]) => {
      const pa = projected[a];
      const pb = projected[b];
      const alpha = 0.28 + ((pa.depth + pb.depth + 2) / 4) * 0.55;
      ctx.strokeStyle = `rgba(92, 225, 230, ${alpha.toFixed(2)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.stroke();
    });

    projected.forEach((p) => {
      ctx.fillStyle = p.depth > 0 ? '#5ce1e6' : '#ebb04d';
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.depth > 0 ? 3.5 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(243,239,230,0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, shadowY);
    ctx.lineTo(w - 40, shadowY);
    ctx.stroke();

    projected.forEach((p) => {
      const quantX = Math.round(p.sx / 14) * 14;
      ctx.fillStyle = '#ebb04d';
      ctx.fillRect(quantX - 3, shadowY - 3, 6, 6);
    });

    ctx.fillStyle = '#5ce1e6';
    ctx.font = `600 10.5px ${cjkMono}`;
    ctx.fillText(t.latTop, 16, 22);

    ctx.fillStyle = '#ebb04d';
    ctx.fillText(t.latBot, 40, shadowY + 20);
  }
}

/* ==========================================================================
   SIM 6 (Slide 12): KARDASHEV & COMPUTRONIUM SCALE EXPLORER
   ========================================================================== */
class KardashevSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.logWatts = 22.0;
    this.time = 0;

    const slider = document.getElementById('slider-watts');
    this.wattsEl = document.getElementById('readout-watts');
    this.opsEl = document.getElementById('readout-ops');
    this.stageEl = document.getElementById('readout-kstage');

    if (slider) {
      slider.addEventListener('input', (e) => {
        this.logWatts = parseFloat(e.target.value);
        this.syncLabels();
        this.audio?.playTick((this.logWatts - 1.3) / 25.3);
        this.draw(0, true);
      });
    }
    this.syncLabels();
  }

  onLangChange() {
    this.syncLabels();
  }

  syncLabels() {
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    const exp = Math.floor(this.logWatts);
    const mant = Math.pow(10, this.logWatts - exp).toFixed(1);
    if (this.wattsEl) this.wattsEl.textContent = `${mant} × 10^${exp} W`;

    const opsExp = Math.round(this.logWatts + 20.4);
    if (this.opsEl) this.opsEl.textContent = `~10^${opsExp} ${t.karOpsUnit}`;

    if (this.stageEl) {
      if (this.logWatts < 3) this.stageEl.textContent = t.karStages[0];
      else if (this.logWatts < 10.5) this.stageEl.textContent = t.karStages[1];
      else if (this.logWatts < 14.5) this.stageEl.textContent = t.karStages[2];
      else if (this.logWatts < 18.5) this.stageEl.textContent = t.karStages[3];
      else if (this.logWatts < 24.5) this.stageEl.textContent = t.karStages[4];
      else this.stageEl.textContent = t.karStages[5];
    }
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    this.time += dt;

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const minDim = Math.min(w, h);
    const progress = Math.max(0, Math.min(1, (this.logWatts - 1.3) / 25.3));

    const starR = minDim * 0.11;
    const starGlow = ctx.createRadialGradient(cx, cy, starR * 0.2, cx, cy, minDim * 0.45);
    starGlow.addColorStop(0, '#fff7dc');
    starGlow.addColorStop(0.22, 'rgba(255, 198, 88, 0.85)');
    starGlow.addColorStop(0.55, `rgba(235, 176, 77, ${(0.28 * (1 - progress * 0.55)).toFixed(2)})`);
    starGlow.addColorStop(1, 'rgba(5,5,8,0)');
    ctx.fillStyle = starGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, minDim * 0.45, 0, Math.PI * 2);
    ctx.fill();

    const shellCount = Math.max(1, Math.floor(1 + progress * 6));
    for (let s = 0; s < shellCount; s++) {
      const r = starR * 1.45 + s * (minDim * 0.048);
      const tilt = 0.38 + (s % 3) * 0.18;
      const rot = this.time * (0.25 - s * 0.03) * (s % 2 === 0 ? 1 : -1) + s * 0.7;
      const nodes = Math.floor(8 + progress * 38 + s * 6);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot * 0.35);

      ctx.strokeStyle = s % 2 === 0 ? 'rgba(235,176,77,0.22)' : 'rgba(92,225,230,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * tilt, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let n = 0; n < nodes; n++) {
        const a = (n / nodes) * Math.PI * 2 + rot;
        const nx = Math.cos(a) * r;
        const ny = Math.sin(a) * r * tilt;
        ctx.fillStyle = n % 4 === 0 ? '#5ce1e6' : '#ebb04d';
        ctx.fillRect(nx - 1.8, ny - 1.8, 3.6, 3.6);
      }
      ctx.restore();
    }
  }
}

/* ==========================================================================
   SIM 7 (Slide 13): ALIGNMENT BIFURCATION PHASE PORTRAIT
   ========================================================================== */
class AlignmentBifurcationSim {
  constructor(canvasId, audio) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audio;
    this.lang = 'en';
    this.epsilon = 0.04;
    this.time = 0;

    const slider = document.getElementById('slider-epsilon');
    this.readout = document.getElementById('readout-epsilon');
    this.verdict = document.getElementById('readout-alignment-verdict');

    if (slider) {
      slider.addEventListener('input', (e) => {
        this.epsilon = parseFloat(e.target.value);
        this.syncVerdict();
        this.audio?.playTick(this.epsilon / 0.25);
        this.draw(0, true);
      });
    }
    this.syncVerdict();
  }

  onLangChange() {
    this.syncVerdict();
  }

  syncVerdict() {
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    if (this.readout) this.readout.textContent = t.alnDrift((this.epsilon * 100).toFixed(2));
    if (!this.verdict) return;
    if (this.epsilon <= 0.015) {
      this.verdict.textContent = t.alnVerdicts[0];
      this.verdict.style.color = '#52e5a0';
    } else if (this.epsilon <= 0.075) {
      this.verdict.textContent = t.alnVerdicts[1];
      this.verdict.style.color = '#ebb04d';
    } else {
      this.verdict.textContent = t.alnVerdicts[2];
      this.verdict.style.color = '#ff4d38';
    }
  }

  resize() {
    this.dims = fitCanvas(this.canvas);
  }

  draw(dt) {
    if (!this.canvas) return;
    if (!this.dims) this.resize();
    const t = SIM_I18N[this.lang] || SIM_I18N.en;
    const cjkMono = '"JetBrains Mono", "PingFang SC", "Microsoft YaHei UI", monospace';
    this.time += dt;

    const { ctx, w, h } = this.dims;
    ctx.clearRect(0, 0, w, h);

    const midY = h * 0.5;
    const saddleX = w * 0.52;

    ctx.fillStyle = 'rgba(82, 229, 160, 0.08)';
    ctx.fillRect(saddleX, midY - 22, w - saddleX - 18, 44);
    ctx.strokeStyle = 'rgba(82, 229, 160, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(24, midY);
    ctx.lineTo(w - 18, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(243,239,230,0.18)';
    ctx.beginPath();
    ctx.moveTo(saddleX, 18);
    ctx.lineTo(saddleX, h - 18);
    ctx.stroke();

    const count = 18;
    for (let i = 0; i < count; i++) {
      const spread = (i / (count - 1) - 0.5) * 2;
      const initOffset = spread * 9 + this.epsilon * (spread >= 0 ? 48 : -36);

      ctx.beginPath();
      let diverged = false;
      for (let px = 24; px <= w - 20; px += 6) {
        const u = (px - 24) / (w - 44);
        const gain = u < 0.45 ? 1 + u * 0.5 : Math.exp((u - 0.45) * (6.2 + this.epsilon * 18));
        const dy = initOffset * 0.35 * gain;
        const y = midY + Math.max(-midY + 14, Math.min(midY - 14, dy));
        if (Math.abs(y - midY) > 26) diverged = true;
        if (px === 24) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }

      ctx.strokeStyle = diverged ? 'rgba(255, 77, 56, 0.72)' : 'rgba(82, 229, 160, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const pu = (this.time * 0.38 + i * 0.07) % 1;
      const px = 24 + pu * (w - 44);
      const gain = pu < 0.45 ? 1 + pu * 0.5 : Math.exp((pu - 0.45) * (6.2 + this.epsilon * 18));
      const py = midY + Math.max(-midY + 14, Math.min(midY - 14, initOffset * 0.35 * gain));
      ctx.fillStyle = Math.abs(py - midY) > 26 ? '#ff4d38' : '#52e5a0';
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawPill = (txt, x, y, col, align = 'left') => {
      ctx.font = `600 10px ${cjkMono}`;
      const tw = ctx.measureText(txt).width + 14;
      const bx = align === 'right' ? x - tw : x;
      ctx.fillStyle = 'rgba(6, 8, 12, 0.9)';
      ctx.fillRect(bx, y - 13, tw, 19);
      ctx.strokeStyle = 'rgba(243,239,230,0.16)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, y - 13, tw, 19);
      ctx.fillStyle = col;
      ctx.fillText(txt, bx + 7, y);
    };

    drawPill(t.alnPills[0], 24, 22, 'rgba(243,239,230,0.78)');
    drawPill(t.alnPills[1], saddleX + 10, 22, '#ff4d38');
    drawPill(t.alnPills[2], saddleX + 10, h - 10, '#ff4d38');
    drawPill(t.alnPills[3], w - 20, midY + 4, '#52e5a0', 'right');
  }
}
