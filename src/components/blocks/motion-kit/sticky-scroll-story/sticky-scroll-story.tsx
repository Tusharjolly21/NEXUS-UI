"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StickyScrollStoryStep {
  title: string;
  body: string;
}

export interface StickyScrollStoryProps {
  /** One entry per chapter of copy. */
  steps?: StickyScrollStoryStep[];
  /**
   * Draws the picture that stays put. Receives the index of the step in view. The default is a transfer
   * card that becomes a button, a menu, a form and a receipt, one per default step. Keep it decorative.
   */
  renderVisual?: (step: number) => ReactNode;
  /** Accessible name for the scrolling region. */
  label?: string;
  /** Height of the scrolling frame in pixels. */
  height?: number;
  className?: string;
}

export const DEFAULT_STICKY_SCROLL_STORY_STEPS: StickyScrollStoryStep[] = [
  { title: "Start with one button", body: "Every flow begins with a single, obvious action. Nothing else competes with it." },
  { title: "Let it open into choices", body: "Press it and the same surface grows into the options. No new window, no jump." },
  { title: "Ask only what you need", body: "Pick one and the options fold into the two fields that choice requires." },
  { title: "End on a clear result", body: "Submit and the card settles into a receipt you can keep or undo." },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SURFACE = "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_50px_-26px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-26px_rgba(0,0,0,.9)]";
const FIELD = "bg-[#f5f5f7] dark:bg-[#3a3a3c]";
const BLUE = "text-[#0071e3] dark:text-[#2997ff]";

/** One card that becomes four different things, so the visual tells the same story as the text. */
function TransferVisual({ step }: { step: number }) {
  const choices = ["To a person", "To a business", "Between accounts"];
  return (
    <LayoutGroup>
      <motion.div
        layout
        className={cn("w-[280px] max-w-full overflow-hidden p-4", SURFACE)}
        style={{ borderRadius: step === 0 ? 999 : 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {step === 0 && (
            <motion.div
              key="0"
              className="flex items-center justify-center gap-2 px-6 py-1 text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071e3] text-[16px] leading-none text-white dark:bg-[#0a84ff]">+</span>
              New transfer
            </motion.div>
          )}
          {step === 1 && (
            <motion.ul key="1" className="m-0 list-none space-y-1.5 p-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {choices.map((x, i) => (
                <motion.li
                  key={x}
                  className={cn(
                    "flex items-center justify-between rounded-[14px] px-3.5 py-3 text-[14px]",
                    i === 0
                      ? "bg-[#eef5ff] font-semibold text-[#0071e3] dark:bg-[#0a84ff]/20 dark:text-[#2997ff]"
                      : "bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]",
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  {x}
                  <span aria-hidden="true">&rsaquo;</span>
                </motion.li>
              ))}
            </motion.ul>
          )}
          {step === 2 && (
            <motion.div key="2" className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={cn("text-[13px] font-semibold", BLUE)}>To a person</div>
              {["maya@orbitly.example", "$ 240.00"].map((x, i) => (
                <motion.div
                  key={x}
                  className={cn("rounded-[12px] px-3.5 py-3 text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]", FIELD)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i }}
                >
                  {x}
                </motion.div>
              ))}
              <div className="rounded-full bg-[#0071e3] py-2.5 text-center text-[14px] font-medium text-white dark:bg-[#0a84ff]">Send</div>
            </motion.div>
          )}
          {step >= 3 && (
            <motion.div key="3" className="py-2 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.svg
                className="mx-auto"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="11" fill="#34c759" />
                <motion.path
                  d="M7 12.5l3.2 3.2L17 9"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </motion.svg>
              <div className="mt-2 text-[22px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">$240.00</div>
              <div className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">sent to Maya Chen</div>
              <div className={cn("mt-3 text-[13px] font-medium", BLUE)}>Undo</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}

/**
 * A scroll story where the text scrolls and the picture stays. Each step of copy passes by on the left
 * while one card on the right, pinned in place, keeps changing shape to match it: button, menu, form,
 * receipt. The frame scrolls on its own, so it works the same on the page and inside any preview or tile.
 * On narrow screens the picture sits under each step instead. Under reduced motion the card swaps without
 * moving. There is no autoplay: the story is driven by scrolling the frame.
 */
export function StickyScrollStory({
  steps = DEFAULT_STICKY_SCROLL_STORY_STEPS,
  renderVisual,
  label = "Product story",
  height = 520,
  className,
}: StickyScrollStoryProps) {
  const box = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  // The step whose block crosses the middle of the frame is the one in view.
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setStep(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { root, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [steps]);

  const visual = (i: number) => (renderVisual ? renderVisual(i) : <TransferVisual step={i} />);

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={label} className={cn("@container w-full bg-white px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}>
        <div className="relative mx-auto w-full max-w-[1100px] overflow-hidden rounded-[24px] bg-[#f5f5f7] dark:bg-[#1c1c1e]">
          <div
            ref={box}
            tabIndex={0}
            role="region"
            aria-label={`${label}, scrollable`}
            className={cn("relative overflow-y-auto overscroll-y-auto", FOCUS)}
            style={{ height }}
          >
            <div className="grid grid-cols-1 gap-6 px-5 @2xl:grid-cols-2 @2xl:px-10">
              <div className="pb-[220px] pt-[160px]">
                {steps.map((s, i) => (
                  <motion.div
                    key={`${i}-${s.title}`}
                    data-step={i}
                    className="flex min-h-[300px] flex-col justify-center"
                    animate={{ opacity: step === i ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={cn("text-[13px] font-semibold tabular-nums", BLUE)}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="m-0 mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{s.title}</h3>
                    <p className="m-0 mt-2 max-w-[340px] text-[16px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">{s.body}</p>
                    {/* on narrow screens the visual sits inline under each step */}
                    <div aria-hidden="true" className="mt-5 @2xl:hidden">
                      {visual(i)}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div aria-hidden="true" className="hidden @2xl:block">
                <div className="sticky top-0 flex flex-col items-center justify-center gap-5" style={{ height }}>
                  {visual(step)}
                  <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                        animate={{ width: step === i ? 18 : 6, opacity: step === i ? 1 : 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f5f5f7] to-transparent dark:from-[#1c1c1e]" />
        </div>
      </section>
    </MotionConfig>
  );
}
