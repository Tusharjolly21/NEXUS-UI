# Weather Puck

Add the "Weather Puck" component from Nexus UI to my project.

Drag a glowing puck across a field of dots to set the time of day. Nearby dots lift and warm, and the landscape above relights from dawn to night with the hour name and clock rolling along.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { WeatherPuck } from "@/components/weather-puck";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/weather-puck/index.ts ---

```ts
export { WeatherPuck } from "./weather-puck";
export type { WeatherPuckProps } from "./weather-puck";
```

--- components/weather-puck/weather-puck.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

const W = 440;
const SCENE = 180;
const FIELD = 130;
const STOPS = [0, 0.2, 0.45, 0.7, 0.85, 1];
const LABELS = ["Before dawn", "Sunrise", "Midday", "Golden hour", "Dusk", "Night"];

export interface WeatherPuckProps {
  /** Sweeps the light across the day until the user drags it. */
  autoplay?: boolean;
}

/**
 * Drag the light across a field of dots. Dots near it lift and warm up, and the
 * landscape above relights in real time: sky, sun, ridges and the name of the
 * hour all interpolate from the puck's position.
 */
export function WeatherPuck({ autoplay = false }: WeatherPuckProps) {
  const px = useMotionValue(W * 0.45);
  const py = useMotionValue(FIELD / 2);
  const t = useTransform(px, [22, W - 22], [0, 1]);
  const skyTop = useTransform(t, STOPS, ["#1b2a4a", "#f2a77c", "#6fa8e6", "#e98a52", "#4a3b6b", "#0b1530"]);
  const skyBot = useTransform(t, STOPS, ["#3b4d7a", "#ffe3c4", "#d8ecff", "#ffd29a", "#c77d8f", "#1d2a4d"]);
  const far = useTransform(t, STOPS, ["#3a4466", "#b9a5b5", "#8fb0cf", "#c48a7a", "#5b4a6e", "#141c33"]);
  const near = useTransform(t, STOPS, ["#262c45", "#7d6f86", "#5f86a8", "#8a5a5e", "#3a2f4f", "#0b1022"]);
  const glow = useTransform(t, STOPS, ["#c7d2ff", "#ffc48a", "#fff3c2", "#ffad5c", "#ff9fb3", "#e3e7ff"]);
  const sunX = useTransform(t, [0, 1], [30, W - 30]);
  const sunY = useTransform(t, (v) => 150 - Math.sin(Math.PI * Math.min(1, Math.max(0, (v - 0.08) / 0.8))) * 115);
  const stars = useTransform(t, [0, 0.15, 0.8, 0.95], [1, 0, 0, 1]);
  const sky = useTransform(() => `linear-gradient(180deg, ${skyTop.get()}, ${skyBot.get()})`);
  const sunShadow = useTransform(glow, (c) => `0 0 40px 12px ${c}`);
  const puckShadow = useTransform(glow, (c) => `0 0 0 1px rgba(0,0,0,.06), 0 0 30px 6px ${c}`);
  const [label, setLabel] = useState(LABELS[2]);
  const [clock, setClock] = useState("12:00");
  const canvas = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);

  useMotionValueEvent(t, "change", (v) => {
    let best = 0;
    STOPS.forEach((s, i) => {
      if (Math.abs(s - v) < Math.abs(STOPS[best] - v)) best = i;
    });
    setLabel(LABELS[best]);
    const minutes = Math.round(4.5 * 60 + v * 19 * 60);
    setClock(`${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  });

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = FIELD * dpr;
    // Resting dots are drawn in the text colour, so follow the site theme.
    const root = document.documentElement;
    let dark = root.classList.contains("dark");
    const mo = new MutationObserver(() => {
      dark = root.classList.contains("dark");
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    let raf = 0;
    const G = 14;
    const frame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, FIELD);
      const x0 = px.get(),
        y0 = py.get();
      const col = glow.get();
      for (let y = G / 2; y < FIELD; y += G) {
        for (let x = G / 2; x < W; x += G) {
          const d = Math.hypot(x - x0, y - y0);
          const f = Math.exp(-(d * d) / (2 * 46 * 46));
          const lift = f * 10;
          ctx.beginPath();
          ctx.arc(x, y - lift, 1.5 + f * 2.6, 0, Math.PI * 2);
          if (f > 0.08) {
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.35 + f * 0.65;
          } else {
            ctx.fillStyle = dark ? "#f5f5f7" : "#1d1d1f";
            ctx.globalAlpha = dark ? 0.2 : 0.16;
          }
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, [px, py, glow]);

  useEffect(() => {
    if (!autoplay) return;
    let ctl: { stop: () => void } | null = null;
    const sweep = () => {
      if (touched.current) return;
      ctl = animate(px, [px.get(), W - 30, 30, W * 0.62], { duration: 7, ease: "easeInOut" });
      animate(py, [py.get(), FIELD * 0.3, FIELD * 0.7, FIELD * 0.5], { duration: 7, ease: "easeInOut" });
    };
    const a = setTimeout(sweep, 600);
    const b = setInterval(sweep, 8000);
    return () => {
      clearTimeout(a);
      clearInterval(b);
      ctl?.stop();
    };
  }, [autoplay, px, py]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-28px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-28px_rgba(0,0,0,.6)]"
        style={{ width: W, maxWidth: "100%" }}
      >
        <motion.div className="relative overflow-hidden" style={{ height: SCENE, background: sky }} aria-hidden="true">
          <motion.div className="absolute inset-0" style={{ opacity: stars }}>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className="absolute h-[2px] w-[2px] rounded-full bg-white" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 55}%`, opacity: 0.5 + ((i * 7) % 5) / 10 }} />
            ))}
          </motion.div>
          <motion.span className="absolute h-11 w-11 rounded-full" style={{ x: sunX, y: sunY, left: -22, top: -22, background: glow, boxShadow: sunShadow }} />
          <motion.svg className="absolute bottom-0 left-0" width={W} height="110" viewBox={`0 0 ${W} 110`}>
            <motion.path d={`M0 60 L60 30 L120 55 L190 15 L260 50 L330 25 L${W} 55 L${W} 110 L0 110 Z`} style={{ fill: far }} />
            <motion.path d={`M0 85 L80 55 L150 80 L230 50 L300 78 L370 60 L${W} 80 L${W} 110 L0 110 Z`} style={{ fill: near }} />
          </motion.svg>
          <div className="absolute left-4 top-3 flex flex-col">
            <span className="relative h-5 overflow-hidden text-[15px] font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,.25)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={label} className="block" initial={{ y: 18, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}>
                  {label}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-[12px] font-medium tabular-nums text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,.25)]">{clock}</span>
          </div>
        </motion.div>
        <div className="relative" style={{ height: FIELD }}>
          <canvas ref={canvas} className="absolute inset-0" style={{ width: W, height: FIELD }} aria-hidden="true" />
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={{ left: 22, right: W - 22, top: 22, bottom: FIELD - 22 }}
            dragElastic={0.05}
            onPointerDown={() => {
              touched.current = true;
            }}
            whileDrag={{ scale: 1.15 }}
            role="slider"
            tabIndex={0}
            aria-label="Time of day"
            aria-valuetext={`${label}, ${clock}`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                touched.current = true;
                animate(px, Math.min(W - 22, px.get() + 30));
              }
              if (e.key === "ArrowLeft") {
                touched.current = true;
                animate(px, Math.max(22, px.get() - 30));
              }
            }}
            className="absolute left-0 top-0 h-11 w-11 cursor-grab rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff]"
            style={{
              x: px,
              y: py,
              marginLeft: -22,
              marginTop: -22,
              background: "radial-gradient(circle at 35% 30%, #fff, rgba(255,255,255,.6) 45%, rgba(255,255,255,0) 70%)",
              boxShadow: puckShadow,
            }}
          />
        </div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Drag the light across the dots.</span>
    </div>
  );
}
```
