"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type StepFlowItem = {
  id?: string;
  serial?: string;
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
};

export type StepFlowProps = {
  steps?: StepFlowItem[];
  defaultStep?: number;
  highlightColor?: string;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

const defaultSteps: StepFlowItem[] = [
  {
    serial: "01",
    title: "Map the system",
    description: "Turn scattered product ideas into a clear structure your team can build from.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A focused workspace with a laptop and design notes",
  },
  {
    serial: "02",
    title: "Shape the interface",
    description: "Compose layouts, components, and states with a visual language that stays consistent.",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Design wireframes and interface sketches on a desk",
  },
  {
    serial: "03",
    title: "Refine the motion",
    description: "Add purposeful transitions so every interaction feels responsive, calm, and premium.",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Abstract architecture with strong perspective lines",
  },
  {
    serial: "04",
    title: "Ship the page",
    description: "Package the final experience into reusable React code that is ready for production.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Analytics dashboard on a monitor",
  },
];

export function StepFlow({
  steps = defaultSteps,
  defaultStep = 0,
  highlightColor = "rgb(229 229 229)",
  className,
  textClassName,
  imageClassName,
  autoPlay = false,
  autoPlayInterval = 3500,
}: StepFlowProps) {
  const reduceMotion = useReducedMotion() === true;
  const safeSteps = steps.length > 0 ? steps : defaultSteps;
  const initialStep = Math.min(Math.max(defaultStep, 0), safeSteps.length - 1);
  const [activeIndex, setActiveIndex] = React.useState(initialStep);
  const activeStep = safeSteps[activeIndex] ?? safeSteps[0];

  React.useEffect(() => {
    if (!autoPlay || safeSteps.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % safeSteps.length);
    }, Math.max(1200, autoPlayInterval));

    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, safeSteps.length]);

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden rounded-[25px] bg-white p-4 text-neutral-950 dark:bg-neutral-950 dark:text-white",
        className,
      )}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(360px,1.08fr)] lg:gap-12">
        <div
          className={cn(
            "relative flex min-h-[360px] flex-col justify-around rounded-[22px] p-2 sm:min-h-[420px] lg:min-h-[520px]",
            textClassName,
          )}
        >
          {safeSteps.map((step, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={step.id ?? `${step.serial ?? index}-${step.title}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "group relative z-10 flex w-full cursor-pointer flex-col items-start rounded-[20px] px-5 py-4 text-left outline-none transition-colors sm:px-8",
                  "focus-visible:ring-2 focus-visible:ring-neutral-950/20 dark:focus-visible:ring-white/25",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="step-flow-highlight"
                    className="absolute inset-0 -z-10 rounded-[20px] shadow-sm"
                    style={{ backgroundColor: highlightColor }}
                    transition={
                      reduceMotion
                        ? { duration: 0.1 }
                        : { type: "spring", bounce: 0.2, duration: 0.55 }
                    }
                  />
                )}
                <span
                  className={cn(
                    "text-right text-xl leading-none transition-colors sm:text-2xl",
                    isActive ? "text-neutral-950" : "text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  {step.serial ?? String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "mt-1 text-balance text-3xl font-semibold tracking-tight transition-colors sm:text-5xl lg:text-[56px] lg:leading-[1.05]",
                    isActive ? "text-neutral-950" : "text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  {step.title}
                </span>
                {step.description ? (
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.span
                        className="mt-3 max-w-[34rem] text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-700"
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, filter: "blur(8px)" }}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(8px)" }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {step.description}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                ) : null}
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            "relative flex min-h-[420px] items-center justify-center rounded-[20px] bg-neutral-200 p-4 sm:min-h-[540px] sm:p-6 dark:bg-neutral-900",
            imageClassName,
          )}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeStep.id ?? activeStep.title}
              src={activeStep.image}
              alt={activeStep.imageAlt ?? activeStep.title}
              className="h-full max-h-[560px] min-h-[360px] w-full rounded-[24px] border border-black/10 object-cover shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] dark:border-white/10"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04, y: 10, filter: "blur(14px)" }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: -8, filter: "blur(10px)" }}
              transition={
                reduceMotion
                  ? { duration: 0.1 }
                  : { type: "spring", bounce: 0, duration: 0.7 }
              }
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default StepFlow;
