"use client";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export interface VectorTiltSceneProps {
  /** Small caption on the glass label. */
  eyebrow?: string;
  /** Title on the glass label. */
  title?: string;
  /** One line under the title. */
  description?: string;
  /** Replaces the glass label with your own content (it floats on the top layer). */
  children?: ReactNode;
  /** Largest tilt in degrees. */
  maxTilt?: number;
  /** Gap between layers when the scene pops open, in px. */
  depth?: number;
  /** Sheen that follows the pointer across the card. */
  glare?: boolean;
  /** Hint under the card. An empty string hides it. */
  hint?: string;
  /** Pops the scene open and tilts it in a slow figure of eight until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

const TILT = { stiffness: 170, damping: 16, mass: 0.8 };
/** Low damping on the pop so the layers overshoot and settle, like a pop-up book opening. */
const POP = { stiffness: 210, damping: 11, mass: 0.9 };

/** Each layer: an SVG drawn in a 360×270 box, and how much it drifts against the pointer. */
const LAYERS: { d: string; cls: string; drift: number }[] = [
  {
    d: "M0 168 L40 132 L78 152 L122 104 L168 146 L214 112 L258 150 L306 118 L360 150 L360 270 L0 270 Z",
    cls: "fill-[#b7cff0] dark:fill-[#2b3b68]",
    drift: 4,
  },
  {
    d: "M0 190 C50 150 96 150 140 180 S232 214 280 172 S340 150 360 160 L360 270 L0 270 Z",
    cls: "fill-[#86aee0] dark:fill-[#1f2c52]",
    drift: 8,
  },
  {
    d: "M0 214 C70 182 130 186 196 208 S300 232 360 200 L360 270 L0 270 Z",
    cls: "fill-[#6fbf8e] dark:fill-[#15213d]",
    drift: 13,
  },
  {
    d: "M0 240 C60 226 110 226 150 236 L156 214 L162 236 C190 242 212 240 238 232 L245 208 L252 232 C292 226 330 228 360 236 L360 270 L0 270 Z",
    cls: "fill-[#3c875b] dark:fill-[#0c162b]",
    drift: 19,
  },
];

function Plane({
  z,
  px,
  py,
  drift,
  children,
  className = "",
}: {
  z: MotionValue<number>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  drift: number;
  children: ReactNode;
  className?: string;
}) {
  const x = useTransform(px, (v) => -v * drift);
  const y = useTransform(py, (v) => -v * drift * 0.5);
  return (
    <motion.div className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] ${className}`} style={{ z }}>
      <motion.div className="absolute -inset-6" style={{ x, y }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function useLayerZ(pop: MotionValue<number>, k: number, depth: number) {
  return useTransform(pop, (v) => v * k * depth);
}

/**
 * A card that is really a little diorama. Point at it and it tilts toward
 * you while its paper-cut layers (sky, sun, three ridges and a glass label)
 * spring apart in depth, overshoot and settle, then drift against the
 * pointer so the scene has real parallax. A sheen follows the pointer.
 */
export function VectorTiltScene({
  eyebrow = "Scene depth",
  title = "Vector Tilt Scene",
  description = "Layers that open up as you look closer.",
  children,
  maxTilt = 14,
  depth = 26,
  glare = true,
  hint = "Point at the card.",
  autoplay = false,
  className = "",
}: VectorTiltSceneProps) {
  const reduce = useReducedMotion() === true;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, TILT);
  const sy = useSpring(py, TILT);
  const pop = useSpring(0, POP);
  const rotateY = useTransform(sx, (v) => (reduce ? 0 : v * maxTilt));
  const rotateX = useTransform(sy, (v) => (reduce ? 0 : -v * maxTilt));
  const gx = useTransform(sx, (v) => `${50 + v * 50}%`);
  const gy = useTransform(sy, (v) => `${50 + v * 50}%`);
  const sheen = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, rgba(255,255,255,.45), transparent 60%)`;
  const sheenFade = useTransform(pop, [0, 1], [0, 1]);
  const shadowY = useTransform(sy, (v) => 26 + v * 10);
  const shadowX = useTransform(sx, (v) => -v * 12);
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 50px -28px rgba(0,0,0,.45)`;
  const z0 = useLayerZ(pop, 0, depth);
  const z1 = useLayerZ(pop, 1, depth);
  const z2 = useLayerZ(pop, 2, depth);
  const z3 = useLayerZ(pop, 3, depth);
  const z4 = useLayerZ(pop, 4, depth);
  const zLabel = useLayerZ(pop, 5.6, depth);
  const zs = [z1, z2, z3, z4];
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay || reduce) return;
    pop.set(1);
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      if (touched.current) return;
      const t = (now - t0) / 1000;
      px.set(Math.sin(t * 0.9) * 0.75);
      py.set(Math.sin(t * 1.8) * 0.45);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, reduce, pop, px, py]);

  const take = () => {
    touched.current = true;
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    take();
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
    py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
    pop.set(1);
  };
  const onLeave = () => {
    if (!touched.current) return;
    px.set(0);
    py.set(0);
    pop.set(0);
  };
  const onKey = (e: KeyboardEvent) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] };
    const s = step[e.key];
    if (!s) return;
    e.preventDefault();
    take();
    px.set(Math.max(-1, Math.min(1, px.get() + s[0])));
    py.set(Math.max(-1, Math.min(1, py.get() + s[1])));
    pop.set(1);
  };

  return (
    <div className={`flex w-full max-w-[380px] flex-col items-center gap-4 ${className}`}>
      <div className="w-full" style={{ perspective: 1000 }}>
        <motion.div
          role="img"
          aria-label={`${title}. ${description}`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onPointerDown={take}
          onKeyDown={onKey}
          onFocus={() => pop.set(1)}
          onBlur={() => {
            if (touched.current) pop.set(0);
          }}
          className="relative aspect-[4/3] w-full rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="absolute inset-0 rounded-[24px] bg-[linear-gradient(180deg,#a9d4ff,#e8f3ff_70%,#fff6ec)] dark:bg-[linear-gradient(180deg,#070d24,#15204a_70%,#2a2050)]"
            style={{ z: z0, boxShadow: shadow }}
          >
            <div className="absolute inset-0 rounded-[24px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]" />
          </motion.div>
          <Plane z={z1} px={sx} py={sy} drift={2}>
            <div className="absolute right-[22%] top-[22%] size-14 rounded-full bg-[linear-gradient(160deg,#ffe29a,#ffad5a)] shadow-[0_0_44px_rgba(255,170,80,.65)] dark:bg-[linear-gradient(160deg,#ffffff,#c9d4ee)] dark:shadow-[0_0_44px_rgba(200,215,255,.45)]" />
          </Plane>
          {LAYERS.map((l, i) => (
            <Plane key={i} z={zs[i]} px={sx} py={sy} drift={l.drift}>
              <svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax slice" className={`absolute inset-x-0 bottom-0 top-6 h-[calc(100%-24px)] w-full ${l.cls}`} aria-hidden="true">
                <path d={l.d} />
              </svg>
            </Plane>
          ))}
          <motion.div className="pointer-events-none absolute left-4 top-4 max-w-[70%]" style={{ z: zLabel }}>
            {children ?? (
              <div className="rounded-[16px] bg-white/85 px-4 py-3 shadow-[0_10px_30px_-14px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e]/85">
                <p className="m-0 text-[11px] font-medium text-[#0059b3] dark:text-[#6cb6ff]">{eyebrow}</p>
                <p className="m-0 mt-0.5 text-[18px] font-semibold leading-tight tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</p>
                <p className="m-0 mt-1 text-[12px] leading-snug text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>
              </div>
            )}
          </motion.div>
          {glare && !reduce ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[24px] mix-blend-soft-light"
              style={{ z: zLabel, backgroundImage: sheen, opacity: sheenFade }}
            />
          ) : null}
        </motion.div>
      </div>
      {hint ? <p className="m-0 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</p> : null}
    </div>
  );
}
