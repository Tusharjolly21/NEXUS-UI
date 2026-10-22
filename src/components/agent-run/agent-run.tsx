"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export interface AgentRunStep {
  /** The step's one-line title. */
  label: string;
  /** How long the step runs, in ms. */
  ms: number;
  /** What the step shows while it runs: `t` is how many ms into the step it is, so you can reveal lines or files as it goes. Once the step is done it is called with `ms`. */
  body: (t: number) => ReactNode;
}

export interface AgentRunReport {
  title: string;
  body: string;
  /** Shown as "1 file, +1 -1". */
  files: number;
  added: number;
  removed: number;
}

export interface AgentRunProps {
  /** The task the agent was given, shown at the top. */
  task?: string;
  /** The steps of the run, in order. Defaults to a four-step "fix a failing test" run of about 6 seconds. */
  steps?: AgentRunStep[];
  /** The report card shown when the run finishes. */
  report?: AgentRunReport;
  /** Called when "Review change" is pressed. */
  onReview?: () => void;
  /** Runs the whole thing again 4.5 seconds after it finishes, until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Width of the card in px. It never grows past its container. Default 520. */
  width?: number;
  /** Extra classes for the card. */
  className?: string;
}

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const MUTED = "text-[#6e6e73] dark:text-[#a1a1a6]";
const OK = "text-[#16702f] dark:text-[#6be28a]";
const BAD = "text-[#c4271b] dark:text-[#ff8a80]";

const lines = (all: [string, string][], t: number, every: number) =>
  all.slice(0, Math.max(1, Math.floor(t / every) + 1)).map(([c, s], i) => (
    <motion.div key={i} className={`whitespace-pre-wrap ${c}`} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
      {s}
    </motion.div>
  ));

export const AGENT_RUN_STEPS: AgentRunStep[] = [
  {
    label: "Reading the checkout code",
    ms: 1500,
    body: (t) => (
      <div className="flex flex-wrap gap-1.5">
        {["checkout.ts", "cart.ts", "discount.ts", "cart.test.ts"].slice(0, Math.floor(t / 300) + 1).map((f) => (
          <motion.span
            key={f}
            className="rounded-[6px] bg-white px-2 py-1 font-mono text-[11.5px] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:shadow-none"
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            {f}
          </motion.span>
        ))}
      </div>
    ),
  },
  {
    label: "Running the tests",
    ms: 1800,
    body: (t) => (
      <div className="font-mono text-[11.5px] leading-[1.6]">
        {lines(
          [
            [MUTED, "$ npm test cart"],
            [OK, "✓ adds items (12ms)"],
            [OK, "✓ removes items (4ms)"],
            [BAD, "✕ applies 15% discount"],
            [BAD, "  expected 84.15, got 84.14"],
          ],
          t,
          330,
        )}
      </div>
    ),
  },
  {
    label: "Fixing discount.ts",
    ms: 1600,
    body: (t) => (
      <div className="font-mono text-[11.5px] leading-[1.6]">
        {lines(
          [
            [MUTED, "discount.ts · line 18"],
            ["bg-[#fff1f0] text-[#c4271b] dark:bg-[rgba(255,69,58,.15)] dark:text-[#ff8a80]", "- return Math.floor(total * (1 - pct) * 100) / 100"],
            ["bg-[#e9f9ee] text-[#16702f] dark:bg-[rgba(48,209,88,.15)] dark:text-[#6be28a]", "+ return Math.round(total * (1 - pct) * 100) / 100"],
          ],
          t,
          450,
        )}
      </div>
    ),
  },
  {
    label: "Running the tests again",
    ms: 1400,
    body: (t) => (
      <div className="font-mono text-[11.5px] leading-[1.6]">
        {lines(
          [
            [MUTED, "$ npm test cart"],
            [OK, "✓ 24 passed (0.8s)"],
          ],
          t,
          600,
        )}
      </div>
    ),
  },
];

export const AGENT_RUN_REPORT: AgentRunReport = {
  title: "Fixed: discount rounding",
  body: "The 15% discount rounded down instead of to the nearest cent. All 24 cart tests pass.",
  files: 1,
  added: 1,
  removed: 1,
};

/** Index of the step running at `ms`, or the step count once everything has finished. */
const stepAt = (ends: number[], ms: number) => {
  const i = ends.findIndex((e) => ms < e);
  return i === -1 ? ends.length : i;
};

type RunMode = "mount" | "user" | "auto";

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
 * An agent run you can actually follow. Each step shows live what it is
 * doing (files it opened, test output streaming in, the exact line it
 * changed) and folds into a ticked summary when it moves on. A clock runs in
 * the corner, Stop is always there, and the run ends on a short report with
 * the change to review. Finished steps can be reopened to read what they did.
 */
