"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BeamTimelineItem {
  /** Year or label shown in blue above the title. */
  when: string;
  title: string;
  body: string;
}

export interface BeamTimelineProps {
  items?: BeamTimelineItem[];
  heading?: string;
  /** Line under the heading. */
  hint?: string;
  /** Accessible name for the scrolling region. */
  label?: string;
  /** Height of the scrolling frame in pixels. */
  height?: number;
  className?: string;
}

export const DEFAULT_BEAM_TIMELINE_ITEMS: BeamTimelineItem[] = [
  { when: "2023", title: "A folder of snippets", body: "Twelve animations copied between side projects. Nobody else had seen them." },
  { when: "2024", title: "First public release", body: "Forty components, one landing page, and a launch post that did better than expected." },
  { when: "2025", title: "Blocks and templates", body: "Whole sections, then whole sites. Teams started building their marketing pages on it." },
  { when: "2026", title: "Studio Pro", body: "A paid library, a tuning panel, and the first full-time hire." },
  { when: "Next", title: "Motion for everyone", body: "Accessible by default, light and dark, and a playground to tune every spring." },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/**
 * A timeline with a beam that follows your reading. As you scroll the frame, a line of light runs down the
 * rail; its glowing head stretches longer the faster you scroll and settles when you stop. Each milestone
 * lights up and slides in as the beam reaches it. The frame scrolls on its own, so it works the same on the
 * page and inside any preview or tile. Under reduced motion the beam still follows the scroll, with no
 * easing, no stretch and no slide. There is no autoplay: the beam is driven by scrolling the frame.
 */
export function BeamTimeline({
  items = DEFAULT_BEAM_TIMELINE_ITEMS,
  heading = "How we got here",
  hint = "Scroll down.",
  label = "Timeline",
  height = 540,
  className,
}: BeamTimelineProps) {
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress, scrollY } = useScroll({ container: box });
  const eased = useSpring(scrollYProgress, { stiffness: 160, damping: 30 });
  const p = reduce ? scrollYProgress : eased;
  const velocity = useVelocity(scrollY);
  const stretch = useSpring(
    useTransform(velocity, (x) => Math.min(160, 40 + Math.abs(x) * 0.12)),
    { stiffness: 120, damping: 20 },
  );
  const still = useMotionValue(48);
  const tail = reduce ? still : stretch;
  const [h, setH] = useState(600);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const beamH = useTransform(p, (x) => x * h);
  const headTop = useTransform([beamH, tail], ([b, t]: number[]) => Math.max(0, b - t));
  useMotionValueEvent(beamH, "change", (b) => {
    const rows = [...(list.current?.querySelectorAll<HTMLElement>(":scope > li") ?? [])];
    setReached(rows.filter((r) => r.offsetTop + 14 <= b).length);
  });

  return (
    <section aria-label={label} className={cn("w-full bg-[#f5f5f7] px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}>
      <div className="relative mx-auto w-full max-w-[1000px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <div
          ref={box}
          tabIndex={0}
          role="region"
          aria-label={`${label}, scrollable`}
          className={cn("overflow-y-auto overscroll-y-auto px-5 sm:px-10", FOCUS)}
          style={{ height }}
        >
          <div className="mx-auto max-w-[620px] pb-[300px] pt-14">
            <h3 className="m-0 text-[clamp(26px,4vw,36px)] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h3>
            <p className="m-0 mt-2 text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</p>
            <ol ref={list} className="relative m-0 mt-10 list-none p-0 pl-10">
              {/* rail, beam and its stretching head */}
              <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-0 w-[2px] rounded-full bg-[#ececf0] dark:bg-[#3a3a3c]" />
              <motion.span
                aria-hidden="true"
                className="absolute left-[11px] top-0 w-[2px] rounded-full bg-gradient-to-b from-[#5e5ce6] to-[#0071e3] dark:to-[#0a84ff]"
                style={{ height: beamH }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute left-[9px] w-[6px] rounded-full bg-gradient-to-b from-transparent to-[#0071e3] blur-[3px] dark:to-[#0a84ff]"
                style={{ top: headTop, height: tail }}
              />
              {items.map((it, i) => {
                const on = i < reached;
                return (
                  <li key={`${i}-${it.when}`} className="relative pb-14">
                    <span aria-hidden="true" className="absolute -left-10 top-1 flex h-6 w-6 items-center justify-center">
                      <motion.span
                        data-on={on}
                        className="h-3.5 w-3.5 rounded-full border-2 border-[#d2d2d7] bg-white transition-[background-color,border-color,box-shadow] duration-300 data-[on=true]:border-[#0071e3] data-[on=true]:bg-[#0071e3] data-[on=true]:shadow-[0_0_0_6px_rgba(0,113,227,.12)] dark:border-[#48484a] dark:bg-[#1c1c1e] dark:data-[on=true]:border-[#0a84ff] dark:data-[on=true]:bg-[#0a84ff] dark:data-[on=true]:shadow-[0_0_0_6px_rgba(10,132,255,.2)]"
                        animate={{ scale: on && !reduce ? [1, 1.4, 1] : 1 }}
                        transition={{ duration: 0.35 }}
                      />
                    </span>
                    <motion.div
                      animate={{ opacity: on ? 1 : 0.4, x: on || reduce ? 0 : 12 }}
                      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <span className="text-[13px] font-semibold tabular-nums text-[#0071e3] dark:text-[#2997ff]">{it.when}</span>
                      <h4 className="m-0 mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{it.title}</h4>
                      <p className="m-0 mt-1.5 text-[15px] leading-[1.55] text-[#6e6e73] dark:text-[#a1a1a6]">{it.body}</p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-[#1c1c1e]" />
      </div>
    </section>
  );
}
