"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type WaveConfirmProps = {
  payee?: string;
  avatar?: string;
  amount?: number;
  currency?: string;
  rows?: [string, string][];
  /** resolve when the payment has gone through */
  onConfirm?: () => Promise<void> | void;
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
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
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

const FACE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20blonde%20hair/Light/3D/woman_blonde_hair_3d_light.png";
const DEFAULT_ROWS: [string, string][] = [
  ["From", "Everyday 4821"],
  ["Arrives", "In seconds"],
  ["Fee", "Free"],
  ["Note", "Studio rent"],
];

/**
 * A payment confirmation that ripples when it goes through. Confirm, and after a short wait a wave of distortion runs
 * across the card with its colours splitting at the edges, a ring of iridescent light chases round the border and
 * sparks fly from the tick that replaces the picture. Done folds the whole card into a small receipt pill that can
 * open it again.
 */
export default function WaveConfirm({
  payee = "Maya Chen",
  avatar = FACE,
  amount = 1250,
  currency = "$",
  rows = DEFAULT_ROWS,
  onConfirm,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: WaveConfirmProps) {
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
  const [phase, setPhase] = useState<"ready" | "busy" | "sent">("ready");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [small, setSmall] = useState(false);
  const [wave, setWave] = useState(0);
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const off = useRef<SVGFEOffsetElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const [waving, setWaving] = useState(false);
  const money = `${currency}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  // the time it arrived, stamped once when the payment lands (nothing shows it before then)
  const time = useMemo(
    () => (phase === "sent" ? new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""),
    [phase],
  );

  const confirm = async () => {
    if (phaseRef.current !== "ready") return;
    setPhase("busy");
    sfx.tick({ freq: 1200, gain: 0.04 });
    const t0 = performance.now();
    await onConfirm?.();
    const left = 1400 - (performance.now() - t0);
    if (left > 0) await new Promise((r) => setTimeout(r, left));
    setPhase("sent");
    setWave((w) => w + 1);
    sfx.whoosh(300, 2600, { dur: 0.7, gain: 0.04 });
    sfx.note(784, { at: 0.08, dur: 0.25, gain: 0.04, bell: 0.6 });
    sfx.note(1175, { at: 0.2, dur: 0.5, gain: 0.04, bell: 0.7 });
  };
  const reset = () => {
    setSmall(false);
    setPhase("ready");
  };

  // the wave: drive the filter by hand for a second
  useEffect(() => {
    if (!wave || reduce) return;
    setWaving(true);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = (now - t0) / 1100;
      if (t >= 1) {
        disp.current?.setAttribute("scale", "0");
        off.current?.setAttribute("dx", "0");
        setWaving(false);
        return;
      }
      raf = requestAnimationFrame(step);
      // a swell that rises fast and settles with a couple of after-ripples
      const s = Math.sin(t * Math.PI) * (1 - t) * 42 + Math.sin(t * Math.PI * 5) * (1 - t) * 6;
      disp.current?.setAttribute("scale", s.toFixed(2));
      off.current?.setAttribute("dx", (s * 0.12).toFixed(2));
      turb.current?.setAttribute("baseFrequency", `${(0.004 + t * 0.01).toFixed(4)} ${(0.05 - t * 0.03).toFixed(4)}`);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [wave, reduce]);

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
    const go = async (sel: string, ms = 600) => {
      const c = box.current;
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
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        await go("[data-main]");
        await tap();
        setGhost(false);
        await confirm();
        await wait(2600);
        if (!ok()) return;
        await go("[data-main]");
        await tap();
        setSmall(true);
        setGhost(false);
        await wait(2400);
        if (!ok()) return;
        reset();
        await wait(1400);
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

  const sent = phase === "sent";
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        a: (i / 14) * Math.PI * 2 + (i % 3) * 0.2,
        r: 34 + (i % 4) * 10,
        s: 2 + (i % 3),
      })),
    [],
  );
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div
      className={`relative w-full max-w-[400px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#f5f5f7",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id={`${uid}-w`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap
            ref={disp}
            in="SourceGraphic"
            in2="n"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset ref={off} in="r" dx="0" dy="0" result="ro" />
          <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feBlend in="ro" in2="gb" mode="screen" />
        </filter>
      </svg>
      <style>{`@keyframes wc-spin { to { transform: rotate(360deg) } }`}</style>
      <div
        ref={box}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          minHeight: 470,
          borderRadius: 32,
          background: "#08080a",
          display: "grid",
          placeItems: "center",
          padding: 20,
          overflow: "hidden",
        }}
      >
        <LayoutGroup id={uid}>
          {!small ? (
            <motion.div
              key="card"
              layoutId={`${uid}-c`}
              transition={spring}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 330,
                borderRadius: 28,
                filter: waving ? `url(#${uid}-w)` : undefined,
              }}
            >
              {/* the iridescent ring that chases round the border */}
              <AnimatePresence>
                {sent && !reduce && (
                  <motion.div
                    key="ring"
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2.4, times: [0, 0.1, 0.6, 1] }}
                    style={{
                      position: "absolute",
                      inset: -1.5,
                      borderRadius: 29.5,
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "-50%",
                        background: "conic-gradient(from 0deg, #7cf29c, #49b7ff, #b56bff, #ff5fa2, #ffb36b, #7cf29c)",
                        animation: "wc-spin 1.6s linear infinite",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                layout="position"
                style={{
                  position: "relative",
                  borderRadius: 28,
                  background: "linear-gradient(180deg, #1f1f22, #18181b)",
                  boxShadow: sent
                    ? "inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 60px -10px rgba(124,242,156,0.25)"
                    : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  padding: "26px 18px 18px",
                  transition: "box-shadow 0.6s",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 64,
                    height: 64,
                    margin: "0 auto",
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {sent ? (
                      <motion.span
                        key="ok"
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 14 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 32,
                          background: "radial-gradient(circle at 40% 35%, #b8ffcb, #34c759 60%, #1f8a3d)",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "0 0 40px rgba(52,199,89,0.55)",
                        }}
                      >
                        <Ico d={I.check} size={26} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="face"
                        exit={{ scale: 0.5, opacity: 0 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 32,
                          background: "#2a2a2e",
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                        }}
                      >
                        <img
                          src={avatar}
                          alt=""
                          width={44}
                          height={44}
                          draggable={false}
                          style={{ width: 44, height: 44 }}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {sent &&
                    !reduce &&
                    sparks.map((p, i) => (
                      <motion.span
                        key={`${wave}-${i}`}
                        aria-hidden="true"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(p.a) * p.r,
                          y: Math.sin(p.a) * p.r,
                          opacity: 0,
                          scale: 0.4,
                        }}
                        transition={{
                          duration: 0.9,
                          ease: [0.2, 0.8, 0.3, 1],
                          delay: 0.05,
                        }}
                        style={{
                          position: "absolute",
                          left: 32 - p.s / 2,
                          top: 32 - p.s / 2,
                          width: p.s,
                          height: p.s,
                          borderRadius: p.s,
                          background: ["#b8ffcb", "#fff", "#7cf29c"][i % 3],
                        }}
                      />
                    ))}
                </div>
                <div
                  aria-live="polite"
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "rgba(235,235,245,0.6)",
                    marginTop: 14,
                  }}
                >
                  {sent ? "Sent to " : "Sending to "}
                  <span style={{ color: "#f5f5f7" }}>{payee}</span>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 36,
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {money}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    padding: "2px 14px",
                  }}
                >
                  {rows.map(([k, v], i) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "11px 0",
                        borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none",
                        fontSize: 13.5,
                      }}
                    >
                      <span style={{ color: "rgba(235,235,245,0.5)" }}>{sent && k === "Arrives" ? "Arrived" : k}</span>
                      <span>{sent && k === "Arrives" ? time : v}</span>
                    </div>
                  ))}
                </div>
                <motion.button
                  type="button"
                  data-main
                  whileTap={{ scale: 0.97 }}
                  disabled={phase === "busy"}
                  onClick={() => {
                    touched.current = true;
                    if (phase === "ready") void confirm();
                    else if (sent) setSmall(true);
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 46,
                    marginTop: 14,
                    borderRadius: 23,
                    border: 0,
                    background: phase === "busy" ? "rgba(255,255,255,0.12)" : "#f5f5f7",
                    color: phase === "busy" ? "#f5f5f7" : "#111",
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: phase === "busy" ? "default" : "pointer",
                    transition: "background 0.3s, color 0.3s",
                    overflow: "hidden",
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={phase}
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -18, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {phase === "busy" && (
                        <motion.svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.2"
                            strokeWidth="2.6"
                          />
                          <path
                            d="M12 3 a9 9 0 0 1 9 9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                          />
                        </motion.svg>
                      )}
                      {phase === "ready" ? `Send ${money}` : phase === "busy" ? "Processing" : "Done"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <div
              key="pill"
              style={{
                width: "100%",
                maxWidth: 330,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <motion.div
                layoutId={`${uid}-c`}
                transition={spring}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  background: "#1f1f22",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <motion.span
                  layout="position"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                  }}
                >
                  <Ico d={I.check} size={18} />
                </motion.span>
                <motion.div
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Sent {money}</div>
                  <div style={{ fontSize: 13, color: "rgba(235,235,245,0.5)" }}>To {payee}</div>
                </motion.div>
                <motion.button
                  layout="position"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => {
                    touched.current = true;
                    setSmall(false);
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  style={{
                    height: 36,
                    padding: "0 16px",
                    borderRadius: 18,
                    border: 0,
                    background: "rgba(255,255,255,0.1)",
                    color: "#f5f5f7",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View
                </motion.button>
              </motion.div>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  touched.current = true;
                  reset();
                }}
                className="outline-none focus-visible:underline"
                style={{
                  border: 0,
                  background: "transparent",
                  color: "rgba(235,235,245,0.5)",
                  fontSize: 12.5,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  cursor: "pointer",
                }}
              >
                New payment
              </motion.button>
            </div>
          )}
        </LayoutGroup>

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
