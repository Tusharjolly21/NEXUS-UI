"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FocusNote = {
  id: string;
  from: string;
  text: string;
  time: string;
  color: string;
  allowed?: boolean;
};
export type FocusModeProps = {
  notes?: FocusNote[];
  /** notes that arrive later in the demo */
  incoming?: FocusNote[];
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

const I = {
  moon: "M235.54 150.21a104.84 104.84 0 0 1-37 52.91A104 104 0 0 1 32 120a103.1 103.1 0 0 1 20.88-62.52a104.84 104.84 0 0 1 52.91-37a8 8 0 0 1 10 10a88.08 88.08 0 0 0 109.8 109.8a8 8 0 0 1 10 10Z",
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

const DEFAULT_NOTES: FocusNote[] = [
  {
    id: "mom",
    from: "Mom",
    text: "Call me when you can",
    time: "now",
    color: "#a78bfa",
    allowed: true,
  },
  {
    id: "maya",
    from: "Maya",
    text: "Are you still coming tonight?",
    time: "now",
    color: "#f472b6",
  },
  {
    id: "omar",
    from: "Omar",
    text: "Sent you a file",
    time: "2m",
    color: "#fb923c",
  },
  {
    id: "launch",
    from: "Launch",
    text: "12 new replies",
    time: "4m",
    color: "#4ade80",
  },
];
const DEFAULT_INCOMING: FocusNote[] = [
  {
    id: "sam",
    from: "Sam",
    text: "Lunch tomorrow?",
    time: "now",
    color: "#60a5fa",
  },
  {
    id: "build",
    from: "Build bot",
    text: "Deploy finished",
    time: "now",
    color: "#facc15",
  },
];

// a soft little character: a squircle with two eyes that blink now and then
function Blob({ color, size, seed }: { color: string; size: number; seed: number }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t = 0;
    const loop = () => {
      t = window.setTimeout(
        () => {
          setBlink(true);
          window.setTimeout(() => setBlink(false), 140);
          loop();
        },
        2200 + ((seed * 977) % 2600),
      );
    };
    loop();
    return () => window.clearTimeout(t);
  }, [seed]);
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <path d="M20 2 C31 2 38 8 38 20 C38 32 31 38 20 38 C9 38 2 32 2 20 C2 8 9 2 20 2 Z" fill={color} />
      <path
        d="M20 2 C31 2 38 8 38 20 C38 24 37 27 35 29 C33 14 27 7 12 6 C14 3 17 2 20 2 Z"
        fill="rgba(255,255,255,0.22)"
      />
      <g fill="#1b1b1f">
        <rect x="13" y={blink ? 18 : 14} width="3.6" height={blink ? 1.6 : 7} rx="1.8" />
        <rect x="23.4" y={blink ? 18 : 14} width="3.6" height={blink ? 1.6 : 7} rx="1.8" />
      </g>
    </svg>
  );
}

/**
 * A focus switch that gathers your notifications. Turn Focus on and everyone who isn't allowed through leaves their
 * row: their little characters fly down into a stack on the Focus switch with a count, the rows fold away and the
 * card says notifications are silenced. Anything that arrives meanwhile peeks in and is pulled into the stack too.
 * Turn it off and they all come back to their rows. Click a person to let them through.
 */
