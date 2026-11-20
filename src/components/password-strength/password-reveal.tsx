"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PasswordRevealProps = {
  title?: string;
  hint?: string;
  label?: string;
  defaultValue?: string;
  submitLabel?: string;
  onSubmit?: (password: string) => void;
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

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif";
const SIZE = 17;
const BULLET = "•";

const strength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (!p) return { n: 0, label: "", color: "#d2d2d7" };
  if (p.length < 8) return { n: 1, label: "Too short", color: "#ff3b30" };
  return s <= 2
    ? { n: 2, label: "Okay", color: "#ff9f0a" }
    : s <= 3
      ? { n: 3, label: "Good", color: "#30b14c" }
      : { n: 4, label: "Strong", color: "#1a8a3a" };
};

const FALLBACK_WIDTHS: { bullet: number; of: (c: string) => number } = { bullet: 6, of: () => 9 };
let measuredWidths: { bullet: number; of: (c: string) => number } | null = null;
/** Widths of each glyph, so the animated letters line up with the input's own text (measured once, in the browser). */
function glyphWidths() {
  if (typeof document === "undefined") return FALLBACK_WIDTHS;
  if (measuredWidths) return measuredWidths;
  const c = document.createElement("canvas").getContext("2d");
  if (!c) return FALLBACK_WIDTHS;
  c.font = `${SIZE}px ${FONT}`;
  const cache: Record<string, number> = {};
  measuredWidths = {
    bullet: c.measureText(BULLET).width,
    of: (ch: string) => (cache[ch] ??= c.measureText(ch).width),
  };
  return measuredWidths;
}

/**
 * A password field whose reveal is a small wave. Press the eye and the dots turn into letters one after another from
 * left to right, each dot shrinking away as its letter rises, while a slash draws across the eye (and wipes off again
 * when you hide it). The field is a real password input the whole time, so typing, pasting and autofill work as
 * usual; the animated letters only sit on top while the wave runs. A thin line below fills as the password gets
 * stronger.
 */
