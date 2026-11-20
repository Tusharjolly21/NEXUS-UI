"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type NotchSendProps = {
  to?: string;
  from?: string;
  subject?: string;
  body?: string;
  /** seconds you have to take it back */
  undoSeconds?: number;
  wallpaper?: string;
  onSent?: () => void;
  onUndo?: () => void;
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
  send: "M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7",
  up: "M208.49 120.49a12 12 0 0 1-17 0L140 69v147a12 12 0 0 1-24 0V69l-51.51 51.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0l72 72a12 12 0 0 1 0 17",
  undo: "M228 128a100 100 0 0 1-98.66 100H128a99.4 99.4 0 0 1-68.62-27.29a12 12 0 0 1 16.48-17.45a76 76 0 1 0-1.57-109c-.13.13-.25.25-.39.37L54.89 92H72a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12V56a12 12 0 0 1 24 0v20.72l21.48-19.66A100 100 0 0 1 228 128",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  aa: "M87.24 52.59a8 8 0 0 0-14.48 0l-64 136a8 8 0 1 0 14.48 6.81L39.9 160h80.2l16.66 35.4a8 8 0 1 0 14.48-6.81ZM47.43 144L80 74.79L112.57 144ZM200 96c-12.76 0-22.73 3.47-29.63 10.32a8 8 0 0 0 11.26 11.36c3.8-3.77 10-5.68 18.37-5.68c13.23 0 24 9 24 20v3.22a42.76 42.76 0 0 0-24-7.22c-22.06 0-40 16.15-40 36s17.94 36 40 36a42.73 42.73 0 0 0 24-7.25a8 8 0 0 0 16-.75v-60c0-19.85-17.94-36-40-36m0 88c-13.23 0-24-9-24-20s10.77-20 24-20s24 9 24 20s-10.77 20-24 20",
  clip: "M209.66 122.34a8 8 0 0 1 0 11.32l-82.05 82a56 56 0 0 1-79.2-79.21l99.26-100.72a40 40 0 1 1 56.61 56.55L105 193a24 24 0 1 1-34-34l83.3-84.62a8 8 0 1 1 11.4 11.22l-83.31 84.71a8 8 0 1 0 11.27 11.36L192.93 81A24 24 0 1 0 159 47L59.76 147.68a40 40 0 1 0 56.53 56.62l82.06-82a8 8 0 0 1 11.31.04",
  smile:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88M80 108a12 12 0 1 1 12 12a12 12 0 0 1-12-12m96 0a12 12 0 1 1-12-12a12 12 0 0 1 12 12m-1.07 48c-10.29 17.79-27.4 28-46.93 28s-36.63-10.2-46.92-28a8 8 0 1 1 13.84-8c7.47 12.91 19.21 20 33.08 20s25.61-7.1 33.07-20a8 8 0 0 1 13.86 8",
  img: "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v102.75l-26.07-26.06a16 16 0 0 0-22.63 0l-20 20l-44-44a16 16 0 0 0-22.62 0L40 149.37V56ZM40 172l52-52l80 80H40Zm176 28h-21.37l-36-36l20-20L216 181.38zm-72-100a12 12 0 1 1 12 12a12 12 0 0 1-12-12",
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

const WALL = "/images/motion-kit/photos/dunes-at-dusk.jpg";
const BODY =
  "Hi Nora,\n\nThanks for walking us through the new floor plan today. The second option works best for the team, so let's go ahead with it. Could you send the updated drawings by Friday?\n\nBest,\nSam";
const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
type Phase = "draft" | "sending" | "sent";

/**
 * Sending an email that leaves through the notch. Press Send and the message shrinks and flies up into the camera
 * notch, which stretches into a status bar: Sending on one side, a red Undo with the seconds counting down on the
 * other. Undo and the message drops back out of the notch, as you left it. Let the time run out and the bar says
 * Sent before folding away.
 */
