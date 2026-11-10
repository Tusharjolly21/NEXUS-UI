"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { CHAINS, CORRIDORS, CORRIDOR_AMOUNTS, type Chain } from "./data";
import { COLOR, CONTAINER, EASE, FONT_MONO, SPRING } from "./theme";
import { Icon, Mono, PillButton, TextLink } from "./ui";
/** A fixed pseudo-random number in 0..1 for any input: the same map every visit. */
export function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Smooth 2D value noise in 0..1, for the ragged coastlines and the height of each column. */
export function noise(px: number, py: number) {
  const ix = Math.floor(px);
  const iy = Math.floor(py);
  const fx = px - ix;
  const fy = py - iy;
  const ux = fx * fx * (3 - fx * 2);
  const uy = fy * fy * (3 - fy * 2);
  const a = hash(ix + iy * 57);
  const b = hash(ix + 1 + iy * 57);
  const c = hash(ix + (iy + 1) * 57);
  const d = hash(ix + 1 + (iy + 1) * 57);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/** A payment in flight on the hero map: from one chain, through another, into the treasury, starting at `t0`. */
export type Phase = { src: string; hop: string; t0: number; amount: number };

type Dot = { x: number; y: number; h: number; isle: number; spike: boolean };

type ChainMapProps = {
  phase: Phase;
  onPick: (chain: string) => void;
  /** the chain under the pointer, which lifts */
  hot: string | null;
  setHot: (chain: string | null) => void;
};

/**
 * The hero map: each chain is an island of thin columns on a canvas, whose heights ripple slowly and rise around
 * the pointer like a magnet. A payment draws an arc from its chain, through the hop, to the treasury island, which
 * pulses as it lands. Islands are buttons too: click one to send the next payment from it.
 */
export function ChainMap({ phase, onPick, hot, setHot }: ChainMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 800, h: 640 });
  const pointer = useRef({ x: -999, y: -999 });
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { amount: 0.1 });
  // the draw loop reads these without restarting
  const phaseRef = useRef(phase);
  const hotRef = useRef(hot);
  useEffect(() => {
    phaseRef.current = phase;
    hotRef.current = hot;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) });
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  // one column per dot inside each island's ellipse, its edge roughened by noise
  const dots = useMemo(() => {
    const list: Dot[] = [];
    const stepX = size.w < 600 ? 4 : 4.6;
    const stepY = 5;
    CHAINS.forEach((chain, index) => {
      const cx = chain.x * size.w;
      const cy = chain.y * size.h;
      const rx = chain.rx * size.w;
      const ry = chain.ry * size.h * (size.w / 800);
      for (let y = cy - ry; y <= cy + ry; y += stepY) {
        for (let x = cx - rx; x <= cx + rx; x += stepX) {
          const nx = (x - cx) / rx;
          const ny = (y - cy) / ry;
          const d = nx * nx + ny * ny;
          const edge = 0.82 + noise(x * 0.02 + index * 9, y * 0.03) * 0.3;
          if (d > edge) continue;
          const lift = noise(x * 0.018 + index * 3, y * 0.05 + index);
          const spike = hash(x * 3.1 + y * 7.7) > 0.985;
          list.push({
            x,
            y,
            h: chain.amp * Math.pow(Math.max(0, 1 - d / edge), 1.1) * (0.35 + lift * 0.85) * (spike ? 2.4 : 1) + 2,
            isle: index,
            spike,
          });
        }
      }
    });
    return list;
  }, [size.w, size.h]);

  // each column's current height, eased towards its target every frame
  const heat = useRef(new Float32Array(0));
  useEffect(() => {
    heat.current = new Float32Array(dots.length);
  }, [dots]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // columns are filled with a tiny striped pattern, so they read as stacked plates
    const stripes = (color: string) => {
      const tile = document.createElement("canvas");
      tile.width = 2;
      tile.height = 4;
      const t = tile.getContext("2d")!;
      t.fillStyle = color;
      t.fillRect(0, 0, 2, 3);
      return ctx.createPattern(tile, "repeat")!;
    };
    const shades = [stripes("#CFDDFB"), stripes("#9DBCFF"), stripes("#5E8DFF"), stripes("#2558E8"), stripes("#1840B8")];
    let raf = 0;
    const startedAt = performance.now();
    // a quadratic arc from one island's peak to another's, `rise` px above the higher one
    const arc = (from: Chain, to: Chain, rise: number) => {
      const points: [number, number][] = [];
      const x0 = from.x * size.w;
      const y0 = from.y * size.h - from.amp * 0.6;
      const x1 = to.x * size.w;
      const y1 = to.y * size.h - to.amp * 0.6;
      const mx = (x0 + x1) / 2;
      const my = Math.min(y0, y1) - rise;
      for (let k = 0; k <= 60; k++) {
        const t = k / 60;
        points.push([
          (1 - t) * (1 - t) * x0 + (1 - t) * 2 * t * mx + t * t * x1,
          (1 - t) * (1 - t) * y0 + (1 - t) * 2 * t * my + t * t * y1,
        ]);
      }
      return points;
    };
    const draw = (now: number) => {
      const time = (now - startedAt) / 1000;
      ctx.clearRect(0, 0, size.w, size.h);
      const current = phaseRef.current;
      const sinceSend = (now - current.t0) / 1000;
      const landed = sinceSend > 2.4;
      const pulse = landed ? Math.max(0, 1 - (sinceSend - 2.4) / 2) : 0;
      const from = CHAINS.find((chain) => chain.id === current.src) ?? CHAINS[0]!;
      const hop = CHAINS.find((chain) => chain.id === current.hop) ?? CHAINS[1]!;
      const treasury = CHAINS[5]!;
      const { x: px, y: py } = pointer.current;
      const hotChain = hotRef.current;
      const heights = heat.current;
      for (let k = 0; k < dots.length; k++) {
        const dot = dots[k]!;
        const chain = CHAINS[dot.isle]!;
        const dist2 = (dot.x - px) * (dot.x - px) + (dot.y - py) * (dot.y - py);
        let boost = Math.exp(-dist2 / 5200) * 46;
        if (hotChain === chain.id) boost += chain.amp * 0.5;
        // the treasury ripples outward as a payment lands
        if (dot.isle === 5) boost += pulse * 40 * (0.5 + Math.sin(dot.x * 0.05 - sinceSend * 6) * 0.5);
        const breathe = reduce ? 1 : 1 + Math.sin(time * 1.3 + dot.x * 0.025 + dot.y * 0.02) * 0.1;
        const target = dot.h * breathe + boost;
        heights[k]! += (target - heights[k]!) * (reduce ? 1 : 0.14);
        const h = heights[k]!;
        const shade = Math.min(4, Math.floor((h / (chain.amp + 30)) * 4.2 + (dot.spike ? 1 : 0)));
        ctx.fillStyle = shades[Math.max(0, shade)]!;
        ctx.fillRect(dot.x, dot.y - h, 1.8, h);
      }
      // the route: chain to hop, then hop to treasury, drawn in as the payment travels
      const route = [...arc(from, hop, 70), ...arc(hop, treasury, 20).slice(1)];
      const travelled = Math.min(1, sinceSend / 2.2);
      const head = Math.floor(travelled * (route.length - 1));
      ctx.fillStyle = COLOR.deep;
      for (let k = 0; k <= head; k++) {
        const [x, y] = route[k]!;
        const tall = 6 + Math.sin(k * 0.7) * 5;
        ctx.fillRect(x - 1, y - tall, 2.4, tall);
      }
      if (travelled < 1 && head >= 0) {
        const [x, y] = route[head]!;
        ctx.beginPath();
        ctx.arc(x, y - 4, 4, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.blue;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - 4, 9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(47,107,255,.18)";
        ctx.fill();
      }
      if (!reduce && inView) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [dots, size.w, size.h, reduce, inView]);

  // the settled label appears once the payment has landed
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), Math.max(0, phase.t0 + 2300 - performance.now()));
    return () => window.clearTimeout(timer);
  }, [phase]);
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = wrapRef.current!.getBoundingClientRect();
    pointer.current = { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const current = phase;
  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      onPointerMove={onMove}
      onPointerLeave={() =>
        (pointer.current = {
          x: -999,
          y: -999,
        })
      }
    >
      <svg
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size.w} ${size.h}`}
      >
        <ellipse
          cx={size.w * 0.58}
          cy={size.h * 0.42}
          rx={size.w * 0.58}
          ry={size.h * 0.26}
          transform={`rotate(-6 ${size.w * 0.58} ${size.h * 0.42})`}
          fill="none"
          stroke="rgba(17,18,20,.12)"
        />
        <path d={`M${size.w * 0.06} ${size.h * 1.02} L${size.w * 0.42} -10`} stroke="rgba(17,18,20,.08)" fill="none" />
        {Array.from(
          {
            length: 5,
          },
          (m, index) =>
            Array.from(
              {
                length: 6,
              },
              (k, index2) => {
                const P = size.w * (0.06 + index2 * 0.18);
                const C = size.h * (0.12 + index * 0.2);
                return (
                  <path
                    d={`M${P - 4} ${C} H${P + 4} M${P} ${C - 4} V${C + 4}`}
                    stroke="rgba(17,18,20,.22)"
                    key={`${index}-${index2}`}
                  />
                );
              },
            ),
        )}
        {CHAINS.filter((chain) => chain.src).map((chain) => (
          <line
            x1={chain.x * size.w}
            y1={chain.y * size.h}
            x2={CHAINS[5].x * size.w}
            y2={CHAINS[5].y * size.h}
            stroke="rgba(17,18,20,.14)"
            strokeDasharray="2 5"
            key={chain.id}
          />
        ))}
      </svg>
      <canvas ref={canvasRef} aria-hidden={true} className="absolute inset-0 h-full w-full" />
      {CHAINS.map((chain) => {
        const S = chain.id === current.src || chain.id === current.hop || (chain.id === "tre" && ready);
        const k = chain.rx * size.w * 2;
        const A = chain.ry * size.h * (size.w / 800) * 2 + chain.amp;
        return (
          <div
            className="absolute"
            style={{
              left: chain.x * size.w - k / 2,
              top: chain.y * size.h - A + chain.ry * size.h * (size.w / 800),
              width: k,
              height: A,
            }}
            key={chain.id}
          >
            <motion.div
              aria-hidden={true}
              className="pointer-events-none absolute inset-0"
              animate={{
                opacity: S ? 1 : 0,
              }}
              style={{
                boxShadow: `inset 0 0 0 1px ${COLOR.blue}`,
              }}
              transition={{
                duration: 0.4,
              }}
            />
            <button
              type="button"
              onClick={() => chain.src && onPick(chain.id)}
              onMouseEnter={() => setHot(chain.id)}
              onMouseLeave={() => setHot(null)}
              onFocus={() => setHot(chain.id)}
              onBlur={() => setHot(null)}
              disabled={!chain.src}
              aria-label={chain.src ? `Send a payment from ${chain.name}` : "Treasury"}
              className="wf-ring absolute -top-[18px] left-0 whitespace-nowrap px-1.5 py-0.5 text-[10px] tracking-[0.04em] outline-none transition-colors"
              style={{
                fontFamily: FONT_MONO,
                background: S ? COLOR.blue : chain.id === "tre" ? COLOR.ink : "#fff",
                color: S || chain.id === "tre" ? "#fff" : COLOR.ink,
                boxShadow: S ? "none" : `0 0 0 1px ${COLOR.line2}`,
                cursor: chain.src ? "pointer" : "default",
              }}
            >
              {chain.name} {Math.round(chain.x * size.w)}, {Math.round(chain.y * size.h)}
            </button>
          </div>
        );
      })}
    </div>
  );
}
/** The receipt beside the map: the amount counts up while the payment routes, then it reads Settled. */
export function SettlementCard({ phase }: { phase: Phase }) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    let raf = 0;
    const tick = (time: number) => {
      setNow(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const elapsed = Math.max(0, (now - phase.t0) / 1000);
  const settled = elapsed > 2.4;
  const shown = phase.amount * Math.min(1, Math.pow(Math.min(1, elapsed / 2.4), 0.6));
  const [whole, cents] = shown.toFixed(2).split(".");
  const chainName = (id: string) => CHAINS.find((chain) => chain.id === id)?.name ?? id;
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        ...SPRING,
        delay: 0.6,
      }}
      className="relative w-[260px] bg-white p-3.5"
      style={{
        boxShadow: `0 0 0 1px ${COLOR.line2}, 0 20px 40px -24px rgba(17,18,20,.35)`,
      }}
      aria-live="polite"
    >
      {([["left-0 top-0"], ["right-0 top-0"], ["left-0 bottom-0"], ["right-0 bottom-0"]] as const).map(([c]) => (
        <i
          className={`absolute ${c} h-1 w-1`}
          style={{
            background: COLOR.ink,
          }}
          key={c}
        />
      ))}
      <div
        className="flex items-center justify-between text-[11.5px]"
        style={{
          fontFamily: FONT_MONO,
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {settled ? (
            <motion.span
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="flex items-center gap-1.5"
              style={{
                color: COLOR.green,
              }}
              key="d"
            >
              <Icon name="ph:check" size={12} />
              Settled
            </motion.span>
          ) : (
            <motion.span
              exit={{
                opacity: 0,
                y: -6,
              }}
              className="flex items-center gap-1.5"
              style={{
                color: COLOR.soft,
              }}
              key="r"
            >
              <i
                className="wf-anim h-1.5 w-1.5 rounded-full"
                style={{
                  background: COLOR.blue,
                  animation: "wf-blink 1s steps(1) infinite",
                }}
              />
              Routing…
            </motion.span>
          )}
        </AnimatePresence>
        <span
          style={{
            color: COLOR.faint,
          }}
        >
          {Math.min(elapsed, 2.4).toFixed(1)} s
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1 tabular-nums">
        <span
          className="text-[26px] font-medium tracking-[-0.03em]"
          style={{
            color: COLOR.ink,
          }}
        >
          {Number(whole).toLocaleString("en-US")}
        </span>
        <span
          className="text-[26px] font-medium"
          style={{
            color: COLOR.faint,
          }}
        >
          .{cents}
        </span>
        <Mono
          className="ml-1 text-[10.5px]"
          style={{
            color: COLOR.soft,
          }}
        >
          USDC
        </Mono>
      </div>
      <div
        className="mt-1.5 flex items-center gap-1.5 text-[11.5px]"
        style={{
          fontFamily: FONT_MONO,
          color: COLOR.ink,
        }}
      >
        {chainName(phase.src)}
        <span
          style={{
            color: COLOR.blue,
          }}
        >
          →
        </span>
        {chainName(phase.hop)}
        <span
          style={{
            color: COLOR.blue,
          }}
        >
          →
        </span>
        Treasury
      </div>
      <div
        className="mt-1.5 text-[10.5px]"
        style={{
          fontFamily: FONT_MONO,
          color: COLOR.faint,
        }}
      >
        Gas covered · 0x{(phase.amount * 7).toString(16).slice(0, 4)}…{(Math.imul(Math.round(phase.amount * 100), 2654435761) >>> 0).toString(16).slice(-4)}
      </div>
    </motion.div>
  );
}
export function Hero() {
  const [phase, setPhase] = useState<Phase>(() => ({
    src: "base",
    hop: "arb",
    t0: performance.now() + 900,
    amount: CORRIDOR_AMOUNTS[0]!,
  }));
  const [hot, setHot] = useState<string | null>(null);
  const corridor = useRef(0);
  const lastPick = useRef(0);
  useEffect(() => {
    // a new payment every 6.5 seconds, unless the visitor just picked one
    const timer = window.setInterval(() => {
      if (performance.now() - lastPick.current < 6000) return;
      corridor.current = (corridor.current + 1) % CORRIDORS.length;
      const [src, hop] = CORRIDORS[corridor.current]!;
      setPhase({ src, hop, t0: performance.now(), amount: CORRIDOR_AMOUNTS[corridor.current]! });
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);
  // clicking an island sends a payment from it, through a random other chain
  const pick = useCallback((src: string) => {
    lastPick.current = performance.now();
    const hops = CHAINS.filter((chain) => chain.src && chain.id !== src);
    const hop = hops[Math.floor(Math.random() * hops.length)]!.id;
    setPhase({
      src,
      hop,
      t0: performance.now(),
      amount: Math.round(1000 + Math.random() * 90000) + Math.round(Math.random() * 100) / 100,
    });
  }, []);
  const stats = [
    [
      <span key="span-533" className="flex -space-x-1">
        {[COLOR.ink, COLOR.blue, "#7C5CFF", COLOR.green].map((item) => (
          <i
            className="block h-4 w-4 rounded-full"
            style={{
              background: item,
              boxShadow: "0 0 0 1.5px #F7F7F8",
            }}
            key={item}
          />
        ))}
      </span>,
      <Fragment key="fragment-545">
        Live on <b className="font-semibold">30</b> chains
      </Fragment>,
    ],
    [
      null,
      <Fragment key="fragment-551">
        <b className="font-semibold">380+</b> teams
      </Fragment>,
    ],
    [
      null,
      <Fragment key="fragment-557">
        $<b className="font-semibold">4.2</b>B settled
      </Fragment>,
    ],
    [
      <span key="span-562"
        style={{
          color: COLOR.soft,
        }}
      >
        <Icon name="ph:shield-check" size={17} />
      </span>,
      <Fragment key="fragment-569">
        <b className="font-semibold">SOC 2</b> Type II
      </Fragment>,
    ],
  ];
  const headline = "Money that crosses on its own.".split(" ");
  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "min(100svh, 900px)",
      }}
    >
      <div className="absolute inset-y-0 right-0 hidden w-[64%] lg:block">
        <ChainMap phase={phase} onPick={pick} hot={hot} setHot={setHot} />
      </div>
      <div className={`${CONTAINER} relative pb-16 pt-36 lg:pointer-events-none lg:pt-44`}>
        <div className="max-w-[500px] lg:pointer-events-auto">
          <h1
            className="m-0 font-medium"
            style={{
              fontSize: "clamp(46px, 6vw, 80px)",
              lineHeight: 1,
              letterSpacing: "-0.045em",
              color: COLOR.ink,
            }}
          >
            {headline.map((item, index) => (
              <motion.span
                className="inline-block whitespace-pre"
                initial={{
                  opacity: 0,
                  filter: "blur(14px)",
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: 0.1 + index * 0.08,
                }}
                key={index}
              >
                {item}
                {index < headline.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{
              opacity: 0,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.8,
              delay: 0.55,
            }}
            className="m-0 mt-6 text-[17px] leading-[1.6]"
            style={{
              color: COLOR.text,
            }}
          >
            Wharf is the settlement layer for onchain apps. Take any token, route it across 30 chains, cover the gas,
            and land stablecoins in your treasury. One API, no bridges to babysit.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: 0.7,
            }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <PillButton dark={true} href="#start">
              Start building
            </PillButton>
            <TextLink href="#developers">See the API</TextLink>
          </motion.div>
          <motion.dl
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.95,
            }}
            className="m-0 mt-12 grid max-w-[400px] grid-cols-2 gap-x-8 gap-y-4 text-[13.5px]"
            style={{
              color: COLOR.text,
            }}
          >
            {stats.map(([c, f], index) => (
              <div className="flex items-center gap-2" key={index}>
                {c}
                <dd className="m-0">{f}</dd>
              </div>
            ))}
          </motion.dl>
          <p
            className="m-0 mt-10 hidden items-center gap-2 text-[12px] lg:flex"
            style={{
              fontFamily: FONT_MONO,
              color: COLOR.faint,
            }}
          >
            <span
              style={{
                color: COLOR.blue,
              }}
            >
              <Icon name="ph:arrow-right" size={12} />
            </span>
            Click a chain label to send a payment.
          </p>
        </div>
        <div className="relative mt-10 h-[420px] overflow-hidden lg:hidden">
          <ChainMap phase={phase} onPick={pick} hot={hot} setHot={setHot} />
        </div>
        <div className="relative mt-4 lg:pointer-events-auto lg:absolute lg:bottom-10 lg:left-[46%] lg:mt-0">
          <SettlementCard phase={phase} />
        </div>
      </div>
    </section>
  );
}
