"use client";

import { useEffect, useRef, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type BackgroundGradientAs = "div" | "button" | "section";

export type BackgroundGradientProps = {
  children: ReactNode;
  /** Classes for the outer wrapper (size, layout). */
  className?: string;
  /** Classes for the content wrapper (padding goes here). */
  containerClassName?: string;
  /** Classes for the inner surface that sits inside the gradient ring. */
  surfaceClassName?: string;
  /** Colours of the ring, in order round the edge. Two or more. */
  colors?: string[];
  /** Spin speed multiplier (0.2 to 3). */
  animationSpeed?: number;
  /** Blur of the glow under the card, in px. */
  blur?: number;
  /** Corner radius of the wrapper. */
  borderRadius?: string;
  /** Thickness of the gradient ring, in px. */
  ringWidth?: number;
  /** Root element. "button" adds press feedback and keyboard focus. */
  as?: BackgroundGradientAs;
  /** Spins up and pulls the gradient toward the pointer on hover. */
  interactive?: boolean;
  /** Disables the button variant. */
  disabled?: boolean;
  /** Click handler (used with `as="button"`). */
  onClick?: () => void;
  /** Accessible name for the button variant when its content is not plain text. */
  "aria-label"?: string;
  /** Circles a pretend pointer round the card until someone hovers it. */
  autoplay?: boolean;
};

const DEFAULT_COLORS = ["#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f", "#ff9f0a"];

/**
 * A card or button wrapped in a slowly turning conic-gradient ring with a soft
 * glow under it. Hover and the ring spins up while its centre leans toward
 * the pointer on a spring; press and the whole card squashes, then springs
 * back past its size while the glow flashes.
 */
export function BackgroundGradient({
  children,
  className,
  containerClassName,
  surfaceClassName,
  colors = DEFAULT_COLORS,
  animationSpeed = 1,
  blur = 24,
  borderRadius = "24px",
  ringWidth = 1.5,
  as = "div",
  interactive = true,
  disabled = false,
  onClick,
  "aria-label": ariaLabel,
  autoplay = false,
}: BackgroundGradientProps) {
  const still = useReducedMotion() === true;
  const palette = colors.length >= 2 ? colors : DEFAULT_COLORS;
  const stops = [...palette, palette[0]].join(", ");
  const rate = Math.max(0.2, Math.min(3, animationSpeed));
  const live = interactive && !disabled;

  const angle = useMotionValue(0);
  const spin = useSpring(1, { stiffness: 90, damping: 16 });
  const cx = useSpring(50, { stiffness: 170, damping: 13 });
  const cy = useSpring(50, { stiffness: 170, damping: 13 });
  const glow = useSpring(0.42, { stiffness: 260, damping: 20 });
  const scale = useSpring(1, { stiffness: 520, damping: 17 });
  const hot = useSpring(0, { stiffness: 200, damping: 22 });
  const ring = useMotionTemplate`conic-gradient(from ${angle}deg at ${cx}% ${cy}%, ${stops})`;
  const sheen = useMotionTemplate`radial-gradient(160px circle at ${cx}% ${cy}%, rgba(255,255,255,.75), transparent 70%)`;
  const glowY = useTransform(glow, (g) => 4 + g * 10);
  const touched = useRef(false);
  const hovering = useRef(false);

  // The angle advances in a rAF loop; the spin spring scales how fast.
  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      angle.set((angle.get() + dt * (360 / (7 / rate)) * spin.get()) % 360);
      if (autoplay && live && !touched.current) {
        // A pretend pointer circling just inside the edge.
        const a = t * 1.3;
        cx.set(50 + Math.cos(a) * 38);
        cy.set(50 + Math.sin(a) * 34);
      }
    };
    raf = requestAnimationFrame(loop);
    if (autoplay && live) {
      spin.set(2.4);
      glow.set(0.7);
      hot.set(0.6);
    }
    return () => cancelAnimationFrame(raf);
  }, [still, rate, autoplay, live, angle, spin, cx, cy, glow, hot]);

  const settle = () => {
    hovering.current = false;
    spin.set(1);
    cx.set(50);
    cy.set(50);
    glow.set(0.42);
    hot.set(0);
    scale.set(1);
  };

  const handlers = live
    ? {
        onPointerMove: (e: RPointerEvent<HTMLElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          touched.current = true;
          if (!hovering.current) {
            hovering.current = true;
            spin.set(3.2);
            glow.set(0.8);
            hot.set(1);
          }
          cx.set(((e.clientX - r.left) / r.width) * 100);
          cy.set(((e.clientY - r.top) / r.height) * 100);
        },
        onPointerLeave: settle,
        onPointerDown: () => {
          touched.current = true;
          scale.set(0.965);
          glow.set(1);
        },
        onPointerUp: () => {
          scale.set(1);
          glow.set(hovering.current ? 0.8 : 0.42);
        },
        onPointerCancel: settle,
      }
    : {};

  const content = (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-[6%] -z-10"
        style={{ borderRadius, backgroundImage: ring, filter: `blur(${Math.max(0, blur)}px)`, opacity: glow, y: glowY }}
      />
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius }}>
        <motion.span className="absolute inset-0" style={{ backgroundImage: ring }} />
        <motion.span className="absolute inset-0 mix-blend-overlay" style={{ backgroundImage: sheen, opacity: hot }} />
      </span>
      <span
        aria-hidden
        className={cn("pointer-events-none absolute bg-white dark:bg-[#1c1c1e]", surfaceClassName)}
        style={{ inset: ringWidth, borderRadius: `calc(${borderRadius} - ${ringWidth}px)` }}
      />
      <span className={cn("relative z-10 block w-full", containerClassName)}>{children}</span>
    </>
  );

  const shared = {
    ...handlers,
    className: cn(
      "group relative isolate inline-flex text-left text-[#1d1d1f] dark:text-[#f5f5f7]",
      as === "button" &&
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black",
      className,
    ),
    style: { borderRadius, scale },
  };

  if (as === "button") {
    return (
      <motion.button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            touched.current = true;
            scale.set(0.965);
            glow.set(1);
          }
        }}
        onKeyUp={() => {
          scale.set(1);
          glow.set(0.42);
        }}
        {...shared}
      >
        {content}
      </motion.button>
    );
  }
  if (as === "section") return <motion.section {...shared}>{content}</motion.section>;
  return <motion.div {...shared}>{content}</motion.div>;
}