export default function NotchSend({
  to = "nora@atelierlund.com",
  from = "sam@fieldwork.studio",
  subject = "Floor plan",
  body = BODY,
  undoSeconds = 6,
  wallpaper = WALL,
  onSent,
  onUndo,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: NotchSendProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [phase, setPhase] = useState<Phase>("draft");
  const [left, setLeft] = useState(undoSeconds);
  const [round, setRound] = useState(0);
  const touched = useRef(false);
  const phaseRef = useRef<Phase>("draft");
  phaseRef.current = phase;
  const lines = useMemo(() => body.split("\n"), [body]);

  const send = () => {
    if (phaseRef.current !== "draft") return;
    setLeft(undoSeconds);
    setPhase("sending");
    sfx.whoosh(400, 2200, { dur: 0.35, gain: 0.05 });
  };
  const undo = () => {
    if (phaseRef.current !== "sending") return;
    setPhase("draft");
    sfx.whoosh(1800, 400, { dur: 0.3, gain: 0.04 });
    onUndo?.();
  };

  useEffect(() => {
    if (phase !== "sending") return;
    if (left <= 0) {
      setPhase("sent");
      sfx.note(1175, { dur: 0.25, gain: 0.04, bell: 0.5 });
      onSent?.();
      return;
    }
    const t = setTimeout(() => {
      setLeft((l) => l - 1);
      sfx.tick({ freq: 2200, gain: 0.015 });
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left]);

  useEffect(() => {
    if (phase !== "sent") return;
    const t = setTimeout(() => {
      setPhase("draft");
      setRound((r) => r + 1);
    }, 2200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await wait(1600);
        if (!ok()) break;
        send();
        await wait(2600);
        if (!ok()) break;
        undo();
        await wait(2200);
        if (!ok()) break;
        send();
        await wait((undoSeconds + 4) * 1000);
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
  const wide = phase !== "draft";
  const away = phase !== "draft";

  return (
    <div
      className={`@container w-full ${className}`}
      style={{ maxWidth: 620, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div
        style={{
          position: "relative",
          height: 400,
          borderRadius: 24,
          overflow: "hidden",
          background: "#0b0b0c",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 30px 60px -34px rgba(0,0,0,0.6)",
        }}
      >
        <img
          src={wallpaper}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0) 30%)",
          }}
        />

        {/* the notch */}
        <motion.div
          initial={false}
          animate={{ width: wide ? 300 : 150, height: wide ? 40 : 26 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          style={{
            position: "absolute",
            left: "50%",
            x: "-50%",
            top: 0,
            background: "#000",
            borderRadius: "0 0 16px 16px",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 6px 0 14px",
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: 9,
              width: 7,
              height: 7,
              marginLeft: -3.5,
              borderRadius: 9,
              background: "#1a1a22",
              boxShadow: "inset 0 0 0 1.5px #23232c",
            }}
          />
          <AnimatePresence>
            {wide && (
              <motion.div
                key="st"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px)",
                  transition: { duration: 0.12 },
                }}
                transition={{ type: "tween", duration: 0.25, delay: 0.18 }}
                aria-live="polite"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingTop: 2,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    color: phase === "sent" ? "#30d158" : "#f5f5f7",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={phase}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      {phase === "sent" ? (
                        <Ico d={I.check} size={13} />
                      ) : (
                        <motion.span
                          animate={reduce ? undefined : { y: [1, -2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.1 }}
                          style={{ display: "grid" }}
                        >
                          <Ico d={I.up} size={13} />
                        </motion.span>
                      )}
                      {phase === "sent" ? "Sent" : "Sending"}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <AnimatePresence>
                  {phase === "sending" && (
                    <motion.button
                      key="undo"
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        undo();
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileTap={{ scale: 0.94 }}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-white"
                      style={{
                        height: 28,
                        borderRadius: 999,
                        border: 0,
                        background: "rgba(255,69,58,0.2)",
                        color: "#ff6961",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 10px 0 9px",
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                    >
                      <span
                        className="tabular-nums"
                        style={{
                          position: "relative",
                          width: 9,
                          height: 16,
                          overflow: "hidden",
                          opacity: 0.75,
                        }}
                      >
                        <AnimatePresence initial={false}>
                          <motion.span
                            key={left}
                            initial={{ y: 14, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -14, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              lineHeight: "16px",
                            }}
                          >
                            {left}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      Undo
                      <Ico d={I.undo} size={12} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* the message */}
        <motion.div
          key={round}
          role="group"
          aria-label="New message"
          aria-hidden={away}
          initial={round > 0 ? { opacity: 0, y: 30, scale: 0.96 } : false}
          animate={
            away
              ? {
                  y: -232,
                  scale: 0.08,
                  opacity: 0,
                  filter: "blur(6px)",
                  borderRadius: 120,
                }
              : {
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                  borderRadius: 18,
                }
          }
          transition={
            away
              ? {
                  type: "spring",
                  stiffness: 120,
                  damping: 22,
                  opacity: { duration: 0.5, delay: 0.15 },
                  filter: { type: "tween", duration: 0.4 },
                  borderRadius: { duration: 0.3 },
                }
              : { ...SPRING, filter: { type: "tween", duration: 0.3 } }
          }
          style={{
            position: "absolute",
            left: "clamp(12px, 6.5%, 40px)",
            right: "clamp(12px, 6.5%, 40px)",
            top: 46,
            bottom: 26,
            background: "#ffffff",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.04)",
            padding: "14px 18px 12px",
            display: "flex",
            flexDirection: "column",
            transformOrigin: "50% 0%",
            pointerEvents: away ? "none" : "auto",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              fontSize: 12.5,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#f2f2f4",
                borderRadius: 999,
                padding: "4px 10px 4px 8px",
                minWidth: 0,
              }}
            >
              <span style={{ color: "#86868b" }}>To</span>
              <span
                style={{ color: "#1d1d1f", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {to}
              </span>
            </span>
            <span className="hidden @[420px]:inline" style={{ color: "#86868b", whiteSpace: "nowrap" }}>
              From <span style={{ color: "#1d1d1f" }}>{from}</span>
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#1d1d1f",
              marginTop: 12,
              paddingBottom: 10,
              borderBottom: "1px solid #f0f0f2",
            }}
          >
            <span style={{ color: "#86868b" }}>Subject </span>
            {subject}
          </div>
          <div
            style={{
              flex: 1,
              fontSize: 12.5,
              lineHeight: 1.55,
              color: "#3a3a3c",
              marginTop: 10,
              overflow: "hidden",
            }}
          >
            {lines.map((l, i) => (
              <div key={i} style={{ minHeight: l ? undefined : 9 }}>
                {l}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <span style={{ display: "inline-flex", gap: 4, color: "#8e8e93" }}>
              {[I.aa, I.img, I.smile, I.clip].map((d, i) => (
                <span
                  key={i}
                  className={i > 1 ? "hidden @[420px]:grid" : "grid"}
                  style={{
                    width: 28,
                    height: 28,
                    placeItems: "center",
                    borderRadius: 8,
                  }}
                >
                  <Ico d={d} size={15} />
                </span>
              ))}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{
                  height: 32,
                  border: 0,
                  background: "transparent",
                  color: "#1d1d1f",
                  fontSize: 13,
                  padding: "0 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: font,
                }}
              >
                Discard
              </button>
              <motion.button
                type="button"
                onClick={() => {
                  touched.current = true;
                  send();
                }}
                whileTap={{ scale: 0.95 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{
                  height: 32,
                  border: 0,
                  background: "#0071e3",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "0 14px 0 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: font,
                }}
              >
                <Ico d={I.send} size={14} />
                Send
              </motion.button>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
