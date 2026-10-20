"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export interface LayerConfig {
  id: string;
  content?: ReactNode;
  /** Horizontal travel in px from the start to the end of the scroll. */
  xRange?: [number, number];
  /** Vertical travel in px from the start to the end of the scroll. */
  yRange?: [number, number];
  scaleRange?: [number, number];
  rotateRange?: [number, number];
  opacityRange?: [number, number];
  blurRange?: [number, number];
  zIndex?: number;
  /** Classes for the layer, usually its position, e.g. "left-1/4 top-1/3". */
  className?: string;
  width?: string;
  height?: string;
}

export interface MotionLayerScrollerProps {
  /** Your own layers. Leave out for the built-in landscape; pass [] for just the heading. */
  layers?: LayerConfig[];
  /** Which way the scene scrolls. */
  direction?: "vertical" | "horizontal";
  /** Height of the scene in px. */
  scrollHeight?: number;
  /** How far there is to scroll, in scene heights (or widths). */
  distance?: number;
  /** Perspective for custom layers, in px. */
  perspective?: number;
  /** Overrides the sky colour. */
  backgroundColor?: string;
  /** Draw a faint grid over the sky. */
  showGrid?: boolean;
  /** Draw the sun (the moon in dark mode) and its glow. */
  showGlow?: boolean;
  heading?: string;
  description?: string;
  /** Hint shown until the scene is scrolled. An empty string hides it. */
  hint?: string;
  /** Scrolls the scene down and back up every few seconds until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

/** Deterministic stars: [x%, y%, size px, opacity]. */
const STARS: [number, number, number, number][] = [
  [6, 12, 2, 0.9], [14, 30, 1.5, 0.6], [22, 8, 1.5, 0.7], [31, 22, 2, 0.8], [38, 6, 1, 0.5], [46, 18, 1.5, 0.7],
  [54, 9, 2, 0.9], [61, 27, 1, 0.5], [70, 14, 1.5, 0.8], [77, 5, 2, 0.6], [84, 24, 1.5, 0.7], [92, 11, 2, 0.9],
  [10, 44, 1, 0.4], [27, 40, 1.5, 0.5], [49, 36, 1, 0.4], [66, 42, 1.5, 0.5], [88, 38, 1, 0.4], [96, 30, 1.5, 0.6],
];

/** Each ridge: SVG path in a 600×400 box (ridge along the top, solid below), where it starts and how fast it rises. */
const RIDGES = [
  {
    d: "M0 70 L60 38 L110 62 L170 18 L230 58 L290 30 L350 64 L420 22 L480 56 L540 34 L600 60 L600 400 L0 400 Z",
    top: 50,
    k: 0.1,
    cls: "fill-[#b9d3ee] dark:fill-[#25365f]",
  },
  {
    d: "M0 60 C70 20 120 20 180 52 S300 86 360 40 S480 10 540 44 S590 60 600 56 L600 400 L0 400 Z",
    top: 59,
    k: 0.25,
    cls: "fill-[#8fb3dd] dark:fill-[#1c2a4d]",
  },
  {
    d: "M0 54 C90 10 170 14 250 46 S410 84 480 40 S570 22 600 34 L600 400 L0 400 Z",
    top: 69,
    k: 0.45,
    cls: "fill-[#86c59c] dark:fill-[#14203a]",
  },
  {
    d: "M0 40 C60 26 110 26 150 38 L158 14 L166 38 C200 46 230 44 262 34 L270 6 L278 34 C330 22 380 22 430 40 L438 18 L446 40 C500 50 550 46 600 30 L600 400 L0 400 Z",
    top: 81,
    k: 0.66,
    cls: "fill-[#3f8a5e] dark:fill-[#0b1426]",
  },
];

function Ridge({ p, i, travel, horizontal }: { p: MotionValue<number>; i: number; travel: number; horizontal: boolean }) {
  const r = RIDGES[i];
  const move = useTransform(p, (v) => -v * r.k * travel);
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMin slice"
      className={`absolute left-0 ${horizontal ? "w-[160%]" : "w-full"} h-full ${r.cls}`}
      style={{ top: `${r.top}%`, ...(horizontal ? { x: move } : { y: move }) }}
    >
      <path d={r.d} />
    </motion.svg>
  );
}

