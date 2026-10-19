"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Sticker = {
  id: string;
  /** resting position inside the hero, in % of its width / height */
  x: number;
  y: number;
  tilt: number;
  className: string;
  content: React.ReactNode;
};

const STICKERS: Sticker[] = [
  { id: "motion", x: 14, y: 21, tilt: -8, className: "bg-card text-foreground", content: <><Zap className="size-3.5 text-rainbow-violet" aria-hidden />Framer Motion</> },
  { id: "tailwind", x: 72, y: 17, tilt: 9, className: "bg-rainbow-blue text-white", content: <>Tailwind v4</> },
  { id: "copy", x: 9, y: 46, tilt: -6, className: "bg-tint-mint text-[#126b3a]", content: <><Copy className="size-3.5" aria-hidden />Copy &amp; paste</> },
  { id: "cli", x: 76, y: 42, tilt: 7, className: "pg-cta font-mono text-white", content: <>npx shadcn add</> },
  { id: "free", x: 16, y: 66, tilt: 5, className: "bg-[#17171c] text-white", content: <><Check className="size-3.5 text-rainbow-green" aria-hidden />Free to start</> },
  { id: "gooey", x: 69, y: 70, tilt: -9, className: "bg-card text-foreground", content: <><span className="size-2 rounded-full bg-rainbow-green" aria-hidden />Gooey Input</> },
];

/**
 * Decorative stickers around the hero headline. They drop in once, can be grabbed and thrown,
 * and spring back to where they were. Hidden from screen readers and on small screens.
 */
export function HeroStickers() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
      {STICKERS.map((s, i) => (
        <motion.div
          key={s.id}
          className={cn(
            "pg-glass pointer-events-auto absolute flex cursor-grab touch-none select-none items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold active:cursor-grabbing",
            s.className,
          )}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          initial={reduce ? { rotate: s.tilt } : { y: -320, rotate: s.tilt * 3, opacity: 0 }}
          animate={{ y: 0, rotate: s.tilt, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 13, mass: 0.9, delay: reduce ? 0 : 0.35 + i * 0.09 }}
          drag
          dragSnapToOrigin
          dragElastic={0.55}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 12 }}
          whileDrag={{ scale: 1.08, rotate: 0 }}
        >
          {s.content}
        </motion.div>
      ))}
    </div>
  );
}
