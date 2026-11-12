"use client";


import { useInView, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type GlyphRainProps = {
  /** what the rain spells where you linger: one string per line, letters, digits and spaces */
  message?: string[];
  code?: string;
  title?: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  /** Soft synthesised sounds: a faint ticking as letters settle. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const ICON_HOME = "M224 120v96a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8v-52a4 4 0 0 0-4-4h-40a4 4 0 0 0-4 4v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a16 16 0 0 1 4.69-11.31l80-80a16 16 0 0 1 22.62 0l80 80A16 16 0 0 1 224 120";
const SH = 340;
const CELL = 14;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-=<>/|{}[]:;!?~^@ ";
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * A 404 page hero of falling characters that hides a message.
 *
 * Columns of letters and symbols rain down the panel at their own speeds, each with a bright head and a fading tail,
 * the characters flickering as they fall. Your pointer lights them as it passes, leaving a trail of blue that fades.
 * Linger, and around you the rain gives up its secret: characters stop changing and settle into the words of a hidden
 * message, which stays a while after you move on before it melts back into the rain. It's drawn in one WebGL shader
 * from a font atlas and a small texture holding, for each cell, its trail, how far it's revealed and its letter of
 * the message; without WebGL it's drawn on a 2D canvas.
 *   <GlyphRain message={["THIS PAGE", "WANDERED OFF"]} onAction={() => router.push("/")} />
 */
export default function GlyphRain({
  message = ["THIS PAGE", "WANDERED OFF"],
  code = "404",
  title = "Nothing at this address",
  description = "Something's written in the rain. Move over it to find out what.",
  action = "Back to home",
  onAction,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: GlyphRainProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(560);
  const [found, setFound] = useState(false);

  const cols = Math.max(10, Math.floor(width / CELL)),
    rows = Math.floor(SH / CELL);

  const sim = useRef({
    p: { x: -999, y: -999 },
    over: false,
    tickAt: 0,
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the message laid out on the grid, centred; and the font atlas
  const layout = useMemo(() => {
    const m = new Uint8Array(cols * rows);
    const lines = message.map((l) => l.toUpperCase());
    const longest = Math.max(...lines.map((l) => l.length));
    // on a narrow panel, letters take one cell; on a wide one, they're spaced a cell apart
    const gap = longest * 2 - 1 <= cols - 4 ? 2 : 1;
    const top = Math.floor(rows / 2 - (lines.length * 2 - 1) / 2) - 1;
    lines.forEach((l, li) => {
      const span = (l.length - 1) * gap + 1;
      const x0 = Math.floor((cols - span) / 2);
      for (let i = 0; i < l.length; i++) {
        const gi = GLYPHS.indexOf(l[i]);
        if (gi < 0 || l[i] === " ") continue;
        const x = x0 + i * gap,
          y = top + li * 2;
        if (x >= 0 && x < cols && y >= 0 && y < rows) m[y * cols + x] = gi + 1;
      }
    });
    return m;
  }, [cols, rows, message]);
  const atlas = useMemo(() => (typeof document === "undefined" ? null : makeAtlas()), []);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    sim.current.p = { x: e.clientX - r.left, y: e.clientY - r.top };
    sim.current.over = true;
    touched.current = true;
    unlockAudio();
  };
  const onLeave = () => {
    sim.current.over = false;
    sim.current.p = { x: -999, y: -999 };
  };

  // ── the loop: the trail and the reveal, cell by cell, then the drawing ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current;
    if (!gl0 || !cv || !inView || !atlas) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const n = cols * rows;
    const trail = new Float32Array(n),
      reveal = new Float32Array(n);
    const state = new Uint8Array(n * 4);
    const r = makeRain(gl0, atlas, cols, rows);
    const ctx = r ? null : cv.getContext("2d");
    let raf = 0,
      last = performance.now(),
      wasFound = false;
    const t0 = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const cx = s.p.x / CELL,
        cy = s.p.y / CELL;
      let shown = 0,
        total = 0,
        settled = 0;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const d = Math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.1);
          // the trail: lit where the pointer passes, fading
          trail[i] = Math.max(trail[i] * Math.exp(-dt * 2.6), s.over ? clamp(1.6 - d / 1.4) : 0);
          // the reveal: grows where you linger, then lingers itself before melting back
          const before = reveal[i];
          if (s.over && d < 9) reveal[i] = Math.min(1, reveal[i] + dt * (reduce ? 6 : 2.2) * (1 - d / 9));
          else reveal[i] = Math.max(0, reveal[i] - dt * 0.07);
          if (layout[i]) {
            total++;
            if (reveal[i] > 0.6) shown++;
            if (before <= 0.6 && reveal[i] > 0.6) settled++;
          }
          state[i * 4] = Math.round(trail[i] * 255);
          state[i * 4 + 1] = Math.round(reveal[i] * 255);
          state[i * 4 + 2] = layout[i];
        }
      if (settled && now > s.tickAt) {
        // letters settling into place
        s.tickAt = now + 45;
        sfx.tick({ freq: 2600 + Math.random() * 1200, gain: 0.012 });
      }
      const isFound = total > 0 && shown / total > 0.7;
      if (isFound !== wasFound) {
        wasFound = isFound;
        setFound(isFound);
        if (isFound) sfx.note(660, { dur: 0.6, gain: 0.04, bell: 0.4 });
      }
      const t = reduce ? 0 : (now - t0) / 1000;
      if (r) r.render({ W, H: SH, dpr, t, state, p: s.p, over: s.over ? 1 : 0 });
      else if (ctx) drawFlat(ctx, cv, W, dpr, cols, rows, t, trail, reveal, layout);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      r?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, atlas, layout, reduce]);

  // ── autoplay: a pointer wanders over the message, slowly, so it appears ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (touched.current) return;
      const t = (now - t0) / 1000;
      const s = sim.current;
      const cyc = t % 14;
      s.over = cyc < 8;
      s.p = { x: width * (0.5 + Math.sin(t * 0.55) * 0.36), y: SH * (0.46 + Math.sin(t * 1.3) * 0.12) };
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, inView, width, reduce]);

  return (
    <div ref={rootRef} className={`w-full rounded-[24px] bg-white p-3 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div ref={stageRef} className="relative cursor-crosshair select-none overflow-hidden rounded-[18px] bg-[#05070d]" style={{ height: SH }} onPointerMove={onMove} onPointerLeave={onLeave}>
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#05070d]/40 to-transparent" style={{ top: width < 520 ? "40%" : "60%" }} />
        <div className="absolute inset-x-5 bottom-4 flex flex-wrap items-end justify-between gap-3">
          <div className="pointer-events-none min-w-0">
            <div className="text-[13px] font-semibold tabular-nums tracking-[0.02em] text-[#64d2ff]">{code}</div>
            <div className="text-[20px] font-semibold tracking-[-0.02em] text-white">{title}</div>
            <div className="mt-0.5 text-[13px] text-white/60" aria-live="polite">
              {found ? `It says: ${message.join(" ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}.` : description}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAction?.()}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[14px] font-medium text-[#1d1d1f] outline-none hover:bg-white/90 focus-visible:shadow-[0_0_0_3px_#0071e3]"
          >
            <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden="true">
              <path fill="currentColor" d={ICON_HOME} />
            </svg>
            {action}
          </button>
        </div>
      </div>
      <div className="sr-only">Hidden message: {message.join(" ")}</div>
    </div>
  );
}

/** the font atlas: every glyph in an 8 by 8 grid of 32 px cells, white on transparent */
function makeAtlas() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = '600 24px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  for (let i = 0; i < GLYPHS.length; i++) g.fillText(GLYPHS[i], (i % 8) * 32 + 16, Math.floor(i / 8) * 32 + 17);
  return c;
}

const hash1 = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** without WebGL: the same rain, drawn as text */
function drawFlat(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, W: number, dpr: number, cols: number, rows: number, t: number, trail: Float32Array, reveal: Float32Array, msg: Uint8Array) {
  if (cv.width !== Math.round(W * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(SH * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, SH);
  ctx.font = '600 11px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let x = 0; x < cols; x++) {
    const sp = 2 + hash1(x) * 5,
      head = ((t * sp + hash1(x + 9) * 40) % (rows + 14)) - 2;
    for (let y = 0; y < rows; y++) {
      const i = y * cols + x;
      const above = head - y;
      let b = above >= 0 ? Math.exp(-above / 5) : 0;
      b = Math.max(b * 0.7, 0.08, trail[i]);
      let ch = GLYPHS[Math.floor(hash1(x * 31 + y * 7 + Math.floor(t * (1 + hash1(i) * 3))) * (GLYPHS.length - 1))];
      let col = `rgba(120,180,255,${b})`;
      if (msg[i] && reveal[i] > 0.5) {
        ch = GLYPHS[msg[i] - 1];
        col = `rgba(255,255,255,${0.5 + reveal[i] * 0.5})`;
      }
      ctx.fillStyle = col;
      ctx.fillText(ch, x * CELL + CELL / 2, y * CELL + CELL / 2);
    }
  }
}

// ───────────── the rain, in WebGL ─────────────
const RAIN_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const RAIN_FS = `precision highp float;
uniform sampler2D uAtlas, uState;
uniform vec2 uRes, uGrid, uP; uniform float uDpr, uT, uOver;
const float CELL = ${CELL.toFixed(1)};
const float NG = ${(GLYPHS.length - 1).toFixed(1)};
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float glyph(float gi, vec2 local){
  vec2 a = vec2(mod(gi, 8.0), floor(gi / 8.0));
  vec2 uv = (a + clamp(local, 0.02, 0.98)) / 8.0;
  return texture2D(uAtlas, uv).a;
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 cell = floor(px / CELL);
  if (cell.x >= uGrid.x || cell.y >= uGrid.y) { gl_FragColor = vec4(0.0); return; }
  vec2 local = fract(px / CELL);
  vec4 st = texture2D(uState, (cell + 0.5) / uGrid);
  float trail = st.r, reveal = st.g, msg = floor(st.b * 255.0 + 0.5);
  // two drops per column, each at its own speed, with a bright head and a fading tail
  float h1 = hash(vec2(cell.x, 1.0)), h2 = hash(vec2(cell.x, 2.0));
  float span = uGrid.y + 18.0;
  float rain = 0.0, head = 0.0;
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    float sp = 2.0 + 6.0 * hash(vec2(cell.x, 3.0 + fk));
    float hy = mod(uT * sp + hash(vec2(cell.x, 5.0 + fk)) * span, span) - 4.0;
    float above = hy - cell.y;
    float tail = 4.0 + 8.0 * hash(vec2(cell.x, 7.0 + fk));
    rain = max(rain, above >= 0.0 ? exp(-above / tail) : 0.0);
    head = max(head, smoothstep(1.0, 0.0, abs(above)));
  }
  // the characters flicker as they fall, each cell at its own rate
  float rate = 0.6 + 3.0 * hash(cell + 11.0);
  float gi = floor(hash(cell + floor(uT * rate + hash(cell) * 10.0)) * NG);
  float g = glyph(gi, local);
  // a faint field everywhere, the rain cool blue, its head white
  float base = 0.07 + 0.04 * h2;
  vec3 col = vec3(0.45, 0.62, 1.0) * g * (base + rain * 0.65);
  col += vec3(0.85, 0.95, 1.0) * g * head * 0.9;
  // the pointer's trail: brighter, and a soft glow round the characters
  col += vec3(0.25, 0.7, 1.0) * trail * g * 1.5;
  // a soft pool of light round the pointer
  float pd = length(px - uP);
  col += vec3(0.1, 0.3, 0.7) * exp(-pd * pd / 2600.0) * 0.28 * uOver;
  // the hidden message: where it's revealed, the cell stops changing and shows its letter, white, with a glow
  if (msg > 0.5) {
    float m = glyph(msg - 1.0, local);
    float k = smoothstep(0.25, 0.75, reveal);
    vec3 lit = vec3(1.0) * m * 1.2;
    col = mix(col, lit, k);
  } else {
    // around the message the rain dims a little, so the words stand out
    col *= 1.0 - reveal * 0.6;
  }
  gl_FragColor = vec4(col, 1.0);
}`;
function makeRain(canvas: HTMLCanvasElement, atlas: HTMLCanvasElement, cols: number, rows: number) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, RAIN_VS),
    fs = sh(gl.FRAGMENT_SHADER, RAIN_FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const mk = (unit: number, filter: number) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const tA = mk(0, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  const tS = mk(1, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform1i(u("uAtlas"), 0);
  gl.uniform1i(u("uState"), 1);
  gl.uniform2f(u("uGrid"), cols, rows);
  const U = { res: u("uRes"), dpr: u("uDpr"), t: u("uT"), p: u("uP"), over: u("uOver") };
  return {
    render(o: { W: number; H: number; dpr: number; t: number; state: Uint8Array; p: { x: number; y: number }; over: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tS);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, o.state);
      gl.uniform2f(U.res, o.W, o.H);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.t, o.t);
      gl.uniform2f(U.p, o.p.x, o.p.y);
      gl.uniform1f(U.over, o.over);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(tA);
      gl.deleteTexture(tS);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
