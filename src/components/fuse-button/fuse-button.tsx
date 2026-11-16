"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FuseButtonProps = {
  /** the action's name, then what it reads once done */
  label?: string;
  doneLabel?: string;
  /** seconds the fuse burns, the time there is to undo */
  seconds?: number;
  /** called when the fuse burns out and the action sticks */
  onCommit?: () => void;
  onUndo?: () => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

/** the sender's face: Fluent Emoji 3D by Microsoft (MIT) */
const SENDER =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20white%20hair/Dark/3D/woman_white_hair_3d_dark.png";

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
  archive:
    "M224 48H32a16 16 0 0 0-16 16v24a16 16 0 0 0 16 16v88a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-88a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m-16 144H48v-88h160Zm16-104H32V64h192zM96 136a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8",
  undo: "M236 144a68.07 68.07 0 0 1-68 68H80a12 12 0 0 1 0-24h88a44 44 0 0 0 0-88H61l27.52 27.51a12 12 0 0 1-17 17l-48-48a12 12 0 0 1 0-17l48-48a12 12 0 1 1 17 17L61 76h107a68.08 68.08 0 0 1 68 68",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  paperclip:
    "M209.66 122.34a8 8 0 0 1 0 11.32l-82.05 82a56 56 0 0 1-79.2-79.21l99.26-100.72a40 40 0 1 1 56.61 56.55L105 193a24 24 0 1 1-34-34l83.3-84.62a8 8 0 1 1 11.4 11.22l-83.31 84.71a8 8 0 1 0 11.27 11.36L192.93 81A24 24 0 1 0 159 47L59.76 147.68a40 40 0 1 0 56.53 56.62l82.06-82a8 8 0 0 1 11.31.04",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const H = 46; // the button's height
const M = 40; // room around it for the sparks

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hot: number;
};
type Phase = "idle" | "lit" | "done" | "out";

/**
 * An action with a burning fuse for an undo. Press Archive and the button turns into Archived with an Undo inside
 * it, while a fuse lit at its top runs round the outline: a fizzing spark throws off embers that arc and fade, the cord
 * ahead is braided and bright, the cord behind is left charred. Press Undo before it burns round and the spark is
 * snuffed in a puff of smoke and nothing happens; let it burn out and the action sticks and the message is filed away.
 */
