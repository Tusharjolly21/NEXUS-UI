"use client";
/**
 * Hydration-safe copy of the kit's StickyStory (kit/parts.tsx). The only change: the "wide"
 * media query is read with useSyncExternalStore, so the server render and the first client
 * render agree. Everything else is identical. (kit/parts.tsx has since been fixed the same way,
 * so new code can import StickyStory from the kit directly; this file stays for existing importers.)
 */
import { useState, useRef, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Fit } from "@/components/templates/kit/parts";

/** True while a media query matches; false on the server and during hydration. */
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

type StoryStep = { kicker: string; title: string; body: string; visual: ReactNode };

/**
 * Scroll story: the text steps scroll past normally while the visual on the
 * right stays pinned and swaps to match whichever step is in the middle of
 * the screen. A progress rail fills as you go.
 */
export function StickyStory({ steps, accent = "#0071e3", dark = false }: { steps: StoryStep[]; accent?: string; dark?: boolean }) {
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start center", "end center"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const wide = useMediaSafe("(min-width: 1024px)");
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

function Step({ s, active, accent, dark, wide }: { s: StoryStep; active: boolean; accent: string; dark: boolean; wide: boolean }) {
  return (
    <div className="flex flex-col justify-center gap-4 py-10 lg:min-h-[72vh] lg:pl-10">
      <motion.span animate={{ color: active ? accent : dark ? "#6e6e73" : "#86868b" }} className="text-[14px] font-semibold">{s.kicker}</motion.span>
      <motion.h3 animate={{ opacity: active || !wide ? 1 : 0.35 }} className={`m-0 text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em] ${dark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"}`}>{s.title}</motion.h3>
      <motion.p animate={{ opacity: active || !wide ? 1 : 0.35 }} className={`m-0 max-w-[460px] text-[18px] leading-[1.5] ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>{s.body}</motion.p>
      {!wide && <div className="mt-4 flex justify-center"><Fit>{s.visual}</Fit></div>}
    </div>
  );
}
