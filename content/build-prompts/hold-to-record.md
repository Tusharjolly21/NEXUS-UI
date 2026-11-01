Add the "Hold to Record" component from Nexus UI to my project.

Press and hold to record a voice note, release to keep it. A soft halo behind the record dot swells with your voice, the live waveform scrolls in from the right, and sliding left morphs the dot into a bin whose lid opens; let go there to throw the note away. Kept notes become a small player. Also includes Voice Dictation: Bars move with your voice, words arrive faint while they're guesses and firm up when sure, and corrections like “for” to “4” visibly swap in place.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { HoldToRecord } from "@/components/hold-to-record/hold-to-record";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/hold-to-record/hold-to-record.tsx ---

```tsx
"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

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
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
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
  enableSound = true,
  className,
}: HoldToRecordProps) {
  const sfx = useSound(enableSound);
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
      if (demo) sfx.auto("on");
      else sfx("on");
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
          if (!s.demo) sfx("hush", 0.7);
          setPhase("idle");
          if (!s.demo) {
            setHint("Recording discarded");
            onCancel?.();
          }
          return;
        }
        if (s.demo) sfx.auto("off");
        else sfx("off");
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
    [cancelDistance, maxDuration, minDuration, onCancel, onRecorded, useMicrophone, dragRaw, level, progress, sfx],
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
  const demo = React.useRef({ begin, play, remove, sfx });
  React.useLayoutEffect(() => {
    demo.current = { begin, play, remove, sfx };
  });

  React.useEffect(() => {
    if (!autoplay) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      at(900, () => demo.current.begin(0, true));
      at(3700, () => session.current?.finish(true));
      at(4400, () => {
        demo.current.sfx.auto("tap", 0.6);
        demo.current.play();
      });
      at(9200, () => {
        demo.current.sfx.auto("tap", 0.6);
        demo.current.remove(true);
      });
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
                onClick={() => {
                  sfx("tap", 0.6);
                  if (playing) pause();
                  else play();
                }}
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
                onClick={() => {
                  sfx("tap", 0.6);
                  remove();
                }}
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
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Voice Dictation

Add the "Voice Dictation" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { VOICE_DICTATION_SCRIPT, VoiceDictation } from "@/components/hold-to-record/voice-dictation";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/hold-to-record/voice-dictation.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface VoiceDictationWord {
  /** The word as first heard. */
  w: string;
  /** What the word becomes once there is more context ("for" becoming "4"). */
  fix?: string;
  /** Extra wait in ms before this word arrives, for a natural pause. */
  pause?: number;
}

export interface VoiceDictationProps {
  /** The words the demo "hears", in order, with the ones that get corrected. Defaults to a short reminder. */
  script?: VoiceDictationWord[];
  /** Label at the top left of the card. */
  title?: string;
  /** Called with the finished text when Save is pressed. The card then goes back to its start. */
  onSave?: (text: string) => void;
  /** Starts a dictation, lets it finish, and repeats, until someone touches the component. Never runs under reduced motion and pauses when off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const VOICE_DICTATION_SCRIPT: VoiceDictationWord[] = [
  { w: "Remind" },
  { w: "me" },
  { w: "to" },
  { w: "send" },
  { w: "the" },
  { w: "deck" },
  { w: "to" },
  { w: "Leo" },
  { w: "by", pause: 300 },
  { w: "for", fix: "4" },
  { w: "pm", fix: "PM" },
  { w: "tomorrow." },
];

const BARS = 32;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type DictationState = "idle" | "listening" | "done";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/** The simulated voice level bars. They live in their own component so the fast updates never re-render the transcript. They settle into a flat line when not listening. */
function LevelBars({ listening, reduce }: { listening: boolean; reduce: boolean }) {
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.08));
  useEffect(() => {
    if (!listening || reduce) return;
    let raf = 0;
    let ph = 0;
    const tick = () => {
      ph += 0.18;
      const env = 0.35 + 0.55 * Math.abs(Math.sin(ph * 0.35)) * (0.6 + Math.random() * 0.4);
      setLevels((prev) => [...prev.slice(1), Math.max(0.08, Math.min(1, env * (0.5 + Math.random() * 0.7)))]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setLevels(Array(BARS).fill(0.08));
    };
  }, [listening, reduce]);
  return (
    <div className="flex h-12 flex-1 items-center gap-[3px]" aria-hidden="true">
      {levels.map((l, i) => (
        <motion.span
          key={i}
          className={cn("flex-1 rounded-full transition-colors duration-200", listening ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#48484a]")}
          animate={{ height: `${Math.round(l * 100)}%` }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ minHeight: 3 }}
        />
      ))}
    </div>
  );
}

/** The recording clock, counted from when it mounts. */
function Clock() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => setSecs(Math.floor((performance.now() - t0) / 1000)), 250);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
    </>
  );
}

/**
 * Dictation that shows you it's listening and what it heard. The bars move
 * with your voice, each word arrives faint while it's still a guess and
 * firms up once it's sure, and words it corrects with more context
 * ("for" becoming "4") visibly swap in place. Stop and the bars settle into
 * a line and the text is ready to save. The voice and the words are a
 * simulation: no microphone is used. Under reduced motion the bars stay
 * still and words appear with a plain fade.
 */
export function VoiceDictation({ script = VOICE_DICTATION_SCRIPT, title = "New reminder", onSave, autoplay = false, enableSound = true, className }: VoiceDictationProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<DictationState>("idle");
  const [n, setN] = useState(0); // words heard
  const [sure, setSure] = useState(0); // words confirmed
  const [fixed, setFixed] = useState<Set<number>>(() => new Set());
  const timers = useRef<number[]>([]);
  const touched = useRef(false);
  /** Who started the current dictation, so the stop sound matches. */
  const origin = useRef<"user" | "auto">("user");
  const active = useDemoActive(root, autoplay && !reduce);
  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const finalText = script.map((x) => x.fix ?? x.w).join(" ");
  const sound = (name: "on" | "off") => {
    if (origin.current === "user") play(name, 0.5);
    else play.auto(name, 0.5);
  };
  const allFixed = () => new Set(script.map((x, i) => (x.fix ? i : -1)).filter((i) => i >= 0));

  const start = (from: "user" | "auto") => {
    clear();
    origin.current = from;
    sound("on");
    setState("listening");
    setN(0);
    setSure(0);
    setFixed(new Set());
    const at = (fn: () => void, t: number) => timers.current.push(window.setTimeout(fn, t));
    let t = 500;
    script.forEach((x, i) => {
      t += 230 + (x.pause ?? 0);
      at(() => setN(i + 1), t);
      at(() => setSure(i + 1), t + 520);
      const fix = x.fix;
      if (fix) at(() => setFixed((f) => new Set(f).add(i)), t + 900);
    });
    at(() => {
      sound("off");
      setState("done");
    }, t + 1500);
  };
  const stop = () => {
    clear();
    sound("off");
    setN(script.length);
    setSure(script.length);
    setFixed(allFixed());
    setState("done");
  };
  const reset = () => {
    clear();
    setState("idle");
    setN(0);
    setSure(0);
    setFixed(new Set());
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ start, reset });
  useEffect(() => {
    latest.current = { start, reset };
  });

  // Demo: wait, start listening, let it finish, rest, go back to the start.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    if (state === "idle") {
      const id = window.setTimeout(() => {
        if (!touched.current) latest.current.start("auto");
      }, 1200);
      return () => window.clearTimeout(id);
    }
    if (state === "done") {
      const id = window.setTimeout(() => {
        if (!touched.current) latest.current.reset();
      }, 3600);
      return () => window.clearTimeout(id);
    }
  }, [state, autoplay, reduce, active]);

  const listening = state === "listening";
  const pop = reduce ? { duration: 0.12 } : undefined;
  const status = listening ? "Listening" : state === "done" ? `Dictation ready: ${finalText}` : "";

  return (
    <div
      ref={root}
      className={cn(
        "w-[480px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{title}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            aria-hidden="true"
            className={listening ? "flex items-center gap-1.5 font-medium tabular-nums text-[#d70015] dark:text-[#ff453a]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={pop}
          >
            {listening ? (
              <>
                <motion.span className="h-2 w-2 rounded-full bg-[#ff3b30]" animate={reduce ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                <Clock />
              </>
            ) : state === "done" ? (
              "Ready"
            ) : (
              "Tap the mic and talk"
            )}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
      <div role="group" aria-label="Transcript" className="mt-3 min-h-[96px] rounded-[16px] bg-[#f5f5f7] p-4 text-[18px] leading-[1.5] tracking-[-0.01em] dark:bg-[#2c2c2e]">
        {n === 0 && !listening && <span className="text-[#86868b] dark:text-[#8e8e93]">What should I remember?</span>}
        {script.slice(0, n).map((x, i) => {
          const ok = i < sure;
          const swapped = fixed.has(i);
          return (
            <span key={i} className="relative mr-[0.28em] inline-block">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={swapped ? "f" : "w"}
                  className={cn("inline-block transition-colors duration-300", ok ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#8e8e93]")}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: swapped ? -10 : 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
                  transition={{ duration: reduce ? 0.12 : 0.28 }}
                >
                  {swapped ? x.fix : x.w}
                </motion.span>
              </AnimatePresence>
              {swapped && <motion.span aria-hidden="true" className="absolute -inset-x-1 inset-y-0 rounded-[5px] bg-[#0071e3]/15 dark:bg-[#0a84ff]/30" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: reduce ? 0 : 0.3, duration: reduce ? 0.2 : 0.9 }} />}
            </span>
          );
        })}
        {listening && <motion.span aria-hidden="true" className="inline-block h-[1em] w-[2px] translate-y-[3px] bg-[#0071e3] dark:bg-[#0a84ff]" animate={reduce ? undefined : { opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => {
            touched.current = true;
            if (listening) stop();
            else start("user");
          }}
          aria-label={listening ? "Stop dictation" : "Start dictation"}
          className={cn(
            "relative flex h-12 w-12 flex-none items-center justify-center rounded-full transition-colors duration-200",
            listening ? "bg-[#ff3b30] text-white" : "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
            FOCUS,
          )}
          whileTap={reduce ? undefined : { scale: 0.92 }}
        >
          {listening && !reduce && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#ff3b30]" animate={{ scale: [1, 1.5], opacity: [0.35, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />}
          <AnimatePresence mode="popLayout" initial={false}>
            {listening ? (
              <motion.span key="stop" aria-hidden="true" className="relative h-4 w-4 rounded-[4px] bg-white" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={pop} />
            ) : (
              <motion.svg key="mic" className="relative" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={pop} aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0014 0M12 18v3" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
        {/* live level bars; they settle into a flat line when idle */}
        <LevelBars listening={listening} reduce={reduce} />
        <AnimatePresence>
          {state === "done" && (
            <motion.button
              type="button"
              onClick={() => {
                touched.current = true;
                onSave?.(finalText);
                reset();
              }}
              className={cn("h-10 flex-none whitespace-nowrap rounded-full bg-[#0071e3] px-4 text-[14px] font-medium text-white", FOCUS)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
              transition={pop}
            >
              Save
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
