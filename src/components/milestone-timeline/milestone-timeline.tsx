"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
};

const MILESTONES: Milestone[] = [
  { title: "Research & discovery", date: "Jan 2026", description: "Twenty customer interviews and a teardown of every onboarding flow we could find.", status: "done" },
  { title: "Design system v1", date: "Mar 2026", description: "Tokens, type scale and 40 components, documented and shipped to the team.", status: "done" },
  { title: "Private beta", date: "Jun 2026", description: "312 teams onboarded. Activation up 38% after the second iteration.", status: "current", tag: "In progress" },
  { title: "Public launch", date: "Sep 2026", description: "Pricing, docs and the launch film. Then the work really starts.", status: "upcoming" },
];

/**
 * A roadmap timeline: dates on the left, a rail that fills up to the milestone in progress, and
 * nodes that read done, current (pulsing) or upcoming at a glance.
 */
export function MilestoneTimeline({ milestones, steps, heading = "Roadmap", className }: MilestoneTimelineProps) {
  const reduce = useReducedMotion();
  const list: Milestone[] =
    milestones ??
    (steps
      ? steps.map((title, i) => ({ title, status: i < steps.length - 1 ? "done" : "current" }))
      : MILESTONES);
  const current = Math.max(0, list.findIndex((m) => m.status === "current"));
  const doneUpTo = list.some((m) => m.status === "current") ? current : list.filter((m) => m.status === "done").length - 1;
  const listRef = React.useRef<HTMLOListElement | null>(null);
  const nodeRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [rail, setRail] = React.useState<{ top: number; full: number; fill: number } | null>(null);

  // Measure node centres so the rail runs node to node and fills exactly to the current one.
  React.useEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    const measure = () => {
      const base = ol.getBoundingClientRect().top;
      const centres = nodeRefs.current.map((n) => (n ? n.getBoundingClientRect().top + n.offsetHeight / 2 - base : 0));
      if (centres.length < 2) return;
      const first = centres[0];
      const last = centres[centres.length - 1];
      const target = centres[Math.max(0, Math.min(doneUpTo, centres.length - 1))];
      setRail({ top: first, full: last - first, fill: Math.max(0, target - first) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [doneUpTo, list.length]);

  return (
    <section
      className={cn(
        "w-full rounded-[28px] border border-zinc-200/80 bg-white p-8",
        "dark:border-white/10 dark:bg-zinc-950",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-zinc-950 dark:text-white">{heading}</h2>
        <span className="text-[13px] tabular-nums text-zinc-500 dark:text-zinc-400">
          {list.filter((m) => m.status === "done").length} of {list.length} complete
        </span>
      </div>

      <ol ref={listRef} className="relative mt-8">
        {/* rail: grey track node to node, coloured up to the milestone in progress */}
        {rail ? (
          <>
            <span aria-hidden className="absolute left-[calc(7rem+1.5rem+11px)] w-px bg-zinc-200 max-sm:left-[11px] dark:bg-white/10" style={{ top: rail.top, height: rail.full }} />
            <motion.span
              aria-hidden
              className="absolute left-[calc(7rem+1.5rem+11px)] w-px origin-top bg-gradient-to-b from-indigo-500 to-violet-500 max-sm:left-[11px]"
              style={{ top: rail.top, height: rail.fill }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : null}

        {list.map((m, i) => {
          const status = m.status ?? (i <= doneUpTo ? "done" : "upcoming");
          const isCurrent = status === "current";
          return (
            <motion.li
              key={m.title}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.45 }}
              className="relative flex gap-6 pb-6 last:pb-0 max-sm:gap-4"
            >
              <span className="w-28 shrink-0 pt-[19px] text-right text-[12.5px] font-medium tabular-nums text-zinc-400 max-sm:hidden dark:text-zinc-500">{m.date}</span>

              <span
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="relative z-10 mt-4 grid size-6 shrink-0 place-items-center"
              >
                {status === "done" ? (
                  <span className="grid size-6 place-items-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                ) : isCurrent ? (
                  <>
                    {!reduce ? <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/40" /> : null}
                    <span className="relative grid size-6 place-items-center rounded-full bg-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.18)]">
                      <span className="size-2 rounded-full bg-white" />
                    </span>
                  </>
                ) : (
                  <span className="size-6 rounded-full border-2 border-dashed border-zinc-300 bg-white dark:border-white/20 dark:bg-zinc-950" />
                )}
              </span>

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-2xl border p-4 transition-colors",
                  isCurrent
                    ? "border-indigo-200 bg-indigo-50/60 shadow-[0_12px_32px_-18px_rgba(99,102,241,0.6)] dark:border-indigo-400/25 dark:bg-indigo-500/[0.08]"
                    : "border-transparent",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("text-[15.5px] font-semibold tracking-[-0.01em]", status === "upcoming" ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-950 dark:text-white")}>
                    {m.title}
                  </p>
                  {isCurrent && m.tag ? (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">{m.tag}</span>
                  ) : null}
                  {m.date ? <span className="text-[12px] text-zinc-400 sm:hidden">{m.date}</span> : null}
                </div>
                {m.description ? <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{m.description}</p> : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