export default function FuseButton({
  label = "Archive",
  doneLabel = "Archived",
  seconds = 5,
  onCommit,
  onUndo,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FuseButtonProps) {
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
  const [phase, setPhaseS] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseS(p);
  };
  const touched = useRef(false);
  const btn = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(140);
  const path = useRef<SVGPathElement>(null);
  const cord = useRef<SVGPathElement>(null);
  const char = useRef<SVGPathElement>(null);
  const glow = useRef<SVGCircleElement>(null);
  const ember = useRef<SVGPathElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const prog = useRef(0);
  const sparks = useRef<Spark[]>([]);
  const smoke = useRef<{ x: number; y: number; r: number; life: number }[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the pill's width follows its label
  useLayoutEffect(() => {
    const el = btn.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const r = H / 2;
  const d = useMemo(() => {
    const x0 = M;
    const y0 = M;
    // starts top centre and runs clockwise right round
    return `M ${x0 + w / 2} ${y0} L ${x0 + w - r} ${y0} A ${r} ${r} 0 0 1 ${x0 + w - r} ${y0 + H} L ${x0 + r} ${y0 + H} A ${r} ${r} 0 0 1 ${x0 + r} ${y0} Z`;
  }, [w, r]);

  // the burn
  useEffect(() => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    let raf = 0;
    let last = performance.now();
    let lastCrackle = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = w + M * 2;
      const HH = H + M * 2;
      if (c.width !== Math.round(W * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(HH * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, HH);
      const p = path.current;
      const L = p ? p.getTotalLength() : 1;
      const ph = phaseRef.current;
      if (ph === "lit") {
        prog.current = Math.min(1, prog.current + dt / seconds);
        if (prog.current >= 1) burnOut();
      }
      const s = prog.current * L;
      if (cord.current && char.current) {
        cord.current.setAttribute("stroke-dasharray", `${Math.max(0, L - s)} ${L * 2}`);
        cord.current.setAttribute("stroke-dashoffset", `${-s}`);
        char.current.setAttribute("stroke-dasharray", `${s} ${L * 2}`);
        if (ember.current) {
          const e = Math.min(s, 22);
          ember.current.setAttribute("stroke-dasharray", `${e} ${L * 2}`);
          ember.current.setAttribute("stroke-dashoffset", `${-(s - e)}`);
        }
      }
      if (p && (ph === "lit" || sparks.current.length || smoke.current.length)) {
        const pt = p.getPointAtLength(Math.min(L, s));
        if (glow.current) {
          glow.current.setAttribute("cx", String(pt.x));
          glow.current.setAttribute("cy", String(pt.y));
          glow.current.setAttribute("opacity", ph === "lit" ? String(0.75 + Math.random() * 0.25) : "0");
        }
        if (ph === "lit" && !reduce) {
          // a fuse throws embers in bursts
          const n = Math.random() < 0.3 ? 9 : 3;
          for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = 40 + Math.random() * 140;
            sparks.current.push({
              x: pt.x,
              y: pt.y,
              vx: Math.cos(a) * v,
              vy: Math.sin(a) * v - 40,
              life: 0,
              max: 0.18 + Math.random() * 0.4,
              hot: Math.random(),
            });
          }
          if (now - lastCrackle > 45 + Math.random() * 80) {
            lastCrackle = now;
            sfx.tick({
              freq: 2500 + Math.random() * 3500,
              gain: 0.012 + Math.random() * 0.02,
            });
          }
        }
        ctx.globalCompositeOperation = "lighter";
        const next: Spark[] = [];
        for (const k of sparks.current) {
          k.life += dt;
          if (k.life > k.max) continue;
          const px = k.x;
          const py = k.y;
          k.vy += 260 * dt;
          k.vx *= 0.985;
          k.x += k.vx * dt;
          k.y += k.vy * dt;
          const t = 1 - k.life / k.max;
          // white hot to orange to red as it cools, drawn as a short streak
          const col =
            k.hot > 0.6
              ? `rgba(255,${200 + 55 * t},${120 + 120 * t},${t})`
              : `rgba(255,${120 + 100 * t},${30 + 40 * t},${t})`;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.3 + t * 1.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(k.x, k.y);
          ctx.stroke();
          next.push(k);
        }
        sparks.current = next;
        if (ph === "lit") {
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 16);
          g.addColorStop(0, "rgba(255,250,220,0.95)");
          g.addColorStop(0.25, "rgba(255,190,80,0.6)");
          g.addColorStop(1, "rgba(255,120,20,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        const sm: typeof smoke.current = [];
        for (const m of smoke.current) {
          m.life += dt;
          if (m.life > 1.6) continue;
          m.y -= 18 * dt;
          m.r += 14 * dt;
          ctx.fillStyle = `rgba(120,118,115,${0.28 * (1 - m.life / 1.6)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
          sm.push(m);
        }
        smoke.current = sm;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, seconds, reduce]);

  const light = () => {
    if (phaseRef.current !== "idle") return;
    prog.current = 0;
    setPhase("lit");
    sfx.whoosh(300, 2600, { dur: 0.35, gain: 0.05 });
    sfx.note(660, { dur: 0.15, gain: 0.04 });
  };
  const undo = () => {
    if (phaseRef.current !== "lit") return;
    const p = path.current;
    if (p) {
      const pt = p.getPointAtLength(prog.current * p.getTotalLength());
      for (let i = 0; i < 7; i++)
        smoke.current.push({
          x: pt.x + (Math.random() - 0.5) * 8,
          y: pt.y + (Math.random() - 0.5) * 6,
          r: 3 + Math.random() * 4,
          life: Math.random() * 0.3,
        });
    }
    sparks.current = [];
    setPhase("idle");
    prog.current = 0;
    sfx.whoosh(2400, 400, { dur: 0.4, gain: 0.05 });
    onUndo?.();
  };
  function burnOut() {
    setPhase("done");
    sfx.note(523, { dur: 0.3, gain: 0.06, bell: 0.5 });
    sfx.note(784, { at: 0.1, dur: 0.5, gain: 0.06, bell: 0.6 });
    onCommit?.();
    timers.current.push(
      window.setTimeout(() => setPhase("out"), 1100),
      window.setTimeout(() => {
        prog.current = 0;
        setPhase("idle");
      }, 3600),
    );
  }

  // autoplay: light it, undo once, light it again and let it burn
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const run = async () => {
      await wait(900);
      while (alive && !touched.current) {
        light();
        await wait(2200);
        if (!alive || touched.current) return;
        undo();
        await wait(1500);
        if (!alive || touched.current) return;
        light();
        await wait(seconds * 1000 + 4200);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const lit = phase === "lit";
  const done = phase === "done" || phase === "out";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[24px] bg-[#f5f5f7] ${className}`}
      style={{
        padding: "44px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        minHeight: 340,
      }}
    >
      {/* the message the button acts on */}
      <motion.div
        animate={phase === "out" ? { x: 60, opacity: 0, scale: 0.96 } : { x: 0, opacity: 1, scale: 1 }}
        transition={
          phase === "out" ? { duration: 0.45, ease: [0.4, 0, 1, 1] } : { type: "spring", stiffness: 260, damping: 26 }
        }
        style={{
          width: "min(100%, 380px)",
          background: "#fff",
          borderRadius: 22,
          padding: "18px 18px 16px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 46px -30px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              position: "relative",
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "#e6dcff",
              overflow: "hidden",
            }}
          >
            <img
              src={SENDER}
              alt=""
              decoding="async"
              style={{
                position: "absolute",
                left: "8%",
                bottom: "-6%",
                width: "84%",
                maxWidth: "none",
                height: "auto",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>Sofia Navarro</span>
              <span style={{ fontSize: 12, color: "#86868b" }}>09:41</span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#6e6e73",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Invoice 2041 for October is attached
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: "12px 0 16px 52px",
            fontSize: 12,
            color: "#6e6e73",
          }}
        >
          <Ico d={I.paperclip} size={13} /> invoice-2041.pdf
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            {/* the fuse and its sparks sit round the button */}
            <svg
              aria-hidden="true"
              width={w + M * 2}
              height={H + M * 2}
              style={{
                position: "absolute",
                left: -M,
                top: -M,
                overflow: "visible",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <defs>
                <pattern
                  id={`braid-${uid}`}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill="#e9a23b" />
                  <rect width="3" height="6" fill="#c97a1e" />
                </pattern>
                <radialGradient id={`gl-${uid}`}>
                  <stop offset="0" stopColor="#fff6d8" />
                  <stop offset="0.3" stopColor="#ffb84a" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path ref={path} d={d} fill="none" stroke="none" />
              <path
                ref={char}
                d={d}
                fill="none"
                stroke="#a39b92"
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={lit ? 0.75 : 0}
                style={{ transition: "opacity 0.4s" }}
              />
              <path
                ref={ember}
                d={d}
                fill="none"
                stroke="#ff8a2a"
                strokeWidth={2.4}
                strokeLinecap="round"
                opacity={lit ? 0.9 : 0}
                style={{ filter: "drop-shadow(0 0 3px #ff7a1a)" }}
              />
              <path
                ref={cord}
                d={d}
                fill="none"
                stroke={`url(#braid-${uid})`}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={lit ? 1 : 0}
                style={{ transition: "opacity 0.25s" }}
              />
              <circle ref={glow} r={14} fill={`url(#gl-${uid})`} opacity={0} />
            </svg>
            <canvas
              ref={cv}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -M,
                top: -M,
                width: w + M * 2,
                height: H + M * 2,
                pointerEvents: "none",
                zIndex: 3,
              }}
            />
            <motion.div
              ref={btn}
              layout
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                position: "relative",
                height: H,
                borderRadius: H / 2,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: lit ? "0 5px 0 18px" : "0 18px",
                background: done ? "#e9f9ee" : lit ? "#1d1d1f" : "#fff",
                color: done ? "#1a8f3e" : lit ? "#fff" : "#1d1d1f",
                boxShadow: lit
                  ? "0 10px 26px -10px rgba(0,0,0,0.5)"
                  : "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px -6px rgba(0,0,0,0.2)",
                transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {phase === "idle" ? (
                  <motion.button
                    key="act"
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onClick={() => {
                      touched.current = true;
                      light();
                    }}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 rounded-full"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      border: 0,
                      background: "transparent",
                      color: "inherit",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      height: H,
                      margin: "0 -18px",
                      padding: "0 18px",
                    }}
                  >
                    <Ico d={I.archive} size={17} />
                    {label}
                  </motion.button>
                ) : (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {done && <Ico d={I.check} size={16} />}
                    {doneLabel}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {lit && (
                  <motion.button
                    key="undo"
                    type="button"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    onClick={() => {
                      touched.current = true;
                      undo();
                    }}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-white"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      height: 36,
                      padding: "0 14px",
                      borderRadius: 18,
                      border: 0,
                      background: "rgba(255,255,255,0.14)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Ico d={I.undo} size={14} />
                    Undo
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <p className="sr-only" aria-live="polite">
        {lit ? `${doneLabel}. Undo within ${seconds} seconds.` : done ? `${doneLabel}.` : ""}
      </p>
    </div>
  );
}
