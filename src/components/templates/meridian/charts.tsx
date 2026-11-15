"use client";

import { Fragment, useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SHIPPING_ACTIVITY } from "./data";
import type { SeriesPoint } from "./types";
import { MONTHS_SHORT, formatDayDate } from "./dates";
import { useSize, useTweenedValues } from "./hooks";
import { COLORS, SPRING, clamp, formatCompactMoney, sum } from "./theme";

const CURVE_STEPS = 96;

/** Resamples a series to `steps` points along a Catmull-Rom curve, so a line can morph between ranges of any length. */
function smoothCurve(values: number[], steps = CURVE_STEPS) {
  const count = values.length;
  return count < 2
    ? Array(steps).fill(values[0] ?? 0)
    : Array.from(
        {
          length: steps,
        },
        (_, step) => {
          const at = (step / (steps - 1)) * (count - 1);
          const index = Math.min(count - 2, Math.floor(at));
          const t = at - index;
          const p0 = values[Math.max(0, index - 1)];
          const p1 = values[index];
          const p2 = values[index + 1];
          const p3 = values[Math.min(count - 1, index + 2)];
          return (
            0.5 *
            (2 * p1 +
              (-p0 + p2) * t +
              (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
              (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
          );
        },
      );
}

/** A round number a little above `value`, for the top of an axis. */
function niceMax(value: number) {
  if (value <= 0) {
    return 1;
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * magnitude >= value * 1.08) {
      return step * magnitude;
    }
  }
  return 10 * magnitude;
}

/** About `want` evenly spread indexes out of `count`, for axis labels. */
function tickValues(count: number, want: number) {
  if (count <= want) {
    return Array.from(
      {
        length: count,
      },
      (_, index) => index,
    );
  }
  const every = (count - 1) / (want - 1);
  return Array.from(
    {
      length: want,
    },
    (_, index) => Math.round(index * every),
  );
}

type AreaChartProps = {
  data: SeriesPoint[];
  height?: number;
  onHover?: (index: number | null) => void;
  fmtTick?: (value: number) => string;
  label: string;
};

/** This period against the previous one as two smooth lines; the lines morph when the range changes. */
export function AreaChart({ data, height = 248, onHover, fmtTick = formatCompactMoney, label }: AreaChartProps) {
  const [box, { w: width }] = useSize();
  const uid = useId().replace(/:/g, "");
  const current = data.map((point) => point.v);
  const previous = data.map((point) => point.p);
  const top = niceMax(Math.max(...current, ...previous));
  // recomputed only when the data itself changes, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const target = useMemo(() => [...smoothCurve(current), ...smoothCurve(previous), top], [data]);
  const shown = useTweenedValues(
    target,
    target.map((b, i) => (i === 2 * CURVE_STEPS ? b : 0)),
  );
  const max = shown[2 * CURVE_STEPS] || 1;
  const [hover, setHover] = useState<number | null>(null);
  const narrow = width < 520;
  const padLeft = narrow ? 38 : 46;
  const padRight = 6;
  const padTop = 10;
  const padBottom = 28;
  const plotW = Math.max(1, width - padLeft - padRight);
  const plotH = height - padTop - padBottom;
  const xAt = (index: number, count: number) => padLeft + (count <= 1 ? 0 : index / (count - 1)) * plotW;
  const yAt = (value: number) => padTop + plotH - (value / max) * plotH;
  const linePath = (values: number[]) =>
    values.map((value, i) => `${i ? "L" : "M"}${xAt(i, CURVE_STEPS).toFixed(1)} ${yAt(value).toFixed(1)}`).join("");
  const currentPath = linePath(shown.slice(0, CURVE_STEPS));
  const previousPath = linePath(shown.slice(CURVE_STEPS, 2 * CURVE_STEPS));
  const areaPath = `${currentPath}L${xAt(CURVE_STEPS - 1, CURVE_STEPS).toFixed(1)} ${padTop + plotH}L${padLeft} ${padTop + plotH}Z`;
  const onMove = (clientX: number, el: Element) => {
    const rect = el.getBoundingClientRect();
    const index = Math.round(clamp((clientX - rect.left - padLeft) / plotW) * (data.length - 1));
    if (index !== hover) {
      setHover(index);
      onHover?.(index);
    }
  };
  const onLeave = () => {
    setHover(null);
    onHover?.(null);
  };
  // new data clears the hover readout
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHover(null);
  }, [data]);
  const ticks = tickValues(data.length, narrow ? 4 : data.length > 12 ? 7 : data.length);
  const hoverX = hover != null ? xAt(hover, data.length) : 0;
  return (
    <div
      ref={box}
      className="relative w-full select-none"
      style={{
        height,
        touchAction: "pan-y",
      }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="block overflow-visible"
          role="img"
          aria-label={label}
          onPointerMove={(event) => onMove(event.clientX, event.currentTarget)}
          onPointerDown={(event) => onMove(event.clientX, event.currentTarget)}
          onPointerLeave={onLeave}
          onPointerCancel={onLeave}
        >
          <defs>
            <linearGradient id={`${uid}a`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                style={{
                  stopColor: "var(--accent)",
                  stopOpacity: 0.28,
                }}
              />
              <stop
                offset="1"
                style={{
                  stopColor: "var(--accent)",
                  stopOpacity: 0,
                }}
              />
            </linearGradient>
            <clipPath id={`${uid}c`}>
              <rect x={padLeft} y={0} width={plotW} height={height} />
            </clipPath>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((b, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                x2={padLeft + plotW}
                y1={yAt(b * max)}
                y2={yAt(b * max)}
                style={{
                  stroke: i === 0 ? "var(--line2)" : "var(--line)",
                }}
                strokeDasharray={i === 0 ? undefined : "2 4"}
              />
              <text
                x={padLeft - 10}
                y={yAt(b * max) + 4}
                textAnchor="end"
                fontSize="11"
                style={{
                  fill: "var(--soft)",
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {fmtTick(b * top)}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${uid}c)`}>
            <path
              d={previousPath}
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              style={{
                stroke: "var(--soft)",
                opacity: 0.55,
              }}
            />
            <path
              d={areaPath}
              style={{
                fill: `url(#${uid}a)`,
              }}
            />
            <path
              d={currentPath}
              fill="none"
              strokeWidth="2"
              strokeLinejoin="round"
              style={{
                stroke: "var(--accent)",
              }}
            />
          </g>
          {ticks.map((tick) => (
            <text
              key={`${data.length}-${tick}`}
              x={clamp(xAt(tick, data.length), padLeft + 14, padLeft + plotW - 14)}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              style={{
                fill: "var(--soft)",
                opacity: hover == null ? 1 : 0.35,
                transition: "opacity .2s",
              }}
            >
              {data[tick].l}
            </text>
          ))}
          <AnimatePresence>
            {hover != null && (
              <motion.g
                key="x"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.15,
                }}
              >
                <motion.line
                  initial={false}
                  animate={{
                    x1: hoverX,
                    x2: hoverX,
                  }}
                  transition={SPRING}
                  y1={padTop}
                  y2={padTop + plotH}
                  strokeWidth="1"
                  style={{
                    stroke: "var(--ink)",
                    opacity: 0.25,
                  }}
                />
                <motion.circle
                  initial={false}
                  animate={{
                    cx: hoverX,
                    cy: yAt(data[hover].p),
                  }}
                  transition={SPRING}
                  r="3"
                  style={{
                    fill: "var(--card)",
                    stroke: "var(--soft)",
                  }}
                  strokeWidth="1.5"
                />
                <motion.circle
                  initial={false}
                  animate={{
                    cx: hoverX,
                    cy: yAt(data[hover].v),
                  }}
                  transition={SPRING}
                  r="5"
                  strokeWidth="2.5"
                  style={{
                    fill: "var(--accent)",
                    stroke: "var(--card)",
                  }}
                />
                <motion.g
                  initial={false}
                  animate={{
                    x: clamp(hoverX, padLeft + 30, padLeft + plotW - 30),
                  }}
                  transition={SPRING}
                >
                  <rect
                    x={-30}
                    y={height - 22}
                    width={60}
                    height={20}
                    rx={6}
                    style={{
                      fill: "var(--ink)",
                    }}
                  />
                  <text
                    x={0}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="550"
                    style={{
                      fill: "var(--card)",
                    }}
                  >
                    {data[hover].l}
                  </text>
                </motion.g>
              </motion.g>
            )}
          </AnimatePresence>
          <rect x={padLeft} y={0} width={plotW} height={height} fill="transparent" />
        </svg>
      )}
    </div>
  );
}

