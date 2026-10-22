"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface StepLoaderProps {
  /** The steps of the job, in order. The last one is shown briefly as "done" before the result appears. */
  steps?: string[];
  /** How long each step stays current, in ms. Under 800 the finish tick plays on every second step instead of every step. */
  stepMs?: number;
  /** Heading shown before the job starts. */
  title?: string;
  /** Line under the heading before the job starts. */
  idleText?: string;
  /** Label of the button that starts the job. */
  startLabel?: string;
  /** Heading of the result once every step has finished. */
  doneTitle?: string;
  /** Line under the result heading. */
  doneText?: string;
  /** Label of the button on the result. */
  actionLabel?: string;
  /** Called once when every step has finished. */
  onComplete?: () => void;
  /** Called when Cancel is pressed. */
  onCancel?: () => void;
  /** Called when the button on the result is pressed. */
  onAction?: () => void;
  /** Starts the job by itself, shows the result, and starts again, until someone touches the card. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const STEP_LOADER_STEPS = ["Creating your workspace", "Importing 248 customers", "Matching accounts to plans", "Building your first dashboard", "Inviting your team", "Ready"];
const H = 44;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Run = "idle" | "running" | "done" | "cancelled";

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

/**
 * A loader for long jobs that keeps people oriented. The current step sits
 * in the middle, finished steps roll up and tick, upcoming ones wait below
 * faded, and a ring around the count shows overall progress. Cancel is
 * always there. When it finishes, the list folds away into the result.
 * Start and Cancel are real buttons and focus moves to the next one; the
 * current step is announced to screen readers.
 */
export function StepLoader({
  steps = STEP_LOADER_STEPS,
  stepMs = 1050,
  title = "Set up your workspace",
  idleText = "This takes about six seconds.",
  startLabel = "Start setup",
  doneTitle = "Your workspace is ready",
  doneText = "248 customers imported, dashboard built, 3 invites sent.",
  actionLabel = "Open workspace",
  onComplete,
  onCancel,
  onAction,
  autoplay = false,
  enableSound = true,
  className = "",
}: StepLoaderProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState<Run>("idle");
  const [i, setI] = useState(0);
  const [autoRun, setAutoRun] = useState(false);
  const [manual, setManual] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const active = useDemoActive(root, autoplay && !reduce);
  const paused = autoRun && autoplay && !active;
  const last = Math.max(0, steps.length - 1);

  const start = (auto: boolean) => {
    setI(0);
    setAutoRun(auto);
    setManual(!auto);
    setRun("running");
  };

  // The latest handlers and sound player, read from timers and the demo.
  const latest = useRef({ play, start, onComplete });
  useEffect(() => {
    latest.current = { play, start, onComplete };
  });

  // The job: one timer per step. It stops while a demo run is paused off screen.
  useEffect(() => {
    if (run !== "running" || paused) return;
    const sound = (name: "tick" | "done", vol: number) => (autoRun ? latest.current.play.auto(name, vol) : latest.current.play(name, vol));
    if (i < last) {
      const id = window.setTimeout(() => {
        // A step just finished: tick on every step when the run is slow enough, else on every second one.
        if (stepMs >= 800 || i % 2 === 1) sound("tick", 0.4);
        setI(i + 1);
      }, stepMs);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      sound("done", 0.6);
      setRun("done");
      latest.current.onComplete?.();
    }, stepMs + 200);
    return () => window.clearTimeout(id);
  }, [run, i, last, stepMs, autoRun, paused]);

  // Demo: start the job, show the result for a moment, start again.
  useEffect(() => {
    if (!autoplay || reduce || !active || touched.current) return;
    if (run !== "idle" && run !== "done") return;
    const id = window.setTimeout(() => {
      if (!touched.current) latest.current.start(true);
    }, run === "idle" ? 900 : 3200);
    return () => window.clearTimeout(id);
  }, [autoplay, reduce, active, run]);

  const p = run === "done" ? 1 : i / Math.max(1, last);
  const cardMotion = reduce ? { duration: 0.15 } : undefined;
  const heading = run === "cancelled" ? "Setup cancelled" : title;
  const sub = run === "cancelled" ? "Nothing was changed. Start again any time." : idleText;

  return (
    <div
      ref={root}
      className={`relative flex h-[420px] w-[440px] max-w-full flex-col items-center justify-center overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <span className="sr-only" role="status" aria-live="polite">
        {run === "running" ? `Step ${i + 1} of ${steps.length}: ${steps[i] ?? ""}` : run === "done" ? doneTitle : run === "cancelled" ? "Setup cancelled" : ""}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {run === "running" ? (
          <motion.div
            key="run"
            className="flex w-full flex-col items-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            transition={cardMotion}
          >
            <div className="relative h-14 w-14" aria-hidden="true">
              <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" className="stroke-[#ececf0] dark:stroke-[#3a3a3c]" />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.max(0.03, p) }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">
                {i + 1}/{steps.length}
              </span>
            </div>
            {/* the reel of steps: the current one is always in the middle */}
            <div
              className="relative mt-6 w-full overflow-hidden"
              style={{ height: H * 5, maskImage: "linear-gradient(transparent, #000 30%, #000 70%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 30%, #000 70%, transparent)" }}
              aria-hidden="true"
            >
              <motion.ul className="m-0 list-none p-0" animate={{ y: H * 2 - i * H }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 26 }}>
                {steps.map((s, k) => (
                  <motion.li
                    key={k}
                    className="flex items-center justify-center gap-2.5"
                    style={{ height: H }}
                    animate={{ opacity: k === i ? 1 : k < i ? 0.45 : 0.3, scale: k === i || reduce ? 1 : 0.92 }}
                    transition={cardMotion}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">
                      {k < i ? (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="11" className="fill-[#34c759] dark:fill-[#30d158]" />
                          <motion.path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} />
                        </svg>
                      ) : k === i ? (
                        reduce ? (
                          <span className="h-4 w-4 rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]" />
                        ) : (
                          <motion.span
                            className="h-4 w-4 rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                        )
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[#d2d2d7] dark:bg-[#48484a]" />
                      )}
                    </span>
                    <span className={`text-[16px] ${k === i ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{s}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            <button
              type="button"
              autoFocus={manual}
              onClick={() => {
                touched.current = true;
                play("off", 0.5);
                setManual(true);
                setRun("cancelled");
                onCancel?.();
              }}
              className={`mt-4 h-9 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
            >
              Cancel
            </button>
          </motion.div>
        ) : run === "done" ? (
          <motion.div key="done" className="text-center" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={cardMotion}>
            <motion.svg
              className="mx-auto"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              initial={{ scale: reduce ? 1 : 0.4 }}
              animate={{ scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="11" className="fill-[#34c759] dark:fill-[#30d158]" />
              <motion.path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduce ? 0 : 0.15 }} />
            </motion.svg>
            <h3 className="m-0 mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{doneTitle}</h3>
            <p className="m-0 mt-1 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{doneText}</p>
            <button
              type="button"
              onClick={() => onAction?.()}
              className={`mt-5 h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] ${FOCUS}`}
            >
              {actionLabel}
            </button>
          </motion.div>
        ) : (
          <motion.div key="idle" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={cardMotion}>
            <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h3>
            <p className="m-0 mt-1 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{sub}</p>
            <button
              type="button"
              autoFocus={manual}
              onClick={() => {
                touched.current = true;
                start(false);
              }}
              className={`mt-5 h-10 rounded-full bg-[#0071e3] px-5 text-[14px] font-medium text-white hover:bg-[#0077ed] ${FOCUS}`}
            >
              {run === "cancelled" ? "Start again" : startLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