export function AgentRun({
  task = "Fix the failing checkout test",
  steps = AGENT_RUN_STEPS,
  report = AGENT_RUN_REPORT,
  onReview,
  autoplay = false,
  enableSound = true,
  width = 520,
  className = "",
}: AgentRunProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);
  const [stopped, setStopped] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const lastCur = useRef(0);
  const touched = useRef(false);
  const mode = useRef<RunMode>(autoplay ? "auto" : "mount");
  const active = useDemoActive(box, autoplay && !reduce);
  // an autoplaying card waits until it is on screen; a plain one just runs
  const live = !autoplay || reduce || active;

  const ends = useMemo(() => steps.reduce<number[]>((a, s) => [...a, (a[a.length - 1] ?? 0) + s.ms], []), [steps]);
  const total = ends[ends.length - 1] ?? 0;

  const sound = (name: SoundName, vol: number) => {
    if (mode.current === "user") play(name, vol);
    else if (mode.current === "auto") play.auto(name, vol);
  };
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  });

  // The clock: advances while the run is going and the card is being shown.
  useEffect(() => {
    if (!running || !live) return;
    let raf = 0;
    let prev = 0;
    let lastSet = -100;
    const frame = (ts: number) => {
      const dt = prev ? Math.min(ts - prev, 100) : 0;
      prev = ts;
      elapsed.current = Math.min(total, elapsed.current + dt);
      const c = stepAt(ends, elapsed.current);
      // a quiet tick after every other step; the finish has its own sound
      while (lastCur.current < c) {
        lastCur.current += 1;
        if (lastCur.current % 2 === 1 && lastCur.current < steps.length) soundRef.current("tick", 0.35);
      }
      if (elapsed.current >= total) {
        setT(total);
        setRunning(false);
        soundRef.current("success", 0.5);
        return;
      }
      if (elapsed.current - lastSet >= 50) {
        lastSet = elapsed.current;
        setT(elapsed.current);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, live, total, ends, steps.length]);

  const restart = (m: RunMode) => {
    mode.current = m;
    elapsed.current = 0;
    lastCur.current = 0;
    setT(0);
    setStopped(false);
    setOpen(null);
    setRunning(true);
  };
  const latest = useRef(restart);
  useEffect(() => {
    latest.current = restart;
  });

  // Demo: run it again a few seconds after it finishes.
  useEffect(() => {
    if (!autoplay || reduce || running || !live) return;
    const id = window.setTimeout(() => {
      if (!touched.current) latest.current("auto");
    }, 4500);
    return () => window.clearTimeout(id);
  }, [autoplay, reduce, running, live]);

  const cur = stepAt(ends, t);
  const startOf = (i: number) => (i === 0 ? 0 : ends[i - 1]);
  const finished = !running && !stopped && t >= total && total > 0;
  const spring = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 340, damping: 34 };
  const status = finished ? "Run finished" : stopped ? "Run stopped" : steps[cur] ? `Running: ${steps[cur].label}` : "";

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={box}
        style={{ maxWidth: width }}
        className={`w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
        onPointerDown={() => {
          touched.current = true;
        }}
        onFocusCapture={() => {
          touched.current = true;
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`text-[12px] font-medium ${MUTED}`}>Task</div>
            <div className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{task}</div>
          </div>
          <div className="flex flex-none items-center gap-2">
            <span className={`text-[12.5px] tabular-nums ${MUTED}`}>{(t / 1000).toFixed(1)}s</span>
            {running ? (
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  play("off", 0.5);
                  setT(elapsed.current);
                  setRunning(false);
                  setStopped(true);
                }}
                className={`flex h-8 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 text-[12.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-[#1d1d1f] dark:bg-[#f5f5f7]" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  restart("user");
                }}
                className={`h-8 rounded-full bg-[#f5f5f7] px-3 text-[12.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
              >
                Run again
              </button>
            )}
          </div>
        </div>

        <ol className="m-0 mt-4 list-none p-0">
          {steps.map((s, i) => {
            if (i > cur) return null;
            const isLive = i === cur && running;
            const ok = i < cur;
            const halted = i === cur && stopped;
            const expanded = isLive || open === i;
            return (
              <motion.li key={s.label} className="relative pb-1 pl-8" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                {i < steps.length - 1 && i < cur && <span aria-hidden="true" className="absolute bottom-0 left-[10px] top-6 w-px bg-[#e5e5ea] dark:bg-[#3a3a3c]" />}
                <span aria-hidden="true" className="absolute left-0 top-[5px] flex h-[21px] w-[21px] items-center justify-center rounded-full bg-white dark:bg-[#1c1c1e]">
                  {ok ? (
                    <motion.svg width="21" height="21" viewBox="0 0 24 24" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                      <circle cx="12" cy="12" r="11" className="fill-[#34c759] dark:fill-[#30d158]" />
                      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  ) : halted ? (
                    <span className="h-[18px] w-[18px] rounded-full border-2 border-[#c7c7cc] dark:border-[#48484a]" />
                  ) : (
                    <motion.span
                      className="h-[18px] w-[18px] rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]"
                      animate={reduce ? undefined : { rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLive) setOpen(open === i ? null : i);
                  }}
                  aria-expanded={expanded}
                  className={`flex w-full items-center justify-between gap-2 rounded-[8px] py-1.5 text-left ${FOCUS}`}
                >
                  <span className={`text-[14px] ${isLive ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : halted ? MUTED : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`}>
                    {s.label}
                    {halted ? " · stopped" : ""}
                  </span>
                  <span className={`text-[11.5px] tabular-nums ${MUTED}`}>{ok ? `${(s.ms / 1000).toFixed(1)}s` : ""}</span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                      <div className="mb-2 rounded-[12px] bg-[#f5f5f7] p-3 dark:bg-[#2c2c2e]">{s.body(isLive ? t - startOf(i) : s.ms)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ol>
        <span className="sr-only" role="status" aria-live="polite">
          {status}
        </span>

        <AnimatePresence>
          {finished && (
            <motion.div
              className="mt-2 rounded-[16px] border border-black/[.07] p-4 dark:border-white/[.08]"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 340, damping: 28 }}
            >
              <div className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{report.title}</div>
              <div className={`mt-1 text-[13px] leading-[1.5] ${MUTED}`}>{report.body}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`font-mono text-[12px] ${MUTED}`}>
                  {report.files} file{report.files === 1 ? "" : "s"} · <span className={OK}>+{report.added}</span> <span className={BAD}>{"−"}{report.removed}</span>
                </span>
                <button
                  type="button"
                  onClick={onReview}
                  className={`ml-auto h-8 rounded-full bg-[#1d1d1f] px-3.5 text-[12.5px] font-medium text-white hover:bg-black dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white ${FOCUS}`}
                >
                  Review change
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
