"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type BalanceDay = {
  label: string;
  balance: number;
  in: number;
  out: number;
};
export type BalanceMatrixProps = {
  days?: BalanceDay[];
  currency?: string;
  change?: number;
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

const I = {
  up: "M244 56v64a12 12 0 0 1-24 0V85l-75.51 75.52a12 12 0 0 1-17 0L96 129l-63.51 63.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0L136 135l67-67h-35a12 12 0 0 1 0-24h64a12 12 0 0 1 12 12",
  wallet:
    "M216 64H56a8 8 0 0 1 0-16h136a8 8 0 0 0 0-16H56a24 24 0 0 0-24 24v128a24 24 0 0 0 24 24h160a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m0 128H56a8 8 0 0 1-8-8V78.63A23.8 23.8 0 0 0 56 80h160Zm-48-60a12 12 0 1 1 12 12a12 12 0 0 1-12-12",
  vault:
    "M216 40H40a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h16v16a8 8 0 0 0 16 0v-16h112v16a8 8 0 0 0 16 0v-16h16a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 152H40V56h176v64h-16.68a48 48 0 1 0 0 16H216zm-50.16-72a16 16 0 1 0 0 16H183a32 32 0 1 1 0-16Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

// thirty days of a balance drifting up, with money in and out each day
const makeDays = (): BalanceDay[] => {
  let b = 58200;
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 30 }, (_, i) => {
    const inn = r() < 0.18 ? 2400 + r() * 5200 : r() * 380;
    const out = 120 + r() * 900 + (i % 7 === 4 ? 1400 : 0);
    b += inn - out;
    return {
      label: `Nov ${i + 1}`,
      balance: Math.round(b * 100) / 100,
      in: Math.round(inn * 100) / 100,
      out: Math.round(out * 100) / 100,
    };
  });
};
const DEFAULT_DAYS = makeDays();
const ROWS = 12;

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span
              key={`s${key}${ch}`}
              aria-hidden="true"
              style={{
                display: "inline-block",
                height: "1.1em",
                lineHeight: 1.1,
              }}
            >
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.1em",
              overflow: "hidden",
              lineHeight: 1.1,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 200,
                      damping: 26,
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
 * A balance drawn as a field of dots: every column is a day and lights up as high as the balance stood, its top dot
 * glowing. Scrub across it and a ripple of light runs out from your finger while the total rolls to that day. Point
 * at money in or money out and the field shows that instead, the columns refilling from the bottom.
 */