export default function PasswordReveal({
  title = "Create a password",
  hint = "Use 8 or more characters with a mix of letters, numbers and symbols.",
  label = "Password",
  defaultValue = "Mountain-river42",
  submitLabel = "Continue",
  onSubmit,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PasswordRevealProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [value, setValue] = useState(defaultValue);
  const [shown, setShown] = useState(false);
  const [wave, setWave] = useState<null | { to: boolean; id: number }>(null);
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const id = `pw${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const STEP = Math.min(0.035, 0.5 / Math.max(1, value.length));
  const toggle = () => {
    touched.current = true;
    const to = !shown;
    if (reduce || !value) {
      setShown(to);
      return;
    }
    setWave({ to, id: Date.now() });
    sfx.whoosh(to ? 900 : 2400, to ? 2600 : 900, { dur: 0.3, gain: 0.025 });
    [...value].forEach(
      (_, i) =>
        i % 2 === 0 &&
        sfx.tick({
          at: i * STEP,
          freq: (to ? 1800 : 2600) + (to ? i : -i) * 30,
          gain: 0.006,
        }),
    );
  };
  // when the wave has crossed, hand back to the real input
  useEffect(() => {
    if (!wave) return;
    const t = setTimeout(
      () => {
        setShown(wave.to);
        setWave(null);
      },
      (value.length * STEP + 0.36) * 1000,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wave]);

  // autoplay: show, hide, now and then
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1400);
      while (alive && !touched.current) {
        document.getElementById(`${id}-eye`)?.click();
        touched.current = false;
        await wait(2600);
        if (!alive || touched.current) return;
        document.getElementById(`${id}-eye`)?.click();
        touched.current = false;
        await wait(2600);
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

  const st = strength(value);
  const eyeSlash = wave ? wave.to === false : !shown;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
    sfx.note(880, { dur: 0.2, gain: 0.05 });
  };

  return (
    <div className={`relative w-full max-w-[420px] ${className}`} style={{ fontFamily: FONT, color: "#1d1d1f" }}>
      <form
        onSubmit={submit}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          borderRadius: 28,
          background: "#fff",
          padding: "26px 24px 22px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em" }}>{title}</div>
        <div
          id={`${id}-hint`}
          style={{
            fontSize: 13.5,
            color: "#86868b",
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </div>

        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: 13,
            color: "#6e6e73",
            marginTop: 22,
            marginBottom: 7,
          }}
        >
          {label}
        </label>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            height: 52,
            borderRadius: 14,
            background: "#f5f5f7",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <input
            ref={input}
            id={id}
            type={shown ? "text" : "password"}
            value={value}
            onChange={(e) => {
              touched.current = true;
              setWave(null);
              setValue(e.target.value);
            }}
            autoComplete="new-password"
            spellCheck={false}
            aria-describedby={`${id}-hint ${id}-str`}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              padding: "0 52px 0 16px",
              border: 0,
              borderRadius: 14,
              background: "transparent",
              fontFamily: FONT,
              fontSize: SIZE,
              letterSpacing: 0,
              color: wave ? "transparent" : "#1d1d1f",
              caretColor: "#0071e3",
            }}
          />
          {/* the wave: one cell per character, a dot giving way to its letter (or back) */}
          {wave && (
            <span
              key={wave.id}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 16,
                top: 0,
                bottom: 0,
                right: 52,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                pointerEvents: "none",
                fontSize: SIZE,
                whiteSpace: "pre",
              }}
            >
              {[...value].map((ch, i) => {
                const d = i * STEP;
                const a = wave.to ? glyphWidths().bullet : glyphWidths().of(ch);
                const b = wave.to ? glyphWidths().of(ch) : glyphWidths().bullet;
                const ease = [0.3, 0.8, 0.3, 1] as const;
                return (
                  <motion.span
                    key={i}
                    initial={{ width: a }}
                    animate={{ width: b }}
                    transition={{ delay: d, duration: 0.3, ease }}
                    style={{
                      position: "relative",
                      display: "inline-block",
                      height: 24,
                      flexShrink: 0,
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: wave.to ? -9 : 9, scale: 0.4 }}
                      transition={{ delay: d, duration: 0.24, ease }}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        lineHeight: "24px",
                      }}
                    >
                      {wave.to ? BULLET : ch}
                    </motion.span>
                    <motion.span
                      initial={{
                        opacity: 0,
                        y: wave.to ? 10 : -10,
                        filter: "blur(3px)",
                      }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: d + 0.05, duration: 0.3, ease }}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        lineHeight: "24px",
                        color: "#1d1d1f",
                      }}
                    >
                      {wave.to ? ch : BULLET}
                    </motion.span>
                  </motion.span>
                );
              })}
            </span>
          )}
          <button
            id={`${id}-eye`}
            type="button"
            onClick={toggle}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            aria-controls={id}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              position: "absolute",
              right: 6,
              top: 6,
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              borderRadius: 11,
              border: 0,
              background: "transparent",
              color: "#6e6e73",
              cursor: "pointer",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 256 256" aria-hidden="true">
              <path
                d="M247.31 124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57 61.26 162.88 48 128 48S61.43 61.26 36.34 86.35C17.51 105.18 9 124 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208s66.57-13.26 91.66-38.34c18.83-18.83 27.3-37.61 27.65-38.4a8 8 0 0 0 0-6.5M128 192c-30.78 0-57.67-11.19-79.93-33.25A133.5 133.5 0 0 1 25 128a133.3 133.3 0 0 1 23.07-30.75C70.33 75.19 97.22 64 128 64s57.67 11.19 79.93 33.25A133.5 133.5 0 0 1 231.05 128c-7.21 13.46-38.62 64-103.05 64m0-112a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                fill="currentColor"
              />
              {/* the slash: a gap line in the field colour, then the line itself */}
              <motion.line
                x1="44"
                y1="40"
                x2="212"
                y2="216"
                stroke="#f5f5f7"
                strokeWidth="44"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: eyeSlash ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
              />
              <motion.line
                x1="44"
                y1="40"
                x2="212"
                y2="216"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                initial={false}
                animate={{
                  pathLength: eyeSlash ? 1 : 0,
                  opacity: eyeSlash ? 1 : 0,
                }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        pathLength: {
                          type: "spring",
                          stiffness: 260,
                          damping: 26,
                        },
                        opacity: { duration: 0.15, delay: eyeSlash ? 0 : 0.2 },
                      }
                }
              />
            </svg>
          </button>
        </div>

        {/* strength */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div style={{ flex: 1, display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map((k) => (
              <span
                key={k}
                style={{
                  position: "relative",
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: "#e8e8ed",
                  overflow: "hidden",
                }}
              >
                <motion.span
                  initial={false}
                  animate={{
                    scaleX: st.n >= k ? 1 : 0,
                    backgroundColor: st.color,
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          scaleX: {
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            delay: (k - 1) * 0.04,
                          },
                          backgroundColor: { duration: 0.3 },
                        }
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "left",
                  }}
                />
              </span>
            ))}
          </div>
          <span
            id={`${id}-str`}
            aria-live="polite"
            style={{
              position: "relative",
              width: 64,
              height: 16,
              fontSize: 12,
              textAlign: "right",
              color: st.color,
              fontWeight: 500,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={st.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ position: "absolute", right: 0 }}
              >
                {st.label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <button
          type="submit"
          disabled={st.n < 2}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{
            width: "100%",
            height: 48,
            marginTop: 22,
            borderRadius: 14,
            border: 0,
            background: st.n < 2 ? "#e8e8ed" : "#1d1d1f",
            color: st.n < 2 ? "#86868b" : "#fff",
            fontFamily: FONT,
            fontSize: 15.5,
            fontWeight: 600,
            cursor: st.n < 2 ? "default" : "pointer",
            transition: "background 0.25s, color 0.25s",
          }}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
