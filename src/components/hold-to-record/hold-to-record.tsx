"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export type HoldToRecordResult = {
  durationMs: number;
  /** Normalised loudness samples (0-1), roughly 12 per second. */
  levels: number[];
};

export type HoldToRecordProps = {
  /** Called when a recording is kept (not cancelled). */
  onRecorded?: (result: HoldToRecordResult) => void;
  /** Called when a recording is cancelled by sliding away or pressing Escape. */
  onCancel?: () => void;
  /** Called when the kept note is deleted. */
  onDelete?: () => void;
  /** Recording stops by itself after this many ms. */
  maxDuration?: number;
  /** Holds shorter than this are ignored, in ms. */
  minDuration?: number;
  /** Drive the waveform from the real microphone (asks for permission). Simulated otherwise. */
  useMicrophone?: boolean;
  /** How far to slide left (px) before releasing cancels. */
  cancelDistance?: number;
  label?: string;
  /** Colour of the record button, the halo and the live waveform. */
  accent?: string;
  /** Records, plays back and deletes a demo note on a loop (no callbacks fire) until someone touches it. */
  autoplay?: boolean;
  className?: string;
};

type Phase = "idle" | "recording" | "recorded";

const SAMPLE_MS = 80;
const LIVE_BARS = 22;
const NOTE_BARS = 30;

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function resample(levels: number[], count: number) {
  if (!levels.length) return Array.from({ length: count }, () => 0.2);
  const peak = Math.max(0.2, ...levels);
  return Array.from({ length: count }, (_, i) => {
    const a = Math.floor((i / count) * levels.length);
    const b = Math.max(a + 1, Math.floor(((i + 1) / count) * levels.length));
    return levels.slice(a, b).reduce((m, v) => Math.max(m, v), 0) / peak;
  });
}

function MicGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="6" y="1.8" width="6" height="9.4" rx="3" fill="currentColor" />
      <path d="M3.6 8.6a5.4 5.4 0 0 0 10.8 0M9 14v2.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Trash({ open }: { open: MotionValue<number> }) {
  const lid = useTransform(open, [0, 1], [0, -38]);
  const lift = useTransform(open, [0, 1], [0, -2]);
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="overflow-visible">
      <motion.g style={{ rotate: lid, y: lift, originX: "3px", originY: "5px" }}>
        <path d="M3 5h12M7 5V3.4h4V5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <path d="M4.6 7.2 5.4 15.6h7.2l.8-8.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoteBar({ level, index, progress, still }: { level: number; index: number; progress: MotionValue<number>; still: boolean }) {
  const at = index / NOTE_BARS;
  const bg = useTransform(progress, (p) => (p > at ? "var(--htr-ink)" : "var(--htr-dim)"));
  return (
    <motion.span
      className="w-[3px] rounded-full"
      style={{ backgroundColor: bg }}
      initial={still ? false : { height: 3 }}
      animate={{ height: 4 + level * 20 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, delay: still ? 0 : index * 0.012 }}
    />
  );
}

/**
 * Press and hold to record a voice note. A soft halo behind the record dot
 * swells with your voice, the live waveform scrolls in from the right, and
 * sliding left drags the strip toward a bin whose lid opens; let go there to
 * throw the note away. Kept notes become a small player.
 */
