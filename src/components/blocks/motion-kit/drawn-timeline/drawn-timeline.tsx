"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface DrawnTimelineStep {
  title: string;
  body: string;
  /** Small line above the title, e.g. how long the step takes. */
  meta: string;
}

export interface DrawnTimelineProps {
  steps?: DrawnTimelineStep[];
  eyebrow?: string;
  title?: string;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /**
   * Draws the line on a loop instead of following the page scroll. Useful in previews and
   * anywhere the section cannot be scrolled through.
   */
  autoplay?: boolean;
  className?: string;
}

export const DEFAULT_DRAWN_TIMELINE_STEPS: DrawnTimelineStep[] = [
  {
    title: "Connect your tools",
    body: "Sign in with Google or Microsoft and pick the apps you already use. Lumen imports the last 12 months in the background.",
    meta: "About 2 minutes",
  },
  {
    title: "Choose what matters",
    body: "Pick the numbers you check every week. We suggest a starting set based on teams like yours.",
    meta: "5 minutes",
  },
  {
    title: "Invite your team",
    body: "Everyone gets their own view, with the same live data underneath. Permissions follow your org chart.",
    meta: "1 minute",
  },
  {
    title: "Get your Monday back",
    body: "A short summary lands in your inbox each week, with anything unusual flagged at the top.",
    meta: "Every week, automatically",
  },
];

function TimelineNode({
  index,
  count,
  progress,
  step,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  step: DrawnTimelineStep;
}) {
  const at = (index + 0.5) / count;
  const on = useTransform(progress, [at - 0.08, at], [0, 1]);
  const scale = useTransform(on, [0, 1], [0.6, 1]);
  const background = useTransform(on, (v) => (v > 0.5 ? "var(--mk-accent)" : "var(--mk-dt-node)"));
  const color = useTransform(on, (v) => (v > 0.5 ? "#ffffff" : "var(--mk-dt-num)"));
  const boxShadow = useTransform(
    on,
    (v) =>
      `0 0 0 ${(v * 8).toFixed(2)}px color-mix(in srgb, var(--mk-accent) 14%, transparent), 0 0 0 1.5px ${
        v > 0.5 ? "var(--mk-accent)" : "var(--mk-dt-hair)"
      }`,
  );
  const left = index % 2 === 0;

  return (
    <li className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-4 @3xl:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] @3xl:gap-0">
      <div aria-hidden="true" className={cn("hidden @3xl:block", left ? "@3xl:order-3" : "@3xl:order-1")} />
      <div className="relative flex justify-center @3xl:order-2">
        <motion.span
          aria-hidden="true"
          className="relative z-10 mt-6 flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-semibold tabular-nums"
          style={{ scale, background, color, boxShadow }}
        >
          {index + 1}
        </motion.span>
      </div>
      <motion.div
        className={cn("min-w-0 py-4", left ? "@3xl:order-1 @3xl:pr-10 @3xl:text-right" : "@3xl:order-3 @3xl:pl-10")}
        initial={{ opacity: 0, x: left ? -40 : 40, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="inline-block max-w-full rounded-[24px] bg-white p-5 text-left shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-32px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-32px_rgba(0,0,0,.9)]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--mk-accent-text)]">
            <span className="sr-only">Step {index + 1}. </span>
            {step.meta}
          </span>
          <h3 className="m-0 mt-2 text-[clamp(19px,2.4vw,22px)] font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {step.title}
          </h3>
          <p className="m-0 mt-2 max-w-[380px] text-[15px] leading-[1.55] text-[#6e6e73] dark:text-[#a1a1a6]">{step.body}</p>
        </div>
      </motion.div>
    </li>
  );
}

/**
 * How-it-works timeline. The line draws itself as you scroll, each numbered node fills in as the
 * line reaches it, and the step cards slide in from alternating sides on wide layouts. With
 * `autoplay` the line draws on a loop instead of following the scroll.
 */
export function DrawnTimeline({
  steps = DEFAULT_DRAWN_TIMELINE_STEPS,
  eyebrow = "How it works",
  title = "Live in an afternoon.",
  accent,
  autoplay = false,
  className,
}: DrawnTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scrolled = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const looped = useMotionValue(0);
  const full = useMotionValue(1);
  const inView = useInView(ref, { amount: 0.2 });

  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const controls = animate(looped, [0, 1, 1, 0], {
      duration: 9,
      times: [0, 0.62, 0.9, 1],
      ease: "easeInOut",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [autoplay, reduce, inView, looped]);

  const progress = reduce ? full : autoplay ? looped : scrolled;
  const accentStyle = accent ? ({ "--mk-accent": accent, "--mk-accent-text": accent } as CSSProperties) : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <section
        style={accentStyle}
        className={cn(
          "@container w-full bg-[#f5f5f7] px-4 py-16 sm:px-5 sm:py-20 dark:bg-black",
          "[--mk-accent:#0071e3] [--mk-accent-text:#0071e3] [--mk-dt-node:#ffffff] [--mk-dt-num:#86868b] [--mk-dt-hair:#d2d2d7]",
          "dark:[--mk-accent:#0a84ff] dark:[--mk-accent-text:#2997ff] dark:[--mk-dt-node:#1c1c1e] dark:[--mk-dt-num:#a1a1a6] dark:[--mk-dt-hair:#3a3a3c]",
          className,
        )}
      >
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-14">
            <span className="text-[14px] font-semibold text-[var(--mk-accent-text)]">{eyebrow}</span>
            <h2 className="m-0 text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              {title}
            </h2>
          </div>
          <div ref={ref} className="relative">
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-[23px] top-0 w-[2px] rounded-full bg-[#e0e0e5] @3xl:left-1/2 @3xl:-ml-px dark:bg-[#3a3a3c]"
            >
              <motion.div
                className="h-full w-full origin-top rounded-full"
                style={{ scaleY: progress, background: "linear-gradient(var(--mk-accent), #5ac8fa)" }}
              />
            </div>
            <ol className="relative m-0 list-none p-0">
              {steps.map((step, i) => (
                <TimelineNode key={`${i}-${step.title}`} index={i} count={steps.length} progress={progress} step={step} />
              ))}
            </ol>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
