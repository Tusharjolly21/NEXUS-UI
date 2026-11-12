# Sand Drift Gallery

Add the "Sand Drift Gallery" component from Nexus UI to my project.

An endless strip of pictures that turn to sand at the edges. A wind takes the grains, swirling them outward and up, and packs them back into a picture as it returns; fling the strip and the sand trails behind, blown harder the faster you throw it. Tens of thousands of WebGL points meet a crisp card in the middle, and the strip drifts on its own while nobody is touching it. Focus it and the arrow keys step through the pictures.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SandDriftGallery } from "@/components/sand-drift-gallery";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/sand-drift-gallery/index.ts ---

```ts
export { default as SandDriftGallery } from "./sand-drift-gallery";
export type { SandDriftGalleryProps } from "./sand-drift-gallery";
```

--- components/sand-drift-gallery/sand-drift-gallery.tsx ---

```tsx
"use client";


import { useInView, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DriftItem = { title: string; note: string };

export type SandDriftGalleryProps = {
  /** captions for the five painted pictures */
  items?: DriftItem[];
  title?: string;
  /** how far the sand flies at the edges, px */
  scatter?: number;
  /** the strip's drift while nobody's touching it, px per second */
  drift?: number;
  /** Soft synthesised sounds: sand hissing as you fling the strip. They also follow the site-wide sound switch. */
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

const DEFAULT_ITEMS: DriftItem[] = [
  { title: "Dunes at noon", note: "Erg, 41 °C" },
  { title: "Aurora", note: "2 am, minus 18" },
  { title: "The reef", note: "4 m down" },
  { title: "Tulip rows", note: "April" },
  { title: "Harbour lights", note: "Last ferry" },
];

const CW = 200; // a card, css px
const CH = 260;
const GAP = 22;
const CELL = 3; // a grain of sand, css px
const TOP = 14;
const STAGE = TOP + CH + 56;
const TW = 400; // a card's painting, texture px
const TH = 520;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * An endless strip of pictures that turn to sand at the edges.
 *
 * Toward either edge each picture breaks into grains, and a wind takes them: they swirl outward and up on a curling
 * flow, finer the further they've gone, then thin to nothing; as a picture comes back in, its sand blows back and packs
 * into place. Drag the strip, or fling it, and the sand trails behind the motion, blown harder the faster you throw.
 * In the middle the pictures are crisp. The grains are drawn as tens of thousands of WebGL points and the intact part
 * as a textured card, using the same per-grain rule so the two meet seamlessly. Without WebGL the edges simply fade;
 * with reduced motion the strip doesn't drift and the edges fade instead of blowing away.
 *   <SandDriftGallery items={trips.map((t) => ({ title: t.place, note: t.date }))} />
 */
export default function SandDriftGallery({ items = DEFAULT_ITEMS, title = "Field notes", scatter = 150, drift = 22, enableSound = true, volume = 0.8, autoplay = false, className = "" }: SandDriftGalleryProps) {
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
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(800);
  const [current, setCurrent] = useState(0);
  const n = items.length;
  const SPAN = CW + GAP;
  const slots = Math.ceil(width / SPAN) + 2;

  const sim = useRef({
    off: 0, // how far the strip has scrolled, px
    vel: 0,
    drag: false,
    lastX: 0,
    lastT: 0,
    hover: false,
    hissAt: 0,
    target: null as number | null, // a keyboard step's destination
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const atlas = useMemo(() => (typeof document === "undefined" ? null : paintAtlas(n)), [n]);

  // ── the hand ──
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    s.drag = true;
    s.target = null;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.vel = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    unlockAudio();
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (!s.drag) return;
    const t = performance.now();
    const dx = e.clientX - s.lastX;
    s.off -= dx;
    s.vel = s.vel * 0.5 + (-dx / Math.max(0.008, (t - s.lastT) / 1000)) * 0.5;
    s.lastX = e.clientX;
    s.lastT = t;
  };
  const onUp = () => {
    const s = sim.current;
    s.drag = false;
    if (performance.now() - s.lastT > 80) s.vel = 0;
  };
  const step = (d: number) => {
    const s = sim.current;
    // the next card's centre comes to the middle
    const centreIdx = Math.round((s.off + width / 2 - CW / 2) / SPAN);
    s.target = (centreIdx + d) * SPAN - width / 2 + CW / 2;
    s.vel = 0;
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };

  // ── the loop ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current;
    if (!gl0 || !cv || !inView || !atlas) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const sand = reduce ? null : makeSand(gl0, atlas, n);
    const ctx = sand ? null : cv.getContext("2d");
    let raf = 0,
      last = performance.now(),
      shown = -1;
    const t0 = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!s.drag) {
        if (s.target !== null) {
          const d = s.target - s.off;
          s.vel = d * 7;
          if (Math.abs(d) < 0.5) {
            s.off = s.target;
            s.target = null;
            s.vel = 0;
          }
        } else {
          // coast to the idle drift
          const idle = reduce || s.hover ? 0 : drift;
          s.vel += (idle - s.vel) * (1 - Math.exp(-dt * 1.6));
        }
        s.off += s.vel * dt;
      }
      const speed = Math.abs(s.vel);
      if (speed > 500 && now > s.hissAt) {
        s.hissAt = now + 110;
        sfx.whoosh(2400, 4200, { dur: 0.16, gain: Math.min(0.03, speed / 60000) });
      }
      const edge = Math.min(170, W * (W < 520 ? 0.16 : 0.27));
      const first = Math.floor(s.off / SPAN);
      const shift = -(s.off - first * SPAN);
      const list: { x: number; card: number }[] = [];
      for (let k = 0; k < slots; k++) list.push({ x: shift + k * SPAN, card: (((first + k) % n) + n) % n });
      // captions ride under their cards and fade at the edges with them
      list.forEach((sl, k) => {
        const el = capRefs.current[k];
        if (!el) return;
        const cx = sl.x + CW / 2;
        const e = Math.min(cx, W - cx) / edge;
        el.style.transform = `translateX(${sl.x}px)`;
        el.style.opacity = String(clamp(e * 1.4 - 0.3));
        if (el.dataset.card !== String(sl.card)) {
          el.dataset.card = String(sl.card);
          el.children[0].textContent = items[sl.card].title;
          el.children[1].textContent = items[sl.card].note;
        }
      });
      // which card is nearest the middle (for screen readers)
      const mid = (((Math.round((s.off + W / 2 - CW / 2) / SPAN) % n) + n) % n);
      if (mid !== shown) {
        shown = mid;
        setCurrent(mid);
      }
      const t = (now - t0) / 1000;
      if (sand) sand.render({ W, H: STAGE, dpr, slots: list, t, vel: s.vel, edge, scatter });
      else if (ctx) drawFlat(ctx, cv, W, dpr, list, atlas, edge);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      sand?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, atlas, reduce, scatter, drift, slots]);

  // autoplay: now and then, a fling, so the sand flies
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    const id = window.setInterval(() => {
      const s = sim.current;
      if (s.drag || s.hover || s.target !== null) return;
      s.vel = (Math.random() < 0.5 ? -1 : 1) * (900 + Math.random() * 700);
    }, 4200);
    return () => window.clearInterval(id);
  }, [autoplay, inView, reduce]);

  return (
    <div ref={rootRef} className={`w-full rounded-[24px] bg-white py-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-5">
        <div className="text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
        <div className="text-[12px] text-[#86868b]">Drag or fling the strip. Arrow keys step through.</div>
      </div>
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={title}
        tabIndex={0}
        onKeyDown={(e) => {
          touched.current = true;
          onKey(e);
        }}
        onPointerDown={(e) => {
          touched.current = true;
          onDown(e);
        }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => (sim.current.hover = true)}
        onPointerLeave={() => {
          sim.current.hover = false;
          onUp();
        }}
        className="relative mt-3 cursor-grab select-none overflow-hidden outline-none focus-visible:shadow-[inset_0_0_0_2px_#0071e3] active:cursor-grabbing"
        style={{ height: STAGE, touchAction: "pan-y" }}
      >
        <canvas ref={glRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        {Array.from({ length: slots }, (_, k) => (
          <div key={k} ref={(el) => {
            capRefs.current[k] = el;
          }} aria-hidden="true" className="pointer-events-none absolute left-0" style={{ top: TOP + CH + 12, width: CW, willChange: "transform, opacity" }}>
            <div className="text-[14px] font-semibold tracking-[-0.01em]" />
            <div className="text-[12px] text-[#86868b]" />
          </div>
        ))}
        <div className="sr-only" aria-live="polite">
          {items[current]?.title}, {items[current]?.note}. Picture {current + 1} of {n}.
        </div>
      </div>
    </div>
  );
}

