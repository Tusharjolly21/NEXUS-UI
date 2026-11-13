"use client";

import { useId, type CSSProperties } from "react";
import type { CoverSpec } from "./data";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "./theme";
type Palette = {
  wall: [string, string];
  floor: string;
  obj: string;
  obj2: string;
  acc: string;
};

/** Eight colourways for the drawn covers; a story picks one with `cover.p`. */
export const PALETTES: Palette[] = [
  {
    wall: ["#FF9A2E", "#FF6B00"],
    floor: "#F5A24C",
    obj: "#FFFFFF",
    obj2: "#F3EEE6",
    acc: "#FFD9A8",
  },
  {
    wall: ["#D9EBCD", "#BBD6AA"],
    floor: "#A9C997",
    obj: "#F7B9C4",
    obj2: "#F4E58A",
    acc: "#FFFFFF",
  },
  {
    wall: ["#BFD8F6", "#A9C6EE"],
    floor: "#E5D6F4",
    obj: "#FF9FB4",
    obj2: "#C3B2FF",
    acc: "#FFFFFF",
  },
  {
    wall: ["#2C9BB3", "#1F7E95"],
    floor: "#E8E3DA",
    obj: "#FF6A2B",
    obj2: "#FFFFFF",
    acc: "#F2B547",
  },
  {
    wall: ["#D92A20", "#AF1C14"],
    floor: "#E7D7C6",
    obj: "#1E6D5A",
    obj2: "#F4EFE6",
    acc: "#FFFFFF",
  },
  {
    wall: ["#F7CB48", "#F0B21C"],
    floor: "#F3D67C",
    obj: "#FFFFFF",
    obj2: "#FF8A3D",
    acc: "#FFF4C2",
  },
  {
    wall: ["#B69CFF", "#8F70FF"],
    floor: "#FF9AD8",
    obj: "#C9F5FF",
    obj2: "#FFFFFF",
    acc: "#FFD4F0",
  },
  {
    wall: ["#3D4250", "#24272F"],
    floor: "#E9E3D8",
    obj: "#F2C230",
    obj2: "#E9604E",
    acc: "#6FA8FF",
  },
];
/** Lightens (amount above 0) or darkens (below 0) a #rrggbb colour. */
export function shade(hex: string, amount: number) {
  const value = parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const channel = (a: number) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? a * (1 + amount) : a + (255 - a) * amount)));
  return `#${((channel(red) << 16) | 16777216 | (channel(green) << 8) | channel(blue)).toString(16).slice(1)}`;
}
type CoverProps = {
  cover: CoverSpec;
  /** the pointer is over the story: the scene leans in and the light moves */
  hot?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * The story illustrations: eight small rooms drawn in SVG (a vase on a plinth, books, a chair, and so on), each in
 * one of eight palettes, so every story gets a cover without any image files.
 */
export function Cover({ cover, hot = false, className = "", style }: CoverProps) {
  const uid = useId().replace(/:/g, "");
  const gid = (y: string) => `${uid}-${y}`;
  const palette = PALETTES[cover.p % PALETTES.length]!;
  const scene = cover.v % 8;
  const reduce = useReducedMotion();
  const H = 300;
  const W = 400;
  const floorY = 206;
  const metalGradient = (color: string, id: string) => (
    <linearGradient id={gid(id)} x1="0" x2="1">
      <stop offset="0" stopColor={shade(color, -0.18)} />
      <stop offset=".45" stopColor={shade(color, 0.12)} />
      <stop offset="1" stopColor={shade(color, -0.28)} />
    </linearGradient>
  );
  return (
    <div
      className={`${/(^|\s)(absolute|fixed)(\s|$)/.test(className) ? "" : "relative "}overflow-hidden ${className}`}
      style={style}
      aria-hidden={true}
    >
      <motion.svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        animate={{
          scale: hot && !reduce ? 1.06 : 1,
        }}
        transition={{
          duration: 1.1,
          ease: EASE,
        }}
      >
        <defs>
          <linearGradient id={gid("wall")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.wall[0]} />
            <stop offset="1" stopColor={palette.wall[1]} />
          </linearGradient>
          <linearGradient id={gid("floor")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(palette.floor, -0.06)} />
            <stop offset="1" stopColor={shade(palette.floor, 0.12)} />
          </linearGradient>
          <radialGradient id={gid("ball")} cx=".36" cy=".32" r=".75">
            <stop offset="0" stopColor={shade(palette.obj, 0.5)} />
            <stop offset=".55" stopColor={palette.obj} />
            <stop offset="1" stopColor={shade(palette.obj, -0.35)} />
          </radialGradient>
          <radialGradient id={gid("ball2")} cx=".36" cy=".32" r=".75">
            <stop offset="0" stopColor={shade(palette.obj2, 0.5)} />
            <stop offset=".6" stopColor={palette.obj2} />
            <stop offset="1" stopColor={shade(palette.obj2, -0.3)} />
          </radialGradient>
          {metalGradient(palette.obj, "o1")}
          {metalGradient(palette.obj2, "o2")}
          {metalGradient(palette.acc, "o3")}
          <linearGradient id={gid("glass")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity=".85" />
            <stop offset=".4" stopColor={palette.obj} stopOpacity=".55" />
            <stop offset="1" stopColor={shade(palette.obj, -0.3)} stopOpacity=".8" />
          </linearGradient>
          <filter id={gid("b6")} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={gid("b14")} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id={gid("grain")}>
            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" />
          </filter>
        </defs>
        <rect width={W} height={floorY} fill={`url(#${gid("wall")})`} />
        <rect y={floorY} width={W} height={H - floorY} fill={`url(#${gid("floor")})`} />
        <rect
          y={floorY - 2}
          width={W}
          height="6"
          fill={shade(palette.floor, -0.12)}
          opacity=".35"
          filter={`url(#${gid("b6")})`}
        />
        <motion.g
          opacity={scene === 7 ? 0.16 : 0.32}
          animate={{
            x: hot && !reduce ? -18 : 0,
          }}
          transition={{
            duration: 1.4,
            ease: EASE,
          }}
        >
          <polygon points="250,0 320,0 230,206 150,206" fill="#fff" filter={`url(#${gid("b14")})`} />
          <polygon points="150,206 230,206 140,300 30,300" fill="#fff" filter={`url(#${gid("b14")})`} />
        </motion.g>
        {scene === 0 && (
          <g>
            <ellipse cx="226" cy="262" rx="96" ry="12" fill="#000" opacity=".16" filter={`url(#${gid("b6")})`} />
            <polygon
              points="250,262 360,300 400,300 300,248"
              fill="#000"
              opacity=".12"
              filter={`url(#${gid("b14")})`}
            />
            <rect x="160" y="168" width="128" height="96" fill={`url(#${gid("o1")})`} />
            <rect x="160" y="160" width="128" height="12" fill={shade(palette.obj, 0.3)} />
            <circle cx="224" cy="122" r="40" fill={`url(#${gid("ball2")})`} />
            <ellipse cx="224" cy="161" rx="30" ry="4" fill="#000" opacity=".18" filter={`url(#${gid("b6")})`} />
            <circle cx="98" cy="232" r="22" fill={`url(#${gid("ball")})`} />
          </g>
        )}
        {scene === 1 && (
          <g>
            <path d="M70 206 V96 A52 52 0 0 1 174 96 V206 Z" fill={shade(palette.wall[1], -0.2)} />
            <path d="M80 206 V100 A42 42 0 0 1 164 100 V206 Z" fill={shade(palette.wall[0], 0.35)} opacity=".9" />
            <polygon points="80,206 164,206 230,300 100,300" fill="#fff" opacity=".28" filter={`url(#${gid("b6")})`} />
            <ellipse cx="290" cy="248" rx="44" ry="8" fill="#000" opacity=".16" filter={`url(#${gid("b6")})`} />
            <rect x="262" y="176" width="56" height="72" rx="28" fill={`url(#${gid("o1")})`} />
            <rect x="276" y="150" width="28" height="30" rx="14" fill={`url(#${gid("o2")})`} />
          </g>
        )}
        {scene === 2 && (
          <g>
            <ellipse cx="200" cy="260" rx="110" ry="12" fill="#000" opacity=".15" filter={`url(#${gid("b6")})`} />
            {(
              [
                [150, 196, 60, 64, "o1"],
                [210, 176, 64, 84, "o2"],
                [276, 214, 46, 46, "o3"],
              ] as const
            ).map(([y, v, w, C, m], h) => (
              <g key={h}>
                <rect x={y} y={v} width={w} height={C} rx="8" fill={`url(#${gid(m)})`} />
                <ellipse
                  cx={y + w / 2}
                  cy={v}
                  rx={w / 2}
                  ry="7"
                  fill={shade(h === 1 ? palette.obj2 : h === 0 ? palette.obj : palette.acc, 0.35)}
                />
                <rect x={y + 6} y={v - 16} width={w - 12} height="14" rx="4" fill={shade(palette.wall[1], -0.25)} />
              </g>
            ))}
            <rect x="166" y="210" width="5" height="40" rx="2.5" fill="#fff" opacity=".45" />
          </g>
        )}
        {scene === 3 && (
          <g>
            <ellipse
              cx="206"
              cy="246"
              rx="120"
              ry="16"
              fill={palette.obj}
              opacity=".35"
              filter={`url(#${gid("b14")})`}
            />
            <ellipse
              cx="226"
              cy="252"
              rx="60"
              ry="8"
              fill={shade(palette.obj, 0.4)}
              opacity=".7"
              filter={`url(#${gid("b6")})`}
            />
            <path
              d="M110 150 C 120 228, 300 236, 306 150 C 286 176, 250 140, 206 150 C 160 160, 136 132, 110 150 Z"
              fill={`url(#${gid("glass")})`}
            />
            <path
              d="M118 152 C 150 136, 182 160, 210 150 C 240 140, 270 168, 300 152"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              opacity=".85"
            />
            <path d="M140 190 C 170 214, 240 220, 280 192" fill="none" stroke="#fff" strokeWidth="2" opacity=".5" />
            <ellipse cx="150" cy="170" rx="10" ry="4" fill="#fff" opacity=".8" transform="rotate(-20 150 170)" />
          </g>
        )}
        {scene === 4 && (
          <g>
            <g opacity=".22" filter={`url(#${gid("b6")})`}>
              {Array.from(
                {
                  length: 9,
                },
                (y, index) => (
                  <path
                    d={`M${30 + index * 6} ${-10 + index * 4} Q ${160 + index * 8} ${40 + index * 18}, ${260 + index * 10} ${30 + index * 26}`}
                    fill="none"
                    stroke="#000"
                    strokeWidth={10 - index * 0.6}
                    strokeLinecap="round"
                    key={index}
                  />
                ),
              )}
            </g>
            <ellipse cx="236" cy="262" rx="92" ry="12" fill="#000" opacity=".15" filter={`url(#${gid("b6")})`} />
            <path d="M150 206 C 156 268, 316 268, 322 206 Z" fill={`url(#${gid("o1")})`} />
            <ellipse cx="236" cy="206" rx="86" ry="10" fill={shade(palette.obj, 0.4)} />
            {Array.from(
              {
                length: 10,
              },
              (y, index) => (
                <path
                  d={`M${162 + index * 16} 212 Q ${170 + index * 15} 240, ${190 + index * 10} 256`}
                  fill="none"
                  stroke={shade(palette.obj, -0.15)}
                  strokeWidth="1.2"
                  key={index}
                />
              ),
            )}
          </g>
        )}
        {scene === 5 && (
          <g>
            <ellipse cx="236" cy="256" rx="80" ry="10" fill="#000" opacity=".15" filter={`url(#${gid("b6")})`} />
            <polygon
              points="250,256 400,230 400,270 260,262"
              fill="#000"
              opacity=".12"
              filter={`url(#${gid("b14")})`}
            />
            <rect x="204" y="110" width="66" height="148" rx="26" fill={`url(#${gid("o1")})`} />
            <rect x="222" y="86" width="30" height="30" rx="8" fill={`url(#${gid("o2")})`} />
            <rect x="214" y="124" width="6" height="110" rx="3" fill="#fff" opacity=".35" />
            <circle cx="140" cy="236" r="24" fill={`url(#${gid("ball2")})`} />
            <path
              d="M140 212 q4 -10 12 -12"
              stroke={shade(palette.wall[1], -0.4)}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
        {scene === 6 && (
          <g>
            <ellipse cx="200" cy="262" rx="120" ry="12" fill="#000" opacity=".18" filter={`url(#${gid("b6")})`} />
            {(
              [
                [110, 230, 190, 26, palette.obj],
                [126, 206, 170, 24, palette.obj2],
                [104, 182, 182, 24, palette.acc],
              ] as const
            ).map(([y, v, w, C, m], h) => (
              <g transform={`rotate(${[-2, 3, -4][h]} ${y + w / 2} ${v})`} key={h}>
                <rect x={y} y={v} width={w} height={C} rx="2" fill={m} />
                <rect x={y + 4} y={v + 3} width={w - 8} height={C - 6} fill="#FBF7EE" />
                {Array.from(
                  {
                    length: 5,
                  },
                  (g, index) => (
                    <line
                      x1={y + 6}
                      x2={y + w - 6}
                      y1={v + 5 + index * 3.4}
                      y2={v + 5 + index * 3.4}
                      stroke="#E4DCCB"
                      strokeWidth=".8"
                      key={index}
                    />
                  ),
                )}
                <rect x={y} y={v} width="6" height={C} fill={shade(m, -0.25)} />
              </g>
            ))}
            <path d="M210 182 L208 130 L232 128 L236 182" fill={shade(palette.wall[0], 0.3)} opacity=".9" />
          </g>
        )}
        {scene === 7 && (
          <g>
            <ellipse cx="200" cy="266" rx="150" ry="12" fill="#000" opacity=".22" filter={`url(#${gid("b6")})`} />
            {(
              [
                [96, 168, 58, palette.obj, "o1"],
                [182, 122, 72, palette.obj2, "o2"],
                [282, 190, 50, palette.acc, "o3"],
              ] as const
            ).map(([y, v, w, C, m], h) => (
              <g key={h}>
                <rect x={y} y={v} width={w} height={262 - v} fill={`url(#${gid(m)})`} />
                {Array.from(
                  {
                    length: Math.floor(w / 7),
                  },
                  (g, index) => (
                    <line
                      x1={y + 4 + index * 7}
                      x2={y + 4 + index * 7}
                      y1={v + 10}
                      y2="262"
                      stroke="#000"
                      strokeOpacity=".08"
                      key={index}
                    />
                  ),
                )}
                <ellipse cx={y + w / 2} cy={v} rx={w / 2 + 10} ry="8" fill={shade(C, 0.25)} />
              </g>
            ))}
            <circle cx="218" cy="104" r="12" fill={`url(#${gid("ball")})`} />
          </g>
        )}
        <rect
          width={W}
          height={H}
          filter={`url(#${gid("grain")})`}
          opacity=".22"
          style={{
            mixBlendMode: "overlay",
          }}
        />
      </motion.svg>
    </div>
  );
}
