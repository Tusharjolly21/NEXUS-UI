"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { COLOR, FONT_DISPLAY, INK, r2 } from "./theme";
/** A star as an SVG path: centre, outer and inner radius, number of points. */
export function starPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points = 5,
) {
  let d = "";
  for (let corner = 0; corner < points * 2; corner++) {
    const angle = -Math.PI / 2 + (corner * Math.PI) / points;
    const radius = corner % 2 ? inner : outer;
    d += `${corner ? "L" : "M"}${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`;
  }
  return d + "Z";
}
export const HEART_PATH =
  "M50 88 C20 68 7 52 7 35 C7 20 18 10 32 10 C40 10 46 14 50 21 C54 14 60 10 68 10 C82 10 93 20 93 35 C93 52 80 68 50 88Z";
export const BOLT_PATH = "M60 5 L20 57 H46 L36 95 L82 39 H56 Z";
export const SPARK_PATH =
  "M50 5 C54 36 64 46 95 50 C64 54 54 64 50 95 C46 64 36 54 5 50 C36 46 46 36 50 5Z";
export const BUBBLE_PATH =
  "M14 14 H86 Q94 14 94 22 V58 Q94 66 86 66 H44 L24 86 L28 66 H14 Q6 66 6 58 V22 Q6 14 14 14Z";
/** A sticker drawing: its viewBox, its silhouette (drawn thick in white for the die-cut edge) and its art. */
type DoodleDef = {
  vb: string;
  sil: ReactNode;
  art: ReactNode;
};

