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
import { SiFramer, SiNextdotjs, SiReact, SiShadcnui, SiTailwindcss, SiTypescript } from "react-icons/si";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

type Logo = {
  id: string;
  label: string;
  Icon: IconType;
  /** tile background */
  tile: string;
  /** icon colour */
  icon: string;
  /** the colour of the soft light under the sticker, as an rgb triplet */
  glow: string;
};

const LOGOS: Record<string, Logo> = {
  react: { id: "react", label: "React", Icon: SiReact, tile: "bg-[radial-gradient(120%_120%_at_30%_20%,#2c3340,#14171c)]", icon: "text-[#61dafb]", glow: "97 218 251" },
  tailwind: { id: "tailwind", label: "Tailwind CSS", Icon: SiTailwindcss, tile: "bg-[radial-gradient(120%_120%_at_30%_20%,#1e2a4a,#0b1020)]", icon: "text-[#38bdf8]", glow: "56 189 248" },
  shadcn: { id: "shadcn", label: "shadcn/ui", Icon: SiShadcnui, tile: "bg-[linear-gradient(160deg,#ffffff,#eceef2)]", icon: "text-[#09090b]", glow: "120 120 140" },
  motion: { id: "motion", label: "Motion", Icon: SiFramer, tile: "bg-[radial-gradient(120%_120%_at_30%_20%,#262626,#050505)]", icon: "text-white", glow: "110 80 255" },
  typescript: { id: "typescript", label: "TypeScript", Icon: SiTypescript, tile: "bg-[linear-gradient(160deg,#4a93e0,#2563b0)]", icon: "text-white", glow: "49 120 198" },
  nextjs: { id: "nextjs", label: "Next.js", Icon: SiNextdotjs, tile: "bg-[radial-gradient(120%_120%_at_30%_20%,#1f1f1f,#000)]", icon: "text-white", glow: "90 90 100" },
};

const ORDER = ["react", "motion", "shadcn", "tailwind", "typescript", "nextjs"] as const;

type Placed = {
  logo: Logo;
  /** resting position inside the hero, in % of its width / height */
  x: number;
  y: number;
  tilt: number;
  /** tile size in px */
  size: number;
  /** how far the sticker travels with the pointer, in px. Bigger reads as closer to the viewer. */
  depth: number;
};

const STICKERS: Placed[] = [
  { logo: LOGOS.react, x: 13, y: 20, tilt: -9, size: 86, depth: 26 },
  { logo: LOGOS.tailwind, x: 77, y: 15, tilt: 8, size: 72, depth: 16 },
  { logo: LOGOS.shadcn, x: 7, y: 47, tilt: 7, size: 72, depth: 20 },
  { logo: LOGOS.motion, x: 85, y: 43, tilt: -7, size: 88, depth: 30 },
  { logo: LOGOS.typescript, x: 17, y: 69, tilt: -6, size: 68, depth: 14 },
  { logo: LOGOS.nextjs, x: 71, y: 69, tilt: 9, size: 76, depth: 22 },
];

/** One die-cut logo sticker: a white border, a layered shadow with a faint coloured light under it, and a gloss. */
function Tile({ logo, size, border = 5, className }: { logo: Logo; size: number; border?: number; className?: string }) {
  return (
    <div
      title={logo.label}
      style={{ width: size, height: size, borderWidth: border, ["--glow" as string]: logo.glow }}
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-[27%] border-solid border-white",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.12),0_8px_14px_-6px_rgba(0,0,0,0.3),0_26px_38px_-18px_rgb(var(--glow)/0.55)]",
        logo.tile,
        className,
      )}
    >
      <logo.Icon className={cn("relative size-[52%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]", logo.icon)} aria-hidden />
      {/* gloss: a bright wash from the top left and a soft shade at the bottom right */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.32),rgba(255,255,255,0)_46%,rgba(0,0,0,0.14))]" />
      {/* a thin inner highlight along the top edge */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.12)]" />
      {/* a sheen that sweeps across when the sticker is hovered */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover/stk:translate-x-[420%] motion-reduce:hidden"
      />
    </div>
  );
}

type Dot = { id: number; x: number; y: number; rot: number; size: number; logo: Logo };

/**
 * Logo stickers around the hero headline. Each pops in with a little overshoot, floats gently, tilts toward
 * the cursor and drifts with it at its own depth, so the set reads as layers. They can be grabbed and
 * thrown, and stay where they land (kept inside the hero). Moving the cursor across the hero also stamps a
 * trail of small logo stickers that settle and fade. Decorative: hidden from screen readers and on small
 * screens. The cursor effects are for fine pointers only and are off with reduced motion.
 */