export default function FocusMode({
  notes = DEFAULT_NOTES,
  incoming = DEFAULT_INCOMING,
  defaultOn = false,
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FocusModeProps) {
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
  const [items, setItems] = useState(notes);
  const [on, setOn] = useState(defaultOn);
  const onRef = useRef(on);
  onRef.current = on;
  const [peek, setPeek] = useState<string | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const nextIn = useRef(0);

  const toggle = (to: boolean) => {
    setOn(to);
    onChange?.(to);
    const n = items.filter((x) => !x.allowed).length;
    sfx.tick({ freq: to ? 1500 : 1100, gain: 0.05 });
    for (let i = 0; i < Math.min(6, n); i++)
      sfx.tick({
        at: 0.12 + i * 0.05,
        freq: to ? 900 - i * 60 : 700 + i * 80,
        gain: 0.02,
      });
    sfx.note(to ? 392 : 523, { at: 0.08, dur: 0.3, gain: 0.03, bell: 0.4 });
  };
  const allow = (id: string) => {
    setItems((l) => l.map((x) => (x.id === id ? { ...x, allowed: !x.allowed } : x)));
    sfx.tick({ freq: 2000, gain: 0.035 });
  };
  const arrive = (n: FocusNote) => {
    const id = `${n.id}-${Date.now()}`;
    setItems((l) => [{ ...n, id }, ...l.filter((x) => !x.id.startsWith(`${n.id}-`))]);
    sfx.note(880, { dur: 0.12, gain: 0.03 });
    if (onRef.current && !n.allowed) {
      setPeek(id);
      window.setTimeout(() => {
        setPeek(null);
        sfx.whoosh(1600, 600, { dur: 0.3, gain: 0.025 });
      }, 900);
    }
    return id;
  };

  // autoplay: focus on, a couple arrive and get swallowed, focus off
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
      const c = card.current;
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
      await wait(1300);
      while (ok()) {
        await go("[data-toggle]");
        await tap();
        toggle(true);
        setGhost(false);
        await wait(1800);
        if (!ok()) return;
        arrive(incoming[nextIn.current % incoming.length]);
        nextIn.current++;
        await wait(2000);
        if (!ok()) return;
        await go("[data-toggle]");
        await tap();
        toggle(false);
        setGhost(false);
        await wait(2600);
        setItems(notes);
        await wait(600);
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

  const rows = items.filter((x) => !on || x.allowed || x.id === peek);
  const held = on ? items.filter((x) => !x.allowed && x.id !== peek) : [];
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 360, damping: 30 };
  const seedOf = useMemo(() => (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0), []);

  return (
    <div
      className={`relative w-full max-w-[360px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#f5f5f7",
      }}
    >
      <motion.div
        ref={card}
        layout={!reduce}
        transition={spring}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "linear-gradient(180deg, #19191c, #141416)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.7)",
          padding: 10,
        }}
      >
        <LayoutGroup id={uid}>
          <AnimatePresence initial={false}>
            {on && (
              <motion.div
                key="silenced"
                layout={!reduce}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 34 }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring}
                style={{
                  textAlign: "center",
                  fontSize: 12.5,
                  color: "rgba(235,235,245,0.45)",
                  lineHeight: "34px",
                  overflow: "hidden",
                }}
              >
                Notifications silenced
              </motion.div>
            )}
          </AnimatePresence>
          <div role="list" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence initial={false}>
              {rows.map((n, i) => (
                <motion.div
                  key={n.id}
                  role="listitem"
                  layout={!reduce}
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: 64, scale: 1 }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    scale: 0.96,
                    transition: { duration: 0.25, delay: 0 },
                  }}
                  transition={{
                    ...spring,
                    delay: reduce ? 0 : on ? 0 : 0.05 + i * 0.05,
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      touched.current = true;
                      allow(n.id);
                    }}
                    aria-label={`${n.from}: ${n.text}. ${n.allowed ? "Allowed during Focus. Click to silence." : "Click to allow during Focus."}`}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-white/40 hover:bg-white/[0.03]"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      height: 64,
                      padding: "0 14px",
                      borderRadius: 20,
                      border: 0,
                      background: "#202023",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                      color: "inherit",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <motion.span
                      layoutId={`${uid}-b-${n.id}`}
                      transition={spring}
                      style={{
                        width: 34,
                        height: 34,
                        flex: "none",
                        display: "block",
                      }}
                    >
                      <Blob color={n.color} size={34} seed={seedOf(n.id)} />
                    </motion.span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{n.from}</span>
                        <AnimatePresence>
                          {n.allowed && (
                            <motion.span
                              key="a"
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              style={{
                                fontSize: 10.5,
                                fontWeight: 500,
                                color: "rgba(235,235,245,0.6)",
                                padding: "2px 7px",
                                borderRadius: 7,
                                background: "rgba(255,255,255,0.07)",
                              }}
                            >
                              Allowed
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 13,
                          color: "rgba(235,235,245,0.55)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {n.text}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "rgba(235,235,245,0.35)",
                        alignSelf: "flex-start",
                        marginTop: 14,
                      }}
                    >
                      {n.time}
                    </span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* the switch, holding whoever is waiting */}
            <motion.div
              layout={!reduce}
              transition={spring}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 64,
                padding: "0 12px 0 14px",
                borderRadius: 20,
                background: "#202023",
                boxShadow: on
                  ? "inset 0 0 0 1px rgba(167,139,250,0.25), 0 0 30px -10px rgba(167,139,250,0.35)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.05)",
                transition: "box-shadow 0.4s",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: on ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.07)",
                  color: on ? "#c4b5fd" : "rgba(235,235,245,0.7)",
                  display: "grid",
                  placeItems: "center",
                  transition: "background 0.3s, color 0.3s",
                  flex: "none",
                }}
              >
                <motion.span
                  animate={on && !reduce ? { rotate: [0, -18, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Ico d={I.moon} size={16} />
                </motion.span>
              </span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Focus</span>
              <AnimatePresence>
                {held.length > 0 && (
                  <motion.span
                    key="stack"
                    layout={!reduce}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.2, delay: 0.25 },
                    }}
                    transition={spring}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      height: 26,
                      padding: "0 8px 0 5px",
                      borderRadius: 13,
                      background: "rgba(255,255,255,0.07)",
                    }}
                  >
                    <span style={{ display: "flex" }}>
                      {held.map((n, i) => (
                        <motion.span
                          key={n.id}
                          layoutId={`${uid}-b-${n.id}`}
                          transition={{
                            ...spring,
                            delay: reduce ? 0 : i * 0.04,
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            marginLeft: i ? -7 : 0,
                            display: "block",
                            zIndex: held.length - i,
                          }}
                        >
                          <Blob color={n.color} size={18} seed={seedOf(n.id)} />
                        </motion.span>
                      ))}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 8,
                      }}
                    >
                      {held.length}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                type="button"
                data-toggle
                role="switch"
                aria-checked={on}
                aria-label="Focus"
                onClick={() => {
                  touched.current = true;
                  toggle(!on);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{
                  marginLeft: "auto",
                  position: "relative",
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  border: 0,
                  background: on ? "#f5f5f7" : "rgba(255,255,255,0.12)",
                  cursor: "pointer",
                  transition: "background 0.25s",
                  flex: "none",
                }}
              >
                <motion.span
                  initial={false}
                  animate={{ x: on ? 22 : 0 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 32 }}
                  style={{
                    position: "absolute",
                    left: 3,
                    top: 3,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: on ? "#141416" : "#f5f5f7",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </motion.div>
          </div>
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
      </motion.div>
    </div>
  );
}
