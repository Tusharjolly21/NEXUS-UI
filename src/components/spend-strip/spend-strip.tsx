"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SpendCategory = { id: string; name: string; color: string };
export type SpendItem = { day: number; cat: string; amount: number };
export type SpendStripProps = {
  month?: string;
  /** days in the month */
  days?: number;
  budget?: number;
  categories?: SpendCategory[];
  items?: SpendItem[];
  currency?: string;
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

const DEFAULT_CATS: SpendCategory[] = [
  { id: "transport", name: "Transport", color: "#8e8cff" },
  { id: "shopping", name: "Shopping", color: "#ff7ab6" },
  { id: "food", name: "Food", color: "#5fd4a8" },
  { id: "bills", name: "Bills", color: "#ffb15e" },
];
// a month of spending, made up but steady: a few things most days
const makeItems = () => {
  const out: SpendItem[] = [];
  let seed = 7;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let d = 1; d <= 30; d++) {
    const n = 1 + Math.floor(r() * 2.2);
    for (let k = 0; k < n; k++) {
      const p = r();
      const cat = p < 0.36 ? "transport" : p < 0.6 ? "shopping" : p < 0.9 ? "food" : "bills";
      const base = cat === "bills" ? 260 : cat === "shopping" ? 150 : cat === "transport" ? 95 : 40;
      out.push({
        day: d,
        cat,
        amount: Math.round(base * (0.35 + r() * 1.2) * 100) / 100,
      });
    }
  }
  return out;
};
const DEFAULT_ITEMS = makeItems();

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  const box = {
    display: "inline-block",
    height: "1.1em",
    lineHeight: 1.1,
    overflow: "hidden",
  } as const;
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
                      stiffness: 200,
                      damping: 27,
                      mass: 0.6 + (key % 3) * 0.1,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.1em" }}>
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

/**
 * A quiet month of spending. One soft bar per day, grey until you choose a category: then each day's share of it
 * rises in that category's colour from the bottom of the bar while the total rolls to what went on it and the budget
 * line eases to match. Point at a day to read what it cost.
 */