/** A bar from the baseline y0 with its far corners rounded, growing up for positive h and down for negative. */
function barPath(x: number, y0: number, w: number, h: number) {
  const radius = Math.min(4, Math.abs(h), w / 2);
  const dir = h >= 0 ? -1 : 1;
  const top = y0 + dir * Math.abs(h);
  return `M${x} ${y0}L${x} ${top - dir * radius}Q${x} ${top} ${x + radius} ${top}L${x + w - radius} ${top}Q${x + w} ${top} ${x + w} ${top - dir * radius}L${x + w} ${y0}Z`;
}

type BarProps = { x: number; y0: number; w: number; h: number; delay: number; dim: boolean; neg: boolean };

function Bar({ x, y0, w, h, delay, dim, neg }: BarProps) {
  const [tx, tw, th] = useTweenedValues([x, w, h], [x, w, 0], delay);
  return (
    <path
      d={barPath(tx, y0, Math.max(0, tw), th)}
      style={{
        fill: neg ? "var(--soft)" : "var(--accent)",
        opacity: dim ? 0.32 : 1,
        transition: "opacity .15s",
      }}
    />
  );
}

type BarChartProps = {
  data: SeriesPoint[];
  /** Changing it clears the hover (a new range or a new task). */
  rangeKey: string;
  height?: number;
  onHover?: (index: number | null) => void;
  label: string;
};

