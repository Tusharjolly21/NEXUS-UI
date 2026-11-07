# Loupe Lens

Add the "Loupe Lens" component from Nexus UI to my project.

Loupe Lens: a glass ball you drag across a table of tiny printed things, and it bends the light like real glass. A fragment shader magnifies what is under it, refracts the rim with a separate bend for red, green and blue so white light splits into a spectrum, lays a thin film of colour along the edge, and adds a highlight, a window reflection, a soft shadow and a caustic. Under it sit eight printed objects drawn on a canvas, each with micro-print you can only read through the glass: a stamp, a ticket, a working watch dial, a map of the Amsterdam canals, a type specimen, a film strip, a facts label and a badge. Drag the glass and it follows on a spring, then coasts on release; tap the table and it glides there; drag an object and it lifts and tilts to the front. Scroll over it or pinch with two fingers to resize; arrow keys nudge it from the focused stage. A Lens panel sets size, magnification, refraction, dispersion and iridescence. It drifts by itself until first touch, pauses when off screen, shows a note when WebGL is missing, and with reduced motion it stays still.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { LoupeLens } from "@/components/loupe-lens";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/loupe-lens/index.ts ---

```ts
export { default as LoupeLens } from "./loupe-lens";
export type { LoupeLensProps } from "./loupe-lens";
```

--- components/loupe-lens/loupe-lens.tsx ---

```tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  FONT_STACK,
  INK,
  PRINTED_OBJECTS,
  TALL_EXTENT,
  TALL_LAYOUT,
  WIDE_EXTENT,
  WIDE_LAYOUT,
  type PrintedObject,
} from "./objects";

export type LoupeLensProps = {
  /** Let the glass drift across the table on its own until the first touch (stops for reduced motion). On by default. */
  autoplay?: boolean;
  /** Height of the scene in px, or "fill" to fill a positioned parent. */
  height?: number | "fill";
  /** Size of the glass as a multiple of its natural size (0.55 to 1.8). */
  size?: number;
  /** How much the middle of the glass magnifies (1 to 3.2). */
  magnification?: number;
  /** Index of refraction: how hard the rim bends the light (1.05 to 2.2). */
  refraction?: number;
  /** How far the rim splits white light into a spectrum (0 to 0.12). */
  dispersion?: number;
  /** How strongly a thin film of colour plays at the rim (0 to 1). */
  iridescence?: number;
  className?: string;
};

type LensSettings = {
  size: number;
  magnification: number;
  refraction: number;
  dispersion: number;
  iridescence: number;
};

const DEFAULT_SETTINGS: LensSettings = { size: 1, magnification: 1.65, refraction: 1.52, dispersion: 0.035, iridescence: 0.35 };

const SIZE_RANGE = { min: 0.55, max: 1.8 };

type SliderSpec = {
  key: keyof LensSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
};

const SLIDERS: SliderSpec[] = [
  { key: "size", label: "Size", min: 0.55, max: 1.8, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: "magnification", label: "Magnification", min: 1, max: 3.2, step: 0.01, format: (v) => `${v.toFixed(2)}x` },
  { key: "refraction", label: "Refraction", min: 1.05, max: 2.2, step: 0.01, format: (v) => v.toFixed(2) },
  { key: "dispersion", label: "Dispersion", min: 0, max: 0.12, step: 0.001, format: (v) => v.toFixed(3) },
  { key: "iridescence", label: "Iridescence", min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
];

// ───────────────────────── shaders ─────────────────────────
const VERTEX_SHADER = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

// The glass: a ball of glass on the table. It magnifies the middle, bends the light at the rim with GLSL refract(),
// splits red, green and blue apart for the spectrum, adds a film of colour, a highlight and a window reflection, and
// casts a shadow with a focused caustic.
const FRAGMENT_SHADER = `precision highp float;
uniform sampler2D uTex; uniform vec2 uSize; uniform float uDpr; uniform vec2 uC;
uniform float uR, uMag, uIor, uDisp, uIri, uDark, uTime;
vec3 S(vec2 q){ return texture2D(uTex, clamp(q / uSize, vec2(0.0), vec2(1.0))).rgb; }
vec2 bend(vec3 n, float ior){ return refract(vec3(0.0, 0.0, -1.0), n, 1.0 / ior).xy; }
void main(){
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 d = p - uC; float r = length(d) / uR;
  vec3 base = S(p);
  // shadow on the table, light from the upper left, with the light the ball focuses inside it
  float sd = length((d - vec2(0.24, 0.40) * uR) / vec2(1.0, 0.86)) / uR;
  float shadow = (1.0 - smoothstep(0.25, 1.22, sd)) * mix(0.34, 0.42, uDark);
  float cd = length((d - vec2(0.50, 0.86) * uR) / vec2(0.62, 0.36)) / uR;
  float caustic = (1.0 - smoothstep(0.0, 0.5, cd));
  vec3 outside = base * (1.0 - shadow) + vec3(1.0, 0.97, 0.9) * caustic * caustic * shadow * 1.5;
  if (r < 1.0) {
    float z = sqrt(max(1.0 - r * r, 0.0));
    vec3 n = normalize(vec3(d / uR, z));
    vec2 m = uC + d / uMag; float k = uR * 0.5 * r * r;
    vec3 col = vec3(S(m + bend(n, uIor - uDisp) * k).r, S(m + bend(n, uIor) * k).g, S(m + bend(n, uIor + uDisp) * k).b);
    float edge = 1.0 - z;
    col *= mix(vec3(1.0), vec3(0.95, 0.97, 1.0), 0.7);
    col *= 1.0 - (0.22 * smoothstep(0.62, 1.0, r) + 0.3 * smoothstep(0.9, 1.0, r)) * (1.0 - 0.5 * uDark);
    float F = 0.03 + 0.97 * pow(edge, 5.0);
    vec3 env = mix(vec3(1.0), mix(vec3(0.5, 0.52, 0.56), vec3(0.06, 0.06, 0.08), uDark), smoothstep(-0.8, 0.9, n.y));
    col = mix(col, env, F * 0.55);
    vec3 L = normalize(vec3(-0.45, -0.62, 0.65)); vec3 H = normalize(L + vec3(0.0, 0.0, 1.0)); float nh = max(dot(n, H), 0.0);
    col += pow(nh, 220.0) * 1.3 + pow(nh, 18.0) * 0.05;
    // a soft window reflected near the top left
    vec3 rf = reflect(vec3(0.0, 0.0, -1.0), n);
    col += 0.1 * smoothstep(0.62, 0.8, -rf.y) * smoothstep(0.14, 0.0, abs(rf.x + 0.3)) * (1.0 - smoothstep(0.85, 1.0, r));
    float glow = smoothstep(0.5, 1.0, r) * max(0.0, dot(d / max(length(d), 1e-4), normalize(vec2(0.55, 0.85))));
    col += vec3(1.0, 0.98, 0.94) * glow * glow * 0.22;
    float ph = r * 3.0 + atan(d.y, d.x) * 0.32 + uTime * 0.04;
    vec3 film = 0.5 + 0.5 * cos(6.2831 * (ph + vec3(0.0, 0.33, 0.67)));
    col = mix(col, col * (0.55 + film * 0.9), smoothstep(0.82, 1.0, r) * uIri * 0.5);
    float a = 1.0 - smoothstep(1.0 - 1.6 / uR, 1.0, r);
    gl_FragColor = vec4(mix(outside, col, a), 1.0);
  } else gl_FragColor = vec4(outside, 1.0);
}`;

// ───────────────────────── the engine ─────────────────────────

type Mode = "auto" | "drag" | "glide" | "free";

type Lens = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Where the lens is heading (the pointer, a key press, or the auto-drift path). */
  tx: number;
  ty: number;
  /** Current radius in css px; it grows from nothing when the page opens. */
  r: number;
  /** Natural radius at size 1. */
  base: number;
  mode: Mode;
};

type Piece = {
  object: PrintedObject;
  x: number;
  y: number;
  rot: number;
  /** Scale that fits the whole layout on the table. */
  s: number;
  tilt: number;
  tiltV: number;
  /** 0 at rest, 1 while it is held. */
  lift: number;
  cache: HTMLCanvasElement | null;
};

type Grab = { kind: "lens" | "piece"; id: number; ox: number; oy: number; px: number; py: number };

type Point = { x: number; y: number };

type Engine = {
  setSettings: (settings: LensSettings) => void;
  setDark: (dark: boolean) => void;
  /** Marks the scene as touched: the hint fades and the auto-drift stops. */
  touch: () => void;
  destroy: () => void;
};

type EngineOptions = {
  stage: HTMLDivElement;
  tableCanvas: HTMLCanvasElement;
  glCanvas: HTMLCanvasElement;
  autoplay: boolean;
  settings: LensSettings;
  dark: boolean;
  onTouch: () => void;
  onSizeChange: (size: number) => void;
  onGlUnavailable: () => void;
};

const clampSize = (size: number) => Math.min(SIZE_RANGE.max, Math.max(SIZE_RANGE.min, size));

const UNIFORM_NAMES = ["uTex", "uSize", "uDpr", "uC", "uR", "uMag", "uIor", "uDisp", "uIri", "uDark", "uTime"] as const;

function createEngine(options: EngineOptions): Engine {
  const { stage, tableCanvas, glCanvas, autoplay, onTouch, onSizeChange, onGlUnavailable } = options;
  const noop: Engine = { setSettings: () => {}, setDark: () => {}, touch: () => {}, destroy: () => {} };

  const gl = glCanvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: true });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tableCtx = tableCanvas.getContext("2d");
  if (!tableCtx) return noop;

  // layout state
  let width = 0;
  let height = 0;
  let dpr = 1; // pixel ratio of the GL canvas
  let tableScale = 2; // pixel ratio of the table canvas and the object caches
  let wide = true;
  let pieceScale = 1;
  let layoutCy = 0;

  // loop state
  let frameId = 0;
  let wakeTimer: number | undefined;
  let alive = true;
  let visible = true;
  let tableDirty = true;
  let placed = false;
  let touched = false;
  const startTime = performance.now();
  let lastFrame = startTime;
  let lastSecond = -1;

  let grab: Grab | null = null;
  let pinch: { d: number; s: number } | null = null;
  const pointers = new Map<number, Point>();

  const live = { settings: options.settings, dark: options.dark };

  const pieces: Piece[] = PRINTED_OBJECTS.map((object) => ({ object, x: 0, y: 0, rot: 0, s: 1, tilt: 0, tiltV: 0, lift: 0, cache: null }));
  /** Stacking order, back to front, as indices into `pieces`. */
  let order = pieces.map((_, index) => index);

  const lens: Lens = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, r: 0, base: 110, mode: "auto" };

  // ── WebGL ──
  let program: WebGLProgram | null = null;
  let vertexShader: WebGLShader | null = null;
  let fragmentShader: WebGLShader | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const uniforms: Partial<Record<(typeof UNIFORM_NAMES)[number], WebGLUniformLocation | null>> = {};

  if (gl) {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(shader));
      return shader;
    };
    program = gl.createProgram();
    vertexShader = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    fragmentShader = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (program && vertexShader && fragmentShader) {
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
    }
    if (!program || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      program = null;
      onGlUnavailable();
    } else {
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (const name of UNIFORM_NAMES) uniforms[name] = gl.getUniformLocation(program, name);
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(uniforms.uTex ?? null, 0);
    }
  } else {
    onGlUnavailable();
  }

  // ── the printed objects ──

  /** Draws every object to its own canvas at table resolution. */
  const renderCaches = () => {
    for (const piece of pieces) {
      const cache = piece.cache ?? document.createElement("canvas");
      cache.width = Math.ceil(piece.object.w * tableScale);
      cache.height = Math.ceil(piece.object.h * tableScale);
      const ctx = cache.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(tableScale, 0, 0, tableScale, 0, 0);
      ctx.clearRect(0, 0, piece.object.w, piece.object.h);
      piece.object.draw(ctx, new Date());
      piece.cache = cache;
    }
  };

  /** Size and position of the headline on the table. */
  const headline = () => ({
    big: wide ? Math.min(128, width * 0.095) : Math.min(68, width * 0.15),
    y: Math.max(wide ? 120 : 118, height * (wide ? 0.2 : 0.17)),
  });

  /** Scatters the objects over the table below the headline, scaled to fit. */
  const layoutPieces = () => {
    const layout = wide ? WIDE_LAYOUT : TALL_LAYOUT;
    const extent = wide ? WIDE_EXTENT : TALL_EXTENT;
    const title = headline();
    const top = title.y + title.big * 0.9 + 40;
    const bottom = height - (wide ? 70 : 78);
    const middle = (top + bottom) / 2;
    const scale = Math.min(wide ? 1.15 : 1, (width * 0.94) / extent.w, (bottom - top) / extent.h);
    for (const piece of pieces) {
      const [dx, dy, degrees] = layout[piece.object.id];
      piece.x = width / 2 + dx * scale;
      piece.y = middle + dy * scale;
      piece.rot = (degrees * Math.PI) / 180;
      piece.s = scale;
    }
    return { cy: middle, s: scale };
  };

  /** Paints the table (background, dots, headline, objects) and uploads it as the glass's texture. */
  const drawTable = () => {
    const dark = live.dark;
    const ctx = tableCtx;
    ctx.setTransform(tableScale, 0, 0, tableScale, 0, 0);
    ctx.fillStyle = dark ? "#000000" : "#f5f5f7";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = dark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.07)";
    for (let y = 12; y < height; y += 22) {
      for (let x = 12 + ((width / 2) % 22); x < width; x += 22) ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
    }
    const title = headline();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = dark ? "#f5f5f7" : "#1d1d1f";
    ctx.font = `600 ${title.big}px ${FONT_STACK}`;
    ctx.letterSpacing = `${-title.big * 0.045}px`;
    ctx.fillText("Look closer.", width / 2, title.y + title.big * 0.35);
    ctx.font = `450 ${wide ? 19 : 16}px ${FONT_STACK}`;
    ctx.letterSpacing = "0px";
    ctx.fillStyle = dark ? "#a1a1a6" : "#6e6e73";
    const subtitle = wide
      ? "Drag the glass over anything. The good stuff is in the small print."
      : "Drag the glass over anything.";
    ctx.fillText(subtitle, width / 2, title.y + title.big * 0.35 + (wide ? 44 : 34));
    if (!wide) ctx.fillText("The good stuff is in the small print.", width / 2, title.y + title.big * 0.35 + 56);
    ctx.fillStyle = dark ? "rgba(245,245,247,.6)" : "rgba(29,29,31,.55)";
    ctx.font = `500 2.8px ${FONT_STACK}`;
    ctx.fillText(
      "You are reading the smallest sentence on this page. Well spotted.",
      width / 2,
      title.y + title.big * 0.35 + (wide ? 62 : 72),
    );
    for (const index of order) {
      const piece = pieces[index];
      if (!piece.cache) continue;
      const fit = piece.s;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot + piece.tilt);
      const scale = fit * (1 + piece.lift * 0.05);
      ctx.scale(scale, scale);
      ctx.shadowColor = `rgba(0,0,0,${(dark ? 0.5 : 0.16) + piece.lift * 0.1})`;
      ctx.shadowBlur = (4 + piece.lift * 26) * tableScale * fit;
      ctx.shadowOffsetY = (2.5 + piece.lift * 14) * tableScale * fit;
      ctx.drawImage(piece.cache, -piece.object.w / 2, -piece.object.h / 2, piece.object.w, piece.object.h);
      ctx.restore();
    }
    if (gl && texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tableCanvas);
    }
    tableDirty = false;
  };

  /** Draws the glass over the table, only inside the part of the canvas the glass can touch. */
  const drawLens = (now: number) => {
    if (!gl || !program) return;
    const settings = live.settings;
    gl.uniform2f(uniforms.uSize ?? null, width, height);
    gl.uniform1f(uniforms.uDpr ?? null, dpr);
    gl.uniform2f(uniforms.uC ?? null, lens.x, lens.y);
    gl.uniform1f(uniforms.uR ?? null, Math.max(1, lens.r));
    gl.uniform1f(uniforms.uMag ?? null, settings.magnification);
    gl.uniform1f(uniforms.uIor ?? null, settings.refraction);
    gl.uniform1f(uniforms.uDisp ?? null, settings.dispersion);
    gl.uniform1f(uniforms.uIri ?? null, settings.iridescence);
    gl.uniform1f(uniforms.uDark ?? null, live.dark ? 1 : 0);
    gl.uniform1f(uniforms.uTime ?? null, (now - startTime) / 1e3);
    const radius = Math.max(1, lens.r);
    const left = Math.floor((lens.x - 1.15 * radius) * dpr);
    const right = Math.ceil((lens.x + 1.8 * radius) * dpr);
    const top = Math.floor((lens.y - 1.15 * radius) * dpr);
    const bottom = Math.ceil((lens.y + 1.9 * radius) * dpr);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(Math.max(0, left), Math.max(0, glCanvas.height - bottom), Math.max(0, right - left), Math.max(0, bottom - top));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // ── the loop ──

  const frame = (now: number) => {
    frameId = 0;
    if (!alive) return;
    const dt = Math.min(3, (now - lastFrame) / 16.67); // frames at 60fps
    lastFrame = now;
    let moving = false;

    // the glass grows from nothing when the page opens, and follows the size setting
    const targetRadius = lens.base * live.settings.size * (now - startTime < 450 ? 0 : 1);
    lens.r += (targetRadius - lens.r) * (1 - Math.pow(reduced ? 0 : 0.84, dt));
    if (Math.abs(targetRadius - lens.r) > 0.1) moving = true;
    else lens.r = targetRadius;

    // left alone, the glass drifts slowly across the table
    if (lens.mode === "auto" && autoplay && !reduced && !touched) {
      const seconds = (now - startTime) / 1e3;
      const reach = Math.min(width * 0.3, 560 * pieceScale);
      lens.tx = width / 2 + Math.sin(seconds * 0.21 + 1.9) * reach;
      lens.ty = layoutCy + Math.sin(seconds * 0.37) * 110 * pieceScale;
      moving = true;
    }
    if (lens.mode === "auto" || lens.mode === "drag" || lens.mode === "glide") {
      const spring = lens.mode === "drag" ? 0.32 : lens.mode === "glide" ? 0.09 : 0.03;
      const damping = lens.mode === "drag" ? 0.55 : 0.78;
      lens.vx += (lens.tx - lens.x) * spring * dt;
      lens.vy += (lens.ty - lens.y) * spring * dt;
      lens.vx *= Math.pow(damping, dt);
      lens.vy *= Math.pow(damping, dt);
    } else if (lens.mode === "free") {
      lens.vx *= Math.pow(0.955, dt);
      lens.vy *= Math.pow(0.955, dt);
    }
    lens.x += lens.vx * dt;
    lens.y += lens.vy * dt;

    // it bounces softly off the edges of the table
    const margin = Math.max(16, lens.r * 0.6);
    if (lens.x < margin) {
      lens.x = margin;
      lens.vx = Math.abs(lens.vx) * 0.5;
    }
    if (lens.x > width - margin) {
      lens.x = width - margin;
      lens.vx = -Math.abs(lens.vx) * 0.5;
    }
    if (lens.y < margin) {
      lens.y = margin;
      lens.vy = Math.abs(lens.vy) * 0.5;
    }
    if (lens.y > height - margin) {
      lens.y = height - margin;
      lens.vy = -Math.abs(lens.vy) * 0.5;
    }
    if (
      Math.hypot(lens.vx, lens.vy) > 0.02 ||
      (lens.mode !== "free" && lens.mode !== "auto" && Math.hypot(lens.tx - lens.x, lens.ty - lens.y) > 0.3) ||
      lens.mode === "drag"
    ) {
      moving = true;
    } else if (lens.mode === "glide") {
      lens.mode = "free";
    }

    // held objects lift and swing, then settle
    for (const piece of pieces) {
      const lifted = grab?.kind === "piece" && pieces[grab.id] === piece ? 1 : 0;
      if (Math.abs(piece.lift - lifted) > 0.002 || Math.abs(piece.tilt) > 5e-4 || Math.abs(piece.tiltV) > 5e-4) {
        piece.lift += (lifted - piece.lift) * (1 - Math.pow(0.78, dt));
        piece.tiltV += (0 - piece.tilt) * 0.12 * dt;
        piece.tiltV *= Math.pow(0.8, dt);
        piece.tilt += piece.tiltV * dt;
        tableDirty = true;
        moving = true;
      }
    }

    // live objects (the watch) are redrawn once a second
    const second = Math.floor(Date.now() / 1e3);
    if (second !== lastSecond) {
      lastSecond = second;
      for (const piece of pieces) {
        if (!piece.object.live || !piece.cache) continue;
        const ctx = piece.cache.getContext("2d");
        if (!ctx) continue;
        ctx.setTransform(tableScale, 0, 0, tableScale, 0, 0);
        ctx.clearRect(0, 0, piece.object.w, piece.object.h);
        piece.object.draw(ctx, new Date());
        tableDirty = true;
      }
    }

    if (tableDirty) drawTable();
    drawLens(now);

    if (moving && visible) {
      frameId = requestAnimationFrame(frame);
    } else if (visible) {
      // idle: wake up for the next tick of the watch
      wakeTimer = window.setTimeout(
        () => {
          if (!frameId && alive) frameId = requestAnimationFrame(frame);
        },
        1e3 - (Date.now() % 1e3) + 5,
      );
    }
  };

  const requestFrame = () => {
    if (!frameId && alive) {
      lastFrame = performance.now();
      frameId = requestAnimationFrame(frame);
    }
  };

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    wide = width >= 760;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    tableScale = Math.min(2.5, Math.max(2, (window.devicePixelRatio || 1) * 1.25), 4096 / width, 4096 / height);
    glCanvas.width = Math.round(width * dpr);
    glCanvas.height = Math.round(height * dpr);
    tableCanvas.width = Math.round(width * tableScale);
    tableCanvas.height = Math.round(height * tableScale);
    const placement = layoutPieces();
    pieceScale = placement.s;
    layoutCy = placement.cy;
    renderCaches();
    tableDirty = true;
    lens.base = Math.max(58, Math.min(132, Math.min(width, height) * (wide ? 0.13 : 0.2)));
    if (!placed) {
      // the glass starts beside the watch
      const dial = pieces.find((piece) => piece.object.id === "dial");
      if (dial) {
        lens.x = lens.tx = dial.x - 20 * pieceScale;
        lens.y = lens.ty = dial.y - 10 * pieceScale;
      }
      placed = true;
    }
    lens.x = Math.min(Math.max(lens.x, 20), width - 20);
    lens.y = Math.min(Math.max(lens.y, 20), height - 20);
    if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    requestFrame();
  };

  // ── pointer, wheel and keyboard ──

  const toLocal = (event: { clientX: number; clientY: number }): Point => {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  /** The topmost object under a point, or -1. */
  const pieceAt = (x: number, y: number) => {
    for (let i = order.length - 1; i >= 0; i--) {
      const piece = pieces[order[i]];
      const angle = -(piece.rot + piece.tilt);
      const dx = x - piece.x;
      const dy = y - piece.y;
      const localX = (dx * Math.cos(angle) - dy * Math.sin(angle)) / piece.s;
      const localY = (dx * Math.sin(angle) + dy * Math.cos(angle)) / piece.s;
      if (Math.abs(localX) < piece.object.w / 2 && Math.abs(localY) < piece.object.h / 2) return order[i];
    }
    return -1;
  };

  const touch = () => {
    if (!touched) {
      touched = true;
      onTouch();
    }
  };

  const setSize = (size: number) => {
    live.settings = { ...live.settings, size };
    onSizeChange(size);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.target instanceof Element && event.target.closest("[data-ui]")) return;
    const point = toLocal(event);
    pointers.set(event.pointerId, point);
    stage.setPointerCapture(event.pointerId);
    if (pointers.size === 2 && grab?.kind === "lens") {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: live.settings.size };
      return;
    }
    touch();
    if (Math.hypot(point.x - lens.x, point.y - lens.y) < lens.r) {
      grab = { kind: "lens", id: 0, ox: point.x - lens.x, oy: point.y - lens.y, px: point.x, py: point.y };
      lens.mode = "drag";
      lens.tx = lens.x;
      lens.ty = lens.y;
      stage.style.cursor = "grabbing";
    } else {
      const hit = pieceAt(point.x, point.y);
      if (hit >= 0) {
        grab = { kind: "piece", id: hit, ox: point.x - pieces[hit].x, oy: point.y - pieces[hit].y, px: point.x, py: point.y };
        order = order.filter((index) => index !== hit).concat(hit);
        tableDirty = true;
        stage.style.cursor = "grabbing";
      } else {
        lens.mode = "glide";
        lens.tx = point.x;
        lens.ty = point.y;
      }
    }
    requestFrame();
  };

  const onPointerMove = (event: PointerEvent) => {
    const point = toLocal(event);
    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, point);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      setSize(clampSize((pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d));
      requestFrame();
      return;
    }
    if (grab?.kind === "lens") {
      lens.tx = point.x - grab.ox;
      lens.ty = point.y - grab.oy;
      requestFrame();
    } else if (grab?.kind === "piece") {
      const piece = pieces[grab.id];
      const dx = point.x - grab.px;
      piece.x = point.x - grab.ox;
      piece.y = point.y - grab.oy;
      piece.tiltV += dx * 0.0016;
      grab.px = point.x;
      grab.py = point.y;
      tableDirty = true;
      requestFrame();
    } else if (event.pointerType === "mouse") {
      stage.style.cursor = Math.hypot(point.x - lens.x, point.y - lens.y) < lens.r || pieceAt(point.x, point.y) >= 0 ? "grab" : "default";
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pinch) {
      if (pointers.size < 2) pinch = null;
      return;
    }
    if (grab?.kind === "lens") lens.mode = "free";
    grab = null;
    stage.style.cursor = "grab";
    requestFrame();
  };

  const onWheel = (event: WheelEvent) => {
    const rect = stage.getBoundingClientRect();
    if (Math.hypot(event.clientX - rect.left - lens.x, event.clientY - rect.top - lens.y) > lens.r) return;
    event.preventDefault();
    touch();
    setSize(clampSize(live.settings.size * Math.exp(-event.deltaY * 0.0015)));
    requestFrame();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== stage) return;
    const step = event.shiftKey ? 60 : 24;
    let handled = true;
    if (event.key === "ArrowLeft") lens.tx = lens.x - step;
    else if (event.key === "ArrowRight") lens.tx = lens.x + step;
    else if (event.key === "ArrowUp") lens.ty = lens.y - step;
    else if (event.key === "ArrowDown") lens.ty = lens.y + step;
    else if (event.key === "+" || event.key === "=" || event.key === "-") {
      setSize(clampSize(live.settings.size + (event.key === "-" ? -0.08 : 0.08)));
    } else handled = false;
    if (handled) {
      event.preventDefault();
      touch();
      if (event.key.startsWith("Arrow")) lens.mode = "glide";
      requestFrame();
    }
  };

  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerUp);
  stage.addEventListener("wheel", onWheel, { passive: false });
  stage.addEventListener("keydown", onKeyDown);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  // stop drawing while off screen or in a hidden tab
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestFrame();
  });
  intersectionObserver.observe(stage);
  const onVisibilityChange = () => {
    visible = !document.hidden;
    if (visible) requestFrame();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  resize();

  // draw again once the fonts are in, so the print uses Geist where it is available
  Promise.all([400, 450, 500, 600, 650, 700, 750, 800].map((weight) => document.fonts.load(`${weight} 40px "Geist Variable"`)))
    .catch(() => {})
    .then(() => {
      if (alive) {
        renderCaches();
        tableDirty = true;
        requestFrame();
      }
    });

  return {
    setSettings: (settings) => {
      live.settings = settings;
      requestFrame();
    },
    setDark: (dark) => {
      live.dark = dark;
      tableDirty = true;
      requestFrame();
    },
    touch,
    destroy: () => {
      alive = false;
      cancelAnimationFrame(frameId);
      window.clearTimeout(wakeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKeyDown);
      pointers.clear();
      // free the GL objects (the context itself stays with the canvas, so a remount can reuse it)
      if (gl) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
      for (const piece of pieces) piece.cache = null;
    },
  };
}

// ───────────────────────── the page ─────────────────────────

function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/**
 * Loupe lens: a glass ball you drag across a table of tiny printed objects (a stamp, a ticket, a working watch dial,
 * a map, a type specimen, a film strip, a facts label and a badge). It magnifies the middle, bends the rim with real
 * refraction, splits the light into a spectrum and casts a shadow with a focused glint. The objects carry text too
 * small to read without it.
 *
 * Drag the glass, or tap the table to make it glide there. Scroll over it, pinch it, or press plus and minus to resize
 * it; the arrow keys move it (hold Shift for bigger steps). Objects can be dragged around too. Left alone, the glass
 * drifts across the table until the first touch (never under reduced motion). The Lens panel tunes size,
 * magnification, refraction, dispersion and iridescence, and the sun and moon button switches the table between
 * light and dark.
 *
 * Drawn with WebGL over a 2D canvas, and stops drawing off screen or in a hidden tab. Without WebGL the table is shown
 * without the glass, with a note. Under reduced motion the glass appears at full size at once and does not drift.
 */
export default function LoupeLens({
  autoplay = true,
  height = "fill",
  size = DEFAULT_SETTINGS.size,
  magnification = DEFAULT_SETTINGS.magnification,
  refraction = DEFAULT_SETTINGS.refraction,
  dispersion = DEFAULT_SETTINGS.dispersion,
  iridescence = DEFAULT_SETTINGS.iridescence,
  className = "",
}: LoupeLensProps) {
  const panelId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [dark, setDark] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [overrides, setOverrides] = useState<Partial<LensSettings>>({});
  const [glOk, setGlOk] = useState(true);
  const [touched, setTouched] = useState(false);

  // the props are the starting values; whatever the viewer changes (panel, wheel, pinch, keys) wins until Reset
  const settings = useMemo<LensSettings>(
    () => ({ size, magnification, refraction, dispersion, iridescence, ...overrides }),
    [size, magnification, refraction, dispersion, iridescence, overrides],
  );
  const latest = useRef({ settings, dark });

  useEffect(() => {
    latest.current.settings = settings;
    engineRef.current?.setSettings(settings);
  }, [settings]);

  useEffect(() => {
    latest.current.dark = dark;
    engineRef.current?.setDark(dark);
  }, [dark]);

  useEffect(() => {
    const stage = stageRef.current;
    const tableCanvas = tableRef.current;
    const glCanvas = glRef.current;
    if (!stage || !tableCanvas || !glCanvas) return;
    const engine = createEngine({
      stage,
      tableCanvas,
      glCanvas,
      autoplay,
      settings: latest.current.settings,
      dark: latest.current.dark,
      onTouch: () => setTouched(true),
      onSizeChange: (next) => setOverrides((current) => ({ ...current, size: next })),
      onGlUnavailable: () => setGlOk(false),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [autoplay]);

  const palette = dark
    ? { fg: "#f5f5f7", muted: "#a1a1a6", glass: "rgba(28,28,30,.72)", line: "rgba(255,255,255,.12)", track: "rgba(255,255,255,.16)" }
    : { fg: INK, muted: "#6e6e73", glass: "rgba(255,255,255,.72)", line: "rgba(0,0,0,.08)", track: "rgba(0,0,0,.1)" };
  const chrome: CSSProperties = {
    background: palette.glass,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxShadow: `0 0 0 0.5px ${palette.line}, 0 20px 40px -24px rgba(0,0,0,.35)`,
    color: palette.fg,
  };

  const fill = height === "fill";

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`loupe-lens ${fill ? "absolute inset-0" : "relative w-full"} overflow-hidden ${className}`}
        style={{
          height: fill ? undefined : height,
          fontFamily: FONT_STACK,
          background: dark ? "#000" : "#f5f5f7",
          color: palette.fg,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <style>{`.loupe-lens .loupe-ring:focus-visible{outline:2px solid #0071e3;outline-offset:3px}
.loupe-lens input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%;height:22px;cursor:pointer}
.loupe-lens input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:4px;background:linear-gradient(90deg,#0071e3 var(--p),${palette.track} var(--p))}
.loupe-lens input[type=range]::-moz-range-track{height:4px;border-radius:4px;background:linear-gradient(90deg,#0071e3 var(--p),${palette.track} var(--p))}
.loupe-lens input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-7px;border-radius:50%;background:#fff;box-shadow:0 0 0 .5px rgba(0,0,0,.15),0 2px 6px rgba(0,0,0,.25)}
.loupe-lens input[type=range]::-moz-range-thumb{width:18px;height:18px;border:0;border-radius:50%;background:#fff;box-shadow:0 0 0 .5px rgba(0,0,0,.15),0 2px 6px rgba(0,0,0,.25)}
.loupe-lens input[type=range]:focus-visible{outline:2px solid #0071e3;outline-offset:4px;border-radius:6px}`}</style>
        <h2 className="sr-only">Look closer.</h2>
        <p className="sr-only">
          A glass ball rests on a table of printed objects: a stamp, a ticket, a watch dial, a map, a type specimen, a film strip, a
          facts label and a badge. Each carries text too small to read without the glass.
        </p>
        <div
          ref={stageRef}
          tabIndex={0}
          role="application"
          aria-roledescription="lens"
          aria-label="Glass lens over a table of printed objects. Arrow keys move the glass, plus and minus change its size."
          className="loupe-ring relative h-full w-full touch-none select-none outline-none"
          style={{ cursor: "grab" }}
        >
          <canvas ref={tableRef} aria-hidden className="absolute inset-0 h-full w-full" />
          <canvas ref={glRef} aria-hidden className="absolute inset-0 h-full w-full" />
          {!glOk && (
            <div className="absolute inset-x-0 bottom-24 text-center text-[13px]" style={{ color: palette.muted }}>
              This browser can&apos;t run the glass (WebGL is off), so the table is shown without it.
            </div>
          )}
          <header data-ui className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 sm:px-8">
            <div className="pointer-events-auto flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
              <span
                aria-hidden
                className="relative h-[22px] w-[22px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #fff 0 18%, rgba(255,255,255,.2) 40%, rgba(0,113,227,.25) 75%, rgba(0,0,0,.25))",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12), 0 3px 6px -2px rgba(0,0,0,.35)",
                }}
              />
              Loupe
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDark((value) => !value)}
                aria-label={dark ? "Use light table" : "Use dark table"}
                className="loupe-ring grid h-9 w-9 place-items-center rounded-full outline-none transition-transform active:scale-95"
                style={chrome}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={dark ? "m" : "s"}
                    initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  >
                    {dark ? (
                      <Icon>
                        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
                      </Icon>
                    ) : (
                      <Icon>
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
                      </Icon>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen((value) => !value)}
                aria-expanded={panelOpen}
                aria-controls={panelId}
                className="loupe-ring flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium outline-none transition-transform active:scale-95"
                style={chrome}
              >
                <Icon size={16}>
                  <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
                  <circle cx="16" cy="7" r="2" />
                  <circle cx="10" cy="17" r="2" />
                </Icon>
                Lens
              </button>
            </div>
          </header>
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                id={panelId}
                data-ui
                role="group"
                aria-label="Lens settings"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute right-5 top-[68px] z-10 w-[min(300px,calc(100%-40px))] origin-top-right rounded-[22px] p-4 sm:right-8"
                style={chrome}
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-[15px] font-semibold tracking-[-0.01em]">Lens</div>
                  <button
                    type="button"
                    onClick={() => setOverrides({})}
                    className="loupe-ring rounded-full px-2.5 py-1 text-[13px] font-medium outline-none"
                    style={{ color: "#0071e3" }}
                  >
                    Reset
                  </button>
                </div>
                {SLIDERS.map((slider) => {
                  const value = settings[slider.key];
                  const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
                  return (
                    <label key={slider.key} className="block pt-2">
                      <span className="flex justify-between text-[13px]">
                        <span>{slider.label}</span>
                        <span className="tabular-nums" style={{ color: palette.muted }}>
                          {slider.format(value)}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={value}
                        style={{ "--p": `${percent}%` } as CSSProperties}
                        onChange={(event) => {
                          engineRef.current?.touch();
                          const next = Number(event.target.value);
                          setOverrides((current) => ({ ...current, [slider.key]: next }));
                        }}
                      />
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            data-ui
            aria-hidden
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: touched ? 0 : 1, y: touched ? 8 : 0 }}
            transition={{ duration: 0.6, delay: touched ? 0 : 1.2 }}
            className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-5"
          >
            <div className="rounded-full px-4 py-2 text-center text-[13px]" style={{ ...chrome, color: palette.muted }}>
              <span className="hidden sm:inline">Drag the glass. Scroll or pinch on it to resize. Objects move too.</span>
              <span className="sm:hidden">Drag the glass. Pinch it to resize.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
```

--- components/loupe-lens/objects.ts ---

```ts
/**
 * The printed objects the glass is dragged over. Each one is drawn once to its own canvas (at 2x or more), then
 * placed on the table. All coordinates are in the object's own pixels, with the origin at its top left corner.
 * Much of the text is set far too small to read without the lens, on purpose.
 */

/** Canvas font stack (the original page embedded Geist Variable; here it falls back to the system UI font). */
export const FONT_STACK = '"Geist Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

/** Primary ink colour of the print. */
export const INK = "#1d1d1f";

const TAU = 6.283;

export type PrintedObject = {
  id: string;
  /** Spoken description, used for documentation; the canvas itself is decorative. */
  label: string;
  w: number;
  h: number;
  /** True when the drawing depends on the time and must be redrawn every second. */
  live?: boolean;
  draw: (ctx: CanvasRenderingContext2D, now: Date) => void;
};

// ───────────────────────── drawing helpers ─────────────────────────

/** A font shorthand in the canvas font stack. */
export const font = (weight: number, size: number) => `${weight} ${size}px ${FONT_STACK}`;

export const setLetterSpacing = (ctx: CanvasRenderingContext2D, px: number) => {
  ctx.letterSpacing = `${px}px`;
};

/** A small seeded random number generator (mulberry32), so the "random" print is the same on every load. */
export function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 1831565813) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Begins a rounded rectangle path. */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

/** Repeats `unit` along a line until it is as wide as `maxWidth`, as micro-print borders and fine print. */
function fillRepeated(ctx: CanvasRenderingContext2D, unit: string, x: number, y: number, maxWidth: number, size: number) {
  ctx.font = font(500, size);
  setLetterSpacing(ctx, 0.05);
  let line = "";
  while (ctx.measureText(line + unit).width < maxWidth) line += unit;
  ctx.fillText(line, x, y);
}

/** Sets text around a circle, upright letters facing outward, spread to fill the whole ring. */
function fillTextOnCircle(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  weight = 600,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = font(weight, size);
  setLetterSpacing(ctx, 0);
  const total = [...text].reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
  const gap = (2 * Math.PI * radius - total) / text.length;
  let angle = -Math.PI / 2;
  for (const ch of text) {
    const width = ctx.measureText(ch).width;
    angle += width / 2 / radius;
    ctx.save();
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(ch, -width / 2, -radius);
    ctx.restore();
    angle += (width / 2 + gap) / radius;
  }
  ctx.restore();
}

/** Punches a ring of round perforation holes out of whatever has been drawn, around a w by h sheet. */
function punchPerforations(ctx: CanvasRenderingContext2D, w: number, h: number, pitch: number, radius: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  for (let x = pitch / 2; x < w; x += pitch) {
    ctx.moveTo(x + radius, 0);
    ctx.arc(x, 0, radius, 0, TAU);
    ctx.moveTo(x + radius, h);
    ctx.arc(x, h, radius, 0, TAU);
  }
  for (let y = pitch / 2; y < h; y += pitch) {
    ctx.moveTo(radius, y);
    ctx.arc(0, y, radius, 0, TAU);
    ctx.moveTo(w + radius, y);
    ctx.arc(w, y, radius, 0, TAU);
  }
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── the objects ─────────────────────────

/** The eight printed objects, in the order they are stacked on the table (later ones start on top). */
export const PRINTED_OBJECTS: PrintedObject[] = [
  {
    id: "stamp",
    label: "A blue postage stamp worth 42",
    w: 150,
    h: 186,
    draw(ctx) {
      const blue = "#0a4fae";
      ctx.fillStyle = "#fbfbf8";
      ctx.fillRect(0, 0, 150, 186);
      punchPerforations(ctx, 150, 186, 10.6, 3.9);
      ctx.fillStyle = "#e6effb";
      ctx.fillRect(13, 13, 124, 160);
      ctx.strokeStyle = blue;
      ctx.lineWidth = 1.1;
      ctx.strokeRect(13, 13, 124, 160);
      ctx.save();
      ctx.translate(150 / 2, 88);
      ctx.lineWidth = 0.32;
      ctx.strokeStyle = "rgba(10,79,174,.7)";
      for (let i = 0; i < 56; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 56);
        ctx.beginPath();
        ctx.ellipse(0, 0, 47, 17, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = "#e6effb";
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = blue;
      ctx.stroke();
      ctx.fillStyle = blue;
      ctx.font = font(700, 24);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setLetterSpacing(ctx, -1);
      ctx.fillText("42", 0, 1);
      ctx.restore();
      ctx.fillStyle = blue;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = font(650, 11);
      setLetterSpacing(ctx, 2.2);
      ctx.fillText("LOUPE POST", 150 / 2, 38);
      ctx.font = font(600, 9.5);
      setLetterSpacing(ctx, 1.6);
      ctx.fillText("SEEN CLOSE  2026", 150 / 2, 162);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(10,79,174,.85)";
      fillRepeated(ctx, "LOOK CLOSER ", 17, 18.6, 116, 2.3);
      fillRepeated(ctx, "LOOK CLOSER ", 17, 171, 116, 2.3);
      ctx.save();
      ctx.translate(16.2, 169);
      ctx.rotate(-Math.PI / 2);
      fillRepeated(ctx, "LOOK CLOSER ", 0, 0, 152, 2.3);
      ctx.restore();
      ctx.save();
      ctx.translate(150 - 16.2, 17);
      ctx.rotate(Math.PI / 2);
      fillRepeated(ctx, "LOOK CLOSER ", 0, 0, 152, 2.3);
      ctx.restore();
    },
  },
  {
    id: "ticket",
    label: "An admit-one ticket, row 4 seat 12",
    w: 300,
    h: 122,
    draw(ctx) {
      const red = "#b6412b";
      roundRectPath(ctx, 0, 0, 300, 122, 6);
      ctx.fillStyle = "#f4ede0";
      ctx.fill();
      // the notches punched out of the edges
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(0, 122 / 2, 10, 0, TAU);
      ctx.arc(300, 122 / 2, 10, 0, TAU);
      ctx.arc(228, 0, 6, 0, TAU);
      ctx.arc(228, 122, 6, 0, TAU);
      ctx.fill();
      ctx.restore();
      // the guilloche band along the top
      ctx.save();
      roundRectPath(ctx, 12, 10, 206, 26, 3);
      ctx.clip();
      ctx.strokeStyle = "rgba(182,65,43,.5)";
      ctx.lineWidth = 0.35;
      for (let o = 0; o < 22; o++) {
        ctx.beginPath();
        for (let x = 12; x <= 218; x += 1.5) {
          const y = 23 + Math.sin(x / 9 + o * 0.29) * 9 * Math.sin(x / 47 + o * 0.05);
          if (x === 12) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      // the tear-off line
      ctx.strokeStyle = "rgba(29,29,31,.35)";
      ctx.setLineDash([2.5, 2.5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(228, 9);
      ctx.lineTo(228, 113);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = INK;
      ctx.font = font(750, 30);
      setLetterSpacing(ctx, -0.6);
      ctx.fillText("ADMIT ONE", 14, 70);
      ctx.font = font(500, 10.5);
      setLetterSpacing(ctx, 0.2);
      ctx.fillStyle = "#3a3a3c";
      ctx.fillText("Row 4    Seat 12    Door B    20:30", 15, 88);
      ctx.fillStyle = red;
      fillRepeated(
        ctx,
        "If you can read this line, the glass is working exactly as intended. Nothing else on the ticket is printed this small. ",
        15,
        104,
        204,
        2.6,
      );
      ctx.save();
      ctx.translate(252, 122 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = INK;
      ctx.font = font(650, 11);
      setLetterSpacing(ctx, 1.2);
      ctx.textAlign = "center";
      ctx.fillText("Nº 004812", 0, 4);
      ctx.restore();
      // the barcode
      const random = mulberry32(7);
      ctx.fillStyle = INK;
      for (let x = 268; x < 290; ) {
        const barWidth = 0.6 + random() * 1.8;
        ctx.fillRect(x, 18, barWidth, 86);
        x += barWidth + 0.8 + random() * 1.6;
      }
    },
  },
  {
    id: "dial",
    label: "A watch dial showing the current time",
    w: 176,
    h: 176,
    live: true,
    draw(ctx, now) {
      const caseGradient = ctx.createLinearGradient(0, 0, 176, 176);
      caseGradient.addColorStop(0, "#f2f2f4");
      caseGradient.addColorStop(1, "#a1a1a6");
      ctx.fillStyle = caseGradient;
      ctx.beginPath();
      ctx.arc(88, 88, 86, 0, TAU);
      ctx.fill();
      const faceGradient = ctx.createRadialGradient(68, 62, 10, 88, 88, 86);
      faceGradient.addColorStop(0, "#ffffff");
      faceGradient.addColorStop(1, "#ececee");
      ctx.fillStyle = faceGradient;
      ctx.beginPath();
      ctx.arc(88, 88, 80, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * TAU;
        const length = i % 5 ? 4 : 9;
        ctx.lineWidth = i % 5 ? 0.7 : 1.7;
        ctx.beginPath();
        ctx.moveTo(88 + Math.sin(angle) * 74, 88 - Math.cos(angle) * 74);
        ctx.lineTo(88 + Math.sin(angle) * (74 - length), 88 - Math.cos(angle) * (74 - length));
        ctx.stroke();
      }
      ctx.fillStyle = INK;
      ctx.font = font(600, 15);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setLetterSpacing(ctx, -0.3);
      (
        [
          ["12", 0],
          ["3", 1],
          ["6", 2],
          ["9", 3],
        ] as const
      ).forEach(([numeral, quarter]) => {
        const angle = (quarter / 4) * TAU;
        ctx.fillText(numeral, 88 + Math.sin(angle) * 56, 88 - Math.cos(angle) * 56 + 0.5);
      });
      ctx.font = font(650, 8.5);
      setLetterSpacing(ctx, 2);
      ctx.fillText("LOUPE", 88, 58);
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(500, 2.5);
      setLetterSpacing(ctx, 0.1);
      ctx.fillText("READ SLOWLY  WORN LIGHTLY  NO HURRY INSIDE", 88, 118);
      ctx.fillText("CALIBRE 0.01  HAND SET", 88, 122);
      const seconds = now.getSeconds() + now.getMilliseconds() / 1e3;
      const minutes = now.getMinutes() + seconds / 60;
      const hours = (now.getHours() % 12) + minutes / 60;
      const hand = (angle: number, length: number, width: number, color: string, tail = 10) => {
        ctx.save();
        ctx.translate(88, 88);
        ctx.rotate(angle);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, tail);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore();
      };
      ctx.shadowColor = "rgba(0,0,0,.25)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;
      hand((hours / 12) * TAU, 40, 3.4, INK);
      hand((minutes / 60) * TAU, 62, 2.3, INK);
      hand((Math.floor(seconds) / 60) * TAU, 68, 0.9, "#ff3b30", 16);
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath();
      ctx.arc(88, 88, 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(88, 88, 1, 0, TAU);
      ctx.fill();
    },
  },
  {
    id: "map",
    label: "A map of the Amsterdam canal ring",
    w: 236,
    h: 170,
    draw(ctx) {
      roundRectPath(ctx, 0, 0, 236, 170, 10);
      ctx.fillStyle = "#f3f1ea";
      ctx.fill();
      ctx.save();
      roundRectPath(ctx, 0, 0, 236, 170, 10);
      ctx.clip();
      ctx.fillStyle = "#d8e8d0";
      ctx.beginPath();
      ctx.ellipse(30, 150, 60, 34, -0.3, 0, TAU);
      ctx.fill();
      // the canals: concentric arcs around a point below the map
      const cx = 150;
      const cy = 210;
      (
        [
          ["Singel", 70],
          ["Herengracht", 94],
          ["Keizersgracht", 118],
          ["Prinsengracht", 142],
        ] as const
      ).forEach(([name, radius]) => {
        ctx.strokeStyle = "#bcd7ee";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-1.15);
        ctx.fillStyle = "#4a6f8f";
        ctx.font = font(500, 3);
        setLetterSpacing(ctx, 0.2);
        ctx.textAlign = "center";
        ctx.fillText(name, 0, -radius + 1);
        ctx.restore();
      });
      // the streets that cross them
      const random = mulberry32(3);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      for (let s = 0; s < 16; s++) {
        const angle = Math.PI * (1.08 + s * 0.054) + random() * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60);
        ctx.lineTo(cx + Math.cos(angle) * 152, cy + Math.sin(angle) * 152);
        ctx.stroke();
      }
      ctx.strokeStyle = "#e0ddd3";
      ctx.lineWidth = 0.5;
      for (let s = 0; s < 16; s++) {
        const angle = Math.PI * (1.08 + s * 0.054);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60);
        ctx.lineTo(cx + Math.cos(angle) * 152, cy + Math.sin(angle) * 152);
        ctx.stroke();
      }
      ctx.fillStyle = "#8a8a8e";
      ctx.font = font(500, 2.6);
      setLetterSpacing(ctx, 0.1);
      ["Leidsestraat", "Spiegelgracht", "Vijzelstraat", "Reguliersdwarsstraat", "Huidenstraat", "Wolvenstraat"].forEach((name, index) => {
        const angle = Math.PI * (1.2 + index * 0.12);
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * 104, cy + Math.sin(angle) * 104);
        ctx.rotate(angle + Math.PI / 2 + (angle > Math.PI * 1.5 ? 0 : Math.PI));
        ctx.textAlign = "center";
        ctx.fillText(name, 0, 1);
        ctx.restore();
      });
      ctx.restore();
      // the pin
      ctx.save();
      ctx.translate(122, 74);
      ctx.fillStyle = "#ff3b30";
      ctx.shadowColor = "rgba(0,0,0,.25)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-9, 1, -8, -10, 0, -10);
      ctx.bezierCurveTo(8, -10, 9, 1, 0, 12);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, -3, 3, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(500, 2.7);
      ctx.textAlign = "center";
      ctx.fillText("You are here. Probably reading this.", 122, 94);
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      ctx.font = font(600, 10);
      setLetterSpacing(ctx, 0);
      ctx.fillText("52.3676 N  4.9041 E", 12, 158);
    },
  },
  {
    id: "specimen",
    label: "A type specimen card for Geist",
    w: 188,
    h: 232,
    draw(ctx) {
      roundRectPath(ctx, 0, 0, 188, 232, 14);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = font(600, 100);
      setLetterSpacing(ctx, -5);
      ctx.fillText("Aa", 14, 104);
      ctx.font = font(600, 10.5);
      setLetterSpacing(ctx, 0);
      ctx.fillText("Geist", 16, 128);
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(450, 10);
      ctx.fillText("Weights 100 to 900", 16, 142);
      ctx.fillStyle = "#3a3a3c";
      ctx.font = font(500, 3.1);
      setLetterSpacing(ctx, 0.15);
      [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789  & ? ! @ # % ( ) [ ] { }",
        "The quick brown fox jumps over the lazy dog.",
        "Sphinx of black quartz, judge my vow.",
        "Pack my box with five dozen liquor jugs.",
      ].forEach((line, index) => ctx.fillText(line, 16, 160 + index * 6.2));
      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(16, 202, 156, 0.6);
      ctx.fillStyle = INK;
      ctx.font = font(600, 9);
      setLetterSpacing(ctx, 1.4);
      ctx.fillText("SPECIMEN 01", 16, 216);
      ctx.textAlign = "right";
      ctx.fillStyle = "#6e6e73";
      ctx.font = font(500, 2.6);
      setLetterSpacing(ctx, 0.1);
      ctx.fillText("set at 3.1 px, for your eyes only", 172, 216);
    },
  },
  {
    id: "film",
    label: "A strip of four film frames",
    w: 328,
    h: 96,
    draw(ctx) {
      ctx.fillStyle = "#2b2219";
      roundRectPath(ctx, 0, 0, 328, 96, 3);
      ctx.fill();
      // sprocket holes
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let x = 6; x < 322; x += 12) {
        roundRectPath(ctx, x, 5, 6, 8, 1.4);
        ctx.fill();
        roundRectPath(ctx, x, 83, 6, 8, 1.4);
        ctx.fill();
      }
      ctx.restore();
      // the four frames: sky top, sky bottom, hills
      (
        [
          ["#f7b267", "#f4845f", "#3d2b56"],
          ["#a1c4fd", "#c2e9fb", "#3b6e4a"],
          ["#2a3a6b", "#6b5ea8", "#151a2e"],
          ["#ffd9a0", "#ff9a8b", "#5a3d5c"],
        ] as const
      ).forEach(([skyTop, skyBottom, hills], index) => {
        const x = 10 + index * 79;
        const y = 19;
        const w = 72;
        const h = 58;
        ctx.save();
        roundRectPath(ctx, x, y, w, h, 2);
        ctx.clip();
        const sky = ctx.createLinearGradient(0, y, 0, y + h);
        sky.addColorStop(0, skyTop);
        sky.addColorStop(1, skyBottom);
        ctx.fillStyle = sky;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = index === 2 ? "#f5f5f7" : "rgba(255,255,240,.9)";
        ctx.beginPath();
        ctx.arc(x + 20 + index * 9, y + 22 - index * 2, index === 2 ? 4 : 7, 0, TAU);
        ctx.fill();
        ctx.fillStyle = hills;
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        for (let step = 0; step <= 8; step++) {
          ctx.lineTo(x + (step / 8) * w, y + h * (0.62 + Math.sin(step * 1.3 + index) * 0.08));
        }
        ctx.lineTo(x + w, y + h);
        ctx.fill();
        ctx.restore();
      });
      ctx.fillStyle = "#f0a83c";
      ctx.font = font(600, 3.4);
      setLetterSpacing(ctx, 0.4);
      ["14", "14A", "15", "15A"].forEach((frame, index) => ctx.fillText(frame, 12 + index * 79, 17.2));
      ctx.fillText("SAFETY FILM 400      KEEP IN A COOL DRY PLACE      DEVELOP BEFORE DATE", 46, 84.2);
    },
  },
  {
    id: "facts",
    label: "A Closer Look Facts label",
    w: 160,
    h: 212,
    draw(ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 160, 212);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, 150, 202);
      ctx.fillStyle = INK;
      ctx.font = font(800, 16.5);
      setLetterSpacing(ctx, -0.5);
      ctx.fillText("Closer Look", 11, 25);
      ctx.fillText("Facts", 11, 42);
      ctx.fillRect(11, 48, 138, 0.7);
      ctx.font = font(500, 8.5);
      setLetterSpacing(ctx, 0);
      ctx.fillText("Serving size", 11, 60);
      ctx.textAlign = "right";
      ctx.fillText("1 slow glance", 149, 60);
      ctx.textAlign = "left";
      ctx.fillRect(11, 65, 138, 6);
      (
        [
          ["Detail", "100%", true],
          ["Patience", "80%", false],
          ["Curiosity", "120%", true],
          ["Hurry", "0%", false],
          ["Scrolling past", "0%", false],
        ] as const
      ).forEach(([name, value, bold], index) => {
        const y = 84 + index * 15;
        ctx.font = font(bold ? 750 : 500, 9.5);
        ctx.fillText(name, 11, y);
        ctx.textAlign = "right";
        ctx.font = font(750, 9.5);
        ctx.fillText(value, 149, y);
        ctx.textAlign = "left";
        ctx.fillRect(11, y + 4.5, 138, 0.5);
      });
      ctx.fillRect(11, 158, 138, 3);
      ctx.fillStyle = "#3a3a3c";
      ctx.font = font(500, 2.7);
      setLetterSpacing(ctx, 0.05);
      [
        "* Percent daily values are based on a 2,000 second",
        "attention span. Your values may be higher if you",
        "have read this far. Contains traces of whitespace.",
        "Best enjoyed under glass. Do not skim.",
      ].forEach((line, index) => ctx.fillText(line, 11, 170 + index * 4.4));
    },
  },
  {
    id: "badge",
    label: "A round black badge that says seen up close",
    w: 122,
    h: 122,
    draw(ctx) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(61, 61, 60, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(61, 61, 40, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#f5f5f7";
      fillTextOnCircle(ctx, "SEEN UP CLOSE  •  SEEN UP CLOSE  •  ", 61, 61, 47, 9, 650);
      ctx.fillStyle = "rgba(245,245,247,.75)";
      fillTextOnCircle(ctx, "YOU FOUND THE SMALLEST LINE ON THE WHOLE PAGE  ", 61, 61, 36, 2.3, 500);
      // the eye
      ctx.strokeStyle = "#f5f5f7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(41, 61);
      ctx.quadraticCurveTo(61, 44, 81, 61);
      ctx.quadraticCurveTo(61, 78, 41, 61);
      ctx.stroke();
      ctx.fillStyle = "#0a84ff";
      ctx.beginPath();
      ctx.arc(61, 61, 8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(61, 61, 3.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(61 - 2.6, 61 - 2.8, 1.4, 0, TAU);
      ctx.fill();
    },
  },
];

// ───────────────────────── layouts ─────────────────────────

/** Where each object sits relative to the middle of the table: [dx, dy, rotation in degrees]. */
export type Layout = Record<string, [number, number, number]>;

/** Wide table (760px and up): one long spread. */
export const WIDE_LAYOUT: Layout = {
  specimen: [-440, 10, -7],
  stamp: [-262, -46, 6],
  ticket: [-104, 108, -4],
  dial: [34, -38, 0],
  badge: [150, 52, -12],
  film: [250, 128, 5],
  map: [318, -44, 8],
  facts: [478, 36, -6],
};

/** Narrow table (phones): the same objects stacked in a tall spread. */
export const TALL_LAYOUT: Layout = {
  stamp: [-104, -210, -7],
  dial: [86, -196, 4],
  ticket: [-4, -66, 4],
  badge: [-150, 34, -10],
  specimen: [-62, 108, -5],
  map: [108, 58, 7],
  facts: [116, 236, -4],
  film: [-38, 270, 6],
};

/** The size of the area each layout was composed in; the layout is scaled down to fit. */
export const WIDE_EXTENT = { w: 1160, h: 380 };
export const TALL_EXTENT = { w: 440, h: 700 };
```
