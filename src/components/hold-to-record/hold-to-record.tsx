"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mic, Pause, Play, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type HoldToRecordResult = {
  durationMs: number;
  /** Normalised loudness samples (0–1), roughly 12 per second. */
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
  /** Colour of the recording dot and the live waveform. */
  accent?: string;
  className?: string;
};

type Phase = "idle" | "recording" | "recorded";

const SAMPLE_MS = 80;
const LIVE_BARS = 20;
const NOTE_BARS = 28;

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function resample(levels: number[], count: number) {
  if (!levels.length) return Array.from({ length: count }, () => 0.2);
  const peak = Math.max(0.2, ...levels);
  return Array.from({ length: count }, (_, i) => {
    const a = Math.floor((i / count) * levels.length);
    const b = Math.max(a + 1, Math.floor(((i + 1) / count) * levels.length));
    const slice = levels.slice(a, b);
    return slice.reduce((m, v) => Math.max(m, v), 0) / peak;
  });
}

export function HoldToRecord({
  onRecorded,
  onCancel,
  onDelete,
  maxDuration = 60_000,
  minDuration = 400,
  useMicrophone = false,
  cancelDistance = 90,
  label = "Hold to record",
  accent = "#ef4444",
  className,
}: HoldToRecordProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [elapsed, setElapsed] = React.useState(0);
  const [live, setLive] = React.useState<number[]>(() => Array(LIVE_BARS).fill(0.08));
  const [drag, setDrag] = React.useState(0);
  const [note, setNote] = React.useState<HoldToRecordResult | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [played, setPlayed] = React.useState(0);
  const [hint, setHint] = React.useState("");

  const session = React.useRef<{
    start: number;
    x: number;
    levels: number[];
    timer: number;
    stop: () => void;
    finish: (keep: boolean) => void;
  } | null>(null);

  const cancelling = phase === "recording" && drag <= -cancelDistance;

  const begin = React.useCallback(
    (clientX: number) => {
      if (session.current) return;
      setHint("");
      setDrag(0);
      setElapsed(0);
      setLive(Array(LIVE_BARS).fill(0.08));
      setPhase("recording");
      const start = performance.now();
      const levels: number[] = [];

      // loudness source: real mic (opt-in) or a believable simulated voice
      let readLevel: () => number;
      let teardown = () => {};
      let phaseT = Math.random() * 10;
      const simulated = () => {
        phaseT += 0.18;
        const syllable = Math.abs(Math.sin(phaseT * 2.3)) * (0.5 + 0.5 * Math.abs(Math.sin(phaseT * 0.7)));
        const pause = Math.sin(phaseT * 0.37) > 0.9 ? 0.2 : 1;
        return Math.min(1, 0.1 + syllable * 0.8 * pause + Math.random() * 0.15);
      };
      readLevel = simulated;
      if (useMicrophone && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
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

      const timer = window.setInterval(() => {
        const level = readLevel();
        levels.push(level);
        const t = performance.now() - start;
        setElapsed(t);
        setLive((prev) => [...prev.slice(1), level]);
        if (t >= maxDuration) session.current?.finish(true);
      }, SAMPLE_MS);

      const onMove = (e: PointerEvent) => {
        if (!session.current) return;
        setDrag(Math.min(0, e.clientX - session.current.x));
      };
      const onUp = (e: PointerEvent) => {
        if (!session.current) return;
        const dx = e.clientX - session.current.x;
        session.current.finish(dx > -cancelDistance);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") session.current?.finish(false);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      window.addEventListener("keydown", onKey);

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
        const durationMs = performance.now() - s.start;
        setDrag(0);
        if (!keep) {
          setPhase("idle");
          setHint("Recording discarded");
          onCancel?.();
          return;
        }
        if (durationMs < minDuration) {
          setPhase("idle");
          setHint("Hold a little longer");
          return;
        }
        const result = { durationMs, levels: s.levels.slice() };
        setNote(result);
        setPlayed(0);
        setPlaying(false);
        setPhase("recorded");
        onRecorded?.(result);
      };

      session.current = { start, x: clientX, levels, timer, stop, finish };
    },
    [cancelDistance, maxDuration, minDuration, onCancel, onRecorded, useMicrophone],
  );

  React.useEffect(() => () => session.current?.stop(), []);

  // playback of the kept note (visual only — wire `onRecorded` to real audio in your app)
  React.useEffect(() => {
    if (!playing || !note) return;
    const startAt = performance.now() - played * note.durationMs;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - startAt) / note.durationMs);
      setPlayed(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPlaying(false);
        window.setTimeout(() => setPlayed(0), 500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when play toggles
  }, [playing, note]);

  const noteBars = React.useMemo(() => (note ? resample(note.levels, NOTE_BARS) : []), [note]);
  const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <motion.div
        layout={!reduce}
        transition={spring}
        className={cn(
          "relative overflow-hidden rounded-full shadow-[0_1px_2px_rgba(16,17,20,0.06),0_12px_28px_-14px_rgba(16,17,20,0.35)] transition-colors duration-200",
          cancelling ? "bg-red-50 dark:bg-red-950/60" : "bg-white dark:bg-[#1b1b22]",
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
              className="flex h-12 select-none items-center gap-2.5 whitespace-nowrap rounded-full px-5 text-[15px] font-medium text-[#3c3b37] outline-none [touch-action:none] focus-visible:ring-2 focus-visible:ring-[#17181A] focus-visible:ring-offset-2 dark:text-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#0b0b10]"
              aria-label={`${label}. Hold Space to record, slide left or press Escape to cancel.`}
            >
              <Mic className="size-[18px]" strokeWidth={2.2} aria-hidden />
              {label}
            </motion.button>
          ) : phase === "recording" ? (
            <motion.div
              key="rec"
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              role="status"
              aria-label={cancelling ? "Release to cancel" : `Recording, ${formatTime(elapsed)}`}
              className="flex h-12 w-[340px] select-none items-center gap-3 pl-4 pr-5 [touch-action:none]"
            >
              <span className="relative grid size-3 shrink-0 place-items-center">
                {!reduce ? (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: accent }}
                    animate={{ scale: [1, 2.2], opacity: [0.45, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
                <span className="size-3 rounded-full" style={{ backgroundColor: accent }} />
              </span>
              <span className="w-9 shrink-0 text-[14px] font-medium tabular-nums text-[#17181A] dark:text-neutral-50">
                {formatTime(elapsed)}
              </span>

              <motion.span
                className="flex h-7 flex-1 items-center gap-[3px]"
                animate={{ x: Math.max(drag * 0.3, -22), opacity: cancelling ? 0.25 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                aria-hidden
              >
                {live.map((l, i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ backgroundColor: accent, opacity: 0.35 + (i / LIVE_BARS) * 0.65 }}
                    animate={{ height: 4 + l * 22 }}
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  />
                ))}
              </motion.span>

              <span
                className={cn(
                  "shrink-0 text-[12px] transition-colors",
                  cancelling ? "font-semibold text-red-600 dark:text-red-400" : "text-[#73726d] dark:text-neutral-400",
                )}
              >
                {cancelling ? (
                  <span className="inline-flex items-center gap-1">
                    <Trash2 className="size-3.5" aria-hidden />
                    Release to cancel
                  </span>
                ) : (
                  "‹ Slide to cancel"
                )}
              </span>
            </motion.div>
          ) : note ? (
            <motion.div
              key="note"
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex h-12 w-[320px] items-center gap-3 pl-1.5 pr-2"
            >
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause voice note" : "Play voice note"}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-[#17181A] text-white transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17181A] dark:bg-white dark:text-[#17181A] dark:focus-visible:outline-white"
              >
                {playing ? <Pause className="size-4 fill-current" aria-hidden /> : <Play className="ml-0.5 size-4 fill-current" aria-hidden />}
              </button>
              <span className="flex h-7 flex-1 items-center gap-[3px]" aria-hidden>
                {noteBars.map((l, i) => (
                  <motion.span
                    key={i}
                    initial={reduce ? false : { height: 3 }}
                    animate={{ height: 4 + l * 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22, delay: reduce ? 0 : i * 0.012 }}
                    className={cn(
                      "w-[3px] rounded-full transition-colors duration-150",
                      i / NOTE_BARS < played ? "bg-[#17181A] dark:bg-white" : "bg-black/20 dark:bg-white/25",
                    )}
                  />
                ))}
              </span>
              <span className="w-9 shrink-0 text-right text-[13px] font-medium tabular-nums text-[#73726d] dark:text-neutral-400">
                {formatTime(playing || played > 0 ? note.durationMs * played : note.durationMs)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPhase("idle");
                  setNote(null);
                  setPlaying(false);
                  onDelete?.();
                }}
                aria-label="Delete voice note"
                className="grid size-7 shrink-0 place-items-center rounded-full text-[#73726d] transition-colors hover:bg-black/[0.05] hover:text-[#17181A] focus-visible:outline-2 focus-visible:outline-[#17181A] dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="size-3.5" aria-hidden />
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
            className="absolute top-full mt-2.5 whitespace-nowrap text-[12px] text-[#73726d] dark:text-neutral-400"
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
