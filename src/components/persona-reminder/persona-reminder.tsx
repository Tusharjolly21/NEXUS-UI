"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Persona = {
  id: string;
  name: string;
  mood: string;
  avatar: string;
  message: string;
  chime: number[];
};
export type PersonaReminderProps = {
  task?: string;
  when?: string;
  repeat?: string;
  personas?: Persona[];
  defaultPersona?: string;
  onPersonaChange?: (id: string) => void;
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

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "caring",
    name: "Nana June",
    mood: "Caring",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20white%20hair/Dark/3D/woman_white_hair_3d_dark.png",
    message: "Morning, love. Yoshi's flea drops are due today. Warm the bottle in your hand first, he hates it cold.",
    chime: [660, 880],
  },
  {
    id: "strict",
    name: "Coach Dee",
    mood: "Strict",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
    message: "Flea drops. Yoshi. Now. This one does not get snoozed.",
    chime: [523, 523],
  },
  {
    id: "dramatic",
    name: "Marguerite",
    mood: "Dramatic",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20red%20hair/Light/3D/woman_red_hair_3d_light.png",
    message: "The fleas are plotting, darling. Only you can save Yoshi today. The drops. Go.",
    chime: [440, 554, 659],
  },
  {
    id: "cheerful",
    name: "Sunny",
    mood: "Cheerful",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20blonde%20hair/Light/3D/woman_blonde_hair_3d_light.png",
    message: "Drops day! Yoshi gets his flea stuff and you get a gold star for remembering.",
    chime: [784, 988, 1175],
  },
];

