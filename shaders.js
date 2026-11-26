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

export class SingularityBackdrop {
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
