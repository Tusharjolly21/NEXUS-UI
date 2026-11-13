"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CONTAINER, DARK, EASE, FONT_MONO, clamp } from "./theme";
import { Button, Icon, Reveal, SectionTitle } from "./ui";

const BOARD_W = 1040;

const BOARD_H = 430;

const NODE_W = 170;

type NodeId = "model" | "hw" | "regions" | "prompt" | "ep" | "search" | "community" | "evals" | "alerts";
type InputKey = "weights" | "compute" | "routing" | "prompt";
type Point = { x: number; y: number };

/** The four inputs an endpoint needs, the colour of their wire and the node they come from. */
const INPUTS: [key: InputKey, label: string, color: string, node: NodeId][] = [
  ["weights", "Model weights", DARK.amber, "model"],
  ["compute", "Compute", DARK.rose, "hw"],
  ["routing", "Routing", DARK.violet, "regions"],
  ["prompt", "Instructions", DARK.teal, "prompt"],
];

const NODE_H: Record<NodeId, number> = {
  model: 100,
  hw: 100,
  regions: 108,
  prompt: 122,
  ep: 250,
  search: 100,
  community: 100,
  evals: 100,
  alerts: 100,
};

const START_POSITIONS: Record<NodeId, Point> = {
  model: {
    x: 178,
    y: 6,
  },
  hw: {
    x: 0,
    y: 140,
  },
  regions: {
    x: 206,
    y: 140,
  },
  prompt: {
    x: 186,
    y: 284,
  },
  ep: {
    x: 432,
    y: 70,
  },
  search: {
    x: 692,
    y: 6,
  },
  community: {
    x: 668,
    y: 148,
  },
  evals: {
    x: 870,
    y: 214,
  },
  alerts: {
    x: 690,
    y: 300,
  },
};

const OUTPUTS: { id: NodeId; row: number }[] = [
  {
    id: "search",
    row: 0,
  },
  {
    id: "community",
    row: 1,
  },
  {
    id: "evals",
    row: 2,
  },
  {
    id: "alerts",
    row: 3,
  },
];

/** A horizontal S-curve from (x1, y1) to (x2, y2). */
function wirePath(x1: number, y1: number, x2: number, y2: number) {
  const bend = Math.max(44, Math.abs(x2 - x1) * 0.5);
  return `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
}

type BoardNodeProps = {
  id: NodeId;
  pos: Point;
  onDrag: (id: NodeId, event: ReactPointerEvent<HTMLDivElement>) => void;
  children: ReactNode;
  title: ReactNode;
  icon: string;
  glow?: string;
  w?: number;
  z?: number;
};

function BoardNode({ id, pos, onDrag, children, title, icon, glow, w: width = NODE_W, z = 0 }: BoardNodeProps) {
  return (
    <div
      onPointerDown={(event) => onDrag(id, event)}
      className="absolute cursor-grab touch-none select-none rounded-[14px] p-3 transition-shadow duration-500 active:cursor-grabbing"
      style={{
        zIndex: z,
        left: pos.x,
        top: pos.y,
        width,
        height: NODE_H[id],
        background: "linear-gradient(180deg,#1C1C21,#15151A)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 1px ${glow ? glow + "66" : "rgba(255,255,255,.08)"}, 0 18px 30px -18px rgba(0,0,0,.9)${glow ? `, 0 0 34px -6px ${glow}55` : ""}`,
      }}
    >
      <p
        className="flex items-center gap-1.5 text-[13px] font-[500]"
        style={{
          color: DARK.ink,
        }}
      >
        <Icon
          name={icon}
          size={13}
          style={{
            color: DARK.text,
          }}
        />
        {title}
        <Icon
          name="ph:dots-six-vertical"
          size={13}
          className="ml-auto"
          style={{
            color: DARK.faint,
          }}
        />
      </p>
      {children}
    </div>
  );
}

type PortProps = { x: number; y: number; color: string; on: boolean; onClick?: () => void; label?: string };

