"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type OtpCodeProps = {
  length?: number;
  /** where the code went, shown masked */
  destination?: string;
  /** check a code; resolve true when it is right */
  verify?: (code: string) => boolean | Promise<boolean>;
  onVerified?: (code: string) => void;
  /** seconds before a new code can be sent */
  resendAfter?: number;
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
  lock: "M216 40H40a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h60.43l13.68 23.94a16 16 0 0 0 27.78 0L155.57 200H216a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M84 132a12 12 0 1 1 12-12a12 12 0 0 1-12 12m44 0a12 12 0 1 1 12-12a12 12 0 0 1-12 12m44 0a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const DEMO = "246810";
type State = "typing" | "checking" | "wrong" | "right";

/**
 * A one-time code field with no confirm button. Each digit rolls up into its box with a little overshoot and the
 * caret glows in the next one; paste or autofill fills them in a ripple. On the last digit the boxes slide together
 * into one bar and a sheen runs across while it checks: a right code turns the bar green with a tick, a wrong one
 * shakes the bar apart again and the digits drop out so you can try once more. Uses one real input, so autofill
 * from a text message and screen readers work.
 */
export default function OtpCode({
  length = 6,
  destination = "+44 •••• ••2048",
  verify = (c) => new Promise((r) => setTimeout(() => r(c === DEMO), 900)),
  onVerified,
  resendAfter = 30,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: OtpCodeProps) {
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
  const input = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [state, setStateS] = useState<State>("typing");
  const stateRef = useRef<State>("typing");
  const setState = (s: State) => {
    stateRef.current = s;
    setStateS(s);
  };
  const [focused, setFocused] = useState(false);
  const [left, setLeft] = useState(resendAfter);
  const shake = useAnimationControls();
  const touched = useRef(false);

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  const check = async (c: string) => {
    setState("checking");
    sfx.whoosh(600, 1800, { dur: 0.35, gain: 0.03 });
    const ok = await verify(c);
    if (ok) {
      setState("right");
      sfx.note(659, { dur: 0.25, gain: 0.06, bell: 0.5 });
      sfx.note(988, { at: 0.1, dur: 0.6, gain: 0.06, bell: 0.6 });
      onVerified?.(c);
    } else {
      setState("wrong");
      sfx.note(220, { dur: 0.25, gain: 0.06, type: "triangle" });
      sfx.note(185, { at: 0.12, dur: 0.3, gain: 0.05, type: "triangle" });
      if (!reduce)
        await shake.start({
          x: [0, -12, 11, -8, 6, -3, 0],
          transition: { duration: 0.5 },
        });
      await new Promise((r) => setTimeout(r, 450));
      setCode("");
      setState("typing");
      input.current?.focus();
    }
  };

  const change = (raw: string) => {
    if (stateRef.current !== "typing") return;
    const v = raw.replace(/\D/g, "").slice(0, length);
    if (v.length > code.length) sfx.tick({ freq: 1500 + v.length * 160, gain: 0.04 });
    setCode(v);
    if (v.length === length) void check(v);
  };

  // autoplay: a wrong guess, then the right one
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const type = async (s: string) => {
      for (let i = 1; i <= s.length; i++) {
        if (!alive || touched.current) return false;
        if (stateRef.current !== "typing") return false;
        setCode(s.slice(0, i));
        sfx.tick({ freq: 1500 + i * 160, gain: 0.04 });
        await wait(170 + Math.random() * 140);
      }
      return true;
    };
    const run = async () => {
      await wait(900);
      while (alive && !touched.current) {
        if (!(await type("135790"))) return;
        await check("135790");
        await wait(900);
        if (!(await type(DEMO))) return;
        await check(DEMO);
        await wait(2400);
        if (!alive || touched.current) return;
        setCode("");
        setState("typing");
        await wait(800);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const merged = state === "checking" || state === "right";
  const digits = useMemo(() => Array.from({ length }, (_, i) => code[i] ?? ""), [code, length]);
  const BW = 50;
  const GAP = 10;
  const total = length * BW + (length - 1) * GAP;

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f5f5f7] ${className}`}
      style={{
        padding: "44px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100%, 420px)",
          background: "#fff",
          borderRadius: 26,
          padding: "28px clamp(16px, 5vw, 32px) 24px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 50px -30px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        <motion.div
          animate={
            state === "right"
              ? { background: "#e8f8ed", color: "#1a8f3e" }
              : { background: "#f0f4ff", color: "#0071e3" }
          }
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            margin: "0 auto 14px",
          }}
        >
          <Ico d={state === "right" ? I.check : I.lock} size={24} />
        </motion.div>
        <div
          style={{
            fontSize: 21,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#1d1d1f",
          }}
        >
          {state === "right" ? "You're in" : "Check your phone"}
        </div>
        <p
          style={{
            margin: "6px 0 22px",
            fontSize: 14,
            color: "#6e6e73",
            lineHeight: 1.45,
          }}
        >
          Enter the {length}-digit code we sent to{" "}
          <span style={{ color: "#1d1d1f", fontWeight: 500, whiteSpace: "nowrap" }}>{destination}</span>
        </p>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: total,
            margin: "0 auto",
            aspectRatio: `${total} / 60`,
          }}
          onClick={() => input.current?.focus()}
        >
          <input
            ref={input}
            id={`otp-${uid}`}
            value={code}
            onChange={(e) => {
              touched.current = true;
              change(e.target.value);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={length}
            aria-label={`${length}-digit code`}
            aria-invalid={state === "wrong"}
            disabled={state === "checking" || state === "right"}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              width: "100%",
              height: "100%",
              fontSize: 16,
              cursor: "text",
              zIndex: 2,
              caretColor: "transparent",
            }}
          />
          <motion.div animate={shake} style={{ position: "absolute", inset: 0 }}>
            {/* the bar the boxes become */}
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{ opacity: merged ? 1 : 0, scaleX: merged ? 1 : 0.94 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                background: state === "right" ? "linear-gradient(180deg,#3fd56b,#24b84e)" : "#f2f2f5",
                boxShadow: state === "right" ? "0 12px 26px -14px #24b84e" : "inset 0 0 0 1.5px #d7d7de",
                overflow: "hidden",
                transition: "background 0.35s, box-shadow 0.35s",
              }}
            >
              {state === "checking" && !reduce && (
                <motion.span
                  initial={{ x: "-120%" }}
                  animate={{ x: "220%" }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "45%",
                    background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.9), transparent)",
                  }}
                />
              )}
              <AnimatePresence>
                {state === "right" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 18,
                      delay: 0.1,
                    }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      color: "#fff",
                      fontSize: 17,
                      fontWeight: 600,
                    }}
                  >
                    <Ico d={I.check} size={18} /> Verified
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            {digits.map((dg, i) => {
              const at = code.length === i && focused && state === "typing";
              const filled = !!dg;
              const pct = (i * (BW + GAP)) / total;
              const mid = 0.5 - BW / 2 / total;
              return (
                <motion.div
                  key={i}
                  aria-hidden="true"
                  initial={false}
                  animate={
                    merged
                      ? {
                          left: `${(mid + (pct - mid) * 0.82) * 100}%`,
                          opacity: state === "right" ? 0 : 1,
                          scale: 0.92,
                        }
                      : { left: `${pct * 100}%`, opacity: 1, scale: 1 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    delay: merged ? Math.abs(i - (length - 1) / 2) * 0.02 : 0,
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    width: `${(BW / total) * 100}%`,
                    height: "100%",
                    borderRadius: 14,
                    background: merged ? "transparent" : "#fff",
                    boxShadow: merged
                      ? "none"
                      : state === "wrong"
                        ? "inset 0 0 0 1.5px #ff453a, 0 0 0 4px rgba(255,69,58,0.12)"
                        : at
                          ? "inset 0 0 0 2px #0071e3, 0 0 0 4px rgba(0,113,227,0.14)"
                          : filled
                            ? "inset 0 0 0 1.5px #c7c7cf"
                            : "inset 0 0 0 1.5px #e3e3e8",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s, background 0.25s",
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {dg ? (
                      <motion.span
                        key={dg + i}
                        initial={{
                          y: 26,
                          opacity: 0,
                          filter: "blur(4px)",
                          scale: 0.8,
                        }}
                        animate={{
                          y: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                          scale: 1,
                        }}
                        exit={
                          state === "wrong"
                            ? {
                                y: 40,
                                opacity: 0,
                                rotate: (i % 2 ? 1 : -1) * 20,
                              }
                            : { y: -20, opacity: 0 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 22,
                          delay: state === "wrong" ? i * 0.03 : 0,
                          filter: { duration: 0.2 },
                          opacity: { duration: 0.15 },
                        }}
                        style={{
                          fontSize: "clamp(20px, 6vw, 26px)",
                          fontWeight: 600,
                          color: state === "wrong" ? "#ff453a" : "#1d1d1f",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {dg}
                      </motion.span>
                    ) : at ? (
                      <motion.span
                        key="caret"
                        animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          times: [0, 0.5, 0.55, 1],
                        }}
                        style={{
                          width: 2,
                          height: 24,
                          borderRadius: 1,
                          background: "#0071e3",
                          boxShadow: "0 0 8px rgba(0,113,227,0.6)",
                        }}
                      />
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 13,
            color: "#6e6e73",
            minHeight: 20,
          }}
          aria-live="polite"
        >
          {state === "wrong" ? (
            <span style={{ color: "#d70015" }}>That code didn&rsquo;t match. Try again.</span>
          ) : state === "right" ? (
            "Code accepted"
          ) : left > 0 ? (
            <span style={{ fontVariantNumeric: "tabular-nums" }}>Resend code in 0:{String(left).padStart(2, "0")}</span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLeft(resendAfter);
                sfx.note(700, { dur: 0.15, gain: 0.04 });
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] rounded"
              style={{
                border: 0,
                background: "none",
                color: "#0071e3",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send a new code
            </button>
          )}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#86868b" }}>Demo code {DEMO}</div>
      </div>
    </div>
  );
}
