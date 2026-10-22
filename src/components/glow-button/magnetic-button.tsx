"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps {
  /** The label. Defaults to "Get started" with an arrow. */
  children?: ReactNode;
  /** "solid" is an ink pill that floods blue; "outline" is a white pill that floods ink. */
  variant?: "solid" | "outline";
  /** How far the button leans toward the pointer, as a fraction of the distance from its centre. The label leans half as far again. */
  strength?: number;
  /** Called when the button is pressed. */
  onClick?: () => void;
  /** Accessible name, when the label alone is not enough. */
  "aria-label"?: string;
  /** Pulls toward a ghost pointer, floods ink from one side, presses and drains again, on a loop until someone touches the button. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays a soft tap when the button is pressed. It follows the site-wide sound switch. Autoplay makes the same tap once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the button. */
  className?: string;
}

type Ink = { x: number; y: number; id: number; out?: { x: number; y: number } };

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SPRING = { stiffness: 220, damping: 16, mass: 0.6 };
const LOOP_MS = 4400;

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * A button with pull. It leans toward the pointer as you approach (the pull
 * starts in an invisible field around the button), the label leans a little
 * further so the two layers separate, and on hover ink floods in from exactly
 * where you entered and drains out where you leave. Press and it squashes.
 * It is a normal button by keyboard: Tab to focus, Enter or Space to press.
 * Under reduced motion it keeps a plain colour change on hover.
 */
export function MagneticButton({
  children = (
    <>
      Get started
      {ARROW}
    </>
  ),
  variant = "solid",
  strength = 0.35,
  onClick,
  "aria-label": ariaLabel,
  autoplay = false,
  enableSound = true,
  className,
}: MagneticButtonProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const field = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const touched = useRef(false);
  const inkId = useRef(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);
  const lx = useTransform(x, (v) => v * 0.5);
  const ly = useTransform(y, (v) => v * 0.5);
  const [ink, setInk] = useState<Ink | null>(null);
  const [demoPress, setDemoPress] = useState(false);
  const active = useDemoActive(field, autoplay && !reduce);
  const solid = variant === "solid";
  const hot = !!ink && !ink.out;

  const local = (e: React.PointerEvent) => {
    const r = btn.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };
  const pull = (clientX: number, clientY: number) => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((clientX - (r.left + r.width / 2)) * strength);
    my.set((clientY - (r.top + r.height / 2)) * strength);
  };
  const release = () => {
    mx.set(0);
    my.set(0);
  };

  // Demo: a ghost pointer leans in, floods ink, presses, then drains out the far side.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const after = (ms: number, fn: () => void) => {
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, ms),
      );
    };
    const run = () => {
      if (!alive || touched.current) return;
      const r = btn.current?.getBoundingClientRect();
      const w = r?.width ?? 160;
      const h = r?.height ?? 48;
      after(300, () => {
        inkId.current += 1;
        setInk({ x: w * 0.12, y: h * 0.5, id: inkId.current });
        mx.set(w * 0.2 * strength);
        my.set(-h * 0.25 * strength);
      });
      after(1500, () => {
        setDemoPress(true);
        play.auto("tap", 0.5);
      });
      after(1750, () => setDemoPress(false));
      after(2500, () => {
        setInk((k) => (k && !k.out ? { ...k, out: { x: w * 0.92, y: h * 0.4 } } : k));
        mx.set(0);
        my.set(0);
      });
      ids.push(window.setTimeout(run, LOOP_MS));
    };
    run();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
      setDemoPress(false);
    };
  }, [autoplay, reduce, active, strength, mx, my, play]);

  const toned = solid
    ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
    : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.14)]";
  const reducedHover = solid
    ? "hover:bg-[#0071e3] hover:text-white dark:hover:bg-[#0071e3] dark:hover:text-white"
    : "hover:bg-[#1d1d1f] hover:text-white dark:hover:bg-[#f5f5f7] dark:hover:text-[#1d1d1f]";
  const floodColor = solid ? "bg-[#0071e3]" : "bg-[#1d1d1f] dark:bg-[#f5f5f7]";
  const floodText = solid ? "text-white dark:text-white" : "text-white dark:text-[#1d1d1f]";

  return (
    // a larger invisible field so the pull starts before you touch the button
    <span
      ref={field}
      className="relative inline-flex p-6"
      onPointerEnter={() => {
        touched.current = true;
        setInk((k) => (k && !k.out ? { ...k, out: { x: k.x, y: k.y } } : k));
      }}
      onPointerMove={(e) => {
        touched.current = true;
        if (!reduce) pull(e.clientX, e.clientY);
      }}
      onPointerLeave={release}
    >
      <motion.button
        ref={btn}
        type="button"
        onClick={() => {
          touched.current = true;
          play("tap", 0.5);
          onClick?.();
        }}
        onFocus={() => {
          touched.current = true;
        }}
        aria-label={ariaLabel}
        style={reduce ? undefined : { x, y }}
        initial={false}
        animate={{ scaleX: demoPress ? 1.06 : 1, scaleY: demoPress ? 0.92 : 1 }}
        whileTap={reduce ? undefined : { scaleX: 1.06, scaleY: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onPointerEnter={(e) => {
          if (reduce) return;
          const p = local(e);
          inkId.current += 1;
          setInk({ x: p.x, y: p.y, id: inkId.current });
        }}
        onPointerLeave={(e) => {
          if (reduce) return;
          const p = local(e);
          setInk((k) => (k ? { ...k, out: { x: p.x, y: p.y } } : k));
        }}
        className={cn(
          "relative isolate h-12 cursor-pointer overflow-hidden rounded-full px-7 text-[15px] font-medium transition-colors duration-200",
          toned,
          reduce && reducedHover,
          FOCUS,
          className,
        )}
      >
        {ink && !reduce && (
          <motion.span
            key={ink.id}
            aria-hidden="true"
            className={cn("pointer-events-none absolute -z-10 h-[300px] w-[300px] rounded-full", floodColor)}
            // grows from where you came in; shrinks toward where you left
            style={{ left: ink.x - 150, top: ink.y - 150, transformOrigin: ink.out ? `${ink.out.x - ink.x + 150}px ${ink.out.y - ink.y + 150}px` : "50% 50%" }}
            initial={{ scale: 0 }}
            animate={{ scale: ink.out ? 0 : 1 }}
            transition={{ duration: ink.out ? 0.35 : 0.45, ease: ink.out ? [0.4, 0, 0.2, 1] : [0.2, 0, 0, 1] }}
            onAnimationComplete={() => {
              if (ink.out) setInk((k) => (k?.id === ink.id ? null : k));
            }}
          />
        )}
        <motion.span className={cn("relative flex items-center gap-2 transition-colors duration-200", hot && floodText)} style={reduce ? undefined : { x: lx, y: ly }}>
          {children}
        </motion.span>
      </motion.button>
    </span>
  );
}
