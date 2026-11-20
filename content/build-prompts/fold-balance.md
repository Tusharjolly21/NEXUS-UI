# Fold Balance

Add the "Fold Balance" component from Nexus UI to my project.

Fold the corner to hide your balance. Take the top corner of the account sheet and pull: the paper folds along a crease that follows your finger, its back turning over with a soft shadow while the card shows underneath. Let go past the middle and it stays folded with every amount turned to dots.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FoldBalance } from "@/components/fold-balance";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/fold-balance/fold-balance.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FoldTransaction = {
  name: string;
  detail: string;
  amount: number;
  time: string;
  icon: string;
};
export type FoldBalanceProps = {
  balance?: number;
  account?: string;
  transactions?: FoldTransaction[];
  currency?: string;
  /** start with the corner folded down */
  defaultHidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
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
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
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

const ICONS: Record<string, string> = {
  coffee:
    "M80 56V24a8 8 0 0 1 16 0v32a8 8 0 0 1-16 0m40 8a8 8 0 0 0 8-8V24a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m32 0a8 8 0 0 0 8-8V24a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m96 56v8a40 40 0 0 1-37.51 39.91a96.6 96.6 0 0 1-27 40.09H208a8 8 0 0 1 0 16H32a8 8 0 0 1 0-16h24.54A96.3 96.3 0 0 1 24 136V88a8 8 0 0 1 8-8h176a40 40 0 0 1 40 40m-48-24H40v40a80.27 80.27 0 0 0 45.12 72h69.76A80.27 80.27 0 0 0 200 136Zm32 24a24 24 0 0 0-16-22.62V136a96 96 0 0 1-1.2 15a24 24 0 0 0 17.2-23Z",
  gas: "m241 69.66l-19.34-19.32a8 8 0 0 0-11.32 11.32L229.66 81a8 8 0 0 1 2.34 5.63V168a8 8 0 0 1-16 0v-40a24 24 0 0 0-24-24h-16V56a24 24 0 0 0-24-24H72a24 24 0 0 0-24 24v152H32a8 8 0 0 0 0 16h160a8 8 0 0 0 0-16h-16v-88h16a8 8 0 0 1 8 8v40a24 24 0 0 0 48 0V86.63a23.85 23.85 0 0 0-7-16.97M64 208V56a8 8 0 0 1 8-8h80a8 8 0 0 1 8 8v152Zm80-96a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8",
  bag: "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 160H40V56h176zM176 88a48 48 0 0 1-96 0a8 8 0 0 1 16 0a32 32 0 0 0 64 0a8 8 0 0 1 16 0",
  train:
    "M184 24H72a32 32 0 0 0-32 32v128a32 32 0 0 0 32 32h8l-14.4 19.2a8 8 0 1 0 12.8 9.6L100 216h56l21.6 28.8a8 8 0 1 0 12.8-9.6L176 216h8a32 32 0 0 0 32-32V56a32 32 0 0 0-32-32M56 120V80h64v40Zm80-40h64v40h-64ZM72 40h112a16 16 0 0 1 16 16v8H56v-8a16 16 0 0 1 16-16m112 160H72a16 16 0 0 1-16-16v-48h144v48a16 16 0 0 1-16 16m-88-28a12 12 0 1 1-12-12a12 12 0 0 1 12 12m88 0a12 12 0 1 1-12-12a12 12 0 0 1 12 12",
};

const DEFAULT_TX: FoldTransaction[] = [
  {
    name: "Corner Coffee",
    detail: "Coffee & restaurants",
    amount: 24.33,
    time: "4:20 PM",
    icon: "coffee",
  },
  {
    name: "Fuel stop",
    detail: "Transport",
    amount: 89.12,
    time: "1:45 PM",
    icon: "gas",
  },
  {
    name: "Market Hall",
    detail: "Groceries",
    amount: 46.8,
    time: "9:05 AM",
    icon: "bag",
  },
];

type V = [number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];

/** keep the part of a polygon where (p - m) . n >= 0 (or < 0 when keepBack) */
function clipHalf(poly: V[], m: V, n: V, keepBack: boolean) {
  const out: V[] = [];
  const side = (p: V) => dot([p[0] - m[0], p[1] - m[1]], n) * (keepBack ? -1 : 1);
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa >= 0) out.push(a);
    if (sa >= 0 !== sb >= 0) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/** where the folded corner lands and what is left of the sheet, for a corner pulled from (0,0) to p */
function fold(p: V, w: number, h: number) {
  const len = Math.hypot(p[0], p[1]);
  const rect: V[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  if (len < 0.5) return { sheet: rect, flap: [] as V[], m: [0, 0] as V, n: [0.7, 0.7] as V };
  const n: V = [p[0] / len, p[1] / len];
  const m: V = [p[0] / 2, p[1] / 2];
  const sheet = clipHalf(rect, m, n, false);
  const flap = clipHalf(rect, m, n, true).map((q) => {
    const d = dot([q[0] - m[0], q[1] - m[1]], n);
    return [q[0] - 2 * d * n[0], q[1] - 2 * d * n[1]] as V;
  });
  return { sheet, flap, m, n };
}

const pts = (poly: V[]) =>
  poly.length ? poly.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(" ") : "0,0 0,0 0,0";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true">
      <path d={ICONS[name] ?? ICONS.bag} fill="currentColor" />
    </svg>
  );
}

