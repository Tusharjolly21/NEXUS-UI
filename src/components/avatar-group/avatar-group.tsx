"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AvatarData {
  src?: string;
  alt?: string;
  /** Initials or short text shown when no image is provided. */
  fallback: string;
  /** Name shown in the tooltip on hover. */
  tooltip?: string;
  /** Background color for the fallback circle (CSS value). */
  bgColor?: string;
}

export interface AvatarGroupProps {
  avatars: AvatarData[];
  /** Avatar diameter in px. @default 40 */
  size?: number;
  /** Pixel overlap between adjacent avatars. @default 10 */
  overlap?: number;
  /** Width of the ring border around each avatar in px. @default 2 */
  borderWidth?: number;
  /** Explicit CSS color for the ring. Defaults to the page background color. */
  borderColor?: string;
  /** Show a tooltip on hover. @default true */
  showTooltips?: boolean;
  /** Hover lift animation style. @default "lift" */
  hoverAnimation?: "scale" | "lift" | "rotate" | "up" | "none";
  /** Scale multiplier applied during hover. @default 1.1 */
  hoverScale?: number;
  /** Entrance animation style. @default "scale" */
  entranceAnimation?: "none" | "fade" | "flip" | "slide" | "scale" | "bounce";
  /** Delay in seconds between each avatar's entrance. @default 0.05 */
  entranceStagger?: number;
  className?: string;
}

const SPRING = { type: "spring" as const, stiffness: 400, damping: 18, mass: 0.8 };

const DEFAULT_COLOURS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b",
  "#d946ef", "#0ea5e9", "#f43f5e", "#14b8a6",
];

function entranceInitial(type: AvatarGroupProps["entranceAnimation"]) {
  switch (type) {
    case "flip":   return { rotateY: -90, scale: 0.8, opacity: 0 };
    case "slide":  return { x: 16, opacity: 0 };
    case "scale":  return { scale: 0.8, opacity: 0 };
    case "bounce": return { scale: 0.8, y: 16, opacity: 0 };
    case "fade":   return { opacity: 0 };
    default:       return false as const;
  }
}

function entranceFinal(type: AvatarGroupProps["entranceAnimation"]) {
  switch (type) {
    case "flip":   return { rotateY: 0, scale: 1, opacity: 1 };
    case "slide":  return { x: 0, opacity: 1 };
    case "scale":  return { scale: 1, opacity: 1 };
    case "bounce": return { scale: 1, y: 0, opacity: 1 };
    case "fade":   return { opacity: 1 };
    default:       return {};
  }
}

function hoverTarget(type: AvatarGroupProps["hoverAnimation"], scale: number) {
  switch (type) {
    case "scale":  return { scale };
    case "lift":   return { y: -4, scale };
    case "rotate": return { rotate: 5, scale };
    case "up":     return { y: -8 };
    default:       return undefined;
  }
}

export function AvatarGroup({
  avatars,
  size = 40,
  overlap = 10,
  borderWidth = 2,
  borderColor,
  showTooltips = true,
  hoverAnimation = "lift",
  hoverScale = 1.1,
  entranceAnimation = "scale",
  entranceStagger = 0.05,
  className,
}: AvatarGroupProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const step = size - overlap;
  const totalWidth = avatars.length > 0
    ? avatars.length * size - (avatars.length - 1) * overlap
    : 0;

  const initial = reduce ? false : entranceInitial(entranceAnimation);
  const finalState = entranceFinal(entranceAnimation);
  const hoverAnim = reduce ? undefined : hoverTarget(hoverAnimation, hoverScale);

  return (
    <div
      className={cn("relative", className)}
      style={{ width: totalWidth, height: size }}
    >
      {avatars.map((avatar, index) => {
        const bgColor = avatar.bgColor ?? DEFAULT_COLOURS[index % DEFAULT_COLOURS.length];

        return (
          <motion.div
            key={index}
            className="absolute top-0 select-none"
            style={{
              left: index * step,
              width: size,
              height: size,
              zIndex: hoveredIndex === index ? avatars.length + 10 : avatars.length - index,
            }}
            initial={initial}
            animate={finalState}
            transition={{ ...SPRING, delay: reduce ? 0 : entranceStagger * index }}
            whileHover={hoverAnim}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full overflow-hidden cursor-pointer",
                !borderColor && "ring-2 ring-background dark:ring-zinc-900",
              )}
              style={{
                width: size,
                height: size,
                backgroundColor: bgColor,
                ...(borderColor
                  ? { boxShadow: `0 0 0 ${borderWidth}px ${borderColor}` }
                  : {}),
              }}
            >
              {avatar.src ? (
                <img
                  src={avatar.src}
                  alt={avatar.alt ?? avatar.tooltip ?? avatar.fallback}
                  width={size}
                  height={size}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (sib) sib.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="flex items-center justify-center w-full h-full font-semibold text-white"
                style={{
                  fontSize: size * 0.35,
                  display: avatar.src ? "none" : "flex",
                }}
              >
                {avatar.fallback}
              </span>
            </div>

            {showTooltips && avatar.tooltip && (
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    key="tip"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute z-50"
                    style={{ bottom: size + 6, left: "50%", transform: "translateX(-50%)" }}
                  >
                    <div className="rounded bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white whitespace-nowrap dark:bg-zinc-700">
                      {avatar.tooltip}
                    </div>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
