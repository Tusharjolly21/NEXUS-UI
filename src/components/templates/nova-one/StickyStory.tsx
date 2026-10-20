"use client";
/**
 * Local copy of the shared StickyStory part. The only change: the
 * "is this a wide screen" check uses useSyncExternalStore with a server
 * snapshot of false, so the first client render matches the server HTML
 * and there is no hydration mismatch.
 */
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Fit } from "@/components/templates/kit/parts";

const WIDE = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
function useWide() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => false);
}

/**
 * Scroll story: the text steps scroll past normally while the visual on the
 * right stays pinned and swaps to match whichever step is in the middle of
 * the screen. A progress rail fills as you go.
 */
export default function StickyStory({ steps, accent = "#0071e3", dark = false }: { steps: { kicker: string; title: string; body: string; visual: ReactNode }[]; accent?: string; dark?: boolean }) {
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start center", "end center"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const wide = useWide();
  // Active step comes straight from scroll progress, so fast scrolls and jumps never skip one.
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length)))));
  return (
    <div ref={wrap} className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <div className="relative flex flex-col">
        <div className={`absolute bottom-0 left-0 top-0 hidden w-[2px] rounded-full lg:block ${dark ? "bg-white/10" : "bg-black/[.06]"}`}>
          <motion.div className="w-full origin-top rounded-full" style={{ height: "100%", scaleY: fill, background: accent }} />
        </div>
        {steps.map((s, i) => (
          <Step key={i} active={active === i} accent={accent} dark={dark} s={s} wide={wide} />
        ))}
      </div>
      {wide && <div>
        <div className="sticky top-[14vh] flex h-[72vh] items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 40, scale: 0.94, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, scale: 0.96, filter: "blur(12px)" }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              className="flex w-full justify-center"
            >
              {steps[active].visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>}
    </div>
  );
}

function Step({ s, active, accent, dark, wide }: { s: { kicker: string; title: string; body: string; visual: ReactNode }; active: boolean; accent: string; dark: boolean; wide: boolean }) {
  return (
    <div className="flex flex-col justify-center gap-4 py-10 lg:min-h-[72vh] lg:pl-10">
      <motion.span animate={{ color: active ? accent : dark ? "#6e6e73" : "#86868b" }} className="text-[14px] font-semibold">{s.kicker}</motion.span>
      <motion.h3 animate={{ opacity: active || !wide ? 1 : 0.35 }} className={`m-0 text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em] ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>{s.title}</motion.h3>
      <motion.p animate={{ opacity: active || !wide ? 1 : 0.35 }} className={`m-0 max-w-[460px] text-[18px] leading-[1.5] ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>{s.body}</motion.p>
      {!wide && <div className="mt-4 flex justify-center"><Fit>{s.visual}</Fit></div>}
    </div>
  );
}

