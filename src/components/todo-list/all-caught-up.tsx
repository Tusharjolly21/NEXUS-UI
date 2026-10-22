"use client";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface AllCaughtUpTask {
  id: number;
  /** The task text. */
  title: string;
  /** Small label on the right of the row. */
  tag: string;
}

export interface AllCaughtUpProps {
  /** The tasks to tick off. Defaults to four demo tasks. */
  tasks?: AllCaughtUpTask[];
  /** What comes next, shown as chips once everything is done. Defaults to three demo items. */
  tomorrow?: string[];
  /** Heading of the list. */
  heading?: string;
  /** Called with the task each time one is ticked by hand. */
  onTick?: (task: AllCaughtUpTask) => void;
  /** Called once the last task is ticked by hand. */
  onComplete?: () => void;
  /** Ticks the tasks off one by one, then starts over, until someone touches the component. Never runs under reduced motion and pauses when off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const ALL_CAUGHT_UP_TASKS: AllCaughtUpTask[] = [
  { id: 1, title: "Reply to Maya about the roadmap", tag: "Inbox" },
  { id: 2, title: "Approve pricing page copy", tag: "Review" },
  { id: 3, title: "Ship the onboarding checklist", tag: "Build" },
  { id: 4, title: "Book the design review", tag: "Calendar" },
];
export const ALL_CAUGHT_UP_TOMORROW = ["Q4 planning", "1:1 with Leo", "Invoice run"];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const GREEN = "stroke-[#34c759] dark:stroke-[#30d158]";
/** How long a ticked row stays before it folds away. */
const FOLD_MS = 650;

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

function Ring({ p, size, stroke, reduce }: { p: number; size: number; stroke: number; reduce: boolean }) {
  const r = (size - stroke) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-[#ececf0] dark:stroke-[#3a3a3c]" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={GREEN}
        strokeWidth={stroke}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: p, opacity: p > 0 ? 1 : 0 }}
        transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 120, damping: 20 }}
      />
    </svg>
  );
}

/**
 * A to-do list that ends somewhere nice. Tick a task and the check draws, a
 * line strikes through it and the row folds away while the progress ring in
 * the header fills. Finish the last one and that same ring travels to the
 * middle, closes into a check, and tomorrow's first few items line up below.
 * Start over brings the list back. Under reduced motion the rows and the ring
 * swap with short fades instead of travelling.
 */
