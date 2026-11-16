"use client";

import { memo, useId, useMemo, type CSSProperties } from "react";
import { SHAPE_BY_KEY, drawFeatures, shapePath } from "./shapes";
import { hashString, shade } from "./theme";

type AgentFaceProps = {
  shape: string;
  color: string;
  eyes: string;
  size?: number;
  /** Where the eyes look, from -1 to 1 on each axis. */
  look?: number[];
  mood?: "idle" | "thinking" | "listening" | "talking";
  shadow?: boolean;
  blink?: boolean;
  /** Any string; it staggers the idle bob so a row of faces does not move in step. */
  seed?: string;
  className?: string;
  style?: CSSProperties;
  label?: string;
  /** Crops to the face, for small avatars. */
  zoom?: boolean;
};

export const AgentFace = memo(function AgentFace({
  shape,
  color,
  eyes,
  size = 32,
  look = [0, 0],
  mood = "idle",
  shadow = true,
  blink = true,
  seed = "",
  className = "",
  style,
  label,
  zoom,
}: AgentFaceProps) {
  const uid = `m${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const outline = shapePath(shape);
  const features = useMemo(() => drawFeatures(eyes, shape), [eyes, shape]);
  const gaze = mood === "thinking" ? [0.35, -1] : mood === "listening" ? [0, -0.3] : look;
  const bobDelay = useMemo(() => `${(hashString(seed + shape + color) * 5).toFixed(2)}s`, [seed, shape, color]);
  const light = shade(color, 0.34);
  const base = color;
  const dark = shade(color, -0.16);
  const deep = shade(color, -0.42);
  return (
    <svg
      viewBox={zoom ? `21 ${SHAPE_BY_KEY[shape].eyeY - 27} 58 58` : "-9 -9 118 122"}
      width={size}
      height={zoom ? size : size * (122 / 118)}
      className={`shrink-0 overflow-visible ${className}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`${uid}f`} gradientUnits="userSpaceOnUse" x1="18" y1="4" x2="78" y2="100">
          <stop offset="0" stopColor={light} />
          <stop offset=".48" stopColor={base} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${uid}r`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".3" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}g`} cx="36" cy="26" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={`${uid}s`}
          cx="50"
          cy="106"
          r="40"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0 92) scale(1 .14)"
        >
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}c`}>
          <path d={outline} />
        </clipPath>
      </defs>
      {shadow && <ellipse cx="50" cy="106" rx="40" ry="6" fill={`url(#${uid}s)`} />}
      <g className={mood === "thinking" ? "hd-bob" : mood === "talking" ? "hd-talk" : undefined}>
        <path
          d={outline}
          transform="translate(0 5.5)"
          fill={deep}
          stroke={deep}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path d={outline} fill={`url(#${uid}f)`} stroke={`url(#${uid}f)`} strokeWidth="8" strokeLinejoin="round" />
        <path d={outline} fill="none" stroke={`url(#${uid}r)`} strokeWidth="8" strokeLinejoin="round" />
        <g clipPath={`url(#${uid}c)`}>
          <ellipse cx="36" cy="24" rx="30" ry="18" fill={`url(#${uid}g)`} />
        </g>
        <g
          style={{
            transform: `translate(${gaze[0] * 3}px, ${gaze[1] * 2.6}px)`,
            transition: "transform .45s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          <g
            className={blink && mood !== "thinking" ? "hd-blink" : undefined}
            style={{ "--bd": bobDelay } as CSSProperties}
          >
            {features.map((feature, i) => (
              <path
                key={i}
                d={feature.d}
                fill={feature.fill ?? "none"}
                stroke={feature.stroke}
                strokeWidth={feature.w}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
});
