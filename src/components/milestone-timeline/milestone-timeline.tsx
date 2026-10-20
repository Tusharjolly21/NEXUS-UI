"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

export type Milestone = {
  title: string;
  date?: string;
  description?: string;
  status?: "done" | "current" | "upcoming";
  /** Small label shown on the current milestone, e.g. "In progress". */
  tag?: string;
};

export type MilestoneTimelineProps = {
  /** Rich milestones. Takes priority over `steps`. */
  milestones?: Milestone[];
  /** Plain titles (older API). Everything before the last is treated as done. */
  steps?: string[];
  heading?: string;
  /** Milestone opened first. Defaults to the current one. */
  defaultOpen?: number;
  /** Opens each milestone in turn until someone touches the timeline. */
  autoplay?: boolean;
  className?: string;
};

const MILESTONES: Milestone[] = [
  { title: "Research and discovery", date: "Jan 2026", description: "Twenty customer interviews and a teardown of every onboarding flow we could find.", status: "done" },
  { title: "Design system v1", date: "Mar 2026", description: "Tokens, a type scale and 40 components, documented and shipped to the team.", status: "done" },
  { title: "Private beta", date: "Jun 2026", description: "312 teams onboarded. Activation up 38% after the second iteration.", status: "current", tag: "In progress" },
  { title: "Public launch", date: "Sep 2026", description: "Pricing, docs and the launch film. Then the real work starts.", status: "upcoming" },
];

type Status = "done" | "current" | "upcoming";

/** Rail piece from node i to node i+1, filled by the shared progress value. */
function Segment({ i, fill, still }: { i: number; fill: MotionValue<number>; still: boolean }) {
  const scaleY = useTransform(fill, (f) => Math.max(0, Math.min(1, f - i)));
  const top = useTransform(fill, (f) => `${Math.max(0, Math.min(1, f - i)) * 100}%`);
  const bead = useTransform(fill, (f) => (f > i + 0.02 && f < i + 0.98 ? 1 : 0));
  return (
    <span aria-hidden="true" className="absolute left-1/2 top-[24px] -bottom-[36px] w-[2px] -translate-x-1/2 rounded-full bg-[#e5e5ea] dark:bg-[#3a3a3c]">
      <motion.span className="absolute inset-0 origin-top rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" style={{ scaleY }} />
      {!still ? (
        <motion.span
          className="absolute left-1/2 size-2.5 rounded-full bg-[#0071e3] shadow-[0_0_0_4px_rgba(0,113,227,.2),0_0_14px_rgba(0,113,227,.7)] dark:bg-[#0a84ff]"
          style={{ top, x: "-50%", y: "-50%", opacity: bead }}
        />
      ) : null}
    </span>
  );
}

function Node({ i, status, fill, still }: { i: number; status: Status; fill: MotionValue<number>; still: boolean }) {
  const reached = useTransform(fill, (f) => (f >= i - 0.04 ? 1 : 0));
  const check = useTransform(fill, (f) => Math.max(0, Math.min(1, (f - i + 0.04) * 3)));
  const pop = useTransform(fill, (f) => {
    const d = f - i;
    return d > -0.05 && d < 0.35 ? 1 + Math.sin(((d + 0.05) / 0.4) * Math.PI) * 0.22 : 1;
  });
  if (status === "current") {
    return (
      <motion.span className="relative grid size-6 place-items-center" style={{ scale: pop }}>
        {!still ? (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#0071e3]/35 dark:bg-[#0a84ff]/40"
            animate={{ scale: [1, 2], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        ) : null}
        <span className="relative grid size-6 place-items-center rounded-full bg-[#0071e3] shadow-[0_0_0_4px_rgba(0,113,227,.16)] dark:bg-[#0a84ff]">
          <span className="size-2 rounded-full bg-white" />
        </span>
      </motion.span>
    );
  }
  if (status === "done") {
    return (
      <motion.span className="relative grid size-6 place-items-center rounded-full bg-white shadow-[inset_0_0_0_2px_#d2d2d7] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_2px_#48484a]" style={{ scale: pop }}>
        <motion.span className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ opacity: reached }} />
        <svg viewBox="0 0 12 12" className="relative size-3" fill="none" aria-hidden="true">
          <motion.path d="M2.5 6.3l2.3 2.2 4.7-5" className="stroke-white dark:stroke-[#1d1d1f]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: check }} />
        </svg>
      </motion.span>
    );
  }
  return <span className="block size-6 rounded-full border-2 border-dashed border-[#c7c7cc] bg-white dark:border-[#48484a] dark:bg-[#1c1c1e]" />;
}

/**
 * A roadmap timeline. When it scrolls into view a glowing bead runs down the
 * rail, drawing each done milestone's check as it passes, overshoots the
 * milestone in progress a touch and settles on it. Click a milestone (or use
 * the arrow keys) and a raised card slides to it and opens its notes.
 */
