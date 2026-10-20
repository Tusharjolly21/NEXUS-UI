"use client";

import * as React from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlowButtonProps = {
  children?: React.ReactNode;
  href?: string;
  className?: string;
  /** Extra classes for the inner pill (padding, font size). */
  innerClassName?: string;
  /** Fill of the inner pill. Defaults to ink in light mode and near-white in dark mode. */
  background?: string;
  /** Label colour. Defaults to ink or white, whichever reads better on `background`. */
  textColor?: string;
  /** Arrow colour. Defaults to the label colour. */
  arrowColor?: string;
  /** Corner radius in px. */
  radius?: number;
  /** Extra box-shadow under the button, e.g. "0 20px 50px -10px rgba(0,113,227,.5)". */
  glow?: string;
  /** Colour of the resting rim. */
  borderColor?: string;
  /** Colours of the light that runs round the rim and spills behind the button. */
  colors?: string[];
  openInNewTab?: boolean;
  /** Orbits the light round the rim until someone points at the button. */
  autoplay?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof motion.a>, "children" | "href" | "color">;

const DEFAULT_COLORS = ["#0a84ff", "#bf5af2", "#ff9f0a", "#30d158"];

/** Picks ink or white for text on a hex fill; anything else gets white. */
function inkFor(fill: string) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(fill.trim());
  if (!m) return "#ffffff";
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#1d1d1f" : "#ffffff";
}

/**
 * A call-to-action link with a light that lives on its rim. The brightest
 * arc turns to face the pointer and the glow behind the button leans the
 * same way, the button drifts a few pixels toward the cursor, and the arrow
 * springs ahead on hover.
 */
export function GlowButton({
  children = "Get Started Now",
  href = "#",
  className,
  innerClassName,
  background,
  textColor,
  arrowColor,
  radius = 28,
  glow,
  borderColor,
  colors = DEFAULT_COLORS,
  openInNewTab = false,
  autoplay = false,
  style,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: GlowButtonProps) {
  const still = useReducedMotion() === true;
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noreferrer noopener" : undefined;
  const rounded = `${radius}px`;
  const touched = React.useRef(false);
  const orbit = React.useRef<AnimationPlaybackControls | null>(null);
  const [hot, setHot] = React.useState(false);

  const angleRaw = useMotionValue(-45);
  const angle = useSpring(angleRaw, { stiffness: 140, damping: 18 });
  const mx = useSpring(0, { stiffness: 260, damping: 18 });
  const my = useSpring(0, { stiffness: 260, damping: 18 });
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const leanX = useTransform(angle, (a) => Math.cos(((a - 50) * Math.PI) / 180) * 10);
  const leanY = useTransform(angle, (a) => Math.sin(((a - 50) * Math.PI) / 180) * 8);

  const [c0, c1, c2, c3] = [colors[0] ?? DEFAULT_COLORS[0], colors[1] ?? colors[0] ?? DEFAULT_COLORS[1], colors[2] ?? colors[0] ?? DEFAULT_COLORS[2], colors[3] ?? colors[1] ?? DEFAULT_COLORS[3]];
  const rim = useMotionTemplate`conic-gradient(from ${angle}deg at 50% 50%, ${c0} 0deg, ${c1} 40deg, ${c2} 80deg, transparent 130deg, transparent 230deg, ${c3} 300deg, ${c0} 360deg)`;
  const spot = useMotionTemplate`radial-gradient(120px 80px at ${px}% ${py}%, rgba(255,255,255,.16), transparent 70%)`;

  // The conic gradient starts at 12 o'clock and its brightest stretch sits ~40° in, so offset by that.
  const aimAt = (deg: number) => {
    const cur = angleRaw.get();
    const want = deg - 40;
    angleRaw.set(cur + ((((want - cur) % 360) + 540) % 360) - 180);
  };

  React.useEffect(() => {
    if (!autoplay || still) return;
    const step = () => {
      if (touched.current) return;
      orbit.current = animate(angleRaw, angleRaw.get() + 360, { duration: 5.5, ease: "linear", onComplete: step });
    };
    step();
    return () => orbit.current?.stop();
  }, [autoplay, still, angleRaw]);

  const stopDemo = () => {
    touched.current = true;
    orbit.current?.stop();
  };

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      initial="rest"
      animate={hot ? "hover" : "rest"}
      onPointerEnter={(e) => {
        stopDemo();
        setHot(true);
        onPointerEnter?.(e);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        aimAt((Math.atan2(dy, dx) * 180) / Math.PI + 90);
        px.set(((e.clientX - r.left) / r.width) * 100);
        py.set(((e.clientY - r.top) / r.height) * 100);
        if (!still) {
          mx.set(dx * 0.14);
          my.set(dy * 0.22);
        }
        onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        setHot(false);
        mx.set(0);
        my.set(0);
        onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        stopDemo();
        setHot(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setHot(false);
        onBlur?.(e);
      }}
      whileTap={still ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn(
        "group relative isolate inline-flex cursor-pointer select-none items-center justify-center no-underline outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black",
        className,
      )}
      style={{ x: mx, y: my, borderRadius: rounded, boxShadow: glow, ...style }}
      {...props}
    >
      {/* Glow that spills behind the button and leans toward the light. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 -z-10 blur-[16px]"
        style={{ backgroundImage: rim, borderRadius: rounded, x: leanX, y: leanY }}
        variants={{ rest: { opacity: 0.45, scale: 0.92 }, hover: { opacity: 0.85, scale: 1.04 } }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      />
      {/* Rim: a faint resting ring with the moving light on top. */}
      <span
        className={cn("relative inline-flex overflow-hidden p-[1.5px]", !borderColor && "bg-black/10 dark:bg-white/20")}
        style={{ borderRadius: rounded, backgroundColor: borderColor }}
      >
        <motion.span aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: rim, borderRadius: rounded }} variants={{ rest: { opacity: 0.8 }, hover: { opacity: 1 } }} />
        <span
          className={cn(
            "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap px-6 py-3 text-[15px] font-semibold leading-none tracking-[-0.01em]",
            !background && "bg-[#1d1d1f] dark:bg-[#f5f5f7]",
            !textColor && !background && "text-white dark:text-[#1d1d1f]",
            innerClassName,
          )}
          style={{ borderRadius: `${Math.max(0, radius - 1.5)}px`, background, color: textColor ?? (background ? inkFor(background) : undefined) }}
        >
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: spot }} variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }} />
          <span className="relative">{children}</span>
          <span className="relative grid size-[18px] place-items-center overflow-visible" style={{ color: arrowColor }}>
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden="true"
              variants={{ rest: { x: 0 }, hover: { x: 4 } }}
              transition={{ type: "spring", stiffness: 520, damping: 12 }}
            >
              <path d="M3.5 9h10M9.5 4.5 14 9l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </span>
        </span>
      </span>
    </motion.a>
  );
}

export function GlowButtonLink(props: GlowButtonProps) {
  return <GlowButton {...props} />;
}