/** The sticker sheet: hand-drawn doodles used all over the page. */
export const DOODLES = {
  smiley: {
    vb: "0 0 100 100",
    sil: <circle cx="50" cy="50" r="42" />,
    art: (
      <Fragment>
        <circle
          cx="50"
          cy="50"
          r="42"
          fill={COLOR.sun}
          stroke={INK}
          strokeWidth="3.5"
        />
        <ellipse cx="37" cy="42" rx="4.5" ry="7" fill={INK} />
        <ellipse cx="63" cy="42" rx="4.5" ry="7" fill={INK} />
        <path
          d="M31 58 Q50 78 69 58"
          fill="none"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="27" cy="58" r="6" fill={COLOR.pink} opacity=".45" />
        <circle cx="73" cy="58" r="6" fill={COLOR.pink} opacity=".45" />
      </Fragment>
    ),
  },
  heart: {
    vb: "0 0 100 100",
    sil: <path d={HEART_PATH} />,
    art: (
      <Fragment>
        <path
          d={HEART_PATH}
          fill={COLOR.pink}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 34 Q23 22 34 20"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".85"
        />
      </Fragment>
    ),
  },
  star: {
    vb: "0 0 100 100",
    sil: <path d={starPath(50, 53, 46, 21)} strokeLinejoin="round" />,
    art: (
      <Fragment>
        <path
          d={starPath(50, 53, 46, 21)}
          fill={COLOR.sun}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d={starPath(50, 53, 30, 14)} fill="#fff" opacity=".25" />
      </Fragment>
    ),
  },
  bolt: {
    vb: "0 0 100 100",
    sil: <path d={BOLT_PATH} strokeLinejoin="round" />,
    art: (
      <Fragment>
        <path
          d={BOLT_PATH}
          fill={COLOR.sun}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M56 39 H82 L36 95 Z" fill="#C9A400" opacity=".45" />
        <path
          d="M54 14 L30 50"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity=".8"
        />
      </Fragment>
    ),
  },
  spark: {
    vb: "0 0 100 100",
    sil: <path d={SPARK_PATH} />,
    art: (
      <Fragment>
        <path
          d={SPARK_PATH}
          fill={COLOR.lilac}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="7" fill="#fff" opacity=".7" />
      </Fragment>
    ),
  },
  rainbow: {
    vb: "0 0 120 84",
    sil: (
      <Fragment>
        <path d="M10 66 A50 50 0 0 1 110 66 Z" />
        <circle cx="18" cy="66" r="15" />
        <circle cx="102" cy="66" r="15" />
      </Fragment>
    ),
    art: (
      <Fragment>
        {(
          [
            [COLOR.pink, 46],
            [COLOR.orange, 38],
            [COLOR.sun, 30],
            [COLOR.green, 22],
            [COLOR.sky, 14],
          ] as const
        ).map(([color, radius]) => (
          <path
            d={`M${60 - radius} 66 A${radius} ${radius} 0 0 1 ${60 + radius} 66`}
            fill="none"
            stroke={color}
            strokeWidth="8.5"
            key={radius}
          />
        ))}
        <path
          d="M14 66 A46 46 0 0 1 106 66"
          fill="none"
          stroke={INK}
          strokeWidth="2.5"
        />
        {[18, 102].map((item) => (
          <g key={item}>
            <circle
              cx={item - 8}
              cy="70"
              r="9"
              fill="#DDF0FF"
              stroke={INK}
              strokeWidth="2.5"
            />
            <circle
              cx={item + 6}
              cy="66"
              r="11"
              fill="#DDF0FF"
              stroke={INK}
              strokeWidth="2.5"
            />
            <rect x={item - 14} y="70" width="28" height="9" fill="#DDF0FF" />
            <path
              d={`M${item - 17} 79 H${item + 17}`}
              stroke={INK}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        ))}
      </Fragment>
    ),
  },
  sun: {
    vb: "0 0 100 100",
    sil: <circle cx="50" cy="50" r="47" />,
    art: (
      <Fragment>
        {Array.from(
          {
            length: 10,
          },
          (_, index) => {
            const angle = (index / 10) * Math.PI * 2;
            return (
              <path
                d={`M${r2(50 + Math.cos(angle - 0.16) * 30)} ${r2(50 + Math.sin(angle - 0.16) * 30)} L${r2(50 + Math.cos(angle) * 46)} ${r2(50 + Math.sin(angle) * 46)} L${r2(50 + Math.cos(angle + 0.16) * 30)} ${r2(50 + Math.sin(angle + 0.16) * 30)}Z`}
                fill={COLOR.orange}
                stroke={INK}
                strokeWidth="2.5"
                strokeLinejoin="round"
                key={index}
              />
            );
          },
        )}
        <circle
          cx="50"
          cy="50"
          r="28"
          fill={COLOR.sun}
          stroke={INK}
          strokeWidth="3.5"
        />
        <path
          d="M40 48 q3 -5 6 0 M54 48 q3 -5 6 0"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M41 57 Q50 66 59 57"
          fill="none"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </Fragment>
    ),
  },
  wow: {
    vb: "0 0 100 100",
    sil: <path d={BUBBLE_PATH} strokeLinejoin="round" />,
    art: (
      <Fragment>
        <path
          d={BUBBLE_PATH}
          fill={COLOR.orange}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="52"
          textAnchor="middle"
          fontFamily={FONT_DISPLAY}
          fontSize="30"
          fill="#fff"
          stroke={INK}
          strokeWidth="1.2"
        >
          WOW!
        </text>
      </Fragment>
    ),
  },
  cloud: {
    vb: "0 0 120 80",
    sil: (
      <Fragment>
        <circle cx="38" cy="46" r="24" />
        <circle cx="66" cy="34" r="28" />
        <circle cx="92" cy="50" r="20" />
        <rect x="20" y="46" width="88" height="26" rx="13" />
      </Fragment>
    ),
    art: (
      <Fragment>
        <g fill="#fff" stroke={INK} strokeWidth="3">
          <circle cx="38" cy="46" r="24" />
          <circle cx="66" cy="34" r="28" />
          <circle cx="92" cy="50" r="20" />
          <rect x="20" y="46" width="88" height="26" rx="13" />
        </g>
        <g fill="#fff">
          <circle cx="38" cy="47" r="21.5" />
          <circle cx="66" cy="35" r="25.5" />
          <circle cx="92" cy="51" r="17.5" />
          <rect x="22" y="47" width="84" height="22.5" rx="11" />
        </g>
        <path
          d="M50 52 q4 4 8 0 M70 52 q4 4 8 0"
          fill="none"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="46" cy="58" r="4" fill={COLOR.pink} opacity=".5" />
        <circle cx="84" cy="58" r="4" fill={COLOR.pink} opacity=".5" />
      </Fragment>
    ),
  },
  flower: {
    vb: "0 0 100 100",
    sil: <circle cx="50" cy="50" r="46" />,
    art: (
      <Fragment>
        {Array.from(
          {
            length: 6,
          },
          (_, index) => {
            const angle = (index / 6) * Math.PI * 2;
            return (
              <circle
                cx={r2(50 + Math.cos(angle) * 25)}
                cy={r2(50 + Math.sin(angle) * 25)}
                r="19"
                fill={COLOR.lilac}
                stroke={INK}
                strokeWidth="3"
                key={index}
              />
            );
          },
        )}
        <circle
          cx="50"
          cy="50"
          r="17"
          fill={COLOR.sun}
          stroke={INK}
          strokeWidth="3"
        />
        <circle cx="45" cy="47" r="2.6" fill={INK} />
        <circle cx="55" cy="47" r="2.6" fill={INK} />
        <path
          d="M45 55 q5 4 10 0"
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </Fragment>
    ),
  },
} satisfies Record<string, DoodleDef>;
export type DoodleName = keyof typeof DOODLES;

/** One doodle from the sticker sheet, with a white die-cut edge and a soft shadow. */
export function Doodle({
  name,
  size = 80,
  className = "",
  style,
}: {
  name: DoodleName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const doodle = DOODLES[name];
  const [, , width, height] = doodle.vb.split(" ").map(Number);
  return (
    <svg
      viewBox={`-8 -8 ${width + 16} ${height + 16}`}
      width={size}
      height={(size * (height + 16)) / (width + 16)}
      aria-hidden={true}
      className={`block select-none ${className}`}
      style={{
        filter: "drop-shadow(0 7px 10px rgba(11,18,51,.22))",
        overflow: "visible",
        ...style,
      }}
    >
      <g fill="#fff" stroke="#fff" strokeWidth="13" strokeLinejoin="round">
        {doodle.sil}
      </g>
      {doodle.art}
    </svg>
  );
}
export const isDoodle = (word: string): word is DoodleName => word in DOODLES;
