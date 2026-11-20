"use client";

/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type WithdrawalRow = {
  label: string;
  value: string;
  tone?: "green";
  copy?: boolean;
};
export type WithdrawalSheetProps = {
  title?: string;
  amount?: string;
  date?: string;
  /** step names, oldest first; the last one means done */
  steps?: string[];
  /** index into steps of where the money is now */
  step?: number;
  rows?: WithdrawalRow[];
  more?: WithdrawalRow[];
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
  dollar:
    "M204 168a52.06 52.06 0 0 1-52 52h-12v12a12 12 0 0 1-24 0v-12h-12a52.06 52.06 0 0 1-52-52a12 12 0 0 1 24 0a28 28 0 0 0 28 28h48a28 28 0 0 0 0-56h-40a52 52 0 0 1 0-104h4V24a12 12 0 0 1 24 0v12h4a52.06 52.06 0 0 1 52 52a12 12 0 0 1-24 0a28 28 0 0 0-28-28h-32a28 28 0 0 0 0 56h40a52.06 52.06 0 0 1 52 52",
  bank: "M248 208a8 8 0 0 1-8 8H16a8 8 0 0 1 0-16h224a8 8 0 0 1 8 8M16.3 98.18a8 8 0 0 1 3.51-9l104-64a8 8 0 0 1 8.38 0l104 64A8 8 0 0 1 232 104h-24v64h16a8 8 0 0 1 0 16H32a8 8 0 0 1 0-16h16v-64H24a8 8 0 0 1-7.7-5.82M144 160a8 8 0 0 0 16 0v-48a8 8 0 0 0-16 0Zm-48 0a8 8 0 0 0 16 0v-48a8 8 0 0 0-16 0Z",
  ok: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  plane:
    "M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7",
  copy: "M184 64H40a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8m-8 144H48V80h128Zm48-168v144a8 8 0 0 1-16 0V48H72a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8",
  bolt: "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  spin: "M236 128a108 108 0 0 1-216 0c0-42.52 24.73-81.34 63-98.9a12 12 0 1 1 10 21.81C63.24 64.57 44 94.83 44 128a84 84 0 0 0 168 0c0-33.17-19.24-63.43-49-77.09a12 12 0 1 1 10-21.81c38.27 17.56 63 56.38 63 98.9",
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

const SPRING = { type: "spring", stiffness: 420, damping: 38 } as const;
const STEPS = ["Waiting for funds", "Funds received", "Payout on the way", "Completed"];
const ROWS: WithdrawalRow[] = [
  { label: "To", value: "Revolut •••• 1342" },
  { label: "Account holder", value: "Thomas Andersen" },
  { label: "Transfer fee", value: "$8.50" },
];
const MORE: WithdrawalRow[] = [
  { label: "Payment rail", value: "ACH same day" },
  { label: "Transaction", value: "3W4g...z5xH", copy: true },
  { label: "Network fee", value: "Free", tone: "green" },
];

const Row = ({ r, onCopy, copied }: { r: WithdrawalRow; onCopy?: () => void; copied?: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 40,
      fontSize: 14,
    }}
  >
    <span style={{ color: "#86868b" }}>{r.label}</span>
    <span
      className="tabular-nums"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontWeight: 500,
        color: r.tone === "green" ? "#1f9d55" : "#1d1d1f",
      }}
    >
      {r.tone === "green" && <Ico d={I.bolt} size={13} />}
      {r.value}
      {r.copy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${r.label.toLowerCase()}`}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          style={{
            border: 0,
            background: "transparent",
            padding: 2,
            color: copied ? "#1f9d55" : "#aeaeb2",
            cursor: "pointer",
            borderRadius: 6,
          }}
        >
          <Ico d={copied ? I.check : I.copy} size={14} />
        </button>
      )}
    </span>
  </div>
);

/**
 * A withdrawal receipt that tells you where the money is. The status line opens into the steps it has been through,
 * the current one in blue with the line drawn up to it, and closes back to one line; when the payout lands the
 * line turns green with a tick. Show details slides out the rest of the receipt underneath.
 */
export default function WithdrawalSheet({
  title = "USDC withdrawal",
  amount = "1,508.50 USDC",
  date = "11 March 2026 at 10:07",
  steps = STEPS,
  step: stepProp = 2,
  rows = ROWS,
  more = MORE,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: WithdrawalSheetProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [step, setStep] = useState(stepProp);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const touched = useRef(false);
  useEffect(() => setStep(stepProp), [stepProp]);
  const done = step >= steps.length - 1;
  const current = steps[Math.min(step, steps.length - 1)];

  const toggleStatus = () => {
    setOpen((o) => !o);
    sfx.tick({ freq: 1800, gain: 0.025 });
  };
  const toggleDetails = () => {
    setDetails((d) => !d);
    sfx.tick({ freq: 1500, gain: 0.025 });
  };
  const copy = (r: WithdrawalRow) => {
    try {
      navigator.clipboard?.writeText(r.value).catch(() => {
        /* permission denied: the row still shows its copied state */
      });
    } catch {
      /* not allowed here */
    }
    setCopied(r.label);
    sfx.note(1318, { dur: 0.1, gain: 0.03 });
    setTimeout(() => setCopied(null), 1400);
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        setStep(stepProp);
        await wait(1100);
        if (!ok()) break;
        setOpen(true);
        await wait(1600);
        if (!ok()) break;
        setStep(steps.length - 1);
        sfx.note(1046, { dur: 0.2, gain: 0.04, bell: 0.5 });
        await wait(1300);
        if (!ok()) break;
        setOpen(false);
        await wait(900);
        if (!ok()) break;
        setDetails(true);
        await wait(2000);
        if (!ok()) break;
        setDetails(false);
        await wait(1600);
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

  const stepRows = useMemo(() => steps.map((s, i) => ({ s, i })), [steps]);
  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";

  return (
    <div
      className={`w-full ${className}`}
      style={{ maxWidth: 400, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div
        style={{
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
          padding: "26px 16px 10px",
          color: "#1d1d1f",
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              width: 52,
              height: 52,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                background: "#2775ca",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.25)",
              }}
            >
              <Ico d={I.dollar} size={26} />
            </div>
            <span
              style={{
                position: "absolute",
                right: -5,
                top: -3,
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "#fff",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
                display: "grid",
                placeItems: "center",
                color: "#1d1d1f",
              }}
            >
              <Ico d={I.bank} size={12} />
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#86868b", marginTop: 12 }}>{title}</div>
          <div
            className="tabular-nums"
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginTop: 2,
            }}
          >
            {amount}
          </div>
          <div style={{ fontSize: 13, color: "#aeaeb2", marginTop: 2 }}>{date}</div>
        </div>

        {/* status */}
        <div
          style={{
            marginTop: 20,
            borderRadius: 18,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <motion.button
            type="button"
            onClick={() => {
              touched.current = true;
              toggleStatus();
            }}
            aria-expanded={open}
            className="outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 50,
              padding: "0 14px",
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontFamily: font,
              borderRadius: 18,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>Status</span>
            <AnimatePresence mode="popLayout" initial={false}>
              {open ? (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    fontSize: 13,
                    color: "#aeaeb2",
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  Hide steps
                </motion.span>
              ) : (
                <motion.span
                  key={"s" + step}
                  initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                  transition={{ type: "tween", duration: 0.22 }}
                  aria-live="polite"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: done ? "#1f9d55" : "#0071e3",
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {current}
                  {done ? (
                    <Ico d={I.ok} size={16} />
                  ) : (
                    <motion.span
                      animate={reduce ? undefined : { rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 0.9,
                      }}
                      style={{ display: "grid" }}
                    >
                      <Ico d={I.spin} size={14} />
                    </motion.span>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ol
                key="steps"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ ...SPRING, opacity: { duration: 0.2 } }}
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: "0 14px",
                  overflow: "hidden",
                }}
              >
                {stepRows.map(({ s, i }) => {
                  const past = i < step || (done && i === step);
                  const now = i === step && !done;
                  const color = now ? "#0071e3" : past ? (done ? "#1f9d55" : "#1d1d1f") : "#c7c7cc";
                  return (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        height: 34,
                        paddingBottom: i === steps.length - 1 ? 12 : 0,
                        boxSizing: "content-box",
                      }}
                    >
                      {i < steps.length - 1 && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: 7,
                            top: 24,
                            width: 2,
                            height: 20,
                            borderRadius: 2,
                            background: "#ececf0",
                            overflow: "hidden",
                          }}
                        >
                          <motion.span
                            initial={false}
                            animate={{ scaleY: i < step ? 1 : 0 }}
                            transition={{
                              duration: 0.4,
                              ease: [0.2, 0.7, 0.2, 1],
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: done ? "#1f9d55" : "#1d1d1f",
                              transformOrigin: "50% 0%",
                            }}
                          />
                        </span>
                      )}
                      <motion.span
                        animate={{
                          background: past ? color : "#ffffff",
                          boxShadow: past
                            ? "0 0 0 0px rgba(0,0,0,0)"
                            : `inset 0 0 0 2px ${now ? "#0071e3" : "#d8d8dc"}`,
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          display: "grid",
                          placeItems: "center",
                          color: "#fff",
                          flex: "none",
                        }}
                      >
                        {past && <Ico d={I.check} size={10} />}
                        {now && (
                          <motion.span
                            animate={reduce ? undefined : { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1.4 }}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 9,
                              background: "#0071e3",
                            }}
                          />
                        )}
                      </motion.span>
                      <span
                        style={{
                          fontSize: 14,
                          color: now ? "#0071e3" : past ? "#1d1d1f" : "#aeaeb2",
                          fontWeight: now ? 600 : 400,
                        }}
                      >
                        {s}
                      </span>
                    </motion.li>
                  );
                })}
              </motion.ol>
            )}
          </AnimatePresence>
        </div>

        <div style={{ padding: "8px 14px 0" }}>
          {rows.map((r) => (
            <Row key={r.label} r={r} />
          ))}
        </div>
        <AnimatePresence initial={false}>
          {details && (
            <motion.div
              key="more"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ ...SPRING, opacity: { duration: 0.2 } }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  margin: "6px 14px 0",
                  borderTop: "1px solid #f0f0f2",
                  paddingTop: 6,
                }}
              >
                {more.map((r, i) => (
                  <motion.div
                    key={r.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i + 0.05 }}
                  >
                    <Row r={r} onCopy={() => copy(r)} copied={copied === r.label} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 0 6px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              toggleDetails();
            }}
            aria-expanded={details}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              border: 0,
              background: "transparent",
              fontSize: 14,
              fontWeight: 600,
              color: "#1d1d1f",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: 12,
              display: "inline-flex",
              gap: 4,
              fontFamily: font,
            }}
          >
            <span
              style={{
                position: "relative",
                display: "inline-block",
                width: 36,
                height: 20,
                overflow: "hidden",
                textAlign: "right",
              }}
            >
              <AnimatePresence initial={false}>
                <motion.span
                  key={details ? "h" : "s"}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={SPRING}
                  style={{ position: "absolute", right: 0 }}
                >
                  {details ? "Hide" : "Show"}
                </motion.span>
              </AnimatePresence>
            </span>
            details
          </button>
        </div>
      </div>
    </div>
  );
}
