# Diffusion Loader

Add the "Diffusion Loader" component from Nexus UI to my project.

An image-generation placeholder that resolves the way a diffusion model does. A fine film grain sits over a soft wash of colour that flows like ink, then firms into shapes, edges and texture step by step as the noise drains away, with a glow of colour breathing round the frame. At the end a soft focus front sweeps down and brings the sharp picture in. The step count is read out, and Regenerate starts again with a new seed.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DiffusionLoader } from "@/components/diffusion-loader";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/diffusion-loader/diffusion-loader.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DiffusionLoaderProps = {
  prompt?: string;
  /** how many denoising steps the preview counts through */
  steps?: number;
  /** seconds for the whole run */
  duration?: number;
  /** an image to resolve into instead of the painted demo (must allow cross-origin use) */
  src?: string;
  onDone?: (seed: number) => void;
  /** Soft synthesised sounds: a tick each step, a chime when it's done. They also follow the site-wide sound switch. */
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

const ICON_SPARK = "M208 144a15.78 15.78 0 0 1-10.42 14.94L146 178l-19 51.62a15.92 15.92 0 0 1-29.88 0L78 178l-51.62-19a15.92 15.92 0 0 1 0-29.88L78 110l19-51.62a15.92 15.92 0 0 1 29.88 0L146 110l51.62 19A15.78 15.78 0 0 1 208 144m-56-96h16v16a8 8 0 0 0 16 0V48h16a8 8 0 0 0 0-16h-16V16a8 8 0 0 0-16 0v16h-16a8 8 0 0 0 0 16m88 32h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16";
const ICON_AGAIN = "M240 56v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h27.4l-26.59-24.36l-.25-.24a80 80 0 1 0-1.67 114.78a8 8 0 0 1 11 11.63A95.44 95.44 0 0 1 128 224h-1.32a96 96 0 1 1 69.07-164L224 85.8V56a8 8 0 1 1 16 0";
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * An image-generation placeholder that resolves the way a diffusion model does.
 *
 * It starts as a fine, filmic grain over a soft wash of colour that flows slowly like ink in water. Over the steps the
 * noise drains away on a real schedule and the picture comes up through it coarse to fine: shapes, then edges, then
 * texture, each step a fresh estimate, the colour and contrast arriving with the detail, while a glow of colour
 * breathes round the inside of the frame and a slow sheen crosses it. At the end a soft focus front sweeps down the
 * frame bringing the sharp image in, and it catches one glint. A step counter and a
 * progress bar keep time; Regenerate draws a new seed, so the noise and even the composition change. It's a WebGL
 * shader over a small pyramid of blurred copies of the image; without WebGL it's composited in 2D.
 *   <DiffusionLoader prompt="a lighthouse on a cliff at dusk" duration={5} onDone={(seed) => save(seed)} />
 */
export default function DiffusionLoader({
  prompt = "A lighthouse on a sea cliff at dusk, the first stars out, oil painting",
  steps = 30,
  duration = 5.2,
  src,
  onDone,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: DiffusionLoaderProps) {
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
  const boxRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(400);
  const [seed, setSeed] = useState(48213);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0); // bumps to start a new run
  const cb = useRef({ onDone });
  cb.current = { onDone };
  const H = Math.round(width * 0.75);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the image it resolves into: painted from the seed, or the one you give it
  const [target, setTarget] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!src) {
      setTarget(paintLighthouse(960, 720, seed));
      return;
    }
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = 960;
      c.height = 720;
      const g = c.getContext("2d")!;
      const s = Math.max(960 / im.naturalWidth, 720 / im.naturalHeight);
      g.drawImage(im, (960 - im.naturalWidth * s) / 2, (720 - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
      setTarget(c);
    };
    im.onerror = () => setTarget(paintLighthouse(960, 720, seed));
    im.src = src;
  }, [src, seed]);

  const regenerate = (user: boolean) => {
    if (user) touched.current = true;
    unlockAudio();
    setSeed((s) => (s * 48271 + 12345) % 99991);
    setDone(false);
    setStep(0);
    setRun((r) => r + 1);
    sfx.whoosh(600, 1400, { dur: 0.3, gain: 0.03 });
  };

  // ── the run ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current;
    if (!gl0 || !cv || !inView || !target) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const pyr = pyramid(target);
    const r = makeDiffusion(gl0, pyr);
    const flat = r ? null : cv.getContext("2d");
    const t0 = performance.now();
    const D = (reduce ? 1.2 : duration) * 1000;
    const DEC = reduce ? 1 : 700; // the decode sweep
    let raf = 0,
      lastStep = -1,
      finished = false;
    setDone(false);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const e = now - t0;
      const k = clamp(e / D);
      // steps tick on a slight ease: fast through the noisy start, slower as the detail comes
      const sf = Math.pow(k, 0.85) * steps;
      const st = Math.min(steps, Math.floor(sf));
      const sub = clamp((sf - st) / 0.18); // a quick blend into each new estimate
      if (st !== lastStep && st <= steps) {
        lastStep = st;
        setStep(st);
        if (st > 0 && st < steps) sfx.tick({ freq: 900 + st * 40, gain: 0.012 });
      }
      const dec = clamp((e - D) / DEC);
      if (dec >= 1 && !finished) {
        finished = true;
        setDone(true);
        cb.current.onDone?.(seed);
        [1047, 1319, 1568].forEach((f, i) => sfx.note(f, { at: i * 0.07, dur: 0.7, gain: 0.04, bell: 0.4 }));
      }
      if (finished && e > D + DEC + 900) {
        cancelAnimationFrame(raf);
      }
      const prog = (s: number) => clamp(s / steps);
      const a = prog(Math.max(0, st - 1)),
        b = prog(st);
      if (r) r.render({ W, H, dpr, a, b, sub, seedA: Math.max(0, st - 1) + seed * 0.013, seedB: st + seed * 0.013, dec, glint: clamp((e - D) / (DEC + 600)), time: e / 1000, glow: reduce ? 0 : 1 - clamp((e - D + 200) / 700) });
      else if (flat) drawFlat(flat, cv, W, H, dpr, pyr, prog(st), dec);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      r?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, target, run, reduce]);

  // ── autoplay: when a picture's done, look at it a while, then generate another ──
  useEffect(() => {
    if (!autoplay || reduce || !done) return;
    const t = window.setTimeout(() => !touched.current && regenerate(false), 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, done, reduce]);

  const pct = Math.round((step / steps) * 100);

  return (
    <div ref={rootRef} className={`w-full max-w-[440px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#bf5af2]" aria-hidden="true">
          <svg viewBox="0 0 256 256" className="h-4 w-4">
            <path fill="currentColor" d={ICON_SPARK} />
          </svg>
        </span>
        <p className="text-[14px] leading-[1.4] text-[#1d1d1f]">{prompt}</p>
      </div>
      <div ref={boxRef} className="relative mt-3 overflow-hidden rounded-[16px] bg-[#e8e8ed]" style={{ height: H }}>
        <canvas ref={glRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <AnimatePresence>
          {!done && (
            <motion.div
              key="step"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-medium tabular-nums text-white backdrop-blur-md"
            >
              Step {step} of {steps}
            </motion.div>
          )}
        </AnimatePresence>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-black/10">
          <div className="h-full bg-white/90 transition-[width] duration-150" style={{ width: `${done ? 100 : pct}%`, opacity: done ? 0 : 1 }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-[12px] tabular-nums text-[#86868b]" role="status" aria-live="polite">
          {done ? `Done. Seed ${seed}` : `Generating, ${pct}%`}
        </div>
        <button
          type="button"
          onClick={() => regenerate(true)}
          disabled={!done}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] outline-none transition-opacity hover:bg-[#ebebef] focus-visible:shadow-[0_0_0_2px_#0071e3] disabled:opacity-40"
        >
          <svg viewBox="0 0 256 256" className="h-3.5 w-3.5" aria-hidden="true">
            <path fill="currentColor" d={ICON_AGAIN} />
          </svg>
          Regenerate
        </button>
      </div>
    </div>
  );
}

/** blurred copies of the target, each a quarter the size of the last (the coarse-to-fine ladder the steps climb) */
function pyramid(src: HTMLCanvasElement) {
  const out: HTMLCanvasElement[] = [src];
  let cur = src;
  for (const f of [6, 24, 80]) {
    const c = document.createElement("canvas");
    c.width = Math.max(4, Math.round(src.width / f));
    c.height = Math.max(3, Math.round(src.height / f));
    const g = c.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    // step down through halves so the smaller copies are properly averaged
    let tmp: HTMLCanvasElement = cur;
    while (tmp.width / 2 > c.width) {
      const h = document.createElement("canvas");
      h.width = Math.round(tmp.width / 2);
      h.height = Math.round(tmp.height / 2);
      h.getContext("2d")!.drawImage(tmp, 0, 0, h.width, h.height);
      tmp = h;
    }
    g.drawImage(tmp, 0, 0, c.width, c.height);
    out.push(c);
    cur = c;
  }
  return out;
}

/** without WebGL: the ladder cross-faded, with a noise layer that thins */
function drawFlat(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, W: number, H: number, dpr: number, pyr: HTMLCanvasElement[], k: number, dec: number) {
  if (cv.width !== Math.round(W * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const lod = (1 - Math.pow(k, 0.6)) * 3;
  const i = Math.min(2, Math.floor(lod));
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = 1;
  ctx.drawImage(pyr[i + 1], 0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1 - (lod - i);
  ctx.drawImage(pyr[i], 0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1;
  if (dec > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cv.width, cv.height * dec);
    ctx.clip();
    ctx.drawImage(pyr[0], 0, 0, cv.width, cv.height);
    ctx.restore();
  }
  const n = 1 - k;
  if (n > 0.01) {
    ctx.fillStyle = `rgba(128,128,128,${n * 0.9})`;
    for (let q = 0; q < 900 * n; q++) {
      const v = Math.random() * 255;
      ctx.fillStyle = `rgba(${v},${Math.random() * 255},${v},${n * 0.8})`;
      ctx.fillRect(Math.random() * cv.width, Math.random() * cv.height, 6 * dpr, 6 * dpr);
    }
  }
}

/** the demo picture: a lighthouse on a cliff at dusk; the seed moves things about */
function paintLighthouse(W: number, H: number, seed: number) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  let s = seed % 2147483647 || 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const hue = rnd() * 40 - 20;
  const horizon = H * (0.6 + rnd() * 0.06);
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, `hsl(${222 + hue},48%,22%)`);
  sky.addColorStop(0.5, `hsl(${255 + hue},30%,42%)`);
  sky.addColorStop(0.82, `hsl(${18 + hue},75%,64%)`);
  sky.addColorStop(1, `hsl(${36 + hue},90%,78%)`);
  g.fillStyle = sky;
  g.fillRect(0, 0, W, horizon);
  // stars
  for (let i = 0; i < 70; i++) {
    const y = rnd() * horizon * 0.5;
    g.fillStyle = `rgba(255,255,240,${0.3 + rnd() * 0.6 * (1 - y / (horizon * 0.5))})`;
    g.beginPath();
    g.arc(rnd() * W, y, 0.8 + rnd() * 1.6, 0, Math.PI * 2);
    g.fill();
  }
  // brush texture over the sky
  for (let i = 0; i < 260; i++) {
    const y = rnd() * horizon;
    g.strokeStyle = `rgba(255,${200 + rnd() * 55},${180 + rnd() * 60},${0.03 + rnd() * 0.05})`;
    g.lineWidth = 3 + rnd() * 8;
    g.beginPath();
    const x = rnd() * W;
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 40, y - 4 + rnd() * 8, x + 80 + rnd() * 120, y + rnd() * 6 - 3);
    g.stroke();
  }
  // sea
  const sea = g.createLinearGradient(0, horizon, 0, H);
  sea.addColorStop(0, `hsl(${30 + hue},55%,60%)`);
  sea.addColorStop(0.15, `hsl(${215 + hue},35%,38%)`);
  sea.addColorStop(1, `hsl(${220 + hue},45%,16%)`);
  g.fillStyle = sea;
  g.fillRect(0, horizon, W, H - horizon);
  for (let i = 0; i < 180; i++) {
    const y = horizon + Math.pow(rnd(), 1.5) * (H - horizon);
    g.fillStyle = `rgba(255,${190 + rnd() * 50},${150 + rnd() * 50},${0.06 + rnd() * 0.16})`;
    g.fillRect(rnd() * W, y, 20 + rnd() * 60 * (1 + (y - horizon) / 150), 1.5 + (y - horizon) / 90);
  }
  // the cliff, from one side
  const left = rnd() < 0.5;
  const cx = left ? W * (0.3 + rnd() * 0.08) : W * (0.62 + rnd() * 0.08);
  const top = horizon - H * (0.12 + rnd() * 0.06);
  g.fillStyle = `hsl(${250 + hue},22%,14%)`;
  g.beginPath();
  if (left) {
    g.moveTo(0, H);
    g.lineTo(0, top - 10);
    for (let x = 0; x <= cx; x += 10) g.lineTo(x, top + Math.sin(x / 37) * 6 + (x / cx) * 8);
    g.lineTo(cx + 30, top + 40);
    g.lineTo(cx + 60, horizon + 20);
    g.lineTo(cx + 120, H);
  } else {
    g.moveTo(W, H);
    g.lineTo(W, top - 10);
    for (let x = W; x >= cx; x -= 10) g.lineTo(x, top + Math.sin(x / 37) * 6 + ((W - x) / (W - cx)) * 8);
    g.lineTo(cx - 30, top + 40);
    g.lineTo(cx - 60, horizon + 20);
    g.lineTo(cx - 120, H);
  }
  g.fill();
  // the cliff's face catches the last light, in dabs of paint
  g.save();
  g.clip();
  for (let i = 0; i < 420; i++) {
    const x = left ? rnd() * (cx + 120) : cx - 120 + rnd() * (W - cx + 120);
    const y = top + rnd() * (H - top);
    const lit = Math.max(0, 1 - Math.abs(x - (left ? cx : cx)) / 160) * (1 - (y - top) / (H - top));
    g.fillStyle = `hsla(${(lit > 0.2 ? 20 : 250) + hue},${lit > 0.2 ? 55 : 18}%,${16 + lit * 40 + rnd() * 8}%,${0.25 + rnd() * 0.35})`;
    g.beginPath();
    g.ellipse(x, y, 6 + rnd() * 14, 2 + rnd() * 4, rnd() * 0.6 - 0.3, 0, Math.PI * 2);
    g.fill();
  }
  // grass along the top
  g.fillStyle = `hsla(${95 + hue},30%,26%,.9)`;
  for (let x = left ? 0 : cx - 20; x < (left ? cx + 20 : W); x += 3) {
    g.fillRect(x, top + Math.sin(x / 37) * 6 + (left ? (x / cx) * 8 : ((W - x) / (W - cx)) * 8) - 2, 3, 6 + rnd() * 4);
  }
  g.restore();
  // the lighthouse
  const lx = left ? cx * 0.62 : cx + (W - cx) * 0.38;
  const lh = H * 0.18;
  const ly = top + 2;
  g.fillStyle = "#e8e2d6";
  g.beginPath();
  g.moveTo(lx - 16, ly);
  g.lineTo(lx + 16, ly);
  g.lineTo(lx + 10, ly - lh);
  g.lineTo(lx - 10, ly - lh);
  g.fill();
  g.fillStyle = "#b8473a";
  for (let k = 1; k < 4; k++) g.fillRect(lx - 15 + k * 1.6, ly - (lh * k) / 4 - 10, 30 - k * 3.2, 10);
  g.fillStyle = "#2a2a33";
  g.fillRect(lx - 13, ly - lh - 6, 26, 6);
  g.fillStyle = "#ffe9a8";
  g.fillRect(lx - 9, ly - lh - 22, 18, 16);
  g.fillStyle = "#2a2a33";
  g.beginPath();
  g.moveTo(lx - 12, ly - lh - 22);
  g.lineTo(lx, ly - lh - 36);
  g.lineTo(lx + 12, ly - lh - 22);
  g.fill();
  // its beam and glow
  const by = ly - lh - 14;
  const glow = g.createRadialGradient(lx, by, 4, lx, by, 120);
  glow.addColorStop(0, "rgba(255,240,190,.9)");
  glow.addColorStop(1, "rgba(255,240,190,0)");
  g.fillStyle = glow;
  g.fillRect(lx - 120, by - 120, 240, 240);
  const dir = left ? 1 : -1;
  const beam = g.createLinearGradient(lx, by, lx + dir * W * 0.6, by);
  beam.addColorStop(0, "rgba(255,240,190,.55)");
  beam.addColorStop(1, "rgba(255,240,190,0)");
  g.fillStyle = beam;
  g.beginPath();
  g.moveTo(lx, by - 4);
  g.lineTo(lx + dir * W * 0.7, by - 70);
  g.lineTo(lx + dir * W * 0.7, by + 40);
  g.lineTo(lx, by + 4);
  g.fill();
  // a soft bloom over the whole picture, the way a render glows: a blurred copy screened on top
  const small = document.createElement("canvas");
  small.width = Math.round(W / 16);
  small.height = Math.round(H / 16);
  small.getContext("2d")!.drawImage(c, 0, 0, small.width, small.height);
  g.save();
  g.globalCompositeOperation = "screen";
  g.globalAlpha = 0.28;
  g.imageSmoothingQuality = "high";
  g.drawImage(small, 0, 0, W, H);
  g.restore();
  // and a fine grain, like paint on canvas
  const img = g.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 10;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// ───────────── the sampler, in WebGL ─────────────
const DIF_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const DIF_FS = `precision highp float;
uniform sampler2D uL0, uL1, uL2, uL3;
uniform vec2 uRes; uniform float uDpr;
uniform float uA, uB, uSub, uSeedA, uSeedB, uDec, uGlint, uTime, uGlow;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float vnoise(vec2 p, float s){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(vec3(i, s)), hash(vec3(i + vec2(1.0, 0.0), s)), f.x), mix(hash(vec3(i + vec2(0.0, 1.0), s)), hash(vec3(i + vec2(1.0, 1.0), s)), f.x), f.y);
}
vec3 lad(vec2 uv, float lod){
  vec3 a = texture2D(uL0, uv).rgb, b = texture2D(uL1, uv).rgb, c = texture2D(uL2, uv).rgb, d = texture2D(uL3, uv).rgb;
  if (lod < 1.0) return mix(a, b, lod);
  if (lod < 2.0) return mix(b, c, lod - 1.0);
  return mix(c, d, clamp(lod - 2.0, 0.0, 1.0));
}
// the model's estimate at progress k: the picture seen through the noise left at that step
vec3 estimate(vec2 p, float k, float seed){
  vec2 uv = p / uRes;
  float lk = 1.0 - k;
  // coarse to fine: a softer rung of the ladder early on
  float lod = (1.0 - pow(k, 0.55)) * 3.2;
  // early on the colour flows like ink in water, slowly, and settles as the picture firms up
  vec2 flow = vec2(vnoise(p / 110.0 + vec2(uTime * 0.12, 0.0), seed * 0.0 + 1.0), vnoise(p / 110.0 + vec2(0.0, uTime * 0.1), 2.0)) - 0.5;
  vec2 wob = (vec2(vnoise(p / 45.0, seed), vnoise(p / 45.0, seed + 3.3)) - 0.5) * 10.0 * lk * lk;
  vec3 x0 = lad((p + flow * 70.0 * pow(lk, 1.6) + wob) / uRes, lod);
  // gentle grading: a touch flat and cool at first, the full colour and contrast arriving with the detail
  float l = dot(x0, vec3(0.299, 0.587, 0.114));
  x0 = mix(vec3(l), x0, 0.7 + 0.3 * k);
  x0 = mix(vec3(0.42, 0.44, 0.52), x0, 0.62 + 0.38 * k);
  // what noise is left: fine grain like film, mostly in brightness, fresh each step, plus soft luminous mottling
  float sig = pow(lk, 1.45);
  float g = hash(vec3(floor(p * 1.0), seed)) + hash(vec3(floor(p * 1.0), seed + 0.71)) - 1.0;
  vec3 grain = vec3(g) + (vec3(hash(vec3(floor(p), seed + 1.7)), hash(vec3(floor(p), seed + 2.3)), hash(vec3(floor(p), seed + 2.9))) - 0.5) * 0.35;
  float mott = vnoise(p / 26.0, seed + 5.0) * 0.6 + vnoise(p / 11.0, seed + 6.0) * 0.4 - 0.5;
  return clamp(x0 + grain * sig * 0.42 + vec3(mott) * sig * 0.35, 0.0, 1.0);
}
vec3 glowAt(float a){
  // a soft loop of colour that runs round the frame while it works
  vec3 c1 = vec3(1.0, 0.45, 0.7), c2 = vec3(0.6, 0.45, 1.0), c3 = vec3(0.35, 0.7, 1.0), c4 = vec3(1.0, 0.72, 0.4);
  float t = fract(a) * 4.0;
  if (t < 1.0) return mix(c1, c2, t);
  if (t < 2.0) return mix(c2, c3, t - 1.0);
  if (t < 3.0) return mix(c3, c4, t - 2.0);
  return mix(c4, c1, t - 3.0);
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec3 col = mix(estimate(p, uA, uSeedA), estimate(p, uB, uSeedB), uSub);
  // the decoder: a soft front sweeps down the frame, bringing the sharp image into focus behind it
  float front = uDec * (uRes.y + 120.0) - 60.0;
  float m = smoothstep(front + 50.0, front - 50.0, p.y);
  vec3 sharp = texture2D(uL0, p / uRes).rgb;
  col = mix(col, sharp, m);
  col += vec3(0.9, 0.95, 1.0) * exp(-pow((p.y - front) / 40.0, 2.0)) * 0.08 * step(0.001, uDec) * step(uDec, 0.999);
  // while it's working: a slow sheen across the picture
  float sweep = fract(uTime / 2.6);
  float gx = (p.x + p.y * 0.6) / (uRes.x + uRes.y * 0.6);
  col += vec3(1.0) * exp(-pow((gx - (sweep * 1.6 - 0.3)) / 0.09, 2.0)) * 0.06 * uGlow;
  // and a glow of colour breathing round the inside of the frame
  vec2 c = p - uRes * 0.5;
  float edge = min(min(p.x, uRes.x - p.x), min(p.y, uRes.y - p.y));
  float ring = exp(-edge / 16.0) * (0.75 + 0.25 * sin(uTime * 2.2));
  vec3 gcol = glowAt(atan(c.y, c.x) / 6.28318 + uTime * 0.12);
  col = mix(col, col + gcol * 0.55, ring * uGlow);
  // the finished picture gets one glint
  float gx2 = (p.x + p.y * 0.5) / (uRes.x + uRes.y * 0.5);
  col += vec3(1.0) * exp(-pow((gx2 - (uGlint * 1.6 - 0.3)) / 0.06, 2.0)) * 0.14 * step(0.001, uGlint) * step(uGlint, 0.999);
  gl_FragColor = vec4(col, 1.0);
}`;
function makeDiffusion(canvas: HTMLCanvasElement, pyr: HTMLCanvasElement[]) {
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, DIF_VS),
    fs = sh(gl.FRAGMENT_SHADER, DIF_FS);
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
  const texs = pyr.map((c, i) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.uniform1i(u(`uL${i}`), i);
    return t;
  });
  const U = { res: u("uRes"), dpr: u("uDpr"), a: u("uA"), b: u("uB"), sub: u("uSub"), sa: u("uSeedA"), sb: u("uSeedB"), dec: u("uDec"), glint: u("uGlint"), time: u("uTime"), glow: u("uGlow") };
  return {
    render(o: { W: number; H: number; dpr: number; a: number; b: number; sub: number; seedA: number; seedB: number; dec: number; glint: number; time: number; glow: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, o.W, o.H);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.a, o.a);
      gl.uniform1f(U.b, o.b);
      gl.uniform1f(U.sub, o.sub);
      gl.uniform1f(U.sa, o.seedA);
      gl.uniform1f(U.sb, o.seedB);
      gl.uniform1f(U.dec, o.dec);
      gl.uniform1f(U.glint, o.glint);
      gl.uniform1f(U.time, o.time);
      gl.uniform1f(U.glow, o.glow);
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

--- components/diffusion-loader/index.ts ---

```ts
export { default as DiffusionLoader } from "./diffusion-loader";
export type { DiffusionLoaderProps } from "./diffusion-loader";
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
