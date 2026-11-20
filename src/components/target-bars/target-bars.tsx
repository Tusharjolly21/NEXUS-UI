"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type TargetSeries = {
  labels: string[];
  target: number[];
  sales: number[];
};
export type TargetBarsProps = {
  title?: string;
  data?: { day: TargetSeries; month: TargetSeries; year: TargetSeries };
  currency?: string;
  dark?: boolean;
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

const DEFAULT_DATA = {
  day: {
    labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Today"],
    target: [170, 185, 140, 150, 165, 175, 190],
    sales: [152, 171, 98, 141, 158, 149, 64.2],
  },
  month: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    target: [2600, 3500, 3000, 3200, 3300, 3400],
    sales: [2310, 3180, 2950, 2720, 2460, 1180],
  },
  year: {
    labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    target: [3400, 3000, 3100, 3300, 3500, 3400, 3600, 3700],
    sales: [3120, 2890, 2760, 3010, 3390, 3020, 3450, 1426.5],
  },
};
const RANGES = ["day", "month", "year"] as const;

const W = 320;
const BASE = 154;
const DX = 8;
const DY = -5;

// a box seen from the front-right: front, side and top, as polygon points
const prism = (x: number, w: number, h: number) => {
  const t = BASE - h;
  return {
    front: `${x},${t} ${x + w},${t} ${x + w},${BASE} ${x},${BASE}`,
    side: `${x + w},${t} ${x + w + DX},${t + DY} ${x + w + DX},${BASE + DY} ${x + w},${BASE}`,
    top: `${x},${t} ${x + DX},${t + DY} ${x + w + DX},${t + DY} ${x + w},${t}`,
    // the outline of the whole box, for one clean dashed line
    rim: `${x},${BASE} ${x},${t} ${x + DX},${t + DY} ${x + w + DX},${t + DY} ${x + w + DX},${BASE + DY} ${x + w},${BASE}`,
  };
};

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        const box = {
          display: "inline-block",
          height: "1.15em",
          lineHeight: 1.15,
          overflow: "hidden",
        } as const;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true" style={box}>
              {ch}
            </span>
          );
        return (
          <span key={`d${key}`} aria-hidden="true" style={{ ...box, position: "relative" }}>
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 210,
                      damping: 27,
                      mass: 0.6 + (key % 3) * 0.1,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.15em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

type BarProps = {
  i: number;
  x: number;
  w: number;
  th: number;
  sh: number;
  on: boolean;
  label: string;
  aria: string;
  reduce: boolean;
  uid: string;
  ink: string;
  mute: string;
  dash: string;
  dark: boolean;
  onPick: () => void;
};
// one period: its target as a dashed box and, when chosen, the solid fill of what sold, both heights on springs
function Bar({ i, x, w, th, sh, on, label, aria, reduce, uid, ink, mute, dash, dark, onPick }: BarProps) {
  const t = useMotionValue(reduce ? th : 0);
  const f = useMotionValue(0);
  useEffect(() => {
    const c = animate(
      t,
      th,
      reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, delay: i * 0.04 },
    );
    return () => c.stop();
  }, [th, reduce, i, t]);
  useEffect(() => {
    const c = animate(f, sh, reduce ? { duration: 0 } : { type: "spring", stiffness: 130, damping: 21 });
    return () => c.stop();
  }, [sh, reduce, f]);
  const tf = useTransform(t, (h) => prism(x, w, Math.max(0, h)).front);
  const ts = useTransform(t, (h) => prism(x, w, Math.max(0, h)).side);
  const tt = useTransform(t, (h) => prism(x, w, Math.max(0, h)).top);
  const tr = useTransform(t, (h) => prism(x, w, Math.max(0, h)).rim);
  const ff = useTransform(f, (h) => prism(x, w, Math.max(0, h)).front);
  const fs = useTransform(f, (h) => prism(x, w, Math.max(0, h)).side);
  const ft = useTransform(f, (h) => prism(x, w, Math.max(0, h)).top);
  const fo = useTransform(f, (h) => (h > 0.5 ? 1 : 0));
  return (
    <g
      data-bar={i}
      onPointerEnter={onPick}
      onFocus={onPick}
      tabIndex={0}
      role="button"
      aria-label={aria}
      aria-pressed={on}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <rect x={x - 5} y={0} width={w + 10} height={BASE + 26} fill="transparent" />
      <motion.polygon points={tf} fill={dark ? "rgba(255,255,255,0.025)" : "rgba(17,17,20,0.022)"} />
      <motion.polygon points={ts} fill={dark ? "rgba(255,255,255,0.045)" : "rgba(17,17,20,0.045)"} />
      <motion.polygon points={tt} fill={dark ? "rgba(255,255,255,0.06)" : "rgba(17,17,20,0.06)"} />
      <motion.polyline
        points={tr}
        fill="none"
        stroke={dash}
        strokeWidth="1"
        strokeDasharray="2.5 3"
        strokeLinejoin="round"
      />
      <motion.polygon points={fs} fill="#1d4fd8" style={{ opacity: fo }} />
      <motion.polygon points={ff} fill={`url(#${uid}-f)`} style={{ opacity: fo }} />
      <motion.polygon points={ft} fill="#8db6ff" style={{ opacity: fo }} />
      <text
        x={x + w / 2 + DX / 2}
        y={BASE + 20}
        textAnchor="middle"
        fontSize="10"
        fill={on ? ink : mute}
        fontWeight={on ? 600 : 400}
        style={{ transition: "fill 0.25s" }}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * A sales chart of glass-box bars. Each period is a dashed box as tall as its target; point at one and it fills with
 * solid blue up to what was actually sold, rising on a spring, while the total rolls over and the share of the target
 * reached shows beside it. Switch between days, months and years and the boxes regrow one after another.
 */
export default function TargetBars({
  title = "Average sales",
  data = DEFAULT_DATA,
  currency = "$",
  dark = false,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: TargetBarsProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const [range, setRange] = useState<(typeof RANGES)[number]>("month");
  const s = data[range];
  const [sel, setSel] = useState(s.labels.length - 1);
  const selRef = useRef(sel);
  selRef.current = sel;
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  const pick = (i: number) => {
    if (i === selRef.current) return;
    setSel(i);
    sfx.tick({ freq: 1500 + i * 120, gain: 0.03 });
  };
  const pickRange = (r: (typeof RANGES)[number]) => {
    setRange(r);
    setSel(data[r].labels.length - 1);
    sfx.tick({ freq: 2200, gain: 0.03 });
    sfx.whoosh(400, 1400, { dur: 0.35, gain: 0.02 });
  };

  const n = s.labels.length;
  const gap = n > 6 ? 12 : 16;
  const bw = Math.min(28, (W - DX - gap * (n - 1)) / n);
  const span = n * bw + (n - 1) * gap + DX;
  const x0 = (W - span) / 2;
  const top = Math.max(...s.target, ...s.sales) * 1.02;
  const hOf = (v: number) => (v / top) * (BASE - 18);
  const fmtMoney = (v: number) =>
    `${currency}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtShort = (v: number) => `${currency}${Math.round(v).toLocaleString("en-US")}`;
  const pct = Math.round((s.sales[sel] / s.target[sel]) * 100);

  const ink = dark ? "#f5f5f7" : "#111114";
  const mute = dark ? "rgba(235,235,245,0.45)" : "#8e8e93";
  const dash = dark ? "rgba(235,235,245,0.32)" : "rgba(17,17,20,0.28)";

  // autoplay
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 520) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height * 0.6, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        for (const i of [1, 3, 4]) {
          if (!ok()) return;
          await go(`[data-bar="${i}"]`, 420);
          pick(i);
          await wait(900);
        }
        for (const r of ["year", "day", "month"] as const) {
          if (!ok()) return;
          await go(`[data-range="${r}"]`);
          await tap();
          pickRange(r);
          await wait(1700);
        }
        setGhost(false);
        await wait(1200);
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
  }, [autoplay, reduce]);

  const bars = useMemo(() => s.labels.map((_, i) => x0 + i * (bw + gap)), [s, x0, bw, gap]);

  return (
    <div
      className={`relative w-full max-w-[380px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: ink,
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 24,
          background: dark ? "#0f0f11" : "#fff",
          boxShadow: dark
            ? "inset 0 0 0 1px rgba(255,255,255,0.07), 0 30px 60px -30px rgba(0,0,0,0.6)"
            : "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.3)",
          padding: "20px 20px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{title}</div>
          <div
            role="tablist"
            aria-label="Range"
            style={{
              display: "flex",
              padding: 2,
              borderRadius: 999,
              background: dark ? "rgba(255,255,255,0.08)" : "#f2f2f4",
            }}
          >
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                data-range={r}
                aria-selected={range === r}
                onClick={() => {
                  touched.current = true;
                  pickRange(r);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                style={{
                  position: "relative",
                  height: 22,
                  padding: "0 9px",
                  borderRadius: 999,
                  border: 0,
                  background: "transparent",
                  color: range === r ? ink : mute,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {range === r && (
                  <motion.span
                    layoutId={`${uid}-seg`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background: dark ? "rgba(255,255,255,0.14)" : "#fff",
                      boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
                <span style={{ position: "relative" }}>{r[0].toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>
        <div aria-live="polite" style={{ marginTop: 10 }}>
          <Roll
            text={fmtMoney(s.sales[sel])}
            reduce={reduce}
            style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.03em" }}
          />
          <div style={{ fontSize: 12, color: mute, marginTop: 2 }}>
            {s.labels[sel] === "Today" ? "Today so far" : s.labels[sel]}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${BASE + 26}`}
          width="100%"
          style={{ display: "block", marginTop: 16, overflow: "visible" }}
          role="group"
          aria-label={`${title} by ${range}`}
        >
          <defs>
            <linearGradient id={`${uid}-f`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4f8dff" />
              <stop offset="1" stopColor="#2463eb" />
            </linearGradient>
          </defs>
          <line x1={x0 - 4} x2={x0 + span + 4} y1={BASE + 0.5} y2={BASE + 0.5} stroke={dash} strokeOpacity="0.5" />
          {bars.map((x, i) => (
            <Bar
              key={`${range}-${i}`}
              i={i}
              x={x}
              w={bw}
              th={hOf(s.target[i])}
              sh={i === sel ? hOf(s.sales[i]) : 0}
              on={i === sel}
              label={s.labels[i]}
              aria={`${s.labels[i]}: ${fmtShort(s.sales[i])} of ${fmtShort(s.target[i])} target`}
              reduce={reduce}
              uid={uid}
              ink={ink}
              mute={mute}
              dash={dash}
              dark={dark}
              onPick={() => {
                touched.current = true;
                pick(i);
              }}
            />
          ))}
        </svg>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
            fontSize: 12,
            color: mute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                border: `1px dashed ${dash}`,
              }}
            />
            Target <span style={{ color: ink, fontWeight: 500 }}>{fmtShort(s.target[sel])}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: "#2f6bff",
              }}
            />
            Sales <span style={{ color: ink, fontWeight: 500 }}>{fmtShort(s.sales[sel])}</span>
          </span>
          <span
            style={{
              marginLeft: "auto",
              padding: "3px 8px",
              borderRadius: 999,
              background: dark ? "rgba(255,255,255,0.08)" : "#f2f2f4",
              color: pct >= 90 ? "#16a34a" : ink,
              fontWeight: 600,
            }}
          >
            <Roll text={`${pct}%`} reduce={reduce} />
          </span>
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: dark ? "rgba(255,255,255,0.2)" : "rgba(17,17,20,0.16)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
