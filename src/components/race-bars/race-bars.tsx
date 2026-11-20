"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { motion, motionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type RaceSeries = { id: string; name: string; values: number[] };
export type RaceBarsProps = {
  title?: string;
  /** the label of each step, e.g. years */
  steps?: (string | number)[];
  series?: RaceSeries[];
  currency?: string;
  /** seconds per step while playing */
  pace?: number;
  onStepChange?: (index: number) => void;
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

const DEFAULT_STEPS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const DEFAULT_SERIES: RaceSeries[] = [
  { id: "nw", name: "Northwind", values: [12, 18, 26, 21, 30, 41, 47, 52] },
  { id: "hc", name: "Halcyon", values: [22, 24, 29, 25, 27, 31, 33, 36] },
  { id: "mr", name: "Meridian", values: [8, 15, 19, 14, 24, 33, 44, 58] },
  { id: "ar", name: "Arbor", values: [18, 17, 21, 20, 22, 24, 23, 27] },
  { id: "lm", name: "Lumen", values: [4, 7, 12, 9, 15, 20, 26, 31] },
  { id: "cb", name: "Cobalt", values: [15, 14, 16, 11, 13, 14, 16, 18] },
  { id: "ks", name: "Kestrel", values: [6, 9, 10, 12, 14, 13, 17, 21] },
];

const ROW = 30;
const GAP = 8;

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
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26, mass: 0.6 }}
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

type Lane = {
  y: MotionValue<number>;
  w: MotionValue<number>;
  label: HTMLSpanElement | null;
};

function Bar({
  s,
  lane,
  lead,
  picked,
  dim,
  onPick,
}: {
  s: RaceSeries;
  lane: Lane;
  lead: boolean;
  picked: boolean;
  dim: boolean;
  onPick: () => void;
}) {
  const width = useTransform(lane.w, (v) => `${Math.max(1.5, v * 100)}%`);
  const fill = picked ? "#0071e3" : lead ? "#1d1d1f" : "#e3e4e8";
  const ink = picked || lead ? "#fff" : "#1d1d1f";
  return (
    <motion.button
      type="button"
      aria-pressed={picked}
      onClick={onPick}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        y: lane.y,
        height: ROW,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 0,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        borderRadius: 9,
        fontFamily: "inherit",
        opacity: dim ? 0.45 : 1,
        transition: "opacity 0.3s",
      }}
    >
      <motion.span
        style={{
          position: "relative",
          width,
          height: "100%",
          borderRadius: 9,
          background: fill,
          transition: "background-color 0.45s",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          flexShrink: 0,
          maxWidth: "calc(100% - 64px)",
        }}
      >
        <span
          style={{
            paddingLeft: 11,
            fontSize: 13,
            fontWeight: 500,
            color: ink,
            whiteSpace: "nowrap",
            transition: "color 0.45s",
          }}
        >
          {s.name}
        </span>
      </motion.span>
      <span
        ref={(el) => {
          lane.label = el;
        }}
        style={{
          fontSize: 13,
          color: "#6e6e73",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      />
    </motion.button>
  );
}

/**
 * Holdings, racing. Press play and the years run: each bar grows and shrinks with its value, and when one overtakes
 * another they trade places with a spring, the leader always in black. Drag along the timeline to scrub to any
 * moment between years, or use the arrow keys. Tap a bar to follow it in blue through the whole race.
 */
