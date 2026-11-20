"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { animate, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
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

export type CardWearProps = {
  /** the card's age to start at, in months */
  months?: number;
  /** the oldest the scrubber goes, in months */
  maxMonths?: number;
  holder?: string;
  last4?: string;
  onMonthsChange?: (months: number) => void;
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

type Scratch = {
  x: number;
  y: number;
  a: number;
  len: number;
  bend: number;
  w: number;
  born: number;
  kind: number;
};

/** a lifetime of marks, each with the age (0..1) at which it appears: hairlines everywhere, more near the edges */
function makeScratches(seed0: number) {
  let seed = seed0;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const out: Scratch[] = [];
  for (let i = 0; i < 330; i++) {
    const edge = r() < 0.3;
    let x = r();
    let y = r();
    if (edge) {
      if (r() < 0.5) x = r() < 0.5 ? r() * 0.08 : 1 - r() * 0.08;
      else y = r() < 0.5 ? r() * 0.1 : 1 - r() * 0.1;
    }
    // pockets scrape mostly side to side
    const a = (r() < 0.65 ? (r() - 0.5) * 0.7 : r() * Math.PI) + (r() < 0.5 ? 0 : Math.PI);
    const long = r() < 0.045;
    out.push({
      x,
      y,
      a,
      len: long ? 0.2 + r() * 0.3 : 0.012 + r() * r() * 0.09,
      bend: (r() - 0.5) * 0.5,
      w: long ? 0.7 : 0.4 + r() * 0.5,
      born: Math.pow(r(), 1.25),
      kind: long ? 1 : 0,
    });
  }
  return out.sort((p, q) => p.born - q.born);
}

const fmtAge = (m: number) => {
  if (m < 1) return "New";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  const ys = y ? `${y} year${y > 1 ? "s" : ""}` : "";
  const ms = mo ? `${mo} month${mo > 1 ? "s" : ""}` : "";
  return [ys, ms].filter(Boolean).join(" ");
};

/**
 * A card that wears the way a real one does. Drag along the ruler under it to age the card from new to four years:
 * hairline scratches gather where pockets and card readers rub, a few long scrapes cross the face and the edges go
 * dull. Move the pointer over the card to tilt it under the light; each scratch only catches the light when it runs
 * across it, so the marks glint and vanish as the angle changes, the way brushed metal does.
 */
export default function CardWear({
  months: start = 26,
  maxMonths = 48,
  holder = "Alex Morgan",
  last4 = "4821",
  onMonthsChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: CardWearProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const [months, setMonths] = useState(start);
  const touched = useRef(false);
  const scratches = useMemo(() => makeScratches(4821), []);
  const age = useSpring(start / maxMonths, { stiffness: 120, damping: 24 });
  const lx = useMotionValue(0.3);
  const ly = useMotionValue(0.2);
  const tiltX = useSpring(0, { stiffness: 150, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 18 });
  const slx = useSpring(lx, { stiffness: 120, damping: 20 });
  const sly = useSpring(ly, { stiffness: 120, damping: 20 });

  useEffect(() => {
    age.set(months / maxMonths);
  }, [months, maxMonths, age]);

  // draw: the scratches over the face, each lit by how square it sits to the light
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let dirty = true;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!dirty) return;
      dirty = false;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = c.clientWidth;
      const H = c.clientHeight;
      if (c.width !== Math.round(W * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = age.get();
      const L = { x: slx.get() * W, y: sly.get() * H };
      ctx.lineCap = "round";
      for (const s of scratches) {
        if (s.born > t) break;
        const grow = Math.min(1, (t - s.born) / 0.04);
        const cx = s.x * W;
        const cy = s.y * H;
        const len = s.len * W * (0.4 + 0.6 * grow);
        const dx = Math.cos(s.a);
        const dy = Math.sin(s.a);
        // light direction from the scratch to the light; a groove shines when it lies across that direction
        const lxv = L.x - cx;
        const lyv = L.y - cy;
        const ld = Math.hypot(lxv, lyv) || 1;
        const across = Math.abs((dx * lyv - dy * lxv) / ld);
        const near = Math.exp(-((ld / W) ** 2) * 4.5);
        const glint = Math.pow(across, 7) * near;
        const base = 0.028 + 0.04 * s.kind;
        const alpha = Math.min(0.85, (base + glint * 0.62) * grow);
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = s.w;
        const x0 = cx - (dx * len) / 2;
        const y0 = cy - (dy * len) / 2;
        const x1 = cx + (dx * len) / 2;
        const y1 = cy + (dy * len) / 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx - dy * len * s.bend, cy + dx * len * s.bend, x1, y1);
        ctx.stroke();
      }
      // worn edges: the rim goes pale and uneven
      const rim = Math.max(0, t - 0.15) / 0.85;
      if (rim > 0) {
        ctx.save();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = `rgba(255,255,255,${(0.1 * rim).toFixed(3)})`;
        ctx.setLineDash([6 + 30 * (1 - rim), 4 + 10 * rim]);
        ctx.beginPath();
        ctx.roundRect(1.2, 1.2, W - 2.4, H - 2.4, 15);
        ctx.stroke();
        ctx.restore();
      }
    };
    const mark = () => (dirty = true);
    const subs = [age.on("change", mark), slx.on("change", mark), sly.on("change", mark)];
    const ro = new ResizeObserver(mark);
    ro.observe(c);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      subs.forEach((u) => u());
      ro.disconnect();
    };
  }, [scratches, age, slx, sly]);

  const setAge = (m: number, from: "drag" | "key" | "auto") => {
    const v = Math.max(0, Math.min(maxMonths, Math.round(m)));
    setMonths((old) => {
      if (old !== v) {
        onMonthsChange?.(v);
        if (from !== "auto" || v % 6 === 0)
          sfx.tick({
            freq: v % 12 === 0 ? 2300 : 1500 + v * 6,
            gain: v % 12 === 0 ? 0.03 : 0.014,
          });
      }
      return v;
    });
  };

  // the ruler
  const dragging = useRef(false);
  const fromRuler = (e: { clientX: number }) => {
    const r = ruler.current!.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * maxMonths;
  };
  const rDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setAge(fromRuler(e), "drag");
  };
  const rMove = (e: RPointerEvent<HTMLDivElement>) => dragging.current && setAge(fromRuler(e), "drag");
  const rUp = () => (dragging.current = false);
  const rKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 12 : 1;
    const map: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: 12,
      PageDown: -12,
    };
    if (e.key in map) setAge(months + map[e.key], "key");
    else if (e.key === "Home") setAge(0, "key");
    else if (e.key === "End") setAge(maxMonths, "key");
    else return;
    e.preventDefault();
    touched.current = true;
  };

  // the card under the pointer
  const cMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.isTrusted) touched.current = true;
    const r = cardRef.current!.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    lx.set(fx);
    ly.set(fy);
    tiltY.set((fx - 0.5) * 14);
    tiltX.set(-(fy - 0.5) * 12);
  };
  const cLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    lx.set(0.3);
    ly.set(0.2);
  };

  // autoplay: age it from new, sweep the light, then back
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const run = async () => {
      await wait(1000);
      while (ok()) {
        for (let m = months; m >= 0 && ok(); m -= 2) {
          setAge(m, "auto");
          await wait(30);
        }
        await wait(700);
        for (let m = 0; m <= maxMonths && ok(); m++) {
          setAge(m, "auto");
          await wait(70);
        }
        if (!ok()) return;
        await Promise.all([
          animate(lx, 0.9, { duration: 1.6, ease: "easeInOut" }),
          animate(ly, 0.8, { duration: 1.6, ease: "easeInOut" }),
          animate(tiltY, 6, { duration: 1.6 }),
        ]);
        if (!ok()) return;
        await Promise.all([
          animate(lx, 0.1, { duration: 1.8, ease: "easeInOut" }),
          animate(ly, 0.3, { duration: 1.8, ease: "easeInOut" }),
          animate(tiltY, -6, { duration: 1.8 }),
        ]);
        cLeave();
        await wait(1200);
        for (let m = maxMonths; m >= 26 && ok(); m--) {
          setAge(m, "auto");
          await wait(40);
        }
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
  }, [autoplay, reduce]);

  const sheen = useMotionValue("");
  useEffect(() => {
    const upd = () =>
      sheen.set(
        `radial-gradient(120% 90% at ${slx.get() * 100}% ${sly.get() * 100}%, rgba(255,255,255,0.13), rgba(255,255,255,0) 55%)`,
      );
    upd();
    const a = slx.on("change", upd);
    const b = sly.on("change", upd);
    return () => {
      a();
      b();
    };
  }, [slx, sly, sheen]);

  const label: CSSProperties = {
    fontSize: 12,
    color: "#86868b",
    fontVariantNumeric: "tabular-nums",
  };
  const ticks = maxMonths + 1;

  return (
    <div
      className={`relative w-full max-w-[440px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: "26px 26px 22px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ perspective: 900 }}>
          <motion.div
            ref={cardRef}
            onPointerMove={cMove}
            onPointerLeave={cLeave}
            role="img"
            aria-label={`Debit card ending ${last4}, ${fmtAge(months).toLowerCase()} old`}
            style={{
              position: "relative",
              aspectRatio: "1.586",
              borderRadius: 16,
              overflow: "hidden",
              rotateX: tiltX,
              rotateY: tiltY,
              background: "linear-gradient(160deg, #2a2a2d 0%, #161618 45%, #0d0d0e 100%)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 22px 36px -22px rgba(0,0,0,0.65)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* a faint guilloche, the card's own pattern */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 320 202"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, opacity: 0.07 }}
              aria-hidden="true"
            >
              {Array.from({ length: 22 }, (_, i) => (
                <ellipse
                  key={i}
                  cx="250"
                  cy="70"
                  rx={30 + i * 9}
                  ry={18 + i * 6}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              ))}
            </svg>
            <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: sheen }} />
            <canvas
              ref={canvas}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />
            {/* chip */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "8%",
                top: "36%",
                width: "12%",
                aspectRatio: "1.3",
                borderRadius: 6,
                background: "linear-gradient(135deg, #8e8e93, #4a4a4e 60%, #6e6e73)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "30% 0",
                  borderTop: "1px solid rgba(0,0,0,0.35)",
                  borderBottom: "1px solid rgba(0,0,0,0.35)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "0 38%",
                  borderLeft: "1px solid rgba(0,0,0,0.35)",
                  borderRight: "1px solid rgba(0,0,0,0.35)",
                }}
              />
            </div>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "8%",
                top: "9%",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.86)",
              }}
            >
              Everyday
            </div>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                bottom: "9%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                fontSize: 12.5,
                color: "rgba(255,255,255,0.62)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{holder}</span>
              <span style={{ letterSpacing: "0.04em" }}>•• {last4}</span>
            </div>
          </motion.div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <span
            aria-live="polite"
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtAge(months)}
          </span>
          <span style={label}>Drag the ruler to age it</span>
        </div>

        {/* the ruler: one tick a month, taller each year */}
        <div
          ref={ruler}
          role="slider"
          tabIndex={0}
          aria-label="Card age"
          aria-valuemin={0}
          aria-valuemax={maxMonths}
          aria-valuenow={months}
          aria-valuetext={fmtAge(months)}
          onPointerDown={rDown}
          onPointerMove={rMove}
          onPointerUp={rUp}
          onPointerCancel={rUp}
          onKeyDown={rKey}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
          style={{
            position: "relative",
            height: 34,
            marginTop: 14,
            cursor: "ew-resize",
            touchAction: "none",
            borderRadius: 6,
          }}
        >
          {Array.from({ length: ticks }, (_, i) => {
            const yr = i % 12 === 0;
            const past = i <= months;
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${(i / maxMonths) * 100}%`,
                  bottom: 8,
                  width: 1.5,
                  marginLeft: -0.75,
                  height: yr ? 18 : 9,
                  borderRadius: 1,
                  background: past ? "#1d1d1f" : "#d2d2d7",
                  transition: "background 0.2s",
                }}
              />
            );
          })}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{ left: `${(months / maxMonths) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
            style={{
              position: "absolute",
              bottom: 4,
              width: 3,
              marginLeft: -1.5,
              height: 30,
              borderRadius: 2,
              background: "#0071e3",
            }}
          />
        </div>
        <div style={{ position: "relative", height: 14, ...label }}>
          {Array.from({ length: Math.floor(maxMonths / 12) + 1 }, (_, y) => (
            <span
              key={y}
              style={{
                position: "absolute",
                left: `${((y * 12) / maxMonths) * 100}%`,
                transform: y === 0 ? "none" : y * 12 === maxMonths ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {y === 0 ? "New" : `${y}y`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
