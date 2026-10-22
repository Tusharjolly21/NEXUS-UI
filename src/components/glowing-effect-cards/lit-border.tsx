"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type Pointer = { px: MotionValue<number>; py: MotionValue<number> };
const LightCtx = createContext<Pointer | null>(null);

/** Where a pointer sits when there is none: far off screen, so the light rests at its dimmest. */
const AWAY = -9999;
const ORBIT_MS = 1600;

export interface LightGroupProps {
  /** The elements that share the light, usually several `LitBorder`s. */
  children: ReactNode;
  /** Extra classes for the wrapper. */
  className?: string;
  /** While nobody is pointing, the light circles the group on its own until the first real pointer arrives. Never runs under reduced motion. */
  autoplay?: boolean;
}

export interface LitBorderProps {
  /** The element to wrap: a card, an input, a button, anything. */
  children: ReactNode;
  /** Outer corner radius in px. Use a large value (999) for pills. */
  radius?: number;
  /** Border thickness in px. */
  width?: number;
  /** Three RGB triplets for the lit arc, as "r,g,b" strings: head, middle and tail. */
  colors?: [string, string, string];
  /** Extra classes for the outer frame. */
  className?: string;
}

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

/**
 * Shares one pointer with every `LitBorder` inside it, so a row of cards reads
 * as a single light moving across them. With `autoplay`, and no pointer around,
 * the light slowly circles the group on its own until a real pointer arrives.
 * When the pointer leaves, the light dims back to rest.
 */
export function LightGroup({ children, className, autoplay = false }: LightGroupProps) {
  const reduce = useReducedMotion() ?? false;
  const wrap = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const px = useMotionValue(AWAY);
  const py = useMotionValue(AWAY);
  const active = useDemoActive(wrap, autoplay && !reduce);

  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    let t = 0;
    const step = () => {
      const el = wrap.current;
      if (touched.current || !el) return;
      const r = el.getBoundingClientRect();
      t += 1;
      animate(px, r.left + r.width / 2 + Math.cos(t * 0.9) * r.width * 0.55, { duration: t === 1 ? 0 : ORBIT_MS / 1000, ease: "easeInOut" });
      animate(py, r.top + r.height / 2 + Math.sin(t * 0.9) * r.height * 0.8, { duration: t === 1 ? 0 : ORBIT_MS / 1000, ease: "easeInOut" });
    };
    step();
    const id = window.setInterval(step, ORBIT_MS);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active, px, py]);

  return (
    <LightCtx.Provider value={{ px, py }}>
      <div
        ref={wrap}
        className={className}
        onPointerMove={(e) => {
          touched.current = true;
          px.set(e.clientX);
          py.set(e.clientY);
        }}
        onPointerLeave={() => {
          px.set(AWAY);
          py.set(AWAY);
        }}
      >
        {children}
      </div>
    </LightCtx.Provider>
  );
}

/**
 * Wraps any element in a thin border whose light band turns to face the
 * pointer and brightens as it gets closer. Works on cards, inputs, buttons,
 * anything. Inside a `LightGroup` it shares that group's pointer; on its own it
 * tracks the pointer over itself. When something inside it has keyboard focus
 * the light stays fully lit.
 */
export function LitBorder({ children, radius = 24, width = 1.5, colors = ["0,113,227", "94,92,230", "48,209,88"], className }: LitBorderProps) {
  const group = useContext(LightCtx);
  const ownX = useMotionValue(AWAY);
  const ownY = useMotionValue(AWAY);
  const px = group?.px ?? ownX;
  const py = group?.py ?? ownY;
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const angle = useMotionValue(0);
  const glow = useMotionValue(0.12);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = px.get() - (r.left + r.width / 2);
      const dy = py.get() - (r.top + r.height / 2);
      angle.set((Math.atan2(dy, dx) * 180) / Math.PI + 90);
      const out = Math.max(0, Math.abs(dx) - r.width / 2, Math.abs(dy) - r.height / 2);
      glow.set(Math.max(focused.current ? 1 : 0.12, 1 - out / 260));
    };
    const a = px.on("change", update);
    const b = py.on("change", update);
    return () => {
      a();
      b();
    };
  }, [px, py, angle, glow]);

  const [c1, c2, c3] = colors;
  const bg = useMotionTemplate`conic-gradient(from ${angle}deg at 50% 50%, rgba(${c1},${glow}) 0deg, rgba(${c2},${glow}) 40deg, rgb(var(--lit-rest) / var(--lit-rest-a)) 90deg, rgb(var(--lit-rest) / var(--lit-rest-a)) 270deg, rgba(${c3},${glow}) 320deg, rgba(${c1},${glow}) 360deg)`;
  const style: CSSProperties = { padding: width, borderRadius: radius };

  return (
    <motion.div
      ref={ref}
      className={cn("relative [--lit-rest-a:.08] [--lit-rest:0_0_0] dark:[--lit-rest-a:.16] dark:[--lit-rest:255_255_255]", className)}
      style={{ ...style, background: bg }}
      onPointerMove={
        group
          ? undefined
          : (e) => {
              ownX.set(e.clientX);
              ownY.set(e.clientY);
            }
      }
      onPointerLeave={
        group
          ? undefined
          : () => {
              ownX.set(AWAY);
              ownY.set(AWAY);
            }
      }
      onFocus={() => {
        focused.current = true;
        glow.set(1);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        focused.current = false;
        glow.set(0.12);
      }}
    >
      <div className="relative h-full bg-white dark:bg-[#1c1c1e]" style={{ borderRadius: radius - width }}>
        {children}
      </div>
    </motion.div>
  );
}
