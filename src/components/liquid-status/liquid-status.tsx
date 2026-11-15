"use client";

import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type LiquidStat = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  line1: string;
  line2: string;
  color: string;
  icon: string;
};
export type LiquidStatusProps = {
  stats?: LiquidStat[];
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

const DEFAULT: LiquidStat[] = [
  {
    id: "battery",
    label: "Battery",
    value: 85,
    line1: "Almost there,",
    line2: "full in 12 min",
    color: "#4ef08f",
    icon: "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  },
  {
    id: "storage",
    label: "Cloud storage",
    value: 62,
    line1: "Room to grow,",
    line2: "38 GB free",
    color: "#3cc8ff",
    icon: "M160.06 40a88.1 88.1 0 0 0-78.77 48.67A87.5 87.5 0 0 0 72 127.73a8.18 8.18 0 0 1-7.43 8.27a8 8 0 0 1-8.57-8a103.7 103.7 0 0 1 5.34-32.92a4 4 0 0 0-4.75-5.18A64.09 64.09 0 0 0 8 152c0 35.19 29.75 64 65 64h87a88.09 88.09 0 0 0 87.93-91.48C246.11 77.54 207.07 40 160.06 40",
  },
  {
    id: "security",
    label: "Security score",
    value: 94,
    line1: "All clear,",
    line2: "scanned today",
    color: "#a77bff",
    icon: "M224 56v56c0 52.72-25.52 84.67-46.93 102.19c-23.06 18.86-46 25.27-47 25.53a8 8 0 0 1-4.2 0c-1-.26-23.91-6.67-47-25.53C57.52 196.67 32 164.72 32 112V56a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16",
  },
];

const CW = 230;
const CH = 310;
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function Card({
  s,
  auto,
  reduce,
  sfx,
}: {
  s: LiquidStat;
  auto: boolean;
  reduce: boolean;
  sfx: ReturnType<typeof useSound>;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);
  const level = useRef(0);
  const target = useRef(s.value / 100);
  const surf = useRef({ ang: 0, v: 0, roll: 0, slosh: 0 });
  const [shown, setShown] = useState(0);
  const touched = useRef(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 160, damping: 18 });
  const sy = useSpring(py, { stiffness: 160, damping: 18 });
  const rotY = useTransform(sx, (v) => v * 12);
  const rotX = useTransform(sy, (v) => -v * 9);
  // the card rolls a little toward the pointer; the liquid stays level, so it tips the other way inside
  const roll = useTransform(sx, (v) => v * 6);
  const glare = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(70% 60% at ${50 + x * 40}% ${30 + y * 30}%, rgba(255,255,255,0.08), transparent 60%)`,
  );

  // count the number up as it fills
  useEffect(() => {
    const c = animate(0, s.value, {
      duration: reduce ? 0 : 1.8,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => c.stop();
  }, [s.value, reduce]);

  useEffect(() => {
    const c = cv.current;
    const gc = glow.current;
    const ctx = c?.getContext("2d");
    const gctx = gc?.getContext("2d");
    if (!c || !ctx || !gc || !gctx) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = CW * dpr;
    c.height = CH * dpr;
    gc.width = CW / 2;
    gc.height = CH / 2;
    const icon = new Path2D(s.icon);
    // the icon is drawn big and bleeds off the card's right side
    const S = 1.12;
    const ox = CW - 256 * S * 0.62;
    const oy = CH * 0.08;
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const bubbles = Array.from({ length: 14 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 2.4,
      v: 18 + Math.random() * 30,
      ph: i,
    }));
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(c);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      level.current += (target.current - level.current) * Math.min(1, dt * (reduce ? 50 : 1.6));
      const su = surf.current;
      // the surface wants to stay level against the card's roll, and overshoots when it moves
      const want = (-roll.get() * Math.PI) / 180;
      su.v += ((want - su.ang) * 40 - su.v * 3.2) * dt;
      su.ang += su.v * dt;
      su.slosh *= Math.pow(0.4, dt);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CW, CH);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(S, S);
      // glass: faint body and rim
      const glass = ctx.createLinearGradient(0, 0, 256, 256);
      glass.addColorStop(0, "rgba(255,255,255,0.10)");
      glass.addColorStop(0.5, "rgba(255,255,255,0.035)");
      glass.addColorStop(1, "rgba(255,255,255,0.06)");
      ctx.fillStyle = glass;
      ctx.fill(icon);
      ctx.save();
      ctx.clip(icon);
      // icon spans roughly 24..232 in its box
      const top = 24;
      const bot = 232;
      const yl = bot - (bot - top) * level.current;
      const amp = reduce ? 0 : 3.2 + Math.abs(su.v) * 5 + su.slosh * 10;
      const tilt = Math.tan(su.ang);
      const wave = (x: number, k: number, ph: number) =>
        yl + (x - 128) * tilt + Math.sin(x * k + ph) * amp + Math.sin(x * k * 2.3 - ph * 1.3) * amp * 0.35;
      const grad = ctx.createLinearGradient(0, yl - 20, 0, bot);
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, s.color + "b0");
      // the back wave, darker
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(0, 260);
      for (let x = 0; x <= 256; x += 6) ctx.lineTo(x, wave(x, 0.045, t * 2.1 + 1.7) - 3);
      ctx.lineTo(256, 260);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 260);
      for (let x = 0; x <= 256; x += 6) ctx.lineTo(x, wave(x, 0.038, -t * 2.6));
      ctx.lineTo(256, 260);
      ctx.fill();
      // the bright meniscus
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 6)
        (x === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, wave(x, 0.038, -t * 2.6) + 1.5);
      ctx.stroke();
      // light deeper in the liquid
      const deep = ctx.createRadialGradient(150, yl + 60, 4, 150, yl + 60, 140);
      deep.addColorStop(0, "rgba(255,255,255,0.22)");
      deep.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = deep;
      ctx.fillRect(0, yl, 256, 260);
      // bubbles rise through it
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (const b of bubbles) {
        b.y -= (b.v * dt) / 200;
        if (b.y < 0) {
          b.y = 1;
          b.x = Math.random();
        }
        const by = yl + (bot - yl) * b.y;
        const bx = 40 + b.x * 180 + Math.sin(t * 2 + b.ph) * 3;
        if (by < yl + 4) continue;
        ctx.globalAlpha = 0.25 + b.y * 0.5;
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      // the rim of the glass catches light on its upper edge
      const rim = ctx.createLinearGradient(0, 0, 0, 256);
      rim.addColorStop(0, "rgba(255,255,255,0.35)");
      rim.addColorStop(0.5, "rgba(255,255,255,0.08)");
      rim.addColorStop(1, "rgba(255,255,255,0.02)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 2;
      ctx.stroke(icon);
      ctx.restore();
      // the glow is the same drawing, small and blurred, behind
      gctx.clearRect(0, 0, gc.width, gc.height);
      gctx.drawImage(c, 0, 0, gc.width, gc.height);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [s.icon, s.color, reduce, roll]);

  // autoplay: a gentle rock, as if the card were being turned in the hand
  useEffect(() => {
    if (!auto || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (touched.current) return;
      const k = (now - t0) / 1000;
      px.set(Math.sin(k * 0.9 + s.value) * 0.7);
      py.set(Math.sin(k * 0.6 + s.value) * 0.3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [auto, reduce, px, py, s.value]);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };
  // pressing gives it a shake and tops it up or lets it settle back
  const press = () => {
    touched.current = true;
    surf.current.slosh = 1;
    surf.current.v += (Math.random() > 0.5 ? 1 : -1) * 3;
    const up = target.current < 0.99;
    target.current = up ? Math.min(1, target.current + 0.08) : s.value / 100;
    animate(shown, Math.round(target.current * 100), {
      duration: 0.8,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    sfx.note(320 + target.current * 300, {
      dur: 0.25,
      gain: 0.05,
      glide: 420 + target.current * 300,
    });
    sfx.whoosh(500, 1400, { dur: 0.3, gain: 0.03 });
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${s.label}: ${shown}${s.unit ?? "%"}. ${s.line1} ${s.line2}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={press}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          press();
        }
      }}
      className="outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f2f4]"
      style={{
        position: "relative",
        width: CW,
        height: CH,
        borderRadius: 26,
        overflow: "hidden",
        background: "radial-gradient(120% 90% at 30% 0%, #1d1f25 0%, #0d0e11 60%, #08090b 100%)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 30px 50px -28px rgba(0,0,0,0.65)",
        rotateX: rotX,
        rotateY: rotY,
        rotate: roll,
        transformPerspective: 900,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <canvas
        ref={glow}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: CW,
          height: CH,
          filter: "blur(22px) saturate(1.3)",
          opacity: 0.9,
        }}
      />
      <canvas ref={cv} aria-hidden="true" style={{ position: "absolute", inset: 0, width: CW, height: CH }} />
      <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: glare }} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN,
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />
      <div style={{ position: "absolute", left: 20, top: 20, right: 20 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: "0.01em",
          }}
        >
          {s.label}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 6,
            color: s.color,
            textShadow: `0 0 24px ${s.color}66`,
          }}
        >
          <span
            style={{
              fontSize: 46,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {shown}
          </span>
          <span style={{ fontSize: 22, fontWeight: 600, marginLeft: 2 }}>{s.unit ?? "%"}</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 20, bottom: 20, right: 20 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          {s.line1}
        </div>
        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.62)" }}>{s.line2}</div>
      </div>
    </motion.div>
  );
}

/**
 * Status cards where each icon is a glass vessel holding a glowing liquid, filled to the number on the card. The
 * liquid rolls in two layers of waves under a bright meniscus, bubbles rise through it and it lights the dark card
 * around it. Point at a card and it turns towards you and rolls slightly; the liquid inside stays level, tipping the
 * other way and sloshing back. Press a card to top it up.
 */
export default function LiquidStatus({
  stats = DEFAULT,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: LiquidStatusProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  // set on the first press or key inside the card, so its sounds play even where autoplay sound is not allowed
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const list = useMemo(() => stats.slice(0, 4), [stats]);
  return (
    <div
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
      className={`relative w-full rounded-[24px] ${className}`}
      style={{
        background: "#f2f2f4",
        padding: "44px 16px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 18,
      }}
    >
      {list.map((s) => (
        <Card key={s.id} s={s} auto={autoplay} reduce={reduce} sfx={sfx} />
      ))}
    </div>
  );
}
