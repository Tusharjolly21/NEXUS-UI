"use client";
/**
 * Local copy of the kit StickyStory. The only change: the wide-screen check uses
 * useSyncExternalStore with a server snapshot, so the first client render matches
 * the server HTML (the kit version reads matchMedia during the first render and
 * causes a hydration mismatch on desktop).
 */
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Fit } from "@/components/templates/kit/parts";

export interface StoryStep { kicker: string; title: string; body: string; visual: ReactNode }

function useWide(q = "(min-width: 1024px)") {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(q);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(q).matches,
    () => false,
  );
}

export default function StickyStory({ steps, accent = "#0071e3" }: { steps: StoryStep[]; accent?: string }) {
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start center", "end center"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const wide = useWide();
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
            <div key={i} className="flex flex-col justify-center gap-4 py-10 lg:min-h-[72vh] lg:pl-10">
              <motion.span animate={{ color: on ? accent : "#6e6e73" }} className="text-[14px] font-semibold">{s.kicker}</motion.span>
              <motion.h3 animate={{ opacity: on || !wide ? 1 : 0.35 }} className="m-0 text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f]">{s.title}</motion.h3>
              <motion.p animate={{ opacity: on || !wide ? 1 : 0.35 }} className="m-0 max-w-[460px] text-[18px] leading-[1.5] text-[#6e6e73]">{s.body}</motion.p>
              {!wide && <div className="mt-4 flex justify-center"><Fit>{s.visual}</Fit></div>}
            </div>
          );
        })}
      </div>
      {wide && (
        <div>
          <div className="sticky top-[14vh] flex h-[72vh] items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, scale: 0.97, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
                className="flex w-full justify-center"
              >
                {steps[active].visual}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
