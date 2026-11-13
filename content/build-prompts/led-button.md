# LED Button

Add the "LED Button" component from Nexus UI to my project.

A button made of hundreds of tiny LEDs that spell its label like a dot-matrix sign, each lamp throwing a little glow onto its neighbours. A pool of blue light follows your pointer across the lamps. Press it and a ripple runs out from your finger, the label dissolves lamp by lamp into a scrolling marquee while sparks twinkle, and it settles into a green check. By default it copies a prompt to the clipboard; give it onPress and the marquee runs until your promise settles. The lamps are drawn in WebGL, with a plain button underneath for keyboards and screen readers.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { LEDButton } from "@/components/led-button";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/led-button/index.ts ---

```ts
export { default as LEDButton } from "./led-button";
export type { LEDButtonProps } from "./led-button";
```

--- components/led-button/led-button.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { useInView, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type LEDButtonProps = {
  /** what the button says, in lights */
  label?: string;
  /** what scrolls past while it works */
  working?: string;
  /** what it says when it's done */
  done?: string;
  /** the text copied to the clipboard (set to null to copy nothing) */
  copyText?: string | null;
  /** runs on press; if it returns a promise the marquee runs until it settles (at least 1.4 s) */
  onPress?: () => Promise<unknown> | void;
  title?: string;
  description?: string;
  /** Soft synthesised sounds: a click, the relays ticking while it works, a chime. They also follow the site-wide sound switch. */
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

const BH = 60; // the pill, css px
const CELL = 4; // one LED


/**
 * A button made of LEDs.
 *
 * The pill is a panel of hundreds of tiny lamps, each with a lit core and a soft glow that spills onto its
 * neighbours. The label is spelt in them like a dot-matrix sign. Move over it and the lamps under your pointer warm up
 * in a pool of blue that follows you; press it and a ring of light ripples out from your finger. Then it gets to
 * work: the label dissolves lamp by lamp into a scrolling marquee while sparks twinkle across the panel, the prompt is
 * copied to the clipboard, and the marquee dissolves into a green check and "Copied". It's drawn in a WebGL shader from
 * three tiny bitmaps (the label, the marquee and the done state, one pixel per lamp); without WebGL it's an ordinary
 * dark pill. It's a real button, with the state read out to screen readers.
 *   <LEDButton label="Copy prompt" copyText={prompt} />
 */
export default function LEDButton({
  label = "Copy prompt",
  working = "Writing your prompt",
  done = "Copied",
  copyText = "Build a dark pill button made of LEDs that spell its label, light up around the pointer and ripple when pressed.",
  onPress,
  title = "Use this component",
  description = "Copy a ready-made prompt for your AI editor.",
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: LEDButtonProps) {
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(300);
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const stateRef = useRef(state);
  stateRef.current = state;
  const [gl, setGl] = useState(true);
  const cb = useRef({ onPress });
  cb.current = { onPress };

  const sim = useRef({
    p: { x: -999, y: -999 }, // the pointer over the panel, css px
    heat: 0, // how warm the pool under the pointer is
    ripples: [] as { x: number; y: number; t0: number }[],
    mode: 0, // 0 label, 1 marquee, 2 done
    from: 0,
    mix: 1, // dissolve progress from `from` to `mode`
    tickAt: 0,
  });

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goto = (mode: number) => {
    const s = sim.current;
    s.from = s.mix > 0.5 ? s.mode : s.from;
    s.mode = mode;
    s.mix = reduce ? 1 : 0;
  };

  const press = async (user: boolean, at?: { x: number; y: number }) => {
    if (user) touched.current = true;
    if (stateRef.current !== "idle") return;
    unlockAudio();
    const s = sim.current;
    s.ripples.push({ x: at?.x ?? width / 2, y: at?.y ?? BH / 2, t0: performance.now() });
    sfx.tick({ freq: 1800, gain: 0.05 });
    sfx.note(420, { dur: 0.12, gain: 0.04, bell: 0 });
    setState("working");
    stateRef.current = "working";
    goto(1);
    try {
      if (copyText && typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(copyText).catch(() => {});
      await Promise.all([cb.current.onPress?.(), new Promise((r) => setTimeout(r, reduce ? 400 : 1500))]);
    } catch {
      /* the done state shows either way */
    }
    setState("done");
    stateRef.current = "done";
    goto(2);
    s.ripples.push({ x: width / 2, y: BH / 2, t0: performance.now() });
    [988, 1319, 1760].forEach((f, i) => sfx.note(f, { at: i * 0.06, dur: 0.5, gain: 0.04, bell: 0.4 }));
    window.setTimeout(() => {
      setState("idle");
      stateRef.current = "idle";
      goto(0);
    }, 2200);
  };

  // ── the lamp bitmaps: one pixel per LED ──
  const cols = Math.max(20, Math.floor(width / CELL)),
    rows = Math.floor(BH / CELL);
  const bitmaps = useMemo(() => {
    if (typeof document === "undefined") return null;
    const make = (w: number, draw: (g: CanvasRenderingContext2D) => void) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = rows;
      const g = c.getContext("2d")!;
      g.fillStyle = "#000";
      g.fillRect(0, 0, w, rows);
      g.fillStyle = "#fff";
      g.strokeStyle = "#fff";
      draw(g);
      return c;
    };
    const font = (px: number) => `600 ${px}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`;
    const fit = (g: CanvasRenderingContext2D, text: string, maxW: number) => {
      let px = rows - 5;
      g.font = font(px);
      while (g.measureText(text).width > maxW && px > 7) g.font = font(--px);
      return px;
    };
    const lbl = make(cols, (g) => {
      fit(g, label, cols - 6);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, cols / 2, rows / 2 + 0.5);
    });
    let mw = 0;
    const mq = make(1024, (g) => {
      g.font = font(rows - 5);
      const piece = `${working}  ·  `;
      const pw = g.measureText(piece).width;
      g.textBaseline = "middle";
      for (let x = 0; x < 1024; x += pw) g.fillText(piece, x, rows / 2 + 0.5);
      mw = Math.floor(pw * Math.floor(1024 / pw));
    });
    const dn = make(cols, (g) => {
      const px = fit(g, done, cols - 22);
      const tw = g.measureText(done).width;
      const x0 = (cols - (tw + px + 3)) / 2;
      // a check, drawn in lamps
      g.lineWidth = 2;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(x0 + 1, rows / 2);
      g.lineTo(x0 + px * 0.38, rows / 2 + px * 0.34);
      g.lineTo(x0 + px, rows / 2 - px * 0.36);
      g.stroke();
      g.textBaseline = "middle";
      g.fillText(done, x0 + px + 3, rows / 2 + 0.5);
    });
    return { lbl, mq, dn, mw };
  }, [cols, rows, label, working, done]);

  // ── the hand ──
  const toLocal = (e: { clientX: number; clientY: number }) => {
    const r = btnRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onMove = (e: RPointerEvent) => {
    sim.current.p = toLocal(e);
    touched.current = true;
  };
  const onLeave = () => {
    sim.current.p = { x: -999, y: -999 };
  };

  // ── the loop ──
  useEffect(() => {
    const cv = glRef.current;
    if (!cv || !inView || !bitmaps) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = makeLED(cv, bitmaps, cols, rows);
    if (!r) {
      setGl(false);
      return;
    }
    let raf = 0,
      last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const inside = s.p.x > -100;
      s.heat += ((inside ? 1 : 0) - s.heat) * (1 - Math.exp(-dt * (inside ? 6 : 3)));
      if (s.mix < 1) s.mix = Math.min(1, s.mix + dt / 0.45);
      s.ripples = s.ripples.filter((q) => now - q.t0 < 1400);
      const st = stateRef.current;
      if (st === "working" && now > s.tickAt) {
        // relays clicking as the marquee runs
        s.tickAt = now + 70 + Math.random() * 90;
        sfx.tick({ freq: 2200 + Math.random() * 1600, gain: 0.008 });
      }
      const rp = new Float32Array(12);
      s.ripples.slice(-4).forEach((q, i) => {
        rp[i * 3] = q.x;
        rp[i * 3 + 1] = q.y;
        rp[i * 3 + 2] = (now - q.t0) / 1000;
      });
      for (let i = s.ripples.length; i < 4; i++) rp[i * 3 + 2] = 99;
      const t = (now - t0) / 1000;
      r.render({ W: width, dpr, t, p: s.p, heat: reduce ? 0 : s.heat, ripples: rp, from: s.from, to: s.mode, mix: s.mix, scroll: reduce ? 0 : t * 22, twinkle: st === "working" && !reduce ? 1 : 0 });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      r.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, bitmaps, reduce]);

  // ── autoplay: a pointer drifts across, and every few seconds it presses ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let raf = 0;
    const t0 = performance.now();
    let pressed = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (touched.current) return;
      const t = ((now - t0) / 1000) % 7;
      const s = sim.current;
      s.p = t < 4.6 ? { x: width * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(now / 900))), y: BH * (0.5 + 0.3 * Math.sin(now / 500)) } : { x: -999, y: -999 };
      if (t > 2.4 && t < 2.6 && pressed < 0) {
        pressed = 1;
        void press(false, s.p);
      }
      if (t < 1) pressed = -1;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, width, reduce]);

  const said = state === "idle" ? label : state === "working" ? working : done;

  return (
    <div ref={rootRef} className={`w-full max-w-[420px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
      <div className="mt-0.5 text-[13px] text-[#6e6e73]">{description}</div>
      <button
        ref={btnRef}
        type="button"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={(e) => press(true, toLocal(e))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void press(true);
          }
        }}
        aria-label={said}
        aria-live="polite"
        className="relative mt-4 block w-full overflow-hidden rounded-full bg-[#0b0c10] outline-none shadow-[0_1px_0_rgba(255,255,255,.08)_inset,0_10px_24px_-12px_rgba(0,0,0,.55)] focus-visible:shadow-[0_0_0_3px_#0071e3]"
        style={{ height: BH, touchAction: "manipulation" }}
      >
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        {!gl && <span className={`relative text-[15px] font-semibold ${state === "done" ? "text-[#30d158]" : "text-white"}`}>{said}</span>}
        {/* the glass over the panel: a soft reflection along the top */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-[3px] h-[40%] rounded-full bg-gradient-to-b from-white/[.07] to-transparent" />
      </button>
      <div className="mt-3 text-[12px] text-[#86868b]">Move over the lights, then press.</div>
    </div>
  );
}

// ───────────── the lamps, in WebGL ─────────────
const LED_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const LED_FS = `precision highp float;
uniform sampler2D uLbl, uMq, uDn;
uniform vec2 uRes, uGrid, uP; uniform float uDpr, uT, uHeat, uFrom, uTo, uMix, uScroll, uMqW, uTwinkle;
uniform vec3 uRip[4];
const float CELL = ${CELL.toFixed(1)};
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sdPill(vec2 p, vec2 b){ float r = b.y; vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float maskOf(float m, vec2 c){
  if (m < 0.5) return texture2D(uLbl, (c + 0.5) / uGrid).r;
  if (m < 1.5) return texture2D(uMq, vec2((mod(c.x + uScroll, uMqW) + 0.5) / 1024.0, (c.y + 0.5) / uGrid.y)).r;
  return texture2D(uDn, (c + 0.5) / uGrid).r;
}
// one lamp's brightness and colour
vec4 lamp(vec2 c){
  vec2 ctr = (c + 0.5) * CELL + (uRes - uGrid * CELL) * 0.5;
  float inside = step(sdPill(ctr - uRes * 0.5, uRes * 0.5 - vec2(5.0)), 0.0);
  if (inside < 0.5) return vec4(0.0);
  // the dissolve from one bitmap to the next goes lamp by lamp in a random order
  float k = hash(c + 7.0);
  float m = k < uMix ? uTo : uFrom;
  float on = smoothstep(0.35, 0.6, maskOf(m, c));
  vec3 lit = m > 1.5 ? vec3(0.25, 0.95, 0.45) : vec3(1.0, 0.95, 0.86);
  float b = 0.05 + 0.03 * hash(c);
  vec3 col = vec3(1.0, 0.95, 0.86) * b;
  col += lit * on * (0.95 + 0.05 * sin(uT * 3.0 + k * 20.0));
  // a pool of warm light follows the pointer
  float d = length(ctr - uP);
  float pool = exp(-d * d / 900.0) * uHeat;
  col += vec3(0.25, 0.55, 1.0) * pool * (0.7 + 0.3 * on);
  // ripples from a press
  for (int i = 0; i < 4; i++) {
    vec3 r = uRip[i];
    if (r.z > 1.5) continue;
    float rr = r.z * 420.0;
    float ring = exp(-pow((length(ctr - r.xy) - rr) / 10.0, 2.0)) * (1.0 - r.z / 1.5);
    col += vec3(0.5, 0.75, 1.0) * ring * 1.2;
  }
  // sparks while it works
  float tw = step(0.985, hash(c + floor(uT * 9.0))) * uTwinkle;
  col += mix(vec3(1.0, 0.8, 0.5), vec3(0.6, 0.8, 1.0), hash(c + 3.0)) * tw;
  return vec4(col, 1.0);
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 off = (uRes - uGrid * CELL) * 0.5;
  vec2 g = (px - off) / CELL;
  vec2 c0 = floor(g);
  vec3 col = vec3(0.0);
  // each lamp: a lit core, and a soft glow that spills onto its neighbours
  for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 c = c0 + vec2(float(i), float(j));
      if (c.x < 0.0 || c.y < 0.0 || c.x >= uGrid.x || c.y >= uGrid.y) continue;
      vec4 l = lamp(c);
      if (l.a < 0.5) continue;
      float d = length(g - (c + 0.5));
      float core = smoothstep(0.42, 0.3, d);
      float glow = exp(-d * d / 0.9);
      col += l.rgb * (core * 0.85 + glow * 0.35);
    }
  // the panel itself: near black, with a faint bevel
  float edge = sdPill(px - uRes * 0.5, uRes * 0.5);
  vec3 base = vec3(0.035, 0.038, 0.05) + vec3(0.04) * smoothstep(-6.0, 0.0, edge) * step(px.y, uRes.y * 0.5);
  col = base + col;
  col = col / (1.0 + col * 0.25);
  gl_FragColor = vec4(col, 1.0);
}`;
function makeLED(canvas: HTMLCanvasElement, bm: { lbl: HTMLCanvasElement; mq: HTMLCanvasElement; dn: HTMLCanvasElement; mw: number }, cols: number, rows: number) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, LED_VS),
    fs = sh(gl.FRAGMENT_SHADER, LED_FS);
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
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const texs = [bm.lbl, bm.mq, bm.dn].map((c, i) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    return t;
  });
  gl.uniform1i(u("uLbl"), 0);
  gl.uniform1i(u("uMq"), 1);
  gl.uniform1i(u("uDn"), 2);
  gl.uniform2f(u("uGrid"), cols, rows);
  gl.uniform1f(u("uMqW"), Math.max(1, bm.mw));
  const U = { res: u("uRes"), dpr: u("uDpr"), t: u("uT"), p: u("uP"), heat: u("uHeat"), rip: u("uRip"), from: u("uFrom"), to: u("uTo"), mix: u("uMix"), scroll: u("uScroll"), tw: u("uTwinkle") };
  return {
    render(o: { W: number; dpr: number; t: number; p: { x: number; y: number }; heat: number; ripples: Float32Array; from: number; to: number; mix: number; scroll: number; twinkle: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(BH * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, o.W, BH);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.t, o.t);
      gl.uniform2f(U.p, o.p.x, o.p.y);
      gl.uniform1f(U.heat, o.heat);
      gl.uniform3fv(U.rip, o.ripples);
      gl.uniform1f(U.from, o.from);
      gl.uniform1f(U.to, o.to);
      gl.uniform1f(U.mix, o.mix);
      gl.uniform1f(U.scroll, Math.floor(o.scroll));
      gl.uniform1f(U.tw, o.twinkle);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      texs.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