export function MilestoneTimeline({ milestones, steps, heading = "Roadmap", defaultOpen, autoplay = false, className = "" }: MilestoneTimelineProps) {
  const reduce = useReducedMotion() === true;
  const uid = useId().replace(/:/g, "");
  const list: Milestone[] =
    milestones ?? (steps ? steps.map((title, i) => ({ title, status: i < steps.length - 1 ? "done" : "current" })) : MILESTONES);
  const hasCurrent = list.some((m) => m.status === "current");
  const currentIdx = list.findIndex((m) => m.status === "current");
  const doneCount = list.filter((m) => m.status === "done").length;
  const target = hasCurrent ? currentIdx : Math.max(0, doneCount - 1);
  const statusOf = (m: Milestone, i: number): Status => m.status ?? (i <= target ? "done" : "upcoming");

  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const fill = useMotionValue(reduce ? target : 0);
  const [open, setOpen] = useState(() => Math.min(list.length - 1, Math.max(0, defaultOpen ?? target)));
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      fill.set(target);
      return;
    }
    const run = animate(fill, target, { type: "spring", stiffness: 38, damping: 9, mass: 1.1, restDelta: 0.001, delay: 0.2 });
    return () => run.stop();
  }, [inView, reduce, target, fill]);

  const count = list.length;
  useEffect(() => {
    if (!autoplay || !inView || count < 2) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      setOpen((o) => (o + 1) % count);
    }, 2600);
    return () => window.clearInterval(t);
  }, [autoplay, inView, count]);

  const key = (e: KeyboardEvent, i: number) => {
    let to: number | null = null;
    if (e.key === "ArrowDown") to = Math.min(count - 1, i + 1);
    if (e.key === "ArrowUp") to = Math.max(0, i - 1);
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = count - 1;
    if (to === null) return;
    e.preventDefault();
    touched.current = true;
    btns.current[to]?.focus();
  };

  return (
    <section
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container w-full rounded-[28px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] @min-[480px]:p-8 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{heading}</h2>
        <span className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
          {doneCount} of {list.length} complete
        </span>
      </div>

      <ol ref={ref} className="mt-6">
        {list.map((m, i) => {
          const status = statusOf(m, i);
          const isOpen = open === i;
          const last = i === list.length - 1;
          return (
            <li key={`${m.title}-${i}`} className="relative flex gap-3 pb-3 last:pb-0 @min-[420px]:gap-4">
              {m.date ? (
                <span className="hidden w-[68px] shrink-0 pt-[17px] text-right text-[12px] font-medium tabular-nums text-[#6e6e73] @min-[420px]:block dark:text-[#a1a1a6]">{m.date}</span>
              ) : null}
              <span className="relative flex w-6 shrink-0 justify-center pt-[12px]">
                {!last ? <Segment i={i} fill={fill} still={reduce} /> : null}
                <span className="relative z-10">
                  <Node i={i} status={status} fill={fill} still={reduce} />
                </span>
              </span>
              <div className="relative min-w-0 flex-1">
                {isOpen ? (
                  <motion.span
                    layoutId={`${uid}-card`}
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-[18px] ${
                      status === "current"
                        ? "bg-[#0071e3]/[.06] shadow-[0_0_0_1px_rgba(0,113,227,.18),0_16px_30px_-20px_rgba(0,113,227,.55)] dark:bg-[#0a84ff]/10 dark:shadow-[0_0_0_1px_rgba(10,132,255,.3),0_16px_30px_-20px_rgba(0,0,0,.9)]"
                        : "bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                    }`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <button
                  ref={(el) => {
                    btns.current[i] = el;
                  }}
                  type="button"
                  id={`${uid}-b${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-p${i}`}
                  onClick={() => {
                    touched.current = true;
                    setOpen(i);
                  }}
                  onKeyDown={(e) => key(e, i)}
                  className="relative flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-[18px] px-4 py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
                >
                  <span className={`text-[15px] font-semibold tracking-[-0.01em] ${status === "upcoming" ? "text-[#6e6e73] dark:text-[#a1a1a6]" : ""}`}>{m.title}</span>
                  {status === "current" && m.tag ? (
                    <span className="rounded-full bg-[#0071e3] px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-[#0a84ff]">{m.tag}</span>
                  ) : null}
                  {m.date ? <span className="text-[12px] tabular-nums text-[#6e6e73] @min-[420px]:hidden dark:text-[#a1a1a6]">{m.date}</span> : null}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && m.description ? (
                    <motion.div
                      id={`${uid}-p${i}`}
                      role="region"
                      aria-labelledby={`${uid}-b${i}`}
                      className="relative overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 320, damping: 32 }, opacity: { duration: 0.18 } }}
                    >
                      <p className="px-4 pb-3.5 text-[13px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{m.description}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
