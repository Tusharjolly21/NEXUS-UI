"use client";
/**
 * Local copy of the Motion Kit StickyStory with a hydration-safe media query.
 * The text steps scroll past while the visual stays pinned and swaps to the step
 * in the middle of the screen. A progress rail fills as you go.
 */
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Fit } from "@/components/templates/kit/parts";

export function useMediaSafe(q: string) {
  return useSyncExternalStore(
    (on) => {
      const mq = window.matchMedia(q);
      mq.addEventListener("change", on);
      return () => mq.removeEventListener("change", on);
    },
    () => window.matchMedia(q).matches,
    () => false,
  );
}

export interface StoryStep { kicker: string; title: string; body: string; visual: ReactNode }

export function Story({ steps, accent }: { steps: StoryStep[]; accent: string }) {
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start center", "end center"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const wide = useMediaSafe("(min-width: 1024px)");
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length)))));
  return (
    <div ref={wrap} className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <div className="relative flex flex-col">
        <div className="absolute bottom-0 left-0 top-0 hidden w-[2px] rounded-full bg-black/[.06] lg:block">
          <motion.div className="w-full origin-top rounded-full" style={{ height: "100%", scaleY: fill, background: accent }} />
        </div>
        {steps.map((s, i) => {
          const on = active === i;
          return (
            <div key={s.kicker} className="flex flex-col justify-center gap-4 py-10 lg:min-h-[70vh] lg:pl-10">
              <motion.span animate={{ color: on || !wide ? accent : "#6e6e73" }} className="text-[14px] font-semibold">{s.kicker}</motion.span>
              <motion.h3 animate={{ opacity: on || !wide ? 1 : 0.35 }} className="m-0 text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f]">{s.title}</motion.h3>
              <motion.p animate={{ opacity: on || !wide ? 1 : 0.35 }} className="m-0 max-w-[460px] text-[18px] leading-[1.5] text-[#6e6e73]">{s.body}</motion.p>
              {!wide && <div className="mt-4 flex justify-center"><Fit>{s.visual}</Fit></div>}
            </div>
          );
        })}
      </div>
      {wide && (
        <div>
          {/* Every visual stays mounted (so timers inside them never fire after unmount); only the active one shows. */}
          <div className="sticky top-[14vh] grid h-[72vh] place-items-center">
            {steps.map((s, i) => {
              const on = i === active;
              return (
                <motion.div
                  key={s.kicker}
                  aria-hidden={!on}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : i < active ? -24 : 24, scale: on ? 1 : 0.96 }}
                  transition={{ type: "spring", stiffness: 160, damping: 24 }}
                  className="col-start-1 row-start-1 flex w-full justify-center"
                  style={{ pointerEvents: on ? "auto" : "none", visibility: on ? "visible" : undefined }}
                  {...(!on ? { inert: true } : {})}
                >
                  {s.visual}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
