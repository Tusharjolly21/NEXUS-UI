"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type MetalCardProps = {
  /** sixteen digits; spaces are added */
  number?: string;
  holder?: string;
  expires?: string;
  cvv?: string;
  /** the issuer's name, engraved top left */
  issuer?: string;
  /** the metal: brushed titanium, black steel or rose gold */
  finish?: "titanium" | "black" | "rose";
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
  tap: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88M97.07 100.26a59.33 59.33 0 0 1 0 55.48a8 8 0 1 1-14.14-7.48a42.79 42.79 0 0 0 0-40.52a8 8 0 0 1 14.14-7.48m56-32a126.67 126.67 0 0 1 0 119.54a8 8 0 0 1-14.07-7.57a110.62 110.62 0 0 0 0-104.46a8 8 0 0 1 14.12-7.54Zm-28 16a93 93 0 0 1 0 87.52a8 8 0 1 1-14.12-7.52a77 77 0 0 0 0-72.48a8 8 0 1 1 14.12-7.52",
};

type Finish = {
  base: string;
  line: string;
  ink: string;
  hi: string;
  lo: string;
  edge: string;
  stage: string;
};
const FINISHES: Record<string, Finish> = {
  titanium: {
    base: "linear-gradient(115deg,#7d8288 0%,#b9bdc2 22%,#9ea3a9 41%,#c8cbcf 58%,#8a8f95 78%,#a9adb2 100%)",
    line: "rgba(255,255,255,0.10)",
    ink: "#6c7177",
    hi: "rgba(255,255,255,0.62)",
    lo: "rgba(20,22,26,0.55)",
    edge: "#5d6268",
    stage: "radial-gradient(120% 90% at 50% 18%,#2b2e33 0%,#17181b 55%,#0d0e10 100%)",
  },
  black: {
    base: "linear-gradient(115deg,#1d1f22 0%,#3a3d42 24%,#26282c 44%,#45484d 60%,#202225 80%,#303236 100%)",
    line: "rgba(255,255,255,0.06)",
    ink: "#55585e",
    hi: "rgba(255,255,255,0.28)",
    lo: "rgba(0,0,0,0.75)",
    edge: "#111214",
    stage: "radial-gradient(120% 90% at 50% 18%,#3a3d44 0%,#22242a 55%,#141519 100%)",
  },
  rose: {
    base: "linear-gradient(115deg,#a8796a 0%,#e2bcab 22%,#c6998a 41%,#efcdbd 58%,#b0847a 78%,#d4ad9e 100%)",
    line: "rgba(255,255,255,0.12)",
    ink: "#946a5d",
    hi: "rgba(255,244,238,0.7)",
    lo: "rgba(70,34,24,0.5)",
    edge: "#7f5a50",
    stage: "radial-gradient(120% 90% at 50% 18%,#2e2826 0%,#1a1615 55%,#0f0c0c 100%)",
  },
};

// fine streaks of brushed metal: noise stretched along the grain
const BRUSH =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.95' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.6 -0.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const W = 340;
const H = 214;

function Chip() {
  return (
    <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id="mc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e2a6" />
          <stop offset="0.35" stopColor="#c9a24f" />
          <stop offset="0.55" stopColor="#f1d68b" />
          <stop offset="1" stopColor="#a47e33" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="45" height="35" rx="6.5" fill="url(#mc-gold)" stroke="rgba(90,62,16,0.55)" />
      <g fill="none" stroke="rgba(92,64,18,0.55)" strokeWidth="0.9">
        <path d="M0.5 12.5H14q3 0 3 3v5q0 3-3 3H0.5" />
        <path d="M45.5 12.5H32q-3 0-3 3v5q0 3 3 3h13.5" />
        <path d="M17 18H29" />
        <path d="M23 0.5V9q0 3.5-3 3.5M23 35.5V27q0-3.5 3-3.5" />
      </g>
      <rect x="1" y="1" width="44" height="12" rx="6" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

function Hologram({ hx, hy }: { hx: MotionValue<number>; hy: MotionValue<number> }) {
  const bg = useMotionTemplate`conic-gradient(from ${hx}deg at ${hy}% 50%, #ff6ad5, #ffd36a, #7dffb2, #6ad7ff, #a77bff, #ff6ad5)`;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        width: 40,
        height: 26,
        borderRadius: 5,
        background: bg,
        opacity: 0.85,
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.6), 0 0.5px 0 rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(60deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 3px)",
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(255,255,255,0.4))",
        }}
      />
    </motion.div>
  );
}

/**
 * A metal card you can hold. Move the pointer over it and it tilts in 3D: the brushed grain catches a band of light
 * that slides across as the angle changes, the engraved number throws tiny highlights and shadows, the hologram shifts
 * through the spectrum and its shadow moves on the floor. Click, tap or press Enter to turn it over: the back has the
 * magnetic stripe, signature panel and security code. Autoplay rocks it gently and turns it once, until touched.
 */
