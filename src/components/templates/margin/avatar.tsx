"use client";

import { motion } from "framer-motion";
import { DISPLAY_FONT } from "./ui";
import { PROFILE } from "./data";

/**
 * Initials on a conic rainbow gradient with a soft highlight. The gradient turns a third of a turn, on a soft
 * spring, while the pointer is over it. It stands in for a photo: swap it for an <img> if you prefer.
 */
export function Avatar({ size = 88 }: { size?: number }) {
  return (
    <motion.div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      whileHover="spin"
      initial="rest"
    >
      <motion.div
        className="absolute inset-[-30%]"
        variants={{ rest: { rotate: 0 }, spin: { rotate: 120 } }}
        transition={{ type: "spring", stiffness: 60, damping: 14 }}
        style={{ background: "conic-gradient(from 200deg, #ffb37a, #ff6f91, #8b7bff, #4fc3f7, #7be0a7, #ffb37a)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(70% 70% at 30% 25%, rgba(255,255,255,.55), transparent 60%)" }}
      />
      <span
        className="relative font-medium text-white"
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: size * 0.32,
          letterSpacing: "-0.02em",
          textShadow: "0 1px 8px rgba(0,0,0,.2)",
        }}
      >
        {PROFILE.initials}
      </span>
    </motion.div>
  );
}
