"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type LikeBurstSize = "sm" | "md" | "lg";

export type LikeBurstProps = {
  /** Controlled like count. */
  count?: number;
  /** Starting count when uncontrolled. */
  defaultCount?: number;
  /** Controlled liked state. */
  liked?: boolean;
  /** Starting liked state when uncontrolled. */
  defaultLiked?: boolean;
  /** Called with the next liked state and count. */
  onChange?: (liked: boolean, count: number) => void;
  /** Heart and burst colour. */
  color?: string;
  size?: LikeBurstSize;
  /** Number of particles in the burst (0 turns it off). */
  burst?: number;
  /** Accessible label; the count is appended automatically. */
  label?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  className?: string;
};

const SIZES: Record<LikeBurstSize, { h: string; px: string; text: string; icon: number; gap: string }> = {
  sm: { h: "h-8", px: "pl-2.5 pr-3", text: "text-[13px]", icon: 15, gap: "gap-1.5" },
  md: { h: "h-10", px: "pl-3 pr-4", text: "text-[15px]", icon: 18, gap: "gap-2" },
  lg: { h: "h-12", px: "pl-4 pr-5", text: "text-[17px]", icon: 22, gap: "gap-2.5" },
};

const PARTICLE_TINTS = ["#ff9f1c", "#5b8def", "#8b5cf6", "#22c55e", "#ffc94d"];

/** A key that changes every time the digit changes, so a digit that returns to an earlier value still rolls. */
function useDigitVersion(digit: string) {
  const [state, setState] = React.useState({ digit, version: 0 });
  if (state.digit !== digit) {
    const next = { digit, version: state.version + 1 };
    setState(next);
    return next.version;
  }
  return state.version;
}

/** One digit that rolls vertically when it changes. */
function RollingDigit({ digit, direction }: { digit: string; direction: 1 | -1 }) {
  const reduce = useReducedMotion();
  const version = useDigitVersion(digit);
  return (
    <span className="relative inline-flex h-[1.2em] w-[1ch] justify-center overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.span
          key={version}
          custom={direction}
          variants={{
            enter: (d: number) => ({ y: reduce ? 0 : `${d * 100}%`, opacity: 0 }),
            center: { y: "0%", opacity: 1 },
            exit: (d: number) => ({ y: reduce ? 0 : `${d * -100}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="inline-block leading-[1.2em]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** +1 when the value went up since the last render, -1 when it went down. */
function useRollDirection(value: number): 1 | -1 {
  const [state, setState] = React.useState<{ value: number; dir: 1 | -1 }>({ value, dir: 1 });
  if (state.value !== value) {
    const next = { value, dir: (value > state.value ? 1 : -1) as 1 | -1 };
    setState(next);
    return next.dir;
  }
  return state.dir;
}

/** A number whose digits roll one by one, odometer style. */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  const direction = useRollDirection(value);
  const text = new Intl.NumberFormat("en-US").format(value);
  return (
    <span className={cn("inline-flex tabular-nums", className)} aria-hidden>
      {text.split("").map((char, i) =>
        /\d/.test(char) ? (
          <RollingDigit key={text.length - i} digit={char} direction={direction} />
        ) : (
          <span key={`sep-${text.length - i}`} className="leading-[1.2em]">
            {char}
          </span>
        ),
      )}
    </span>
  );
}

function Burst({ count, color, radius }: { count: number; color: string; radius: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <motion.span
        className="absolute left-1/2 top-1/2 rounded-full border-2"
        style={{ borderColor: color, width: radius * 1.4, height: radius * 1.4, marginLeft: -radius * 0.7, marginTop: -radius * 0.7 }}
        initial={{ scale: 0.3, opacity: 0.95 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.3, 1] }}
      />
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.18 : -0.08);
        const dist = radius * (i % 2 ? 1.65 : 2.15);
        const size = i % 3 === 0 ? 7 : 5;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              background: i % 2 ? color : PARTICLE_TINTS[i % PARTICLE_TINTS.length],
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: [1, 1, 0] }}
            transition={{ duration: 0.7, ease: [0.15, 0.85, 0.35, 1] }}
          />
        );
      })}
    </span>
  );
}

export function LikeBurst({
  count,
  defaultCount = 1299,
  liked,
  defaultLiked = false,
  onChange,
  color = "#ff3b5c",
  size = "md",
  burst = 10,
  label = "Like",
  enableSound = true,
  className,
}: LikeBurstProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion();
  const [innerLiked, setInnerLiked] = React.useState(defaultLiked);
  const [innerCount, setInnerCount] = React.useState(defaultCount);
  const [burstKey, setBurstKey] = React.useState(0);
  const isLiked = liked ?? innerLiked;
  const value = count ?? innerCount;
  const s = SIZES[size];

  const toggle = () => {
    const nextLiked = !isLiked;
    const nextCount = Math.max(0, value + (nextLiked ? 1 : -1));
    if (nextLiked) play("pop");
    else play("off", 0.5);
    if (liked === undefined) setInnerLiked(nextLiked);
    if (count === undefined) setInnerCount(nextCount);
    if (nextLiked) setBurstKey((k) => k + 1);
    onChange?.(nextLiked, nextCount);
  };

  return (
    <motion.button
      type="button"
      aria-pressed={isLiked}
      aria-label={`${label}, ${new Intl.NumberFormat("en-US").format(value)} likes`}
      onClick={toggle}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 26 }}
      className={cn(
        "relative inline-flex select-none items-center rounded-full border font-medium outline-none",
        "border-black/[0.07] bg-white text-[#17181a] shadow-[0_1px_2px_rgba(16,17,20,0.06),0_4px_14px_-6px_rgba(16,17,20,0.12)]",
        "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
        "transition-colors hover:bg-neutral-50 dark:hover:bg-zinc-800/80",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        s.h,
        s.px,
        s.text,
        s.gap,
        className,
      )}
      style={{ ["--tw-ring-color" as string]: color }}
    >
      <span className="relative grid place-items-center" style={{ width: s.icon + 4, height: s.icon + 4 }}>
        {!reduce && burst > 0 && burstKey > 0 && isLiked ? (
          <Burst key={`burst-${burstKey}`} count={burst} color={color} radius={s.icon} />
        ) : null}
        <motion.span
          key={burstKey}
          className="grid place-items-center"
          initial={burstKey === 0 ? false : undefined}
          animate={
            reduce || !isLiked
              ? { scale: 1, scaleX: 1, scaleY: 1 }
              : { scale: [1, 0.62, 1.28, 0.94, 1], scaleX: [1, 1.18, 0.9, 1.04, 1], scaleY: [1, 0.82, 1.12, 0.97, 1] }
          }
          transition={{ duration: 0.55, times: [0, 0.18, 0.48, 0.74, 1], ease: "easeOut" }}
        >
          <Heart
            width={s.icon}
            height={s.icon}
            strokeWidth={2}
            className="transition-colors duration-200"
            style={{ color: isLiked ? color : undefined, fill: isLiked ? color : "transparent" }}
          />
        </motion.span>
      </span>
      <RollingNumber value={value} />
    </motion.button>
  );
}