export function AllCaughtUp({
  tasks = ALL_CAUGHT_UP_TASKS,
  tomorrow = ALL_CAUGHT_UP_TOMORROW,
  heading = "Today",
  onTick,
  onComplete,
  autoplay = false,
  enableSound = true,
  className,
}: AllCaughtUpProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState<number[]>([]);
  const [gone, setGone] = useState<number[]>([]);
  const touched = useRef(false);
  const folds = useRef<number[]>([]);
  const active = useDemoActive(root, autoplay && !reduce);

  const clearFolds = () => {
    folds.current.forEach((id) => window.clearTimeout(id));
    folds.current = [];
  };
  useEffect(() => clearFolds, []);

  /** Ticks a task and folds it away shortly after. Returns false when it was already ticked. */
  const tick = (task: AllCaughtUpTask, from: "user" | "auto") => {
    if (done.includes(task.id)) return false;
    const last = done.length + 1 >= tasks.length;
    const sound = last ? "success" : "tick";
    if (from === "user") play(sound, last ? 0.6 : 0.5);
    else play.auto(sound, last ? 0.6 : 0.5);
    setDone((d) => (d.includes(task.id) ? d : [...d, task.id]));
    folds.current.push(window.setTimeout(() => setGone((g) => [...g, task.id]), FOLD_MS));
    if (from === "user") {
      onTick?.(task);
      if (last) onComplete?.();
    }
    return true;
  };
  const reset = () => {
    clearFolds();
    setDone([]);
    setGone([]);
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ tick, reset });
  useEffect(() => {
    latest.current = { tick, reset };
  });

  // Demo: tick the tasks off one by one, then start over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const go = (fn: () => void, t: number) =>
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, t),
      );
    const loop = () => {
      if (!alive || touched.current) return;
      go(() => latest.current.reset(), 100);
      tasks.forEach((task, i) => go(() => latest.current.tick(task, "auto"), 900 + i * 1000));
      go(() => latest.current.reset(), 900 + tasks.length * 1000 + 4100);
      ids.push(window.setTimeout(loop, 900 + tasks.length * 1000 + 4500));
    };
    loop();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active, tasks]);

  const left = tasks.filter((t) => !gone.includes(t.id));
  const p = tasks.length ? done.length / tasks.length : 1;
  const finished = left.length === 0;
  const ringId = reduce ? undefined : `${uid}-ring`;
  const ringMove = reduce ? { duration: 0.12 } : { type: "spring" as const, stiffness: 200, damping: 24 };

  return (
    <div
      ref={root}
      className={cn(
        "w-[420px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <LayoutGroup id={uid}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h3>
            <div className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
              {done.length} of {tasks.length} done
            </div>
          </div>
          {!finished && (
            <motion.div layoutId={ringId} className="relative flex items-center justify-center" transition={ringMove}>
              <Ring p={p} size={34} stroke={4} reduce={reduce} />
            </motion.div>
          )}
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {finished ? "All caught up" : `${done.length} of ${tasks.length} done`}
        </span>
        <div className="relative mt-4 min-h-[340px]">
          <ul className="m-0 list-none p-0">
            <AnimatePresence initial={false}>
              {left.map((t) => {
                const d = done.includes(t.id);
                return (
                  <motion.li
                    key={t.id}
                    layout={!reduce}
                    className="overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, transition: { duration: reduce ? 0.12 : 0.3, ease: [0.4, 0, 0.2, 1] } }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        tick(t, "user");
                      }}
                      aria-pressed={d}
                      className={cn("flex w-full items-center gap-3 rounded-[14px] px-2 py-3 text-left hover:bg-[#fafafa] dark:hover:bg-[#2c2c2e]", FOCUS)}
                    >
                      <motion.span
                        className={cn(
                          "relative flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2 transition-colors duration-300",
                          d ? "border-[#34c759] bg-[#34c759] dark:border-[#30d158] dark:bg-[#30d158]" : "border-[#c7c7cc] bg-white dark:border-[#636366] dark:bg-[#1c1c1e]",
                        )}
                        animate={{ scale: d && !reduce ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                          <motion.path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={false}
                            animate={{ pathLength: d ? 1 : 0 }}
                            transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : 0.05 }}
                          />
                        </svg>
                      </motion.span>
                      <span className="relative min-w-0 flex-1">
                        <span className={cn("block truncate text-[14.5px] transition-colors duration-300", d ? "text-[#8e8e93]" : "text-[#1d1d1f] dark:text-[#f5f5f7]")}>{t.title}</span>
                        <motion.span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-px w-full origin-left bg-[#a1a1a6]"
                          initial={false}
                          animate={{ scaleX: d ? 1 : 0 }}
                          transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.1 }}
                        />
                      </span>
                      <span className="flex-none rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] font-medium text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">{t.tag}</span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <AnimatePresence>
            {finished && (
              <motion.div key="done" className="absolute inset-0 flex flex-col items-center pt-4 text-center" initial={{ opacity: reduce ? 0 : 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                <motion.div layoutId={ringId} className="relative flex items-center justify-center" transition={ringMove}>
                  <Ring p={1} size={84} stroke={6} reduce={reduce} />
                  <motion.svg
                    className="absolute"
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduce ? { duration: 0.12 } : { delay: 0.35, type: "spring", stiffness: 400, damping: 16 }}
                  >
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      className={GREEN}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduce ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={reduce ? { duration: 0 } : { delay: 0.45, duration: 0.35 }}
                    />
                  </motion.svg>
                  {!reduce &&
                    [0, 1].map((k) => (
                      <motion.span
                        key={k}
                        aria-hidden="true"
                        className="absolute h-[84px] w-[84px] rounded-full border-2 border-[#34c759] dark:border-[#30d158]"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.9, opacity: 0 }}
                        transition={{ delay: 0.4 + k * 0.25, duration: 1.1, ease: "easeOut" }}
                      />
                    ))}
                </motion.div>
                <motion.h4 className="m-0 mt-5 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.5, duration: reduce ? 0.12 : undefined }}>
                  All caught up
                </motion.h4>
                <motion.p className="m-0 mt-1 text-[13.5px] text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.6 }}>
                  Nothing else due today. Here&apos;s what&apos;s next:
                </motion.p>
                <ul className="m-0 mt-4 flex list-none flex-wrap justify-center gap-2 p-0">
                  {tomorrow.map((x, i) => (
                    <motion.li
                      key={x}
                      className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[12.5px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduce ? { duration: 0.12 } : { delay: 0.75 + i * 0.08, type: "spring", stiffness: 400, damping: 26 }}
                    >
                      <span className="mr-1.5 text-[#6e6e73] dark:text-[#a1a1a6]">Tomorrow</span>
                      {x}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  type="button"
                  onClick={() => {
                    touched.current = true;
                    reset();
                  }}
                  className={cn("mt-5 h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : 1 }}
                >
                  Start over
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
