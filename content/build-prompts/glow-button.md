# Magnetic Button

Add the "Magnetic Button" component from Nexus UI to my project.

A call-to-action link with a coloured light that lives on its rim. The brightest arc turns to face the pointer and the glow behind the button leans the same way, the button drifts a few pixels toward the cursor and the arrow springs ahead on hover. Also includes Magnetic Button: Leans toward your pointer with the label leaning further, ink floods in from where you enter and drains toward where you leave, and it squashes on press.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { GlowButton, GlowButtonLink, MagneticButton } from "@/components/glow-button";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glow-button/glow-button.tsx ---

```tsx
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
```

--- components/glow-button/index.ts ---

```ts
export { GlowButton, GlowButtonLink } from "./glow-button";
export type { GlowButtonProps } from "./glow-button";
export { MagneticButton } from "./magnetic-button";
export type { MagneticButtonProps } from "./magnetic-button";
```

--- components/glow-button/magnetic-button.tsx ---

```tsx
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
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
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