function Amount({
  value,
  hidden,
  currency,
  reduce,
}: {
  value: string;
  hidden: boolean;
  currency: string;
  reduce: boolean;
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        justifyContent: "flex-end",
        minWidth: 64,
        height: 20,
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={hidden ? "h" : "v"}
          initial={reduce ? false : { opacity: 0, y: hidden ? 6 : -6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: hidden ? -6 : 6, filter: "blur(4px)" }}
          transition={{
            type: "tween",
            duration: 0.28,
            ease: [0.3, 0.7, 0.4, 1],
          }}
          style={{
            display: "inline-block",
            color: hidden ? "#c7c7cc" : "#1d1d1f",
            letterSpacing: hidden ? "0.12em" : "-0.01em",
          }}
        >
          {hidden ? "••••" : `-${currency}${value}`}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Fold the corner to hide your balance. The account sheet sits on top of the card; take its top-left corner and pull
 * it down, and the paper folds along a crease that follows your finger, the back of the sheet turning over and
 * casting a soft shadow while the card shows underneath. Let go past the middle and it stays folded with every
 * amount turned to dots; let go early and it springs flat. The corner is also a switch, so Enter or Space folds it
 * too.
 */
export default function FoldBalance({
  balance = 5432,
  account = "Everyday",
  transactions = DEFAULT_TX,
  currency = "$",
  defaultHidden = false,
  onHiddenChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FoldBalanceProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 380, h: 300 });
  const [hidden, setHidden] = useState(defaultHidden);
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;
  const touched = useRef(false);
  const drag = useRef<{
    id: number;
    ox: number;
    oy: number;
    sx: number;
    sy: number;
  } | null>(null);
  const REST: V = [30, 30];

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    setSize({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // the corner, folded: the crease runs from the left edge under the balance to just past the right edge
  const target = useMemo<V>(() => {
    const xa = size.w * 1.08;
    const yb = 132;
    const k = 1 / Math.sqrt(1 / (xa * xa) + 1 / (yb * yb));
    return [(2 * k * k) / xa, (2 * k * k) / yb];
  }, [size.w]);

  const px = useMotionValue(defaultHidden ? target[0] : REST[0]);
  const py = useMotionValue(defaultHidden ? target[1] : REST[1]);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const geo = useTransform([px, py] as MotionValue<number>[], ([x, y]: number[]) =>
    fold([x, y], sizeRef.current.w, sizeRef.current.h),
  );
  const sheetClip = useTransform(geo, (g) => `polygon(${g.sheet.map((q) => `${q[0]}px ${q[1]}px`).join(",")})`);
  const flapPts = useTransform(geo, (g) => pts(g.flap));
  // the shading runs across the crease: darker right at the fold, lighter toward the tip
  const gx1 = useTransform(geo, (g) => g.m[0]);
  const gy1 = useTransform(geo, (g) => g.m[1]);
  const hx = useTransform(px, (v) => v - 28);
  const hy = useTransform(py, (v) => v - 28);
  const shadowOp = useTransform([px, py] as MotionValue<number>[], ([x, y]: number[]) =>
    Math.min(1, Math.hypot(x, y) / 60),
  );

  const settle = (fold: boolean, fromKey = false) => {
    const to = fold ? target : REST;
    const t = reduce
      ? { duration: 0 }
      : {
          type: "spring" as const,
          stiffness: fromKey ? 170 : 240,
          damping: fromKey ? 22 : 26,
          mass: 0.9,
        };
    void animate(px, to[0], t);
    void animate(py, to[1], t);
    if (fold !== hiddenRef.current) {
      setHidden(fold);
      onHiddenChange?.(fold);
      sfx.whoosh(fold ? 900 : 2200, fold ? 2600 : 800, {
        dur: 0.32,
        gain: 0.05,
      });
      sfx.tick({ at: 0.22, freq: fold ? 1700 : 2100, gain: 0.02 });
    }
  };

  // keep the folded shape right when the sheet changes width
  useEffect(() => {
    if (hiddenRef.current && !drag.current) {
      px.set(target[0]);
      py.set(target[1]);
    }
  }, [target, px, py]);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = sheetRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as V;
  };
  const down = (e: RPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    drag.current = {
      id: e.pointerId,
      ox: p[0] - px.get(),
      oy: p[1] - py.get(),
      sx: e.clientX,
      sy: e.clientY,
    };
    px.stop();
    py.stop();
    sfx.tick({ freq: 2400, gain: 0.012 });
  };
  const move = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = local(e);
    const { w, h } = sizeRef.current;
    px.set(Math.max(0, Math.min(w * 0.9, p[0] - d.ox)));
    py.set(Math.max(0, Math.min(h * 0.9, p[1] - d.oy)));
  };
  const up = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const pulled = Math.hypot(px.get(), py.get());
    const goal = Math.hypot(target[0], target[1]);
    const moved = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
    // a tap toggles; a drag decides by how far the corner travelled
    if (moved < 4) settle(!hiddenRef.current);
    else settle(pulled > goal * 0.42);
  };

  // autoplay: fold it, wait, smooth it flat again
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const run = async () => {
      await wait(1200);
      while (ok()) {
        await animate(px, 46, { duration: 0.35, ease: "easeOut" });
        if (!ok()) return;
        void animate(py, 40, { duration: 0.35, ease: "easeOut" });
        await wait(250);
        if (!ok()) return;
        settle(true, true);
        await wait(2600);
        if (!ok()) return;
        settle(false, true);
        await wait(2400);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, target]);

  const [whole, cents] = balance.toFixed(2).split(".");
  const fid = `fold${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      className={`relative w-full max-w-[420px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#0b0b0c",
          padding: "18px 14px 0",
          overflow: "hidden",
          boxShadow: "0 30px 60px -32px rgba(0,0,0,0.55)",
        }}
      >
        {/* the card underneath */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 6px 14px",
            color: "#f5f5f7",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "#1c1c1e",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
              <path
                d="M224 48H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 16v24H32V64Zm0 128H32v-88h192zm-16-24a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8m-64 0a8 8 0 0 1-8 8h-16a8 8 0 0 1 0-16h16a8 8 0 0 1 8 8"
                fill="currentColor"
              />
            </svg>
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{account}</span>
          <span
            style={{
              fontSize: 15,
              color: "rgba(235,235,245,0.45)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            4821
          </span>
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "relative",
            height: 150,
            borderRadius: 18,
            overflow: "hidden",
            background: "linear-gradient(150deg, #3a2a2c 0%, #23191b 55%, #170f11 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
            {Array.from({ length: 14 }, (_, i) => (
              <path
                key={i}
                d={`M ${-40 + i * 10} 160 C ${80 + i * 14} ${40 + i * 3}, ${180 + i * 6} ${180 - i * 6}, ${440} ${-10 + i * 9}`}
                stroke="#f5d0c8"
                strokeWidth="0.6"
                fill="none"
              />
            ))}
          </svg>
          <span
            style={{
              position: "absolute",
              right: 16,
              top: 14,
              fontSize: 12,
              color: "rgba(255,235,230,0.5)",
            }}
          >
            Show details
          </span>
        </div>

        {/* the sheet */}
        <div
          style={{
            position: "relative",
            margin: "-70px -14px 0",
            height: "auto",
          }}
        >
          <motion.div
            ref={sheetRef}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "26px 26px 0 0",
              clipPath: sheetClip,
              WebkitClipPath: sheetClip,
              padding: "24px 26px 22px",
            }}
          >
            <div style={{ fontSize: 13, color: "#86868b" }}>Balance</div>
            <div
              aria-label={
                hidden ? "Balance hidden" : `Balance ${currency}${Number(whole).toLocaleString("en-US")}.${cents}`
              }
              style={{
                display: "flex",
                alignItems: "baseline",
                marginTop: 4,
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: "-0.035em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {currency}
              {Number(whole).toLocaleString("en-US")}
              <span style={{ color: "#c7c7cc" }}>.{cents}</span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#86868b",
                marginTop: 22,
                marginBottom: 6,
              }}
            >
              Today
            </div>
            {transactions.map((t) => (
              <div
                key={t.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 0",
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    background: "#f5f5f7",
                    color: "#6e6e73",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={t.icon} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 15,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t.name}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "#86868b",
                      marginTop: 1,
                    }}
                  >
                    {t.detail}
                  </span>
                </span>
                <span style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 15,
                      fontWeight: 500,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <Amount value={t.amount.toFixed(2)} hidden={hidden} currency={currency} reduce={reduce} />
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "#86868b",
                      marginTop: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t.time}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>

          {/* the turned-over corner */}
          <svg
            aria-hidden="true"
            width={size.w}
            height={size.h}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            <defs>
              <motion.linearGradient id={`${fid}g`} gradientUnits="userSpaceOnUse" x1={gx1} y1={gy1} x2={px} y2={py}>
                <stop offset="0" stopColor="#dcdce0" />
                <stop offset="0.18" stopColor="#f4f4f6" />
                <stop offset="0.7" stopColor="#ffffff" />
                <stop offset="1" stopColor="#ececf0" />
              </motion.linearGradient>
              <filter id={`${fid}s`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="3" dy="8" stdDeviation="9" floodColor="#000" floodOpacity="0.16" />
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.1" />
              </filter>
            </defs>
            <motion.polygon
              points={flapPts}
              fill={`url(#${fid}g)`}
              filter={`url(#${fid}s)`}
              style={{ opacity: shadowOp }}
            />
            <motion.polygon points={flapPts} fill={`url(#${fid}g)`} />
          </svg>

          {/* the corner you take hold of */}
          <motion.button
            type="button"
            role="switch"
            aria-checked={hidden}
            aria-label="Hide balance"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                touched.current = true;
                settle(!hiddenRef.current, true);
              }
            }}
            onPointerEnter={() =>
              !drag.current &&
              !hiddenRef.current &&
              !reduce &&
              (animate(px, 46, { type: "spring", stiffness: 300, damping: 20 }),
              animate(py, 46, { type: "spring", stiffness: 300, damping: 20 }))
            }
            onPointerLeave={() =>
              !drag.current &&
              !hiddenRef.current &&
              !reduce &&
              (animate(px, REST[0], {
                type: "spring",
                stiffness: 300,
                damping: 24,
              }),
              animate(py, REST[1], {
                type: "spring",
                stiffness: 300,
                damping: 24,
              }))
            }
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 56,
              height: 56,
              x: hx,
              y: hy,
              borderRadius: 28,
              background: "transparent",
              border: 0,
              cursor: "grab",
              touchAction: "none",
              zIndex: 3,
            }}
          />
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {hidden ? "Balance hidden" : "Balance shown"}
      </div>
    </div>
  );
}
```

--- components/fold-balance/index.ts ---

```ts
export { default as FoldBalance } from "./fold-balance";
export type { FoldBalanceProps } from "./fold-balance";
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
