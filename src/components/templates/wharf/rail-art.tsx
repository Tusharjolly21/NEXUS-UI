"use client";
/* eslint-disable react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { LEDGER_IN, LEDGER_OUT, SWAP_ROWS, type ArtProps } from "./data";
import { COLOR, FONT_MONO, SPRING, r2 } from "./theme";
/** A token as a coin seen side-on: "d" dark, "g" grey, anything else blue (USDC). */
export function Coin({ x, y, label, kind, r = 13 }: { x: number; y: number; label: string; kind: string; r?: number }) {
  const rim = kind === "g" ? "#8D9199" : kind === "d" ? "#16171A" : "#163FB3";
  return (
    <g>
      <circle cx={x + 2.4} cy={y + 0.6} r={r} fill={rim} />
      {Array.from(
        {
          length: 9,
        },
        (o, index) => {
          const u = -0.9 + index * 0.22;
          return (
            <line
              x1={r2(x + 2.4 + Math.cos(u) * (r - 0.6))}
              y1={r2(y + 0.6 + Math.sin(u) * (r - 0.6))}
              x2={r2(x + 2.4 + Math.cos(u) * (r + 0.2))}
              y2={r2(y + 0.6 + Math.sin(u) * (r + 0.2))}
              stroke="rgba(255,255,255,.28)"
              strokeWidth=".7"
              key={index}
            />
          );
        },
      )}
      <circle cx={x} cy={y} r={r} fill={`url(#wf-coin-${kind})`} />
      <circle
        cx={x}
        cy={y}
        r={r - 3.2}
        fill="none"
        stroke={kind === "g" ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.3)"}
        strokeWidth=".9"
      />
      <ellipse
        cx={x - r * 0.35}
        cy={y - r * 0.45}
        rx={r * 0.35}
        ry={r * 0.16}
        fill="#fff"
        opacity={kind === "g" ? 0.8 : 0.35}
        transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.45})`}
      />
      <text
        x={x}
        y={y + 2.4}
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize={r * 0.5}
        fontWeight="700"
        fill={kind === "g" ? "#4B4F57" : "#fff"}
      >
        {label}
      </text>
    </g>
  );
}
export function CoinSlot({ cx, y, w = 34 }: { cx: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={cx - w / 2} y={y} width={w} height="5" fill="#1D48C6" />
      {Array.from(
        {
          length: 8,
        },
        (r, i) => (
          <line
            x1={cx - w / 2 + 3 + i * ((w - 6) / 7)}
            x2={cx - w / 2 + 3 + i * ((w - 6) / 7)}
            y1={y + 0.8}
            y2={y + 4.2}
            stroke="rgba(255,255,255,.22)"
            strokeWidth=".7"
            key={i}
          />
        ),
      )}
      <ellipse cx={cx} cy={y + 5} rx={w / 2} ry="4.5" fill="#1D48C6" />
      <ellipse cx={cx} cy={y} rx={w / 2} ry="4.5" fill="url(#wf-coin-b)" />
      <ellipse cx={cx} cy={y} rx={w / 2 - 4} ry="2.8" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth=".7" />
    </g>
  );
}
/** Settle: tokens roll along a belt into the machine and come out the far side as USDC. */
export function AcceptArt({ hot, on }: ArtProps) {
  const reduce = useReducedMotion();
  const incoming: [token: string, kind: string][] = [
    ["ETH", "d"],
    ["SOL", "g"],
    ["USDT", "d"],
    ["ARB", "g"],
  ];
  const period = hot ? 3 : 6.5;
  const animated = on && !reduce;
  const [row, setRow] = useState(3);
  useEffect(() => {
    if (!animated) {
      return;
    }
    const d = window.setInterval(() => setRow((h) => (h >= 6 ? 1 : h + 1)), (period * 1000) / incoming.length);
    return () => window.clearInterval(d);
  }, [animated, period, incoming.length]);
  const swap = SWAP_ROWS[row % SWAP_ROWS.length];
  const slotX = 127;
  const outX = 272;
  return (
    <svg viewBox="0 0 380 240" className="h-full w-full" aria-hidden={true}>
      <defs>
        <linearGradient id="wf-cyl" x1="0" x2="1">
          <stop offset="0" stopColor="#BFC3CA" />
          <stop offset=".32" stopColor="#FFFFFF" />
          <stop offset=".7" stopColor="#E4E6EA" />
          <stop offset="1" stopColor="#B4B8C0" />
        </linearGradient>
        <linearGradient id="wf-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F4F6" />
          <stop offset="1" stopColor="#D9DCE1" />
        </linearGradient>
        <linearGradient id="wf-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FA6FF" />
          <stop offset="1" stopColor="#2457E6" />
        </linearGradient>
        <linearGradient id="wf-hopper" x1="0" x2="1">
          <stop offset="0" stopColor="#D2D5DB" />
          <stop offset=".45" stopColor="#FAFAFB" />
          <stop offset="1" stopColor="#C8CCD3" />
        </linearGradient>
        <clipPath id="wf-belt">
          <rect x="44" y="70" width="128" height="62" />
        </clipPath>
        <clipPath id="wf-glass">
          <rect x="179" y="50" width="25" height="52" rx="4.5" />
        </clipPath>
        <filter id="wf-blur6">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <ellipse cx="190" cy="212" rx="168" ry="9" fill="rgba(20,22,28,.18)" filter="url(#wf-blur6)" />
      <g filter="url(#wf-soft)">
        <rect x="28" y="130" width="324" height="16" rx="5" fill="#FBFBFC" />
        <rect x="28" y="142" width="324" height="50" rx="6" fill="url(#wf-front)" />
        <rect x="34" y="188" width="312" height="8" rx="3" fill="#C7CBD2" />
      </g>
      {[42, 322].map((item) => (
        <rect x={item} y="194" width="16" height="8" rx="2" fill="#9EA2AA" key={item} />
      ))}
      <line x1="30" x2="350" y1="145.5" y2="145.5" stroke="#FFFFFF" strokeWidth="1.2" />
      {[100, 280].map((item) => (
        <line x1={item} x2={item} y1="148" y2="186" stroke="#CDD1D7" key={item} />
      ))}
      {(
        [
          [38, 152],
          [38, 180],
          [342, 152],
          [342, 180],
          [108, 152],
          [272, 152],
        ] as const
      ).map(([d, h]) => (
        <g key={`${d}-${h}`}>
          <circle cx={d} cy={h} r="2" fill="#C2C6CD" />
          <circle cx={d - 0.5} cy={h - 0.5} r=".8" fill="#fff" />
        </g>
      ))}
      {Array.from(
        {
          length: 5,
        },
        (d, h) => (
          <rect x={46 + h * 8} y="168" width="4" height="14" rx="2" fill="#CDD1D7" key={h} />
        ),
      )}
      {Array.from(
        {
          length: 5,
        },
        (d, h) => (
          <rect x={296 + h * 8} y="168" width="4" height="14" rx="2" fill="#CDD1D7" key={h} />
        ),
      )}
      <rect x="112" y="152" width="156" height="30" rx="5" fill="#1C1E22" />
      <rect x="114" y="154" width="152" height="26" rx="4" fill="#24272C" />
      <text x="122" y="164" fontFamily={FONT_MONO} fontSize="6" fill="#7C8089" letterSpacing=".6">
        IN
      </text>
      <text x="122" y="175" fontFamily={FONT_MONO} fontSize="8" fill="#E8EAEE">
        {swap[0]} <tspan fill="#9DA1A8">{swap[1]}</tspan>
      </text>
      <text x="190" y="171" fontFamily={FONT_MONO} fontSize="8" fill={COLOR.mid}>
        →
      </text>
      <text x="204" y="164" fontFamily={FONT_MONO} fontSize="6" fill="#7C8089" letterSpacing=".6">
        OUT
      </text>
      <text x="204" y="175" fontFamily={FONT_MONO} fontSize="8" fill="#4ADE80">
        {swap[2]} <tspan fill="#9DA1A8">USDC</tspan>
      </text>
      <text x="270" y="198" textAnchor="end" fontFamily={FONT_MONO} fontSize="5" fill="#A4A8AF" letterSpacing=".8">
        WHARF · SETTLE-01
      </text>
      <rect x="40" y="118" width="134" height="16" rx="8" fill="#2A2C31" />
      <rect x="46" y="118.5" width="122" height="3" rx="1.5" fill="#3E4148" />
      <line
        x1="48"
        x2="166"
        y1="126"
        y2="126"
        stroke="#4A4D55"
        strokeWidth="6"
        strokeDasharray="2 5"
        className="wf-anim"
        style={
          animated
            ? {
                animation: `wf-dash ${period / 6}s linear infinite`,
              }
            : undefined
        }
      />
      {[48, 166].map((item) => (
        <g key={item}>
          <circle cx={item} cy="126" r="6.5" fill="url(#wf-coin-g)" />
          <g
            className="wf-anim"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: animated ? `wf-spin ${period / 4}s linear infinite` : undefined,
            }}
          >
            <path d={`M${item - 4.5} 126 H${item + 4.5} M${item} 121.5 V130.5`} stroke="#7C8089" strokeWidth="1.3" />
          </g>
          <circle cx={item} cy="126" r="1.6" fill="#55585F" />
        </g>
      ))}
      <rect x="40" y="132" width="134" height="3" rx="1.5" fill="#BDC1C8" />
      <g clipPath="url(#wf-belt)">
        {incoming.map(([d, h], index) => (
          <g
            className="wf-anim"
            style={
              animated
                ? {
                    animation: `wf-belt2 ${period}s linear infinite`,
                    animationDelay: `-${(index * period) / incoming.length}s`,
                  }
                : {
                    transform: `translateX(${index * 27}px)`,
                  }
            }
            key={d}
          >
            <Coin x={62} y={104} label={d} kind={h} />
          </g>
        ))}
      </g>
      <g filter="url(#wf-soft)">
        <path d="M36 54 H92 L80 92 H48 Z" fill="url(#wf-hopper)" />
        <ellipse cx="64" cy="54" rx="28" ry="5" fill="#E5E7EB" />
        <ellipse cx="64" cy="54" rx="23" ry="3.4" fill="#A9ADB5" />
        {(
          [
            ["ETH", "d", 52],
            ["ARB", "g", 66],
            ["SOL", "g", 78],
          ] as const
        ).map(([d, h, g], x) => (
          <g transform={`translate(0 ${-4 - x * 1.5})`} key={d}>
            <ellipse
              cx={g}
              cy="54"
              rx="7"
              ry="2.4"
              fill={h === "d" ? "#2E3036" : "#D5D8DD"}
              stroke={h === "d" ? "#16171A" : "#9EA2AA"}
              strokeWidth=".6"
            />
          </g>
        ))}
        <rect x="48" y="90" width="32" height="5" rx="2" fill="#C0C4CB" />
      </g>
      <text x="64" y="76" textAnchor="middle" fontFamily={FONT_MONO} fontSize="5.5" fill="#8E929A" letterSpacing=".8">
        ANY TOKEN
      </text>
      <g filter="url(#wf-soft)">
        <rect x="168" y="36" width="47" height="96" rx="9" fill="url(#wf-cyl)" />
        <ellipse cx="191.5" cy="36" rx="23.5" ry="5.5" fill="#F7F8FA" stroke="#D6D9DF" />
        <rect x="166" y="124" width="51" height="10" rx="3" fill="#C9CDD4" />
      </g>
      <rect x="178" y="49" width="27" height="54" rx="5" fill="#EEF3FC" stroke="#C9D2E2" />
      <g clipPath="url(#wf-glass)">
        <motion.rect
          x="179"
          width="25"
          fill="url(#wf-liquid)"
          opacity=".9"
          initial={false}
          animate={
            animated
              ? {
                  y: [96, 60, 96],
                  height: [8, 44, 8],
                }
              : {
                  y: 74,
                  height: 30,
                }
          }
          transition={{
            duration: period / 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {animated &&
          [0, 1, 2, 3].map((item) => (
            <motion.circle
              cx={184 + item * 5}
              r={1 + (item % 2) * 0.6}
              fill="#fff"
              opacity=".8"
              initial={{
                cy: 102,
              }}
              animate={{
                cy: [102, 62],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 1.6 + item * 0.3,
                repeat: Infinity,
                delay: item * 0.4,
                ease: "easeIn",
              }}
              key={item}
            />
          ))}
        <rect x="181" y="50" width="3" height="52" fill="#fff" opacity=".6" />
      </g>
      {Array.from(
        {
          length: 6,
        },
        (d, h) => (
          <line
            x1="205"
            x2={h % 2 ? 208 : 210}
            y1={56 + h * 8}
            y2={56 + h * 8}
            stroke="#9EA2AA"
            strokeWidth=".8"
            key={h}
          />
        ),
      )}
      <circle cx="191.5" cy="114" r="7.5" fill="#FFFFFF" stroke="#B9BDC4" />
      {[-60, -20, 20, 60].map((item) => (
        <line
          x1={r2(191.5 + Math.sin((item * Math.PI) / 180) * 5)}
          y1={r2(114 - Math.cos((item * Math.PI) / 180) * 5)}
          x2={r2(191.5 + Math.sin((item * Math.PI) / 180) * 6.5)}
          y2={r2(114 - Math.cos((item * Math.PI) / 180) * 6.5)}
          stroke="#9EA2AA"
          strokeWidth=".7"
          key={item}
        />
      ))}
      <motion.line
        x1="191.5"
        y1="114"
        x2="191.5"
        y2="108.5"
        stroke="#E5484D"
        strokeWidth="1.2"
        strokeLinecap="round"
        style={{
          originX: "191.5px",
          originY: "114px",
        }}
        animate={
          animated
            ? {
                rotate: [-50, 40, -10, 55, -50],
              }
            : {
                rotate: 20,
              }
        }
        transition={{
          duration: period,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <circle cx="191.5" cy="114" r="1.3" fill="#2B2D33" />
      {(
        [
          ["#4ADE80", 0],
          [COLOR.mid, 0.3],
          ["#FBBF24", 0.6],
        ] as const
      ).map(([d, h], index) => (
        <motion.circle
          cx={176}
          cy={58 + index * 8}
          r="1.8"
          fill={d}
          animate={
            animated
              ? {
                  opacity: [1, 0.25, 1],
                }
              : {
                  opacity: 1,
                }
          }
          transition={{
            duration: hot ? 0.6 : 1.4,
            repeat: Infinity,
            delay: h,
          }}
          key={index}
        />
      ))}
      <rect x="181" y="24" width="21" height="12" rx="3" fill="#33363C" />
      <rect x="183" y="25.5" width="17" height="2" rx="1" fill="#4D5058" />
      <rect x="189" y="8" width="5" height="18" rx="1.5" fill="#9DA1A9" />
      <g transform="translate(191.5 10) scale(1 .3)">
        <circle r="27" fill="none" stroke="#5F636B" strokeWidth="5" transform="translate(0 6)" />
        <motion.g
          animate={
            animated
              ? {
                  rotate: 360,
                }
              : {}
          }
          transition={{
            duration: hot ? 1.6 : 4.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <circle r="27" fill="none" stroke="#A3A7AF" strokeWidth="5" />
          {[0, 60, 120].map((item) => (
            <line
              x1={r2(Math.cos((item * Math.PI) / 180) * -25)}
              y1={r2(Math.sin((item * Math.PI) / 180) * -25)}
              x2={r2(Math.cos((item * Math.PI) / 180) * 25)}
              y2={r2(Math.sin((item * Math.PI) / 180) * 25)}
              stroke="#8E929A"
              strokeWidth="3"
              key={item}
            />
          ))}
          <circle cx="27" cy="0" r="4" fill="#C9CDD4" />
        </motion.g>
        <circle r="6" fill="#6B6F77" />
      </g>
      <path d="M215 76 H258 Q272 76 272 90 V94" fill="none" stroke="#C3C7CE" strokeWidth="9" strokeLinecap="round" />
      <path d="M215 76 H258 Q272 76 272 90 V94" fill="none" stroke="#E8EAEE" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M215 76 H258 Q272 76 272 90 V94"
        fill="none"
        stroke={COLOR.blue}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 7"
        className="wf-anim"
        style={
          animated
            ? {
                animation: `wf-dash ${period / 8}s linear infinite`,
              }
            : undefined
        }
      />
      <rect x="213" y="70" width="6" height="12" rx="1.5" fill="#B2B6BE" />
      <rect x="263" y="92" width="18" height="6" rx="2" fill="#A9ADB5" />
      <rect x="236" y="122" width="106" height="10" rx="4" fill="#E2E5EA" />
      <rect x="236" y="129" width="106" height="4" rx="2" fill="#C7CBD2" />
      {Array.from(
        {
          length: row,
        },
        (d, h) => (
          <motion.g
            initial={
              h === row - 1 && animated
                ? {
                    y: -(slotX - h * 6 - 100),
                    opacity: 0,
                  }
                : false
            }
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 18,
            }}
            key={h}
          >
            <CoinSlot cx={outX} y={slotX - 6 - h * 6} />
          </motion.g>
        ),
      )}
      {Array.from(
        {
          length: 4,
        },
        (d, h) => (
          <CoinSlot cx={318} y={slotX - 6 - h * 6} w={30} key={h} />
        ),
      )}
      <text x="295" y="68" textAnchor="middle" fontFamily={FONT_MONO} fontSize="5.5" fill="#8E929A" letterSpacing=".8">
        USDC OUT
      </text>
      <text x="295" y="76" textAnchor="middle" fontFamily={FONT_MONO} fontSize="7" fontWeight="700" fill={COLOR.ink}>
        {(row * 249.7).toFixed(2)}
      </text>
    </svg>
  );
}
// Route: a street map printed on paper folded into four panels. FOLD_X/FOLD_Y are the top corners of the folds.
export const FOLD_X = [36, 116, 196, 276, 356];
export const FOLD_Y = [52, 44, 52, 44, 52];
export const FOLD_DEPTH = 144;
export const ROUTE_BEST = "M70 150 C 100 102, 150 80, 196 84 S 286 98, 318 128";
export const ROUTE_ALTS = ["M70 150 Q 200 196 318 128", "M70 150 Q 118 64 210 60 T 318 128"];
/** The shear that lays the flat map onto one panel of the fold: `s` is its slope, `m` the SVG matrix. */
export function foldTransform(panel: number) {
  const slope = (FOLD_Y[panel + 1]! - FOLD_Y[panel]!) / 80;
  return { s: slope, m: `matrix(1 ${slope} 0 1 0 ${FOLD_Y[panel]! - 52 - slope * FOLD_X[panel]!})` };
}

/** Where a point of the flat map lands on the folded paper. */
export function onFold(x: number, y: number): [number, number] {
  let panel = 0;
  while (panel < 3 && x > FOLD_X[panel + 1]!) panel++;
  const { s } = foldTransform(panel);
  return [x, y + s * (x - FOLD_X[panel]!) + FOLD_Y[panel]! - 52];
}
export function RouteMap({ draw, hot, uid }: { draw: boolean; hot: boolean; uid: string }) {
  const reduce = useReducedMotion();
  // city blocks on a grid, with a few left out for squares and parks: [x, y, width, height]
  const blocks: [number, number, number, number][] = [];
  for (let col = 0; col < 13; col++) {
    for (let row = 0; row < 7; row++) {
      if ((col * 7 + row * 3) % 5 === 0) continue;
      blocks.push([40 + col * 24 + (row % 2) * 6, 56 + row * 20, 16 + ((col + row) % 3) * 2, 12]);
    }
  }
  return (
    <g>
      <rect x="36" y="52" width="320" height={FOLD_DEPTH} fill="#F7F8FA" />
      {blocks.map(([x, y, w, h], index) => (
        <rect x={x} y={y} width={w} height={h} rx="1.5" fill={index % 7 === 0 ? "#E2E5EA" : "#ECEEF1"} key={index} />
      ))}
      <path
        d="M220 58 C 250 52, 292 60, 298 82 C 302 100, 270 108, 246 102 C 222 96, 206 70, 220 58 Z"
        fill="#DCEFE2"
      />
      {(
        [
          [232, 70],
          [246, 66],
          [262, 74],
          [278, 70],
          [286, 88],
          [258, 92],
          [240, 86],
        ] as const
      ).map(([s, o], index) => (
        <circle cx={s} cy={o} r={3 + (index % 2)} fill="#BFE2CB" key={index} />
      ))}
      <path d="M36 168 C 90 150, 140 176, 200 160 S 300 120, 356 132" fill="none" stroke="#C9DBFA" strokeWidth="15" />
      <path d="M36 168 C 90 150, 140 176, 200 160 S 300 120, 356 132" fill="none" stroke="#DCE8FD" strokeWidth="8" />
      {["M36 110 H356", "M36 186 H356", "M140 52 V196", "M262 52 V196", "M36 64 L200 196"].map((item) => (
        <g key={item}>
          <path d={item} stroke="#D7DAE0" strokeWidth="7" fill="none" />
          <path d={item} stroke="#FFFFFF" strokeWidth="4.5" fill="none" />
        </g>
      ))}
      {[136, 258].map((item) => (
        <rect x={item - 2} y="157" width="13" height="10" fill="#B9BDC5" rx="1" key={item} />
      ))}
      <text x="150" y="107" fontFamily={FONT_MONO} fontSize="4.6" fill="#A4A8AF" letterSpacing=".5">
        HALO AVE
      </text>
      <text x="300" y="183" fontFamily={FONT_MONO} fontSize="4.6" fill="#A4A8AF" letterSpacing=".5">
        MERIDIAN RD
      </text>
      <text
        x="80"
        y="164"
        fontFamily={FONT_MONO}
        fontSize="4.6"
        fill="#8FA9DA"
        letterSpacing=".5"
        transform="rotate(-8 80 164)"
      >
        ARCLANE RIVER
      </text>
      {ROUTE_ALTS.map((routeAlt, index) => (
        <path
          d={routeAlt}
          fill="none"
          stroke={hot ? "#B4B9C2" : "#CDD1D7"}
          strokeWidth="1.6"
          strokeDasharray="3 3"
          key={index}
        />
      ))}
      <g>
        <rect x="166" y="178" width="30" height="10" rx="5" fill="#fff" stroke="#D9DCE1" strokeWidth=".6" />
        <text x="181" y="185" textAnchor="middle" fontFamily={FONT_MONO} fontSize="5" fill="#8E929A">
          0.31%
        </text>
      </g>
      <g>
        <rect x="120" y="56" width="30" height="10" rx="5" fill="#fff" stroke="#D9DCE1" strokeWidth=".6" />
        <text x="135" y="63" textAnchor="middle" fontFamily={FONT_MONO} fontSize="5" fill="#8E929A">
          0.24%
        </text>
      </g>
      <path d={ROUTE_BEST} fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".9" />
      <motion.path
        d={ROUTE_BEST}
        fill="none"
        stroke="#0F7C76"
        strokeWidth="2.6"
        strokeDasharray="0.5 5.5"
        strokeLinecap="round"
        initial={{
          pathLength: reduce ? 1 : 0,
        }}
        animate={{
          pathLength: draw || reduce ? 1 : 0,
        }}
        transition={{
          duration: hot ? 0.8 : 1.6,
          ease: "easeInOut",
        }}
        key={`r-${uid}`}
      />
      {draw && !reduce && (
        <motion.circle
          r="4.2"
          fill="#0F7C76"
          stroke="#fff"
          strokeWidth="2"
          style={{
            offsetPath: `path("${ROUTE_BEST}")`,
          }}
          initial={{
            offsetDistance: "0%",
          }}
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: hot ? 1.3 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5,
            delay: hot ? 0.8 : 1.6,
          }}
        />
      )}
      <g transform="translate(330 168)">
        <circle r="9" fill="#fff" stroke="#D3D6DC" />
        <path d="M0 -7 L2.6 0 L0 -1.4 L-2.6 0 Z" fill="#2B2D33" />
        <path d="M0 7 L2.6 0 L0 1.4 L-2.6 0 Z" fill="#B9BDC5" />
        <text y="-10.5" textAnchor="middle" fontFamily={FONT_MONO} fontSize="4.5" fill="#6C6F76">
          N
        </text>
      </g>
      <g transform="translate(46 186)">
        <rect width="36" height="3" fill="#2B2D33" />
        <rect width="18" height="3" fill="#fff" stroke="#2B2D33" strokeWidth=".6" />
        <text y="-2" fontFamily={FONT_MONO} fontSize="4" fill="#8E929A">
          0
        </text>
        <text x="30" y="-2" fontFamily={FONT_MONO} fontSize="4" fill="#8E929A">
          30 ch
        </text>
      </g>
    </g>
  );
}
type RoutePinProps = { x: number; y: number; col: "dark" | "teal"; label: string; delay: number; on: boolean };

export function RoutePin({ x, y, col, label, delay, on }: RoutePinProps) {
  const [px, py] = onFold(x, y);
  const gid = `wf-pin-${label}`;
  return (
    <g>
      <motion.ellipse
        cx={px}
        cy={py + 1}
        rx="6"
        ry="2"
        fill="rgba(20,22,28,.28)"
        initial={{
          scale: 0,
        }}
        animate={{
          scale: on ? 1 : 0,
        }}
        transition={{
          delay: delay + 0.15,
        }}
        style={{
          originX: `${px}px`,
          originY: `${py}px`,
        }}
      />
      <motion.g
        initial={{
          y: -26,
          opacity: 0,
        }}
        animate={
          on
            ? {
                y: 0,
                opacity: 1,
              }
            : {}
        }
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 12,
          delay: delay,
        }}
      >
        <defs>
          <radialGradient id={gid} cx=".35" cy=".3" r=".9">
            <stop offset="0" stopColor={col === "teal" ? "#3FB5AC" : "#6B6F77"} />
            <stop offset="1" stopColor={col === "teal" ? "#0B5E59" : "#1B1D21"} />
          </radialGradient>
        </defs>
        <path
          d={`M${px} ${py} C ${px - 3} ${py - 7}, ${px - 9} ${py - 12}, ${px - 9} ${py - 19} a9 9 0 0 1 18 0 C ${px + 9} ${py - 12}, ${px + 3} ${py - 7}, ${px} ${py} Z`}
          fill={`url(#${gid})`}
        />
        <circle cx={px} cy={py - 19} r="3.4" fill="#fff" />
        <ellipse
          cx={px - 3.5}
          cy={py - 23}
          rx="2.2"
          ry="1.2"
          fill="#fff"
          opacity=".45"
          transform={`rotate(-30 ${px - 3.5} ${py - 23})`}
        />
        <g transform={`translate(${px + 8} ${py - 34})`}>
          <rect width={label.length * 4.6 + 8} height="10" rx="2" fill={col === "teal" ? "#0F7C76" : "#2B2D33"} />
          <text x="4" y="7" fontFamily={FONT_MONO} fontSize="5.6" fill="#fff" letterSpacing=".4">
            {label}
          </text>
        </g>
      </motion.g>
    </g>
  );
}
/** Route: a folded street map where the best of three quotes is drawn from Base, through Arbitrum, to the treasury. */
export function RouteArt({ hot, on }: ArtProps) {
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    if (hot) {
      setQuote((prev) => prev + 1);
    }
  }, [hot]);
  const panels = [0, 1, 2, 3].map(
    (item) =>
      `${FOLD_X[item]},${FOLD_Y[item]} ${FOLD_X[item + 1]},${FOLD_Y[item + 1]} ${FOLD_X[item + 1]},${FOLD_Y[item + 1] + FOLD_DEPTH} ${FOLD_X[item]},${FOLD_Y[item] + FOLD_DEPTH}`,
  );
  return (
    <svg viewBox="0 0 380 240" className="h-full w-full" aria-hidden={true}>
      <defs>
        {panels.map((panel, index) => (
          <clipPath id={`wf-fold-${index}`} key={index}>
            <polygon points={panel} />
          </clipPath>
        ))}
        <linearGradient id="wf-fold-l" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".0" />
          <stop offset="1" stopColor="#000" stopOpacity=".06" />
        </linearGradient>
        <linearGradient id="wf-fold-r" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".13" />
          <stop offset="1" stopColor="#000" stopOpacity=".03" />
        </linearGradient>
        <filter id="wf-blur5">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="196" cy="210" rx="168" ry="10" fill="rgba(20,22,28,.2)" filter="url(#wf-blur5)" />
      {panels.map((panel, index) => (
        <polygon points={panel} transform="translate(0 4)" fill={index % 2 ? "#D7DADF" : "#E6E8EB"} key={`t${index}`} />
      ))}
      {[0, 1, 2, 3].map((item) => (
        <g clipPath={`url(#wf-fold-${item})`} key={item}>
          <g transform={foldTransform(item).m}>
            <RouteMap draw={on} hot={hot} uid={`${item}-${quote}`} />
          </g>
          <polygon points={panels[item]} fill={`url(#wf-fold-${item % 2 ? "r" : "l"})`} />
        </g>
      ))}
      {[1, 2, 3].map((item) => (
        <line
          x1={FOLD_X[item]}
          x2={FOLD_X[item]}
          y1={FOLD_Y[item]}
          y2={FOLD_Y[item] + FOLD_DEPTH}
          stroke={item % 2 ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.08)"}
          strokeWidth="1"
          key={item}
        />
      ))}
      {panels.map((panel, index) => (
        <polygon points={panel} fill="none" stroke="rgba(20,22,28,.08)" strokeWidth=".6" key={`o${index}`} />
      ))}
      <RoutePin x={70} y={150} col="dark" label="BASE" delay={0.2} on={on} />
      <RoutePin x={196} y={84} col="dark" label="ARB" delay={0.45} on={on} />
      <RoutePin x={318} y={128} col="teal" label="TREASURY" delay={0.7} on={on} />
      <motion.g
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={
          on
            ? {
                opacity: 1,
                y: 0,
              }
            : {}
        }
        transition={{
          delay: 1.7,
          ...SPRING,
        }}
      >
        <rect x="236" y="10" width="124" height="24" rx="12" fill="#fff" filter="url(#wf-tight)" />
        <circle cx="249" cy="22" r="5" fill="#0F7C76" />
        <path d="M246.6 22 l1.7 1.7 l3 -3.3" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        <text x="259" y="20" fontFamily={FONT_MONO} fontSize="5.4" fill="#8E929A" letterSpacing=".4">
          BEST OF 3 QUOTES
        </text>
        <text x="259" y="28.5" fontFamily={FONT_MONO} fontSize="6.4" fontWeight="700" fill="#2B2D33">
          0.12% · 2 hops · 182ms
        </text>
      </motion.g>
    </svg>
  );
}
/** Sponsor: a fuel gauge whose needle swings up as gas is paid, then the gas line reads covered. */
export function GasArt({ hot, on }: ArtProps) {
  const reduce = useReducedMotion();
  const needle = useMotionValue(-120);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!on || reduce) {
      needle.set(-120);
      setVisible(true);
      return;
    }
    let alive = true;
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    (async () => {
      await wait(400);
      while (alive) {
        // the needle swings up with a wobble, then the price drops back to zero
        setVisible(false);
        await animate(needle, 58, { type: "spring", stiffness: hot ? 70 : 40, damping: hot ? 6 : 8 });
        if (!alive) break;
        await wait(hot ? 350 : 900);
        setVisible(true);
        await animate(needle, -120, { type: "spring", stiffness: 140, damping: 15 });
        if (!alive) break;
        await wait(hot ? 700 : 2000);
      }
    })();
    return () => {
      alive = false;
      needle.stop();
    };
  }, [on, hot, reduce, needle]);
  const wrapRef = useRef<SVGGElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  // SVG rotate() with a centre is not a CSS transform, so it is written as an attribute
  useMotionValueEvent(needle, "change", (angle) => {
    const transform = `rotate(${angle} 190 116)`;
    wrapRef.current?.setAttribute("transform", transform);
    needleRef.current?.setAttribute("transform", transform);
  });
  const cx = 190;
  const cy = 116;
  const polar = (deg: number, radius: number): [number, number] => [
    r2(cx + Math.sin((deg * Math.PI) / 180) * radius),
    r2(cy - Math.cos((deg * Math.PI) / 180) * radius),
  ];
  const arc = (from: number, to: number, radius: number) => {
    const [x0, y0] = polar(from, radius);
    const [x1, y1] = polar(to, radius);
    return `M${x0} ${y0} A${radius} ${radius} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <svg viewBox="0 0 380 240" className="h-full w-full" aria-hidden={true}>
      <defs>
        <linearGradient id="wf-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".25" stopColor="#D9DCE2" />
          <stop offset=".5" stopColor="#F7F8FA" />
          <stop offset=".72" stopColor="#B7BBC3" />
          <stop offset="1" stopColor="#E9EBEF" />
        </linearGradient>
        <linearGradient id="wf-chrome2" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".5" stopColor="#C4C8CF" />
          <stop offset="1" stopColor="#8E939B" />
        </linearGradient>
        <radialGradient id="wf-face" cx=".5" cy=".42" r=".62">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".78" stopColor="#F2F3F6" />
          <stop offset="1" stopColor="#DCDFE4" />
        </radialGradient>
        <linearGradient id="wf-needle" x1="0" x2="1">
          <stop offset="0" stopColor="#7B63FF" />
          <stop offset=".5" stopColor="#5B3FF0" />
          <stop offset="1" stopColor="#3E26C9" />
        </linearGradient>
        <radialGradient id="wf-cap" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".45" stopColor="#C9CDD4" />
          <stop offset="1" stopColor="#6E727A" />
        </radialGradient>
        <linearGradient id="wf-glare" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="wf-blur4">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <ellipse cx={cx} cy="214" rx="86" ry="9" fill="rgba(20,22,28,.22)" filter="url(#wf-blur4)" />
      <circle cx={cx} cy={cy} r="98" fill="url(#wf-chrome)" filter="url(#wf-soft)" />
      {Array.from(
        {
          length: 90,
        },
        (h, index) => {
          const [x, w] = polar(index * 4, 93);
          const [E, y] = polar(index * 4, 97);
          return <line x1={x} y1={w} x2={E} y2={y} stroke="rgba(80,86,96,.22)" strokeWidth=".8" key={index} />;
        },
      )}
      <circle cx={cx} cy={cy} r="90" fill="url(#wf-chrome2)" />
      <circle cx={cx} cy={cy} r="84" fill="#2A2C31" />
      <circle cx={cx} cy={cy} r="82" fill="url(#wf-face)" />
      <circle cx={cx} cy={cy} r="82" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="5" filter="url(#wf-blur1)" />
      <path d={arc(70, 120, 66)} fill="none" stroke="#F3B6B8" strokeWidth="5" />
      <path d={arc(-120, -84, 66)} fill="none" stroke="#C9F0D8" strokeWidth="5" />
      {Array.from(
        {
          length: 49,
        },
        (h, index) => {
          const x = -120 + index * 5;
          const w = index % 8 === 0;
          const E = index % 4 === 0;
          const [y, p] = polar(x, w ? 58 : E ? 61 : 63);
          const [m, S] = polar(x, 70);
          return (
            <line
              x1={y}
              y1={p}
              x2={m}
              y2={S}
              stroke={x > 70 ? "#D9474C" : "#3A3D44"}
              strokeWidth={w ? 2 : E ? 1.2 : 0.7}
              strokeLinecap="round"
              key={index}
            />
          );
        },
      )}
      {[0, 25, 50, 75, 100, 125, 150].map((h, index) => {
        const [x, w] = polar(-120 + index * 40, 47);
        return (
          <text
            x={x}
            y={w + 2.6}
            textAnchor="middle"
            fontFamily={FONT_MONO}
            fontSize="7.4"
            fill={index === 6 ? "#D9474C" : "#3A3D44"}
            key={h}
          >
            {index === 6 ? "MAX" : h}
          </text>
        );
      })}
      <text
        x={cx}
        y={cy - 26}
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize="6"
        fill="#8E929A"
        letterSpacing="1.2"
      >
        GWEI × 10
      </text>
      <g transform={`translate(${cx - 6} ${cy + 22})`}>
        <rect width="10" height="13" rx="1.5" fill="none" stroke="#6C6F76" strokeWidth="1.3" />
        <rect x="2.2" y="2.2" width="5.6" height="3.6" rx=".6" fill="#6C6F76" />
        <path
          d="M10 4 h2.4 a1.2 1.2 0 0 1 1.2 1.2 v5.4 a1 1 0 0 1 -2 0 v-2.4"
          fill="none"
          stroke="#6C6F76"
          strokeWidth="1.1"
        />
      </g>
      <rect x={cx - 34} y={cy + 40} width="68" height="18" rx="3" fill="#1E2024" />
      <rect
        x={cx - 32}
        y={cy + 42}
        width="64"
        height="14"
        rx="2"
        fill={visible ? "#173A2A" : "#2A2C31"}
        style={{
          transition: "fill .3s",
        }}
      />
      <text
        x={cx}
        y={cy + 52}
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize="7"
        fontWeight="700"
        fill={visible ? "#5BE39A" : "#FBBF24"}
        letterSpacing=".6"
      >
        {visible ? "SPONSORED" : "0.0021 ETH"}
      </text>
      <text
        x={cx}
        y={cy + 70}
        textAnchor="middle"
        fontFamily={FONT_MONO}
        fontSize="5.2"
        fill="#A4A8AF"
        letterSpacing="1.4"
      >
        WHARF · GAS
      </text>
      <g ref={wrapRef} transform="rotate(-120 190 116)" opacity=".22" filter="url(#wf-blur1)">
        <path
          d={`M${cx - 2.6} ${cy + 18} L${cx - 1.2} ${cy - 62} L${cx + 1.2} ${cy - 62} L${cx + 2.6} ${cy + 18} Z`}
          fill="#000"
          transform="translate(3 4)"
        />
      </g>
      <g ref={needleRef} transform="rotate(-120 190 116)">
        <path
          d={`M${cx - 3} ${cy + 20} L${cx - 1} ${cy - 64} L${cx} ${cy - 67} L${cx + 1} ${cy - 64} L${cx + 3} ${cy + 20} Z`}
          fill="url(#wf-needle)"
        />
        <path d={`M${cx - 0.4} ${cy + 16} L${cx - 0.4} ${cy - 60}`} stroke="rgba(255,255,255,.45)" strokeWidth=".7" />
        <circle cx={cx} cy={cy + 20} r="4.5" fill="#3E26C9" />
      </g>
      <circle cx={cx} cy={cy} r="11" fill="url(#wf-cap)" filter="url(#wf-tight)" />
      <circle cx={cx} cy={cy} r="5" fill="#5B3FF0" />
      <circle cx={cx - 1.6} cy={cy - 1.8} r="1.6" fill="#fff" opacity=".7" />
      <path
        d={`M${cx - 70} ${cy - 18} A82 82 0 0 1 ${cx + 46} ${cy - 66} A92 92 0 0 0 ${cx - 70} ${cy - 18} Z`}
        fill="url(#wf-glare)"
        opacity=".7"
      />
      <ellipse
        cx={cx - 34}
        cy={cy - 48}
        rx="34"
        ry="12"
        fill="url(#wf-glare)"
        opacity=".35"
        transform={`rotate(-32 ${cx - 34} ${cy - 48})`}
      />
      {[45, 135, 225, 315].map((h) => {
        const [g, x] = polar(h, 94);
        return (
          <g key={h}>
            <circle cx={g} cy={x} r="3" fill="url(#wf-cap)" />
            <line
              x1={g - 1.8}
              x2={g + 1.8}
              y1={x}
              y2={x}
              stroke="#6E727A"
              strokeWidth=".8"
              transform={`rotate(${h} ${g} ${x})`}
            />
          </g>
        );
      })}
    </svg>
  );
}
/** Ledger: payments on the left page are matched one by one to payouts on the right. */
export function ReconcileArt({ hot, on }: ArtProps) {
  const reduce = useReducedMotion();
  const [matched, setMatched] = useState(6);
  useEffect(() => {
    if (!on || reduce) {
      return;
    }
    const timer = window.setInterval(() => setMatched((prev) => (prev + 1) % 7), hot ? 360 : 950);
    return () => window.clearInterval(timer);
  }, [on, hot, reduce]);
  const leftLink = (y: number) => `M44 ${y + 2} Q112 ${y - 5} 184 ${y}`;
  const rightLink = (y: number) => `M196 ${y} Q268 ${y - 5} 336 ${y + 2}`;
  return (
    <svg viewBox="0 0 380 240" className="h-full w-full" aria-hidden={true}>
      <defs>
        <linearGradient id="wf-cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B3550" />
          <stop offset="1" stopColor="#18203A" />
        </linearGradient>
        <linearGradient id="wf-pageL" x1="0" x2="1">
          <stop offset="0" stopColor="#F4F2EC" />
          <stop offset=".85" stopColor="#FBFAF7" />
          <stop offset="1" stopColor="#E2DFD7" />
        </linearGradient>
        <linearGradient id="wf-pageR" x1="0" x2="1">
          <stop offset="0" stopColor="#E2DFD7" />
          <stop offset=".15" stopColor="#FBFAF7" />
          <stop offset="1" stopColor="#F2F0EA" />
        </linearGradient>
        <linearGradient id="wf-pen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A4E57" />
          <stop offset=".35" stopColor="#1C1E22" />
          <stop offset="1" stopColor="#0E0F11" />
        </linearGradient>
        <linearGradient id="wf-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2F3F5" />
          <stop offset="1" stopColor="#9EA2AA" />
        </linearGradient>
        <filter id="wf-blur5b">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="190" cy="216" rx="170" ry="9" fill="rgba(20,22,28,.24)" filter="url(#wf-blur5b)" />
      <path d="M26 82 Q108 70 190 80 Q272 70 354 82 L356 214 Q272 204 190 214 Q108 204 24 214 Z" fill="#111728" />
      <path
        d="M26 76 Q108 64 190 74 Q272 64 354 76 L356 208 Q272 198 190 208 Q108 198 24 208 Z"
        fill="url(#wf-cover)"
        filter="url(#wf-soft)"
      />
      {(
        [
          [24, 208, 1],
          [356, 208, -1],
        ] as const
      ).map(([a, u, c]) => (
        <path d={`M${a} ${u} l${c * 10} 0 l${c * -10} -10 z`} fill="url(#wf-gold)" key={a} />
      ))}
      {[4, 3, 2, 1].map((item) => (
        <g key={item}>
          <path
            d={`M${36 - item} ${70 + item} Q110 ${58 + item} 188 ${68 + item} L188 ${198 + item} Q110 ${188 + item} ${36 - item} ${200 + item} Z`}
            fill={item % 2 ? "#E7E4DC" : "#D9D5CB"}
          />
          <path
            d={`M192 ${68 + item} Q270 ${58 + item} ${344 + item} ${70 + item} L${344 + item} ${200 + item} Q270 ${188 + item} 192 ${198 + item} Z`}
            fill={item % 2 ? "#E7E4DC" : "#D9D5CB"}
          />
        </g>
      ))}
      <path d="M36 70 Q110 58 188 68 L188 198 Q110 188 36 200 Z" fill="url(#wf-pageL)" />
      <path d="M192 68 Q270 58 344 70 L344 200 Q270 188 192 198 Z" fill="url(#wf-pageR)" />
      <path d="M182 66 Q190 70 198 66 L198 198 Q190 202 182 198 Z" fill="rgba(60,50,30,.14)" />
      <text x="46" y="81" fontFamily={FONT_MONO} fontSize="5.6" fill="#8D8678" letterSpacing="1">
        REVENUE · SEP
      </text>
      <text x="180" y="80" textAnchor="end" fontFamily={FONT_MONO} fontSize="5" fill="#B0A999">
        p. 41
      </text>
      <path d={leftLink(86)} stroke="#C9C2B2" strokeWidth=".9" fill="none" />
      <line x1="72" x2="72" y1="88" y2="190" stroke="#E7B9B9" strokeWidth=".6" />
      {LEDGER_IN.map(([a, u, c, f], index) => {
        const h = 98 + index * 13;
        return (
          <g key={index}>
            <path d={leftLink(h + 3)} stroke="#E4DFD3" strokeWidth=".6" fill="none" />
            <text x="46" y={h} fontFamily={FONT_MONO} fontSize="5.2" fill="#A39C8D">
              {a}
            </text>
            <text
              x="76"
              y={h}
              fontFamily={FONT_MONO}
              fontSize="5.6"
              fill={f ? "#C24145" : "#4B4F57"}
              textDecoration={f ? "line-through" : undefined}
            >
              {u}
            </text>
            <text
              x="178"
              y={h - 1}
              textAnchor="end"
              fontFamily={FONT_MONO}
              fontSize="6.2"
              fill={f ? "#C24145" : "#26282D"}
            >
              {c}
            </text>
            {!f && (
              <path
                d={`M134 ${h - 3} l1.8 2 l3.6 -4`}
                fill="none"
                stroke="#4A8F6A"
                strokeWidth=".9"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
      <motion.g
        animate={{
          rotate: hot ? -9 : -5,
          y: hot ? -4 : 0,
        }}
        style={{
          originX: "70px",
          originY: "60px",
        }}
        transition={SPRING}
      >
        <g transform="translate(0 -16)">
          <rect x="46" y="44" width="46" height="34" fill="#FFE58A" filter="url(#wf-tight)" />
          <rect x="46" y="44" width="46" height="6" fill="#F6D766" />
          <text x="50" y="58" fontFamily={FONT_MONO} fontSize="5" fill="#7A6420">
            MRR
          </text>
          <path
            d="M50 72 L58 68 L64 70 L72 63 L78 65 L88 56"
            fill="none"
            stroke="#2F6BFF"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="88" y="58" textAnchor="end" fontFamily={FONT_MONO} fontSize="5" fontWeight="700" fill="#2F6BFF">
            +12%
          </text>
        </g>
      </motion.g>
      <text x="204" y="80" fontFamily={FONT_MONO} fontSize="5.6" fill="#8D8678" letterSpacing="1">
        PAYOUTS
      </text>
      <text x="334" y="81" textAnchor="end" fontFamily={FONT_MONO} fontSize="5" fill="#B0A999">
        p. 42
      </text>
      <path d={rightLink(86)} stroke="#C9C2B2" strokeWidth=".9" fill="none" />
      {LEDGER_OUT.map(([a, u, c], index) => {
        const d = 98 + index * 13;
        return (
          <g key={index}>
            <motion.rect
              x="200"
              y={d - 8}
              width="136"
              height="11"
              rx="1.5"
              fill="#E3ECFF"
              animate={{
                opacity: matched === index ? 1 : 0,
              }}
              transition={{
                duration: 0.2,
              }}
            />
            <motion.rect
              x="200"
              y={d - 8}
              width="1.8"
              height="11"
              fill={COLOR.blue}
              animate={{
                opacity: matched === index ? 1 : 0,
              }}
              transition={{
                duration: 0.2,
              }}
            />
            <path d={rightLink(d + 3)} stroke="#E4DFD3" strokeWidth=".6" fill="none" />
            <text x="205" y={d} fontFamily={FONT_MONO} fontSize="5.2" fill="#A39C8D">
              {a}
            </text>
            <text x="232" y={d} fontFamily={FONT_MONO} fontSize="5.6" fill="#4B4F57">
              {u}
            </text>
            <text
              x="332"
              y={d}
              textAnchor="end"
              fontFamily={FONT_MONO}
              fontSize="6.2"
              fontWeight={matched === index ? 700 : 400}
              fill={matched === index ? COLOR.blue : "#26282D"}
            >
              {c}
            </text>
          </g>
        );
      })}
      <line x1="280" x2="334" y1="190" y2="190" stroke="#26282D" strokeWidth=".6" />
      <line x1="280" x2="334" y1="192" y2="192" stroke="#26282D" strokeWidth=".6" />
      <text x="232" y="188" fontFamily={FONT_MONO} fontSize="5.4" fill="#8D8678">
        TOTAL
      </text>
      <text x="332" y="188" textAnchor="end" fontFamily={FONT_MONO} fontSize="6.6" fontWeight="700" fill="#26282D">
        4,970.95
      </text>
      <motion.g
        initial={{
          scale: 1.6,
          opacity: 0,
        }}
        animate={
          on
            ? {
                scale: 1,
                opacity: 0.85,
              }
            : {}
        }
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 18,
          delay: 1,
        }}
        style={{
          originX: "126px",
          originY: "184px",
        }}
      >
        <g transform="translate(-120 8) rotate(-12 246 176)">
          <rect x="214" y="167" width="64" height="17" rx="3" fill="none" stroke={COLOR.blue} strokeWidth="1.4" />
          <rect x="216.5" y="169.5" width="59" height="12" rx="2" fill="none" stroke={COLOR.blue} strokeWidth=".5" />
          <text
            x="246"
            y="178.4"
            textAnchor="middle"
            fontFamily={FONT_MONO}
            fontSize="6.4"
            fontWeight="700"
            fill={COLOR.blue}
            letterSpacing="1"
          >
            RECONCILED
          </text>
        </g>
      </motion.g>
      <path d="M186 70 L194 70 L194 226 L190 220 L186 226 Z" fill="#2F6BFF" />
      <path d="M186 70 L188 70 L188 224 L186 226 Z" fill="#1E54E6" />
      <motion.g
        animate={{
          rotate: hot ? -2 : -7,
          x: hot ? -8 : 0,
          y: hot ? 50 : 54,
        }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 14,
        }}
        style={{
          originX: "300px",
          originY: "150px",
        }}
      >
        <ellipse cx="300" cy="160" rx="62" ry="3" fill="rgba(20,22,28,.25)" filter="url(#wf-blur1)" />
        <rect x="248" y="146" width="96" height="8" rx="4" fill="url(#wf-pen)" />
        <rect x="300" y="146" width="3" height="8" fill="url(#wf-gold)" />
        <rect x="268" y="143.5" width="34" height="2.6" rx="1.3" fill="url(#wf-gold)" />
        <path d="M248 146.5 L234 150 L248 153.5 Z" fill="url(#wf-gold)" />
        <path d="M234 150 L239 150" stroke="#2B2D33" strokeWidth=".7" />
        <rect x="252" y="147.2" width="88" height="1.2" rx=".6" fill="rgba(255,255,255,.35)" />
      </motion.g>
      <motion.g
        initial={{
          y: 26,
        }}
        animate={{
          y: hot ? -12 : on ? 2 : 26,
          rotate: hot ? 4 : 8,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        style={{
          originX: "300px",
          originY: "60px",
        }}
        filter="url(#wf-tight)"
      >
        <path
          d="M274 6 h50 v60 l-3.5 -2.5 -3.5 2.5 -3.5 -2.5 -3.5 2.5 -3.5 -2.5 -3.5 2.5 -3.5 -2.5 -3.5 2.5 -3.5 -2.5 -3.5 2.5 -3.5 -2.5 -3.5 2.5 -3.5 -2.5 z"
          fill="#fff"
        />
        <text x="279" y="16" fontFamily={FONT_MONO} fontSize="4.6" fill="#9EA2AA" letterSpacing=".6">
          RECEIPT · 2841
        </text>
        <text x="279" y="29" fontFamily={FONT_MONO} fontSize="9.5" fontWeight="700" fill="#26282D">
          250.00
        </text>
        <text x="279" y="36" fontFamily={FONT_MONO} fontSize="4.6" fill="#9EA2AA">
          USDC · BASE→ARB
        </text>
        <line x1="279" x2="319" y1="40" y2="40" stroke="#D9DCE1" strokeDasharray="1.5 1.5" />
        {Array.from(
          {
            length: 22,
          },
          (a, index) => (
            <rect x={279 + index * 1.85} y="44" width={index % 3 ? 0.8 : 1.3} height="12" fill="#2B2D33" key={index} />
          ),
        )}
      </motion.g>
    </svg>
  );
}