function CustomLayer({ layer, index, p }: { layer: LayerConfig; index: number; p: MotionValue<number> }) {
  const x = useTransform(p, [0, 1], layer.xRange ?? [0, 0]);
  const y = useTransform(p, [0, 1], layer.yRange ?? [0, 0]);
  const scale = useTransform(p, [0, 1], layer.scaleRange ?? [1, 1]);
  const rotate = useTransform(p, [0, 1], layer.rotateRange ?? [0, 0]);
  const opacity = useTransform(p, [0, 1], layer.opacityRange ?? [1, 1]);
  const blur = useTransform(p, [0, 1], layer.blurRange ?? [0, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.div
      className={`pointer-events-none absolute ${layer.className ?? ""}`}
      style={{ x, y, scale, rotate, opacity, filter, zIndex: layer.zIndex ?? index, width: layer.width, height: layer.height }}
    >
      {layer.content}
    </motion.div>
  );
}

/**
 * A landscape built from paper-cut layers inside its own scroll frame. Scroll
 * through it and each ridge rises at its own speed while the sun sinks behind
 * them; stop and the layers settle on a soft spring, overshooting a touch, so
 * the depth feels like jelly rather than a slideshow.
 */
export function MotionLayerScroller({
  layers,
  direction = "vertical",
  scrollHeight = 420,
  distance = 1.6,
  perspective = 1200,
  backgroundColor,
  showGrid = false,
  showGlow = true,
  heading = "Motion that moves people",
  description = "Every layer travels at its own speed.",
  hint = "Scroll inside the scene.",
  autoplay = false,
  className = "",
}: MotionLayerScrollerProps) {
  const reduce = useReducedMotion() === true;
  const horizontal = direction === "horizontal";
  const scroller = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const { scrollYProgress, scrollXProgress } = useScroll({ container: scroller });
  // Mirror the scroll progress into a plain motion value: everything below is driven from it
  // in JS, so no transform gets handed to a native scroll timeline (which ignores the container).
  const raw = useMotionValue(0);
  useMotionValueEvent(horizontal ? scrollXProgress : scrollYProgress, "change", (v) => raw.set(v));
  const springy = useSpring(raw, { stiffness: 85, damping: 11, mass: 0.8 });
  const p = reduce ? raw : springy;
  const travel = scrollHeight * 0.3 * (reduce ? 0 : 1);

  const titleMove = useTransform(p, (v) => -v * 1.5 * travel);
  const titleFade = useTransform(p, [0, 0.55], [1, 0]);
  const sunMove = useTransform(p, (v) => v * scrollHeight * (reduce ? 0 : 0.4));
  const sunset = useTransform(raw, [0, 1], [0, 1]);
  const starFade = useTransform(raw, [0, 1], [0.55, 1]);
  const cloudX = useTransform(p, (v) => v * 60);
  const hintFade = useTransform(raw, [0, 0.06], [1, 0]);
  const bar = useTransform(raw, [0, 1], [0.08, 1]);

  useEffect(() => {
    const el = scroller.current;
    if (!autoplay || !el) return;
    let run: AnimationPlaybackControls | undefined;
    let down = true;
    const prop = horizontal ? "scrollLeft" : "scrollTop";
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const max = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      const to = down ? max * 0.92 : 0;
      down = !down;
      run = animate(el[prop], to, {
        duration: 1.5,
        ease: [0.45, 0, 0.2, 1],
        onUpdate: (v) => {
          if (!touched.current) el[prop] = v;
        },
      });
    }, 3000);
    return () => {
      window.clearInterval(t);
      run?.stop();
    };
  }, [autoplay, horizontal]);

  const touch = () => {
    touched.current = true;
  };

  const sky = backgroundColor
    ? undefined
    : "bg-[linear-gradient(180deg,#9fd0ff_0%,#d7ecff_55%,#f6f3ee_100%)] dark:bg-[linear-gradient(180deg,#050a1c_0%,#0d1838_60%,#1a2550_100%)]";

  return (
    <div
      className={`@container relative w-full overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
      style={{ height: scrollHeight }}
    >
      {/* The scene. It ignores the pointer so the scroller underneath gets every wheel and swipe. */}
      <div className={`pointer-events-none absolute inset-0 ${sky ?? ""}`} style={{ background: backgroundColor }} aria-hidden="true">
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(180deg,#ffb38a_0%,#ffd6a8_50%,#fff1e0_100%)] dark:bg-[linear-gradient(180deg,#02030b_0%,#0b0f2a_60%,#24163f_100%)]"
          style={{ opacity: sunset }}
        />
        <motion.div className="absolute inset-0 hidden dark:block" style={{ opacity: starFade }}>
          {STARS.map(([x, y, s, o], i) => (
            <span key={i} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: o }} />
          ))}
        </motion.div>
        {showGrid ? <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)]" /> : null}
        {showGlow && layers == null ? (
          <motion.div className="absolute left-[70%] top-[34%]" style={{ y: sunMove }}>
            <div className="absolute -inset-16 rounded-full bg-[radial-gradient(circle,rgba(255,196,110,.55),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(200,215,255,.28),transparent_65%)]" />
            <div className="relative size-16 rounded-full bg-[linear-gradient(160deg,#ffe29a,#ffad5a)] shadow-[0_0_40px_rgba(255,170,80,.6)] dark:bg-[linear-gradient(160deg,#ffffff,#c9d4ee)] dark:shadow-[0_0_40px_rgba(200,215,255,.45)]" />
          </motion.div>
        ) : null}
        {layers == null ? (
          <>
            <motion.div className="absolute left-[10%] top-[40%] dark:hidden" style={{ x: cloudX }}>
              <div className="h-6 w-28 rounded-full bg-white/80 blur-[1px]" />
              <div className="-mt-9 ml-8 h-8 w-16 rounded-full bg-white/80 blur-[1px]" />
            </motion.div>
            {RIDGES.map((_, i) => (
              <Ridge key={i} p={p} i={i} travel={travel} horizontal={horizontal} />
            ))}
          </>
        ) : (
          <div className="absolute inset-0" style={{ perspective }}>
            {layers.map((layer, i) => (
              <CustomLayer key={layer.id} layer={layer} index={i} p={p} />
            ))}
          </div>
        )}
        {heading || description ? (
          <motion.div className="absolute inset-x-0 top-[14%] z-10 px-6 text-center" style={{ y: titleMove, opacity: titleFade }}>
            {heading ? (
              <h2 className="m-0 text-[clamp(22px,6.4cqw,38px)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ color: backgroundColor ? "#f5f5f7" : undefined }}>
                {heading}
              </h2>
            ) : null}
            {description ? (
              <p className="m-0 mx-auto mt-2 max-w-[34ch] text-[14px] text-[#424245] dark:text-[#c7c7cc]" style={{ color: backgroundColor ? "#c7c7cc" : undefined }}>
                {description}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label={`${heading || "Layered scene"}. Scroll to move through it.`}
        onWheel={touch}
        onPointerDown={touch}
        onTouchStart={touch}
        onKeyDown={touch}
        className={`absolute inset-0 overscroll-contain rounded-[24px] outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] [&::-webkit-scrollbar]:hidden ${
          horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden"
        }`}
      >
        <div style={horizontal ? { width: `${(1 + distance) * 100}%`, height: "100%" } : { height: scrollHeight * (1 + distance) }} />
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-full bg-black/10 dark:bg-white/15 ${horizontal ? "bottom-3 left-1/2 h-1 w-16 -ml-8" : "right-3 top-1/2 -mt-8 h-16 w-1"}`}
      >
        <motion.div
          className="h-full w-full rounded-full bg-[#1d1d1f]/70 dark:bg-[#f5f5f7]/80"
          style={horizontal ? { scaleX: bar, originX: 0 } : { scaleY: bar, originY: 0 }}
        />
      </div>
      {hint ? (
        <motion.p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-1/2 m-0 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-[#1d1d1f] shadow-[0_6px_16px_-8px_rgba(0,0,0,.35)] backdrop-blur dark:bg-[#2c2c2e]/90 dark:text-[#f5f5f7]"
          style={{ opacity: hintFade, x: "-50%" }}
        >
          {hint}
        </motion.p>
      ) : null}
    </div>
  );
}
