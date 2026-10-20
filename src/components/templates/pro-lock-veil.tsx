"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The lock drawn over a blurred, Pro-only screen. A light sweep runs across the frosted glass,
 * the shackle lifts and drops back on a loop, and a soft ring breathes out from the lock. Purely
 * decorative (aria-hidden); the action that unlocks lives next to it.
 */
export function ProLockVeil({
  label = "Pro",
  sublabel,
  className,
  size = "md",
  lock = true,
}: {
  label?: string;
  sublabel?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** False draws only the frost and the light sweep (place an AnimatedLock yourself). */
  lock?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* frost + sweep */}
      <div className="absolute inset-0 bg-white/25 backdrop-blur-[6px] dark:bg-black/25" />
      {reduce ? null : (
        <motion.div
          className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15"
          initial={{ x: "0%" }}
          animate={{ x: "420%" }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            repeatDelay: 1.4,
            ease: [0.45, 0, 0.2, 1],
          }}
        />
      )}

      {lock ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <AnimatedLock size={size} />
            <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.4)]">
              {label}
            </span>
            {sublabel ? (
              <span className="max-w-[260px] text-center text-[13px] font-medium text-[#1d1d1f]/80 dark:text-white/80">
                {sublabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** The padlock on its gradient tile: the shackle lifts and drops on a loop, two rings breathe out. */
export function AnimatedLock({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const reduce = useReducedMotion();
  const dim = size === "lg" ? 76 : size === "sm" ? 44 : 60;
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: dim * 1.9, height: dim * 1.9 }}
    >
      {reduce ? null : (
        <>
          <motion.span
            className="absolute rounded-full border border-white/70 dark:border-white/30"
            style={{ width: dim * 1.2, height: dim * 1.2 }}
            animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute rounded-full border border-white/70 dark:border-white/30"
            style={{ width: dim * 1.2, height: dim * 1.2 }}
            animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1.2,
            }}
          />
        </>
      )}
      <motion.div
        className="relative grid place-items-center rounded-[22px] bg-[conic-gradient(from_210deg,#0071e3,#bf5af2,#ff375f,#ff9f0a,#0071e3)] shadow-[0_18px_40px_-14px_rgba(0,113,227,0.6)]"
        style={{ width: dim, height: dim }}
        animate={reduce ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="grid size-[90%] place-items-center rounded-[19px] bg-[#1d1d1f]/15 backdrop-blur-sm">
          <svg
            width={dim * 0.5}
            height={dim * 0.5}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M7 11V7a5 5 0 0 1 10 0v4"
              animate={reduce ? undefined : { y: [0, -2.6, -2.6, 0, 0] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                times: [0, 0.18, 0.5, 0.62, 1],
                ease: "easeInOut",
              }}
            />
            <rect
              x="4.5"
              y="11"
              width="15"
              height="10"
              rx="2.4"
              fill="white"
              stroke="white"
            />
            <circle cx="12" cy="16" r="1.4" fill="#1d1d1f" stroke="none" />
          </svg>
        </span>
      </motion.div>
    </div>
  );
}
