"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface AvatarData {
  src?: string;
  alt?: string;
  /** Initials or short text shown when no image is provided. */
  fallback: string;
  /** Name shown in the tooltip. */
  tooltip?: string;
  /** Background for the fallback circle (any CSS background, e.g. a colour or gradient). */
  bgColor?: string;
}

export interface AvatarGroupProps {
  /** The people to show. Defaults to a small example team. */
  avatars?: AvatarData[];
  /** Avatar diameter in px. @default 40 */
  size?: number;
  /** Pixel overlap between adjacent avatars. @default 10 */
  overlap?: number;
  /** Width of the ring around each avatar in px. @default 2 */
  borderWidth?: number;
  /** Ring colour. Defaults to white (or the dark surface colour in dark mode). */
  borderColor?: string;
  /** Show a name pill over the avatar nearest the pointer. @default true */
  showTooltips?: boolean;
  /** How avatars near the pointer react: "lift" swells, rises and spreads the stack; "scale" only swells; "rotate" fans them; "up" only rises. @default "lift" */
  hoverAnimation?: "scale" | "lift" | "rotate" | "up" | "none";
  /** Largest scale an avatar reaches right under the pointer. @default 1.3 */
  hoverScale?: number;
  /** Entrance animation style. @default "scale" */
  entranceAnimation?: "none" | "fade" | "flip" | "slide" | "scale" | "bounce";
  /** Delay in seconds between each avatar's entrance. @default 0.05 */
  entranceStagger?: number;
  /** Show at most this many, then a "+N" chip that expands the rest. */
  max?: number;
  /** Called when an avatar is clicked or activated with the keyboard. */
  onSelect?: (avatar: AvatarData, index: number) => void;
  /** Sweeps a virtual pointer across the stack until someone points at it. */
  autoplay?: boolean;
  className?: string;
}

const DEMO_AVATARS: AvatarData[] = [
  { fallback: "AK", tooltip: "Aiko Kimura" },
  { fallback: "MR", tooltip: "Mateo Ruiz" },
  { fallback: "SN", tooltip: "Sofia Novak" },
  { fallback: "JO", tooltip: "James Okafor" },
  { fallback: "LP", tooltip: "Lena Park" },
  { fallback: "DV", tooltip: "Dev Varma" },
];

const GRADIENTS = [
  "linear-gradient(145deg,#5ac8fa,#0071e3)",
  "linear-gradient(145deg,#ffb340,#ff7a00)",
  "linear-gradient(145deg,#da8fff,#9b4dca)",
  "linear-gradient(145deg,#5fe08a,#1e9e4a)",
  "linear-gradient(145deg,#ff8a80,#e5322b)",
  "linear-gradient(145deg,#9ea7b8,#5d6577)",
  "linear-gradient(145deg,#64e0d4,#11998e)",
  "linear-gradient(145deg,#ffd95a,#e0a100)",
];

function entranceInitial(type: AvatarGroupProps["entranceAnimation"]) {
  switch (type) {
    case "flip":
      return { rotateY: -90, scale: 0.8, opacity: 0 };
    case "slide":
      return { x: 16, opacity: 0 };
    case "scale":
      return { scale: 0.6, opacity: 0 };
    case "bounce":
      return { scale: 0.7, y: 18, opacity: 0 };
    case "fade":
      return { opacity: 0 };
    default:
      return false as const;
  }
}

const ENTER = { rotateY: 0, scale: 1, x: 0, y: 0, opacity: 1 };

function Face({ avatar, index, size }: { avatar: AvatarData; index: number; size: number }) {
  const [failed, setFailed] = React.useState(false);
  const showImg = avatar.src && !failed;
  return (
    <span
      className="flex size-full items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-0.02em] text-white"
      style={{ background: avatar.bgColor ?? GRADIENTS[index % GRADIENTS.length], fontSize: Math.round(size * 0.36) }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- any URL the caller passes, no loader config needed
        <img src={avatar.src} alt="" width={size} height={size} draggable={false} className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{avatar.fallback}</span>
      )}
    </span>
  );
}

