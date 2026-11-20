"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type InviteRevealProps = {
  code?: string;
  ready?: string;
  label?: string;
  onCopy?: (code: string) => void;
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
  down: "m208.49 152.49l-72 72a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L116 187V40a12 12 0 0 1 24 0v147l51.51-51.52a12 12 0 0 1 17 17Z",
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

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
const GREEN = "#2fbf5b";

/**
 * An invite code that arrives like a ticket. Press the green button and the pill splits in two: the message lifts
 * away as a small label, and a perforated ticket opens underneath with the code writing itself in, letter by
 * letter. The green button becomes Copy, which turns into Copied with a tick. Press the label to fold it back.
 */
export default function InviteReveal({
  code = "NORTHWIND-24",
  ready = "Your invite is ready",
  label = "Your invite code",
  onCopy,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: InviteRevealProps) {
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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const touched = useRef(false);

  const reveal = (v: boolean) => {
    setOpen(v);
    setCopied(false);
    if (v) {
      sfx.whoosh(500, 1500, { dur: 0.25, gain: 0.035 });
      [...code].forEach((_, i) => sfx.tick({ freq: 2600 + i * 40, gain: 0.01, at: 0.25 + i * 0.035 }));
    } else sfx.tick({ freq: 1400, gain: 0.025 });
  };
  const copy = () => {
    try {
      navigator.clipboard?.writeText(code).catch(() => {
        /* permission denied: the button still shows its copied state */
      });
    } catch {
      /* not allowed here */
    }
    setCopied(true);
    onCopy?.(code);
    sfx.note(1318, { dur: 0.14, gain: 0.04 });
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await wait(1400);
        if (!ok()) break;
        reveal(true);
        await wait(1900);
        if (!ok()) break;
        copy();
        await wait(2200);
        if (!ok()) break;
        reveal(false);
        await wait(1200);
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
  const H = 68;

  return (
    <div
      className={`w-full ${className}`}
      style={{ maxWidth: 440, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div
        style={{
          position: "relative",
          height: 300,
          borderRadius: 28,
          background: "#f5f5f7",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        <LayoutGroup id={uid}>
          <div
            style={{
              width: 340,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 10,
            }}
          >
            {/* the message, which becomes the label */}
            <motion.button
              layout
              type="button"
              disabled={!open}
              onClick={() => {
                touched.current = true;
                reveal(false);
              }}
              aria-label={open ? "Hide the code" : undefined}
              transition={SPRING}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
              style={{
                position: "relative",
                height: open ? 48 : H,
                borderRadius: 999,
                border: 0,
                background: "#fff",
                boxShadow: "0 0 0 5px rgba(255,255,255,0.7), 0 14px 30px -18px rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "center" : "space-between",
                padding: open ? "0 18px" : "0 8px 0 28px",
                cursor: open ? "pointer" : "default",
                fontFamily: font,
                order: 0,
              }}
            >
              <motion.span
                layout="position"
                transition={SPRING}
                style={{
                  fontSize: open ? 15 : 19,
                  fontWeight: open ? 500 : 650,
                  color: open ? "#86868b" : "#1d1d1f",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={open ? "l" : "r"}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "tween", duration: 0.22 }}
                    style={{ display: "inline-block" }}
                  >
                    {open ? label : ready}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
              {!open && (
                <motion.span
                  layoutId="go"
                  role="button"
                  tabIndex={0}
                  aria-label="Reveal the invite code"
                  onClick={(e) => {
                    e.stopPropagation();
                    touched.current = true;
                    reveal(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      reveal(true);
                    }
                  }}
                  transition={SPRING}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 999,
                    background: GREEN,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    boxShadow: "inset 0 -4px 10px rgba(0,0,0,0.12)",
                  }}
                >
                  <Ico d={I.down} size={22} />
                </motion.span>
              )}
            </motion.button>

            {/* the ticket */}
            <AnimatePresence>
              {open && (
                <motion.div
                  key="ticket"
                  layout
                  initial={{ opacity: 0, y: -46, scaleY: 0.6 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{
                    opacity: 0,
                    y: -40,
                    scaleY: 0.7,
                    transition: { duration: 0.18 },
                  }}
                  transition={SPRING}
                  style={{
                    position: "relative",
                    height: H,
                    borderRadius: 999,
                    background: "#fff",
                    boxShadow: "0 0 0 5px rgba(255,255,255,0.7), 0 14px 30px -18px rgba(0,0,0,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 12px 0 28px",
                    transformOrigin: "50% 0%",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 5,
                      borderRadius: 999,
                      border: "3px dotted #e2e2e7",
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    aria-live="polite"
                    style={{
                      position: "relative",
                      fontSize: 21,
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      color: "#1d1d1f",
                      display: "inline-flex",
                      whiteSpace: "pre",
                    }}
                  >
                    <span className="sr-only">{code}</span>
                    {[...code].map((ch, i) => (
                      <motion.span
                        key={i}
                        aria-hidden
                        initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          type: "tween",
                          duration: 0.3,
                          delay: 0.22 + i * 0.035,
                        }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </span>
                  <motion.button
                    layoutId="go"
                    type="button"
                    onClick={() => {
                      touched.current = true;
                      copy();
                    }}
                    transition={SPRING}
                    whileTap={{ scale: 0.95 }}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                    style={{
                      position: "relative",
                      height: 44,
                      borderRadius: 999,
                      background: copied ? "#1d1d1f" : GREEN,
                      color: "#fff",
                      border: 0,
                      padding: "0 18px",
                      fontSize: 15,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      fontFamily: font,
                      boxShadow: "inset 0 -4px 10px rgba(0,0,0,0.12)",
                      transition: "background-color .25s",
                    }}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={copied ? "y" : "n"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={SPRING}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {copied && <Ico d={I.check} size={14} />}
                        {copied ? "Copied" : "Copy"}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
