Add the "Cursor Buddy" component from Nexus UI to my project.

A soft little character whose eyes follow the pointer anywhere on the page, sliding round its curved face and narrowing near the edge. It blinks, flinches when you come close, dozes off when left alone, and hops with a squash and stretch when you click it or press Enter.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { CursorBuddy } from "@/components/cursor-buddy";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/cursor-buddy/cursor-buddy.tsx ---

```tsx
"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type CursorBuddyShape = "squircle" | "pill" | "circle";
export type CursorBuddyEyes = "dots" | "slits" | "squares";

export type CursorBuddyProps = {
  /** Silhouette of the character. */
  shape?: CursorBuddyShape;
  /** `light`, `dark`, or any CSS colour for the body. */
  fill?: "light" | "dark" | (string & {});
  /** Eye style. */
  eyes?: CursorBuddyEyes;
  /** Height of the body in px (the pill is wider than it is tall). */
  size?: number;
  /** How far the head turns towards the pointer, 0–100. */
  follow?: number;
  /** Fall asleep after this many ms without pointer movement. `0` keeps it awake. */
  sleepAfter?: number;
  /** Colour of the eyes. Defaults to ink on light bodies and white on dark ones. */
  eyeColor?: string;
  /** Click, tap, Enter or Space makes it hop with a squash and stretch. */
  poke?: boolean;
  /** Called after each poke. */
  onPoke?: () => void;
  /** Looks around on its own (and hops now and then) until the pointer first moves. */
  autoplay?: boolean;
  className?: string;
};

/** Where the two eyes sit on the face, as points on a unit sphere (x right, y down). */
const EYE_BASE: [number, number][] = [
  [-0.3, -0.06],
  [0.3, -0.06],
];

const EYE_SIZE: Record<CursorBuddyEyes, { w: number; h: number; radius: string }> = {
  dots: { w: 0.105, h: 0.16, radius: "9999px" },
  slits: { w: 0.06, h: 0.2, radius: "9999px" },
  squares: { w: 0.13, h: 0.13, radius: "22%" },
};

const SPRING = { stiffness: 170, damping: 18, mass: 0.6 };

function isDarkColor(color: string) {
  const hex = color.trim().replace("#", "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) return false;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

/** Project an eye that sits on the face's surface after the head turns by yaw / pitch. */
function project(x0: number, y0: number, yaw: number, pitch: number) {
  const z0 = Math.sqrt(Math.max(0, 1 - x0 * x0 - y0 * y0));
  const x1 = x0 * Math.cos(yaw) + z0 * Math.sin(yaw);
  const z1 = -x0 * Math.sin(yaw) + z0 * Math.cos(yaw);
  const y2 = y0 * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y0 * Math.sin(pitch) + z1 * Math.cos(pitch);
  return {
    x: x1,
    y: y2,
    // foreshortening: an eye near the rim is seen edge-on and narrows
    sx: Math.sqrt(Math.max(0.08, 1 - x1 * x1)),
    sy: Math.sqrt(Math.max(0.08, 1 - y2 * y2)),
    visible: Math.min(1, Math.max(0, z2 * 4)),
  };
}

function Eye({
  base,
  yaw,
  pitch,
  rx,
  ry,
  width,
  height,
  radius,
  color,
  lid,
  widen,
}: {
  base: [number, number];
  yaw: MotionValue<number>;
  pitch: MotionValue<number>;
  rx: number;
  ry: number;
  width: number;
  height: number;
  radius: string;
  color: string;
  lid: MotionValue<number>;
  widen: MotionValue<number>;
}) {
  const p = useTransform(() => project(base[0], base[1], yaw.get(), pitch.get()));
  const x = useTransform(() => p.get().x * rx);
  const y = useTransform(() => p.get().y * ry);
  const scaleX = useTransform(() => p.get().sx * widen.get());
  const scaleY = useTransform(() => p.get().sy * lid.get() * widen.get());
  const opacity = useTransform(() => p.get().visible);

  return (
    <motion.span
      className="absolute left-1/2 top-1/2"
      style={{
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        borderRadius: radius,
        background: color,
        x,
        y,
        scaleX,
        scaleY,
        opacity,
      }}
    />
  );
}

/** Where the eyes wander during autoplay, as [yaw, pitch] fractions of the follow range. */
const GAZE: [number, number][] = [
  [-0.8, 0.2],
  [0.7, -0.4],
  [0.2, 0.55],
  [-0.5, -0.5],
  [0.9, 0.1],
  [0, 0],
];

/**
 * A soft little character whose eyes follow the pointer anywhere on the page. The eyes sit on
 * the curved face, so they slide round it and narrow near the edge as the head turns. It blinks
 * now and then, flinches when the pointer comes very close, dozes off when left alone, and hops
 * with a squash and stretch when you poke it.
 */
export function CursorBuddy({
  shape = "squircle",
  fill = "light",
  eyes = "dots",
  size = 120,
  follow = 60,
  sleepAfter = 9000,
  eyeColor,
  poke = true,
  onPoke,
  autoplay = false,
  className,
}: CursorBuddyProps) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const touched = React.useRef(false);
  const hopTimers = React.useRef<number[]>([]);

  const width = shape === "pill" ? Math.round(size * 1.45) : size;
  const height = size;
  const custom = fill !== "light" && fill !== "dark";
  const darkBody = fill === "dark" || (custom && isDarkColor(fill));
  const eyeFill = eyeColor ?? (darkBody ? "#ffffff" : "#17181a");
  const eye = EYE_SIZE[eyes];

  const yawRaw = useMotionValue(0);
  const pitchRaw = useMotionValue(0);
  const yaw = useSpring(yawRaw, SPRING);
  const pitch = useSpring(pitchRaw, SPRING);
  const lid = useSpring(1, { stiffness: 900, damping: 40 });
  const widen = useSpring(1, { stiffness: 400, damping: 18 });
  const squashY = useSpring(1, { stiffness: 380, damping: 14 });
  const squashX = useTransform(squashY, (v) => 1 + (1 - v) * 0.7);
  const hopY = useSpring(0, { stiffness: 260, damping: 13, mass: 0.7 });
  const shadowScale = useTransform(hopY, [-size * 0.3, 0], [0.55, 1]);
  const shadowOpacity = useTransform(hopY, [-size * 0.3, 0], [0.12, 0.28]);

  const [asleep, setAsleep] = React.useState(false);
  const asleepRef = React.useRef(false);

  // follow the pointer anywhere on the page
  React.useEffect(() => {
    const maxAngle = (Math.max(0, Math.min(100, follow)) / 100) * 1.05;
    let sleepTimer = 0;
    let startled = false;

    const wake = () => {
      if (asleepRef.current) {
        asleepRef.current = false;
        setAsleep(false);
      }
      window.clearTimeout(sleepTimer);
      if (sleepAfter > 0) {
        sleepTimer = window.setTimeout(() => {
          // The autoplay demo keeps it awake until someone actually moves the pointer.
          if (autoplay && !touched.current) return;
          asleepRef.current = true;
          setAsleep(true);
          yawRaw.set(0);
          pitchRaw.set(0.12);
        }, sleepAfter);
      }
    };

    const onMove = (e: PointerEvent) => {
      const node = ref.current;
      if (!node) return;
      touched.current = true;
      wake();
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const reach = Math.max(220, r.width * 2.4);
      yawRaw.set(maxAngle * Math.tanh(dx / reach));
      pitchRaw.set(-maxAngle * 0.8 * Math.tanh(dy / reach));

      const near = Math.hypot(dx, dy) < r.height * 0.62;
      if (near !== startled && !reduce) {
        startled = near;
        widen.set(near ? 1.3 : 1);
        squashY.set(near ? 0.88 : 1);
      }
    };

    wake();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(sleepTimer);
    };
  }, [follow, sleepAfter, reduce, yawRaw, pitchRaw, widen, squashY, autoplay]);

  // eyelids: closed while asleep, otherwise an occasional natural blink (sometimes a double)
  React.useEffect(() => {
    if (asleep) {
      lid.set(0.1);
      return;
    }
    lid.set(1);
    if (reduce) return;
    let t = 0;
    const blink = (twice: boolean) => {
      lid.set(0.08);
      t = window.setTimeout(() => {
        lid.set(1);
        if (twice) t = window.setTimeout(() => blink(false), 160);
        else schedule();
      }, 110);
    };
    const schedule = () => {
      t = window.setTimeout(() => blink(Math.random() < 0.22), 2200 + Math.random() * 3800);
    };
    schedule();
    return () => window.clearTimeout(t);
  }, [asleep, reduce, lid]);

  React.useEffect(() => {
    const pending = hopTimers;
    return () => pending.current.forEach((t) => window.clearTimeout(t));
  }, []);

  /** Squash down, spring up stretched, land with a squash, settle. */
  const hop = React.useCallback(() => {
    if (reduce) return;
    hopTimers.current.forEach((t) => window.clearTimeout(t));
    const at = (f: () => void, ms: number) => hopTimers.current.push(window.setTimeout(f, ms));
    squashY.set(0.78);
    lid.set(0.35);
    at(() => {
      squashY.set(1.14);
      hopY.set(-size * 0.32);
    }, 90);
    at(() => hopY.set(0), 270);
    at(() => {
      squashY.set(0.84);
      lid.set(1);
    }, 430);
    at(() => squashY.set(1), 540);
  }, [reduce, squashY, lid, hopY, size]);

  // Autoplay: look around and hop now and then until the pointer moves.
  React.useEffect(() => {
    if (!autoplay || reduce) return;
    const range = (Math.max(0, Math.min(100, follow)) / 100) * 1.05;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const [a, b] = GAZE[k % GAZE.length];
      yawRaw.set(a * range);
      pitchRaw.set(b * range * 0.8);
      if (k % GAZE.length === GAZE.length - 1) hop();
      k++;
    }, 1300);
    return () => window.clearInterval(t);
  }, [autoplay, reduce, follow, yawRaw, pitchRaw, hop]);

  const press = () => {
    touched.current = true;
    hop();
    onPoke?.();
  };

  const radius = shape === "squircle" ? "34%" : "9999px";
  const bodyStyle: React.CSSProperties = custom ? { background: fill } : {};

  return (
    <div
      className={cn(
        "relative inline-flex select-none rounded-[30%] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-transparent",
        poke && "cursor-pointer",
        className,
      )}
      style={{ width, height }}
      {...(poke
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": "Buddy, press to poke",
            onClick: press,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                press();
              }
            },
          }
        : { "aria-hidden": true })}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-[12%] right-[12%] rounded-[50%] bg-black blur-[6px] dark:bg-black"
        style={{ bottom: -size * 0.1, height: size * 0.12, scaleX: shadowScale, opacity: shadowOpacity }}
      />
      <motion.div
        ref={ref}
        className="relative h-full w-full"
        style={{ y: hopY, scaleY: squashY, scaleX: squashX, originY: 1 }}
        animate={asleep && !reduce ? { scale: [1, 1.035, 1] } : { scale: 1 }}
        transition={asleep && !reduce ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <div
          className={cn(
            "absolute inset-0 overflow-hidden",
            !custom &&
              (fill === "dark"
                ? "bg-[#17181a] dark:ring-1 dark:ring-white/12 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-10px_24px_rgba(0,0,0,0.45)]"
                : "bg-white shadow-[0_18px_40px_-16px_rgba(23,24,26,0.35),0_2px_6px_rgba(23,24,26,0.06),inset_0_-10px_22px_rgba(23,24,26,0.06)] dark:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7),inset_0_-10px_22px_rgba(23,24,26,0.08)]"),
            custom && "shadow-[0_18px_40px_-16px_rgba(23,24,26,0.4),inset_0_-10px_22px_rgba(0,0,0,0.12)]",
          )}
          style={{ ...bodyStyle, borderRadius: radius }}
        >
          {/* soft top light that sells the roundness */}
          <span
            className="pointer-events-none absolute inset-x-[12%] top-[6%] h-[38%] rounded-[50%] opacity-70"
            style={{
              background: darkBody
                ? "radial-gradient(closest-side, rgba(255,255,255,0.16), transparent)"
                : "radial-gradient(closest-side, rgba(255,255,255,0.95), transparent)",
            }}
          />
          {EYE_BASE.map((base, i) => (
            <Eye
              key={i}
              base={base}
              yaw={yaw}
              pitch={pitch}
              rx={width * 0.5 * (shape === "pill" ? 0.78 : 0.86)}
              ry={height * 0.5 * 0.86}
              width={eye.w * size}
              height={eye.h * size}
              radius={eye.radius}
              color={eyeFill}
              lid={lid}
              widen={widen}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {asleep && !reduce ? (
          <motion.span
            key="z"
            className="pointer-events-none absolute -right-1 -top-2 flex flex-col items-start font-semibold text-[#8e8d88]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                style={{ fontSize: Math.max(10, size * (0.11 - i * 0.03)) }}
                animate={{ y: [6, -10], x: [0, 6], opacity: [0, 1, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
              >
                z
              </motion.span>
            ))}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
```

--- components/cursor-buddy/index.ts ---

```ts
export { CursorBuddy } from "./cursor-buddy";
export type { CursorBuddyProps, CursorBuddyShape, CursorBuddyEyes } from "./cursor-buddy";
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
