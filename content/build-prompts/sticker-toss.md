# Sticker Toss

Add the "Sticker Toss" component from Nexus UI to my project.

A round logo sticker you can peel off a page header and throw. In flight it stretches along its direction of travel and its ring of text spins faster, then it springs back into its spot with a wobble.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { StickerToss } from "@/components/sticker-toss";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/sticker-toss/index.ts ---

```ts
export { StickerToss } from "./sticker-toss";
export type { StickerTossProps } from "./sticker-toss";
```

--- components/sticker-toss/sticker-toss.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useId, useRef, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";

export interface StickerTossProps {
  /** Text that runs around the sticker's ring. End it with a separator so the loop reads cleanly. */
  text?: string;
  /** Sticker colour. Defaults to near-black (near-white in dark mode) with contrasting ring text. */
  color?: string;
  /** Colour of the dot in the middle. */
  accent?: string;
  /** Tosses the sticker by itself every few seconds until someone grabs it. */
  autoplay?: boolean;
}

/** Throw the sticker from its slot down into the page and spring it back, like a quick flick. */
async function flick(x: MotionValue<number>, y: MotionValue<number>, still: () => boolean) {
  const tx = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 60);
  const ty = 120 + Math.random() * 40;
  animate(x, [0, tx * 0.6, tx], { duration: 0.5, ease: "easeOut" });
  await animate(y, [0, ty * 0.3, ty], { duration: 0.5, ease: "easeOut" });
  if (!still()) return;
  animate(x, 0, { type: "spring", stiffness: 200, damping: 12 });
  animate(y, 0, { type: "spring", stiffness: 200, damping: 12 });
}

/**
 * A round logo sticker you can peel off the header and throw. In flight it stretches along
 * its direction of travel and its ring of text spins faster; let go and it springs back into
 * its spot with a wobble.
 */
export function StickerToss({ text = "NEXUS UI · MADE TO MOVE · ", color, accent = "#c8f560", autoplay = false }: StickerTossProps) {
  const pid = "p" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const speed = useTransform(() => Math.min(1, Math.hypot(vx.get(), vy.get()) / 2200));
  const angle = useTransform(() => (Math.atan2(vy.get(), vx.get()) * 180) / Math.PI);
  const counterAngle = useTransform(angle, (a) => -a);
  const stretch = useSpring(useTransform(speed, [0, 1], [1, 1.45]), { stiffness: 400, damping: 22 });
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));
  const lift = useTransform(() => Math.min(1, Math.hypot(x.get(), y.get()) / 60));
  const shadow = useTransform(lift, (l) => `0 ${4 + l * 22}px ${8 + l * 30}px -${4 + l * 4}px rgba(0,0,0,${0.18 + l * 0.12})`);
  const textRot = useMotionValue(0);
  const touched = useRef(false);

  // The ring text always turns slowly, and much faster while the sticker is moving.
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      textRot.set(textRot.get() + dt * (20 + speed.get() * 900));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speed, textRot]);

  useEffect(() => {
    if (!autoplay) return;
    const still = () => !touched.current;
    const toss = () => {
      if (still()) void flick(x, y, still);
    };
    const a = setTimeout(toss, 900);
    const t = setInterval(toss, 3200);
    return () => { clearTimeout(a); clearInterval(t); };
  }, [autoplay, x, y]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      touched.current = true;
      void flick(x, y, () => true);
    },
    [x, y],
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative h-[290px] w-[440px] max-w-full overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] [--st-ink:#1d1d1f] [--st-text:#fff] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:[--st-ink:#f5f5f7] dark:[--st-text:#1d1d1f]">
        {/* mock header */}
        <div className="flex h-[74px] items-center justify-between border-b border-[#f0f0f3] px-5 dark:border-[#2c2c2e]">
          <span className="h-[58px] w-[58px] rounded-full border border-dashed border-[#d2d2d7] dark:border-[#48484a]" aria-hidden="true" />
          <nav className="flex gap-4 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"><span>Work</span><span>Notes</span><span>About</span></nav>
        </div>
        <div className="flex flex-col gap-2 px-5 pt-6" aria-hidden="true">
          <span className="h-4 w-56 rounded-full bg-[#f0f0f3] dark:bg-[#2c2c2e]" />
          <span className="h-3 w-72 max-w-full rounded-full bg-[#f5f5f7] dark:bg-[#242426]" />
          <span className="h-3 w-64 max-w-full rounded-full bg-[#f5f5f7] dark:bg-[#242426]" />
        </div>
        <motion.div
          drag
          dragElastic={0.9}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 220, bounceDamping: 12 }}
          onPointerDown={() => {
            touched.current = true;
          }}
          onKeyDown={onKeyDown}
          whileDrag={{ cursor: "grabbing" }}
          role="button"
          tabIndex={0}
          aria-label="Logo sticker. Drag and throw it, or press Enter to toss it."
          className="absolute left-5 top-[8px] h-[58px] w-[58px] cursor-grab touch-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
          style={{ x, y }}
        >
          <motion.div className="h-full w-full" style={{ rotate: angle, scaleX: stretch, scaleY: squash }}>
            <motion.div className="relative h-full w-full rounded-full" style={{ rotate: counterAngle, background: color ?? "var(--st-ink)", boxShadow: shadow }}>
              <motion.svg viewBox="0 0 100 100" className="absolute inset-0" style={{ rotate: textRot }} aria-hidden="true">
                <defs><path id={pid} d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" /></defs>
                <text fontSize="11.5" fontWeight="700" letterSpacing="1.6" style={{ fill: color ? "#fff" : "var(--st-text)" }}>
                  <textPath href={`#${pid}`}>{text}</textPath>
                </text>
              </motion.svg>
              <span className="absolute inset-[30%] rounded-full" style={{ background: accent }} />
              <span className="absolute left-[20%] top-[12%] h-[22%] w-[40%] -rotate-[25deg] rounded-full bg-white/25 blur-[1px]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Grab the logo and throw it.</span>
    </div>
  );
}
```
