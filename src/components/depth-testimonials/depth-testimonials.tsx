"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DepthTestimonial = {
  quote: string;
  name: string;
  role?: string;
  /** Two colours for the avatar. */
  tone?: [string, string];
};

export type DepthTestimonialsProps = {
  /** Rich testimonials. Takes priority over `quotes`. */
  items?: DepthTestimonial[];
  /** Plain quotes (older API); shown without a byline. */
  quotes?: string[];
  /** Auto-advance interval in ms. 0 turns it off. */
  interval?: number;
  heading?: string;
  className?: string;
};

const ITEMS: DepthTestimonial[] = [
  {
    quote: "We rebuilt our pricing page in an afternoon. The motion feels expensive and the code reads like we wrote it.",
    name: "Priya Raman",
    role: "Design lead, Fieldnote",
    tone: ["#6366f1", "#a855f7"],
  },
  {
    quote: "Finally, animation that respects reduced motion by default. Accessibility review took ten minutes.",
    name: "Tomás Reyes",
    role: "Frontend engineer, Harbor",
    tone: ["#f97316", "#f43f5e"],
  },
  {
    quote: "It feels like Linear met a motion lab. Our launch page conversion went up the week we shipped it.",
    name: "Mei Tanaka",
    role: "Founder, Quietly",
    tone: ["#10b981", "#06b6d4"],
  },
  {
    quote: "The springs are tuned by someone who cares. Every hover lands exactly where your eye expects it to.",
    name: "Jonah Okoye",
    role: "Product designer, Lumen",
    tone: ["#0ea5e9", "#6366f1"],
  },
];

const VISIBLE = 3;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

/**
 * Testimonials stacked in depth: the front card reads clearly, the next ones wait behind it, and
 * cycling sends the front card to the back of the deck. Auto-advances, pauses on hover.
 */
export function DepthTestimonials({ items, quotes, interval = 4800, heading = "Loved by people who ship", className }: DepthTestimonialsProps) {
  const reduce = useReducedMotion();
  const list: DepthTestimonial[] = items ?? (quotes ? quotes.map((q) => ({ quote: q, name: "" })) : ITEMS);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const n = list.length;

  const step = React.useCallback((d: number) => setIndex((i) => (i + d + n) % n), [n]);

  React.useEffect(() => {
    if (!interval || paused || reduce || n < 2) return;
    const t = setInterval(() => step(1), interval);
    return () => clearInterval(t);
  }, [interval, paused, reduce, n, step]);

  const deck = Array.from({ length: Math.min(VISIBLE, n) }, (_, k) => ({ k, item: list[(index + k) % n], key: (index + k) % n }));

  return (
    <section
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={cn(
        "relative isolate flex w-full flex-col items-center overflow-hidden rounded-[28px] border border-zinc-200/80 bg-zinc-50 px-6 py-10",
        "dark:border-white/10 dark:bg-zinc-950",
        className,
      )}
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(129,140,248,0.16),transparent)]" />
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-300">Testimonials</p>
      <h2 className="mt-2 text-center text-[24px] font-semibold tracking-[-0.03em] text-zinc-950 dark:text-white">{heading}</h2>

      <div className="relative mt-10 h-[220px] w-full max-w-[520px] [perspective:1200px]">
        <AnimatePresence initial={false}>
          {deck
            .slice()
            .reverse()
            .map(({ k, item, key }) => (
              <motion.figure
                key={key}
                layout={false}
                initial={{ opacity: 0, y: -40, scale: 0.86 }}
                animate={{ opacity: k === 0 ? 1 : 0.9 - k * 0.25, y: -k * 22, scale: 1 - k * 0.06, rotateX: k * 4 }}
                exit={{ opacity: 0, y: 40, scale: 1.02, transition: { duration: 0.35 } }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
                style={{ zIndex: VISIBLE - k, transformOrigin: "50% 0%" }}
                aria-hidden={k !== 0}
                className={cn(
                  "absolute inset-x-0 bottom-0 flex min-h-[180px] flex-col rounded-[22px] border border-zinc-200/80 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(23,23,28,0.25)]",
                  "dark:border-white/10 dark:bg-[#15151b] dark:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)]",
                  k !== 0 && "pointer-events-none",
                )}
              >
                <motion.div
                  className="flex flex-1 flex-col"
                  animate={{ opacity: k === 0 ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.25 }}
                >
                <span aria-hidden className="absolute right-5 top-1 font-serif text-[56px] leading-none text-indigo-100 dark:text-white/[0.07]">
                  &rdquo;
                </span>
                <blockquote className="relative pr-8 text-[16px] leading-relaxed tracking-[-0.01em] text-zinc-800 [text-wrap:pretty] dark:text-zinc-200">
                  {item.quote}
                </blockquote>
                {item.name ? (
                  <figcaption className="mt-auto flex items-center gap-3 pt-5">
                    <span
                      className="grid size-9 place-items-center rounded-full text-[12px] font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${(item.tone ?? ["#6366f1", "#a855f7"])[0]}, ${(item.tone ?? ["#6366f1", "#a855f7"])[1]})` }}
                    >
                      {initials(item.name)}
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-zinc-950 dark:text-white">{item.name}</span>
                      {item.role ? <span className="block text-[12.5px] text-zinc-500 dark:text-zinc-400">{item.role}</span> : null}
                    </span>
                  </figcaption>
                ) : null}
                </motion.div>
              </motion.figure>
            ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous testimonial"
          className="grid size-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose testimonial">
          {list.map((t, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t.name || `Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-zinc-950 dark:bg-white" : "w-1.5 bg-zinc-300 hover:bg-zinc-400 dark:bg-white/20",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next testimonial"
          className="grid size-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
