"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { REGIONS, ZONES, ZONE_STATS, type Zone } from "./data";
import { Landscape } from "./landscape";
import { DARK, EASE, FONT_MONO, FONT_SANS, LIGHT, clamp, formatNumber } from "./theme";
import { AnimatedNumber, Avatar, Icon, LogoMark, Rover, useLiveInView } from "./ui";

const RANGES = ["1h", "24h", "7d"];

/** A smooth, repeatable random walk between 0.12 and 0.92. */
function seededSeries(seed: number, count = 28) {
  const values = [];
  let value = 0.5;
  for (let step = 0; step < count; step++) {
    const noise = Math.sin(seed * 12.9898 + step * 78.233) * 43758.5453;
    value = clamp(value + (noise - Math.floor(noise) - 0.5) * 0.34, 0.12, 0.92);
    values.push(value);
  }
  return values;
}

function sparklinePath(values: number[], width: number, height: number) {
  const points = values.map((value, i) => [(i / (values.length - 1)) * width, height - value * height]);
  let path = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const midX = (x0 + x1) / 2;
    path += ` C${midX.toFixed(1)} ${y0.toFixed(1)} ${midX.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return path;
}

const SAMPLE_REQUESTS: [method: string, path: string, region: string, ms: number, ttft: number][] = [
  ["POST", "/v1/chat/completions", "fra", 212, 27],
  ["POST", "/v1/embeddings", "iad", 64, 12],
  ["POST", "/v1/chat/completions", "nrt", 388, 39],
  ["POST", "/v1/chat/completions", "bom", 145, 44],
  ["POST", "/v1/rerank", "lhr", 40, 9],
  ["POST", "/v1/chat/completions", "pdx", 501, 35],
  ["POST", "/v1/audio/transcriptions", "sin", 0, 120],
  ["POST", "/v1/chat/completions", "gru", 176, 47],
];

function ConsoleSidebar() {
  const items: [icon: string, label: string, badge?: number][] = [
    ["ph:terminal-window", "Playground"],
    ["ph:rocket-launch", "Endpoints"],
    ["ph:cube", "Models"],
    ["ph:list-bullets", "Logs", 4],
    ["ph:chart-bar", "Usage"],
    ["ph:database", "Datasets"],
  ];
  return (
    <aside
      className="hidden w-[208px] shrink-0 flex-col border-r p-3 md:flex"
      style={{
        borderColor: LIGHT.line,
        background: LIGHT.panel,
      }}
    >
      <div className="flex items-center gap-2 px-1">
        <span
          className="grid size-8 place-items-center rounded-lg"
          style={{
            background: LIGHT.ink,
            color: "#fff",
          }}
        >
          <LogoMark size={17} />
        </span>
        <span className="leading-tight">
          <b
            className="block text-[13px] font-[600]"
            style={{
              color: LIGHT.ink,
            }}
          >
            Outpost
          </b>
          <span
            className="text-[11px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            Northwind Docs
          </span>
        </span>
      </div>
      <div
        className="mt-3 flex h-8 items-center gap-2 rounded-lg border bg-white px-2.5 text-[12px]"
        style={{
          borderColor: LIGHT.line,
          color: LIGHT.soft,
        }}
      >
        <Icon name="ph:magnifying-glass" size={13} />
        Search
        <kbd
          className="ml-auto rounded px-1 text-[10px]"
          style={{
            background: LIGHT.panel,
            fontFamily: FONT_MONO,
          }}
        >
          ⌘K
        </kbd>
      </div>
      <p
        className="mb-1 mt-4 px-2 text-[11px]"
        style={{
          color: LIGHT.soft,
        }}
      >
        Main
      </p>
      {items.map(([icon, label, badge]) => (
        <span
          key={label}
          className="flex h-8 items-center gap-2.5 rounded-lg px-2 text-[12.5px]"
          style={
            label === "Endpoints"
              ? {
                  background: LIGHT.ink,
                  color: "#fff",
                }
              : {
                  color: LIGHT.text,
                }
          }
        >
          <Icon name={icon} size={14} />
          {label}
          {badge && (
            <span
              className="ml-auto grid size-4 place-items-center rounded text-[10px]"
              style={{
                background: "#E9E8E3",
                color: LIGHT.text,
              }}
            >
              {badge}
            </span>
          )}
        </span>
      ))}
      <p
        className="mb-1 mt-4 flex items-center justify-between px-2 text-[11px]"
        style={{
          color: LIGHT.soft,
        }}
      >
        Recent runs
        <Icon name="ph:caret-down" size={11} />
      </p>
      {[
        "Compare 70b and 8b on evals",
        "Pin mistral-small v3",
        "Add Sydney to routing",
        "Why p95 jumped at 09:12",
        "Rotate staging keys",
      ].map((run) => (
        <span
          key={run}
          className="truncate px-2 py-1 pl-4 text-[11.5px]"
          style={{
            color: LIGHT.text,
          }}
        >
          {run}
        </span>
      ))}
      <div
        className="mt-auto flex items-center gap-2 rounded-xl border bg-white p-2"
        style={{
          borderColor: LIGHT.line,
        }}
      >
        <Avatar name="Rhea Okafor" size={26} ring={LIGHT.line} />
        <span className="min-w-0 leading-tight">
          <b
            className="block truncate text-[12px] font-[600]"
            style={{
              color: LIGHT.ink,
            }}
          >
            Rhea Okafor
          </b>
          <span
            className="block truncate text-[10.5px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            rhea@northwind.dev
          </span>
        </span>
      </div>
    </aside>
  );
}

function LatencyCard({ zone, live }: { zone: Zone; live: boolean }) {
  const [activeRange, setActiveRange] = useState("24h");
  const zoneIndex = ZONES.indexOf(zone);
  const rangeIndex = RANGES.indexOf(activeRange);
  const path = useMemo(
    () => sparklinePath(seededSeries(zoneIndex * 7 + rangeIndex * 3 + 1), 240, 52),
    [zoneIndex, rangeIndex],
  );
  const stats = ZONE_STATS[zone];
  return (
    <div
      className="rounded-xl border bg-white p-3.5"
      style={{
        borderColor: LIGHT.line,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[12.5px] font-[500]"
            style={{
              color: LIGHT.ink,
            }}
          >
            p50 latency
          </p>
          <p
            className="text-[11px]"
            style={{
              color: LIGHT.soft,
            }}
          >
            mistral-small-24b
          </p>
        </div>
        <div
          className="flex rounded-md p-0.5 text-[10.5px]"
          style={{
            background: LIGHT.panel,
          }}
          role="group"
          aria-label="Range"
        >
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              aria-pressed={range === activeRange}
              className="relative rounded px-1.5 py-0.5"
              style={{
                color: range === activeRange ? "#fff" : LIGHT.soft,
              }}
            >
              {range === activeRange && (
                <motion.span
                  layoutId="op-range"
                  className="absolute inset-0 rounded"
                  style={{
                    background: LIGHT.ink,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 36,
                  }}
                />
              )}
              <span className="relative">{range}</span>
            </button>
          ))}
        </div>
      </div>
      <p
        className="mt-2 text-[26px] font-[500] leading-none tracking-[-0.03em]"
        style={{
          color: LIGHT.ink,
        }}
      >
        <AnimatedNumber value={stats.p50 + rangeIndex * 3} />
        <span
          className="ml-1 text-[12px] font-[400]"
          style={{
            color: LIGHT.soft,
          }}
        >
          ms
        </span>
      </p>
      <p
        className="mt-1 text-[11px]"
        style={{
          color: LIGHT.ok,
        }}
      >
        {9 + zoneIndex * 2}% faster than last week
      </p>
      <svg viewBox="-4 -4 248 60" className="mt-2 h-[60px] w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="op-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={LIGHT.accent} stopOpacity=".18" />
            <stop offset="1" stopColor={LIGHT.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          animate={{
            d: `${path} L240 56 L0 56 Z`,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          fill="url(#op-spark)"
        />
        <motion.path
          animate={{
            d: path,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          fill="none"
          stroke={LIGHT.accent}
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="240"
          cy={52 - seededSeries(zoneIndex * 7 + rangeIndex * 3 + 1).slice(-1)[0] * 52}
          r="3"
          fill={LIGHT.accent}
        >
          {live && <animate attributeName="r" values="3;4.6;3" dur="1.6s" repeatCount="indefinite" />}
        </circle>
      </svg>
    </div>
  );
}

function ThroughputCard({ zone, live }: { zone: Zone; live: boolean }) {
  const [bars, setBars] = useState(() => seededSeries(4, 18));
  useEffect(() => {
    if (!live) {
      return;
    }
    const timer = window.setInterval(
      () => setBars((prev) => [...prev.slice(1), clamp(0.35 + Math.random() * 0.6)]),
      900,
    );
    return () => window.clearInterval(timer);
  }, [live]);
  const stats = ZONE_STATS[zone];
  return (
    <div
      className="rounded-xl border bg-white p-3.5"
      style={{
        borderColor: LIGHT.line,
      }}
    >
      <p
        className="text-[12.5px] font-[500]"
        style={{
          color: LIGHT.ink,
        }}
      >
        Throughput
      </p>
      <p
        className="text-[11px]"
        style={{
          color: LIGHT.soft,
        }}
      >
        All models
      </p>
      <p
        className="mt-2 text-[26px] font-[500] leading-none tracking-[-0.03em]"
        style={{
          color: LIGHT.ink,
        }}
      >
        <AnimatedNumber value={stats.tps} />
        <span
          className="ml-1 text-[12px] font-[400]"
          style={{
            color: LIGHT.soft,
          }}
        >
          tok/s
        </span>
      </p>
      <p
        className="mt-1 text-[11px]"
        style={{
          color: LIGHT.soft,
        }}
      >
        {"Peak "}
        {formatNumber(Math.round(stats.tps * 1.31))}
        {" at 09:40"}
      </p>
      <div className="mt-2 flex h-[60px] items-end gap-[3px]">
        {bars.map((bar, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-[2px]"
            animate={{
              height: `${bar * 100}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 26,
            }}
            style={{
              background: i === bars.length - 1 ? LIGHT.ink : "#E4E3DE",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RequestFeed({ live }: { live: boolean }) {
  const [rows, setRows] = useState(() =>
    [0, 1, 2, 3].map((k) => ({
      k,
      i: k,
    })),
  );
  const nextKey = useRef(4);
  useEffect(() => {
    if (!live) {
      return;
    }
    const timer = window.setInterval(() => {
      const key = nextKey.current++;
      setRows((prev) =>
        [
          {
            k: key,
            i: key % SAMPLE_REQUESTS.length,
          },
          ...prev,
        ].slice(0, 4),
      );
    }, 1500);
    return () => window.clearInterval(timer);
  }, [live]);
  return (
    <div
      className="rounded-xl border bg-white"
      style={{
        borderColor: LIGHT.line,
      }}
    >
      <p
        className="flex items-center justify-between border-b px-3.5 py-2.5 text-[12.5px] font-[500]"
        style={{
          borderColor: LIGHT.line,
          color: LIGHT.ink,
        }}
      >
        Recent requests
        <span
          className="flex items-center gap-1.5 text-[11px] font-[400]"
          style={{
            color: LIGHT.soft,
          }}
        >
          <span className="relative grid size-2 place-items-center">
            <span
              className="op-pulse absolute inset-0 rounded-full"
              style={{
                background: LIGHT.ok,
              }}
            />
            <span
              className="size-1.5 rounded-full"
              style={{
                background: LIGHT.ok,
              }}
            />
          </span>
          Streaming
        </span>
      </p>
      <ul className="relative h-[136px] overflow-hidden">
        <AnimatePresence initial={false}>
          {rows.map(({ k: key, i }) => {
            const [method, path, region, ms, ttft] = SAMPLE_REQUESTS[i];
            return (
              <motion.li
                key={key}
                layout={true}
                initial={{
                  opacity: 0,
                  y: -12,
                  backgroundColor: "rgba(15,156,134,.08)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor: "rgba(15,156,134,0)",
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                }}
                className="flex h-[34px] items-center gap-2.5 border-b px-3.5 text-[11.5px]"
                style={{
                  borderColor: LIGHT.line,
                  fontFamily: FONT_MONO,
                }}
              >
                <span
                  className="rounded px-1 text-[9.5px] font-[600]"
                  style={{
                    background: "#E8F6F2",
                    color: LIGHT.accent,
                  }}
                >
                  {method}
                </span>
                <span
                  className="min-w-0 flex-1 truncate"
                  style={{
                    color: LIGHT.ink,
                  }}
                >
                  {path}
                </span>
                <span
                  className="hidden sm:inline"
                  style={{
                    color: LIGHT.soft,
                  }}
                >
                  {region}
                </span>
                <span
                  className="hidden w-14 text-right sm:inline"
                  style={{
                    color: LIGHT.soft,
                  }}
                >
                  {ms ? `${ms} tok` : "audio"}
                </span>
                <span
                  className="w-12 text-right"
                  style={{
                    color: LIGHT.ink,
                  }}
                >
                  {ttft}
                  {" ms"}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export function Console() {
  const [ref, live] = useLiveInView("0px");
  const [activeZone, setActiveZone] = useState<Zone>("All regions");
  const regions = REGIONS.filter((region) => activeZone === "All regions" || region.zone === activeZone).slice(
    0,
    activeZone === "All regions" ? 5 : 4,
  );
  const stats = ZONE_STATS[activeZone];
  const scan = useMotionValue(0.3);
  useAnimationFrame((time) => {
    if (live) {
      scan.set((time / 9e3) % 1);
    }
  });
  const scanWidth = useTransform(scan, (v) => `${v * 100}%`);
  const scanLeft = useTransform(scan, (v) => `calc(${v * 100}% - 13px)`);
  return (
    <div
      ref={ref}
      className="flex overflow-hidden rounded-[18px] text-left"
      style={{
        background: LIGHT.bg,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,.08), 0 40px 120px -30px rgba(0,0,0,.9), 0 20px 50px -20px rgba(0,0,0,.6)",
        fontFamily: FONT_SANS,
      }}
    >
      <ConsoleSidebar />
      <div className="min-w-0 flex-1 p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <span
            className="inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[12px]"
            style={{
              borderColor: LIGHT.line,
              color: LIGHT.ink,
            }}
          >
            <Icon name="ph:caret-left" size={11} />
            Endpoints
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="grid size-7 place-items-center rounded-lg border"
              style={{
                borderColor: LIGHT.line,
                color: LIGHT.text,
              }}
            >
              <Icon name="ph:bell" size={13} />
            </span>
            <span
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[12px] font-[500]"
              style={{
                background: LIGHT.ink,
                color: "#fff",
              }}
            >
              <Icon name="ph:plus" size={11} />
              New
            </span>
          </span>
        </div>
        <div
          className="mt-3 grid overflow-hidden rounded-xl border sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          style={{
            borderColor: LIGHT.line,
            background: LIGHT.panel,
          }}
        >
          <div className="p-4">
            <p
              className="text-[11.5px] font-[500]"
              style={{
                color: LIGHT.accent,
              }}
            >
              Production
            </p>
            <p
              className="mt-1 text-[19px] font-[600] tracking-[-0.02em]"
              style={{
                color: LIGHT.ink,
              }}
            >
              Docs assistant
            </p>
            <p
              className="mt-1 max-w-[260px] text-[12px] leading-[1.5]"
              style={{
                color: LIGHT.text,
              }}
            >
              One model answering from eight regions, sized to the traffic it gets.
            </p>
            <div className="mt-4 flex gap-1.5">
              <span
                className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[12px] font-[500]"
                style={{
                  background: LIGHT.ink,
                  color: "#fff",
                }}
              >
                <Icon name="ph:plus" size={11} />
                Deploy model
              </span>
              <span
                className="inline-flex h-8 items-center gap-1 rounded-lg border bg-white px-3 text-[12px] font-[500]"
                style={{
                  borderColor: LIGHT.line,
                  color: LIGHT.ink,
                }}
              >
                <Icon name="ph:play" size={11} />
                Playground
              </span>
            </div>
          </div>
          <div className="relative hidden h-[150px] overflow-hidden sm:block">
            <Landscape scene="day" id="op-dash" sun={[1180, 190]} />
            <div
              className="absolute inset-x-0 bottom-0 h-[3px]"
              style={{
                background: "rgba(255,255,255,.4)",
              }}
            >
              <motion.div
                className="h-full"
                style={{
                  width: scanWidth,
                  background: DARK.amber,
                }}
              />
            </div>
            <motion.div
              className="absolute bottom-[2px]"
              style={{
                left: scanLeft,
              }}
            >
              <Rover size={26} />
            </motion.div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex rounded-lg p-0.5 text-[12px]"
            style={{
              background: LIGHT.panel,
            }}
            role="tablist"
            aria-label="Region"
          >
            {ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                role="tab"
                aria-selected={zone === activeZone}
                onClick={() => setActiveZone(zone)}
                className="relative rounded-md px-2.5 py-1.5"
                style={{
                  color: zone === activeZone ? LIGHT.ink : LIGHT.soft,
                }}
              >
                {zone === activeZone && (
                  <motion.span
                    layoutId="op-zone"
                    className="absolute inset-0 rounded-md bg-white"
                    style={{
                      boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 38,
                    }}
                  />
                )}
                <span className="relative">{zone}</span>
              </button>
            ))}
          </div>
          <span
            className="hidden h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] sm:inline-flex"
            style={{
              borderColor: LIGHT.line,
              color: LIGHT.ink,
            }}
          >
            <Icon name="ph:calendar-blank" size={12} />
            Last 24 hours
            <Icon name="ph:caret-down" size={10} />
          </span>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <p
              className="mb-2 flex items-center gap-1.5 text-[12.5px] font-[500]"
              style={{
                color: LIGHT.ink,
              }}
            >
              <Icon
                name="ph:heartbeat"
                size={13}
                style={{
                  color: LIGHT.soft,
                }}
              />
              Live metrics
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <LatencyCard zone={activeZone} live={live} />
              <ThroughputCard zone={activeZone} live={live} />
            </div>
            <div className="mt-3">
              <RequestFeed live={live} />
            </div>
          </div>
          <div className="min-w-0">
            <p
              className="mb-2 flex items-center gap-1.5 text-[12.5px] font-[500]"
              style={{
                color: LIGHT.ink,
              }}
            >
              <Icon
                name="ph:map-pin"
                size={13}
                style={{
                  color: LIGHT.soft,
                }}
              />
              Traffic by region
            </p>
            <ul
              className="overflow-hidden rounded-xl border bg-white"
              style={{
                borderColor: LIGHT.line,
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {regions.map((region) => (
                  <motion.li
                    key={region.code}
                    layout={true}
                    initial={{
                      opacity: 0,
                      x: 8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -8,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: EASE,
                    }}
                    className="border-b px-3 py-2 last:border-b-0"
                    style={{
                      borderColor: LIGHT.line,
                    }}
                  >
                    <div className="flex items-center justify-between text-[12px]">
                      <span
                        style={{
                          color: LIGHT.ink,
                        }}
                      >
                        {region.city}{" "}
                        <span
                          className="text-[10.5px]"
                          style={{
                            color: LIGHT.soft,
                          }}
                        >
                          {region.code}
                        </span>
                      </span>
                      <span
                        className="rounded border px-1 text-[10.5px] tabular-nums"
                        style={{
                          borderColor: LIGHT.line,
                          color: LIGHT.text,
                          fontFamily: FONT_MONO,
                        }}
                      >
                        {region.ms}
                        {" ms"}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1 overflow-hidden rounded-full"
                      style={{
                        background: LIGHT.panel,
                      }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${(region.share / 24) * 100}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: EASE,
                        }}
                        style={{
                          background: LIGHT.accent,
                        }}
                      />
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <p
              className="mb-2 mt-3 flex items-center gap-1.5 text-[12.5px] font-[500]"
              style={{
                color: LIGHT.ink,
              }}
            >
              <Icon
                name="ph:lightning"
                size={13}
                style={{
                  color: LIGHT.soft,
                }}
              />
              Today
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["Requests", <AnimatedNumber key="a" value={stats.req} decimals={2} suffix="M" />],
                  ["Error rate", "0.03%"],
                  ["Spend", <AnimatedNumber key="b" value={stats.spend} prefix="$" />],
                  ["Cold starts", "0"],
                ] as [string, ReactNode][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border bg-white px-3 py-2"
                  style={{
                    borderColor: LIGHT.line,
                  }}
                >
                  <p
                    className="text-[15px] font-[600] tracking-[-0.02em]"
                    style={{
                      color: LIGHT.ink,
                    }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-[10.5px]"
                    style={{
                      color: LIGHT.soft,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