export function HoldToRecord({
  onRecorded,
  onCancel,
  onDelete,
  maxDuration = 60_000,
  minDuration = 400,
  useMicrophone = false,
  cancelDistance = 90,
  label = "Hold to record",
  accent = "#ff3b30",
  autoplay = false,
  className,
}: HoldToRecordProps) {
  const reduce = useReducedMotion() === true;
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [sec, setSec] = React.useState(0);
  const [cancelling, setCancelling] = React.useState(false);
  const [note, setNote] = React.useState<HoldToRecordResult | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [playSec, setPlaySec] = React.useState(0);
  const [hint, setHint] = React.useState("");

  const level = useMotionValue(0.1);
  const halo = useSpring(level, { stiffness: 300, damping: 16 });
  const haloScale = useTransform(halo, (l) => (reduce ? 1 : 1 + l * 0.7));
  const haloOpacity = useTransform(halo, (l) => 0.18 + l * 0.3);
  const dragRaw = useMotionValue(0);
  const drag = useSpring(dragRaw, { stiffness: 500, damping: 36 });
  const stripX = useTransform(drag, (d) => d * 0.35);
  const lidOpen = useTransform(dragRaw, (d) => Math.min(1, Math.max(0, -d / cancelDistance)));
  const dotScale = useTransform(lidOpen, (o) => 1 - o * 0.7);
  const dotOpacity = useTransform(lidOpen, (o) => 1 - o);
  const progress = useMotionValue(0);
  const playAnim = React.useRef<AnimationPlaybackControls | null>(null);
  const bars = React.useRef<(HTMLSpanElement | null)[]>([]);
  const touched = React.useRef(false);

  const session = React.useRef<{ start: number; x: number; levels: number[]; demo: boolean; stop: () => void; finish: (keep: boolean) => void } | null>(null);

  useMotionValueEvent(progress, "change", (p) => {
    if (note) setPlaySec(Math.floor((p * note.durationMs) / 1000));
  });

  const begin = React.useCallback(
    (clientX: number, demo = false) => {
      if (session.current) return;
      setHint("");
      dragRaw.set(0);
      setCancelling(false);
      setSec(0);
      setPhase("recording");
      const start = performance.now();
      const levels: number[] = [];
      const live = Array<number>(LIVE_BARS).fill(0.08);

      let phaseT = Math.random() * 10;
      const simulated = () => {
        phaseT += 0.18;
        const syllable = Math.abs(Math.sin(phaseT * 2.3)) * (0.5 + 0.5 * Math.abs(Math.sin(phaseT * 0.7)));
        const pause = Math.sin(phaseT * 0.37) > 0.9 ? 0.2 : 1;
        return Math.min(1, 0.1 + syllable * 0.8 * pause + Math.random() * 0.15);
      };
      let readLevel = simulated;
      let teardown = () => {};
      if (!demo && useMicrophone && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        let stream: MediaStream | null = null;
        let ctx: AudioContext | null = null;
        let stopped = false;
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((s) => {
            if (stopped) {
              s.getTracks().forEach((t) => t.stop());
              return;
            }
            stream = s;
            ctx = new AudioContext();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            ctx.createMediaStreamSource(s).connect(analyser);
            const buf = new Uint8Array(analyser.fftSize);
            readLevel = () => {
              analyser.getByteTimeDomainData(buf);
              let sum = 0;
              for (const v of buf) sum += ((v - 128) / 128) ** 2;
              return Math.min(1, Math.sqrt(sum / buf.length) * 4.5);
            };
          })
          .catch(() => {
            readLevel = simulated;
          });
        teardown = () => {
          stopped = true;
          stream?.getTracks().forEach((t) => t.stop());
          void (ctx as AudioContext | null)?.close();
        };
      }

      // Bars are written straight to the DOM, so the strip never re-renders per sample.
      const timer = window.setInterval(() => {
        const l = readLevel();
        levels.push(l);
        live.shift();
        live.push(l);
        level.set(l);
        bars.current.forEach((el, i) => {
          if (el) el.style.transform = `scaleY(${(4 + live[i] * 22) / 26})`;
        });
        const t = performance.now() - start;
        setSec(Math.floor(t / 1000));
        if (t >= maxDuration) session.current?.finish(true);
      }, SAMPLE_MS);

      const onMove = (e: PointerEvent) => {
        if (!session.current) return;
        const dx = Math.min(0, e.clientX - session.current.x);
        dragRaw.set(dx);
        setCancelling(dx <= -cancelDistance);
      };
      const onUp = (e: PointerEvent) => {
        if (!session.current) return;
        session.current.finish(e.clientX - session.current.x > -cancelDistance);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") session.current?.finish(false);
      };
      if (!demo) {
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        window.addEventListener("keydown", onKey);
      }

      const stop = () => {
        window.clearInterval(timer);
        teardown();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        window.removeEventListener("keydown", onKey);
      };

      const finish = (keep: boolean) => {
        const s = session.current;
        if (!s) return;
        s.stop();
        session.current = null;
        level.set(0.1);
        const durationMs = performance.now() - s.start;
        dragRaw.set(0);
        setCancelling(false);
        if (!keep) {
          setPhase("idle");
          if (!s.demo) {
            setHint("Recording discarded");
            onCancel?.();
          }
          return;
        }
        if (durationMs < minDuration) {
          setPhase("idle");
          setHint("Hold a little longer");
          return;
        }
        const result = { durationMs, levels: s.levels.slice() };
        progress.set(0);
        setPlaySec(0);
        setNote(result);
        setPlaying(false);
        setPhase("recorded");
        if (!s.demo) onRecorded?.(result);
      };

      session.current = { start, x: clientX, levels, demo, stop, finish };
    },
    [cancelDistance, maxDuration, minDuration, onCancel, onRecorded, useMicrophone, dragRaw, level, progress],
  );

  React.useEffect(
    () => () => {
      session.current?.stop();
      playAnim.current?.stop();
    },
    [],
  );

  const play = React.useCallback(() => {
    if (!note) return;
    playAnim.current?.stop();
    if (progress.get() >= 1) progress.set(0);
    setPlaying(true);
    const remaining = (1 - progress.get()) * note.durationMs;
    // Playback is a clock, so it runs at constant speed.
    playAnim.current = animate(progress, 1, {
      duration: remaining / 1000,
      ease: "linear",
      onComplete: () => {
        setPlaying(false);
        playAnim.current = animate(progress, 0, { type: "spring", stiffness: 120, damping: 20, delay: 0.5 });
      },
    });
  }, [note, progress]);

  const pause = React.useCallback(() => {
    playAnim.current?.stop();
    setPlaying(false);
  }, []);

  const remove = React.useCallback(
    (demo = false) => {
      playAnim.current?.stop();
      setPhase("idle");
      setNote(null);
      setPlaying(false);
      if (!demo) onDelete?.();
    },
    [onDelete],
  );

  // The demo loop reads the latest handlers through a ref, so re-renders don't restart it.
  const demo = React.useRef({ begin, play, remove });
  React.useLayoutEffect(() => {
    demo.current = { begin, play, remove };
  });

  React.useEffect(() => {
    if (!autoplay) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      at(900, () => demo.current.begin(0, true));
      at(3700, () => session.current?.finish(true));
      at(4400, () => demo.current.play());
      at(9200, () => demo.current.remove(true));
      at(10200, loop);
    };
    loop();
    return () => timers.forEach(clearTimeout);
  }, [autoplay]);

  const noteBars = React.useMemo(() => (note ? resample(note.levels, NOTE_BARS) : []), [note]);
  const spring = { type: "spring" as const, stiffness: 420, damping: 32 };
  const total = note ? Math.max(1, Math.round(note.durationMs / 1000)) : 0;

  return (
    <div
      className={cn(
        "relative inline-flex max-w-full flex-col items-center [--htr-ink:#1d1d1f] [--htr-dim:#d2d2d7] dark:[--htr-ink:#f5f5f7] dark:[--htr-dim:#48484a]",
        className,
      )}
      onPointerDownCapture={() => {
        touched.current = true;
        if (session.current?.demo) session.current.finish(false);
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
    >
      <motion.div
        layout={!reduce}
        transition={spring}
        className={cn(
          "relative max-w-full overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-colors duration-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
          cancelling ? "bg-[#fff1f0] dark:bg-[#3a1715]" : "bg-white dark:bg-[#1c1c1e]",
        )}
        style={{ borderRadius: 999 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "idle" ? (
            <motion.button
              key="idle"
              type="button"
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                begin(e.clientX);
              }}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  const r = e.currentTarget.getBoundingClientRect();
                  begin(r.left + r.width / 2);
                  const up = (k: KeyboardEvent) => {
                    if (k.key !== e.key) return;
                    window.removeEventListener("keyup", up);
                    session.current?.finish(true);
                  };
                  window.addEventListener("keyup", up);
                }
              }}
              className="flex h-14 select-none items-center gap-3 whitespace-nowrap rounded-full pl-2 pr-5 text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] outline-none [touch-action:none] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
              aria-label={`${label}. Hold Space to record, slide left or press Escape to cancel.`}
            >
              <span className="grid size-10 place-items-center rounded-full text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)]" style={{ backgroundColor: accent }}>
                <MicGlyph />
              </span>
              {label}
            </motion.button>
          ) : phase === "recording" ? (
            <motion.div
              key="rec"
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.14 } }}
              role="status"
              aria-label={cancelling ? "Release to cancel" : `Recording, ${formatTime(sec)}`}
              className="relative flex h-14 w-[330px] max-w-full select-none items-center gap-3 pl-3 pr-4 [touch-action:none]"
            >
              <span className="relative grid size-8 shrink-0 place-items-center" aria-hidden="true">
                <motion.span className="absolute inset-0 grid place-items-center" style={{ scale: dotScale, opacity: dotOpacity }}>
                  <motion.span className="absolute inset-0 rounded-full" style={{ backgroundColor: accent, scale: haloScale, opacity: haloOpacity }} />
                  <span className="relative size-3 rounded-full" style={{ backgroundColor: accent }} />
                </motion.span>
                <motion.span className={cn("absolute", cancelling ? "text-[#d70015] dark:text-[#ff6961]" : "text-[#6e6e73] dark:text-[#a1a1a6]")} style={{ opacity: lidOpen }}>
                  <Trash open={lidOpen} />
                </motion.span>
              </span>
              <motion.span className="flex min-w-0 flex-1 items-center gap-3" style={{ x: stripX }}>
                <span className="w-9 shrink-0 text-[15px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{formatTime(sec)}</span>
                <motion.span className="flex h-[26px] flex-1 items-center justify-end gap-[3px] overflow-hidden" animate={{ opacity: cancelling ? 0.25 : 1 }} aria-hidden="true">
                  {Array.from({ length: LIVE_BARS }, (_, i) => (
                    <span
                      key={i}
                      ref={(el) => {
                        bars.current[i] = el;
                      }}
                      className="h-[26px] w-[3px] shrink-0 rounded-full transition-transform duration-75"
                      style={{ backgroundColor: accent, opacity: 0.3 + (i / LIVE_BARS) * 0.7, transform: "scaleY(0.2)" }}
                    />
                  ))}
                </motion.span>
              </motion.span>
              <span
                className={cn(
                  "relative shrink-0 text-[12px] transition-colors",
                  cancelling ? "font-semibold text-[#d70015] dark:text-[#ff6961]" : "text-[#6e6e73] dark:text-[#a1a1a6]",
                )}
              >
                {cancelling ? "Release to cancel" : "Slide to cancel"}
              </span>
            </motion.div>
          ) : note ? (
            <motion.div
              key="note"
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex h-14 w-[316px] max-w-full items-center gap-3 pl-2 pr-2"
            >
              <motion.button
                type="button"
                whileTap={reduce ? undefined : { scale: 0.9 }}
                onClick={() => (playing ? pause() : play())}
                aria-label={playing ? "Pause voice note" : "Play voice note"}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.svg
                    key={playing ? "pause" : "play"}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    aria-hidden="true"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 26 }}
                  >
                    {playing ? <path d="M3.5 2.5h2.2v9H3.5zM8.3 2.5h2.2v9H8.3z" fill="currentColor" /> : <path d="M4 2.2v9.6a.5.5 0 0 0 .76.43l7.6-4.8a.5.5 0 0 0 0-.86L4.76 1.77A.5.5 0 0 0 4 2.2Z" fill="currentColor" />}
                  </motion.svg>
                </AnimatePresence>
              </motion.button>
              <span className="flex h-7 flex-1 items-center gap-[3px]" aria-hidden="true">
                {noteBars.map((l, i) => (
                  <NoteBar key={i} level={l} index={i} progress={progress} still={reduce} />
                ))}
              </span>
              <span className="w-9 shrink-0 text-right text-[13px] font-medium tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{formatTime(playing || playSec > 0 ? playSec : total)}</span>
              <button
                type="button"
                onClick={() => remove()}
                aria-label="Delete voice note"
                className="grid size-8 shrink-0 place-items-center rounded-full text-[#6e6e73] transition-colors hover:bg-[#f0f0f3] hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] dark:hover:text-[#f5f5f7] dark:focus-visible:outline-[#0a84ff]"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {hint && phase === "idle" ? (
          <motion.p
            key={hint}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2.5 whitespace-nowrap text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <p aria-live="polite" className="sr-only">
        {phase === "recording" ? "Recording" : phase === "recorded" ? "Voice note recorded" : hint}
      </p>
    </div>
  );
}
