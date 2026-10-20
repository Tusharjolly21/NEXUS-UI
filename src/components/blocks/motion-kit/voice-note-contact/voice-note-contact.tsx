"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";

export type VoiceNoteContactSubmission =
  | { kind: "message"; name: string; email: string; message: string }
  | { kind: "voice"; seconds: number };

export interface VoiceNoteContactProps {
  /** Accent colour. Defaults to Apple blue (#0071e3 light, #0a84ff dark). */
  accent?: string;
  contactEmail?: string;
  hours?: string;
  /**
   * Runs with the validated, trimmed submission. The block never sends anything itself: it shows
   * the confirmation locally, so wire your own request in here.
   */
  onSubmit?: (data: VoiceNoteContactSubmission) => void;
  /** Types a message, then records and plays a voice note by itself until the visitor touches it. */
  autoplay?: boolean;
  className?: string;
}

const MAX_SECONDS = 60;
const MAX_MESSAGE = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEMO_MESSAGE = "Hi! We're planning a site relaunch in March and would love some help.";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20240611);
/** Seeded waveform for the recorded clip, so server and client render the same bars. */
const BARS = Array.from({ length: 28 }, () => 0.25 + rand() * 0.75);

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-a)]";
const field = `rounded-xl bg-[#f5f5f7] px-3.5 text-[16px] outline-none placeholder:text-[#a1a1a6] focus:ring-2 focus:ring-[var(--mk-a)] sm:text-[15px] dark:bg-[#2c2c2e] dark:placeholder:text-[#8e8e93] ${ink}`;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Face({ look }: { look: "pointer" | "down" }) {
  const ref = useRef<HTMLDivElement>(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 300, damping: 22 });
  const y = useSpring(ty, { stiffness: 300, damping: 22 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let off: ReturnType<typeof setTimeout>;
    const t = setInterval(() => {
      setBlink(true);
      off = setTimeout(() => setBlink(false), 130);
    }, 3000);
    return () => {
      clearInterval(t);
      clearTimeout(off);
    };
  }, []);

  useEffect(() => {
    if (look === "down") {
      tx.set(0);
      ty.set(4);
      return;
    }
    tx.set(0);
    ty.set(0);
    const move = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 140);
      tx.set((dx / d) * 4 * k);
      ty.set((dy / d) * 4 * k);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [look, tx, ty]);

  return (
    <div ref={ref} className="flex h-11 w-14 flex-none items-center justify-center gap-1.5 rounded-[18px] bg-[var(--mk-a)]" aria-hidden="true">
      {[0, 1].map((k) => (
        <motion.span key={k} className="flex h-[16px] w-[13px] items-center justify-center overflow-hidden rounded-full bg-white" animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.1 }}>
          <motion.span className="h-[7px] w-[7px] rounded-full bg-[#1d1d1f]" style={{ x, y }} />
        </motion.span>
      ))}
    </div>
  );
}

/**
 * Simulated recorder: it times the press and draws a waveform, but never touches the microphone
 * (no getUserMedia), so the demo asks for no permissions.
 */
