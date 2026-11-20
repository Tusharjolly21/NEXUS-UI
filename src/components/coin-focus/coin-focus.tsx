"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Holding = {
  id: string;
  name: string;
  symbol: string;
  units: number;
  value: number;
  change: number;
  icon: string;
  color: string;
  /** units locked in staking; the rest is available */
  staked?: number;
  earned?: number;
};
export type CoinFocusProps = {
  holdings?: Holding[];
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
  sol: "M228 128a12 12 0 0 1-12 12H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12M40 76h176a12 12 0 0 0 0-24H40a12 12 0 0 0 0 24m176 104H40a12 12 0 0 0 0 24h176a12 12 0 0 0 0-24",
  usd: "M204 168a52.06 52.06 0 0 1-52 52h-12v12a12 12 0 0 1-24 0v-12h-12a52.06 52.06 0 0 1-52-52a12 12 0 0 1 24 0a28 28 0 0 0 28 28h48a28 28 0 0 0 0-56h-40a52 52 0 0 1 0-104h4V24a12 12 0 0 1 24 0v12h4a52.06 52.06 0 0 1 52 52a12 12 0 0 1-24 0a28 28 0 0 0-28-28h-32a28 28 0 0 0 0 56h40a52.06 52.06 0 0 1 52 52",
  eth: "M240 128a15.85 15.85 0 0 1-4.67 11.28l-96.05 96.06a16 16 0 0 1-22.56 0l-96-96.06a16 16 0 0 1 0-22.56l96.05-96.06a16 16 0 0 1 22.56 0l96.05 96.06A15.85 15.85 0 0 1 240 128",
  bolt: "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  planet:
    "M245.11 60.68c-7.65-13.19-27.85-16.16-58.5-8.66a96 96 0 0 0-153.8 88.28C5.09 169 5.49 186 10.9 195.32C16 204.16 26.64 208 40.64 208a124 124 0 0 0 28.79-4a96 96 0 0 0 153.78-88.25c12.51-13 20.83-25.35 23.66-35.92c1.96-7.32 1.37-13.76-1.76-19.15m-13.69 15c-6.11 22.78-48.65 57.31-87.52 79.64c-67.81 39-113.62 41.52-119.16 32c-1.46-2.51-.65-7.24 2.22-13a80 80 0 0 1 10.28-15.05a95.5 95.5 0 0 0 6.23 14.18a4 4 0 0 0 4 2.12a122 122 0 0 0 16.95-3.32c21.23-5.55 46.63-16.48 71.52-30.78s47-30.66 62.45-46.15a123 123 0 0 0 11.31-12.87a4 4 0 0 0 .17-4.52a96 96 0 0 0-9.1-12.46c14.21-2.35 27.37-2.17 30.5 3.24c.92 1.57.97 3.92.15 6.98Z",
  back: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
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

const HOLDINGS: Holding[] = [
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    units: 80.06,
    value: 10400,
    change: 513,
    icon: I.sol,
    color: "#111113",
    staked: 30,
    earned: 5,
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    units: 6000,
    value: 6000,
    change: 0,
    icon: I.usd,
    color: "#2775ca",
    staked: 2500,
    earned: 41.2,
  },
  {
    id: "eth",
    name: "Ether",
    symbol: "ETH",
    units: 1.42,
    value: 4120,
    change: -38.4,
    icon: I.eth,
    color: "#5b6ee1",
    staked: 0.5,
    earned: 0.02,
  },
  {
    id: "jto",
    name: "Jito",
    symbol: "JTO",
    units: 575.04,
    value: 1100,
    change: 14,
    icon: I.bolt,
    color: "#1d1d1f",
  },
  {
    id: "jup",
    name: "Jupiter",
    symbol: "JUP",
    units: 1420.01,
    value: 994,
    change: 12,
    icon: I.planet,
    color: "#14a38b",
    staked: 600,
    earned: 18.5,
  },
];