function Port({ x, y, color, on, onClick, label }: PortProps) {
  const style = {
    left: x - 7,
    top: y - 7,
    background: on ? color : "#E9E7E1",
    boxShadow: on ? `0 0 0 3px ${color}33, 0 0 12px ${color}` : "0 0 0 3px rgba(255,255,255,.08)",
  };
  return onClick ? (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      className="absolute z-10 size-[14px] rounded-full transition-[background,box-shadow,transform] duration-300 hover:scale-125"
      style={style}
    />
  ) : (
    <span
      aria-hidden={true}
      className="absolute z-10 size-[14px] rounded-full transition-[background,box-shadow] duration-300"
      style={style}
    />
  );
}

export function Builder() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boardWidth, setBoardWidth] = useState(BOARD_W);
  const [positions, setPositions] = useState(START_POSITIONS);
  const positionsRef = useRef(positions);
  const [dragging, setDragging] = useState<NodeId | null>(null);
  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);
  const [connected, setConnected] = useState<Record<InputKey, boolean>>({
    weights: true,
    compute: false,
    routing: false,
    prompt: false,
  });
  const [phase, setPhase] = useState<"idle" | "deploying" | "live">("idle");
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setBoardWidth(entry.contentRect.width);
      setScale(clamp((entry.contentRect.width - 16) / BOARD_W, 0.62, 1));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.5;
    }
  }, [scale]);
  const connectedCount = INPUTS.filter(([key]) => connected[key]).length;
  const allConnected = connectedCount === 4;
  const toggle = (key: InputKey) => {
    setConnected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setPhase("idle");
  };
  const connectAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let delay = 0;
    INPUTS.forEach(([key]) => {
      if (!connected[key]) {
        timers.current.push(
          window.setTimeout(
            () =>
              setConnected((prev) => ({
                ...prev,
                [key]: true,
              })),
            delay,
          ),
        );
        delay += 260;
      }
    });
    timers.current.push(window.setTimeout(() => deploy(), delay + 350));
  };
  const deploy = () => {
    setPhase("deploying");
    timers.current.push(window.setTimeout(() => setPhase("live"), 1300));
  };
  const reset = () => {
    timers.current.forEach(clearTimeout);
    setConnected({
      weights: false,
      compute: false,
      routing: false,
      prompt: false,
    });
    setPhase("idle");
    setPositions(START_POSITIONS);
  };
  const startDrag = useCallback(
    (id: NodeId, startEvent: ReactPointerEvent<HTMLDivElement>) => {
      const target = startEvent.currentTarget;
      target.setPointerCapture(startEvent.pointerId);
      setDragging(id);
      const startX = startEvent.clientX;
      const startY = startEvent.clientY;
      const start = positionsRef.current[id];
      const onMove = (event: PointerEvent) => {
        const x = clamp(start.x + (event.clientX - startX) / scale, -30, BOARD_W - NODE_W + 30);
        const y = clamp(start.y + (event.clientY - startY) / scale, -20, BOARD_H - NODE_H[id] + 20);
        setPositions((prev) => ({
          ...prev,
          [id]: {
            x,
            y,
          },
        }));
      };
      const onUp = () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
      };
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    },
    [scale],
  );
  const endpoint = positions.ep;
  const ENDPOINT_W = 196;
  const slotY = (slot: number) => endpoint.y + 44 + slot * 40 + 20;
  const outPort = (key: NodeId) => ({
    x: positions[key].x + NODE_W,
    y: positions[key].y + NODE_H[key] - 22,
  });
  const inPort = (id: NodeId) => ({
    x: positions[id].x,
    y: positions[id].y + NODE_H[id] - 22,
  });
  const isLive = phase === "live";
  return (
    <section id="build" className="pb-28">
      <div className={`${CONTAINER} flex flex-wrap items-end justify-between gap-6`}>
        <div>
          <Reveal>
            <SectionTitle className="max-w-[780px]">Wire up an endpoint in a minute</SectionTitle>
          </Reveal>
          <Reveal delay={0.08}>
            <p
              className="mt-4 max-w-[440px] text-[15.5px] leading-[1.55]"
              style={{
                color: DARK.text,
              }}
            >
              Give it a model, hardware, regions and instructions. Outpost turns the graph into a live API. Drag the
              cards or click a port.
            </p>
          </Reveal>
        </div>
        <div className="flex items-center gap-2">
          <Button kind="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
          <Button kind="light" size="sm" onClick={connectAll}>
            Connect all
          </Button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="op-noscroll relative mt-10 overflow-x-auto overflow-y-hidden"
        style={{
          height: BOARD_H * scale + 56,
          backgroundImage: `linear-gradient(${DARK.line} 1px, transparent 1px), linear-gradient(90deg, ${DARK.line} 1px, transparent 1px)`,
          backgroundSize: "130px 130px",
          backgroundPosition: "center 20px",
          maskImage: "linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          className="relative"
          style={{
            width: Math.max(boardWidth, BOARD_W * scale + 32),
            height: BOARD_H * scale + 56,
          }}
        >
          <div
            className="absolute top-7"
            style={{
              width: BOARD_W,
              height: BOARD_H,
              left: Math.max(16, (boardWidth - BOARD_W * scale) / 2),
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            <svg
              width={BOARD_W}
              height={BOARD_H}
              className="pointer-events-none absolute inset-0 overflow-visible"
              aria-hidden={true}
            >
              <defs>
                {INPUTS.map(([key, , color]) => (
                  <linearGradient
                    key={key}
                    id={`op-w-${key}`}
                    gradientUnits="userSpaceOnUse"
                    x1={outPort(INPUTS.find((input) => input[0] === key)![3]).x}
                    y1="0"
                    x2={endpoint.x}
                    y2="0"
                  >
                    <stop offset="0" stopColor={color} stopOpacity=".5" />
                    <stop offset="1" stopColor={color} />
                  </linearGradient>
                ))}
              </defs>
              {INPUTS.map(([key, , color, node], i) => {
                const from = outPort(node);
                const path = wirePath(from.x, from.y, endpoint.x, slotY(i));
                return (
                  <g key={key}>
                    {!connected[key] && (
                      <path
                        d={path}
                        fill="none"
                        stroke="rgba(255,255,255,.12)"
                        strokeWidth="1.2"
                        strokeDasharray="3 5"
                      />
                    )}
                    <AnimatePresence>
                      {connected[key] && (
                        <motion.path
                          key="w"
                          id={`op-p-${key}`}
                          d={path}
                          fill="none"
                          stroke={`url(#op-w-${key})`}
                          strokeWidth="2"
                          initial={{
                            pathLength: reduce ? 1 : 0,
                            opacity: 1,
                          }}
                          animate={{
                            pathLength: 1,
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.6,
                            ease: EASE,
                          }}
                          style={{
                            filter: `drop-shadow(0 0 4px ${color})`,
                          }}
                        />
                      )}
                    </AnimatePresence>
                    {connected[key] && isLive && !reduce && (
                      <circle r="3" fill="#fff">
                        <animateMotion dur="1.6s" repeatCount="indefinite" begin={`${i * 0.3}s`} path={path} />
                      </circle>
                    )}
                  </g>
                );
              })}
              {OUTPUTS.map(({ id, row }) => {
                const to = inPort(id);
                const path = wirePath(endpoint.x + ENDPOINT_W, slotY(row), to.x, to.y);
                return (
                  <g key={id}>
                    {!isLive && (
                      <path
                        d={path}
                        fill="none"
                        stroke="rgba(255,255,255,.12)"
                        strokeWidth="1.2"
                        strokeDasharray="3 5"
                      />
                    )}
                    {isLive && (
                      <motion.path
                        d={path}
                        fill="none"
                        stroke={DARK.sky}
                        strokeWidth="2"
                        initial={{
                          pathLength: reduce ? 1 : 0,
                        }}
                        animate={{
                          pathLength: 1,
                        }}
                        transition={{
                          duration: 0.7,
                          delay: row * 0.12,
                          ease: EASE,
                        }}
                        style={{
                          filter: `drop-shadow(0 0 4px ${DARK.sky})`,
                        }}
                      />
                    )}
                    {isLive && !reduce && (
                      <circle r="2.6" fill="#fff">
                        <animateMotion dur="1.4s" repeatCount="indefinite" begin={`${0.7 + row * 0.25}s`} path={path} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
            <BoardNode
              id="model"
              pos={positions.model}
              onDrag={startDrag}
              z={dragging === "model" ? 5 : 0}
              title="Model"
              icon="ph:cube"
            >
              <p
                className="mt-2 text-[12px] font-[500]"
                style={{
                  color: DARK.ink,
                  fontFamily: FONT_MONO,
                }}
              >
                mistral-small-24b
              </p>
              <p
                className="text-[11px]"
                style={{
                  color: DARK.soft,
                }}
              >
                fp8 · 32k context
              </p>
              <p
                className="mt-2 text-right text-[11px]"
                style={{
                  color: DARK.text,
                }}
              >
                weights
              </p>
            </BoardNode>
            <BoardNode
              id="hw"
              pos={positions.hw}
              onDrag={startDrag}
              z={dragging === "hw" ? 5 : 0}
              title="Hardware"
              icon="ph:cpu"
            >
              <p
                className="mt-2 text-[12px] font-[500]"
                style={{
                  color: DARK.ink,
                }}
              >
                4 × H200 141GB
              </p>
              <p
                className="text-[11px]"
                style={{
                  color: DARK.soft,
                }}
              >
                Scale from 0 to 48
              </p>
              <p
                className="mt-2 text-right text-[11px]"
                style={{
                  color: DARK.text,
                }}
              >
                compute
              </p>
            </BoardNode>
            <BoardNode
              id="regions"
              pos={positions.regions}
              onDrag={startDrag}
              z={dragging === "regions" ? 5 : 0}
              title="Regions"
              icon="ph:globe"
            >
              <div className="mt-2 flex flex-wrap gap-1">
                {["iad", "fra", "nrt", "bom"].map((code) => (
                  <span
                    key={code}
                    className="rounded-md px-1.5 py-0.5 text-[10.5px]"
                    style={{
                      background: "rgba(255,255,255,.06)",
                      color: DARK.text,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {code}
                  </span>
                ))}
              </div>
              <p
                className="mt-2.5 text-right text-[11px]"
                style={{
                  color: DARK.text,
                }}
              >
                routing
              </p>
            </BoardNode>
            <BoardNode
              id="prompt"
              pos={positions.prompt}
              onDrag={startDrag}
              z={dragging === "prompt" ? 5 : 0}
              title="Instructions"
              icon="ph:text-align-left"
            >
              <p
                className="mt-2 rounded-lg px-2 py-1.5 text-[11px] leading-[1.45]"
                style={{
                  background: "rgba(0,0,0,.3)",
                  color: DARK.text,
                  boxShadow: `inset 0 0 0 1px ${DARK.line}`,
                }}
              >
                Answer from the docs. Quote the page you used.
              </p>
              <p
                className="mt-1.5 text-right text-[11px]"
                style={{
                  color: DARK.text,
                }}
              >
                prompt
              </p>
            </BoardNode>
            <BoardNode
              id="ep"
              pos={positions.ep}
              onDrag={startDrag}
              z={dragging === "ep" ? 5 : 0}
              w={ENDPOINT_W}
              title={
                <>
                  {"Endpoint "}
                  <span
                    className="text-[11px] font-[400]"
                    style={{
                      color: DARK.soft,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    docs-answer
                  </span>
                </>
              }
              icon="ph:broadcast"
              glow={isLive ? DARK.sky : allConnected ? DARK.teal : undefined}
            >
              <div
                className="-mx-3 mt-3 border-y"
                style={{
                  borderColor: DARK.line,
                }}
              >
                {INPUTS.map(([key, label, color]) => (
                  <div
                    key={key}
                    className="flex h-10 items-center justify-between px-4 text-[12.5px]"
                    style={{
                      color: connected[key] ? DARK.ink : DARK.soft,
                    }}
                  >
                    {label}
                    <AnimatePresence>
                      {connected[key] && (
                        <motion.span
                          initial={{
                            scale: 0,
                            rotate: -40,
                          }}
                          animate={{
                            scale: 1,
                            rotate: 0,
                          }}
                          exit={{
                            scale: 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 22,
                          }}
                          style={{
                            color,
                          }}
                        >
                          <Icon name="ph:check-fat" size={12} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              <div
                className="flex h-[44px] items-center justify-between text-[11.5px]"
                style={{
                  color: DARK.text,
                }}
              >
                {phase === "live" ? (
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      color: DARK.sky,
                    }}
                  >
                    <span className="relative grid size-2 place-items-center">
                      <span
                        className="op-pulse absolute inset-0 rounded-full"
                        style={{
                          background: DARK.sky,
                        }}
                      />
                      <span
                        className="size-1.5 rounded-full"
                        style={{
                          background: DARK.sky,
                        }}
                      />
                    </span>
                    Live · 36 ms p50
                  </span>
                ) : phase === "deploying" ? (
                  <span className="flex items-center gap-1.5">
                    <Icon name="ph:circle-notch" size={12} className="op-spin" />
                    Deploying to 4 regions
                  </span>
                ) : allConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{
                        background: DARK.teal,
                      }}
                    />
                    Ready to deploy
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{
                        background: DARK.faint,
                      }}
                    />
                    {"Waiting for inputs · "}
                    {connectedCount}/4
                  </span>
                )}
                {allConnected && phase === "idle" && (
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={deploy}
                    className="rounded-full px-2.5 py-1 text-[11px] font-[600]"
                    style={{
                      background: DARK.ink,
                      color: DARK.bg,
                    }}
                  >
                    Deploy
                  </button>
                )}
              </div>
            </BoardNode>
            {(
              [
                ["search", "Docs search", "ph:magnifying-glass", "docs.northwind.dev", "On every page"],
                ["community", "Community bot", "ph:chat-teardrop-text", "#help channel", "Replies in threads"],
                ["evals", "Nightly evals", "ph:test-tube", "900 graded questions", "Runs after each deploy"],
                ["alerts", "Spend alerts", "ph:bell-ringing", "$3,000 monthly cap", "Email and pager"],
              ] as [id: NodeId, title: string, icon: string, detail: string, note: string][]
            ).map(([id, title, icon, detail, note]) => (
              <BoardNode
                key={id}
                id={id}
                pos={positions[id]}
                onDrag={startDrag}
                z={dragging === id ? 5 : 0}
                title={title}
                icon={icon}
                glow={isLive ? DARK.sky : undefined}
              >
                <p
                  className="mt-2 text-[12px] font-[500]"
                  style={{
                    color: DARK.ink,
                  }}
                >
                  {detail}
                </p>
                <p
                  className="text-[11px]"
                  style={{
                    color: DARK.soft,
                  }}
                >
                  {note}
                </p>
                <p
                  className="mt-2 flex items-center gap-1.5 pl-2.5 text-[11px]"
                  style={{
                    color: isLive ? DARK.sky : DARK.faint,
                  }}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background: isLive ? DARK.sky : DARK.faint,
                    }}
                  />
                  {isLive ? "Receiving traffic" : "Waiting for endpoint"}
                </p>
              </BoardNode>
            ))}
            {INPUTS.map(([key, label, color, node], i) => {
              const from = outPort(node);
              return (
                <div key={key}>
                  <Port
                    x={from.x}
                    y={from.y}
                    color={color}
                    on={connected[key]}
                    onClick={() => toggle(key)}
                    label={`${connected[key] ? "Disconnect" : "Connect"} ${label}`}
                  />
                  <Port
                    x={endpoint.x}
                    y={slotY(i)}
                    color={color}
                    on={connected[key]}
                    onClick={() => toggle(key)}
                    label={`${connected[key] ? "Disconnect" : "Connect"} ${label}`}
                  />
                </div>
              );
            })}
            {OUTPUTS.map(({ id, row }) => {
              const to = inPort(id);
              return (
                <div key={id}>
                  <Port x={endpoint.x + ENDPOINT_W} y={slotY(row)} color={DARK.sky} on={isLive} />
                  <Port x={to.x} y={to.y} color={DARK.sky} on={isLive} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
