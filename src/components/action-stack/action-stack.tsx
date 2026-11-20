"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, type KeyboardEvent as RKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type StackAction = {
  id: string;
  label: string;
  icon: string;
  color: string;
};
export type ActionStackProps = {
  actions?: StackAction[];
  onAction?: (id: string) => void;
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
  plus: "M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12",
  receive:
    "m208.49 152.49l-72 72a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L116 187V40a12 12 0 0 1 24 0v147l51.51-51.52a12 12 0 0 1 17 17Z",
  send: "M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7",
  swap: "M120.49 167.51a12 12 0 0 1 0 17l-32 32a12 12 0 0 1-17 0l-32-32a12 12 0 1 1 17-17L68 179V48a12 12 0 0 1 24 0v131l11.51-11.52a12 12 0 0 1 16.98.03m96-96l-32-32a12 12 0 0 0-17 0l-32 32a12 12 0 0 0 17 17L164 77v131a12 12 0 0 0 24 0V77l11.51 11.52a12 12 0 0 0 17-17Z",
  bolt: "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
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

const DEFAULT_ACTIONS: StackAction[] = [
  { id: "receive", label: "Receive", icon: I.receive, color: "#ff8a3d" },
  { id: "send", label: "Send", icon: I.send, color: "#8b5cf6" },
  { id: "swap", label: "Swap", icon: I.swap, color: "#2f7bf6" },
];

const SPRING = { type: "spring", stiffness: 520, damping: 34 } as const;

/**
 * A plus button that opens into a short list of actions. Press it and the screen behind frosts over while the plus
 * turns into a close mark and the actions rise out of it one after another, each with its label. Point at one and
 * the others step back. Escape, or a click on the frost, closes it; the arrow keys move between actions.
 */
export default function ActionStack({
  actions = DEFAULT_ACTIONS,
  onAction,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: ActionStackProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const touched = useRef(false);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const fab = useRef<HTMLButtonElement>(null);
  const order = useMemo(() => [...actions], [actions]);

  const toggle = (v: boolean) => {
    setOpen(v);
    setHot(null);
    if (v) sfx.whoosh(500, 1400, { dur: 0.22, gain: 0.03 });
    else sfx.tick({ freq: 1600, gain: 0.025 });
  };
  const pick = (id: string) => {
    sfx.note(988, { dur: 0.14, gain: 0.035 });
    setLast(id);
    onAction?.(id);
    toggle(false);
    fab.current?.focus();
  };

  useEffect(() => {
    if (open) requestAnimationFrame(() => btns.current[order.length - 1]?.focus());
  }, [open, order.length]);

  const onKey = (e: RKeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      toggle(false);
      fab.current?.focus();
      return;
    }
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const i = btns.current.findIndex((b) => b === document.activeElement);
    const n = order.length;
    const next = e.key === "ArrowUp" ? (i <= 0 ? n - 1 : i - 1) : i < 0 || i >= n - 1 ? 0 : i + 1;
    btns.current[next]?.focus();
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await wait(1200);
        if (!ok()) break;
        toggle(true);
        await wait(900);
        for (const a of [order[order.length - 1], order[1] ?? order[0]]) {
          if (!ok()) break;
          setHot(a.id);
          await wait(700);
        }
        if (!ok()) break;
        setHot(null);
        await wait(500);
        if (!ok()) break;
        toggle(false);
        await wait(2400);
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

  const lastLabel = order.find((a) => a.id === last)?.label;

  return (
    <div
      className={`w-full ${className}`}
      style={{
        maxWidth: 400,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif",
      }}
    >
      <div
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        onKeyDown={onKey}
        style={{
          position: "relative",
          height: 380,
          borderRadius: 28,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        {/* the screen behind */}
        <div aria-hidden={open} style={{ padding: 22, color: "#1d1d1f" }}>
          <div style={{ fontSize: 13, color: "#86868b" }}>Total balance</div>
          <div
            className="tabular-nums"
            style={{
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              marginTop: 2,
            }}
          >
            $12,480<span style={{ color: "#c7c7cc" }}>.32</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 22,
            }}
          >
            {[
              ["Spending", "$1,204", ".25"],
              ["Savings", "$3,498", ".41"],
            ].map(([t, a, c]) => (
              <div
                key={t}
                style={{
                  borderRadius: 18,
                  background: "#f5f5f7",
                  padding: "14px 14px 16px",
                }}
              >
                <div style={{ fontSize: 12, color: "#86868b" }}>{t}</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginTop: 4,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {a}
                  <span style={{ color: "#aeaeb2" }}>{c}</span>
                </div>
              </div>
            ))}
            <div
              style={{
                gridColumn: "1 / span 2",
                borderRadius: 18,
                background: "#f5f5f7",
                padding: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  background: "#fff",
                  display: "grid",
                  placeItems: "center",
                  color: "#2f7bf6",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
                }}
              >
                <Ico d={I.bolt} size={16} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Earn up to 4.1% on savings</div>
                <div style={{ fontSize: 12, color: "#86868b", marginTop: 1 }}>Paid daily, withdraw any time</div>
              </div>
            </div>
          </div>
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              left: 22,
              bottom: 30,
              fontSize: 13,
              color: "#6e6e73",
              height: 18,
            }}
          >
            <AnimatePresence mode="wait">
              {lastLabel && (
                <motion.span
                  key={last}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{ display: "block" }}
                >
                  Opened {lastLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* frost */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="frost"
              onClick={() => toggle(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(14px) saturate(1.4)",
                WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              }}
            />
          )}
        </AnimatePresence>

        {/* actions */}
        <div
          role="menu"
          aria-label="Actions"
          aria-hidden={!open}
          style={{
            position: "absolute",
            right: 22,
            bottom: 92,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <AnimatePresence>
            {open &&
              order.map((a, i) => {
                const fromEnd = order.length - 1 - i;
                const dim = hot !== null && hot !== a.id;
                return (
                  <motion.button
                    key={a.id}
                    ref={(el) => {
                      btns.current[i] = el;
                    }}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      touched.current = true;
                      pick(a.id);
                    }}
                    onPointerEnter={() => setHot(a.id)}
                    onPointerLeave={() => setHot(null)}
                    onFocus={() => setHot(a.id)}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: 26 + fromEnd * 10,
                            scale: 0.7,
                            filter: "blur(6px)",
                          }
                    }
                    animate={{
                      opacity: dim ? 0.35 : 1,
                      y: 0,
                      scale: hot === a.id ? 1.04 : 1,
                      filter: "blur(0px)",
                    }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: 18 + fromEnd * 8,
                            scale: 0.8,
                            filter: "blur(4px)",
                            transition: { duration: 0.16, delay: i * 0.025 },
                          }
                    }
                    transition={{
                      ...SPRING,
                      delay: hot === null && !dim ? fromEnd * 0.045 : 0,
                      filter: {
                        type: "tween",
                        duration: 0.25,
                        delay: fromEnd * 0.045,
                      },
                      opacity: { duration: 0.18 },
                    }}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      border: 0,
                      background: "transparent",
                      padding: "10px 6px 10px 14px",
                      borderRadius: 16,
                      cursor: "pointer",
                      transformOrigin: "100% 50%",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 19,
                        fontWeight: 500,
                        color: "#1d1d1f",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {a.label}
                    </span>
                    <span
                      style={{
                        width: 30,
                        display: "grid",
                        placeItems: "center",
                        color: a.color,
                      }}
                    >
                      <Ico d={a.icon} size={26} />
                    </span>
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </div>

        {/* the button */}
        <motion.button
          ref={fab}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={open ? "Close actions" : "Open actions"}
          onClick={() => {
            touched.current = true;
            toggle(!open);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" && !open) {
              e.preventDefault();
              toggle(true);
            }
          }}
          whileTap={{ scale: 0.92 }}
          animate={{
            width: open ? 46 : 58,
            height: open ? 46 : 58,
            right: open ? 28 : 22,
            bottom: open ? 28 : 22,
            background: open ? "#ffffff" : "#111113",
            color: open ? "#1d1d1f" : "#ffffff",
            boxShadow: open
              ? "0 0 0 1px rgba(0,0,0,0.08), 0 8px 18px -10px rgba(0,0,0,0.4)"
              : "0 0 0 1px rgba(0,0,0,0), 0 14px 26px -12px rgba(0,0,0,0.55)",
          }}
          transition={SPRING}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{
            position: "absolute",
            borderRadius: 999,
            border: 0,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <motion.span
            animate={{ rotate: open ? 135 : 0, scale: open ? 0.82 : 1 }}
            transition={SPRING}
            style={{ display: "grid" }}
          >
            <Ico d={I.plus} size={22} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
