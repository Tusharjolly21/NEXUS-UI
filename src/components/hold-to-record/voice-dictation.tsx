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