function Avatar({
  avatar,
  index,
  count,
  size,
  step,
  pointer,
  presence,
  hoverAnimation,
  hoverScale,
  entrance,
  stagger,
  ring,
  still,
  onFocusAt,
  onSelect,
}: {
  avatar: AvatarData;
  index: number;
  count: number;
  size: number;
  step: number;
  pointer: MotionValue<number>;
  presence: MotionValue<number>;
  hoverAnimation: NonNullable<AvatarGroupProps["hoverAnimation"]>;
  hoverScale: number;
  entrance: AvatarGroupProps["entranceAnimation"];
  stagger: number;
  ring: React.CSSProperties;
  still: boolean;
  onFocusAt: (center: number) => void;
  onSelect?: (avatar: AvatarData, index: number) => void;
}) {
  const center = index * step + size / 2;
  const near = useTransform([pointer, presence], ([p, on]: number[]) => {
    const d = (p - center) / (size * 1.05);
    return Math.exp(-d * d) * on;
  });
  const side = useTransform([pointer, presence], ([p, on]: number[]) => Math.tanh((center - p) / (size * 0.9)) * on);
  const off = still || hoverAnimation === "none";
  const swell = !off && hoverAnimation !== "up";
  const rise = !off && (hoverAnimation === "lift" || hoverAnimation === "up");
  const spread = !off && hoverAnimation === "lift";
  const fan = !off && hoverAnimation === "rotate";
  const scale = useSpring(useTransform(near, (n) => (swell ? 1 + (hoverScale - 1) * n : 1)), { stiffness: 420, damping: 24 });
  const y = useSpring(useTransform(near, (n) => (rise ? -size * 0.22 * n : 0)), { stiffness: 420, damping: 22 });
  const x = useSpring(useTransform(side, (s) => (spread ? s * (hoverScale - 1) * size * 0.55 : 0)), { stiffness: 380, damping: 26 });
  const rotate = useSpring(useTransform(side, (s) => (fan ? -s * 10 : 0)), { stiffness: 300, damping: 18 });
  const zIndex = useTransform(near, (n) => Math.round(n * 100) + count - index);
  const name = avatar.tooltip ?? avatar.alt ?? avatar.fallback;

  return (
    <motion.div className="absolute top-0" style={{ left: index * step, width: size, height: size, zIndex, x, y }}>
      <motion.button
        type="button"
        aria-label={name}
        onFocus={() => onFocusAt(center)}
        onClick={() => onSelect?.(avatar, index)}
        className="block size-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff]"
        style={{ scale, rotate, ...ring }}
        initial={still ? false : entranceInitial(entrance)}
        animate={ENTER}
        transition={{ type: "spring", stiffness: 380, damping: 20, delay: still ? 0 : stagger * index }}
      >
        <Face avatar={avatar} index={index} size={size} />
      </motion.button>
    </motion.div>
  );
}

/**
 * An overlapping stack of avatars that behaves like a dock: the face under
 * the pointer swells and rises, its neighbours lean out of the way, and a
 * single name pill glides from face to face. A "+N" chip opens the rest.
 */