/** Bars that grow from a zero line, negative ones downward, with a hover readout. */
export function BarChart({ data, rangeKey, height = 196, onHover, label }: BarChartProps) {
  const [box, { w: width }] = useSize();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const values = data.map((point) => point.v);
  const max = niceMax(Math.max(...values, 1));
  const min = Math.min(0, ...values) < 0 ? -niceMax(-Math.min(...values)) * 0.9 : 0;
  const padTop = 8;
  const padBottom = 24;
  const plotH = height - padTop - padBottom;
  const zeroY = ((point) => padTop + ((max - point) / (max - min)) * plotH)(0);
  const count = data.length;
  const slot = width / count;
  const barW = Math.min(slot * 0.58, 30);
  const gap = slot < 28 ? 2 : 1;
  const onKey = (index: number | null) => {
    setHover(index);
    onHover?.(index);
  };
  // a new range clears the hover readout
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHover(null);
  }, [rangeKey]);
  return (
    <div
      ref={box}
      className="relative w-full select-none"
      style={{
        height,
        touchAction: "pan-y",
      }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label={label}
          onPointerLeave={() => onKey(null)}
        >
          <line
            x1={0}
            x2={width}
            y1={zeroY}
            y2={zeroY}
            style={{
              stroke: "var(--line2)",
            }}
          />
          {data.map((point, i) => {
            const barX = i * slot + (slot - barW) / 2;
            const barH = (Math.abs(point.v) / (max - min)) * plotH * (point.v < 0 ? -1 : 1);
            return (
              <Bar
                key={i}
                x={barX}
                y0={zeroY}
                w={barW}
                h={barH}
                delay={reduce ? 0 : 0.04 + i * 0.025}
                dim={hover != null && hover !== i}
                neg={point.v < 0}
              />
            );
          })}
          {data.map(
            (point, i) =>
              (i % gap === 0 || i === hover) && (
                <text
                  key={`${rangeKey}-t${i}`}
                  x={i * slot + slot / 2}
                  y={height - 7}
                  textAnchor="middle"
                  fontSize="11"
                  style={{
                    fill: i === hover ? "var(--ink)" : "var(--soft)",
                    fontWeight: i === hover ? 600 : 400,
                  }}
                >
                  {point.l}
                </text>
              ),
          )}
          {data.map((point, i) => (
            <rect
              key={`h${i}`}
              x={i * slot}
              y={0}
              width={slot}
              height={height}
              fill="transparent"
              onPointerEnter={() => onKey(i)}
              onPointerDown={() => onKey(i)}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

export function Sparkline({
  vals,
  w: width = 96,
  h: height = 30,
  rangeKey,
}: {
  vals: number[];
  w?: number;
  h?: number;
  rangeKey: string;
}) {
  const uid = useId().replace(/:/g, "");
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const normalised = useMemo(
    () =>
      smoothCurve(
        vals.map((val) => (val - min) / span),
        40,
      ),
    // the line morphs only when the range changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeKey],
  );
  const points = useTweenedValues(
    normalised,
    normalised.map(() => 0.5),
  ).map((h, i) => [(i / 39) * width, 3 + (1 - h) * (height - 6)]);
  const path = points.map(([h, x], i) => `${i ? "L" : "M"}${h.toFixed(1)} ${x.toFixed(1)}`).join("");
  return (
    <svg width={width} height={height} aria-hidden={true} className="block overflow-visible">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            style={{
              stopColor: "var(--accent)",
              stopOpacity: 0.22,
            }}
          />
          <stop
            offset="1"
            style={{
              stopColor: "var(--accent)",
              stopOpacity: 0,
            }}
          />
        </linearGradient>
      </defs>
      <path
        d={`${path}L${width} ${height}L0 ${height}Z`}
        style={{
          fill: `url(#${uid})`,
        }}
      />
      <path
        d={path}
        fill="none"
        strokeWidth="1.5"
        style={{
          stroke: "var(--accent)",
        }}
      />
      <circle
        cx={points[39][0]}
        cy={points[39][1]}
        r="2.5"
        style={{
          fill: "var(--accent)",
        }}
      />
    </svg>
  );
}

const heatLevel = (count: number) => (count === 0 ? 0 : count < 4 ? 1 : count < 8 ? 2 : count < 12 ? 3 : 4);

const HEAT_STEPS = [0, 30, 52, 76, 100];

export const heatColor = (level: number) =>
  level === 0 ? "var(--heat0)" : `color-mix(in srgb, var(--accent) ${HEAT_STEPS[level]}%, var(--heat0))`;

/** Half a year of releases, a square per day, coloured by how many shipped. */
export function Heatmap({ onHover }: { onHover: (index: number | null) => void }) {
  const [box, { w: width }] = useSize();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const gap = 3;
  const labelW = 28;
  const headerH = 18;
  let weeks = 26;
  let cell = Math.floor((width - labelW - gap * (weeks - 1)) / weeks);
  if (cell < 11) {
    weeks = Math.max(8, Math.floor((width - labelW + gap) / (12 + gap)));
    cell = Math.floor((width - labelW - gap * (weeks - 1)) / weeks);
  }
  cell = Math.min(cell, 24);
  const skip = (26 - weeks) * 7;
  const days = SHIPPING_ACTIVITY.days.slice(skip);
  const height = headerH + 7 * cell + 6 * gap;
  const onKey = (index: number | null) => {
    setHover(index);
    onHover(index == null ? null : index + skip);
  };
  const months = [];
  for (let p = 0; p < weeks; p++) {
    const first = days[p * 7].d;
    const prevMonth = p ? days[(p - 1) * 7].d.getMonth() : -1;
    if (first.getMonth() !== prevMonth && (p > 0 || first.getDate() < 8)) {
      months.push({
        x: labelW + p * (cell + gap),
        l: MONTHS_SHORT[first.getMonth()],
      });
    }
  }
  const day = hover != null ? days[hover] : null;
  const col = hover != null ? Math.floor(hover / 7) : 0;
  const row = hover != null ? hover % 7 : 0;
  return (
    <div
      ref={box}
      className="relative w-full select-none"
      style={{
        height: height || 160,
      }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label={`Pull requests merged per day, last ${weeks} weeks`}
          onPointerLeave={() => onKey(null)}
        >
          {months.map((month) => (
            <text
              key={month.x}
              x={month.x}
              y={11}
              fontSize="11"
              style={{
                fill: "var(--soft)",
              }}
            >
              {month.l}
            </text>
          ))}
          {["Mon", "", "Wed", "", "Fri", "", ""].map(
            (p, i) =>
              p && (
                <text
                  key={p}
                  x={0}
                  y={headerH + i * (cell + gap) + cell / 2 + 4}
                  fontSize="10.5"
                  style={{
                    fill: "var(--soft)",
                  }}
                >
                  {p}
                </text>
              ),
          )}
          {days.map((item, i) => {
            const S = Math.floor(i / 7);
            const N = i % 7;
            return item.future ? (
              <rect
                key={i}
                x={labelW + S * (cell + gap)}
                y={headerH + N * (cell + gap)}
                width={cell}
                height={cell}
                rx={Math.min(5, cell * 0.28)}
                fill="none"
                strokeDasharray="2 2"
                style={{
                  stroke: "var(--line2)",
                }}
              />
            ) : (
              <motion.rect
                key={i}
                x={labelW + S * (cell + gap)}
                y={headerH + N * (cell + gap)}
                width={cell}
                height={cell}
                rx={Math.min(5, cell * 0.28)}
                initial={
                  reduce
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.3,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: hover === i ? 1.18 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                  delay: hover == null ? S * 0.014 + N * 0.01 : 0,
                }}
                style={{
                  fill: heatColor(heatLevel(item.v)),
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  stroke: hover === i ? "var(--ink)" : "transparent",
                  strokeWidth: 1.5,
                }}
                onPointerEnter={() => onKey(i)}
                onPointerDown={() => onKey(i)}
              />
            );
          })}
        </svg>
      )}
      <AnimatePresence>
        {day && (
          <motion.div
            key="tip"
            initial={{
              opacity: 0,
              y: 4,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: clamp(labelW + col * (cell + gap) + cell / 2 - 70, 0, width - 140),
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              ...SPRING,
              opacity: {
                duration: 0.12,
              },
            }}
            className="pointer-events-none absolute left-0 z-10 w-[140px] rounded-[10px] px-2.5 py-1.5 text-[12px]"
            style={{
              top: headerH + row * (cell + gap) - 50,
              background: COLORS.ink,
              color: COLORS.card,
              boxShadow: "0 8px 20px -8px rgba(0,0,0,.5)",
            }}
          >
            <div className="font-[600]">
              {day.v}
              {" pull request"}
              {day.v === 1 ? "" : "s"}
            </div>
            <div
              style={{
                opacity: 0.7,
              }}
            >
              {formatDayDate(day.d)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A budget line: what was spent of what was planned. */
export type BudgetItem = { name: string; v: number; of: number; color: string };

/** Concentric rings, one per budget line, each filled to the share spent. */
export function Donut({
  items,
  size = 196,
  hover,
  setHover,
}: {
  items: BudgetItem[];
  size?: number;
  hover: number | null;
  setHover: (index: number | null) => void;
}) {
  const reduce = useReducedMotion();
  const stroke = 12;
  const gap = 5;
  const center = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block shrink-0"
      role="img"
      aria-label="Budget used by category"
      onPointerLeave={() => setHover(null)}
    >
      {items.map((item, i) => {
        const radius = center - stroke / 2 - i * (stroke + gap);
        const share = clamp(item.v / item.of);
        const dim = hover != null && hover !== i;
        return (
          <g
            key={item.name}
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              opacity: dim ? 0.3 : 1,
              transition: "opacity .2s",
            }}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              style={{
                stroke: `color-mix(in srgb, ${item.color} 15%, transparent)`,
              }}
            />
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{
                stroke: item.color,
              }}
              initial={{
                pathLength: reduce ? share : 0,
              }}
              animate={{
                pathLength: share,
              }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 16,
                delay: 0.1 + i * 0.08,
              }}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={stroke + gap}
              stroke="transparent"
              style={{
                pointerEvents: "stroke",
                cursor: "pointer",
              }}
              onPointerEnter={() => setHover(i)}
              onPointerDown={() => setHover(i)}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** One side of the cash flow: an income source or a spending category. */
export type FlowItem = { name: string; v: number; color?: string };
/** A highlighted item on one side of the flow. */
export type FlowHover = { side: "src" | "use"; i: number };

/** Income sources on the left flowing through a single bar into spending on the right, as ribbons. */
export function CashFlowSankey({
  src,
  use,
  hover,
  setHover,
  height = 300,
}: {
  src: FlowItem[];
  use: FlowItem[];
  hover: FlowHover | null;
  setHover: (hover: FlowHover | null) => void;
  height?: number;
}) {
  const [box, { w: width }] = useSize();
  const values = useTweenedValues([...src.map((item) => item.v), ...use.map((item) => item.v)]);
  const srcValues = values.slice(0, src.length);
  const useValues = values.slice(src.length);
  const total = sum(srcValues);
  const wide = width > 600;
  const leftLabel = wide ? 118 : 0;
  const rightLabel = wide ? 132 : 0;
  const barW = 10;
  const gap = 10;
  const pad = 4;
  const innerH = height - pad * 2;
  const scale = (innerH - gap * (Math.max(src.length, use.length) - 1)) / total;
  const leftX = leftLabel;
  const midX = leftLabel + (width - leftLabel - rightLabel) / 2 - barW / 2;
  const rightX = width - rightLabel - barW;
  const stack = (values: number[]) => {
    const height = sum(values) * scale + gap * (values.length - 1);
    let y = pad + (innerH - height) / 2;
    return values.map((value) => {
      const top = y;
      y += value * scale + gap;
      return [top, top + value * scale];
    });
  };
  const srcStack = stack(srcValues);
  const useStack = stack(useValues);
  const midTop = pad + (innerH - total * scale) / 2;
  const ribbon = (x0: number, y0a: number, y0b: number, x1: number, y1a: number, y1b: number) => {
    const mid = (x0 + x1) / 2;
    return `M${x0} ${y0a}C${mid} ${y0a} ${mid} ${y1a} ${x1} ${y1a}L${x1} ${y1b}C${mid} ${y1b} ${mid} ${y0b} ${x0} ${y0b}Z`;
  };
  // each source's ribbon lands on the next slice of the middle bar, and each use leaves from the next slice
  const srcRibbons: string[] = [];
  const useRibbons: string[] = [];
  for (let i = 0, top = midTop; i < srcValues.length; i++) {
    const bottom = top + srcValues[i] * scale;
    srcRibbons.push(ribbon(leftX + barW, srcStack[i][0], srcStack[i][1], midX, top, bottom));
    top = bottom;
  }
  for (let i = 0, top = midTop; i < useValues.length; i++) {
    const bottom = top + useValues[i] * scale;
    useRibbons.push(ribbon(midX + barW, top, bottom, rightX, useStack[i][0], useStack[i][1]));
    top = bottom;
  }
  const spreadLabels = (ys: number[]) => {
    const out = ys.slice();
    const minGap = 31;
    out[0] = Math.max(out[0], 16);
    for (let index = 1; index < out.length; index++) {
      out[index] = Math.max(out[index], out[index - 1] + minGap);
    }
    const maxY = height - 16;
    if (out[out.length - 1] > maxY) {
      out[out.length - 1] = maxY;
      for (let index = out.length - 2; index >= 0; index--) {
        out[index] = Math.min(out[index], out[index + 1] - minGap);
      }
    }
    return out;
  };
  const srcLabelY = spreadLabels(srcStack.map(([top, bottom]) => (top + bottom) / 2));
  const useLabelY = spreadLabels(useStack.map(([top, bottom]) => (top + bottom) / 2));
  const lit = (side: FlowHover["side"], index: number) => hover == null || (hover.side === side && hover.i === index);
  const label = (x: number, y: number, anchor: "start" | "end", name: string, value: number, on: boolean) => (
    <g
      transform={`translate(0 ${y})`}
      style={{
        opacity: on ? 1 : 0.35,
        transition: "opacity .2s",
      }}
    >
      <text
        x={x}
        y={-2}
        textAnchor={anchor}
        fontSize="12"
        fontWeight="550"
        className={wide ? "" : "md-halo"}
        style={{
          fill: "var(--ink)",
        }}
      >
        {name}
      </text>
      <text
        x={x}
        y={13}
        textAnchor={anchor}
        fontSize="11.5"
        className={wide ? "" : "md-halo"}
        style={{
          fill: "var(--soft)",
          fontFeatureSettings: '"tnum"',
        }}
      >
        {formatCompactMoney(value)}
      </text>
    </g>
  );
  return (
    <div
      ref={box}
      className="relative w-full select-none"
      style={{
        height,
      }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="block overflow-visible"
          role="img"
          aria-label="Cash flow from income sources to spending categories"
          onPointerLeave={() => setHover(null)}
        >
          {srcRibbons.map((srcRibbon, i) => (
            <path
              key={`l${i}`}
              d={srcRibbon}
              style={{
                fill: "var(--vneutral)",
                cursor: "pointer",
                opacity: lit("src", i) ? (hover ? 0.75 : 0.45) : 0.12,
                transition: "opacity .2s",
              }}
              onPointerEnter={() =>
                setHover({
                  side: "src",
                  i,
                })
              }
              onPointerDown={() =>
                setHover({
                  side: "src",
                  i,
                })
              }
            />
          ))}
          {useRibbons.map((useRibbon, i) => (
            <path
              key={`r${i}`}
              d={useRibbon}
              style={{
                fill: use[i].color,
                cursor: "pointer",
                opacity: lit("use", i) ? (hover ? 0.62 : 0.3) : 0.08,
                transition: "opacity .2s",
              }}
              onPointerEnter={() =>
                setHover({
                  side: "use",
                  i,
                })
              }
              onPointerDown={() =>
                setHover({
                  side: "use",
                  i,
                })
              }
            />
          ))}
          {srcStack.map(([top, bottom], i) => (
            <rect
              key={`nl${i}`}
              x={leftX}
              width={barW}
              rx={3}
              y={top}
              height={bottom - top}
              style={{
                fill: "var(--ink)",
                opacity: lit("src", i) ? 1 : 0.35,
                transition: "opacity .2s",
              }}
            />
          ))}
          <rect
            x={midX}
            width={barW}
            rx={3}
            y={midTop}
            height={total * scale}
            style={{
              fill: "var(--ink)",
            }}
          />
          {useStack.map(([top, bottom], i) => (
            <rect
              key={`nr${i}`}
              x={rightX}
              width={barW}
              rx={3}
              y={top}
              height={Math.max(2, bottom - top)}
              style={{
                fill: use[i].color,
                opacity: lit("use", i) ? 1 : 0.35,
                transition: "opacity .2s",
              }}
            />
          ))}
          {src.map((item, i) => (
            <Fragment key={`ls${i}`}>
              {label(
                wide ? leftX - 12 : leftX + barW + 8,
                srcLabelY[i],
                wide ? "end" : "start",
                item.name,
                srcValues[i],
                lit("src", i),
              )}
            </Fragment>
          ))}
          {use.map((item, i) => (
            <Fragment key={`lu${i}`}>
              {label(
                wide ? rightX + barW + 12 : rightX - 8,
                useLabelY[i],
                wide ? "start" : "end",
                item.name,
                useValues[i],
                lit("use", i),
              )}
            </Fragment>
          ))}
          <g
            style={{
              opacity: hover ? 0.3 : 1,
              transition: "opacity .2s",
            }}
          >
            <text
              x={midX + barW / 2}
              y={midTop - 10}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              className="md-halo"
              style={{
                fill: "var(--ink)",
              }}
            >
              Income
            </text>
          </g>
        </svg>
      )}
    </div>
  );
}