export default function RaceBars({
  title = "Holdings",
  steps = DEFAULT_STEPS,
  series = DEFAULT_SERIES,
  currency = "$",
  pace = 1.4,
  onStepChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: RaceBarsProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const last = steps.length - 1;
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(last);
  const [lead, setLead] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const touched = useRef(false);
  const t = useRef(last);
  const playingRef = useRef(false);
  playingRef.current = playing;
  const track = useRef<HTMLDivElement>(null);
  const progress = useMemo(() => motionValue(1), []);
  const progressW = useTransform(progress, (v) => `${v * 100}%`);
  const lanes = useMemo<Lane[]>(
    () => series.map(() => ({ y: motionValue(0), w: motionValue(0), label: null })),
    [series],
  );
  const rankY = useMemo(() => series.map(() => ({ to: 0, v: 0, vel: 0 })), [series]);

  // values at a fractional step, eased between years
  const at = (tt: number) => {
    const a = Math.floor(Math.min(last, Math.max(0, tt)));
    const b = Math.min(last, a + 1);
    const f = tt - a;
    const e = f * f * (3 - 2 * f);
    return series.map((s) => s.values[a] + (s.values[b] - s.values[a]) * e);
  };
  const maxAll = useMemo(() => Math.max(...series.flatMap((s) => s.values)), [series]);
  const stepRef = useRef(step);
  const leadRef = useRef(lead);

  // one loop: advance time when playing, place every bar, spring the ranks
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    let first = true;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (playingRef.current) {
        t.current = Math.min(last, t.current + dt / pace);
        if (t.current >= last) setPlaying(false);
      }
      const vals = at(t.current);
      const top = Math.max(...vals);
      const order = vals.map((v, i) => [v, i] as const).sort((p, q) => q[0] - p[0]);
      order.forEach(([, i], r) => (rankY[i].to = r * (ROW + GAP)));
      vals.forEach((v, i) => {
        const ry = rankY[i];
        if (first || reduce) {
          ry.v = ry.to;
          ry.vel = 0;
        } else {
          const k = 170;
          const c = 2 * Math.sqrt(k) * 0.82;
          ry.vel += (k * (ry.to - ry.v) - c * ry.vel) * dt;
          ry.v += ry.vel * dt;
        }
        lanes[i].y.set(ry.v);
        // scale against the leader, with a little headroom that tracks the race
        lanes[i].w.set(v / Math.max(top * 1.04, maxAll * 0.35));
        const el = lanes[i].label;
        if (el) el.textContent = `${currency}${v.toFixed(1)}k`;
      });
      first = false;
      progress.set(t.current / last);
      const st = Math.round(t.current);
      if (st !== stepRef.current) {
        stepRef.current = st;
        setStep(st);
        onStepChange?.(st);
        if (playingRef.current) sfx.tick({ freq: 1600 + st * 90, gain: 0.02 });
      }
      const ld = series[order[0][1]].id;
      if (ld !== leadRef.current) {
        if (leadRef.current && playingRef.current) sfx.note(880, { dur: 0.25, gain: 0.04 });
        leadRef.current = ld;
        setLead(ld);
      }
      setTotal((old) => {
        const sum = Math.round(vals.reduce((a, b) => a + b, 0));
        return old === sum ? old : sum;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, lanes, reduce, pace, last, currency]);

  const play = () => {
    touched.current = true;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (t.current >= last - 0.001) t.current = 0;
    setPlaying(true);
    sfx.tick({ freq: 2200, gain: 0.02 });
  };

  // the timeline
  const scrubbing = useRef(false);
  const seek = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    t.current = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * last;
  };
  const tDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    scrubbing.current = true;
    setPlaying(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    seek(e.clientX);
  };
  const tKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (d) t.current = Math.max(0, Math.min(last, Math.round(t.current) + d));
    else if (e.key === "Home") t.current = 0;
    else if (e.key === "End") t.current = last;
    else return;
    e.preventDefault();
    touched.current = true;
    setPlaying(false);
  };

  // autoplay: start from the first year and run, then rest on the last
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1200);
      while (alive && !touched.current) {
        t.current = 0;
        setPlaying(true);
        await wait(pace * last * 1000 + 3200);
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

  const sz = series.length * (ROW + GAP) - GAP;

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: "24px 24px 20px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "#86868b",
                marginTop: 2,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              Combined {currency}
              {total.toLocaleString("en-US")}k
            </div>
          </div>
          <Roll
            text={String(steps[step])}
            reduce={reduce}
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#1d1d1f",
            }}
          />
        </div>

        <div
          role="list"
          aria-label={`${title} in ${steps[step]}`}
          style={{ position: "relative", height: sz, marginTop: 20 }}
        >
          {series.map((s, i) => (
            <div role="listitem" key={s.id}>
              <Bar
                s={s}
                lane={lanes[i]}
                lead={lead === s.id}
                picked={picked === s.id}
                dim={!!picked && picked !== s.id && lead !== s.id}
                onPick={() => {
                  touched.current = true;
                  setPicked((p) => (p === s.id ? null : s.id));
                  sfx.tick({ freq: 2000, gain: 0.015 });
                }}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 22,
          }}
        >
          <button
            type="button"
            onClick={play}
            aria-label={playing ? "Pause" : "Play"}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            style={{
              display: "grid",
              placeItems: "center",
              width: 34,
              height: 34,
              borderRadius: 17,
              border: 0,
              background: "#1d1d1f",
              color: "#fff",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 256 256" aria-hidden="true">
              <path
                d={
                  playing
                    ? "M216 48v160a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16M96 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16"
                    : "M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128"
                }
                fill="currentColor"
              />
            </svg>
          </button>
          <div
            ref={track}
            role="slider"
            tabIndex={0}
            aria-label="Year"
            aria-valuemin={Number(steps[0]) || 0}
            aria-valuemax={Number(steps[last]) || last}
            aria-valuenow={Number(steps[step]) || step}
            aria-valuetext={String(steps[step])}
            onPointerDown={tDown}
            onPointerMove={(e) => scrubbing.current && seek(e.clientX)}
            onPointerUp={() => (scrubbing.current = false)}
            onPointerCancel={() => (scrubbing.current = false)}
            onKeyDown={tKey}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
            style={{
              position: "relative",
              flex: 1,
              height: 28,
              cursor: "pointer",
              touchAction: "none",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 13,
                height: 3,
                borderRadius: 2,
                background: "#e8e8ed",
              }}
            />
            <motion.div
              style={{
                position: "absolute",
                left: 0,
                top: 13,
                height: 3,
                borderRadius: 2,
                background: "#1d1d1f",
                width: progressW,
              }}
            />
            {steps.map((s, i) => (
              <span
                key={String(s)}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: `${(i / last) * 100}%`,
                  top: 12,
                  width: 5,
                  height: 5,
                  marginLeft: -2.5,
                  borderRadius: 3,
                  background: i <= step ? "#1d1d1f" : "#d2d2d7",
                }}
              />
            ))}
            <motion.span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 7,
                left: progressW,
                width: 15,
                height: 15,
                marginLeft: -7.5,
                borderRadius: 8,
                background: "#fff",
                boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.2)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: "#86868b",
              fontVariantNumeric: "tabular-nums",
              minWidth: 30,
              textAlign: "right",
            }}
          >
            {steps[last]}
          </span>
        </div>
      </div>
    </div>
  );
}
