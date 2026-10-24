Add the "Glowing Effect Cards" component from Nexus UI to my project.

Cards wrapped in a hairline rim that lights up on the side nearest the pointer: the lit arc chases the pointer round the edge on a spring, neighbouring cards catch the light as the pointer nears them, and a press flares it. Ships as GlowingEffect (wrap anything), GlowingCard (icon, title, line, call to action) and GlowingCardsLayout (a 2-1-2 grid that stacks by container width). Also includes Lit Border: A wrapper for any element: <LitBorder> draws a thin border whose light band turns to face the pointer and brightens as it gets closer. Put several inside <LightGroup> and they share one light, shown here on pricing cards and a search field.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { GlowingCard } from "@/components/glowing-effect-cards/GlowingCard";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glowing-effect-cards/GlowingEffect.tsx ---

```tsx
"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type GlowingEffectProps = {
  children: ReactNode;
  className?: string;
  /** Lead colour of the light. Used as the first of `colors` when `colors` is not set. */
  glowColor?: string;
  /** Colours along the lit arc, from tail to head. */
  colors?: string[];
  /** Corner radius, any CSS length. */
  borderRadius?: string;
  /** Turns the light off. */
  disabled?: boolean;
  /** Rim thickness and brightness multiplier (0.5-2). */
  intensity?: number;
  /** Blur of the soft bloom outside the rim, in px. */
  blur?: number;
  /** Width of the lit arc, in degrees. */
  spread?: number;
  /** How far outside the card the pointer still lights it, in px. */
  proximity?: number;
};

/** Shared virtual pointer (client coordinates). GlowingCardsLayout uses it to demo the light. */
export const GlowPointerContext = createContext<{ x: MotionValue<number>; y: MotionValue<number> } | null>(null);

const DEFAULT_COLORS = ["#5ac8fa", "#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a"];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Wraps any content in a hairline rim that lights up on the side nearest the
 * pointer. The lit arc chases the pointer round the edge on a spring, so it
 * swings past and settles; neighbouring cards catch the light as the pointer
 * nears them, and a press flares it.
 */
export function GlowingEffect({
  children,
  className = "",
  glowColor,
  colors,
  borderRadius = "22px",
  disabled = false,
  intensity = 1,
  blur = 18,
  spread = 90,
  proximity = 72,
}: GlowingEffectProps) {
  const still = useReducedMotion() === true;
  const ref = useRef<HTMLDivElement>(null);
  const shared = useContext(GlowPointerContext);
  const stops = colors && colors.length > 0 ? colors : glowColor ? [glowColor, ...DEFAULT_COLORS.slice(1)] : DEFAULT_COLORS;
  const k = clamp(intensity, 0.5, 2);
  const arc = clamp(spread, 20, 300);

  const angleTarget = useMotionValue(0);
  const angle = useSpring(angleTarget, still ? { stiffness: 1000, damping: 100 } : { stiffness: 110, damping: 13, mass: 0.9 });
  const litTarget = useMotionValue(0);
  const lit = useSpring(litTarget, { stiffness: 140, damping: 22 });
  const flare = useMotionValue(0);
  const glow = useTransform([lit, flare], ([l, f]) => clamp((l as number) + (f as number), 0, 1.6));
  const from = useTransform(angle, (a) => a - arc / 2);

  const gradient = useMotionTemplate`conic-gradient(from ${from}deg at 50% 50%, transparent 0deg, ${stops
    .map((c, i) => `${c} ${Math.round(((i + 1) / (stops.length + 1)) * arc)}deg`)
    .join(", ")}, transparent ${arc}deg, transparent 360deg)`;
  const bloomOpacity = useTransform(glow, (g) => g * 0.7);

  const proximityRef = useRef(proximity);
  const disabledRef = useRef(disabled);
  // Track a point in client coordinates; unwrap the angle so the spring always takes the short way round.
  const aim = useRef((cx: number, cy: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const outside = Math.max(0, Math.max(r.left - cx, cx - r.right, r.top - cy, cy - r.bottom));
    const near = 1 - clamp(outside / proximityRef.current, 0, 1);
    litTarget.set(disabledRef.current ? 0 : near);
    if (near <= 0) return;
    const a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const cur = angleTarget.get();
    const delta = ((((a - cur) % 360) + 540) % 360) - 180;
    angleTarget.set(cur + delta);
  });
  useEffect(() => {
    proximityRef.current = proximity;
    disabledRef.current = disabled;
    if (disabled) litTarget.set(0);
  }, [proximity, disabled, litTarget]);

  useEffect(() => {
    let raf = 0;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        aim.current(px, py);
      });
    };
    const onLeave = () => litTarget.set(0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [litTarget]);

  const fallback = useMotionValue(-1e6);
  useMotionValueEvent(shared?.x ?? fallback, "change", () => {
    if (shared) aim.current(shared.x.get(), shared.y.get());
  });

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ borderRadius }}
      onPointerDown={() => {
        if (disabled || still) return;
        flare.set(0.7);
        animate(flare, 0, { type: "spring", stiffness: 70, damping: 16 });
      }}
    >
      {!disabled ? (
        <>
          <motion.div
            className="pointer-events-none absolute -inset-px"
            style={{ borderRadius, background: gradient, opacity: bloomOpacity, filter: `blur(${Math.max(0, blur)}px)` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-white dark:bg-[#1c1c1e]" style={{ borderRadius }} aria-hidden="true" />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              borderRadius,
              padding: 1.5 * k,
              background: gradient,
              opacity: glow,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
            }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-white dark:bg-[#1c1c1e]" style={{ borderRadius }} aria-hidden="true" />
      )}
      <div
        className="relative z-[1] h-full shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
}
```

