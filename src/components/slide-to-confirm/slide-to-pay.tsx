"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SlideToPayProps = {
  payee?: string;
  note?: string;
  amount?: number;
  currency?: string;
  from?: string;
  arrives?: string;
  /** called when the slide completes; resolve when the payment is done */
  onSend?: () => Promise<void> | void;
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
  caret: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
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

const KNOB = 48;
const PAD = 4;

/**
 * A payment you confirm by sliding. Drag the knob along the track and the track fills behind it while the label
 * fades; let go early and it springs back with a little bounce. Reach the end and the whole track pulls in to a
 * circle under your thumb, spins while it sends and turns into a tick, as the words beside it change from Sending to
 * Sent. The knob also works with the keyboard.
 */
export default function SlideToPay({
  payee = "Emily Parker",
  note = "Concert tickets",
  amount = 240,
  currency = "$",
  from = "Everyday debit 4821",
  arrives = "Instantly",
  onSend,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SlideToPayProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(300);
  const x = useMotionValue(0);
  const max = Math.max(1, w - KNOB - PAD * 2);
  const fill = useTransform(x, (v) => v + KNOB + PAD);
  const labelO = useTransform(x, [0, max * 0.5], [1, 0]);
  const lastStep = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const first = payee.split(" ")[0];
  const money = `${currency}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const short = `${currency}${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const commit = async () => {
    if (phaseRef.current !== "idle") return;
    setPhase("sending");
    animate(x, max, reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 });
    sfx.tick({ freq: 1400, gain: 0.05 });
    sfx.whoosh(600, 1800, { dur: 0.4, gain: 0.03 });
    const t0 = performance.now();
    await onSend?.();
    const left = 1300 - (performance.now() - t0);
    if (left > 0) await new Promise((r) => setTimeout(r, left));
    setPhase("sent");
    sfx.note(659, { dur: 0.2, gain: 0.04, bell: 0.5 });
    sfx.note(988, { at: 0.12, dur: 0.45, gain: 0.04, bell: 0.6 });
  };
  const again = () => {
    setPhase("idle");
    x.set(0);
  };
  const release = () => {
    if (x.get() >= max * 0.86) void commit();
    else {
      animate(x, 0, reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18 });
      if (x.get() > 8) sfx.tick({ freq: 700, gain: 0.03 });
    }
  };

  // dragging by hand, so the knob can be rubber-banded past the end
  const drag = useRef<{ px: number; x0: number } | null>(null);

  // autoplay: a half-hearted slide that springs back, then the real one
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const pos = (sel: string) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return [0, 0] as const;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return [r.left - cb.left + r.width / 2, r.top - cb.top + r.height / 2] as const;
    };
    const run = async () => {
      await wait(1100);
      while (ok()) {
        const [kx, ky] = pos("[data-knob]");
        setGhost(true);
        await Promise.all([animate(gx, kx, { duration: 0.6 }), animate(gy, ky, { duration: 0.6 })]);
        setGhostDown(true);
        const m = (track.current?.clientWidth ?? 300) - KNOB - PAD * 2;
        await animate(0, m * 0.5, {
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1],
          onUpdate: (v) => {
            x.set(v);
            gx.set(kx + v);
          },
        });
        setGhostDown(false);
        release();
        await animate(gx, kx, { duration: 0.5 });
        await wait(700);
        if (!ok()) return;
        setGhostDown(true);
        await animate(0, m, {
          duration: 0.9,
          ease: [0.5, 0, 0.3, 1],
          onUpdate: (v) => {
            x.set(v);
            gx.set(kx + v);
          },
        });
        setGhostDown(false);
        setGhost(false);
        release();
        await wait(3400);
        if (!ok()) return;
        again();
        await wait(1200);
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

  const busy = phase !== "idle";
  const orb = useMemo(() => "conic-gradient(from 200deg, #7cf29c, #49b7ff, #b56bff, #ff5fa2, #ffb36b, #7cf29c)", []);

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
          borderRadius: 28,
          background: "#1b1b1d",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07), 0 30px 60px -30px rgba(0,0,0,0.6)",
          padding: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.span
            aria-hidden="true"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              background: orb,
              filter: "blur(0.3px) saturate(1.2)",
              flex: "none",
              boxShadow: "inset 0 0 12px rgba(255,255,255,0.35)",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 500 }}>{payee}</div>
            <div style={{ fontSize: 13.5, color: "rgba(235,235,245,0.55)" }}>{note}</div>
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {money}
          </div>
        </div>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "18px 0 14px",
          }}
        />
        {[
          ["From", from],
          ["Arrives", arrives],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13.5,
              padding: "4px 0",
            }}
          >
            <span style={{ color: "rgba(235,235,245,0.5)" }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}

        {/* the slider */}
        <div
          ref={track}
          style={{
            position: "relative",
            height: KNOB + PAD * 2,
            marginTop: 18,
          }}
        >
          <motion.div
            initial={false}
            animate={{
              left: busy ? `calc(100% - ${KNOB + PAD * 2}px)` : "0%",
              backgroundColor: phase === "sent" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
            }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: busy ? 0.08 : 0,
                  }
            }
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              borderRadius: 999,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}
          >
            {!busy && (
              <motion.div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: fill,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.16))",
                }}
              />
            )}
            <AnimatePresence>
              {!busy && (
                <motion.span
                  key="label"
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    paddingLeft: KNOB,
                    fontSize: 14,
                    fontWeight: 500,
                    opacity: labelO,
                    color: "transparent",
                    backgroundImage:
                      "linear-gradient(90deg, rgba(235,235,245,0.4) 0%, rgba(255,255,255,0.95) 50%, rgba(235,235,245,0.4) 100%)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    animation: reduce ? undefined : "stp-shine 2.4s linear infinite",
                    pointerEvents: "none",
                  }}
                >
                  Slide to send {short}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          <style>{`@keyframes stp-shine { from { background-position: 150% 0 } to { background-position: -50% 0 } }`}</style>

          <AnimatePresence>
            {busy && (
              <motion.span
                key={phase}
                initial={{ opacity: 0, x: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.3, delay: 0.15 }}
                aria-live="polite"
                style={{
                  position: "absolute",
                  right: KNOB + PAD * 2 + 14,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 14.5,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {phase === "sending" ? "Sending" : `Sent to ${first}`}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            data-knob
            role="slider"
            aria-label={`Slide to send ${short} to ${payee}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={phase === "idle" ? 0 : 100}
            disabled={busy}
            onPointerDown={(e) => {
              if (busy) return;
              touched.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { px: e.clientX, x0: x.get() };
              x.stop();
              lastStep.current = 0;
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              let v = d.x0 + e.clientX - d.px;
              if (v < 0) v *= 0.25;
              if (v > max) v = max + (v - max) * 0.2;
              x.set(v);
              const step = Math.floor((Math.max(0, Math.min(max, v)) / max) * 10);
              if (step !== lastStep.current) {
                lastStep.current = step;
                sfx.tick({ freq: 900 + step * 90, gain: 0.018 });
              }
            }}
            onPointerUp={() => {
              if (!drag.current) return;
              drag.current = null;
              release();
            }}
            onPointerCancel={() => {
              drag.current = null;
              release();
            }}
            onKeyDown={(e) => {
              if (busy) return;
              if (e.key === "Enter" || e.key === " " || e.key === "End") {
                e.preventDefault();
                touched.current = true;
                void commit();
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                animate(x, Math.min(max, x.get() + max / 4), {
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                });
                if (x.get() + max / 4 >= max * 0.86) void commit();
              }
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{
              position: "absolute",
              left: PAD,
              top: PAD,
              width: KNOB,
              height: KNOB,
              borderRadius: KNOB / 2,
              border: 0,
              x,
              background: phase === "sent" ? "rgba(255,255,255,0.22)" : "#f5f5f7",
              color: phase === "sent" ? "#fff" : "#111",
              display: "grid",
              placeItems: "center",
              cursor: busy ? "default" : "grab",
              touchAction: "none",
              boxShadow: "0 4px 14px -4px rgba(0,0,0,0.5)",
              transition: "background 0.35s, color 0.35s",
              zIndex: 2,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {phase === "idle" ? (
                <motion.span
                  key="c"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Ico d={I.caret} size={18} />
                </motion.span>
              ) : phase === "sending" ? (
                <motion.svg
                  key="s"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    rotate: { duration: 0.8, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 0.2 },
                  }}
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.15"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M12 3 a9 9 0 0 1 9 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </motion.svg>
              ) : (
                <motion.span
                  key="k"
                  initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 16 }}
                >
                  <Ico d={I.check} size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "rgba(235,235,245,0.4)",
            marginTop: 16,
            height: 18,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === "sent" ? (
              <motion.button
                key="again"
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  touched.current = true;
                  again();
                }}
                className="outline-none focus-visible:underline"
                style={{
                  border: 0,
                  background: "transparent",
                  color: "rgba(235,235,245,0.7)",
                  fontSize: 12,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Send another
              </motion.button>
            ) : (
              <motion.span key="demo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Demo transfer. No money moves.
              </motion.span>
            )}
          </AnimatePresence>
        </div>

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