/** without WebGL: the cards, faded at the edges */
function drawFlat(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, W: number, dpr: number, list: { x: number; card: number }[], atlas: HTMLCanvasElement, edge: number) {
  if (cv.width !== Math.round(W * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(STAGE * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, STAGE);
  for (const sl of list) {
    const cx = sl.x + CW / 2;
    ctx.globalAlpha = clamp(Math.min(cx, W - cx) / edge);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sl.x, TOP, CW, CH, 14);
    ctx.clip();
    ctx.drawImage(atlas, sl.card * TW, 0, TW, TH, sl.x, TOP, CW, CH);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/** five pictures painted in code, side by side in one texture */
function paintAtlas(n: number) {
  const c = document.createElement("canvas");
  c.width = TW * n;
  c.height = TH;
  const g = c.getContext("2d")!;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const painters = [
    // dunes at noon
    (x0: number) => {
      const sky = g.createLinearGradient(0, 0, 0, TH * 0.45);
      sky.addColorStop(0, "#3d7bd8");
      sky.addColorStop(1, "#bfe0f5");
      g.fillStyle = sky;
      g.fillRect(x0, 0, TW, TH);
      const bands = [
        { y: 0.42, a: 40, lit: "#f0b77a", dark: "#c27a45" },
        { y: 0.55, a: 55, lit: "#f4a463", dark: "#b8642f" },
        { y: 0.7, a: 70, lit: "#f7c08a", dark: "#c9773d" },
        { y: 0.86, a: 60, lit: "#ffcf9a", dark: "#d4874b" },
      ];
      for (const b of bands) {
        const ph = rnd() * 6;
        const f = 1.5 + rnd() * 2;
        const ys = (x: number) => TH * b.y - b.a * Math.abs(Math.sin((x / TW) * Math.PI * f + ph));
        // lit along the crest, shadowed into the trough
        const top = TH * b.y - b.a;
        const gr = g.createLinearGradient(0, top, 0, TH * b.y + 40);
        gr.addColorStop(0, b.lit);
        gr.addColorStop(1, b.dark);
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(x0, TH);
        for (let x = 0; x <= TW; x += 4) g.lineTo(x0 + x, ys(x));
        g.lineTo(x0 + TW, TH);
        g.fill();
        // a sharp shadowed lee face down from each crest
        g.fillStyle = "rgba(120,60,25,.22)";
        g.beginPath();
        for (let x = 0; x <= TW; x += 4) {
          const yy = ys(x);
          if (Math.sin((x / TW) * Math.PI * f + ph) * Math.cos((x / TW) * Math.PI * f + ph) < 0) g.rect(x0 + x, yy, 4, 30);
        }
        g.fill();
        // ripples in the sand
        g.strokeStyle = "rgba(255,240,220,.25)";
        g.lineWidth = 1.5;
        for (let k = 0; k < 6; k++) {
          g.beginPath();
          for (let x = 0; x <= TW; x += 8) g.lineTo(x0 + x, ys(x) + 10 + k * 7 + Math.sin(x / 9 + k) * 2);
          g.stroke();
        }
      }
      g.fillStyle = "#fff8e8";
      g.beginPath();
      g.arc(x0 + TW * 0.75, TH * 0.12, 22, 0, Math.PI * 2);
      g.fill();
    },
    // aurora over snow
    (x0: number) => {
      const sky = g.createLinearGradient(0, 0, 0, TH);
      sky.addColorStop(0, "#071226");
      sky.addColorStop(0.7, "#1b2b4f");
      sky.addColorStop(1, "#2c3d63");
      g.fillStyle = sky;
      g.fillRect(x0, 0, TW, TH);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.6})`;
        g.fillRect(x0 + rnd() * TW, rnd() * TH * 0.6, 1.6, 1.6);
      }
      for (let k = 0; k < 3; k++) {
        const ph = rnd() * 6;
        for (let x = 0; x < TW; x += 2) {
          const y = TH * (0.22 + k * 0.08) + Math.sin(x / 50 + ph) * 30;
          const h = 90 + Math.sin(x / 23 + ph) * 40;
          const gr = g.createLinearGradient(0, y - h, 0, y);
          const col = k === 1 ? "180,90,255" : "60,255,170";
          gr.addColorStop(0, `rgba(${col},0)`);
          gr.addColorStop(0.8, `rgba(${col},${0.12 + 0.1 * Math.sin(x / 9 + ph)})`);
          gr.addColorStop(1, `rgba(${col},0)`);
          g.fillStyle = gr;
          g.fillRect(x0 + x, y - h, 2, h + 4);
        }
      }
      g.fillStyle = "#c9d6ec";
      g.beginPath();
      g.moveTo(x0, TH);
      for (let x = 0; x <= TW; x += 6) g.lineTo(x0 + x, TH * 0.74 - Math.sin(x / 70) * 30 - Math.sin(x / 23) * 8);
      g.lineTo(x0 + TW, TH);
      g.fill();
      g.fillStyle = "#e8eef8";
      g.beginPath();
      g.moveTo(x0, TH);
      for (let x = 0; x <= TW; x += 6) g.lineTo(x0 + x, TH * 0.86 - Math.sin(x / 90 + 2) * 20);
      g.lineTo(x0 + TW, TH);
      g.fill();
      // a cabin with a lit window
      g.fillStyle = "#1a2236";
      g.fillRect(x0 + TW * 0.6, TH * 0.78, 60, 34);
      g.beginPath();
      g.moveTo(x0 + TW * 0.6 - 8, TH * 0.78);
      g.lineTo(x0 + TW * 0.6 + 30, TH * 0.78 - 26);
      g.lineTo(x0 + TW * 0.6 + 68, TH * 0.78);
      g.fill();
      g.fillStyle = "#ffcf6e";
      g.fillRect(x0 + TW * 0.6 + 12, TH * 0.78 + 10, 12, 10);
    },
    // the reef
    (x0: number) => {
      const sea = g.createLinearGradient(0, 0, 0, TH);
      sea.addColorStop(0, "#5fd0e6");
      sea.addColorStop(0.5, "#1d8fb8");
      sea.addColorStop(1, "#0b4a73");
      g.fillStyle = sea;
      g.fillRect(x0, 0, TW, TH);
      for (let i = 0; i < 7; i++) {
        const x = x0 + rnd() * TW;
        const gr = g.createLinearGradient(x, 0, x + 60, TH);
        gr.addColorStop(0, "rgba(255,255,255,.28)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 30, 0);
        g.lineTo(x + 120, TH);
        g.lineTo(x + 70, TH);
        g.fill();
      }
      const corals = ["#ff7a6b", "#ffb04f", "#ff5f9e", "#b78cff", "#ffd36b"];
      for (let i = 0; i < 26; i++) {
        const x = x0 + rnd() * TW,
          y = TH * (0.72 + rnd() * 0.3),
          r = 14 + rnd() * 30;
        g.fillStyle = corals[i % corals.length];
        g.beginPath();
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI - Math.PI;
          g.moveTo(x, y);
          g.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r, r * 0.22, r * 0.45, a + Math.PI / 2, 0, Math.PI * 2);
        }
        g.fill();
      }
      for (let i = 0; i < 12; i++) {
        const x = x0 + 30 + rnd() * (TW - 60),
          y = TH * (0.25 + rnd() * 0.4),
          s = 8 + rnd() * 8;
        g.fillStyle = i % 3 ? "#ffcf3f" : "#ff8a3d";
        g.beginPath();
        g.ellipse(x, y, s, s * 0.5, 0, 0, Math.PI * 2);
        g.moveTo(x - s, y);
        g.lineTo(x - s * 1.7, y - s * 0.5);
        g.lineTo(x - s * 1.7, y + s * 0.5);
        g.fill();
      }
    },
    // tulip rows
    (x0: number) => {
      const sky = g.createLinearGradient(0, 0, 0, TH * 0.5);
      sky.addColorStop(0, "#6aaee8");
      sky.addColorStop(1, "#d8ecfa");
      g.fillStyle = sky;
      g.fillRect(x0, 0, TW, TH);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = "rgba(255,255,255,.85)";
        const cx = x0 + rnd() * TW,
          cy = TH * (0.08 + rnd() * 0.18);
        for (let k = 0; k < 5; k++) {
          g.beginPath();
          g.arc(cx + k * 14 - 28, cy + Math.sin(k) * 5, 14 + rnd() * 8, 0, Math.PI * 2);
          g.fill();
        }
      }
      const hz = TH * 0.42;
      const cols = ["#e8344e", "#ff7aa8", "#ffd23f", "#f25c2a", "#c3285f"];
      for (let r = 0; r < 12; r++) {
        // rows converge on a point on the horizon
        const a0 = -0.9 + (r / 11) * 1.8,
          a1 = -0.9 + ((r + 1) / 11) * 1.8;
        g.fillStyle = r % 2 ? "#3e7a35" : cols[(r / 2) % cols.length | 0];
        g.beginPath();
        g.moveTo(x0 + TW / 2, hz);
        g.lineTo(x0 + TW / 2 + a0 * TW * 1.6, TH);
        g.lineTo(x0 + TW / 2 + a1 * TW * 1.6, TH);
        g.fill();
      }
      for (let i = 0; i < 300; i++) {
        const y = hz + Math.pow(rnd(), 1.4) * (TH - hz);
        const x = x0 + rnd() * TW;
        g.fillStyle = `rgba(255,255,255,${0.1 + rnd() * 0.15})`;
        g.beginPath();
        g.arc(x, y, 1 + ((y - hz) / (TH - hz)) * 3, 0, Math.PI * 2);
        g.fill();
      }
      // a windmill on the horizon
      const wx = x0 + TW * 0.72;
      g.fillStyle = "#3a3340";
      g.beginPath();
      g.moveTo(wx - 12, hz + 2);
      g.lineTo(wx + 12, hz + 2);
      g.lineTo(wx + 6, hz - 60);
      g.lineTo(wx - 6, hz - 60);
      g.fill();
      g.strokeStyle = "#3a3340";
      g.lineWidth = 3;
      for (let k = 0; k < 4; k++) {
        const a = 0.4 + (k * Math.PI) / 2;
        g.beginPath();
        g.moveTo(wx, hz - 58);
        g.lineTo(wx + Math.cos(a) * 46, hz - 58 + Math.sin(a) * 46);
        g.stroke();
      }
    },
    // harbour lights
    (x0: number) => {
      const sky = g.createLinearGradient(0, 0, 0, TH);
      sky.addColorStop(0, "#0d1440");
      sky.addColorStop(0.55, "#3a2d6b");
      sky.addColorStop(0.62, "#e0717a");
      sky.addColorStop(1, "#141a3a");
      g.fillStyle = sky;
      g.fillRect(x0, 0, TW, TH);
      g.fillStyle = "#fff2d0";
      g.beginPath();
      g.arc(x0 + TW * 0.25, TH * 0.16, 18, 0, Math.PI * 2);
      g.fill();
      const base = TH * 0.62;
      let x = 0;
      while (x < TW) {
        const w = 24 + rnd() * 40,
          h = 60 + rnd() * 170;
        g.fillStyle = `hsl(${235 + rnd() * 20},30%,${10 + rnd() * 8}%)`;
        g.fillRect(x0 + x, base - h, w, h);
        for (let wy = base - h + 8; wy < base - 6; wy += 9)
          for (let wx = x + 4; wx < x + w - 4; wx += 7) {
            if (rnd() < 0.45) {
              g.fillStyle = rnd() < 0.8 ? "#ffd27a" : "#9fd8ff";
              g.fillRect(x0 + wx, wy, 3, 4);
            }
          }
        x += w + 2;
      }
      g.fillStyle = "#0b1030";
      g.fillRect(x0, base, TW, TH - base);
      // the lights, broken up on the water
      for (let i = 0; i < 260; i++) {
        const yy = base + rnd() * (TH - base);
        g.fillStyle = `rgba(255,${180 + rnd() * 60},${100 + rnd() * 80},${0.15 + rnd() * 0.35})`;
        g.fillRect(x0 + rnd() * TW, yy, 6 + rnd() * 16, 1.5);
      }
    },
  ];
  for (let i = 0; i < n; i++) {
    g.save();
    g.beginPath();
    g.rect(i * TW, 0, TW, TH);
    g.clip();
    painters[i % painters.length](i * TW);
    g.restore();
  }
  return c;
}

// ───────────── the sand, in WebGL ─────────────
// the rule both passes share: how far a grain has come apart, from where it sits on screen and its own seed
const RULE = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float apart(float x, float seed){
  float e = min(x, uRes.x - x) / uEdge;
  return clamp(1.0 - e + (seed - 0.5) * 0.7, 0.0, 1.0);
}
`;
const PTS_VS = `precision highp float;
attribute vec2 aCell;
uniform vec2 uRes; uniform float uDpr, uT, uVel, uEdge, uScatter, uSlotX, uCard, uCards;
uniform vec2 uCardSize, uGrid; uniform float uTop, uCell;
varying vec2 vUv; varying float vA, vF;
${RULE}
void main(){
  vec2 local = (aCell + 0.5) * uCell;
  vec2 pos = vec2(uSlotX, uTop) + local;
  float seed = hash(aCell + uCard * 17.0);
  float f = apart(pos.x, seed);
  vUv = vec2((uCard + local.x / uCardSize.x) / uCards, local.y / uCardSize.y);
  vF = f;
  // rounded corners: grains outside them don't exist
  vec2 q = abs(local - uCardSize * 0.5) - (uCardSize * 0.5 - 14.0);
  float corner = length(max(q, 0.0)) - 14.0;
  if (f < 0.004 || corner > 0.0) { gl_Position = vec4(2.0, 2.0, 0.0, 1.0); gl_PointSize = 0.0; vA = 0.0; return; }
  float f2 = f * f;
  float side = sign(pos.x - uRes.x * 0.5);
  // the wind: outward and up, curling, and dragged along behind the strip's motion
  float a = (sin(pos.y * 0.021 + uT * 0.9 + seed * 6.3) + sin(pos.x * 0.017 - uT * 0.7 + seed * 2.1)) * 1.6;
  vec2 swirl = vec2(cos(a), sin(a));
  vec2 d = (vec2(side * 0.7, -0.55) + swirl * 0.9) * f2 * uScatter * (0.6 + seed * 0.8);
  d += vec2(-uVel * 0.11 * f * (0.5 + seed), 0.0);
  d += vec2(sin(uT * 2.3 + seed * 40.0), cos(uT * 1.9 + seed * 31.0)) * f2 * 6.0;
  pos += d;
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
  // finer and fainter the further it's gone
  gl_PointSize = uCell * uDpr * (1.45 - 0.8 * f);
  vA = 1.0 - smoothstep(0.55, 1.0, f);
}`;
const PTS_FS = `precision highp float;
uniform sampler2D uAtlas;
varying vec2 vUv; varying float vA, vF;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  // round grains, a touch larger than their cell so the ones still packed close the gaps
  if (dot(c, c) > 0.25) discard;
  vec3 col = texture2D(uAtlas, vUv).rgb;
  col *= 1.0 + vF * 0.15;
  gl_FragColor = vec4(col * vA, vA);
}`;
const CARD_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const CARD_FS = `precision highp float;
uniform sampler2D uAtlas;
uniform vec2 uRes; uniform float uDpr, uEdge, uSlotX, uCard, uCards;
uniform vec2 uCardSize; uniform float uTop, uCell;
${RULE}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 local = px - vec2(uSlotX, uTop);
  if (local.x < 0.0 || local.y < 0.0 || local.x > uCardSize.x || local.y > uCardSize.y) discard;
  vec2 q = abs(local - uCardSize * 0.5) - (uCardSize * 0.5 - 14.0);
  float corner = length(max(q, 0.0)) - 14.0;
  float aa = clamp(0.5 - corner, 0.0, 1.0);
  vec2 cell = floor(local / uCell);
  float seed = hash(cell + uCard * 17.0);
  float f = apart(uSlotX + (cell.x + 0.5) * uCell, seed);
  if (f >= 0.004) discard;
  vec3 col = texture2D(uAtlas, vec2((uCard + local.x / uCardSize.x) / uCards, local.y / uCardSize.y)).rgb;
  gl_FragColor = vec4(col * aa, aa);
}`;
function makeSand(canvas: HTMLCanvasElement, atlas: HTMLCanvasElement, cards: number) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const link = (v: string, f: string, attr: string) => {
    const vs = sh(gl.VERTEX_SHADER, v),
      fs = sh(gl.FRAGMENT_SHADER, f);
    if (!vs || !fs) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, attr);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };
  const pts = link(PTS_VS, PTS_FS, "aCell"),
    card = link(CARD_VS, CARD_FS, "p");
  if (!pts || !card) return null;
  const gx = Math.ceil(CW / CELL),
    gy = Math.ceil(CH / CELL);
  const cells = new Float32Array(gx * gy * 2);
  for (let j = 0; j < gy; j++)
    for (let i = 0; i < gx; i++) {
      cells[(j * gx + i) * 2] = i;
      cells[(j * gx + i) * 2 + 1] = j;
    }
  const cellBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
  gl.bufferData(gl.ARRAY_BUFFER, cells, gl.STATIC_DRAW);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  const loc = (p: WebGLProgram) => (n: string) => gl.getUniformLocation(p, n);
  const P = loc(pts),
    C = loc(card);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  return {
    render(o: { W: number; H: number; dpr: number; slots: { x: number; card: number }[]; t: number; vel: number; edge: number; scatter: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const common = (U: (n: string) => WebGLUniformLocation | null) => {
        gl.uniform2f(U("uRes"), o.W, o.H);
        gl.uniform1f(U("uDpr"), o.dpr);
        gl.uniform1f(U("uEdge"), o.edge);
        gl.uniform2f(U("uCardSize"), CW, CH);
        gl.uniform1f(U("uTop"), TOP);
        gl.uniform1f(U("uCell"), CELL);
        gl.uniform1f(U("uCards"), cards);
        gl.uniform1i(U("uAtlas"), 0);
      };
      // the intact middles of the cards
      gl.useProgram(card);
      common(C);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (const s of o.slots) {
        if (s.x > o.W || s.x + CW < 0) continue;
        gl.uniform1f(C("uSlotX"), s.x);
        gl.uniform1f(C("uCard"), s.card);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      // the sand
      gl.useProgram(pts);
      common(P);
      gl.uniform1f(P("uT"), o.t);
      gl.uniform1f(P("uVel"), o.vel);
      gl.uniform1f(P("uScatter"), o.scatter);
      gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (const s of o.slots) {
        // only cards that reach into the edge bands have any sand
        if (s.x > o.edge && s.x + CW < o.W - o.edge) continue;
        if (s.x > o.W + 200 || s.x + CW < -200) continue;
        gl.uniform1f(P("uSlotX"), s.x);
        gl.uniform1f(P("uCard"), s.card);
        gl.drawArrays(gl.POINTS, 0, gx * gy);
      }
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(cellBuf);
      gl.deleteBuffer(quad);
      gl.deleteProgram(pts);
      gl.deleteProgram(card);
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
