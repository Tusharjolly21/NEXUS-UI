"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BackgroundBoxesProps = {
  children?: React.ReactNode;
  rows?: number;
  columns?: number;
  boxSize?: number;
  className?: string;
  boxClassName?: string;
  gridClassName?: string;
  highlightColor?: string;
  defaultColor?: string;
  borderColor?: string;
  enableGlow?: boolean;
  interactive?: boolean;
  neighborRipple?: boolean;
  animatePulse?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

export function BackgroundBoxes({
  children,
  rows = 10,
  columns,
  boxSize = 44,
  className,
  boxClassName,
  gridClassName,
  highlightColor = "#22d3ee",
  defaultColor = "transparent",
  borderColor = "hsl(var(--border) / 0.45)",
  enableGlow = true,
  interactive = true,
  neighborRipple = false,
  animatePulse = false,
}: BackgroundBoxesProps) {
  const reduceMotion = useReducedMotion() === true;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [computedColumns, setComputedColumns] = React.useState(columns ?? 12);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (columns) {
      setComputedColumns(columns);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const updateColumns = () => {
      const width = node.getBoundingClientRect().width;
      const next = clamp(Math.floor(width / Math.max(16, boxSize)), 4, 40);
      setComputedColumns(next);
    };

    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(node);
    return () => observer.disconnect();
  }, [boxSize, columns]);

  const totalBoxes = rows * computedColumns;

  const seedOpacities = React.useMemo(() => {
    const seed = hashString(
      [rows, computedColumns, boxSize, borderColor, defaultColor].join("|"),
    );
    const rand = createSeededRandom(seed);
    return Array.from({ length: totalBoxes }, () => 0.08 + rand() * 0.18);
  }, [borderColor, boxSize, computedColumns, defaultColor, rows, totalBoxes]);

  const getDistance = React.useCallback(
    (index: number) => {
      if (hoveredIndex == null) return Number.POSITIVE_INFINITY;
      const colA = hoveredIndex % computedColumns;
      const rowA = Math.floor(hoveredIndex / computedColumns);
      const colB = index % computedColumns;
      const rowB = Math.floor(index / computedColumns);
      return Math.max(Math.abs(colA - colB), Math.abs(rowA - rowB));
    },
    [computedColumns, hoveredIndex]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
    >
      <div
        className={cn(
          "absolute inset-0 z-0",
          interactive ? "pointer-events-auto" : "pointer-events-none",
          gridClassName,
        )}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${computedColumns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {Array.from({ length: totalBoxes }, (_, index) => {
          const distance = getDistance(index);
          const isActive = interactive && distance === 0;
          const isNeighbor = interactive && neighborRipple && distance > 0 && distance <= 2;
          const rippleOpacity = isActive ? 0.92 : isNeighbor ? Math.max(0.2, 0.65 - distance * 0.2) : 0;
          const baseOpacity = seedOpacities[index] ?? 0.12;
          const hasHoverFocus = interactive && hoveredIndex != null;
          const activeOpacity = Math.max(baseOpacity, rippleOpacity);
          const pulsePeak = clamp(baseOpacity + 0.08, 0, 1);

          return (
            <motion.div
              key={index}
              data-bgboxes-cell-index={index}
              className={cn("relative border", boxClassName)}
              style={{
                borderColor,
                backgroundColor: defaultColor,
              }}
              onMouseEnter={interactive ? () => setHoveredIndex(index) : undefined}
              initial={false}
              animate={{
                opacity:
                  animatePulse && !reduceMotion && !hasHoverFocus
                    ? [baseOpacity, pulsePeak, baseOpacity]
                    : activeOpacity,
                backgroundColor: interactive && (isActive || isNeighbor) ? highlightColor : defaultColor,
                scale: reduceMotion ? 1 : interactive && isActive ? 1.03 : 1,
              }}
              transition={{
                duration: reduceMotion ? 0.1 : animatePulse && !hasHoverFocus ? 2.5 : 0.35,
                ease: "easeOut",
                repeat: animatePulse && !reduceMotion && !hasHoverFocus ? Infinity : 0,
                repeatType: "reverse",
                delay: animatePulse && !reduceMotion && !hasHoverFocus ? (index % computedColumns) * 0.06 : 0,
              }}
            >
              {enableGlow && interactive && (isActive || isNeighbor) ? (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    boxShadow: `0 0 24px ${highlightColor}`,
                  }}
                  animate={{
                    opacity: isActive ? 0.45 : 0.22,
                  }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.25 }}
                />
              ) : null}
            </motion.div>
          );
        })}
      </div>

      <div className="pointer-events-none relative z-20">
        {children}
      </div>
    </div>
  );
}