--- components/glowing-effect-cards/GlowingCard.tsx ---

```tsx
"use client";

import type { ReactNode } from "react";
import { GlowingEffect, type GlowingEffectProps } from "./GlowingEffect";

export type GlowingCardProps = {
  title: string;
  description: string;
  /** Icon shown in the tinted tile, usually an inline SVG. */
  icon?: ReactNode;
  /** Tint for the icon tile and the call to action. */
  accent?: string;
  className?: string;
  /** Spreads the content out for a tall card. */
  tall?: boolean;
  /** Call-to-action label at the bottom. */
  cta?: string;
  /** Turns the whole card into a link. */
  href?: string;
  /** Passed through to the glow. */
  glow?: Omit<GlowingEffectProps, "children" | "className">;
};

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** A feature card with a pointer-reactive glowing rim: icon, title, one line and an optional call to action. */
export function GlowingCard({ title, description, icon, accent = "#0071e3", className = "", tall = false, cta, href, glow }: GlowingCardProps) {
  const body = (
    <div className={`flex h-full flex-col p-4 ${tall ? "justify-between" : "justify-start"}`}>
      <div>
        {icon ? (
          <span className="mb-2.5 inline-grid size-9 place-items-center rounded-[10px]" style={{ background: `${accent}1f`, color: accent }}>
            {icon}
          </span>
        ) : null}
        <h3 className="text-[16px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        <p className="mt-1 text-[13px] leading-[1.4] text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>
      </div>
      {cta ? (
        <span className="group/cta mt-2 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: accent }}>
          {cta}
          <span className="transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/cta:translate-x-1">
            <Arrow />
          </span>
        </span>
      ) : null}
    </div>
  );
  return (
    <GlowingEffect className={`h-full ${className}`} {...glow}>
      {href ? (
        <a
          href={href}
          className="block h-full rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          {body}
        </a>
      ) : (
        body
      )}
    </GlowingEffect>
  );
}
```

# Lit Border

Add the "Lit Border" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { LightGroup, LitBorder } from "@/components/glowing-effect-cards/lit-border";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glowing-effect-cards/lit-border.tsx ---

```tsx
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
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
