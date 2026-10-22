"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface PromiseToastProps {
  /** Called when "Visit" is pressed on the success toast. Nothing navigates on its own. */
  onVisit?: () => void;
  /** Called when "View logs" is pressed on the failure toast. */
  onViewLogs?: () => void;
  /** Runs a good deploy, then one with a bug, on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

type Step = { label: string; to: number; ms: number };
const STEPS: Step[] = [
  { label: "Installing dependencies", to: 0.22, ms: 900 },
  { label: "Building 48 pages", to: 0.64, ms: 1500 },
  { label: "Uploading to the edge", to: 0.92, ms: 1000 },
];
type Run = { id: number; fail: boolean; step: number; progress: number; state: "running" | "ok" | "fail" };

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const FOCUS_ON_DARK = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

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

function Icon({ state }: { state: Run["state"] }) {
  return (
    <span className="relative flex h-6 w-6 flex-none items-center justify-center" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "running" && (
          <motion.svg key="spin" width="22" height="22" viewBox="0 0 24 24" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ rotate: { duration: 0.9, repeat: Infinity, ease: "linear" } }}>
            <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2.5" />
            <path d="M12 3a9 9 0 019 9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </motion.svg>
        )}
        {state === "ok" && (
          <motion.svg key="ok" width="22" height="22" viewBox="0 0 24 24" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <circle cx="12" cy="12" r="11" fill="#30d158" />
            <motion.path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.12, duration: 0.3 }} />
          </motion.svg>
        )}
        {state === "fail" && (
          <motion.svg key="no" width="22" height="22" viewBox="0 0 24 24" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <circle cx="12" cy="12" r="11" fill="#ff453a" />
            <motion.path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.12, duration: 0.3 }} />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * A toast that follows a promise from start to finish instead of popping up
 * at the end. The pill shows each step as it happens with its own progress
 * filling behind the text, resizes smoothly as the wording changes, and lands
 * on success with the live link and actions, or on failure with the error
 * count and a way to the logs.
 */
export function PromiseToast({ onVisit, onViewLogs, autoplay = false, className = "" }: PromiseToastProps) {
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState<Run | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const touched = useRef(false);
  const nextFail = useRef(false);
  const runId = useRef(0);
  const active = useDemoActive(root, autoplay && !reduce);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = (fail: boolean) => {
    clear();
    runId.current += 1;
    const id = runId.current;
    setRun({ id, fail, step: 0, progress: 0.04, state: "running" });
    let t = 120;
    STEPS.forEach((s, i) => {
      if (fail && i === 2) return;
      timers.current.push(window.setTimeout(() => setRun((r) => (r && r.id === id ? { ...r, step: i, progress: s.to } : r)), t));
      t += s.ms;
    });
    timers.current.push(window.setTimeout(() => setRun((r) => (r && r.id === id ? { ...r, progress: fail ? r.progress : 1, state: fail ? "fail" : "ok" } : r)), t));
    timers.current.push(window.setTimeout(() => setRun((r) => (r && r.id === id ? null : r)), t + 4200));
  };

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  });

  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const go = () => {
      if (touched.current) return;
      startRef.current(nextFail.current);
      nextFail.current = !nextFail.current;
    };
    const first = window.setTimeout(go, 700);
    const id = window.setInterval(go, 8200);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [autoplay, reduce, active]);

  const label = !run ? "" : run.state === "ok" ? "Deployed to production" : run.state === "fail" ? "Build failed with 2 errors" : STEPS[run.step].label;
  const fill = run?.state === "fail" ? "rgba(255,69,58,.28)" : run?.state === "ok" ? "rgba(48,209,88,.24)" : "rgba(255,255,255,.12)";
  const settle = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 380, damping: 30, x: { duration: 0.4 } };

  return (
    <div
      ref={root}
      className={`flex w-[420px] max-w-full flex-col items-center gap-6 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative flex h-[200px] w-full items-end justify-center overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.3)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]">
        <span className="absolute left-5 top-4 text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">nexus-ui / marketing-site</span>
        <span className="sr-only" role="status" aria-live="polite">
          {label}
        </span>
        <AnimatePresence>
          {run && (
            <motion.div
              key={run.id}
              layout={!reduce}
              role="group"
              aria-label="Deploy progress"
              className="relative max-w-full overflow-hidden bg-[#1d1d1f] text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.55)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_40px_-16px_rgba(0,0,0,.9)]"
              style={{ borderRadius: 26 }}
              initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1, x: run.state === "fail" && !reduce ? [0, -8, 7, -4, 0] : 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { y: 24, opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.25 } }}
              transition={settle}
            >
              {/* progress lives behind the words */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full origin-left"
                style={{ background: fill }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: run.state === "running" ? run.progress : 1, opacity: run.state === "running" ? 1 : [1, 1, 0.5] }}
                transition={{ scaleX: reduce ? { duration: 0.15 } : { type: "spring", stiffness: 60, damping: 20 }, opacity: { duration: 1.2 } }}
              />
              <motion.div layout={reduce ? false : "position"} className="relative flex items-center gap-3 py-3 pl-3.5 pr-5">
                <Icon state={run.state} />
                <span className="relative block h-[20px] min-w-0 overflow-hidden" aria-hidden="true">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={label}
                      className="block whitespace-nowrap text-[14.5px] font-medium leading-[20px]"
                      initial={reduce ? { opacity: 0 } : { y: 16, opacity: 0, filter: "blur(4px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { y: -16, opacity: 0, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 34, filter: { duration: 0.2 } }}
                    >
                      {label}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {run.state === "running" && (
                  <motion.span layout={!reduce} aria-hidden="true" className="ml-1 text-[13px] tabular-nums text-white/50">
                    {Math.round(run.progress * 100)}%
                  </motion.span>
                )}
              </motion.div>
              <AnimatePresence initial={false}>
                {run.state !== "running" && (
                  <motion.div layout={!reduce} className="relative flex items-center gap-2 px-3.5 pb-3" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} exit={{ opacity: 0 }}>
                    {run.state === "ok" ? (
                      <>
                        <span className="mr-auto min-w-0 truncate rounded-full bg-white/10 px-3 py-1.5 font-mono text-[12px] text-white/80">marketing.nexus.app</span>
                        <button type="button" onClick={() => onVisit?.()} className={`h-8 flex-none rounded-full bg-white px-3.5 text-[13px] font-semibold text-[#1d1d1f] ${FOCUS_ON_DARK}`}>
                          Visit
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="mr-auto min-w-0 truncate font-mono text-[12px] text-[#ff9f9a]">pricing.tsx:42 · Unexpected token</span>
                        <button type="button" onClick={() => onViewLogs?.()} className={`h-8 flex-none rounded-full bg-white/10 px-3.5 text-[13px] font-semibold hover:bg-white/15 ${FOCUS_ON_DARK}`}>
                          View logs
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.95 }}
          onClick={() => {
            touched.current = true;
            start(false);
          }}
          className={`h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] ${FOCUS}`}
        >
          Deploy
        </motion.button>
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.95 }}
          onClick={() => {
            touched.current = true;
            start(true);
          }}
          className={`h-10 rounded-full bg-white px-5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] ${FOCUS}`}
        >
          Deploy with a bug
        </motion.button>
      </div>
    </div>
  );
}
