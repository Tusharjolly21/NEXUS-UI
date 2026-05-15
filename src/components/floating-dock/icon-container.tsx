"use client";

import * as React from "react";
import Link from "next/link";
import type { MotionValue } from "framer-motion";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** Hit target (px); visual grows around bottom origin like macOS dock. */
const BASE = 46;
/** Peak scale at pointer over icon center (1 + MAX_EXTRA). */
const MAX_EXTRA = 0.62;
/** Horizontal distance (px) at which magnification falls to baseline (wider = stronger neighbor lift). */
const INFLUENCE_PX = 104;

/** Standalone spring MV: call `.set()` so every pointer update animates (follower-on-MV can feel inert in some trees). */
const DOCK_SPRING = { stiffness: 520, damping: 30, mass: 0.08 } as const;
const LIFT_SPRING = { stiffness: 420, damping: 32, mass: 0.15 } as const;

function scaleFromPointer(clientX: number, el: HTMLElement | null): number {
  if (el == null || !Number.isFinite(clientX)) return 1;
  const { left, width } = el.getBoundingClientRect();
  const center = left + width / 2;
  const dist = Math.abs(clientX - center);
  const u = Math.min(1, dist / INFLUENCE_PX);
  // Softer shoulder than pure quadratic so neighbors lift more like the reference dock.
  const falloff = (1 - u) ** 1.35;
  return 1 + MAX_EXTRA * falloff;
}

export type IconContainerProps = {
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
  disableLink?: boolean;
};

export function IconContainer({ mouseX, title, icon, href, active, disableLink = false }: IconContainerProps) {
  const reduceMotion = useReducedMotion() === true;
  const ref = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const scale = useSpring(1, DOCK_SPRING);
  const y = useSpring(0, LIFT_SPRING);

  useMotionValueEvent(mouseX, "change", (latest) => {
    if (reduceMotion) {
      scale.set(1);
      y.set(0);
      return;
    }
    if (latest === Number.POSITIVE_INFINITY || latest === Number.NEGATIVE_INFINITY) {
      scale.set(1);
      y.set(0);
      return;
    }
    const nextScale = scaleFromPointer(latest, ref.current);
    scale.set(nextScale);
    y.set(-(nextScale - 1) * 18);
  });

  React.useEffect(() => {
    if (reduceMotion) {
      scale.set(1);
      y.set(0);
    }
  }, [reduceMotion, scale, y]);

  return (
    <div className="relative mx-1 flex flex-col items-center pt-2.5 pb-1">
      <AnimatePresence>
        {hovered && !reduceMotion ? (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.2 }}
            className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg border border-border/80 bg-background/95 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-lg backdrop-blur-md dark:bg-zinc-900/95 dark:text-zinc-100"
            role="tooltip"
          >
            {title}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.div
        ref={ref}
        className="flex flex-col items-center will-change-[transform]"
        style={
          reduceMotion
            ? undefined
            : {
                scale,
                y,
                transformOrigin: "50% 100%",
              }
        }
      >
        {disableLink ? (
          <div
            title={title}
            aria-label={title}
            role="img"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
              "relative grid place-items-center rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-sm",
              active && "border-primary/40 bg-primary/12 text-primary shadow-[0_8px_22px_-12px_rgba(14,165,233,0.55)]",
            )}
            style={{
              width: BASE,
              height: BASE,
            }}
          >
            <span className="grid size-[2.15rem] place-items-center [&_svg]:size-[1.15rem] [&_svg]:shrink-0">{icon}</span>
          </div>
        ) : (
          <Link
            href={href}
            title={title}
            aria-label={title}
            aria-current={active ? "page" : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            onPointerDown={() => setHovered(true)}
            className={cn(
              "relative grid place-items-center rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-sm outline-none ring-offset-2 ring-offset-background transition-[color,background-color,border-color,box-shadow]",
              "hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/60",
              active && "border-primary/40 bg-primary/12 text-primary shadow-[0_8px_22px_-12px_rgba(14,165,233,0.55)]",
            )}
            style={{
              width: BASE,
              height: BASE,
            }}
          >
            <span className="grid size-[2.15rem] place-items-center [&_svg]:size-[1.15rem] [&_svg]:shrink-0">{icon}</span>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
