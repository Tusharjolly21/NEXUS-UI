"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "./hooks";
import { Icon, type IconName } from "./icons";
import { EASE } from "./theme";
import { GlassCard } from "./ui";

/** Each floating card blurs and rises into place, one after the other, once the phone has landed. */
function floatIn(index: number) {
  return {
    initial: { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } },
    transition: { duration: 1.1, ease: EASE, delay: 0.9 + index * 0.12 },
  };
}

function CardTitle({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-semibold opacity-90">
      <Icon name={icon} size={14} />
      {children}
    </div>
  );
}

function FloatingCard({ index, position, className, children }: { index: number; position: string; className: string; children: ReactNode }) {
  return (
    <div className={`absolute ${position}`}>
      <motion.div {...floatIn(index)}>
        <GlassCard className={className}>{children}</GlassCard>
      </motion.div>
    </div>
  );
}

/** Twenty bars for the next hour: four dry minutes, then a swell of rain. */
const RAIN_BARS = Array.from({ length: 20 }, (_, i) => (i < 4 ? 8 : Math.round(25 + Math.sin(i / 2.4) * 30 + 40)));

const COMPASS_POINTS = ["N", "E", "S", "W"];

const SCALE_GRADIENT = "linear-gradient(90deg,#34c759,#ffd60a,#ff9f0a,#ff3b30,#af52de)";

/**
 * Four frosted cards that float around the phone on wide screens: next-hour rain, UV, wind and air quality.
 * They sit in a layer that drifts upward as the hero scrolls away.
 */
export function HeroWidgets() {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto h-full max-w-[1100px]">
      <FloatingCard index={0} position="left-[4%] top-[8%]" className="w-[230px] p-5">
        <CardTitle icon="cloud-rain-fill">Next hour</CardTitle>
        <div className="mt-1 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em]">Rain in 12 min</div>
        <div className="mt-3 flex h-10 items-end gap-[3px]">
          {RAIN_BARS.map((height, i) => (
            <span key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${height}%`, background: i < 4 ? "rgba(255,255,255,.35)" : "#fff" }} />
          ))}
        </div>
      </FloatingCard>

      <FloatingCard index={1} position="left-[10%] top-[52%]" className="w-[190px] p-5">
        <CardTitle icon="sun-fill">UV index</CardTitle>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[40px] font-semibold leading-none tracking-[-0.04em]">6</span>
          <span className="text-[16px] font-semibold">High</span>
        </div>
        <div className="relative mt-3 h-1.5 rounded-full" style={{ background: SCALE_GRADIENT }}>
          <span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white"
            style={{ left: "52%", boxShadow: "0 0 0 2px rgba(0,0,0,.25)" }}
          />
        </div>
      </FloatingCard>

      <FloatingCard index={2} position="right-[4%] top-[4%]" className="w-[210px] p-5">
        <CardTitle icon="wind">Wind</CardTitle>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full" style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.5)" }}>
            {COMPASS_POINTS.map((point, i) => (
              <span
                key={point}
                className="absolute text-[9px] font-semibold opacity-80"
                style={{ left: "50%", top: "50%", transform: `translate(-50%,-50%) rotate(${i * 90}deg) translateY(-24px) rotate(${-i * 90}deg)` }}
              >
                {point}
              </span>
            ))}
            {/* The arrow wobbles a few degrees around north-west, like a gusting wind. */}
            <motion.div
              className="absolute inset-0 grid place-items-center"
              animate={reduced ? undefined : { rotate: [130, 142, 128, 136] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name="navigation-arrow-fill" size={20} />
            </motion.div>
          </div>
          <div>
            <div className="text-[30px] font-semibold leading-none tracking-[-0.03em]">18</div>
            <div className="text-[13px] font-semibold opacity-90">km/h NW</div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard index={3} position="right-[9%] top-[38%]" className="w-[200px] p-5">
        <CardTitle icon="drop">Air quality</CardTitle>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[40px] font-semibold leading-none tracking-[-0.04em]">42</span>
          <span className="text-[16px] font-semibold">Good</span>
        </div>
        <div className="mt-2 text-[13px] leading-[1.35] opacity-90">Good for a run until about 18:00.</div>
      </FloatingCard>
    </div>
  );
}