export function HeroStickers() {
  const reduce = !!useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  // Pointer position over the hero, -1 to 1 from its centre. Springs smooth it so the drift is never twitchy.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 90, damping: 18, mass: 0.6 });
  const py = useSpring(rawY, { stiffness: 90, damping: 18, mass: 0.6 });
  const [trail, setTrail] = React.useState<Dot[]>([]);

  React.useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let last = { x: -999, y: -999 };
    let lastAt = 0;
    let n = 0;
    const timers = new Set<number>();

    const stamp = (x: number, y: number) => {
      const logo = LOGOS[ORDER[n % ORDER.length]];
      const id = n++;
      const dot: Dot = { id, x, y, logo, rot: (Math.random() - 0.5) * 44, size: 38 + Math.round(Math.random() * 12) };
      setTrail((t) => [...t.slice(-8), dot]);
      const t = window.setTimeout(() => {
        setTrail((all) => all.filter((d) => d.id !== id));
        timers.delete(t);
      }, 1100);
      timers.add(t);
    };

    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      rawX.set((x / r.width) * 2 - 1);
      rawY.set((y / r.height) * 2 - 1);
      const now = performance.now();
      if (Math.hypot(x - last.x, y - last.y) > 90 && now - lastAt > 70) {
        last = { x, y };
        lastAt = now;
        stamp(x, y);
      }
    };
    const leave = () => {
      rawX.set(0);
      rawY.set(0);
      last = { x: -999, y: -999 };
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduce, rawX, rawY]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
      {/* The cursor trail sits under the stickers */}
      <AnimatePresence>
        {trail.map((d) => (
          <motion.div
            key={d.id}
            className="absolute"
            style={{ left: d.x, top: d.y, marginLeft: -d.size / 2, marginTop: -d.size / 2 }}
            initial={{ scale: 0.3, opacity: 0, rotate: d.rot - 28 }}
            animate={{ scale: 1, opacity: 1, rotate: d.rot }}
            exit={{ scale: 0.55, opacity: 0, y: 22, transition: { duration: 0.45, ease: [0.4, 0, 0.9, 0.6] } }}
            transition={{ type: "spring", stiffness: 420, damping: 15, mass: 0.7 }}
          >
            <Tile logo={d.logo} size={d.size} border={3} />
          </motion.div>
        ))}
      </AnimatePresence>
      {STICKERS.map((s, i) => (
        <StickerItem key={s.logo.id} sticker={s} index={i} reduce={reduce} px={px} py={py} bounds={ref} />
      ))}
    </div>
  );
}

function StickerItem({
  sticker: s,
  index: i,
  reduce,
  px,
  py,
  bounds,
}: {
  sticker: Placed;
  index: number;
  reduce: boolean;
  px: MotionValue<number>;
  py: MotionValue<number>;
  bounds: React.RefObject<HTMLDivElement | null>;
}) {
  const x = useTransform(px, (v) => v * s.depth);
  const y = useTransform(py, (v) => v * s.depth);
  // The sticker leans toward the cursor, like a card catching the light
  const tiltX = useTransform(py, (v) => v * -9);
  const tiltY = useTransform(px, (v) => v * 9);
  return (
    // Layer 1: where it rests, and the pointer drift
    <motion.div className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, x, y }}>
      {/* Layer 2: the pop-in, and grab-and-throw */}
      <motion.div
        className="group/stk pointer-events-auto cursor-grab touch-none select-none active:cursor-grabbing"
        initial={reduce ? { rotate: s.tilt } : { scale: 0, rotate: s.tilt - 24, opacity: 0 }}
        animate={{ scale: 1, rotate: s.tilt, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 15, mass: 0.8, delay: reduce ? 0 : 0.4 + i * 0.12 }}
        drag
        dragConstraints={bounds}
        dragElastic={0.18}
        dragMomentum
        dragTransition={{ power: 0.28, timeConstant: 300, bounceStiffness: 300, bounceDamping: 22 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 1.12 }}
        whileDrag={{ scale: 1.12, rotate: 0 }}
      >
        {/* Layer 3: the idle float and the lean, so neither fights the drag */}
        <motion.div
          style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 700 }}
          animate={reduce ? undefined : { y: [0, -9, 0] }}
          transition={reduce ? undefined : { duration: 4.4 + (i % 3) * 0.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 + i * 0.3 }}
        >
          <Tile logo={s.logo} size={s.size} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
