"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks";
import { MAP_HEIGHT, MAP_WIDTH } from "../data/map";
import { LandDots } from "../radar-map";

/** Four soft blobs of rain: [left %, top %, width %, colour]. */
const BLOBS: [number, number, number, string][] = [
  [30, 40, 46, "#34c759"],
  [55, 52, 34, "#ffd60a"],
  [42, 60, 22, "#ff9f0a"],
  [70, 30, 30, "#50b4ff"],
];

/** A miniature radar for the side phone: the dotted map, drifting rain and a progress card. */
export function RadarScreen() {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-full overflow-hidden" style={{ background: "#0d1117" }}>
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <LandDots radius={0.3} color="rgba(255,255,255,.25)" />
      </svg>
      {BLOBS.map(([left, top, size, color], index) => (
        <motion.div
          key={index}
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}%`,
            aspectRatio: "1",
            background: `radial-gradient(closest-side, ${color}cc, ${color}00)`,
            filter: "blur(6px)",
            mixBlendMode: "screen",
          }}
          animate={reduced ? undefined : { x: ["-20%", "40%"], y: ["0%", "-10%"] }}
          transition={{ duration: 7 + index, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-x-4 bottom-8 rounded-[18px] p-3 text-white" style={{ background: "rgba(30,30,32,.7)", backdropFilter: "blur(16px)" }}>
        <div className="text-[13px] font-semibold">Rain moving east</div>
        <div className="text-[12px] opacity-70">Reaches Amsterdam around 16:20</div>
        <div className="mt-2 h-1 rounded-full bg-white/20">
          <div className="h-full w-[38%] rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
