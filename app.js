/**
 * Main Presentation Controller (with Instant EN / ZH-CN Bilingual Toggle [B])
 */

import { SingularityBackdrop } from './shaders.js';
import { TelemetryAudio } from './audio.js';
import { SimulationManager } from './simulations.js';
import { SLIDES_META, REGIMES_DATA } from './slides-data.js';
import { ZH_STRINGS, SLIDES_META_ZH, REGIMES_DATA_ZH, SIM_I18N } from './i18n.js';

class IntelligenceExplosionDeck {
  constructor() {
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.total = this.slides.length;
    this.currentIndex = 0;
    this.activeRegimeIdx = 1;
    this.lang = 'en';
    this.isTransitioning = false;
    this.motionPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.laserActive = false;
    this.wheelCooldown = 0;

    this.audio = new TelemetryAudio();
    this.backdrop = new SingularityBackdrop(document.getElementById('gl-backdrop'));
    this.simManager = new SimulationManager(this.audio);

    this.overviewDialog = document.getElementById('overview-dialog');
    this.notesPopover = document.getElementById('notes-popover');
    this.laserDot = document.getElementById('laser-dot');

    this.init();
  }

  init() {
    if (this.motionPaused) {
      document.body.classList.add('motion-paused');
    }

    // Snapshot original English innerHTML on every [data-i18n] node for exact round-trip toggling
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.dataset.enOrig = el.innerHTML;
    });

    this.simManager.initAll();
    this.buildOverviewCards();
    this.setupDialogFallbacks();
    this.bindHUDControls();
    this.bindRegimeSelector();
    this.bindNavigation();

    const initialIdx = this.parseHashIndex();
    this.applySlideState(initialIdx);
    this.syncDynamicControlLabels();
  }

  parseHashIndex() {
    const m = window.location.hash.match(/^#slide-(\d+)$/);
    if (!m) return 0;
    const n = parseInt(m[1], 10) - 1;
    return Number.isFinite(n) && n >= 0 && n < this.total ? n : 0;
  }

  getLocalizedMeta(index) {
    const base = SLIDES_META[index];
    if (!base) return null;
    if (this.lang !== 'zh') return base;
    const zh = SLIDES_META_ZH[index];
    return zh ? { ...base, ...zh } : base;
  }

  toggleLang() {
    this.setLang(this.lang === 'en' ? 'zh' : 'en');
  }

  setLang(lang) {
    this.lang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    this.audio.playChime(lang === 'zh' ? 587.33 : 493.88, 0.14);

    // Swap all static [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (lang === 'zh' && ZH_STRINGS[key] !== undefined) {
        el.innerHTML = ZH_STRINGS[key];
      } else if (el.dataset.enOrig !== undefined) {
        el.innerHTML = el.dataset.enOrig;
      }
    });

    const langLabel = document.getElementById('lang-label');
    if (langLabel) {
      langLabel.textContent = lang === 'zh' ? '中文 · EN' : 'EN · 中文';
    }

    this.buildOverviewCards();
    this.renderRegime(this.activeRegimeIdx);
    this.simManager.setLang(lang);
    this.applySlideState(this.currentIndex);
    this.syncDynamicControlLabels();
  }

  syncDynamicControlLabels() {
    const dict = SIM_I18N[this.lang] || SIM_I18N.en;
    const audioBtnTxt = document.querySelector('#btn-audio .btn-text');
    if (audioBtnTxt) {
      audioBtnTxt.textContent = this.audio.enabled ? dict.audioOn : dict.audioOff;
    }
    const motionBtnTxt = document.querySelector('#btn-motion .btn-text');
    if (motionBtnTxt) {
      motionBtnTxt.textContent = this.motionPaused ? dict.resumeMotion : dict.pauseMotion;
    }
  }

  buildOverviewCards() {
    const grid = document.getElementById('overview-grid');
    if (!grid) return;
    grid.innerHTML = '';

    SLIDES_META.forEach((_, idx) => {
      const meta = this.getLocalizedMeta(idx);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'overview-card' + (idx === this.currentIndex ? ' is-current' : '');
      btn.dataset.targetSlide = String(idx);
      btn.innerHTML = `
        <div class="ov-top">
          <span>${String(idx + 1).padStart(2, '0')} // ${meta.actRoman}</span>
          <span>${meta.actName}</span>
        </div>
        <div class="ov-title">${meta.title}</div>
        <div class="ov-sub">${meta.shortDesc}</div>
      `;
      btn.addEventListener('click', () => {
        this.overviewDialog?.close();
        this.goTo(idx, 'jump');
      });
      grid.appendChild(btn);
    });
  }

  setupDialogFallbacks() {
    if (this.overviewDialog && !('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dialog) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      this.overviewDialog.addEventListener('pointerdown', (e) => {
        if (e.target === this.overviewDialog) {
          pressedOutside = outside(e, this.overviewDialog);
        } else {
          pressedOutside = false;
        }
      });
      this.overviewDialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && e.target === this.overviewDialog && outside(e, this.overviewDialog)) {
          this.overviewDialog.close();
        }
        pressedOutside = false;
      });
    }

    this.overviewDialog?.addEventListener('close', () => {
      this.overviewDialog.returnValue = '';
    });
  }

  bindHUDControls() {
    document.getElementById('btn-lang')?.addEventListener('click', () => this.toggleLang());

    const actStartMap = { 1: 0, 2: 3, 3: 6, 4: 9, 5: 12 };
    document.querySelectorAll('[data-act-jump]').forEach((pill) => {
      pill.addEventListener('click', () => {
        const act = parseInt(pill.dataset.actJump, 10);
        const target = actStartMap[act] ?? 0;
        this.goTo(target, target >= this.currentIndex ? 'forward' : 'backward');
      });
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('btn-next')?.addEventListener('click', () => this.next());
    document.getElementById('btn-hero-begin')?.addEventListener('click', () => this.next());
    document.getElementById('btn-restart-deck')?.addEventListener('click', () => this.goTo(0, 'jump'));
    document.getElementById('btn-closing-overview')?.addEventListener('click', () => this.openOverview());
    document.getElementById('btn-overview')?.addEventListener('click', () => this.openOverview());
    document.getElementById('btn-notes')?.addEventListener('click', () => this.toggleNotes());
    document.getElementById('btn-close-notes')?.addEventListener('click', () => this.hideNotes());

    const audioBtn = document.getElementById('btn-audio');
    audioBtn?.addEventListener('click', () => {
      const on = this.audio.toggle();
      audioBtn.classList.toggle('is-active', on);
      this.syncDynamicControlLabels();
    });

    document.getElementById('btn-motion')?.addEventListener('click', () => this.toggleMotion());
    document.getElementById('btn-laser')?.addEventListener('click', () => this.toggleLaser());
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());

    window.addEventListener(
      'pointermove',
      (e) => {
        if (this.laserActive && this.laserDot) {
          this.laserDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      },
      { passive: true }
    );
  }

  renderRegime(idx) {
    this.activeRegimeIdx = idx;
    const list = this.lang === 'zh' ? REGIMES_DATA_ZH : REGIMES_DATA;
    const r = list[idx];
    if (!r) return;

    const nodes = document.querySelectorAll('[data-regime-idx]');
    nodes.forEach((n, i) => {
      n.classList.toggle('is-selected', i === idx);
      const phaseSpan = n.querySelector('.r-phase');
      if (phaseSpan && list[i]) phaseSpan.textContent = list[i].phase;
    });

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setTxt('regime-phase-badge', `${r.phase} // ${r.window}`);
    setTxt('regime-headline', r.headline);
    setTxt('regime-summary', r.summary);
    setTxt('regime-doubling', r.doubling);
    setTxt('regime-substrate', r.substrate);
    setTxt('regime-energy', r.energy);
    setTxt('regime-human', r.humanRole);
  }

  bindRegimeSelector() {
    document.querySelectorAll('[data-regime-idx]').forEach((node) => {
      node.addEventListener('click', () => {
        const idx = parseInt(node.dataset.regimeIdx, 10);
        this.audio.playChime(440 + idx * 75, 0.16);
        this.renderRegime(idx);
      });
    });
  }

  bindNavigation() {
    window.addEventListener('keydown', (e) => {
      if (this.overviewDialog?.open) return;
      const inInput = e.target.closest('input, textarea, select');

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (inInput && e.key === 'ArrowRight') return;
        e.preventDefault();
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (inInput && e.key === 'ArrowLeft') return;
        e.preventDefault();
        this.prev();
      } else if (e.key === ' ' && !e.target.closest('button, input, a, dialog')) {
        e.preventDefault();
        if (e.shiftKey) this.prev();
        else this.next();
      } else if (e.key === 'Home' && !inInput) {
        e.preventDefault();
        this.goTo(0, 'backward');
      } else if (e.key === 'End' && !inInput) {
        e.preventDefault();
        this.goTo(this.total - 1, 'forward');
      } else if ((e.key === 'b' || e.key === 'B') && !inInput) {
        e.preventDefault();
        this.toggleLang();
      } else if ((e.key === 'g' || e.key === 'G') && !inInput) {
        e.preventDefault();
        this.openOverview();
      } else if ((e.key === 'n' || e.key === 'N') && !inInput) {
        e.preventDefault();
        this.toggleNotes();
      } else if ((e.key === 's' || e.key === 'S' || e.key === 'm' || e.key === 'M') && !inInput) {
        e.preventDefault();
        document.getElementById('btn-audio')?.click();
      } else if ((e.key === 'p' || e.key === 'P') && !inInput) {
        e.preventDefault();
        this.toggleMotion();
      } else if ((e.key === 'l' || e.key === 'L') && !inInput) {
        e.preventDefault();
        this.toggleLaser();
      } else if ((e.key === 'f' || e.key === 'F') && !inInput) {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });

    window.addEventListener(
      'wheel',
      (e) => {
        if (this.overviewDialog?.open) return;
        if (e.target.closest('#notes-popover')) return;
        const now = performance.now();
        if (now - this.wheelCooldown < 750) return;

        const activeSlide = this.slides[this.currentIndex];
        if (activeSlide && activeSlide.scrollHeight > activeSlide.clientHeight + 8) {
          const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 4;
          const atTop = activeSlide.scrollTop <= 4;
          if (e.deltaY > 0 && !atBottom) return;
          if (e.deltaY < 0 && !atTop) return;
        }

        const primaryDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(primaryDelta) > 42) {
          this.wheelCooldown = now;
          if (primaryDelta > 0) this.next();
          else this.prev();
        }
      },
      { passive: true }
    );

    let touchX = null;
    let touchY = null;
    window.addEventListener(
      'touchstart',
      (e) => {
        if (e.target.closest('input[type="range"], dialog')) return;
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      'touchend',
      (e) => {
        if (touchX === null || touchY === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        const dy = e.changedTouches[0].clientY - touchY;
        touchX = null;
        touchY = null;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) this.next();
          else this.prev();
        }
      },
      { passive: true }
    );

    window.addEventListener('hashchange', () => {
      const idx = this.parseHashIndex();
      if (idx !== this.currentIndex) {
        this.goTo(idx, idx > this.currentIndex ? 'forward' : 'backward');
      }
    });
  }

  next() {
    if (this.currentIndex < this.total - 1) {
      this.goTo(this.currentIndex + 1, 'forward');
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goTo(this.currentIndex - 1, 'backward');
    }
  }

  focusActiveSlideHeading() {
    const active = this.slides[this.currentIndex];
    const heading = active?.querySelector('.slide-heading-focus');
    heading?.focus({ preventScroll: true });
  }

  goTo(targetIndex, direction = 'forward') {
    if (targetIndex < 0 || targetIndex >= this.total || targetIndex === this.currentIndex) return;
    if (this.isTransitioning) return;

    const meta = this.getLocalizedMeta(targetIndex);
    this.audio.playSlideShift(direction, meta?.act || 1);

    const updateDOM = () => {
      this.applySlideState(targetIndex);
    };

    if (!document.startViewTransition || this.motionPaused) {
      updateDOM();
      this.focusActiveSlideHeading();
      return;
    }

    this.isTransitioning = true;
    let transition;
    try {
      transition = document.startViewTransition({
        update: updateDOM,
        types: [direction],
      });
    } catch {
      transition = document.startViewTransition(updateDOM);
    }

    transition.finished.finally(() => {
      this.isTransitioning = false;
      this.focusActiveSlideHeading();
    });
  }

  applySlideState(index) {
    this.currentIndex = index;
    this.slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === index);
    });

    const meta = this.getLocalizedMeta(index);
    if (meta) {
      document.documentElement.style.setProperty('--act-accent', meta.accent);
      this.backdrop.setPreset(meta.shader);

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      setTxt('hud-substrate', meta.telemetry.substrate);
      setTxt('hud-clock', meta.telemetry.clock);
      setTxt('hud-bias', meta.telemetry.bias);
      setTxt('hud-slide-num', String(index + 1).padStart(2, '0'));
      setTxt('hud-slide-total', String(this.total).padStart(2, '0'));
      setTxt('notes-slide-title', `${String(index + 1).padStart(2, '0')} · ${meta.title}`);

      const notesBody = document.getElementById('notes-body');
      if (notesBody) {
        notesBody.innerHTML = meta.notes.map((p) => `<p>${p}</p>`).join('');
      }

      document.querySelectorAll('[data-act-jump]').forEach((pill) => {
        pill.classList.toggle('is-current', parseInt(pill.dataset.actJump, 10) === meta.act);
      });

      document.querySelectorAll('.overview-card').forEach((card, i) => {
        card.classList.toggle('is-current', i === index);
      });
    }

    const fill = document.getElementById('progress-fill');
    if (fill) {
      fill.style.width = `${((index + 1) / this.total) * 100}%`;
    }

    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === this.total - 1;

    this.simManager.setActiveSlide(index);
    history.replaceState(null, '', `#slide-${String(index + 1).padStart(2, '0')}`);
  }

  openOverview() {
    if (!this.overviewDialog || this.overviewDialog.open) return;
    this.overviewDialog.showModal();
    const currentCard = this.overviewDialog.querySelector('.overview-card.is-current');
    currentCard?.focus();
  }

  isNotesOpen() {
    if (!this.notesPopover) return false;
    return (
      this.notesPopover.matches(':popover-open') ||
      this.notesPopover.classList.contains('is-fallback-open')
    );
  }

  toggleNotes() {
    if (this.isNotesOpen()) {
      this.hideNotes();
    } else {
      this.showNotes();
    }
  }

  showNotes() {
    if (!this.notesPopover) return;
    if (typeof this.notesPopover.showPopover === 'function') {
      try {
        this.notesPopover.showPopover();
      } catch {}
    } else {
      this.notesPopover.classList.add('is-fallback-open');
    }
    document.getElementById('btn-notes')?.classList.add('is-active');
  }

  hideNotes() {
    if (!this.notesPopover) return;
    if (typeof this.notesPopover.hidePopover === 'function') {
      try {
        this.notesPopover.hidePopover();
      } catch {}
    } else {
      this.notesPopover.classList.remove('is-fallback-open');
    }
    document.getElementById('btn-notes')?.classList.remove('is-active');
  }

  toggleMotion() {
    this.motionPaused = !this.motionPaused;
    document.body.classList.toggle('motion-paused', this.motionPaused);
    this.backdrop.setPaused(this.motionPaused);
    this.simManager.setPaused(this.motionPaused);
    this.syncDynamicControlLabels();
  }

  toggleLaser() {
    this.laserActive = !this.laserActive;
    document.body.classList.toggle('laser-active', this.laserActive);
    document.getElementById('btn-laser')?.classList.toggle('is-active', this.laserActive);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.deck = new IntelligenceExplosionDeck();
});