function Recorder({ onClip, demo, onDemoDone }: { onClip: (s: number | null) => void; demo: boolean; onDemoDone: () => void }) {
  const reduce = useReducedMotion();
  const [rec, setRec] = useState(false);
  const [latched, setLatched] = useState(false);
  const [secs, setSecs] = useState(0);
  const [clip, setClip] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const prog = useMotionValue(0);
  const clipPath = useTransform(prog, (v) => `inset(0 ${100 - v * 100}% 0 0)`);
  const recording = useRef(false);
  const latchedRef = useRef(false);
  const startAt = useRef(0);
  const pressAt = useRef(0);
  const skipRelease = useRef(false);
  const lastKey = useRef(0);
  const playCtl = useRef<AnimationPlaybackControls | null>(null);

  const begin = useCallback((latch: boolean) => {
    recording.current = true;
    latchedRef.current = latch;
    startAt.current = performance.now();
    setLatched(latch);
    setSecs(0);
    setRec(true);
  }, []);

  const end = useCallback(() => {
    if (!recording.current) return;
    recording.current = false;
    latchedRef.current = false;
    const s = Math.min(MAX_SECONDS, Math.max(1, Math.round((performance.now() - startAt.current) / 1000)));
    setRec(false);
    setLatched(false);
    setClip(s);
    onClip(s);
  }, [onClip]);

  const stopPlayback = useCallback(() => {
    playCtl.current?.stop();
    playCtl.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(
    (s: number) => {
      if (playCtl.current) {
        stopPlayback();
        return;
      }
      prog.set(0);
      setPlaying(true);
      playCtl.current = animate(prog, 1, {
        duration: s,
        ease: "linear",
        onComplete: () => {
          playCtl.current = null;
          setPlaying(false);
        },
      });
    },
    [prog, stopPlayback],
  );

  const discard = useCallback(() => {
    stopPlayback();
    prog.set(0);
    setClip(null);
    setSecs(0);
    onClip(null);
  }, [onClip, prog, stopPlayback]);

  useEffect(() => () => playCtl.current?.stop(), []);

  useEffect(() => {
    if (!rec) return;
    const t = setInterval(() => {
      const e = (performance.now() - startAt.current) / 1000;
      setSecs(e);
      if (e >= MAX_SECONDS) end();
    }, 100);
    return () => clearInterval(t);
  }, [rec, end]);

  // Autoplay: record a short note, play it back, clear it, hand back to the parent.
  useEffect(() => {
    if (!demo) return;
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((r) => { t = setTimeout(r, ms); });
    (async () => {
      await wait(900);
      if (cancelled) return;
      begin(false);
      await wait(3300);
      if (cancelled) return;
      end();
      await wait(800);
      if (cancelled) return;
      play(3);
      await wait(4200);
      if (cancelled) return;
      discard();
      await wait(500);
      if (!cancelled) onDemoDone();
    })();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [demo, begin, end, play, discard, onDemoDone]);

  // Hold to record; a quick tap latches it on and the next tap stops it.
  const press = () => {
    if (recording.current) {
      if (latchedRef.current) {
        skipRelease.current = true;
        end();
      }
      return;
    }
    pressAt.current = performance.now();
    begin(false);
  };
  const release = () => {
    if (skipRelease.current) {
      skipRelease.current = false;
      return;
    }
    if (!recording.current || latchedRef.current) return;
    if (performance.now() - pressAt.current < 350) {
      latchedRef.current = true;
      setLatched(true);
    } else end();
  };

  if (clip) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] p-3 dark:bg-[#2c2c2e]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => play(clip)}
          aria-label={playing ? "Pause voice note" : "Play voice note"}
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--mk-a)] text-white ${focusRing} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#2c2c2e]`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d={playing ? "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" : "M8 5l11 7-11 7z"} />
          </svg>
        </motion.button>
        <div className="relative flex h-8 min-w-0 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden="true">
          {BARS.map((b, i) => (
            <span key={i} className="flex-1 rounded-full bg-[#c7c7cc] dark:bg-[#48484a]" style={{ height: `${b * 100}%` }} />
          ))}
          <motion.div className="pointer-events-none absolute inset-0 flex items-center gap-[3px]" style={{ clipPath }}>
            {BARS.map((b, i) => (
              <span key={i} className="flex-1 rounded-full bg-[var(--mk-a)]" style={{ height: `${b * 100}%` }} />
            ))}
          </motion.div>
        </div>
        <span className={`w-9 flex-none text-right text-[13px] tabular-nums ${muted}`}>{fmt(clip)}</span>
        <button type="button" onClick={discard} aria-label="Delete voice note" className={`flex h-10 w-10 flex-none items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${muted} ${focusRing}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex h-12 items-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <motion.span
            key={i}
            className={`w-[4px] rounded-full transition-colors ${rec ? "bg-[var(--mk-a)]" : "bg-[#d2d2d7] dark:bg-[#48484a]"}`}
            animate={{ height: rec ? (reduce ? 12 + ((i * 7) % 30) : [8, 12 + ((i * 7) % 30), 8]) : 6 }}
            transition={{ duration: 0.5 + (i % 5) * 0.1, repeat: rec && !reduce ? Infinity : 0 }}
          />
        ))}
      </div>
      <motion.button
        type="button"
        aria-pressed={rec}
        aria-label={rec ? `Recording, ${fmt(secs)}. Press again to stop.` : "Record a voice note"}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          press();
        }}
        onPointerUp={release}
        onPointerCancel={() => {
          if (!latchedRef.current) end();
        }}
        onKeyDown={(e) => {
          if (e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          lastKey.current = performance.now();
          if (!e.repeat) press();
        }}
        onKeyUp={(e) => {
          if (e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          lastKey.current = performance.now();
          release();
        }}
        onClick={(e) => {
          // Assistive tech activates with a bare click (no pointer or key events).
          if (e.detail !== 0 || performance.now() - lastKey.current < 400) return;
          if (recording.current) end();
          else begin(true);
        }}
        animate={{ scale: rec ? 1.06 : 1 }}
        className={`relative flex h-12 touch-none select-none items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors ${focusRing} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e] ${
          rec ? "bg-[#ff3b30] text-white dark:bg-[#ff453a]" : "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
        }`}
      >
        {rec && !reduce && (
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ["0 0 0 0 rgba(255,59,48,.5)", "0 0 0 16px rgba(255,59,48,0)"] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        <span className="tabular-nums">{rec ? `${latched ? "Tap to stop" : "Recording"} ${fmt(secs)}` : "Hold to record"}</span>
      </motion.button>
      <span className="text-center text-[12px] text-[#86868b] dark:text-[#8e8e93]">Hold, or tap to start and stop. Up to 60 seconds. Demo recorder: the microphone is never used.</span>
    </div>
  );
}

/**
 * Contact section with two ways in: write a message while a small face watches what you type, or
 * hold to record a voice note and play it back. Sending morphs the button into a confirmation.
 * Nothing leaves the page: the validated submission goes to `onSubmit`.
 */
export function VoiceNoteContact({ accent, contactEmail = "hello@northwind.studio", hours = "Mon to Fri, 9 to 6 CET", onSubmit, autoplay = false, className }: VoiceNoteContactProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<"write" | "voice">("write");
  const [typing, setTyping] = useState(false);
  const [clip, setClip] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [round, setRound] = useState(0);
  const sentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (sentTimer.current) clearTimeout(sentTimer.current);
  }, []);

  const demo = autoplay && !touched && !reduce;

  // Autoplay, write tab: the face looks down while a message types itself, then we switch to voice.
  useEffect(() => {
    if (!demo || tab !== "write") return;
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((r) => { t = setTimeout(r, ms); });
    (async () => {
      await wait(700);
      if (cancelled) return;
      setTyping(true);
      for (let i = 1; i <= DEMO_MESSAGE.length && !cancelled; i++) {
        setMsg(DEMO_MESSAGE.slice(0, i));
        await wait(38);
      }
      await wait(1100);
      if (cancelled) return;
      setTyping(false);
      await wait(700);
      if (cancelled) return;
      setMsg("");
      setTab("voice");
    })();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [demo, tab]);

  const demoDone = useCallback(() => setTab("write"), []);

  const stopDemo = () => {
    if (touched) return;
    setTouched(true);
    if (autoplay) {
      setTyping(false);
      setMsg("");
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (sent) return;
    let data: VoiceNoteContactSubmission;
    if (tab === "voice") {
      if (!clip) return;
      data = { kind: "voice", seconds: clip };
    } else {
      const n = name.trim().slice(0, 80);
      const m = email.trim().slice(0, 254);
      const body = msg.trim().slice(0, MAX_MESSAGE);
      if (!EMAIL_RE.test(m)) return setError("Add an email so we can reply.");
      if (!body) return setError("Write a few words first.");
      data = { kind: "message", name: n, email: m, message: body };
    }
    setError(null);
    onSubmit?.(data);
    setSent(true);
    if (sentTimer.current) clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => {
      setSent(false);
      setMsg("");
      setClip(null);
      setRound((r) => r + 1);
    }, 2600);
  };

  return (
    <section
      className={`w-full bg-[#f5f5f7] px-4 py-[clamp(48px,8vw,80px)] [--mk-a:#0071e3] sm:px-5 dark:bg-black dark:[--mk-a:#0a84ff] ${className ?? ""}`}
      style={accent ? ({ "--mk-a": accent } as CSSProperties) : undefined}
      onPointerDown={stopDemo}
      onKeyDown={stopDemo}
      onFocus={stopDemo}
    >
      <div className="mx-auto grid max-w-[1040px] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div className="flex flex-col gap-5">
          <span className="text-[14px] font-semibold text-[var(--mk-a)]">Contact</span>
          <h2 className={`m-0 text-[clamp(30px,5vw,52px)] font-semibold leading-[1.04] tracking-[-0.04em] ${ink}`}>Talk to a human. Or leave us a voice note.</h2>
          <p className={`m-0 max-w-[420px] text-[clamp(16px,1.6vw,17px)] leading-[1.5] ${muted}`}>
            We reply within a working day, usually much faster. Voice notes go straight to the person who can help.
          </p>
          <div className={`flex flex-col gap-2 text-[15px] ${ink}`}>
            {[
              [contactEmail, "M4 6h16v12H4zM4 7l8 6 8-6"],
              [hours, "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2"],
            ].map(([t, d]) => (
              <span key={d} className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white text-[var(--mk-a)] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={d} />
                  </svg>
                </span>
                <span className="min-w-0 break-words">{t}</span>
              </span>
            ))}
          </div>
        </div>
        <LayoutGroup id={`vc-${uid}`}>
          <motion.form
            layout
            onSubmit={send}
            noValidate
            className="flex min-w-0 flex-col gap-4 rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-36px_rgba(0,0,0,.4)] sm:p-7 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex rounded-full bg-[#f0f0f3] p-1 dark:bg-[#2c2c2e]" role="tablist" aria-label="How to contact us">
                {(["write", "voice"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => {
                      setTab(t);
                      setError(null);
                    }}
                    className={`relative h-10 rounded-full px-4 text-[13px] font-medium ${focusRing} ${tab === t ? ink : muted}`}
                  >
                    {tab === t && (
                      <motion.span layoutId="vc-tab" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.12)] dark:bg-[#48484a] dark:shadow-none" transition={{ type: "spring", stiffness: 500, damping: 34 }} />
                    )}
                    <span className="relative whitespace-nowrap">{t === "write" ? "Write" : "Voice note"}</span>
                  </button>
                ))}
              </div>
              <Face look={typing ? "down" : "pointer"} />
            </div>
            <AnimatePresence mode="popLayout" initial={false}>
              {tab === "write" ? (
                <motion.div key="w" className="flex flex-col gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      aria-label="Name"
                      placeholder="Name"
                      autoComplete="name"
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setTyping(true)}
                      onBlur={() => setTyping(false)}
                      className={`h-11 min-w-0 ${field}`}
                    />
                    <input
                      aria-label="Email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setTyping(true)}
                      onBlur={() => setTyping(false)}
                      className={`h-11 min-w-0 ${field}`}
                    />
                  </div>
                  <textarea
                    aria-label="Message"
                    value={msg}
                    maxLength={MAX_MESSAGE}
                    onChange={(e) => setMsg(e.target.value)}
                    onFocus={() => setTyping(true)}
                    onBlur={() => setTyping(false)}
                    placeholder="What are you working on?"
                    rows={4}
                    className={`resize-none py-3 ${field}`}
                  />
                  <div className="flex items-center justify-between gap-3 text-[12px]">
                    <span role="alert" className="text-[#d70015] dark:text-[#ff6961]">
                      {error}
                    </span>
                    <span className="tabular-nums text-[#86868b] dark:text-[#8e8e93]">
                      {msg.length} / {MAX_MESSAGE}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="v" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Recorder key={round} onClip={setClip} demo={demo} onDemoDone={demoDone} />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              layout
              whileTap={{ scale: 0.97 }}
              className={`flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-colors disabled:opacity-60 ${focusRing} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e] ${
                sent ? "bg-[#248a3d] text-white dark:bg-[#30d158] dark:text-black" : "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
              }`}
              disabled={tab === "voice" && !clip && !sent}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {sent ? (
                  <motion.span key="s" role="status" className="flex items-center gap-2" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                    </svg>
                    Sent. Talk soon.
                  </motion.span>
                ) : (
                  <motion.span key={`n-${tab}-${clip ? 1 : 0}`} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
                    {tab === "voice" ? (clip ? "Send voice note" : "Record a note first") : "Send message"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>
        </LayoutGroup>
      </div>
    </section>
  );
}