/** a sentence that rewrites itself: the old words drift off one by one and the new ones settle in after them */
function Rewrite({ text, reduce }: { text: string; reduce: boolean }) {
  const words = text.split(" ");
  return (
    <span style={{ position: "relative", display: "block" }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.span key={text} style={{ display: "block" }}>
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 5, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: -4,
                      filter: "blur(4px)",
                      transition: {
                        type: "tween",
                        duration: 0.16,
                        delay: i * 0.008,
                      },
                    }
              }
              transition={{
                type: "tween",
                duration: 0.32,
                delay: i * 0.026,
                ease: [0.25, 0.8, 0.3, 1],
              }}
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * A reminder that sounds like someone. Pick who reminds you and the notification above rewrites itself in their
 * voice, word by word, while their face swaps in. Preview drops the notification in the way it will arrive, with
 * that persona's own chime. The personas are a radio group, so arrow keys move between them.
 */
export default function PersonaReminder({
  task = "Give Yoshi his flea drops",
  when = "Mon 18 May, 6:00 AM",
  repeat = "Every month",
  personas = DEFAULT_PERSONAS,
  defaultPersona,
  onPersonaChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PersonaReminderProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [pid, setPid] = useState(defaultPersona ?? personas[0].id);
  const [drop, setDrop] = useState(0);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const p = personas.find((x) => x.id === pid) ?? personas[0];
  const idx = personas.findIndex((x) => x.id === p.id);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const chime = (who: Persona) =>
    who.chime.forEach((f, i) => sfx.note(f, { at: i * 0.11, dur: 0.5, gain: 0.07, bell: 0.35 }));
  const choose = (id: string) => {
    if (id === pid) return;
    setPid(id);
    onPersonaChange?.(id);
    sfx.tick({ freq: 2000, gain: 0.015 });
  };
  const preview = () => {
    setDrop((d) => d + 1);
    chime(p);
  };
  const onKey = (e: KeyboardEvent) => {
    const d =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    touched.current = true;
    const n = personas[(idx + d + personas.length) % personas.length];
    choose(n.id);
    (root.current?.querySelector(`[data-persona="${n.id}"]`) as HTMLElement | null)?.focus();
  };

  // autoplay: go through the voices, preview one
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 550) => {
      const c = root.current;
      const el = c?.querySelector(sel);
      if (!c || !el) return;
      const r = el.getBoundingClientRect();
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
    const run = async () => {
      await wait(1200);
      while (ok()) {
        for (const x of personas.slice(1).concat(personas[0])) {
          await go(`[data-persona="${x.id}"]`);
          if (!ok()) return;
          choose(x.id);
          await wait(1900);
        }
        await go("[data-preview]");
        if (!ok()) return;
        setDrop((d) => d + 1);
        await wait(2600);
        setGhost(false);
        await wait(1500);
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

  const row = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 0",
    fontSize: 14.5,
    borderTop: "1px solid rgba(0,0,0,0.06)",
  } as const;

  return (
    <div
      ref={root}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      className={`relative w-full max-w-[420px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: 10,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        {/* where the notification lands */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            background: "#f2f2f7",
            padding: 12,
            overflow: "hidden",
          }}
        >
          <motion.div
            key={drop}
            initial={drop && !reduce ? { y: -120, scale: 0.94, opacity: 0.4 } : false}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 19,
              mass: 0.9,
            }}
            role="status"
            aria-live="polite"
            style={{
              display: "flex",
              gap: 11,
              padding: "12px 14px 13px 12px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 24px -14px rgba(0,0,0,0.28)",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 38,
                height: 38,
                flexShrink: 0,
              }}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={p.id}
                  src={p.avatar}
                  alt=""
                  initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          scale: 0.6,
                          opacity: 0,
                          rotate: 10,
                          transition: { duration: 0.18 },
                        }
                  }
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    background: "#fff",
                    objectFit: "cover",
                  }}
                />
              </AnimatePresence>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    height: 18,
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={p.id}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      style={{ display: "block" }}
                    >
                      {p.name}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, color: "#86868b" }}>now</span>
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 13.5,
                  lineHeight: 1.38,
                  color: "#3a3a3c",
                  marginTop: 2,
                  minHeight: 56,
                }}
              >
                <Rewrite text={p.message} reduce={reduce} />
              </span>
            </span>
          </motion.div>
        </div>

        <div style={{ padding: "16px 12px 4px" }}>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>{task}</div>

          <div
            id={`who-${uid}`}
            style={{
              fontSize: 13,
              color: "#86868b",
              marginTop: 16,
              marginBottom: 10,
            }}
          >
            Who reminds you
          </div>
          <div
            role="radiogroup"
            aria-labelledby={`who-${uid}`}
            onKeyDown={onKey}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${personas.length}, 1fr)`,
              gap: 6,
            }}
          >
            {personas.map((x) => {
              const on = x.id === p.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  data-persona={x.id}
                  onClick={() => {
                    touched.current = true;
                    choose(x.id);
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 4px 9px",
                    borderRadius: 16,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "#1d1d1f",
                  }}
                >
                  {on && (
                    <motion.span
                      layoutId={`persona-${uid}`}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 36,
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 16,
                        background: "#f2f2f7",
                      }}
                    />
                  )}
                  <motion.img
                    src={x.avatar}
                    alt=""
                    animate={{ scale: on ? 1.08 : 1, y: on ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    style={{ position: "relative", width: 40, height: 40 }}
                  />
                  <span
                    style={{
                      position: "relative",
                      fontSize: 12.5,
                      fontWeight: on ? 600 : 500,
                      color: on ? "#1d1d1f" : "#6e6e73",
                    }}
                  >
                    {x.mood}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={row}>
              <span style={{ color: "#6e6e73" }}>When</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{when}</span>
            </div>
            <div style={row}>
              <span style={{ color: "#6e6e73" }}>Repeat</span>
              <span>{repeat}</span>
            </div>
          </div>

          <button
            type="button"
            data-preview
            onClick={() => {
              touched.current = true;
              preview();
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            style={{
              width: "100%",
              height: 46,
              marginTop: 8,
              marginBottom: 6,
              borderRadius: 14,
              border: 0,
              background: "#1d1d1f",
              color: "#fff",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Preview
          </button>
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -11,
              top: -11,
              x: gx,
              y: gy,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: "rgba(0,0,0,0.08)",
              boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35), 0 4px 10px -3px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        )}
      </div>
    </div>
  );
}