export default function MetalCard({
  number = "4417228003917764",
  holder = "Ava Morgan",
  expires = "09/29",
  cvv = "318",
  issuer = "Meridian",
  finish = "titanium",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: MetalCardProps) {
  const reduce = useReducedMotion() ?? false;
  const f = FINISHES[finish] ?? FINISHES.titanium;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const touched = useRef(false);
  const [back, setBack] = useState(false);
  const backRef = useRef(false);
  backRef.current = back;

  // pointer, -1 to 1 across the card
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.6 });
  const flip = useMotionValue(0);
  const lift = useSpring(0, { stiffness: 200, damping: 22 });

  const rx = useTransform(sy, (v) => (reduce ? 0 : -v * 14));
  const ry = useTransform([sx, flip] as MotionValue<number>[], ([x, fl]: number[]) => (reduce ? 0 : x * 18) + fl);
  const transform = useMotionTemplate`perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;

  // the band of light on the grain runs across with the tilt; on the back face it runs the other way
  const band = useTransform(
    [sx, flip] as MotionValue<number>[],
    ([x, fl]: number[]) => 50 + x * 62 * (fl > 90 ? -1 : 1),
  );
  const bandBg = useMotionTemplate`linear-gradient(100deg, transparent calc(${band}% - 34%), ${f.hi} calc(${band}% - 4%), rgba(255,255,255,0.9) ${band}%, ${f.hi} calc(${band}% + 4%), transparent calc(${band}% + 34%))`;
  const glareX = useTransform(sx, (v) => 50 + v * 50);
  const glareY = useTransform(sy, (v) => 50 + v * 50);
  const glare = useMotionTemplate`radial-gradient(60% 80% at ${glareX}% ${glareY}%, rgba(255,255,255,0.32), transparent 70%)`;
  const hx = useTransform(sx, (v) => v * 160 + 40);
  const hy = useTransform(sy, (v) => 50 + v * 40);
  // the engraving catches light from the side the card is turned towards
  const engr = useTransform([sx, sy] as MotionValue<number>[], ([x, y]: number[]) => {
    const dx = (-x * 1.1).toFixed(2);
    const dy = (-y * 1.1).toFixed(2);
    return `${dx}px ${dy}px 0 ${f.hi}, ${(-Number(dx)).toFixed(2)}px ${(-Number(dy)).toFixed(2)}px 0 ${f.lo}`;
  });
  const shadowX = useTransform(sx, (v) => -v * 26);
  const shadowScale = useTransform(lift, (v) => 1 - v / 160);
  const shadowOp = useTransform(lift, (v) => 0.55 - v / 120);

  const doFlip = () => {
    const to = backRef.current ? 0 : 180;
    setBack(!backRef.current);
    sfx.whoosh(500, 1800, { dur: 0.32, gain: 0.05 });
    sfx.tick({ at: 0.34, freq: 2600, gain: 0.05 });
    if (reduce) flip.set(to);
    else
      animate(flip, to, {
        type: "spring",
        stiffness: 120,
        damping: 15,
        mass: 0.9,
      });
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
    py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
  };
  const onEnter = () => lift.set(18);
  const onLeave = () => {
    px.set(0);
    py.set(0);
    lift.set(0);
  };

  // autoplay: a slow rock in a figure of eight, and a turn every few seconds
  useEffect(() => {
    if (!autoplay || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    let flips = 0;
    const loop = (t: number) => {
      if (touched.current) return;
      const s = (t - t0) / 1000;
      px.set(Math.sin(s * 0.9) * 0.75);
      py.set(Math.sin(s * 1.8) * 0.45);
      lift.set(10 + Math.sin(s * 0.9) * 6);
      if (Math.floor((s + 2.5) / 5.5) > flips) {
        flips++;
        doFlip();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const groups = useMemo(() => (number.replace(/\D/g, "").match(/.{1,4}/g) ?? []).slice(0, 4), [number]);
  const last4 = groups[3] ?? "";

  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      touched.current = true;
      doFlip();
    }
  };

  const face: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 16,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    background: f.base,
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 -1px 0 ${f.edge}, inset 0 1px 0 rgba(255,255,255,0.45)`,
  };
  const etched: CSSProperties = { color: f.ink, fontWeight: 600 };
  const textLight = finish === "black" ? "rgba(255,255,255,0.78)" : "rgba(28,30,34,0.78)";

  const surface = (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: BRUSH,
          backgroundSize: "420px 260px",
          mixBlendMode: "overlay",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, ${f.line} 0 1px, transparent 1px 2px, rgba(0,0,0,0.04) 2px 3px)`,
          mixBlendMode: "overlay",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: bandBg,
          mixBlendMode: "soft-light",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: bandBg,
          mixBlendMode: "overlay",
          opacity: 0.45,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: glare,
          mixBlendMode: "soft-light",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN,
          opacity: 0.22,
          mixBlendMode: "overlay",
        }}
      />
    </>
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[24px] select-none ${className}`}
      style={{
        background: f.stage,
        minHeight: 420,
        display: "grid",
        placeItems: "center",
        padding: "40px 16px 56px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN,
          opacity: 0.08,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(100%, 340px)",
          aspectRatio: `${W} / ${H}`,
        }}
      >
        {/* the shadow on the floor */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: -34,
            height: 36,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)",
            filter: "blur(10px)",
            x: shadowX,
            scaleX: shadowScale,
            opacity: shadowOp,
          }}
        />
        <motion.div
          role="button"
          tabIndex={0}
          aria-pressed={back}
          aria-label={
            back
              ? `${issuer} card, back. Security code ${cvv}. Press to turn over.`
              : `${issuer} card ending ${last4}, ${holder}, expires ${expires}. Press to turn over.`
          }
          onPointerMove={onMove}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          onPointerDown={() => (touched.current = true)}
          onClick={doFlip}
          onKeyDown={onKey}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            transformStyle: "preserve-3d",
            transform,
            cursor: "pointer",
            boxShadow: "0 30px 50px -28px rgba(0,0,0,0.8), 0 2px 0 rgba(0,0,0,0.25)",
          }}
        >
          {/* front */}
          <div style={face}>
            {surface}
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: "7% 7.5%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <motion.span
                  style={{
                    ...etched,
                    fontSize: 17,
                    letterSpacing: "-0.02em",
                    textShadow: engr,
                  }}
                >
                  {issuer}
                </motion.span>
                <motion.span
                  style={{
                    color: f.ink,
                    filter: `drop-shadow(${f.lo} 0.6px 0.6px 0)`,
                  }}
                >
                  <svg viewBox="0 0 256 256" width="22" height="22" aria-hidden="true" style={{ display: "block" }}>
                    <path fill="currentColor" d={I.tap} />
                  </svg>
                </motion.span>
              </div>
              <div
                style={{
                  marginTop: "8%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <Chip />
                <Hologram hx={hx} hy={hy} />
              </div>
              <motion.div
                style={{
                  ...etched,
                  marginTop: "auto",
                  fontSize: "clamp(15px, 5.3vw, 19px)",
                  letterSpacing: "0.12em",
                  fontVariantNumeric: "tabular-nums",
                  textShadow: engr,
                  display: "flex",
                  gap: "0.7em",
                }}
              >
                {groups.map((g, i) => (
                  <span key={i}>{g}</span>
                ))}
              </motion.div>
              <div
                style={{
                  marginTop: "4%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <motion.span
                  style={{
                    ...etched,
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    textShadow: engr,
                  }}
                >
                  {holder}
                </motion.span>
                <motion.span
                  style={{
                    ...etched,
                    fontSize: 12,
                    letterSpacing: "0.06em",
                    fontVariantNumeric: "tabular-nums",
                    textShadow: engr,
                  }}
                >
                  {expires}
                </motion.span>
              </div>
            </div>
          </div>
          {/* back */}
          <div style={{ ...face, transform: "rotateY(180deg)" }}>
            {surface}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "11%",
                height: "20%",
                background: "linear-gradient(180deg,#0d0e10,#26282c 45%,#101113)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6)",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: bandBg,
                  mixBlendMode: "soft-light",
                  opacity: 0.6,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: "7.5%",
                right: "7.5%",
                top: "41%",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 34,
                  borderRadius: 4,
                  background: "repeating-linear-gradient(-12deg,#f4f1ea 0 5px,#e9e4d8 5px 10px)",
                  boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  fontSize: 15,
                  fontStyle: "italic",
                  color: "#3a3f8f",
                  fontFamily: "'Snell Roundhand','Segoe Script','Brush Script MT',cursive",
                }}
              >
                {holder}
              </div>
              <div
                style={{
                  width: 52,
                  height: 34,
                  borderRadius: 4,
                  background: "#fbfaf6",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1d1d1f",
                  fontStyle: "italic",
                  fontVariantNumeric: "tabular-nums",
                  boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)",
                }}
              >
                {cvv}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: "7.5%",
                right: "7.5%",
                bottom: "9%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 8.5,
                  lineHeight: 1.45,
                  color: textLight,
                  maxWidth: "62%",
                }}
              >
                This card remains the property of {issuer}. If found, please return it to any branch. Use is subject to
                the cardholder agreement.
              </span>
              <Hologram hx={hx} hy={hy} />
            </div>
          </div>
        </motion.div>
      </div>
      <p className="sr-only" aria-live="polite">
        {back ? "Showing the back of the card" : "Showing the front of the card"}
      </p>
    </div>
  );
}