export default function SpendStrip({
  month = "November",
  days = 30,
  budget = 10000,
  categories = DEFAULT_CATS,
  items = DEFAULT_ITEMS,
  currency = "$",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SpendStripProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [cat, setCat] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    categories.forEach((c) => (t[c.id] = 0));
    items.forEach((i) => (t[i.cat] = (t[i.cat] ?? 0) + i.amount));
    return t;
  }, [items, categories]);
  const perDay = useMemo(() => {
    const d = Array.from({ length: days }, () => ({ all: 0 }) as Record<string, number>);
    items.forEach((i) => {
      const row = d[i.day - 1];
      if (!row) return;
      row.all += i.amount;
      row[i.cat] = (row[i.cat] ?? 0) + i.amount;
    });
    return d;
  }, [items, days]);
  const all = Object.values(totals).reduce((a, b) => a + b, 0);
  const top = Math.max(...perDay.map((d) => d.all), 1);
  const shown = cat ? totals[cat] : all;
  const color = cat ? (categories.find((c) => c.id === cat)?.color ?? "#fff") : "#f5f5f7";
  const [whole, cents] = shown.toFixed(2).split(".");

  const choose = (id: string | null) => {
    setCat((c) => {
      if (c !== id && id)
        sfx.tick({
          freq: 1500 + categories.findIndex((x) => x.id === id) * 220,
          gain: 0.025,
        });
      return id;
    });
  };

  // autoplay: walk the categories, then a few days
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
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
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        for (const c of categories) {
          if (!ok()) return;
          await go(`[data-cat="${c.id}"]`);
          choose(c.id);
          await wait(1400);
        }
        choose(null);
        for (const d of [6, 15, 24]) {
          if (!ok()) return;
          await go(`[data-day="${d}"]`, 450);
          setDay(d);
          await wait(1000);
        }
        setDay(null);
        setGhost(false);
        await wait(1500);
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

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 150, damping: 22 };
  const used = Math.min(1, shown / budget);

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#f5f5f7",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 26,
          background: "#111113",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.6)",
          padding: "22px 22px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            fontSize: 13,
            color: "rgba(235,235,245,0.5)",
          }}
        >
          <div
            style={{
              position: "relative",
              height: 18,
              overflow: "hidden",
              flex: 1,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={cat ?? "all"}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                {cat ? categories.find((c) => c.id === cat)?.name : "Spent"} in {month}
              </motion.div>
            </AnimatePresence>
          </div>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            of {currency}
            {budget.toLocaleString("en-US")}
          </span>
        </div>
        <div aria-live="polite" style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
          <span
            style={{
              fontSize: 18,
              color: "rgba(235,235,245,0.45)",
              marginRight: 3,
              marginBottom: 5,
            }}
          >
            {currency}
          </span>
          <Roll
            text={Number(whole).toLocaleString("en-US")}
            reduce={reduce}
            style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.035em" }}
          />
          <Roll
            text={`.${cents}`}
            reduce={reduce}
            style={{
              fontSize: 38,
              fontWeight: 500,
              letterSpacing: "-0.035em",
              color: "rgba(235,235,245,0.3)",
            }}
          />
        </div>
        {/* how much of the budget it is */}
        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.07)",
            marginTop: 14,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${used * 100}%`, backgroundColor: color }}
            transition={{ width: spring, backgroundColor: { duration: 0.4 } }}
            style={{ height: "100%", borderRadius: 2 }}
          />
        </div>

        {/* one bar per day */}
        <div
          role="group"
          aria-label={`Spending each day in ${month}`}
          onPointerLeave={() => setDay(null)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: 86,
            marginTop: 26,
          }}
        >
          {perDay.map((d, i) => {
            const h = (d.all / top) * 100;
            const part = cat ? ((d[cat] ?? 0) / (d.all || 1)) * 100 : 0;
            const hot = day === i;
            return (
              <div
                key={i}
                data-day={i}
                onPointerEnter={() => setDay(i)}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  cursor: "default",
                }}
              >
                <motion.div
                  initial={reduce ? false : { height: "4%" }}
                  animate={{ height: `${Math.max(4, h)}%` }}
                  transition={{ ...spring, delay: reduce ? 0 : i * 0.012 }}
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    background: hot
                      ? "rgba(255,255,255,0.42)"
                      : cat
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.2)",
                    transition: "background 0.3s",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{ height: `${part}%` }}
                    transition={{
                      ...spring,
                      delay: reduce ? 0 : (i % 30) * 0.008,
                    }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: color,
                      borderRadius: 3,
                    }}
                  />
                </motion.div>
              </div>
            );
          })}
          <AnimatePresence>
            {day !== null && (
              <motion.div
                key="tip"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  left: `${((day + 0.5) / days) * 100}%`,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                style={{
                  position: "absolute",
                  bottom: "100%",
                  marginBottom: 6,
                  x: day > days * 0.78 ? "-88%" : day < days * 0.18 ? "-12%" : "-50%",
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: "#f5f5f7",
                  color: "#111",
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {month.slice(0, 3)} {day + 1}, {currency}
                {(cat ? (perDay[day][cat] ?? 0) : perDay[day].all).toFixed(2)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10.5,
            color: "rgba(235,235,245,0.3)",
            marginTop: 8,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{month.slice(0, 3)} 1</span>
          <span>
            {month.slice(0, 3)} {days}
          </span>
        </div>

        {/* the categories */}
        <div
          role="group"
          aria-label="Categories"
          onPointerLeave={() => choose(null)}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: 4,
            marginTop: 18,
          }}
        >
          {categories.map((c) => {
            const on = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                data-cat={c.id}
                aria-pressed={on}
                onPointerEnter={() => choose(c.id)}
                onFocus={() => choose(c.id)}
                onClick={() => {
                  touched.current = true;
                  choose(on ? null : c.id);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: 0,
                  background: on ? "rgba(255,255,255,0.06)" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  transition: "background 0.25s",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: on || !cat ? "rgba(235,235,245,0.75)" : "rgba(235,235,245,0.35)",
                    transition: "color 0.25s",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: c.color,
                    }}
                  />
                  {c.name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 13.5,
                    fontWeight: 500,
                    marginTop: 3,
                    color: on || !cat ? "#f5f5f7" : "rgba(235,235,245,0.35)",
                    fontVariantNumeric: "tabular-nums",
                    transition: "color 0.25s",
                  }}
                >
                  {Math.round((totals[c.id] / all) * 100)}%
                </span>
              </button>
            );
          })}
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.75), 0 6px 14px -4px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