export default function BalanceMatrix({
  days = DEFAULT_DAYS,
  currency = "$",
  change = 4.66,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: BalanceMatrixProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [col, setCol] = useState<number | null>(null);
  const [mode, setMode] = useState<"balance" | "in" | "out">("balance");
  const [pulse, setPulse] = useState<{ c: number; k: number } | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  const n = days.length;
  const vals = days.map((d) => (mode === "balance" ? d.balance : mode === "in" ? d.in : d.out));
  const lo = mode === "balance" ? Math.min(...vals) * 0.985 : 0;
  const hi = Math.max(...vals);
  const level = vals.map((v) => Math.max(1, Math.round(((v - lo) / (hi - lo || 1)) * ROWS)));
  const tint = mode === "out" ? "#ff8a7a" : mode === "in" ? "#7ce3c3" : "#ffffff";
  const sumIn = days.reduce((a, d) => a + d.in, 0);
  const sumOut = days.reduce((a, d) => a + d.out, 0);
  const shownV = col === null ? (mode === "balance" ? days[n - 1].balance : mode === "in" ? sumIn : sumOut) : vals[col];
  const [whole, cents] = shownV.toFixed(2).split(".");

  const scrub = (c: number | null) => {
    if (c === last.current) return;
    last.current = c;
    setCol(c);
    if (c !== null) {
      setPulse({ c, k: Date.now() });
      sfx.tick({ freq: 1400 + level[c] * 90, gain: 0.018 });
    }
  };
  const pickMode = (m: typeof mode) => {
    setMode((cur) => {
      if (cur !== m) sfx.whoosh(500, 1500, { dur: 0.3, gain: 0.02 });
      return m;
    });
  };

  // autoplay: scrub across, then look at money in and out
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const rect = (sel: string) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return null;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return {
        x: r.left - cb.left,
        y: r.top - cb.top,
        w: r.width,
        h: r.height,
      };
    };
    const go = async (x: number, y: number, ms = 550) => {
      setGhost(true);
      await Promise.all([
        animate(gx, x, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
        animate(gy, y, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
      ]);
    };
    const run = async () => {
      await wait(1300);
      while (ok()) {
        const m = rect("[data-matrix]");
        if (!m) return;
        await go(m.x + 8, m.y + m.h * 0.5);
        await animate(0, 1, {
          duration: 2.4,
          ease: "easeInOut",
          onUpdate: (u) => {
            gx.set(m.x + 8 + (m.w - 16) * u);
            scrub(Math.min(n - 1, Math.floor(u * n)));
          },
        });
        scrub(null);
        if (!ok()) return;
        for (const k of ["in", "out"] as const) {
          const t = rect(`[data-tile="${k}"]`);
          if (t) await go(t.x + t.w / 2, t.y + t.h / 2);
          pickMode(k);
          await wait(1600);
        }
        pickMode("balance");
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

  const ripple = useMemo(() => pulse, [pulse]);

  return (
    <div
      className={`relative w-full max-w-[400px] select-none ${className}`}
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
          borderRadius: 34,
          overflow: "hidden",
          background: "#04050a",
          padding: 14,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -40,
            background:
              "radial-gradient(45% 35% at 50% 100%, rgba(255,60,90,0.55), transparent 70%), radial-gradient(40% 40% at 0% 60%, rgba(40,140,220,0.45), transparent 70%), radial-gradient(40% 40% at 100% 40%, rgba(90,70,255,0.4), transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        {/* the total */}
        <div
          style={{
            position: "relative",
            borderRadius: 26,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px) saturate(1.3)",
            WebkitBackdropFilter: "blur(20px) saturate(1.3)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
            padding: "16px 16px 14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                height: 22,
                padding: "0 8px",
                borderRadius: 11,
                background: "rgba(255,255,255,0.08)",
                fontSize: 11,
                color: "#7ce3c3",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Ico d={I.up} size={11} />
              {change.toFixed(2)}%
            </span>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 12.5,
              color: "rgba(235,235,245,0.6)",
              marginTop: 8,
            }}
          >
            {col !== null
              ? days[col].label
              : mode === "balance"
                ? "Total balance"
                : mode === "in"
                  ? "Money in this month"
                  : "Money out this month"}
          </div>
          <div
            aria-live="polite"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: "rgba(235,235,245,0.55)",
                marginRight: 4,
                marginBottom: 8,
              }}
            >
              {currency}
            </span>
            <Roll
              text={Number(whole).toLocaleString("en-US")}
              reduce={reduce}
              style={{
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            />
            <Roll
              text={`.${cents}`}
              reduce={reduce}
              style={{
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "rgba(235,235,245,0.35)",
              }}
            />
          </div>

          {/* the field of dots */}
          <div
            data-matrix
            role="img"
            aria-label={`${mode === "balance" ? "Balance" : mode === "in" ? "Money in" : "Money out"} over ${n} days`}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              scrub(Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n))));
            }}
            onPointerLeave={() => scrub(null)}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${n}, 1fr)`,
              gap: 0,
              marginTop: 14,
              height: ROWS * 7 + 4,
              cursor: "crosshair",
              touchAction: "pan-y",
            }}
          >
            {days.map((_, c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {Array.from({ length: ROWS }, (_, r) => {
                  const on = r < level[c];
                  const top = r === level[c] - 1;
                  const hot = col === c;
                  const dist = ripple ? Math.abs(ripple.c - c) : 99;
                  return (
                    <motion.span
                      key={r}
                      initial={false}
                      animate={{
                        opacity: on ? (hot ? 1 : col !== null ? 0.5 : top ? 1 : 0.62) : 0.08,
                        scale: on && hot ? 1.25 : 1,
                        backgroundColor: on ? tint : "#ffffff",
                      }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              opacity: {
                                duration: 0.25,
                                delay: mode === "balance" ? 0 : r * 0.015 + (dist < 99 ? 0 : 0),
                              },
                              scale: {
                                type: "spring",
                                stiffness: 500,
                                damping: 22,
                                delay: dist * 0.012,
                              },
                              backgroundColor: {
                                duration: 0.4,
                                delay: r * 0.02,
                              },
                            }
                      }
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        boxShadow: on && top ? `0 0 6px ${tint}` : "none",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* money in and out */}
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 10,
          }}
        >
          {(
            [
              ["in", "Money in", sumIn, I.wallet, "#7ce3c3"],
              ["out", "Money out", sumOut, I.vault, "#ff8a7a"],
            ] as const
          ).map(([k, label, v, icon, c]) => (
            <motion.button
              key={k}
              type="button"
              data-tile={k}
              aria-pressed={mode === k}
              onPointerEnter={() => pickMode(k)}
              onPointerLeave={() => pickMode("balance")}
              onFocus={() => pickMode(k)}
              onBlur={() => pickMode("balance")}
              onClick={() => {
                touched.current = true;
                pickMode(mode === k ? "balance" : k);
              }}
              animate={{ y: mode === k ? -3 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{
                textAlign: "left",
                height: 96,
                padding: 14,
                borderRadius: 22,
                border: 0,
                color: "inherit",
                cursor: "pointer",
                background: mode === k ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: `inset 0 0 0 1px ${mode === k ? c + "66" : "rgba(255,255,255,0.1)"}`,
                transition: "background 0.3s, box-shadow 0.3s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11.5,
                  color: "rgba(235,235,245,0.6)",
                }}
              >
                <span style={{ color: c }}>
                  <Ico d={icon} size={13} />
                </span>
                {label}
              </span>
              <span
                style={{
                  marginTop: "auto",
                  fontSize: 19,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(235,235,245,0.5)",
                    marginRight: 3,
                  }}
                >
                  {currency}
                </span>
                {Math.floor(v).toLocaleString("en-US")}
                <span style={{ color: "rgba(235,235,245,0.35)" }}>.{v.toFixed(2).split(".")[1]}</span>
              </span>
            </motion.button>
          ))}
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
