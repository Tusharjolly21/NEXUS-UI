# Aspect Crop

Add the "Aspect Crop" component from Nexus UI to my project.

An aspect-ratio picker whose crop frame keeps the same area at every ratio, so switching reads as re-cropping the same photo. The frame springs to its new shape and rule-of-thirds lines flash while it moves.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { AspectCrop, DEFAULT_ASPECT_RATIOS } from "@/components/aspect-crop";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/aspect-crop/aspect-crop.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface AspectRatioOption {
  /** Label shown on the button, e.g. "4:3". */
  id: string;
  w: number;
  h: number;
}

export const DEFAULT_ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "4:3", w: 4, h: 3 },
  { id: "1:1", w: 1, h: 1 },
  { id: "3:4", w: 3, h: 4 },
  { id: "9:16", w: 9, h: 16 },
];

export interface AspectCropProps {
  /** The ratios to offer. */
  ratios?: AspectRatioOption[];
  /** Optional photo to crop (any local or remote URL). Without it a drawn sunset is shown. */
  src?: string;
  /** Alt text for `src`. */
  alt?: string;
  /** Called with the ratio id whenever the user picks one. */
  onChange?: (id: string) => void;
  /** Cycles through the ratios by itself until someone touches it. */
  autoplay?: boolean;
  /** Side of the square whose area every crop keeps, in px. A bigger number gives a bigger frame at every ratio. */
  size?: number;
  /** Corner radius of the frame, in px. */
  radius?: number;
  /** When the thirds grid shows: "flash" while the frame moves, "always", or "off". */
  guides?: "flash" | "always" | "off";
  /** How quickly the frame springs to its new shape, 1 is the default. */
  speed?: number;
  /** How much the frame overshoots before it settles, 1 is the default. Higher bounces more, lower settles dead. */
  bounce?: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function Sunset() {
  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(30% 22% at 62% 34%, #fff6d8 0%, rgba(255,246,216,0) 70%), linear-gradient(180deg, #ffcf9f 0%, #ff8f7a 38%, #b8506e 58%, #3f2a5c 100%)",
      }}
    >
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 340 150" aria-hidden="true">
        <path d="M0 70 C 60 40, 100 80, 160 55 S 260 30, 340 60 V150 H0Z" fill="#5b2f62" />
        <path d="M0 100 C 70 80, 130 110, 200 92 S 300 80, 340 96 V150 H0Z" fill="#2c1b3d" />
        <circle cx="212" cy="40" r="14" fill="#fff1c1" />
      </svg>
    </div>
  );
}

/**
 * Crop control that keeps the picture's area constant, so switching ratio
 * reads as re-cropping the same photo rather than resizing it. The frame
 * springs to its new shape, the photo stays put underneath, and thirds grid
 * lines flash while it moves.
 */
export function AspectCrop({ ratios = DEFAULT_ASPECT_RATIOS, src, alt = "", onChange, autoplay = false, size = 220, radius = 18, guides = "flash", speed = 1, bounce = 1 }: AspectCropProps) {
  const [r, setR] = useState(0);
  // Starts true so the thirds flash once on mount, as the frame settles.
  const [moving, setMoving] = useState(true);
  const touched = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const uid = useId().replace(/:/g, "");
  const { w, h } = ratios[r] ?? ratios[0] ?? { w: 1, h: 1 };
  // Every crop keeps the area of a square this size (220 by default).
  const area = clamp(size, 100, 280) ** 2;
  const pace = clamp(speed, 0.3, 3);
  const give = clamp(bounce, 0.4, 2.5);
  const width = Math.sqrt((area * w) / h);
  const height = Math.sqrt((area * h) / w);
  // The stage and the photo grow only when the largest frame would not fit the usual 300 and 340.
  const biggest = Math.max(0, ...ratios.map((o) => Math.sqrt((area * Math.max(o.w, o.h)) / Math.min(o.w, o.h))));
  const stage = Math.max(300, Math.ceil(biggest));
  const photo = Math.max(340, Math.ceil(biggest));

  const flash = () => {
    setMoving(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setMoving(false), 650);
  };

  useEffect(() => {
    flashTimer.current = setTimeout(() => setMoving(false), 650);
    return () => clearTimeout(flashTimer.current);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setR((n) => (n + 1) % ratios.length);
      setMoving(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setMoving(false), 650);
    }, 1700);
    return () => clearInterval(t);
  }, [autoplay, ratios.length]);

  const choose = (i: number) => {
    touched.current = true;
    if (i === r) return;
    setR(i);
    flash();
    const o = ratios[i];
    if (o) onChange?.(o.id);
  };

  return (
    <div
      className="flex flex-col items-center gap-5"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative flex items-center justify-center" style={{ width: stage, height: stage }}>
        <motion.div
          className="relative overflow-hidden shadow-[0_24px_40px_-24px_rgba(0,0,0,.45)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-24px_rgba(0,0,0,.9)]"
          style={{ borderRadius: clamp(radius, 0, 60) }}
          animate={{ width, height }}
          transition={{ type: "spring", stiffness: 260 * pace, damping: (26 * Math.sqrt(pace)) / give }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: photo, height: photo }}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- any URL the caller passes, no loader config needed
              <img src={src} alt={alt} draggable={false} className="h-full w-full select-none object-cover" />
            ) : (
              <Sunset />
            )}
          </div>
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{ opacity: guides === "always" || (guides === "flash" && moving) ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
          >
            {[1, 2].map((k) => (
              <span key={`v${k}`} className="absolute inset-y-0 w-px bg-white/70" style={{ left: `${(k / 3) * 100}%` }} />
            ))}
            {[1, 2].map((k) => (
              <span key={`h${k}`} className="absolute inset-x-0 h-px bg-white/70" style={{ top: `${(k / 3) * 100}%` }} />
            ))}
          </motion.div>
        </motion.div>
      </div>
      <div className="flex rounded-full bg-[#f0f0f3] p-1 dark:bg-[#2c2c2e]" role="radiogroup" aria-label="Aspect ratio">
        {ratios.map((a, i) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={r === i}
            onClick={() => choose(i)}
            className={`relative flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${
              r === i ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"
            }`}
          >
            {r === i && (
              <motion.span
                layoutId={`aspect-pill-${uid}`}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.14)] dark:bg-[#636366] dark:shadow-[0_1px_4px_rgba(0,0,0,.5)]"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span
              className="relative rounded-[3px] border-[1.5px] border-current"
              style={{ width: (a.w / Math.max(a.w, a.h)) * 14, height: (a.h / Math.max(a.w, a.h)) * 14 }}
            />
            <span className="relative">{a.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

--- components/aspect-crop/index.ts ---

```ts
export { AspectCrop, DEFAULT_ASPECT_RATIOS } from "./aspect-crop";
export type { AspectCropProps, AspectRatioOption } from "./aspect-crop";
```
