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
