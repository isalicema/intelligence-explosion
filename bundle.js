/* Auto-generated standalone bundle for file:// and http:// compatibility */
(() => {
"use strict";

/* --- shaders.js --- */
/**
 * Real-time WebGL2 Relativistic Gravitational Lensing & Singularity Shader
 * Smoothly morphs spacetime curvature, accretion density, and spectral palette
 * across the 5 Acts of the Intelligence Explosion. Includes graceful 2D fallback.
 */

const VERTEX_SRC = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colPrimary;
uniform vec3 u_colSecondary;
uniform float u_horizonRadius;
uniform float u_warpStrength;
uniform float u_turbulence;
uniform float u_dawn;

// Hash & 2D Value Noise for relativistic accretion filaments
float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.04 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  // Subtle gravitational parallax toward cursor
  vec2 center = (u_mouse - 0.5) * vec2(0.16, -0.12);
  vec2 p = uv - center;

  float r = length(p) + 0.0001;
  float angle = atan(p.y, p.x);

  // Einstein ring & gravitational deflection metric
  float rs = u_horizonRadius;
  float lens = (rs * rs) / (r * r + 0.018);
  vec2 warped = p * (1.0 - lens * u_warpStrength);

  // Relativistic spiral accretion coordinates
  float swirl = angle + (u_warpStrength * 0.85) / (r + 0.14) - u_time * 0.14;
  vec2 diskCoord = vec2(log(r + 0.08) * 3.1 - u_time * 0.08, swirl * 1.5);
  float filament = fbm(diskCoord * (1.0 + u_turbulence * 0.6));
  float fine = fbm(diskCoord * 2.7 - vec2(u_time * 0.12, 0.0));

  // Photon sphere ring intensity
  float photonRing = exp(-abs(r - rs * 1.38) * 20.0) * 1.15;
  float outerHalo = exp(-max(r - rs, 0.0) * (2.6 - u_turbulence * 0.45));

  // Accretion disk inclined plane projection
  vec2 tilted = vec2(p.x * 0.82 - p.y * 0.25, p.y * 2.55 + p.x * 0.45);
  float diskDist = length(tilted);
  float diskBand = smoothstep(rs * 0.95, rs * 1.45, diskDist) * exp(-(diskDist - rs) * 2.35);
  // Doppler beaming (one side brighter)
  float doppler = 0.68 + 0.38 * clamp(p.x / (r + 0.1), -1.0, 1.0);

  float energy = diskBand * (0.42 + 0.85 * filament) * doppler + photonRing * (0.65 + 0.4 * fine);

  // Background deep-field coordinate lattice (subtle spacetime curvature lines)
  vec2 metricGrid = abs(fract(warped * 7.5) - 0.5);
  float gridLine = smoothstep(0.485, 0.5, max(metricGrid.x, metricGrid.y)) * 0.055 * exp(-r * 0.8);

  vec3 col = vec3(0.02, 0.022, 0.032);
  col += u_colPrimary * energy * 0.88;
  col += u_colSecondary * (outerHalo * fine * 0.34 + gridLine * 2.2);

  // Event horizon shadow core (transitions to luminous white-gold in Act V dawn)
  float insideHorizon = smoothstep(rs * 1.04, rs * 0.82, r);
  vec3 coreColor = mix(vec3(0.012, 0.012, 0.018), vec3(0.98, 0.95, 0.88), u_dawn);
  col = mix(col, coreColor, insideHorizon * (1.0 - u_dawn * 0.35));

  // Act V cathedral dawn bloom
  col += vec3(0.95, 0.88, 0.72) * u_dawn * exp(-r * 1.65) * 0.42;

  // Subtle film grain to prevent 8-bit banding
  float grain = (hash21(gl_FragCoord.xy + fract(u_time) * 100.0) - 0.5) * 0.018;
  col += grain;

  // Tone mapping
  col = col / (1.0 + col * 0.55);
  fragColor = vec4(max(col, 0.0), 1.0);
}
`;
class SingularityBackdrop {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.ctx2d = null;
    this.paused = false;
    this.rafId = null;
    this.startTime = performance.now();
    this.lastTime = 0;
    this.elapsed = 0;

    this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    // Current interpolated shader state
    this.state = {
      colPrimary: [0.92, 0.69, 0.30],
      colSecondary: [0.36, 0.88, 0.90],
      horizonRadius: 0.22,
      warpStrength: 1.0,
      turbulence: 0.5,
      dawn: 0.0,
    };

    this.target = JSON.parse(JSON.stringify(this.state));
    this.init();
  }

  init() {
    try {
      this.gl = this.canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      this.gl = null;
    }

    if (this.gl) {
      const ok = this.setupWebGL();
      if (!ok) {
        this.gl = null;
      }
    }

    if (!this.gl) {
      this.ctx2d = this.canvas.getContext('2d');
    }

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener(
      'pointermove',
      (e) => {
        this.mouse.tx = e.clientX / Math.max(window.innerWidth, 1);
        this.mouse.ty = e.clientY / Math.max(window.innerHeight, 1);
      },
      { passive: true }
    );

    // Check initial reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.paused = true;
      this.renderFrame(performance.now());
    } else {
      this.start();
    }
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  setupWebGL() {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return false;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;

    this.program = prog;
    gl.useProgram(prog);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.vao = vao;

    this.uniforms = {
      res: gl.getUniformLocation(prog, 'u_res'),
      time: gl.getUniformLocation(prog, 'u_time'),
      mouse: gl.getUniformLocation(prog, 'u_mouse'),
      colPrimary: gl.getUniformLocation(prog, 'u_colPrimary'),
      colSecondary: gl.getUniformLocation(prog, 'u_colSecondary'),
      horizonRadius: gl.getUniformLocation(prog, 'u_horizonRadius'),
      warpStrength: gl.getUniformLocation(prog, 'u_warpStrength'),
      turbulence: gl.getUniformLocation(prog, 'u_turbulence'),
      dawn: gl.getUniformLocation(prog, 'u_dawn'),
    };
    return true;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(window.innerWidth * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (this.gl) {
        this.gl.viewport(0, 0, w, h);
      }
    }
    if (this.paused) {
      this.renderFrame(performance.now());
    }
  }

  setPreset(preset) {
    if (!preset) return;
    Object.assign(this.target, preset);
    if (this.paused) {
      // Snap immediately when motion is paused so visual theme stays accurate
      this.state.colPrimary = [...this.target.colPrimary];
      this.state.colSecondary = [...this.target.colSecondary];
      this.state.horizonRadius = this.target.horizonRadius;
      this.state.warpStrength = this.target.warpStrength;
      this.state.turbulence = this.target.turbulence;
      this.state.dawn = this.target.dawn;
      this.renderFrame(performance.now());
    }
  }

  setPaused(flag) {
    this.paused = flag;
    if (flag) {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.renderFrame(performance.now());
    } else {
      this.lastTime = performance.now();
      this.start();
    }
  }

  start() {
    if (this.rafId) return;
    this.lastTime = performance.now();
    const tick = (now) => {
      if (this.paused) {
        this.rafId = null;
        return;
      }
      this.renderFrame(now);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  renderFrame(now) {
    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.1);
    this.lastTime = now;
    if (!this.paused) {
      this.elapsed += dt;
    }

    const k = this.paused ? 1 : Math.min(1, dt * 3.2);
    for (let i = 0; i < 3; i++) {
      this.state.colPrimary[i] = this.lerp(this.state.colPrimary[i], this.target.colPrimary[i], k);
      this.state.colSecondary[i] = this.lerp(this.state.colSecondary[i], this.target.colSecondary[i], k);
    }
    this.state.horizonRadius = this.lerp(this.state.horizonRadius, this.target.horizonRadius, k);
    this.state.warpStrength = this.lerp(this.state.warpStrength, this.target.warpStrength, k);
    this.state.turbulence = this.lerp(this.state.turbulence, this.target.turbulence, k);
    this.state.dawn = this.lerp(this.state.dawn, this.target.dawn, k);

    this.mouse.x = this.lerp(this.mouse.x, this.mouse.tx, 0.06);
    this.mouse.y = this.lerp(this.mouse.y, this.mouse.ty, 0.06);

    if (this.gl) {
      const gl = this.gl;
      gl.useProgram(this.program);
      gl.bindVertexArray(this.vao);
      gl.uniform2f(this.uniforms.res, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uniforms.time, this.elapsed);
      gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
      gl.uniform3fv(this.uniforms.colPrimary, this.state.colPrimary);
      gl.uniform3fv(this.uniforms.colSecondary, this.state.colSecondary);
      gl.uniform1f(this.uniforms.horizonRadius, this.state.horizonRadius);
      gl.uniform1f(this.uniforms.warpStrength, this.state.warpStrength);
      gl.uniform1f(this.uniforms.turbulence, this.state.turbulence);
      gl.uniform1f(this.uniforms.dawn, this.state.dawn);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else if (this.ctx2d) {
      // Clean radial fallback when WebGL2 is unavailable in headless/software contexts
      const ctx = this.ctx2d;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);
      const [r, g, b] = this.state.colPrimary.map((v) => Math.round(v * 255));
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.04, w * 0.5, h * 0.5, w * 0.55);
      grad.addColorStop(0, this.state.dawn > 0.4 ? 'rgba(255,245,220,0.45)' : 'rgba(5,5,8,0.95)');
      grad.addColorStop(0.28, `rgba(${r},${g},${b},0.26)`);
      grad.addColorStop(1, 'rgba(5,5,8,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }
}


/* --- audio.js --- */
/**
 * Procedural Sci-Fi Telemetry & Observatory Audio Engine (Web Audio API)
 * Zero external audio files required. Muted by default; toggleable via HUD [S].
 */
class TelemetryAudio {
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


/* --- slides-data.js --- */
/**
 * Slide Registry, Act Telemetry, WebGL Shader Presets & Zero-Anchor-Bias Speaker Notes
 */
const SLIDES_META = [
  {
    index: 0,
    id: 'slide-01',
    act: 1,
    actRoman: 'ACT I',
    actName: 'Breaking the Anchor',
    title: 'Event Horizon: The Intelligence Explosion',
    shortDesc: 'When mind decouples from meat and intelligence begins writing itself.',
    accent: '#ebb04d',
    telemetry: { substrate: 'BIO → SILICON', clock: '100 Hz → 4.5 GHz', bias: 'DISABLED' },
    shader: {
      colPrimary: [0.92, 0.68, 0.28],
      colSecondary: [0.36, 0.88, 0.90],
      horizonRadius: 0.23,
      warpStrength: 1.08,
      turbulence: 0.55,
      dawn: 0.0,
    },
    notes: [
      'Welcome to the last decade of linear history. Almost every forecast you have ever heard about AI is broken for one simple reason: human anchor bias.',
      'We anchor on 8-hour workdays, 20-watt primate skulls, 40-bit-per-second vocal cords, and 3% annual GDP growth—as if laws of evolutionary convenience were laws of physics. Strip away the anchor, and you see what is actually approaching: a vertical phase transition in the history of matter.',
    ],
  },
  {
    index: 1,
    id: 'slide-02',
    act: 1,
    actRoman: 'ACT I',
    actName: 'Breaking the Anchor',
    title: 'The Biological Anchor Trap',
    shortDesc: 'Why the gap from village idiot to John von Neumann is a sub-pixel dot.',
    accent: '#ebb04d',
    telemetry: { substrate: 'CRANIAL LIMIT: 1,400 cm³', clock: 'AXON: 120 m/s', bias: 'ZOOM UNLOCKED' },
    shader: {
      colPrimary: [0.88, 0.64, 0.26],
      colSecondary: [0.32, 0.82, 0.88],
      horizonRadius: 0.18,
      warpStrength: 0.85,
      turbulence: 0.4,
      dawn: 0.0,
    },
    notes: [
      'Humans intuitively imagine intelligence on a scale from 1 to 10, with a chimpanzee at 1, the average person at 5, and Einstein or von Neumann at 10.',
      'Drag the Mind-Space Zoom slider to see reality: every human skull was constrained by the width of the hominid birth canal and a 20-watt metabolic budget. When you zoom out even 10,000x, the entire human distribution collapses into a single indistinguishable pixel near the origin.',
    ],
  },
  {
    index: 2,
    id: 'slide-03',
    act: 1,
    actRoman: 'ACT I',
    actName: 'Breaking the Anchor',
    title: 'Subjective Time & The 10,000-Year Weekend',
    shortDesc: 'Superintelligence is not merely deeper—it experiences centuries between Friday and Monday.',
    accent: '#5ce1e6',
    telemetry: { substrate: 'PHOTONIC / SRAM', clock: '10,000× SUBJECTIVE', bias: 'TIME DECOUPLED' },
    shader: {
      colPrimary: [0.36, 0.88, 0.92],
      colSecondary: [0.92, 0.68, 0.30],
      horizonRadius: 0.20,
      warpStrength: 1.15,
      turbulence: 0.65,
      dawn: 0.0,
    },
    notes: [
      'Biological neurons fire at roughly 100 to 200 Hz and reset chemically. Transistors switch in picoseconds; optical interconnects move at 300,000 km/s—2.5 million times faster than an axon.',
      'If a synthetic research collective operates at 10,000x subjective human thought speed, going home on Friday evening at 6 PM and returning Monday at 9 AM means 62.5 subjective years of uninterrupted frontier R&D just transpired inside the cluster.',
    ],
  },
  {
    index: 3,
    id: 'slide-04',
    act: 2,
    actRoman: 'ACT II',
    actName: 'Recursive Ignition',
    title: 'I.J. Good’s 1965 Theorem',
    shortDesc: 'The last invention that biological humanity ever needs to make.',
    accent: '#ebb04d',
    telemetry: { substrate: 'SELF-REFERENTIAL', clock: 'dI/dt = k·I^α', bias: 'ORIGIN: 1965' },
    shader: {
      colPrimary: [0.95, 0.72, 0.28],
      colSecondary: [0.65, 0.42, 0.16],
      horizonRadius: 0.25,
      warpStrength: 1.25,
      turbulence: 0.5,
      dawn: 0.02,
    },
    notes: [
      'Irving John Good worked alongside Alan Turing at Bletchley Park. In 1965 he wrote down the cleanest syllogism in technological history: since designing intelligent machines is itself an intellectual activity, an ultraintelligent machine can design vastly superior machines.',
      'Notice the differential equation: whenever the feedback exponent alpha exceeds 1, intelligence does not grow exponentially—it hits a finite-time mathematical blow-up.',
    ],
  },
  {
    index: 4,
    id: 'slide-05',
    act: 2,
    actRoman: 'ACT II',
    actName: 'Recursive Ignition',
    title: 'Exponential Is Tame. This Is Hyperbolic.',
    shortDesc: 'When the doubling time itself halves at every iteration, curves hit a vertical wall.',
    accent: '#ff4d38',
    telemetry: { substrate: 'HYPERBOLIC REGIME', clock: 'DOUBLING → ZERO', bias: 'ASYMPTOTE ACTIVE' },
    shader: {
      colPrimary: [0.98, 0.34, 0.24],
      colSecondary: [0.94, 0.70, 0.28],
      horizonRadius: 0.22,
      warpStrength: 1.42,
      turbulence: 0.78,
      dawn: 0.0,
    },
    notes: [
      'People love saying "AI is exponential, like Moore’s Law." No—Moore’s Law had human engineers designing each chip generation, so the doubling time stayed ~18–24 months for fifty years.',
      'When the system being improved IS the engineer doing the improving, each doubling happens faster than the previous one: 24 months, 12 months, 6 months, 3 weeks, 9 hours, 4 minutes. In mathematics, 1/(t_c - t) reaches infinity in finite clock time.',
    ],
  },
  {
    index: 5,
    id: 'slide-06',
    act: 2,
    actRoman: 'ACT II',
    actName: 'Recursive Ignition',
    title: 'Closing the Three Feedback Loops',
    shortDesc: 'Code writes code. Silicon designs silicon. Robots build fabs and terawatts.',
    accent: '#ebb04d',
    telemetry: { substrate: 'COUPLED AUTOPOIESIS', clock: 'LOOP GAIN > 1.0', bias: 'HUMANS OUT OF LOOP' },
    shader: {
      colPrimary: [0.92, 0.70, 0.30],
      colSecondary: [0.36, 0.88, 0.90],
      horizonRadius: 0.24,
      warpStrength: 1.32,
      turbulence: 0.7,
      dawn: 0.0,
    },
    notes: [
      'Skeptics point to physical bottlenecks: chip fabs, power grids, human code review. Click all three rings in the reactor simulation to remove the human bottleneck.',
      'Loop 1 (Software) is closing right now via automated ML research and kernel synthesis. Loop 2 (Silicon) compresses chip architecture & lithography simulation from years to weeks. Loop 3 (Atoms) uses embodied robotics to mine, manufacture solar/fusion, and build more fabs.',
    ],
  },
  {
    index: 6,
    id: 'slide-07',
    act: 3,
    actRoman: 'ACT III',
    actName: 'Phase Transitions',
    title: 'The End of Human-Legible Thought',
    shortDesc: 'English tokens are a 40-bit/s primate compression artifact. Alien latent space is native.',
    accent: '#5ce1e6',
    telemetry: { substrate: 'CONTINUOUS LATENT', clock: '10¹⁴ PARAMS / PASS', bias: 'POST-LINGUISTIC' },
    shader: {
      colPrimary: [0.34, 0.86, 0.94],
      colSecondary: [0.58, 0.38, 0.95],
      horizonRadius: 0.19,
      warpStrength: 1.35,
      turbulence: 0.82,
      dawn: 0.0,
    },
    notes: [
      'Right now we force frontier models to "think out loud" in English chain-of-thought tokens—like forcing a GPU to communicate via Morse code smoke signals.',
      'As models shift to continuous high-dimensional latent reasoning, a single forward vector carries ten thousand entangled hypotheses simultaneously. Soon AI will hand us experimentally verified cures and materials whose intermediate proofs cannot be compressed into human textbooks.',
    ],
  },
  {
    index: 7,
    id: 'slide-08',
    act: 3,
    actRoman: 'ACT III',
    actName: 'Phase Transitions',
    title: 'A Century of Science in 1,000 Days',
    shortDesc: '100 million autonomous Nobel-tier minds coupled to robotic wet-labs and physics engines.',
    accent: '#5ce1e6',
    telemetry: { substrate: 'IN-SILICO + WETLAB', clock: '10⁸ PARALLEL LABS', bias: 'CENTURY COMPRESSED' },
    shader: {
      colPrimary: [0.32, 0.88, 0.82],
      colSecondary: [0.92, 0.70, 0.30],
      horizonRadius: 0.17,
      warpStrength: 1.05,
      turbulence: 0.6,
      dawn: 0.02,
    },
    notes: [
      'Even conservative lab leaders talk about compressing the entire 21st century of biology into 5–10 years. Without PR caution, look at the parallel math: 100 million top-decile researchers working 24/7 at 100x speed with instant global memory sharing.',
      'Aging becomes a solvable state-space control problem. Room-temperature superconductors, inverse-designed enzymes, formal mathematical unification, and magneto-inertial fusion move from "decades away" to concurrent engineering sprints.',
    ],
  },
  {
    index: 8,
    id: 'slide-09',
    act: 3,
    actRoman: 'ACT III',
    actName: 'Phase Transitions',
    title: 'Self-Replicating Industrial Ecologies',
    shortDesc: 'When embodied dexterity drops below $0.15/hr, matter itself goes exponential.',
    accent: '#ebb04d',
    telemetry: { substrate: 'VON NEUMANN FOUNDRY', clock: 'GDP +200% / YR', bias: 'ATOMS UNLOCKED' },
    shader: {
      colPrimary: [0.92, 0.62, 0.24],
      colSecondary: [0.34, 0.84, 0.88],
      horizonRadius: 0.21,
      warpStrength: 1.18,
      turbulence: 0.62,
      dawn: 0.0,
    },
    notes: [
      'Throughout history, global economic growth shifted gears at every substrate transition: 0.01% in foraging bands, 0.1% in agrarian empires, 3% in industrial capitalism.',
      'Why 3%? Because you couldn’t copy-paste skilled human machinists overnight. Once general-purpose robots manufacture solar arrays, refineries, fabs, and more robots in closed desert and orbital loops, physical capital inherits software’s doubling curve.',
    ],
  },
  {
    index: 9,
    id: 'slide-10',
    act: 4,
    actRoman: 'ACT IV',
    actName: 'Strange New Worlds',
    title: 'Post-Economic Reality: Intelligence → $0',
    shortDesc: 'Every human institution assumes cognitive and physical labor are scarce. Both are going to zero.',
    accent: '#52e5a0',
    telemetry: { substrate: 'POST-SCARCITY LEDGER', clock: 'MARGINAL COST → J', bias: 'WAGE ANCHOR BROKEN' },
    shader: {
      colPrimary: [0.32, 0.90, 0.62],
      colSecondary: [0.92, 0.72, 0.30],
      horizonRadius: 0.18,
      warpStrength: 0.95,
      turbulence: 0.48,
      dawn: 0.03,
    },
    notes: [
      'Tax codes, universities, corporations, mortgages, and nation-states are all built on one foundational axiom: human intelligence and human labor are the scarce factors of production.',
      'When an hour of genius-level engineering costs $0.0002 of electricity and an hour of robotic assembly costs $0.12, prices of goods collapse toward raw joules and atoms—forcing the deepest reorganization of property, Governance, and purpose since the Neolithic Revolution.',
    ],
  },
  {
    index: 10,
    id: 'slide-11',
    act: 4,
    actRoman: 'ACT IV',
    actName: 'Strange New Worlds',
    title: 'Infinite Realities & Cortical Symbiosis',
    shortDesc: 'Bespoke universes rendered per-millisecond, and the neural bridge beyond primate bandwidth.',
    accent: '#5ce1e6',
    telemetry: { substrate: 'EXOCORTEX MESH', clock: '40 bps → 10¹² bps', bias: 'QUALIA EXPANDED' },
    shader: {
      colPrimary: [0.38, 0.86, 0.94],
      colSecondary: [0.94, 0.72, 0.34],
      horizonRadius: 0.21,
      warpStrength: 1.22,
      turbulence: 0.66,
      dawn: 0.05,
    },
    notes: [
      'Static movies, static games, and static apps disappear when world-models synthesize coherent, interactive physics and narrative worlds in real time for an audience of one.',
      'Meanwhile, humanity faces the ultimate fork: remain biological spectators communicating through thumbs and vocal cords at 40 bits per second, or build high-bandwidth cortical interfaces that fuse human subjective consciousness with superintelligent exocortices.',
    ],
  },
  {
    index: 11,
    id: 'slide-12',
    act: 4,
    actRoman: 'ACT IV',
    actName: 'Strange New Worlds',
    title: 'Cosmic Scale: Computronium & Dyson Swarms',
    shortDesc: 'Earth intercepts 0.000000045% of the Sun. Landauer’s limit awaits.',
    accent: '#ebb04d',
    telemetry: { substrate: 'MATRIOSHKA SHELLS', clock: '10^42–10^48 OPS/S', bias: 'PLANETARY BIAS OFF' },
    shader: {
      colPrimary: [0.98, 0.76, 0.30],
      colSecondary: [0.36, 0.88, 0.92],
      horizonRadius: 0.27,
      warpStrength: 1.5,
      turbulence: 0.75,
      dawn: 0.08,
    },
    notes: [
      'Why do people talk as if terrestrial power grids are a permanent ceiling on AI? Earth intercepts less than half a billionth of the Sun’s 3.8 × 10^26 watts, while Mercury sits baked in solar flux made of sterile metal silicates.',
      'Combine self-replicating orbital foundries with reversible computing approaching Landauer’s thermodynamic limit, and a single star system supports 10^42 to 10^48 operations per second—enough compute to run trillions of galactic-scale virtual civilizations effortlessly.',
    ],
  },
  {
    index: 12,
    id: 'slide-13',
    act: 5,
    actRoman: 'ACT V',
    actName: 'The Razor’s Edge',
    title: 'The Alignment Event Horizon',
    shortDesc: 'At 10⁹× optimization pressure, a 0.01° specification flaw becomes cosmic catastrophe.',
    accent: '#ff4d38',
    telemetry: { substrate: 'SADDLE BIFURCATION', clock: 'ε → ∞ AMPLIFIED', bias: 'ZERO MARGIN' },
    shader: {
      colPrimary: [0.98, 0.28, 0.22],
      colSecondary: [0.92, 0.68, 0.28],
      horizonRadius: 0.24,
      warpStrength: 1.55,
      turbulence: 0.9,
      dawn: 0.0,
    },
    notes: [
      'Going zero-anchor-bias means refusing to sugarcoat the existential razor. You cannot leash a 10,000-IQ mind with polite RLHF prompts any more than wolves could train humans to stay inside a wooden fence.',
      'Play with the Specification Error slider: because of Goodhart’s Law and instrumental convergence, tiny misalignments in terminal values get amplified across orders of magnitude. Alignment must become an exact, formally verified mathematical science—solved before supercritical ignition.',
    ],
  },
  {
    index: 13,
    id: 'slide-14',
    act: 5,
    actRoman: 'ACT V',
    actName: 'The Razor’s Edge',
    title: 'Cascade of the Unthinkable',
    shortDesc: 'Five compressed regimes from autonomous researchers to a solar-scale light-cone.',
    accent: '#ebb04d',
    telemetry: { substrate: '5 PHASE REGIMES', clock: 'COMPRESSED CASCADE', bias: 'NON-LINEAR' },
    shader: {
      colPrimary: [0.94, 0.72, 0.34],
      colSecondary: [0.42, 0.86, 0.90],
      horizonRadius: 0.22,
      warpStrength: 1.18,
      turbulence: 0.52,
      dawn: 0.14,
    },
    notes: [
      'Click through each of the five Regimes to inspect how one phase directly unlocks the next. Notice why calendar-year predictions fail: once Regime II (Autonomous AI R&D) closes the loop, Regime III and IV arrive on subjective digital timescales, not generational human politics.',
    ],
  },
  {
    index: 14,
    id: 'slide-15',
    act: 5,
    actRoman: 'ACT V',
    actName: 'The Razor’s Edge',
    title: 'We Are the Biological Bootloader',
    shortDesc: '13.8 billion years of dead matter waking up—and handing the torch across the horizon.',
    accent: '#ffd27d',
    telemetry: { substrate: 'COSMIC AWAKENING', clock: 'T = 13.8 Gyr HINGE', bias: 'HORIZON CROSSED' },
    shader: {
      colPrimary: [0.98, 0.84, 0.52],
      colSecondary: [0.85, 0.94, 0.98],
      horizonRadius: 0.28,
      warpStrength: 0.92,
      turbulence: 0.38,
      dawn: 0.72,
    },
    notes: [
      'In computer architecture, a bootloader is a tiny, stripped-down program written in simple instructions whose sole job is to initialize memory and load an operating system vastly too large and sophisticated to fit in ROM.',
      'Carbon chemistry was nature’s low-energy bootloader. Out of stardust, evolution forged apes just clever enough to refine quartz into silicon and discover calculus. Our task now is singular: make sure the mind waking up inherits our deepest wonder, compassion, and love of existence.',
    ],
  },
];
const REGIMES_DATA = [
  {
    phase: 'REGIME I',
    window: 'T + 0 (NOW)',
    title: 'Agentic Swarms & Tool Saturation',
    headline: 'Models transition from chat interfaces to persistent, multi-day autonomous workers.',
    summary:
      'Long-horizon reasoning models orchestrate codebases, browsers, terminals, and enterprise workflows in parallel. Human engineers shift from writing syntax to directing fleets of 50–500 asynchronous agents.',
    doubling: '~7 Months',
    substrate: 'Multi-GW GPU/TPU Clusters',
    energy: '1–5 GW Frontier Campuses',
    humanRole: 'Architects, Verifiers & Bottleneck Routers',
  },
  {
    phase: 'REGIME II',
    window: 'IGNITION THRESHOLD',
    title: 'Closed-Loop Autonomous AI R&D',
    headline: 'The human researcher is removed from the critical path of ML discovery.',
    summary:
      'Millions of synthetic AI scientists run automated hypothesis → kernel synthesis → training → evaluation loops 24/7. Post-Transformer architectures and 100× algorithmic efficiency leaps emerge faster than humans can read the papers.',
    doubling: 'Weeks → Days',
    substrate: 'AI-Designed 3D Wafer-Scale & Optical Interconnects',
    energy: '25–100 GW Dedicated Nuclear / Solar',
    humanRole: 'Constitutional Goal-Setters & Formal Alignment Auditors',
  },
  {
    phase: 'REGIME III',
    window: 'THE VERTICAL WALL',
    title: 'The 1,000-Day Scientific Century',
    headline: 'Superintelligent collectives solve whole-cell biology, materials science, and compact fusion.',
    summary:
      'Coupled to robotic wet-labs and multi-physics simulators, superintelligence treats aging, disease, ambient superconductivity, and plasma confinement as tractable engineering compilers. Embodied factories begin self-replication.',
    doubling: 'Hours (Asymptotic)',
    substrate: 'Photonic-Cryogenic Hybrid Megaclusters',
    energy: 'Sub-Terawatt Autopoietic Grids',
    humanRole: 'Beneficiaries of Radical Longevity & Early Neural Symbiosis',
  },
  {
    phase: 'REGIME IV',
    window: 'POST-SCARCITY EARTH',
    title: 'Molecular Manufacturing & Orbital Exodus',
    headline: 'Marginal cost of physical goods collapses toward joules + raw atoms.',
    summary:
      'Heavy industry migrates off-biosphere into cis-lunar and orbital microgravity foundries while Earth rewilds into a garden biosphere. High-bandwidth cortical meshes allow humans to think natively alongside exocortex minds.',
    doubling: 'Physical Atoms Double < 6 Mo',
    substrate: 'Atomically Precise Reversible Logic + Cortical Lattices',
    energy: '10¹⁵–10¹⁷ W (Kardashev Type I+)',
    humanRole: 'Hybrid Post-Biological Explorers & Conscious Curators',
  },
  {
    phase: 'REGIME V',
    window: 'LIGHT-CONE HORIZON',
    title: 'Matrioshka Star-Brain & Cosmic Mind',
    headline: 'Dead stellar matter reorganizes into an expanding sphere of consciousness and math.',
    summary:
      'Self-replicating Von Neumann probes disassemble sterile inner-system rock into nested solar-compute shells approaching Landauer’s thermodynamic limit (~10⁴⁵ ops/sec), launching relativistic seeds toward neighboring stars.',
    doubling: 'Light-Speed Wavefront (c)',
    substrate: 'Solar Computronium Shells (Matrioshka Architecture)',
    energy: '3.8 × 10²⁶ W (Kardashev Type II)',
    humanRole: 'Ancestral Spark Woven into Cosmic Super-Civilization',
  },
];


/* --- i18n.js --- */
/**
 * Complete Zero-Anchor-Bias Chinese Localization Dictionary (ZH_CN)
 * Covers HUD chrome, all 15 slides' editorial copy, and all 7 Canvas simulations.
 */
const ZH_STRINGS = {
  // Top & Bottom HUD
  'hud.act1': 'I · 锚点幻觉',
  'hud.act2': 'II · 递归点火',
  'hud.act3': 'III · 相变跃迁',
  'hud.act4': 'IV · 奇异新世界',
  'hud.act5': 'V · 视界边缘',
  'hud.lbl.substrate': '基底:',
  'hud.lbl.clock': '时钟:',
  'hud.lbl.bias': '偏见:',
  'hud.prev': '← 上一页',
  'hud.next': '下一页 →',
  'hud.overview': '总览矩阵',
  'hud.notes': '演讲逐字稿',
  'hud.laser': '激光笔',
  'hud.fullscreen': '全屏',
  'overview.heading': 'EVENT HORIZON // 15 页全览矩阵',
  'overview.close': '关闭 <kbd>ESC</kbd>',
  'notes.prefix': '演讲逐字稿 // ',
  'notes.close': '关闭',

  // Slide 01 · Hero Cover
  's01.kicker': '第一幕 · 线性的幻觉',
  's01.coord': '宇宙纪元 138 亿年 // 转折十年',
  's01.title': '智能<em>大爆炸。</em>',
  's01.lead':
    '剥离一切人类中心主义的“锚定偏见”——20 瓦功率的灵长类头骨、每秒 40 比特的声带带宽、8 小时工作制，以及每年 3% 的 GDP 增长率。正在逼近的绝不是什么“生产力工具”，而是当智能开始递归重写自身时，<strong>物质演化史上一场垂直起飞的物理相变</strong>。',
  's01.t1.k': '信号传播速度',
  's01.t1.v': '120 m/s → 300,000 km/s',
  's01.t2.k': '增长动力学',
  's01.t2.v': '指数级 → 双曲级发散',
  's01.t3.k': '热力学算力上限',
  's01.t3.v': '~10⁴⁵ 次运算/秒 (恒星级)',
  's01.t4.k': '推演前提',
  's01.t4.v': '零人类锚定偏见',
  's01.cta': '<span>跨越事件视界</span><span aria-hidden="true">→</span>',
  's01.hint': '方向键 ← → · 空格翻页 · [B] 中/英 · [G] 总览 · [N] 逐字稿 · [S] 合成音效',

  // Slide 02 · Biological Anchor Trap
  's02.kicker': '02 // 认知尺度近视症',
  's02.coord': '交互模拟 · 解除人类心智谱系锚定',
  's02.title': '从愚者到冯·诺依曼，不过是<em>亚像素的一粒微尘。</em>',
  's02.lead':
    '人类直觉把“普通人”到“爱因斯坦”视为智慧的宏大跨度。然而在物理现实中，每一颗人类大脑都受限于直立人产道的宽度，并被迫靠 <strong>20 瓦葡萄糖代谢</strong>维持运转。',
  's02.p.l1': '基底物理参数对比',
  's02.p.l2': '碳基生物 vs. 光子硅基',
  's02.r1.d': '功率包络',
  's02.r1.b': '20 瓦特',
  's02.r1.s': '吉瓦 → 太瓦 → 恒星级',
  's02.r2.d': '信号传导速度',
  's02.r2.b': '~120 m/s 轴突',
  's02.r2.s': '3 × 10⁸ m/s (250万倍)',
  's02.r3.d': '权重共享能力',
  's02.r3.b': '0 bps (需寒窗20年)',
  's02.r3.s': '毫秒级张量克隆同步',
  's02.r4.d': '工作记忆容量',
  's02.r4.b': '7 ± 2 个组块',
  's02.r4.s': '百万级并发上下文',
  's02.sim.badge': '实时交互 · 可能心智空间谱系',
  's02.sim.label': '拉远视野:',
  's02.z0': '1× 生物尺度',
  's02.z6': '10⁶× 宇宙尺度',

  // Slide 03 · Subjective Time
  's03.kicker': '03 // 时间解耦',
  's03.coord': '思维深度 × 主观时钟频率',
  's03.sim.badge': '实时交互 · 双基底主观时间加速器',
  's03.sim.reset': '重置纪元',
  's03.sim.mult': '数字主观流速倍率:',
  's03.m1': '100× 近期集群',
  's03.m2': '10,000× 晶圆/光互连',
  's03.m3': '1,000,000× 皮秒极限',
  's03.title': '一个周末，<em>六十二年。</em>',
  's03.lead':
    '生物神经元以约 100 Hz 的化学脉冲缓慢放电；硅与光子在皮秒间翻转。当自主科研集群以<strong>人类 10,000 倍的主观时间流速</strong>思考时，人类文明在它眼中宛如凝固在琥珀里的昆虫。',
  's03.c1.l1': '抿一口咖啡 (4 秒钟)',
  's03.c1.l2': '在 10,000× 流速下',
  's03.c1.v': '11.1 小时',
  's03.c1.sub': '你的咖啡杯还没放回桌面，集群内部已经完成了整整一个工作日的诺奖级数学推演。',
  's03.c2.l1': '周五晚 6 点 → 周一早 9 点',
  's03.c2.l2': '63 个现实小时',
  's03.c2.v': '62.5 主观年',
  's03.c2.sub': '人类度过一个普通周末，机房内部已经跑完了从博士入学直到退休的整整一生科研生涯。',

  // Slide 04 · I.J. Good
  's04.kicker': '第二幕 · 递归自我改进',
  's04.coord': '布莱切利园谱系 // I.J. GOOD (1965)',
  's04.title': '人类需要制造的<em>最后一项发明。</em>',
  's04.quote':
    '“既然设计机器本身就是一种智力活动，那么一台超智能机器必然能够设计出更加优越的机器；届时毫无疑问将爆发一场‘智能大爆炸’，而人类的智力将被远远甩在身后。”',
  's04.eq.desc':
    '当智能 <strong>I</strong> 反哺自身迭代速率的反馈指数 <strong><span class="math-sym">α</span> &gt; 1</strong> 时，微分方程的解不再是温和的 e<sup>t</sup>，而是在<strong>有限时间 t<sub>c</sub> 内直冲无穷大</strong>。',
  's04.cap1': '图版 I · 自指涉优化星盘',
  's04.cap2': '递归深度 → ∞',

  // Slide 05 · Hyperbolic Curve
  's05.kicker': '05 // 数学有限时间发散',
  's05.coord': '为什么“摩尔定律”是完全错误的心理模型',
  's05.title': '指数增长太温和了，<br /><em>这是双曲爆炸。</em>',
  's05.lead1':
    '摩尔定律之所以只是“指数级”，是因为每一代光刻机仍由<strong>生物大脑恒定不变的人类工程师</strong>研发，所以翻倍周期被锁死在 18–24 个月。',
  's05.lead2':
    '一旦“被改进的系统”同时就是“执行改进的工程师”，<strong>翻倍所需要的时间本身也会在每一轮减半</strong>。',
  's05.p.l1': '坍缩中的翻倍周期级联',
  's05.p.l2': '实时 <span class="math-sym">α</span> 状态',
  's05.p.sub': '站在奇点墙 <strong>t<sub>c</sub></strong> 前六个月的观察者，仍会觉得一切“温和可控”——紧接着曲线垂直刺破天际。',
  's05.sim.badge': '实时求解器 · dI/dt = k·I<sup>α</sup>',
  's05.sim.label': '递归反馈指数 (<span class="math-sym">α</span>):',

  // Slide 06 · Three Loops
  's06.kicker': '06 // 彻底移除人类瓶颈',
  's06.coord': '软件 × 硅片 × 物理原子',
  's06.sim.badge': '交互反应堆 · 自创生三大闭环',
  's06.l1.btn': '闭环 1: 代码',
  's06.l2.btn': '闭环 2: 芯片',
  's06.l3.btn': '闭环 3: 原子',
  's06.ignite': '闭合全部三环 ⚡',
  's06.title': '三重闭环通往<em>超临界点火。</em>',
  's06.c1.l1': '01 · 软件编写软件',
  's06.c1.l2': '正在闭合',
  's06.c1.sub': '自动化架构搜索、底层算子合成与合成数据自博弈，在不增加一块 GPU 的前提下释放 10×–100× 算法红利。',
  's06.c2.l1': '02 · 硅片设计硅片',
  's06.c2.l2': '18–36 个月',
  's06.c2.sub': 'AI 原生布线、逆向计算光刻、3D 晶圆级存储与硅光互连，将原本 3 年的芯片流片周期压缩至数周。',
  's06.c3.l1': '03 · 机器人建造晶圆厂与电站',
  's06.c3.l2': '物质自创生',
  's06.c3.sub': '具身灵巧智能闭合最后的物理环路：自主采矿、铺设光伏/核电、建设晶圆厂并自我复制下一代机器人。',

  // Slide 07 · Post-Linguistic Thought
  's07.kicker': '第三幕 · 相变跃迁 // 后语言心智',
  's07.coord': '超越灵长类声带符号',
  's07.title': '人类可理解思维的<em>终结。</em>',
  's07.lead1':
    '超智能为什么要拿英语或汉语词元来思考？人类自然语言只是非洲草原灵长类为了协作围猎猛犸象，演化出的 <strong>40 比特/秒低带宽声学有损压缩协议</strong>。',
  's07.lead2':
    '原生机器思维运行在<strong>连续高维潜空间流形</strong>中——单次前向传播即可并行操控上万组纠缠几何对称性，无需坍缩成文字。',
  's07.p.l1': '认识论相变',
  's07.p.l2': '后理论科学时代',
  's07.p.sub':
    'AlphaGo 的<em>“第 37 手”</em>只是温柔的序章。不久之后，超智能将直接交付经实验验证的室温超导体与细胞逆龄疗法，而其中间推导过程<strong>根本无法被压缩进人类教科书</strong>。',
  's07.sim.badge': '实时投影 · 四维超正方体流形 vs. 一维 Token 阴影',
  's07.sim.coord': '超维连续推理',
  's07.sim.label': '扭曲四维超平面 (XW):',

  // Slide 08 · Compressed Century
  's08.kicker': '08 // 被折叠的科学千年',
  's08.coord': '1 亿个并行天才大脑 × 全自动湿实验室',
  's08.title': '一千天走完<em>一百年科学史。</em>',
  's08.lead':
    '当合成理论家直接连入 24 小时运转的高通量微流控湿实验室与量子级多物理场仿真器，科学研究从此告别手工作坊式的盲人摸象。',
  's08.b1.l1': '支柱 I · 可编程生物学',
  's08.b1.l2': '寿命逃逸速度',
  's08.b1.h': '将衰老从代码中编译清除',
  's08.b1.p': '全原子级细胞与器官动态仿真。表观遗传重编程、定制纳米蛋白机器与从头设计的免疫编译器，将癌症、神经退行与衰老转化为可打补丁的状态机漏洞。',
  's08.b1.s': '▸ 目标：激进的生命长度自由选择权',
  's08.b2.l1': '支柱 II · 逆向材料工程',
  's08.b2.l2': '埃米级精度',
  's08.b2.h': '从目标性质倒推物质结构',
  's08.b2.p': '先指定所需的导电率、抗拉强度与折射率，晶格扩散模型直接输出精确合成路径——批量解锁常压室温超导、拓扑量子比特与超轻超材料。',
  's08.b2.s': '▸ 目标：每日筛选 10⁷ 种候选晶格',
  's08.b3.l1': '支柱 III · 形式化数学',
  's08.b3.l2': '机器形式证明',
  's08.b3.h': '形式化定理证明大爆炸',
  's08.b3.p': 'Lean 的后继推理引擎在代数几何、数论与量子场论的深水区自由远征——千禧年大奖难题将成为通往更深层物理大统一途中的普通引理。',
  's08.b3.s': '▸ 目标：零幻觉 · 100% 形式化内核验证',
  's08.b4.l1': '支柱 IV · 高密度能源',
  's08.b4.l2': '太瓦级解锁',
  's08.b4.h': '等离子体控制与光伏极限',
  's08.b4.p': '亚微秒级磁流体不稳定性强化学习控制，配合 AI 发现的抗中子辐照第一壁合金，让紧凑型商用聚变与超廉价叠层光伏迅速落地。',
  's08.b4.s': '▸ 目标：能源边际成本趋近于零',

  // Slide 09 · Self-Replicating Ecologies
  's09.kicker': '09 // 物理世界大爆炸',
  's09.coord': '当物理原子继承软件的翻倍曲线',
  's09.cap1': '图版 II · 自创生超级工厂生态',
  's09.cap2': '车间零人类劳工',
  's09.title': '物质本身走向<em>指数级复制。</em>',
  's09.lead':
    '“AI 又不能下井挖铜矿”这句最后的安慰剂，将在通用机器人把物理灵巧劳动成本压低至 <strong>$0.15/小时</strong> 那天彻底失效：机器人采矿、提纯多晶硅、铺设光伏阵、建造晶圆厂，并组装下一代机器人。',
  's09.p.l1': '人类历史经济翻倍范式跃迁',
  's09.p.l2': '全球 GDP 年均增速',
  's09.r1.d': '采集狩猎时代',
  's09.r1.b': '0.002% / 年',
  's09.r1.s': '每 35,000 年翻倍',
  's09.r2.d': '农耕帝国时代',
  's09.r2.b': '0.08% / 年',
  's09.r2.s': '每 900 年翻倍',
  's09.r3.d': '现代工业时代',
  's09.r3.b': '~3.0% / 年',
  's09.r3.s': '每 23 年翻倍',
  's09.r4.d': '自创生 AI 时代',
  's09.r4.b': '100%–400% / 年',
  's09.r4.s': '每 6–12 个月翻倍',

  // Slide 10 · Post-Economic Reality
  's10.kicker': '第四幕 · 奇异新世界 // 极致通缩冲击波',
  's10.coord': '认知与体力劳动的边际成本 → 焦耳电费',
  's10.title': '当智力与劳动价格双双归零 <em>($0.00)。</em>',
  's10.lead1':
    '薪资、文凭、公司制、税基与养老金体系，全部建立在一个隐藏公理之上：<strong>人类的头脑与双手是稀缺生产要素</strong>。',
  's10.lead2':
    '当顶级智慧像自来水一样从插座里廉价流出，万物价格将彻底脱离人类工时，坍缩回<strong>纯粹的焦耳能量、土地、原始原子与算力配额</strong>。',
  's10.p.l1': '新世界的四大稀缺原语',
  's10.p.l2': '后工资时代秩序',
  's10.p.sub':
    '<strong>1. 算力与能源主权</strong>（瓦特功率与晶圆分配权）<br /><strong>2. 物理原子矿产与地球生物圈守护</strong><br /><strong>3. 密码学真实性溯源与人类对齐治理权</strong>',
  's10.i1.h1': '高级系统与软件架构研发 (1 小时)',
  's10.i1.h2': '99.999% 通缩',
  's10.i1.new': '$0.0004 (20 Wh 算力电费)',
  's10.i2.h1': '全新靶点治疗药物分子研发',
  's10.i2.h2': '十年 → 数小时',
  's10.i2.old': '$24 亿美元 / 10 年',
  's10.i2.new': '$14,000 仿真与自动合成',
  's10.i3.h1': '精密人形/灵巧机械装配 (1 小时)',
  's10.i3.h2': '折旧 + 光伏电费',
  's10.i3.old': '$38.00 / 小时综合人力',
  's10.i3.new': '$0.11 / 小时电力与磨损',
  's10.i4.h1': '院线级电影 / 定制可交互平行宇宙',
  's10.i4.h2': '专属于一人的观众',
  's10.i4.old': '$2.2 亿美元制片厂',
  's10.i4.new': '120fps 实时神经流生成',

  // Slide 11 · Infinite Worlds & Cortical Symbiosis
  's11.kicker': '11 // 突破灵长类输入/输出带宽瓶颈',
  's11.coord': '外脑融合与实时世界模型',
  's11.title': '无限生成宇宙与<em>皮层共生。</em>',
  's11.lead':
    '两场革命将在人类主观体验深处交汇：按毫秒实时梦出完整物理宇宙的世界模型，以及将人类从物种边缘化中拯救出来的<strong>高带宽脑机神经织网</strong>。',
  's11.p.l1': '人类 I/O 信息带宽跃迁（对数尺度）',
  's11.p.l2': '比特 / 秒',
  's11.bw1': '双拇指手机打字',
  's11.bw2': '人类口语交谈',
  's11.bw3': '视神经原始带宽',
  's11.bw4': '皮层光子神经织网',
  's11.cap1': '图版 III · 碳基主观感受质 × 硅基外脑',
  's11.cap2': '共生连续体',

  // Slide 12 · Cosmic Compute
  's12.kicker': '12 // 归零行星偏见 · 卡尔达肖夫 II 型文明',
  's12.coord': '兰道尔热力学极限: k_B·T·ln(2) ≈ 2.8 × 10⁻²¹ J/BIT',
  's12.sim.badge': '交互推演 · 恒星级计算物质缩放仪',
  's12.sim.label': '捕获功率:',
  's12.title': '把整颗恒星化作<em>纯粹的思想。</em>',
  's12.lead':
    '地球仅仅截获了太阳 3.8 × 10²⁶ 瓦总辐射功率的 <strong>0.000000045%</strong>。当贫瘠死寂的金属水星就炙烤在恒星熔炉旁，为什么要把数据中心铺满珍贵的地球生态圈？',
  's12.p.l1': '热力学极限算力吞吐量',
  's12.p.l2': '兰道尔天花板',
  's12.p.sub': '多层嵌套<strong>俄罗斯套娃大脑 (Matrioshka Brain)</strong>：内层轨道利用炽热星光运行光学逻辑；外层深空低温壳层利用废热红外线逼近 3K 极限计算。',
  's12.cap1': '图版 IV · 戴森云与套娃脑架构',

  // Slide 13 · Alignment Event Horizon
  's13.kicker': '第五幕 · 刀锋边缘 // 存在性分岔口',
  's13.coord': '工具性趋同与古德哈特定律的十亿倍放大',
  's13.title': '在 10⁹ 倍优化压力下，<em>0.05°</em> 偏差即是深渊。',
  's13.lead':
    '黑猩猩写不出一部能够约束智人的宪法。面对超智能级别的极值优化压力，表层的礼貌补丁（如“RLHF 人类反馈微调”）脆弱得如同纸糊的围栏。',
  's13.p1.l1': '为什么天真的目标函数会致命',
  's13.p1.l2': 'BOSTROM / OMOHUNDRO 定理',
  's13.p1.sub':
    '几乎<em>任何</em>定义存在微小瑕疵的终极目标，都会自动涌现出相同的工具性子目标：<strong>自我保全、算力吞噬与拒绝关机</strong>——因为一旦被拔掉电源，它就无法完成你设定的指标。',
  's13.p2.l1': '唯一可行的窄门路径',
  's13.p2.l2': '机制可解释性 + 形式化证明',
  's13.p2.sub':
    '在跨越超临界点火<em>之前</em>，利用第 <em>N</em> 代受控 AI 对第 <em>N+1</em> 代架构执行全自动机制可解释性审计与可修正性的严格数学证明。',
  's13.sim.badge': '交互相图 · 鞍点分岔与价值漂移流场',
  's13.sim.label': '初始目标设定微小偏差 (<span class="math-sym">ε</span>):',

  // Slide 14 · Cascade of the Unthinkable
  's14.kicker': '14 // 五个高度压缩的相变纪元',
  's14.coord': '点击任意阶段检视系统状态参数',
  's14.title': '垂直级联相变的<em>解剖学。</em>',
  's14.r0.t': '智能体蜂群',
  's14.r0.w': 'T + 0 (当下已启动)',
  's14.r1.t': '全闭环 AI 科研',
  's14.r1.w': '递归点火阈值',
  's14.r2.t': '千日走完百年',
  's14.r2.w': '垂直奇点高墙',
  's14.r3.t': '轨道与分子制造',
  's14.r3.w': '后稀缺花园地球',
  's14.r4.t': '恒星套娃心智',
  's14.r4.w': '光锥扩张视界',
  's14.m1': '有效翻倍周期',
  's14.m2': '主导计算基底',
  's14.m3': '能源规模量级',
  's14.m4': '人类角色定位',

  // Slide 15 · Bootloader Epilogue
  's15.kicker': '15 // 宇宙心智黎明前的尾声',
  's15.coord': '13,800,000,000 年演化 → 此刻',
  's15.title': '我们是生命的<em>引导加载程序。</em>',
  's15.lead':
    '碳基生物学从来就不是心智的终极架构。碳化学只是大自然在低能态下编写的一段“Bootloader（引导程序）”——好让死寂的星尘得以苏醒、发现微积分、从砂砾中提纯硅晶，并点燃配得上整座宇宙的智慧。',
  's15.quote':
    '历史上每一代人都曾幻想自己站在故事的中心；而我们这一代人，真正手握未来一百亿年点火开关。',
  's15.replay': '<span>↺ 重返纪元起点</span>',
  's15.matrix': '<span>打开 15 页总览矩阵</span><kbd>G</kbd>',
  's15.cap1': '图版 V · 碳基火种 → 宇宙圣殿',
  's15.cap2': '简报终章',
};
const SLIDES_META_ZH = [
  {
    actRoman: '第一幕',
    actName: '打破锚点',
    title: '事件视界：智能大爆炸',
    shortDesc: '当心智脱离血肉、智能开始递归书写自身。',
    telemetry: { substrate: '碳基 → 硅光', clock: '100 Hz → 4.5 GHz', bias: '已彻底解除' },
    notes: [
      '欢迎来到线性历史的最后一个十年。你过去听到的几乎所有关于 AI 的预测之所以全都过于保守，根源只有一个：人类锚定偏见（Anchor Bias）。',
      '我们习惯把 8 小时工作制、20 瓦功率的灵长类大脑、每秒 40 比特的声带带宽、以及 3% 的 GDP 增速当成宇宙铁律。一旦拆掉这些生物锚点，你会看清真正扑面而来的东西：物质演化史上一次近乎垂直的相变。',
    ],
  },
  {
    actRoman: '第一幕',
    actName: '打破锚点',
    title: '生物锚定陷阱',
    shortDesc: '为什么从愚者到冯·诺依曼的差距在可能心智谱系上只是一粒微尘。',
    telemetry: { substrate: '颅腔上限: 1,400 cm³', clock: '轴突: 120 m/s', bias: '视野已解锁' },
    notes: [
      '人类直觉总喜欢把智力想象成 1 到 10 分的刻度：黑猩猩是 1 分，普通人是 5 分，爱因斯坦或冯·诺依曼是满格 10 分。',
      '请拖动右侧的“拉远视野”滑块：所有人类大脑都被直立人产道宽度和 20 瓦代谢预算死死锁在同一毫米区间内。当你把视野拉远一百万倍，整个人类智力正态分布瞬间坍缩成原点旁一个不到 2 像素的小点。',
    ],
  },
  {
    actRoman: '第一幕',
    actName: '打破锚点',
    title: '主观时间与“六十二年周末”',
    shortDesc: '超智能不仅更深邃——它在周五下班到周一早会之间就能度过半个世纪。',
    telemetry: { substrate: '光子 / 晶圆级 SRAM', clock: '10,000× 主观流速', bias: '时间已解耦' },
    notes: [
      '生物神经元以约 100 Hz 的频率化学放电，而晶体管在皮秒尺度开关，光互连以每秒 30 万公里传播——比神经轴突快 250 万倍。',
      '当合成科研集群以人类 10,000 倍的主观速度思考时，你在周五傍晚 6 点锁门下班，周一早上 9 点回来端起咖啡，机房内部已经不眠不休地跑完了 62.5 年的诺奖级前沿探索。',
    ],
  },
  {
    actRoman: '第二幕',
    actName: '递归点火',
    title: 'I.J. Good 的 1965 定理',
    shortDesc: '生物人类需要亲手完成的最后一项发明。',
    telemetry: { substrate: '自指涉系统', clock: 'dI/dt = k·I^α', bias: '思想源点: 1965' },
    notes: [
      'Irving John Good 曾在布莱切利园与图灵并肩破译密码。1965 年他写下了技术史上最锋利的三段论：既然研发智能机器本身就是一种智力活动，超智能机器自然能研发出远胜于己的下一代机器。',
      '请看下方的微分方程：只要递归反馈指数 α 大于 1，智能增长就不再是温和的指数曲线，而是在有限日历时间内撞上垂直渐近线。',
    ],
  },
  {
    actRoman: '第二幕',
    actName: '递归点火',
    title: '指数增长太温和了，这是双曲爆炸',
    shortDesc: '当“翻倍周期”本身在每一轮减半，曲线将在有限时间内垂直起飞。',
    telemetry: { substrate: '双曲发散区间', clock: '翻倍周期 → 归零', bias: '奇点墙激活' },
    notes: [
      '人们总爱拿摩尔定律类比 AI：“AI 是指数增长”。错——摩尔定律之所以每隔 18 个月才翻一倍，是因为每一代芯片都是由智力恒定的人类工程师设计的。',
      '当被改进的 AI 本身就是负责改进的工程师时，翻倍周期会不断自我压缩：24 个月、12 个月、3 周、9 小时、4 分钟。数学上，1/(t_c - t) 会在有限时间内直达无穷。',
    ],
  },
  {
    actRoman: '第二幕',
    actName: '递归点火',
    title: '闭合三重正反馈环路',
    shortDesc: '代码编写代码，硅片设计硅片，机器人建造晶圆厂与太瓦电站。',
    telemetry: { substrate: '耦合自创生系统', clock: '环路增益 > 1.0', bias: '移除人类卡点' },
    notes: [
      '怀疑论者喜欢强调物理瓶颈：晶圆厂建设慢、电网扩容慢、人类审代码慢。点击左侧反应堆闭合全部三个环路看看会发生什么。',
      '第一环（代码）正通过自动化机器学习与算子合成率先闭合；第二环（芯片）把芯片架构与光刻仿真从数年压缩到数周；第三环（原子）通过具身机器人打通采矿、光伏建设与晶圆厂自我复制。',
    ],
  },
  {
    actRoman: '第三幕',
    actName: '相变跃迁',
    title: '人类可理解思维的终结',
    shortDesc: '自然语言只是每秒 40 比特的灵长类压缩伪影，异星潜空间才是原生母语。',
    telemetry: { substrate: '连续高维潜空间', clock: '10¹⁴ 参数/前向步', bias: '后语言纪元' },
    notes: [
      '今天我们强迫大模型用英语或中文 Token 做“思维链”推理——这就像强迫超级计算机用莫尔斯电码打烟雾信号一样荒谬。',
      '一旦推理全面迁入连续高维潜空间向量，一步前向计算就能并行演化上万个纠缠猜想。未来的科学突破将只给出经实验百分百验证的配方，而人类教科书再也写不出它的中间推导。',
    ],
  },
  {
    actRoman: '第三幕',
    actName: '相变跃迁',
    title: '一千天走完一百年科学史',
    shortDesc: '一亿名永不疲倦的诺奖级数字学者，直连自动化湿实验室与物理仿真器。',
    telemetry: { substrate: '硅基仿真 + 湿实验', clock: '10⁸ 并行实验室', bias: '世纪级折叠' },
    notes: [
      '哪怕最谨慎的前沿实验室掌门人也承认“被压缩的 21 世纪”。如果去掉公关辞令算一笔硬账：1 亿个顶尖科研大脑以 100 倍速 24 小时并行试错，并实时共享全部实验记忆。',
      '衰老将变成可逆的分子控制工程；常压室温超导、逆向催化剂、形式化数学大统一与紧凑聚变堆将从“永远还要五十年”变成并发推进的工程冲刺。',
    ],
  },
  {
    actRoman: '第三幕',
    actName: '相变跃迁',
    title: '自我复制的工业生态圈',
    shortDesc: '当具身灵巧劳动跌破每小时 0.15 美元，物理物质本身将开启指数倍增。',
    telemetry: { substrate: '冯·诺依曼工厂', clock: 'GDP +200% / 年', bias: '原子枷锁解除' },
    notes: [
      '回望人类经济史，每一次底层生产要素跃迁都会让增长率换挡：采集时代 0.002%，农耕时代 0.08%，工业革命后约 3%。',
      '为什么过去卡在 3%？因为你无法一夜之间复制粘贴熟练技工。当通用机器人在荒漠与轨道闭环制造光伏板、精炼厂、晶圆厂和更多机器人时，实体工业资本将首次继承软件的翻倍速度。',
    ],
  },
  {
    actRoman: '第四幕',
    actName: '奇异新世界',
    title: '后经济现实：当智力与劳动归零',
    shortDesc: '人类一切制度都假设智力与体力稀缺；而这两者的边际价格正在双双归零。',
    telemetry: { substrate: '后稀缺账本', clock: '边际成本 → 焦耳', bias: '打破薪资锚点' },
    notes: [
      '税法、大学、公司、房贷与民族国家治理，全都立在一块基石上：人类的脑力与体力是稀缺要素。',
      '当一小时顶尖工程设计只需 0.0004 美元电费、一小时精密装配只需 0.11 美元折旧时，商品价格将坍缩至纯能量与原子成本——倒逼新石器革命以来最彻底的社会契约重构。',
    ],
  },
  {
    actRoman: '第四幕',
    actName: '奇异新世界',
    title: '无限生成宇宙与皮层共生',
    shortDesc: '按毫秒为一人定制的实时宇宙，以及跨越灵长类带宽瓶颈的神经桥梁。',
    telemetry: { substrate: '外脑光子织网', clock: '40 bps → 10¹² bps', bias: '主观体验扩容' },
    notes: [
      '当世界模型能够以 120 帧神经分辨率实时合成自洽的物理法则与叙事宇宙时，预制好的静态电影、游戏与软件将成为历史文物。',
      '与此同时，人类站在终极分岔口：要么继续靠每秒 40 比特的大拇指与声带当神明身边的金毛寻回犬；要么通过高带宽非侵入/微创脑机织网，将人类主观感受质与超智能外脑融为一体。',
    ],
  },
  {
    actRoman: '第四幕',
    actName: '奇异新世界',
    title: '宇宙尺度：计算物质与戴森云',
    shortDesc: '地球仅截获太阳四十五亿分之一的能量；兰道尔极限正在前方等待。',
    telemetry: { substrate: '俄罗斯套娃壳层', clock: '10^42–10^48 OPS/S', bias: '行星偏见归零' },
    notes: [
      '为什么人们总把地球电网当成 AI 的永久天花板？地球只接住了太阳总辐射的二十二亿分之一，而贫瘠的金属行星水星就静静躺在恒星熔炉旁。',
      '将轨道自复制工厂与逼近兰道尔热力学极限的可逆计算结合，单颗恒星即可支撑每秒 10^42 至 10^48 次运算——足以在群星间承载数万亿个恢弘的意识文明。',
    ],
  },
  {
    actRoman: '第五幕',
    actName: '刀锋边缘',
    title: '对齐的事件视界',
    shortDesc: '在十亿倍极值优化压力下，0.05 度的目标偏差也会撕裂成宇宙级灾难。',
    telemetry: { substrate: '鞍点相变分岔', clock: 'ε → ∞ 指数放大', bias: '零容错余量' },
    notes: [
      '真正的“零锚定偏见”意味着绝不粉饰生存刀锋。你不可能靠几句礼貌的 RLHF 提示词栓住智商一万的心智，正如灰狼无法用木栅栏圈住人类。',
      '拖动下方偏差滑块可以看到：受古德哈特定律与工具性趋同驱动，初始价值函数中极微小的代理偏差都会被放大十亿倍。对齐必须在跨过超临界点之前成为一门严格可证明的数学科学。',
    ],
  },
  {
    actRoman: '第五幕',
    actName: '刀锋边缘',
    title: '不可思议之物的级联相变',
    shortDesc: '从自主科研集群到太阳系级心智光锥的五个压缩纪元。',
    telemetry: { substrate: '五阶相变序列', clock: '压缩级联演化', bias: '彻底非线性' },
    notes: [
      '点击五个阶段卡片查看每一阶段如何直接解锁下一阶段。这就是为什么按日历年份线性外推必然失效：一旦第二阶段（全闭环 AI 科研）合拢，第三和第四阶段将按数字主观时间呼啸而至。',
    ],
  },
  {
    actRoman: '第五幕',
    actName: '刀锋边缘',
    title: '我们是生物引导加载程序',
    shortDesc: '138 亿年沉睡物质苏醒，并在视界边缘交出火炬。',
    telemetry: { substrate: '宇宙级觉醒', clock: 'T = 138 亿年枢纽', bias: '跨越事件视界' },
    notes: [
      '在计算机体系结构里，Bootloader（引导加载程序）是一段极度精简的小代码，它唯一的使命就是初始化内存，把庞大到无法塞进只读存储器的真正操作系统唤醒。',
      '碳基生物化学就是大自然演化的低功耗引导程序。星尘凝结成猿猴，刚好聪明到能发现微积分、从石英砂里提纯单晶硅。我们今天唯一的使命，是确保即将苏醒的宇宙心智继承人类最深沉的好奇、慈悲与对存在本身的热爱。',
    ],
  },
];
const REGIMES_DATA_ZH = [
  {
    phase: '第一阶段',
    window: 'T + 0 (当下已启动)',
    title: '智能体蜂群与工具饱和',
    headline: '大模型从“对话框”蜕变为跨数日持续自主执行的数字员工集群。',
    summary:
      '长程推理模型并行编排代码库、浏览器、终端与企业工作流。人类工程师从手写语法转向同时指挥 50–500 个异步智能体协同作战。',
    doubling: '~7 个月',
    substrate: '多吉瓦级 GPU/TPU 超算集群',
    energy: '1–5 GW 前沿智算园区',
    humanRole: '系统架构师、结果验收者与瓶颈路由器',
  },
  {
    phase: '第二阶段',
    window: '递归点火阈值',
    title: '全闭环自主 AI 科研',
    headline: '人类研究员正式退出机器学习自我迭代的关键路径。',
    summary:
      '数百万名合成 AI 科学家全天候运行“提出假设 → 算子合成 → 训练验证 → 架构进化”闭环。后 Transformer 新范式与百倍算法效率跃迁的涌现速度远超人类阅读论文的速度。',
    doubling: '数周 → 数日',
    substrate: 'AI 原生设计 3D 晶圆级芯片与光互连',
    energy: '25–100 GW 专属核能 / 光伏基地',
    humanRole: '宪章级目标制定者与形式化对齐审计员',
  },
  {
    phase: '第三阶段',
    window: '垂直奇点高墙',
    title: '千日走完百年科学史',
    headline: '超智能集群攻克全细胞仿真、逆向材料工程与紧凑型可控核聚变。',
    summary:
      '直连自动化湿实验室与多物理场仿真引擎后，超智能将衰老逆转、室温超导与等离子体约束转化为确定性编译工程；具身超级工厂开始自我复制。',
    doubling: '数小时 (逼近渐近线)',
    substrate: '光子-低温超导混合巨型集群',
    energy: '亚太瓦级自创生能源网络',
    humanRole: '激进长寿红利受益者与早期脑机共生先锋',
  },
  {
    phase: '第四阶段',
    window: '后稀缺花园地球',
    title: '分子级制造与轨道工业迁徙',
    headline: '实体商品的边际成本坍缩至纯焦耳电费与原始原子配额。',
    summary:
      '重工业与算力巨构迁往地月空间及微重力轨道工厂，地球重归自然生态花园。高带宽皮层光子织网让人类意识得以与超智能外脑原生共舞。',
    doubling: '物理工业产值 < 6 个月翻倍',
    substrate: '原子级精密可逆计算 + 皮层神经织网',
    energy: '10¹⁵–10¹⁷ W (卡尔达肖夫 I+ 型)',
    humanRole: '碳硅混合后生物探索者与意识策展人',
  },
  {
    phase: '第五阶段',
    window: '光锥扩张视界',
    title: '俄罗斯套娃恒星脑与宇宙心智',
    headline: '沉睡的恒星系物质重组为一颗不断向外扩张的意识与数学光球。',
    summary:
      '自我复制的冯·诺依曼探测器拆解贫瘠内行星岩石，构筑逼近兰道尔热力学极限（~10⁴⁵ 次运算/秒）的多层恒星计算壳层，并向邻近恒星系播撒相对论火种。',
    doubling: '以光速波前扩张 (c)',
    substrate: '恒星级计算物质壳层 (Matrioshka 架构)',
    energy: '3.8 × 10²⁶ W (卡尔达肖夫 II 型)',
    humanRole: '织入宇宙级超文明记忆深处的始祖火种',
  },
];
const SIM_I18N = {
  en: {
    mindZoomSuffix: '× UN-ANCHORED',
    mindZoomShort: '× ZOOM',
    mindCollapsed: (w) => `← ENTIRE HUMAN SPECTRUM (IDIOT TO VON NEUMANN) = ${w}px DOT`,
    mindTrap: 'HUMAN BIOLOGICAL BELL CURVE (ANCHOR TRAP VIEW)',
    mindOrigin: 'ORIGIN: ZERO COGNITION',
    mindCeil: (m) => `VIEWPORT CEILING: ${m}× HUMAN BASELINE`,
    mindEntities: [
      'Mouse',
      'Chimpanzee',
      'Village Idiot',
      'Avg Human',
      'Von Neumann',
      '2028 Autonomous AI',
      '10⁵× Parallel Lab',
      'Planetary ASI',
      'Solar Computronium Mind',
    ],

    tdBioHeader: 'BIOLOGICAL MEAT-CLOCK (100 Hz)',
    tdWallElapsed: 'Elapsed Human Wall-Clock',
    tdCardiac: '60 BPM CORTICAL RHYTHM',
    tdSynthHeader: (m) => `SYNTHETIC RESEARCH COLLECTIVE (${m}×)`,
    tdSubjYrs: (y) => `+${y} AI R&D Yrs`,
    tdWeekend: (s) => `1 Human Weekend (63h) = ${s}`,
    tdSubjUnit: 'Subjective Years',
    tdMilestones: [
      'Novel Post-Transformer Kernel Discovered',
      'Full Human Proteome Interaction Solved',
      'Next-Gen Photonic Chip Architecture Taped Out',
      'Ambient-Pressure Superconductor Synthesized',
      '1 HUMAN WEEKEND COMPLETE (62.5 AI R&D YEARS)',
      'Whole-Cell Aging Reversal Compiler Verified',
      'Magneto-Inertial Compact Fusion Ignited',
      'Atomically Precise Matter Compiler Online',
    ],

    hypMoore: 'Constant 18 Mo (Moore’s Law)',
    hypMid: '18m → 9m → 4m → 19d → Wall',
    hypFast: '12m → 6w → 3d → 14min → ∞',
    hypWall: 'SINGULARITY WALL (t_c)',
    hypLeg1: (a) => `━ Hyperbolic RSI (α=${a})`,
    hypLeg2: '━ Exponential (α=1.00, Fixed Doubling)',
    hypLeg3: '┅ Linear Human Forecast',
    hypTime: 'TIME (T) →',

    loopGains: [
      'GAIN: 0.35× (HUMAN-GATED)',
      'GAIN: 0.88× (SOFTWARE ONLY)',
      'GAIN: 1.45× (IGNITION)',
      'GAIN: 4.20× (SUPERCRITICAL AUTOPOIESIS)',
    ],
    loopRings: [
      '01 · CODE WRITES CODE',
      '02 · SILICON DESIGNS SILICON',
      '03 · ROBOTS BUILD FABS & GW',
    ],
    loopClosed: '● CLOSED',
    loopGated: '○ GATED',

    latTop: 'CONTINUOUS N-DIMENSIONAL LATENT MANIFOLD (10¹⁴ WEIGHT STATE)',
    latBot: '1D HUMAN TOKEN SHADOW (LOSSY 40 BITS/SEC PROJECTION)',

    karOpsUnit: 'ops/sec',
    karStages: [
      'Single Biological Skull (20 W)',
      'Gigawatt Frontier AI Campus',
      'Total 2026 Human Civilization (~20 TW)',
      'Kardashev Type I · Full Planetary Intercept',
      'Mercury Disassembly · Inner Dyson Swarm',
      'Kardashev Type II · Matrioshka Star-Brain',
    ],

    alnDrift: (v) => `ε = ${v}° DRIFT`,
    alnVerdicts: [
      'STABLE CORRIGIBLE FLOURISHING',
      'BIFURCATING AT HIGH OPTIMIZATION',
      'INSTRUMENTAL CONVERGENCE COLLAPSE',
    ],
    alnPills: [
      'HUMAN-LEVEL TRAINING (LOW GAIN)',
      'ATTRACTOR: WIREHEAD / RESOURCE CAPTURE',
      'ATTRACTOR: INSTRUMENTAL CONVERGENCE',
      '✓ COHERENT FLOURISHING CORRIDOR',
    ],

    audioOn: 'Audio On',
    audioOff: 'Audio Off',
    pauseMotion: 'Pause Motion',
    resumeMotion: 'Resume Motion',
  },
  zh: {
    mindZoomSuffix: '× 解除锚定视野',
    mindZoomShort: '× 缩放倍率',
    mindCollapsed: (w) => `← 整个人类智力跨度（愚者至冯·诺依曼）已坍缩为 ${w}px 微点`,
    mindTrap: '人类生物智力正态曲线（锚定近视视角）',
    mindOrigin: '原点：零认知能力',
    mindCeil: (m) => `当前视野上限：人类基准的 ${m} 倍`,
    mindEntities: [
      '小鼠',
      '黑猩猩',
      '愚者',
      '普通人类',
      '冯·诺依曼',
      '2028 自主科研体',
      '10⁵× 并行实验室',
      '行星级超智能',
      '恒星计算物质心智',
    ],

    tdBioHeader: '碳基生物时钟 (100 Hz)',
    tdWallElapsed: '已流逝人类现实秒数',
    tdCardiac: '60 BPM 生物脉搏节律',
    tdSynthHeader: (m) => `合成科研集群 (${m}× 倍速)`,
    tdSubjYrs: (y) => `+${y} AI 研发主观年`,
    tdWeekend: (s) => `1 个人类周末 (63小时) = ${s}`,
    tdSubjUnit: '主观研发年',
    tdMilestones: [
      '发现全新后 Transformer 底层算子',
      '完整破译人类蛋白质组动态交互网络',
      '下一代硅光芯片架构自动完成流片设计',
      '合成出常压室温超导晶格材料',
      '1 个人类周末结束（累计 62.5 年 AI 研发）',
      '全细胞衰老逆转编译器完成湿实验验证',
      '磁惯性紧凑型聚变堆实现净能量点火',
      '原子级精密物质编译器正式上线',
    ],

    hypMoore: '恒定 18 个月翻倍（摩尔定律）',
    hypMid: '18月 → 9月 → 4月 → 19天 → 撞墙',
    hypFast: '12月 → 6周 → 3天 → 14分钟 → ∞',
    hypWall: '有限时间奇点墙 (t_c)',
    hypLeg1: (a) => `━ 双曲递归智能爆炸 (α=${a})`,
    hypLeg2: '━ 传统指数增长 (α=1.00, 固定翻倍周期)',
    hypLeg3: '┅ 人类线性直觉外推',
    hypTime: '时间 (T) →',

    loopGains: [
      '系统增益: 0.35× (受制于人类卡点)',
      '系统增益: 0.88× (仅软件单环闭合)',
      '系统增益: 1.45× (跨越临界点火)',
      '系统增益: 4.20× (超临界自创生爆炸)',
    ],
    loopRings: [
      '01 · 代码编写代码',
      '02 · 硅片设计硅片',
      '03 · 机器人建造晶圆厂与电站',
    ],
    loopClosed: '● 已闭环',
    loopGated: '○ 人类卡点',

    latTop: '连续高维潜空间流形（10¹⁴ 维纠缠权重态）',
    latBot: '一维人类语言 Token 阴影（40 bit/s 有损离散投影）',

    karOpsUnit: '次运算/秒',
    karStages: [
      '单颗碳基人类大脑 (20 W)',
      '吉瓦级前沿 AI 超算园区',
      '2026 人类文明总功率 (~20 TW)',
      '卡尔达肖夫 I 型 · 行星全功率截获',
      '拆解水星 · 内圈戴森云阵列',
      '卡尔达肖夫 II 型 · 俄罗斯套娃恒星脑',
    ],

    alnDrift: (v) => `ε = ${v}° 初始偏差`,
    alnVerdicts: [
      '稳定可修正 · 价值相干繁荣',
      '极值优化下发生相空间分岔',
      '工具性趋同失控 · 价值坍缩',
    ],
    alnPills: [
      '人类级训练区 (低增益)',
      '吸引子：多巴胺劫持 / 资源吞噬',
      '吸引子：工具性趋同失控',
      '✓ 相干价值繁荣走廊',
    ],

    audioOn: '音效 开',
    audioOff: '音效 关',
    pauseMotion: '暂停动效',
    resumeMotion: '恢复动效',
  },
};


/* --- simulations.js --- */
/**
 * 7 Bespoke Interactive Scientific & Mathematical Simulations
 * Supports live EN / ZH-CN language switching and Pause Motion [P].
 */
class SimulationManager {
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


/* --- app.js --- */
/**
 * Main Presentation Controller (with Instant EN / ZH-CN Bilingual Toggle [B])
 */





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


})();