export function AvatarGroup({
  avatars = DEMO_AVATARS,
  size = 40,
  overlap = 10,
  borderWidth = 2,
  borderColor,
  showTooltips = true,
  hoverAnimation = "lift",
  hoverScale = 1.3,
  entranceAnimation = "scale",
  entranceStagger = 0.05,
  max,
  onSelect,
  autoplay = false,
  className,
}: AvatarGroupProps) {
  const still = useReducedMotion() === true;
  const [expanded, setExpanded] = React.useState(false);
  const [nearest, setNearest] = React.useState<number | null>(null);
  const touched = React.useRef(false);
  const sweep = React.useRef<AnimationPlaybackControls | null>(null);
  const pointer = useMotionValue(-1000);
  const presenceRaw = useMotionValue(0);
  const presence = useSpring(presenceRaw, { stiffness: 260, damping: 26 });

  const step = Math.max(4, size - overlap);
  const capped = max !== undefined && !expanded && avatars.length > max;
  const shown = capped ? avatars.slice(0, Math.max(0, max)) : avatars;
  const extra = avatars.length - shown.length;
  const slots = shown.length + (extra > 0 ? 1 : 0);
  const width = slots > 0 ? slots * size - (slots - 1) * overlap : 0;
  const tipX = useSpring(0, { stiffness: 520, damping: 34 });

  useMotionValueEvent(pointer, "change", (p) => {
    if (presenceRaw.get() < 0.5 || shown.length === 0) return;
    const i = Math.round((p - size / 2) / step);
    const next = i >= 0 && i < shown.length && Math.abs(p - (i * step + size / 2)) < size * 0.75 ? i : null;
    if (next !== null) tipX.set(next * step + size / 2);
    setNearest(next);
  });

  React.useEffect(() => {
    if (!autoplay || still || shown.length < 2) return;
    presenceRaw.set(1);
    const a = size / 2;
    const b = (shown.length - 1) * step + size / 2;
    pointer.set(a);
    sweep.current = animate(pointer, [a, b, a], { duration: 1.1 * shown.length, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 });
    return () => sweep.current?.stop();
  }, [autoplay, still, shown.length, size, step, pointer, presenceRaw]);

  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    sweep.current?.stop();
  };

  const localX = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const scale = r.width / (e.currentTarget.offsetWidth || 1) || 1;
    return (e.clientX - r.left) / scale;
  };

  const leave = () => {
    presenceRaw.set(0);
    setNearest(null);
  };

  const ring: React.CSSProperties = {
    boxShadow: `0 0 0 ${borderWidth}px ${borderColor ?? "var(--ag-ring)"}, 0 4px 10px -4px rgba(0,0,0,.35)`,
  };
  const tip = nearest !== null ? shown[nearest] : undefined;
  const tipName = tip ? (tip.tooltip ?? tip.alt) : undefined;

  return (
    <motion.div
      role="group"
      aria-label={`${avatars.length} people`}
      className={cn("relative touch-none [--ag-ring:#ffffff] dark:[--ag-ring:#1c1c1e]", className)}
      style={{ height: size }}
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      onPointerEnter={(e) => {
        takeOver();
        presenceRaw.set(1);
        pointer.set(localX(e));
      }}
      onPointerMove={(e) => {
        takeOver();
        pointer.set(localX(e));
      }}
      onPointerLeave={leave}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) leave();
      }}
    >
      {shown.map((avatar, index) => (
        <Avatar
          key={`${avatar.fallback}-${index}`}
          avatar={avatar}
          index={index}
          count={shown.length}
          size={size}
          step={step}
          pointer={pointer}
          presence={presence}
          hoverAnimation={hoverAnimation}
          hoverScale={hoverScale}
          entrance={entranceAnimation}
          stagger={entranceStagger}
          ring={ring}
          still={still}
          onSelect={onSelect}
          onFocusAt={(c) => {
            takeOver();
            presenceRaw.set(1);
            pointer.set(c);
          }}
        />
      ))}

      <AnimatePresence>
        {extra > 0 ? (
          <motion.button
            key="more"
            type="button"
            onClick={() => {
              takeOver();
              setExpanded(true);
            }}
            aria-label={`Show ${extra} more`}
            className="absolute top-0 grid place-items-center rounded-full bg-[#f0f0f3] font-semibold tabular-nums text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
            style={{ left: shown.length * step, width: size, height: size, fontSize: Math.round(size * 0.32), zIndex: 0, ...ring }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            whileHover={still ? undefined : { scale: 1.08 }}
            whileTap={still ? undefined : { scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            +{extra}
          </motion.button>
        ) : null}
      </AnimatePresence>

      {showTooltips ? (
        <motion.div className="pointer-events-none absolute left-0 z-[200]" style={{ x: tipX, bottom: size * (hoverAnimation === "lift" || hoverAnimation === "up" ? 1.55 : 1.3) }}>
          <AnimatePresence>
            {tipName ? (
              <motion.div
                key="tip"
                layout={!still}
                className="absolute bottom-0 left-0 whitespace-nowrap rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[12px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,.5)] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                style={{ x: "-50%", originY: 1 }}
                initial={{ opacity: 0, y: 6, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.85, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 520, damping: 26 }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={tipName} layout={still ? false : "position"} className="block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: "spring", stiffness: 600, damping: 32 }}>
                    {tipName}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