const ROW = 64;
const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const units = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CoinMark = ({ h, size = 40 }: { h: Holding; size?: number }) => {
  const share = h.staked ? h.staked / h.units : 0;
  const r = size / 2 + 3;
  const c = 2 * Math.PI * r;
  return (
    <span style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: h.color,
          color: "#fff",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Ico d={h.icon} size={size * 0.48} />
      </span>
      {share > 0 && (
        <svg
          width={size + 10}
          height={size + 10}
          viewBox={`0 0 ${size + 10} ${size + 10}`}
          style={{
            position: "absolute",
            left: -5,
            top: -5,
            transform: "rotate(-90deg)",
          }}
          aria-hidden
        >
          <circle cx={size / 2 + 5} cy={size / 2 + 5} r={r} fill="none" stroke="#e6e6ea" strokeWidth={2} />
          <circle
            cx={size / 2 + 5}
            cy={size / 2 + 5}
            r={r}
            fill="none"
            stroke="#0071e3"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${c * (1 - share)} ${c}`}
          />
        </svg>
      )}
    </span>
  );
};

/**
 * A coin list where tapping a holding gives it the room. The other coins blur away, the one you picked slides to
 * the top, and its breakdown draws in underneath: a bar of what you can spend against what is staked, then the
 * staked amount and what it has earned. Tap it again, press Escape or use the close button to put the list back.
 */
export default function CoinFocus({
  holdings = HOLDINGS,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: CoinFocusProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [focus, setFocus] = useState<string | null>(null);
  const touched = useRef(false);
  const total = useMemo(() => holdings.reduce((a, h) => a + h.value, 0), [holdings]);
  const fIndex = holdings.findIndex((h) => h.id === focus);
  const fh = fIndex >= 0 ? holdings[fIndex] : null;

  const choose = (id: string | null) => {
    setFocus(id);
    if (id) sfx.whoosh(700, 1500, { dur: 0.2, gain: 0.025 });
    else sfx.tick({ freq: 1500, gain: 0.025 });
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && focus && choose(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      const ids = holdings.filter((h) => h.staked).map((h) => h.id);
      let i = 0;
      while (ok()) {
        await wait(1300);
        if (!ok()) break;
        choose(ids[i % ids.length] ?? holdings[0].id);
        await wait(2600);
        if (!ok()) break;
        choose(null);
        i++;
      }
    })().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  const avail = fh ? fh.units - (fh.staked ?? 0) : 0;
  const share = fh ? avail / fh.units : 0;

  return (
    <div
      className={`w-full ${className}`}
      style={{ maxWidth: 420, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
          padding: "20px 18px 14px",
          color: "#1d1d1f",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 50,
            padding: "0 4px",
          }}
        >
          <motion.div
            animate={{
              opacity: fh ? 0.25 : 1,
              filter: fh ? "blur(3px)" : "blur(0px)",
            }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div style={{ fontSize: 13, color: "#86868b" }}>Coins</div>
            <div
              className="tabular-nums"
              style={{
                fontSize: 24,
                fontWeight: 650,
                letterSpacing: "-0.03em",
              }}
            >
              {usd(total)}
            </div>
          </motion.div>
          <AnimatePresence>
            {fh && (
              <motion.button
                key="close"
                type="button"
                aria-label="Back to all coins"
                onClick={() => {
                  touched.current = true;
                  choose(null);
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: 0,
                  background: "#f2f2f4",
                  color: "#1d1d1f",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Ico d={I.back} size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div
          style={{
            position: "relative",
            height: holdings.length * ROW,
            marginTop: 10,
          }}
        >
          {holdings.map((h, i) => {
            const isF = h.id === focus;
            const away = !!focus && !isF;
            return (
              <motion.button
                key={h.id}
                type="button"
                aria-expanded={isF}
                aria-label={`${h.name}, ${usd(h.value)}`}
                tabIndex={away ? -1 : 0}
                onClick={() => {
                  touched.current = true;
                  choose(isF ? null : h.id);
                }}
                initial={false}
                animate={{
                  y: isF ? 0 : i * ROW,
                  opacity: away ? 0 : 1,
                  filter: away ? "blur(8px)" : "blur(0px)",
                  scale: away ? 0.96 : 1,
                }}
                transition={{
                  ...SPRING,
                  filter: { type: "tween", duration: 0.28 },
                  opacity: { duration: 0.25 },
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: ROW,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 4px",
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: 16,
                  textAlign: "left",
                  pointerEvents: away ? "none" : "auto",
                  fontFamily: font,
                  zIndex: isF ? 2 : 1,
                }}
              >
                <CoinMark h={h} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1d1d1f",
                    }}
                  >
                    {h.name}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "#86868b",
                      marginTop: 1,
                    }}
                  >
                    {units(h.units)} {h.symbol}
                  </span>
                </span>
                <span style={{ textAlign: "right" }}>
                  <span
                    className="tabular-nums"
                    style={{
                      display: "block",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#1d1d1f",
                    }}
                  >
                    {usd(h.value)}
                  </span>
                  {h.change !== 0 && (
                    <span
                      className="tabular-nums"
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: h.change > 0 ? "#1f9d55" : "#d70015",
                        marginTop: 1,
                      }}
                    >
                      {h.change > 0 ? "+" : "-"}
                      {usd(Math.abs(h.change))}
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}

          <AnimatePresence>
            {fh && (
              <motion.div
                key={fh.id}
                initial={{ opacity: 0, y: ROW + 14 }}
                animate={{ opacity: 1, y: ROW + 4 }}
                exit={{
                  opacity: 0,
                  y: ROW + 14,
                  transition: { duration: 0.15 },
                }}
                transition={{ ...SPRING, delay: 0.08 }}
                style={{ position: "absolute", left: 58, right: 4, top: 0 }}
                aria-live="polite"
              >
                {fh.staked ? (
                  <>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 4,
                        background: "#ececf0",
                        overflow: "hidden",
                        display: "flex",
                        gap: 3,
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${share * 100}%` }}
                        transition={{
                          duration: 0.7,
                          ease: [0.2, 0.7, 0.2, 1],
                          delay: 0.15,
                        }}
                        style={{
                          height: 4,
                          borderRadius: 4,
                          background: "#0071e3",
                        }}
                      />
                    </div>
                    {[
                      {
                        k: "Available",
                        v: `${units(avail)} ${fh.symbol}`,
                        dot: "#0071e3",
                      },
                      {
                        k: "Staked",
                        v: `${units(fh.staked)} ${fh.symbol}`,
                        dot: "#d1d1d6",
                      },
                    ].map((r, i) => (
                      <motion.div
                        key={r.k}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22 + i * 0.06 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          height: 36,
                          fontSize: 14,
                          marginTop: i === 0 ? 10 : 0,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 9,
                              background: r.dot,
                            }}
                          />
                          {r.k}
                        </span>
                        <span className="tabular-nums" style={{ fontWeight: 500 }}>
                          {r.v}
                        </span>
                      </motion.div>
                    ))}
                    <div
                      style={{
                        borderTop: "1px dashed #e3e3e8",
                        margin: "6px 0 2px 18px",
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.36 }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        height: 36,
                        alignItems: "center",
                        fontSize: 14,
                        paddingLeft: 18,
                      }}
                    >
                      <span style={{ color: "#6e6e73" }}>Earned from staking</span>
                      <span className="tabular-nums" style={{ fontWeight: 500, color: "#1f9d55" }}>
                        +{units(fh.earned ?? 0)} {fh.symbol}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="tabular-nums"
                      style={{
                        fontSize: 12,
                        color: "#86868b",
                        paddingLeft: 18,
                        marginTop: 6,
                      }}
                    >
                      {Math.round((fh.value / total) * 100)}% of your coins
                    </motion.div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: "#6e6e73", paddingTop: 10 }}>
                    All {units(fh.units)} {fh.symbol} is available. Nothing is staked.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
