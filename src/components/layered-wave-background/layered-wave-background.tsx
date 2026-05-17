"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LayeredWaveSpeed = "slow" | "medium" | "fast";
export type LayeredWaveDirection = "left" | "right";

export interface LayeredWaveBackgroundProps {
  gradientColors?: string[];
  backgroundColor?: string;
  transparentBackground?: boolean;
  waveWidth?: number;
  waveHeight?: number;
  waveLayers?: number;
  blurIntensity?: number;
  opacity?: number;
  speed?: LayeredWaveSpeed;
  direction?: LayeredWaveDirection;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_COLORS = ["#7c3aed", "#06b6d4", "#ec4899"];
const SPEED_SECONDS: Record<LayeredWaveSpeed, number> = {
  slow: 38,
  medium: 25,
  fast: 16,
};

const WAVE_PATHS = [
  "M0 260 C130 215 230 298 360 246 C500 190 620 246 760 224 C900 202 1010 120 1200 176 L1200 600 L0 600 Z",
  "M0 310 C150 245 260 362 420 292 C570 226 710 304 850 266 C1000 225 1080 178 1200 226 L1200 600 L0 600 Z",
  "M0 340 C125 282 245 318 370 286 C540 242 640 350 820 300 C980 255 1060 298 1200 246 L1200 600 L0 600 Z",
  "M0 380 C170 318 280 422 430 356 C570 294 690 385 850 334 C1010 280 1090 332 1200 292 L1200 600 L0 600 Z",
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function colorAt(colors: string[], index: number) {
  return colors[index % colors.length] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function LayeredWaveBackground({
  gradientColors = DEFAULT_COLORS,
  backgroundColor = "#020617",
  transparentBackground = false,
  waveWidth = 1.2,
  waveHeight = 1,
  waveLayers = 4,
  blurIntensity = 24,
  opacity = 0.72,
  speed = "medium",
  direction = "left",
  className,
  children,
}: LayeredWaveBackgroundProps) {
  const id = React.useId().replaceAll(":", "");
  const colors = gradientColors.length > 0 ? gradientColors : DEFAULT_COLORS;
  const layers = clamp(Math.round(waveLayers), 1, 8);
  const baseDuration = SPEED_SECONDS[speed];
  const width = `${clamp(waveWidth, 0.8, 2.4) * 200}%`;
  const height = `${clamp(waveHeight, 0.5, 1.8) * 72}%`;

  return (
    <div
      className={cn("relative isolate min-h-[420px] w-full overflow-hidden", className)}
      style={{ backgroundColor: transparentBackground ? "transparent" : backgroundColor }}
    >
      <style>{`
        @keyframes layered-wave-drift-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes layered-wave-drift-right {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
      `}</style>

      {!transparentBackground && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 32%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.16), transparent 34%)",
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: layers }).map((_, index) => {
          const path = WAVE_PATHS[index % WAVE_PATHS.length];
          const layerOpacity = clamp(opacity - index * 0.08, 0.14, 1);
          const y = 26 + index * 7;
          const duration = baseDuration * (1 + index * 0.14);
          const gradientId = `layered-wave-gradient-${id}-${index}`;

          return (
            <div
              key={index}
              className="absolute left-0 will-change-transform"
              style={{
                bottom: `${-14 - index * 3}%`,
                width,
                height,
                opacity: layerOpacity,
                filter: `blur(${Math.max(0, blurIntensity - index * 4)}px)`,
                animationName:
                  direction === "left"
                    ? "layered-wave-drift-left"
                    : "layered-wave-drift-right",
                animationDuration: `${duration}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                transform: direction === "left" ? "translate3d(0,0,0)" : "translate3d(-50%,0,0)",
              }}
            >
              <svg
                className="h-full w-full"
                viewBox="0 0 2400 600"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="35%">
                    <stop offset="0%" stopColor={colorAt(colors, index)} />
                    <stop offset="50%" stopColor={colorAt(colors, index + 1)} />
                    <stop offset="100%" stopColor={colorAt(colors, index + 2)} />
                  </linearGradient>
                </defs>
                <g transform={`translate(0 ${y})`}>
                  <path d={path} fill={`url(#${gradientId})`} />
                  <path d={path} transform="translate(1200 0)" fill={`url(#${gradientId})`} />
                </g>
              </svg>
            </div>
          );
        })}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.06), transparent 32%, rgba(0,0,0,0.18))",
        }}
      />

      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
