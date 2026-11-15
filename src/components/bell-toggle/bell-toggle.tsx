"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type BellToggleProps = {
  /** what you are asking to hear about */
  title?: string;
  detail?: string;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
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

/**
 * A notify-me toggle with a real brass bell in it. Press it and the bell is struck: it swings on its pivot and the
 * clapper inside swings after it, and every time the clapper meets the bell's lip it rings, a little quieter each time,
 * with rings of sound spreading out. The pill unfurls into the on state with the time you'll hear. Press again and
 * the bell is muted: a line is drawn through it and it gives one dull knock.
 */
export default function BellToggle({
  title = "Spring collection",
  detail = "Launches Friday 21 March at 10:00",
  defaultOn = false,
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: BellToggleProps) {
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
  const [on, setOn] = useState(defaultOn);
  const onRef = useRef(defaultOn);
  const bell = useRef<SVGGElement>(null);
  const clap = useRef<SVGGElement>(null);
  const [rings, setRings] = useState<number[]>([]);
  const sim = useRef({ a: 0, va: 0, c: 0, vc: 0, strikes: 0, running: false });
  const touched = useRef(false);
  const kick = useRef<() => void>(() => {});

  // the bell and its clapper are two pendulums; the clapper strikes when it swings past the lip
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastHit = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.03, (now - last) / 1000);
      last = now;
      const s = sim.current;
      for (let k = 0; k < 4; k++) {
        const h = dt / 4;
        s.va += (-90 * s.a - 3.2 * s.va) * h;
        s.a += s.va * h;
        s.vc += (-60 * Math.sin(s.c) - 0.8 * s.vc) * h;
        s.c += s.vc * h;
        const rel = s.c - s.a;
        const lip = 0.42;
        if (Math.abs(rel) > lip) {
          // the clapper hits the inside of the bell and bounces back
          const v = s.vc - s.va;
          s.c = s.a + Math.sign(rel) * lip;
          s.vc = s.va - v * 0.45;
          const hit = Math.abs(v);
          if (hit > 0.6 && now - lastHit > 60) {
            lastHit = now;
            if (onRef.current) {
              const g = Math.min(0.09, hit * 0.012);
              sfx.note(1318, { dur: 1.4, gain: g, bell: 0.9 });
              sfx.note(1975, { dur: 1.0, gain: g * 0.5, bell: 0.9 });
              sfx.note(659, { dur: 1.6, gain: g * 0.4 });
              setRings((r) => [...r.slice(-3), now]);
            } else sfx.tick({ freq: 380, gain: 0.05 });
          }
        }
      }
      if (bell.current) bell.current.setAttribute("transform", `rotate(${((s.a * 180) / Math.PI).toFixed(2)} 20 6)`);
      if (clap.current)
        clap.current.setAttribute("transform", `rotate(${(((s.c - s.a) * 180) / Math.PI).toFixed(2)} 20 10)`);
      const moving = Math.abs(s.a) + Math.abs(s.va) + Math.abs(s.c) + Math.abs(s.vc) > 0.002;
      if (moving) raf = requestAnimationFrame(frame);
      else {
        s.running = false;
        s.a = s.va = s.c = s.vc = 0;
      }
    };
    kick.current = () => {
      if (sim.current.running) return;
      sim.current.running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strike = (strength: number) => {
    if (reduce) return;
    const s = sim.current;
    s.va += strength;
    s.vc += strength * 0.2;
    kick.current();
  };

  const toggle = () => {
    const next = !onRef.current;
    onRef.current = next;
    setOn(next);
    onChange?.(next);
    if (next) {
      strike(9);
      if (reduce) sfx.note(1318, { dur: 1.2, gain: 0.07, bell: 0.9 });
    } else {
      strike(3);
      sfx.tick({ freq: 300, gain: 0.06 });
    }
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      toggle();
    }, 3200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f5f5f7] ${className}`}
      style={{
        padding: "48px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100%, 400px)",
          background: "#fff",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 50px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontSize: 13, color: "#6e6e73" }}>{detail}</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "#1d1d1f",
            margin: "2px 0 18px",
          }}
        >
          {title}
        </div>
        <motion.button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={on ? `Notifications on for ${title}. Press to turn off.` : `Notify me about ${title}`}
          onClick={() => {
            touched.current = true;
            toggle();
          }}
          layout
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            height: 52,
            padding: on ? "0 20px 0 8px" : "0 18px 0 8px",
            borderRadius: 26,
            border: 0,
            cursor: "pointer",
            background: on ? "linear-gradient(180deg,#2a2723,#171513)" : "#f2f2f5",
            color: on ? "#fff" : "#1d1d1f",
            boxShadow: on
              ? "0 14px 28px -14px rgba(120,80,20,0.7), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "inset 0 0 0 1px rgba(0,0,0,0.05)",
            transition: "background 0.35s, color 0.35s, box-shadow 0.35s",
          }}
        >
          <motion.span
            layout
            style={{
              position: "relative",
              width: 38,
              height: 38,
              borderRadius: 19,
              background: on ? "rgba(255,210,120,0.12)" : "#fff",
              display: "grid",
              placeItems: "center",
              boxShadow: on ? "none" : "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {/* rings of sound */}
            <AnimatePresence>
              {rings.map((r) => (
                <motion.span
                  key={r}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  onAnimationComplete={() => setRings((rs) => rs.filter((x) => x !== r))}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(255,196,90,0.8)",
                  }}
                />
              ))}
            </AnimatePresence>
            <svg
              width="26"
              height="30"
              viewBox="0 0 40 46"
              aria-hidden="true"
              style={{ display: "block", overflow: "visible" }}
            >
              <defs>
                <linearGradient id={`brass-${uid}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#7a5314" />
                  <stop offset="0.22" stopColor="#d9a63c" />
                  <stop offset="0.4" stopColor="#fff0b8" />
                  <stop offset="0.56" stopColor="#e2b04a" />
                  <stop offset="0.85" stopColor="#8f6219" />
                  <stop offset="1" stopColor="#5e3f0e" />
                </linearGradient>
                <linearGradient id={`lip-${uid}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6b480f" />
                  <stop offset="0.45" stopColor="#f4d27a" />
                  <stop offset="1" stopColor="#6b480f" />
                </linearGradient>
                <radialGradient id={`ball-${uid}`} cx="0.35" cy="0.35" r="0.7">
                  <stop offset="0" stopColor="#fff4c9" />
                  <stop offset="0.5" stopColor="#c48d2a" />
                  <stop offset="1" stopColor="#5e3f0e" />
                </radialGradient>
              </defs>
              <g ref={bell}>
                {/* the loop it hangs from */}
                <circle cx="20" cy="5" r="3.2" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="2.2" />
                {/* the clapper, seen under the lip */}
                <g ref={clap}>
                  <line x1="20" y1="10" x2="20" y2="37" stroke="#5e3f0e" strokeWidth="1.6" />
                  <circle cx="20" cy="39.5" r="3.6" fill={`url(#ball-${uid})`} />
                </g>
                <path
                  d="M20 8 C 12 8 10 14 10 22 C 10 29 8 32 4 36 L 36 36 C 32 32 30 29 30 22 C 30 14 28 8 20 8 Z"
                  fill={`url(#brass-${uid})`}
                />
                <path
                  d="M14 14 C 13 18 13 24 12.5 29"
                  stroke="#fff6d6"
                  strokeOpacity="0.55"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <rect x="3" y="34.5" width="34" height="3.6" rx="1.8" fill={`url(#lip-${uid})`} />
              </g>
              <motion.line
                x1="4"
                y1="4"
                x2="36"
                y2="42"
                stroke={on ? "#171513" : "#1d1d1f"}
                strokeWidth="3.4"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  filter: "drop-shadow(0 0 0 #fff) drop-shadow(1.2px 0 0 #fff)",
                }}
              />
            </svg>
          </motion.span>
          <span style={{ display: "grid", textAlign: "left", overflow: "hidden" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={on ? "on" : "off"}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {on ? "We'll ring you at 10:00" : "Notify me"}
              </motion.span>
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {on && (
                <motion.span
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,236,200,0.7)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Push and email, once
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
