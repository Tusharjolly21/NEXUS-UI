# Order Tracking

Add the "Order Tracking" component from Nexus UI to my project.

A live delivery tracker on a real-looking city map. A courier puck leaves the Pickup marker and rides a blue route with direction arrows to the Drop-off pin on the door, pausing at the drop-offs before yours while the ridden part fills in behind it; its arrow turns at every corner. The arrival time rolls down digit by digit, stages check off, live updates drop into a feed, and on arrival a proof-of-delivery card lands. Hover the map for what is at each point, and a stage for its detail. Shows the delivered state under reduced motion. Also includes Order Tracker, a delivery tracker with a little map, where a van follows the route and drives back to any step you click.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { DEFAULT_COURIER_STAGES, DEFAULT_COURIER_UPDATES, OrderTracking } from "@/components/order-tracking/order-tracking";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/order-tracking/route-map.tsx ---

```tsx
import { memo } from "react";

/*
 * The neighbourhood under the tracker, drawn on a 640 × 600 grid like a city map: land, building footprints,
 * a park with footpaths, a canal with a green bank, roads with casings (main roads wider), and street names
 * that sit on their roads. Everything is computed from fixed numbers and a seeded random, so the server and
 * the browser draw exactly the same map.
 */

export const MAP_W = 640;
export const MAP_H = 600;

type Street = { at: number; major?: boolean; name?: string; labelAt?: number };
/** Streets running north–south (x) and east–west (y). */
const VERTICAL: Street[] = [
  { at: 40 },
  { at: 150, name: "MILL ST", labelAt: 190 },
  { at: 270, major: true, name: "KING ST", labelAt: 120 },
  { at: 400, name: "FERRY ST", labelAt: 360 },
  { at: 520 },
  { at: 610 },
];
const HORIZONTAL: Street[] = [
  { at: 70, name: "CALDER LANE", labelAt: 330 },
  { at: 170 },
  { at: 290, major: true, name: "LINDEN AVENUE", labelAt: 470 },
  { at: 400 },
  { at: 540, major: true, name: "HARBOUR ROAD", labelAt: 330 },
];
const MAJOR = 13;
const MINOR = 7;

/** The park fills the block between Ferry St, the street east of it, and the two streets above Linden Ave. */
const PARK = { x0: 400, x1: 520, y0: 170, y1: 290 };
/** The canal runs across the block between y = 400 and Harbour Road, so that row has no buildings. */
const CANAL = "M-20 470 C 120 442, 220 500, 340 474 S 560 448, 660 468";
const CANAL_ROW = { y0: 400, y1: 540 };

/** The courier's route from the hub to the door, as corner points. Corners are rounded when drawn. */
export const ROUTE_POINTS: [number, number][] = [
  [150, 540],
  [150, 290],
  [400, 290],
  [400, 170],
  [520, 170],
  [520, 70],
  [588, 70],
];
const CORNER = 14;

function roundedPath(pts: [number, number][], r: number) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inX = Math.sign(x - px);
    const inY = Math.sign(y - py);
    const outX = Math.sign(nx - x);
    const outY = Math.sign(ny - y);
    d += ` L${x - inX * r} ${y - inY * r} Q${x} ${y} ${x + outX * r} ${y + outY * r}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx} ${ly}`;
}

export const ROUTE = roundedPath(ROUTE_POINTS, CORNER);
export const PICKUP = { x: ROUTE_POINTS[0][0], y: ROUTE_POINTS[0][1] };
export const DROPOFF = { x: ROUTE_POINTS[ROUTE_POINTS.length - 1][0], y: ROUTE_POINTS[ROUTE_POINTS.length - 1][1] };
export const STOPS = [
  { x: 270, y: 290, label: "Drop-off 1, 12 Linden Ave" },
  { x: 400, y: 230, label: "Drop-off 2, 31 Ferry St" },
];

/** Direction arrows along the straight parts of the route, every 30 units, pointing the way the courier goes. */
export const ROUTE_ARROWS: { x: number; y: number; angle: number }[] = (() => {
  const out: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < ROUTE_POINTS.length - 1; i++) {
    const [ax, ay] = ROUTE_POINTS[i];
    const [bx, by] = ROUTE_POINTS[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    const start = i === 0 ? 26 : CORNER + 12;
    const end = len - (i === ROUTE_POINTS.length - 2 ? 30 : CORNER + 12);
    for (let t = start; t <= end; t += 30) out.push({ x: ax + ux * t, y: ay + uy * t, angle: (Math.atan2(uy, ux) * 180) / Math.PI });
  }
  return out;
})();

/** Small, fast, seeded random (mulberry32), so every render draws the same buildings. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Box = { x: number; y: number; w: number; h: number };

const BUILDINGS: Box[] = (() => {
  const xs = [-30, ...VERTICAL.map((s) => s.at), MAP_W + 30];
  const ys = [-30, ...HORIZONTAL.map((s) => s.at), MAP_H + 30];
  const half = (list: Street[], at: number) => {
    const s = list.find((q) => q.at === at);
    return s ? (s.major ? MAJOR : MINOR) / 2 + 5 : 0;
  };
  const out: Box[] = [];
  for (let r = 0; r < ys.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const x0 = xs[c] + half(VERTICAL, xs[c]);
      const x1 = xs[c + 1] - half(VERTICAL, xs[c + 1]);
      const y0 = ys[r] + half(HORIZONTAL, ys[r]);
      const y1 = ys[r + 1] - half(HORIZONTAL, ys[r + 1]);
      if (xs[c] === PARK.x0 && ys[r] === PARK.y0) continue;
      if (ys[r] === CANAL_ROW.y0 && ys[r + 1] === CANAL_ROW.y1) continue;
      const rand = seeded(r * 31 + c * 7 + 3);
      const w = x1 - x0;
      const h = y1 - y0;
      if (w < 12 || h < 12) continue;
      // Lots along the block: wider blocks get more of them, and deep blocks get a back row.
      const lots = Math.max(1, Math.round(w / (34 + rand() * 18)));
      const rows = h > 80 ? 2 : 1;
      const lotW = w / lots;
      const rowH = h / rows;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < lots; i++) {
          if (rand() < 0.12) continue; // the odd empty lot
          const inset = 2 + rand() * 3;
          const bw = lotW - inset * 2 - rand() * lotW * 0.25;
          const bh = rowH - inset * 2 - rand() * rowH * 0.3;
          // Buildings sit on the street side of their lot.
          const bx = x0 + i * lotW + inset;
          const by = j === 0 ? y0 + inset : y1 - inset - bh;
          out.push({ x: Math.round(bx), y: Math.round(by), w: Math.max(6, Math.round(bw)), h: Math.max(6, Math.round(bh)) });
        }
      }
    }
  }
  return out;
})();

const TREES: { x: number; y: number; r: number }[] = (() => {
  const rand = seeded(99);
  return Array.from({ length: 16 }, () => ({
    x: PARK.x0 + 16 + rand() * (PARK.x1 - PARK.x0 - 32),
    y: PARK.y0 + 16 + rand() * (PARK.y1 - PARK.y0 - 32),
    r: 4 + rand() * 4,
  }));
})();

function roads(width: (s: Street) => number, cls: string) {
  return (
    <g className={cls} fill="none" strokeLinecap="butt">
      {VERTICAL.map((s) => (
        <line key={`v${s.at}`} x1={s.at} y1={-20} x2={s.at} y2={MAP_H + 20} strokeWidth={width(s)} />
      ))}
      {HORIZONTAL.map((s) => (
        <line key={`h${s.at}`} x1={-20} y1={s.at} x2={MAP_W + 20} y2={s.at} strokeWidth={width(s)} />
      ))}
    </g>
  );
}

/** The static map layer. Drawn once; the route, markers and courier go on top of it. */
export const MapBase = memo(function MapBase({ canalId }: { canalId: string }) {
  const casing = (s: Street) => (s.major ? MAJOR : MINOR) + 3;
  const fill = (s: Street) => (s.major ? MAJOR : MINOR);
  return (
    <g>
      <rect x={0} y={0} width={MAP_W} height={MAP_H} className="fill-[#f1f2f4] dark:fill-[#121418]" />

      <g className="fill-[#e3e5ea] stroke-[#d6d9df] dark:fill-[#1d2027] dark:stroke-[#262a33]" strokeWidth={0.8}>
        {BUILDINGS.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={1.5} />
        ))}
      </g>

      {/* Park with winding footpaths */}
      <rect x={PARK.x0} y={PARK.y0} width={PARK.x1 - PARK.x0} height={PARK.y1 - PARK.y0} className="fill-[#d5ecd9] dark:fill-[#14281b]" />
      <path
        d={`M${PARK.x0} ${PARK.y0 + 80} C ${PARK.x0 + 40} ${PARK.y0 + 70}, ${PARK.x0 + 60} ${PARK.y0 + 30}, ${PARK.x1} ${PARK.y0 + 40} M${PARK.x0 + 60} ${PARK.y1} C ${PARK.x0 + 55} ${PARK.y0 + 80}, ${PARK.x0 + 80} ${PARK.y0 + 50}, ${PARK.x0 + 70} ${PARK.y0}`}
        fill="none"
        strokeWidth={2}
        strokeDasharray="3 3"
        className="stroke-white/90 dark:stroke-white/15"
      />
      <g className="fill-[#a9d6b2] dark:fill-[#1d3a26]">
        {TREES.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r={t.r} />
        ))}
      </g>

      {/* Canal with a green bank */}
      <path d={CANAL} fill="none" strokeWidth={84} className="stroke-[#dcefdf] dark:stroke-[#13231a]" />
      <path id={canalId} d={CANAL} fill="none" strokeWidth={36} className="stroke-[#c7def6] dark:stroke-[#0f2236]" />

      {/* Roads: every casing first, then every fill, so crossings merge cleanly and bridges sit over the water */}
      {roads(casing, "stroke-[#d3d7de] dark:stroke-[#090a0d]")}
      {roads(fill, "stroke-white dark:stroke-[#2a2e37]")}

      {/* Street names, on their roads */}
      <g className="fill-[#8a8f9a] font-mono dark:fill-[#6b7080]" fontSize={7.5} letterSpacing="0.08em" dominantBaseline="central" textAnchor="middle">
        {HORIZONTAL.filter((s) => s.name).map((s) => (
          <text key={s.name} x={s.labelAt} y={s.at} fontSize={s.major ? 8 : 7}>
            {s.name}
          </text>
        ))}
        {VERTICAL.filter((s) => s.name).map((s) => (
          <text key={s.name} x={s.at} y={s.labelAt} transform={`rotate(-90 ${s.at} ${s.labelAt})`} fontSize={s.major ? 8 : 7}>
            {s.name}
          </text>
        ))}
      </g>
      <text className="fill-[#6f93bf] dark:fill-[#4d74a3]" fontSize={8} fontStyle="italic" letterSpacing="0.2em" dominantBaseline="central">
        <textPath href={`#${canalId}`} startOffset="8%">
          EAST CANAL
        </textPath>
      </text>
    </g>
  );
});
```

--- components/order-tracking/order-tracking.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DROPOFF, MapBase, PICKUP, ROUTE, ROUTE_ARROWS, STOPS } from "./route-map";

export interface OrderTrackingStage {
  name: string;
  /** Time shown under the name, for example "Nov 12, 6:48 PM". The last stage gets the arrival time. */
  when?: string;
  /** One line that opens under the stage on hover or focus. */
  detail?: string;
}

export interface OrderTrackingUpdate {
  text: string;
  /** When it drops into the feed: a fraction of the route (0 to 1), or the index of a drop-off stop. */
  at?: number;
  stop?: number;
}

export interface OrderTrackingProps {
  orderId?: string;
  orderTitle?: string;
  address?: string;
  courier?: { name: string; initials: string; rating?: string; vehicle?: string };
  /** Stages in order. Every stage but the last starts checked; the last one checks on arrival. */
  stages?: OrderTrackingStage[];
  updates?: OrderTrackingUpdate[];
  /** Minutes on the clock when the ride starts. Counts down to arrival. */
  etaMinutes?: number;
  /** Clock time the ride starts at, as [hour 0-23, minute]. Feed and arrival times count on from it. */
  startTime?: [number, number];
  /** How long the ride takes on screen, in milliseconds, not counting the pauses at the stops. */
  durationMs?: number;
  /** Rides on its own when the section scrolls into view, and starts over a few seconds after arriving. */
  autoplay?: boolean;
  onMessage?: () => void;
  onCall?: () => void;
  className?: string;
}

export const DEFAULT_COURIER_STAGES: OrderTrackingStage[] = [
  { name: "Order placed", when: "Nov 12, 6:48 PM", detail: "Paid by card, receipt sent" },
  { name: "Packed", when: "Nov 13, 8:10 AM", detail: "3 items, 1.8 kg, padded box" },
  { name: "Left the hub", when: "9:32 AM", detail: "Eastside hub, bay 6" },
  { name: "Out for delivery", when: "11:58 AM", detail: "Three stops, yours is the last" },
  { name: "Delivered", detail: "Photo proof on arrival" },
];

export const DEFAULT_COURIER_UPDATES: OrderTrackingUpdate[] = [
  { at: 0, text: "Mira picked up your parcel at the Eastside hub" },
  { stop: 0, text: "Dropping off nearby, 2 stops before you" },
  { stop: 1, text: "One more stop, then you" },
  { at: 0.86, text: "Turning onto Calder Lane" },
];

/* The travelled part of the route is drawn as one dash on a path normalised to length 1. */
const ROUTE_DASH = { strokeDasharray: "1 1", strokeDashoffset: 1 };
const DEFAULT_START: [number, number] = [12, 2];
const DEFAULT_COURIER = { name: "Mira Okafor", initials: "MO", rating: "4.9", vehicle: "Cargo e-bike, NX-22" };

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** Seconds the courier waits at each drop-off. */
const STOP_PAUSE = 1.6;

/** True while the element is on screen and the tab is visible. */
function useOnScreen(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setOn(shown && inView);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    const vis = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ref, enabled]);
  return on;
}

function clock([h0, m0]: [number, number], minutes: number) {
  const total = h0 * 60 + m0 + Math.round(minutes);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** One digit on its own rolling column, so 10 becoming 9 never jumps the whole number. */
function RollingNumber({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="inline-flex tabular-nums" aria-hidden>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="inline-block h-[1em] overflow-hidden leading-none">
          <motion.span
            className="flex flex-col"
            animate={{ y: `-${Number(d)}em` }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="h-[1em]">
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

type FeedItem = { id: number; text: string; time: string };

/**
 * A live delivery tracker. A courier rides a street map to the door, pausing at the drop-offs before
 * yours while the route fills in behind them. The arrival time rolls down digit by digit, stages check
 * off, updates drop into a feed, and on arrival a proof-of-delivery card lands. Hover the map for what is
 * at each point; hover or focus a stage for its detail. Under reduced motion it shows the delivered state.
 */
export function OrderTracking({
  orderId = "Order NX-4182",
  orderTitle = "Ceramic pour-over set and 2 more",
  address = "17 Calder Lane, Unit 4",
  courier = DEFAULT_COURIER,
  stages = DEFAULT_COURIER_STAGES,
  updates = DEFAULT_COURIER_UPDATES,
  etaMinutes = 14,
  startTime = DEFAULT_START,
  durationMs = 19000,
  autoplay = true,
  onMessage,
  onCall,
  className,
}: OrderTrackingProps) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const courierRef = useRef<SVGGElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(section, autoplay && !reduce);

  const [run, setRun] = useState(0);
  const [minLeft, setMinLeft] = useState(etaMinutes);
  const [stopsDone, setStopsDone] = useState(0);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [arrivedAt, setArrivedAt] = useState<string | null>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const courierPos = useRef({ x: PICKUP.x, y: PICKUP.y });
  const headingRef = useRef<SVGGElement>(null);
  const canalId = `canal-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const stopAt = useMemo(() => {
    // Where along the route each stop sits, measured once from the path itself.
    if (typeof document === "undefined") return [0.25, 0.55];
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", ROUTE);
    const L = p.getTotalLength();
    return STOPS.map((s) => {
      let best = 0;
      let bd = Infinity;
      for (let l = 0; l <= L; l += 2) {
        const q = p.getPointAtLength(l);
        const d = (q.x - s.x) ** 2 + (q.y - s.y) ** 2;
        if (d < bd) {
          bd = d;
          best = l;
        }
      }
      return best / L;
    });
  }, []);

  const place = useCallback((f: number) => {
    const path = routeRef.current;
    if (!path) return;
    const L = path.getTotalLength();
    const p = path.getPointAtLength(f * L);
    const a = path.getPointAtLength(Math.max(0, f * L - 2));
    const b = path.getPointAtLength(Math.min(L, f * L + 2));
    courierPos.current = { x: p.x, y: p.y };
    courierRef.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
    // The puck's arrow turns with the road.
    headingRef.current?.setAttribute("transform", `rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90})`);
    path.style.strokeDashoffset = String(1 - f);
    if (barRef.current) barRef.current.style.width = `${f * 100}%`;
  }, []);

  // Delivered at rest under reduced motion or with autoplay off.
  const still = !!reduce || !autoplay;
  const stillFeed = useMemo<FeedItem[]>(
    () => [
      { id: 0, text: "Delivered to your front door", time: clock(startTime, etaMinutes) },
      ...updates.slice(-2).reverse().map((u, i) => ({ id: -1 - i, text: u.text, time: clock(startTime, etaMinutes - 2 - i * 3) })),
    ],
    [startTime, etaMinutes, updates],
  );

  const restartRide = useCallback(() => {
    setFeed([]);
    setArrivedAt(null);
    setStopsDone(0);
    setMinLeft(etaMinutes);
    setRun((r) => r + 1);
  }, [etaMinutes]);

  useEffect(() => {
    if (still) {
      place(1);
      return;
    }
    if (!onScreen) return;
    let raf = 0;
    let restart = 0;
    let last = performance.now();
    let elapsed = 0;
    let pauseLeft = 0;
    let hit = 0;
    const fed = new Set<number>();
    let feedId = 0;
    place(0);

    const push = (text: string, minutes: number) =>
      setFeed((f) => [{ id: ++feedId, text, time: clock(startTime, minutes) }, ...f].slice(0, 3));

    const tick = (now: number) => {
      // Capped so a long frame gap (a background tab) never jumps the courier across the map.
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      if (pauseLeft > 0) pauseLeft -= dt;
      else elapsed += dt;
      const f = Math.min(1, (elapsed * 1000) / durationMs);
      while (hit < stopAt.length && f >= stopAt[hit]) {
        hit += 1;
        setStopsDone(hit);
        pauseLeft = STOP_PAUSE;
      }
      place(f);
      const gone = etaMinutes * f;
      setMinLeft(Math.max(0, Math.ceil(etaMinutes - gone)));
      updates.forEach((u, i) => {
        if (fed.has(i)) return;
        if ((u.at !== undefined && f >= u.at) || (u.stop !== undefined && hit > u.stop)) {
          fed.add(i);
          push(u.text, gone);
        }
      });
      if (f >= 1) {
        const t = clock(startTime, etaMinutes);
        setArrivedAt(t);
        push("Delivered to your front door", etaMinutes);
        restart = window.setTimeout(restartRide, 6000);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(restart);
    };
  }, [run, onScreen, still, durationMs, etaMinutes, startTime, updates, stopAt, place, restartRide]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showTip = (text: string, x: number, y: number) => {
    const box = mapRef.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ text, x: (x / 640) * box.width, y: (y / 600) * box.height });
  };

  const shownArrival = still ? clock(startTime, etaMinutes) : arrivedAt;
  const shownFeed = still ? stillFeed : feed;
  const shownStops = still ? STOPS.length : stopsDone;
  const arrived = shownArrival !== null;
  const doneStages = arrived ? stages.length : stages.length - 1;

  return (
    <MotionConfig reducedMotion="user">
      <section ref={section} aria-label="Order tracking" className={cn("@container w-full bg-[#f5f5f7] px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}>
        <div className="mx-auto grid max-w-[1100px] gap-3.5 rounded-[28px] bg-white p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.03),0_30px_60px_-30px_rgba(20,20,40,0.25)] @[780px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] dark:bg-[#141418] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_60px_-30px_rgba(0,0,0,0.8)]">
          {/* Map */}
          <div ref={mapRef} className="relative aspect-[640/600] max-w-full self-start overflow-hidden rounded-[20px] bg-[#f9f9fb] dark:bg-[#141418]">
            <svg viewBox="0 0 640 600" className="block h-full w-full" onPointerLeave={() => setTip(null)} aria-hidden>
              <MapBase canalId={canalId} />

              {/* Route: a white casing, the road still to ride, the part already ridden, and arrows showing the way */}
              <path d={ROUTE} fill="none" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" className="stroke-white dark:stroke-[#0b0c10]" />
              <path d={ROUTE} fill="none" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" className="stroke-[#aebcff] dark:stroke-[#36447e]" />
              <path ref={routeRef} d={ROUTE} pathLength={1} style={ROUTE_DASH} fill="none" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" className="stroke-[#3253ff] dark:stroke-[#7b92ff]" />
              <g fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="stroke-white/95 dark:stroke-white/80">
                {ROUTE_ARROWS.map((a, i) => (
                  <path key={i} d="M-1.8 -2.6 L1.4 0 L-1.8 2.6" transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`} />
                ))}
              </g>

              {STOPS.map((s, i) => (
                <g key={i} transform={`translate(${s.x} ${s.y})`} className="cursor-pointer" onPointerEnter={() => showTip(s.label, s.x, s.y)}>
                  <circle
                    r={8.5}
                    strokeWidth={2.5}
                    className={cn(
                      "transition-colors duration-300",
                      i < shownStops ? "fill-[#3253ff] stroke-white dark:fill-[#7b92ff] dark:stroke-[#0b0c10]" : "fill-white stroke-[#3253ff] dark:fill-[#141418] dark:stroke-[#7b92ff]",
                    )}
                  />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={8.5} fontWeight={700} className={i < shownStops ? "fill-white dark:fill-[#0b0c10]" : "fill-[#3253ff] dark:fill-[#7b92ff]"}>
                    {i + 1}
                  </text>
                </g>
              ))}

              {/* Pickup: where the ride starts */}
              <g transform={`translate(${PICKUP.x} ${PICKUP.y})`} onPointerEnter={() => showTip("Pickup, Eastside hub", PICKUP.x, PICKUP.y)}>
                <circle r={13} strokeWidth={3} className="fill-[#16161a] stroke-white dark:fill-[#f2f2f5] dark:stroke-[#0b0c10]" />
                <path d="M-5 -1.5 L0 -4.5 L5 -1.5 V4 H-5 Z M-5 -1.5 L0 1.5 L5 -1.5 M0 1.5 V4" fill="none" strokeWidth={1.4} strokeLinejoin="round" className="stroke-white dark:stroke-[#16161a]" />
                <g transform="translate(18 -1)">
                  <rect x={0} y={-10} width={70} height={20} rx={10} className="fill-white/95 stroke-[#e2e4e9] dark:fill-[#1b1d23]/95 dark:stroke-[#2a2e37]" strokeWidth={1} />
                  <text x={10} y={0} dominantBaseline="central" fontSize={9} fontWeight={600} className="fill-[#16161a] dark:fill-[#f2f2f5]">
                    Pickup
                  </text>
                  <text x={44} y={0} dominantBaseline="central" fontSize={8} className="fill-[#6c6c78] dark:fill-[#9a9aa6]">
                    Hub
                  </text>
                </g>
              </g>

              {/* Drop-off: a pin on the door */}
              <g transform={`translate(${DROPOFF.x} ${DROPOFF.y})`} onPointerEnter={() => showTip(address, DROPOFF.x, DROPOFF.y - 30)}>
                {!arrived && !reduce && (
                  <motion.ellipse
                    rx={12}
                    ry={5}
                    fill="none"
                    strokeWidth={1.5}
                    className="stroke-[#16161a]/40 dark:stroke-[#f2f2f5]/40"
                    animate={{ scale: [0.6, 1.8], opacity: [1, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <ellipse rx={6} ry={2.4} className="fill-black/20 dark:fill-black/50" />
                <path d="M0 0 C -4 -9, -15 -14, -15 -26 A15 15 0 1 1 15 -26 C 15 -14, 4 -9, 0 0 Z" className="fill-[#16161a] dark:fill-[#f2f2f5]" />
                <path d="M-6 -25 L0 -31 L6 -25 M-4.5 -26.5 V-20 H4.5 V-26.5" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="stroke-white dark:stroke-[#16161a]" />
                <g transform="translate(-22 -26)">
                  <rect x={-92} y={-11} width={92} height={22} rx={11} className="fill-white/95 stroke-[#e2e4e9] dark:fill-[#1b1d23]/95 dark:stroke-[#2a2e37]" strokeWidth={1} />
                  <text x={-81} y={0} dominantBaseline="central" fontSize={9} fontWeight={600} className="fill-[#16161a] dark:fill-[#f2f2f5]">
                    Drop-off
                  </text>
                  <text x={-38} y={0} dominantBaseline="central" fontSize={8} className="fill-[#6c6c78] dark:fill-[#9a9aa6]">
                    {arrived ? "Done" : "You"}
                  </text>
                </g>
              </g>

              {/* The courier: a navigation puck whose arrow points along the road */}
              <g
                ref={courierRef}
                transform={`translate(${PICKUP.x} ${PICKUP.y})`}
                className="cursor-pointer"
                onPointerEnter={() => showTip(arrived ? `${courier.name.split(" ")[0]}, delivered` : `${courier.name.split(" ")[0]}, ${minLeft} min away`, courierPos.current.x, courierPos.current.y)}
              >
                {!reduce && !arrived && (
                  <motion.circle
                    r={24}
                    className="fill-[#3253ff]/20 dark:fill-[#7b92ff]/25"
                    animate={{ scale: [0.55, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <circle r={14} strokeWidth={3.5} className="fill-[#3253ff] stroke-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:fill-[#7b92ff] dark:stroke-[#0b0c10]" />
                <g ref={headingRef} transform="rotate(0)">
                  <path d="M0 -7 L5.5 5 L0 2.2 L-5.5 5 Z" className="fill-white dark:fill-[#0b0c10]" />
                </g>
              </g>

              {/* Scale and north */}
              <g transform="translate(560 572)" className="fill-[#6c6c78] dark:fill-[#9a9aa6]" fontSize={8}>
                <path d="M0 -3 V2 H50 V-3" fill="none" strokeWidth={1.3} className="stroke-[#6c6c78] dark:stroke-[#9a9aa6]" />
                <text x={25} y={-7} textAnchor="middle">
                  200 m
                </text>
              </g>
              <g transform="translate(612 548)">
                <circle r={10} className="fill-white/90 stroke-[#e2e4e9] dark:fill-[#1b1d23]/90 dark:stroke-[#2a2e37]" strokeWidth={1} />
                <path d="M0 -6 L3 2 L0 0.5 L-3 2 Z" className="fill-[#e5484d]" />
                <text y={7.5} textAnchor="middle" fontSize={5.5} fontWeight={700} className="fill-[#6c6c78] dark:fill-[#9a9aa6]">
                  N
                </text>
              </g>
            </svg>
            <div className="absolute left-3.5 top-3.5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[12.5px] font-medium text-[#16161a] shadow-[0_0_0_1px_#e6e6ec] backdrop-blur-md dark:bg-[#141418]/90 dark:text-[#f2f2f5] dark:shadow-[0_0_0_1px_#24242b]">
              <span className="relative flex size-[7px]">
                {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#12a865] opacity-60 dark:bg-[#3ddc8f]" />}
                <span className="relative size-[7px] rounded-full bg-[#12a865] dark:bg-[#3ddc8f]" />
              </span>
              Live · {address}
            </div>
            <AnimatePresence>
              {tip && (
                <motion.div
                  key={tip.text}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ left: tip.x, top: tip.y }}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+18px)] whitespace-nowrap rounded-[10px] bg-[#16161a] px-2.5 py-1.5 text-[12px] font-medium text-white dark:bg-[#f2f2f5] dark:text-[#16161a]"
                >
                  {tip.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel */}
          <div className="flex min-w-0 flex-col gap-4 px-2 pb-2 pt-2.5 text-[#16161a] dark:text-[#f2f2f5]">
            <div>
              <div className="font-mono text-[11.5px] text-[#6c6c78] dark:text-[#9a9aa6]">{orderId}</div>
              <div className="mt-0.5 text-[15px] font-medium">{orderTitle}</div>
            </div>
            <div>
              <div className="text-[12px] text-[#6c6c78] dark:text-[#9a9aa6]">{arrived ? "Delivered at" : "Arriving in"}</div>
              <div className="flex h-[46px] items-baseline gap-2 text-[44px] font-semibold leading-none tracking-[-0.045em]" aria-live="polite">
                {arrived ? (
                  <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[34px] tracking-[-0.04em]">
                    {shownArrival}
                  </motion.span>
                ) : (
                  <>
                    <span className="sr-only">{minLeft} minutes</span>
                    <RollingNumber value={Math.max(1, minLeft)} />
                    <span className="text-[22px] font-medium tracking-[-0.02em]" aria-hidden>
                      min
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded bg-[#ececf1] dark:bg-[#1c1c22]">
                <div ref={barRef} className="h-full w-0 rounded bg-[#3253ff] dark:bg-[#7b92ff]" />
              </div>
            </div>

            <ol className="grid">
              {stages.map((s, i) => {
                const done = i < doneStages;
                const current = !arrived && i === stages.length - 2;
                const last = i === stages.length - 1;
                return (
                  <li
                    key={s.name}
                    tabIndex={0}
                    className={cn("group relative -mx-2 grid grid-cols-[22px_minmax(0,1fr)] gap-x-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f6f6f9] dark:hover:bg-[#1c1c22]", FOCUS)}
                  >
                    {!last && (
                      <span aria-hidden className={cn("absolute bottom-[-6px] left-[18px] top-[30px] w-0.5 transition-colors duration-500", done ? "bg-[#16161a] dark:bg-[#f2f2f5]" : "bg-[#e6e6ec] dark:bg-[#24242b]")} />
                    )}
                    <span
                      className={cn(
                        "relative z-[1] grid size-[22px] place-items-center rounded-full border-2 transition-colors duration-300",
                        done ? "border-[#16161a] bg-[#16161a] dark:border-[#f2f2f5] dark:bg-[#f2f2f5]" : "border-[#a6a6b2] bg-white dark:border-[#5d5d68] dark:bg-[#141418]",
                        current && "shadow-[0_0_0_4px_rgba(50,83,255,0.14)]",
                      )}
                    >
                      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                        <motion.path
                          d="M2.5 6.2l2.3 2.3 4.7-5"
                          fill="none"
                          strokeWidth={3}
                          className="stroke-white dark:stroke-[#141418]"
                          initial={false}
                          animate={{ pathLength: done ? 1 : 0 }}
                          transition={{ duration: 0.4, delay: 0.15 }}
                        />
                      </svg>
                    </span>
                    <div>
                      <div className={cn("text-[14px] font-medium", !done && "text-[#a6a6b2] dark:text-[#5d5d68]")}>
                        {s.name}
                        <span className="sr-only">{done ? ", done" : ", not yet"}</span>
                      </div>
                      <div className="font-mono text-[11px] text-[#6c6c78] dark:text-[#9a9aa6]">{last ? (arrived ? shownArrival : "") : s.when}</div>
                    </div>
                    {s.detail && (
                      <div className="col-start-2 max-h-0 overflow-hidden text-[12.5px] text-[#6c6c78] opacity-0 transition-all duration-200 group-hover:max-h-10 group-hover:opacity-100 group-focus-visible:max-h-10 group-focus-visible:opacity-100 dark:text-[#9a9aa6]">
                        {s.detail}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <AnimatePresence>
              {arrived && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex items-center gap-3 rounded-2xl bg-[#f6f6f9] p-2.5 shadow-[inset_0_0_0_1px_#e6e6ec] dark:bg-[#1c1c22] dark:shadow-[inset_0_0_0_1px_#24242b]"
                >
                  <svg viewBox="0 0 64 64" className="size-16 flex-none rounded-[10px]" aria-hidden>
                    <rect width={64} height={64} fill="#c9b79c" />
                    <rect x={16} y={6} width={32} height={50} rx={2} fill="#3c4a5c" />
                    <rect x={20} y={10} width={24} height={18} rx={1.5} fill="#4b5b70" />
                    <rect x={20} y={32} width={24} height={20} rx={1.5} fill="#4b5b70" />
                    <circle cx={42} cy={34} r={1.6} fill="#e3c27a" />
                    <rect y={54} width={64} height={10} fill="#9f8e75" />
                    <rect x={22} y={42} width={20} height={14} rx={1.5} fill="#d9a35f" />
                    <rect x={22} y={42} width={20} height={3} fill="#c48b48" />
                    <rect x={30} y={42} width={4} height={14} fill="#f1e2c4" opacity={0.8} />
                  </svg>
                  <div>
                    <b className="block text-[13.5px] font-semibold">Left at your front door</b>
                    <span className="text-[12px] text-[#6c6c78] dark:text-[#9a9aa6]">
                      Photo taken by {courier.name.split(" ")[0]}, {shownArrival}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 border-t border-[#e6e6ec] pt-3.5 dark:border-[#24242b]">
              <span aria-hidden className="grid size-10 flex-none place-items-center rounded-full bg-[conic-gradient(from_200deg,#3253ff,#8a5cff,#ff6b8b,#ffb35c,#3253ff)] text-[14px] font-semibold text-white">
                {courier.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] text-[#6c6c78] dark:text-[#9a9aa6]">Your courier</div>
                <div className="flex items-center gap-1.5 font-semibold">
                  {courier.name}
                  {courier.rating && <small className="text-[12px] font-medium text-[#6c6c78] dark:text-[#9a9aa6]">★ {courier.rating}</small>}
                </div>
                {courier.vehicle && <div className="text-[12px] text-[#6c6c78] dark:text-[#9a9aa6]">{courier.vehicle}</div>}
              </div>
              {[
                { label: `Message ${courier.name.split(" ")[0]}`, d: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z", on: onMessage, note: "Message sent" },
                { label: `Call ${courier.name.split(" ")[0]}`, d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z", on: onCall, note: "Calling" },
              ].map((b) => (
                <motion.button
                  key={b.label}
                  type="button"
                  aria-label={b.label}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => (b.on ? b.on() : setToast(b.note))}
                  className={cn("grid size-9 place-items-center rounded-full border border-[#e6e6ec] bg-white transition-colors hover:bg-[#f6f6f9] dark:border-[#24242b] dark:bg-[#141418] dark:hover:bg-[#1c1c22]", FOCUS)}
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={b.d} />
                  </svg>
                </motion.button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-semibold">
                <span>Live updates</span>
                {arrived && !still && (
                  <button type="button" onClick={restartRide} className={cn("rounded-full px-2 text-[12px] font-medium text-[#3253ff] dark:text-[#7b92ff]", FOCUS)}>
                    Replay
                  </button>
                )}
              </div>
              <ul className="mt-2 grid gap-2.5" aria-live="polite">
                <AnimatePresence initial={false}>
                  {shownFeed.map((item, i) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 26 }}
                      className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-[13px]", i > 0 && "text-[#6c6c78] dark:text-[#9a9aa6]")}
                    >
                      <span>{item.text}</span>
                      <span className="pt-0.5 font-mono text-[11px] text-[#6c6c78] dark:text-[#9a9aa6]">{item.time}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mx-auto mt-4 w-fit rounded-full bg-[#16161a] px-4 py-2 text-[13px] font-medium text-white dark:bg-[#f2f2f5] dark:text-[#16161a]"
            >
              {toast} (sample)
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Order Tracker

Add the "Order Tracker" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { OrderTracker } from "@/components/order-tracking/order-tracker";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/order-tracking/order-tracker.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import {
  AnimatePresence,
  type MotionValue,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type TrackStep = {
  id: string;
  label: string;
  time: string;
  at: number;
  eta: string;
  note: string;
};
export type OrderTrackerProps = {
  title?: string;
  items?: string;
  steps?: TrackStep[];
  /** index of the step the order has reached */
  current?: number;
  driver?: { name: string; avatar: string };
  onStep?: (index: number) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  truck:
    "m255.43 117l-14-35a15.93 15.93 0 0 0-14.85-10H192v-8a8 8 0 0 0-8-8H32a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h17a32 32 0 0 0 62 0h50a32 32 0 0 0 62 0h17a16 16 0 0 0 16-16v-64a8.1 8.1 0 0 0-.57-3M80 208a16 16 0 1 1 16-16a16 16 0 0 1-16 16m-48-72V72h144v64Zm160 72a16 16 0 1 1 16-16a16 16 0 0 1-16 16m0-96V88h34.58l9.6 24Z",
  home: "M224 120v96a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8v-52a4 4 0 0 0-4-4h-40a4 4 0 0 0-4 4v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a16 16 0 0 1 4.69-11.31l80-80a16 16 0 0 1 22.62 0l80 80A16 16 0 0 1 224 120",
  store:
    "M231.69 93.81L217.35 43.6A16.07 16.07 0 0 0 202 32H54a16.07 16.07 0 0 0-15.35 11.6L24.31 93.81A8 8 0 0 0 24 96v16a40 40 0 0 0 16 32v72a8 8 0 0 0 8 8h160a8 8 0 0 0 8-8v-72a40 40 0 0 0 16-32V96a8 8 0 0 0-.31-2.19M88 112a24 24 0 0 1-35.12 21.26a8 8 0 0 0-1.82-1.06A24 24 0 0 1 40 112v-8h48Zm64 0a24 24 0 0 1-48 0v-8h48Zm64 0a24 24 0 0 1-11.07 20.2a8 8 0 0 0-1.8 1.05A24 24 0 0 1 168 112v-8h48Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  phone:
    "M231.88 175.08A56.26 56.26 0 0 1 176 224C96.6 224 32 159.4 32 80a56.26 56.26 0 0 1 48.92-55.88a16 16 0 0 1 16.62 9.52l21.12 47.15v.12A16 16 0 0 1 117.39 96c-.18.27-.37.52-.57.77L96 121.45c7.49 15.22 23.41 31 38.83 38.51l24.34-20.71a8 8 0 0 1 .75-.56a16 16 0 0 1 15.17-1.4l.13.06l47.11 21.11a16 16 0 0 1 9.55 16.62",
  chat: "M128 24a104 104 0 0 0-91.82 152.88l-11.35 34.05a16 16 0 0 0 20.24 20.24l34.05-11.35A104 104 0 1 0 128 24M84 140a12 12 0 1 1 12-12a12 12 0 0 1-12 12m44 0a12 12 0 1 1 12-12a12 12 0 0 1-12 12m44 0a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  pkg: "m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.35 44l-29.78 16.29l-80.35-44Zm0 88L47.65 76l33.91-18.57l80.35 44Zm88 55.85l-80 43.79v-85.81l32-17.51V152a8 8 0 0 0 16 0v-44.44l32-17.51v85.76Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

// `at` is how far along the last-mile route the van is at that step, 0 at the depot and 1 at your door
const DEFAULT_STEPS: TrackStep[] = [
  {
    id: "ordered",
    label: "Ordered",
    time: "9:12",
    at: 0,
    eta: "2:30–4:30 PM",
    note: "We've got your order",
  },
  {
    id: "packed",
    label: "Packed",
    time: "10:40",
    at: 0,
    eta: "2:30–4:30 PM",
    note: "Packed and labelled at the depot",
  },
  {
    id: "shipped",
    label: "Shipped",
    time: "1:58",
    at: 0.06,
    eta: "2:40–3:40 PM",
    note: "Loaded on the van, 3 stops before yours",
  },
  {
    id: "way",
    label: "On the way",
    time: "2:31",
    at: 0.45,
    eta: "2:55–3:10 PM",
    note: "1 stop before yours",
  },
  {
    id: "done",
    label: "Delivered",
    time: "3:02",
    at: 1,
    eta: "3:02 PM",
    note: "Left at the front door",
  },
];
// other people's drop-offs along the way
const STOPS = [0.3, 0.6];
const W = 340;
const H = 176;
// how much of the map shows: the camera looks across it at an angle, like a navigation view
const HV = 200;
// where on the screen the van sits while following it
const AX = W / 2;
const AY = HV * 0.6;
const ROUTE =
  "M 34 44 H 112 Q 124 44 124 56 V 98 Q 124 110 136 110 H 222 Q 234 110 234 98 V 74 Q 234 62 246 62 H 284 Q 296 62 296 74 V 142";

/**
 * A delivery tracker with a little map. The van follows the real route along the streets, the road behind it filling
 * in blue as it goes, slowing into each of the other drop-offs before yours and pulling away again, while the arrival
 * window narrows and its times roll. Click any step in the timeline to see where your parcel was then: the van drives
 * back or forward along the route to that point. When it reaches your door the pin turns into a green tick with a
 * ripple and the whole route turns green behind it. Steps are buttons, so Tab and Enter work.
 */
export default function OrderTracker({
  title = "Arriving today",
  items = "Linen shirt and 2 more",
  steps = DEFAULT_STEPS,
  current = 3,
  driver = {
    name: "Tomás",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20curly%20hair/Dark/3D/man_curly_hair_3d_dark.png",
  },
  onStep,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: OrderTrackerProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [step, setStep] = useState(current);
  const stepRef = useRef(step);
  stepRef.current = step;
  const [noted, setNoted] = useState(false);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(600);
  const dist = useMotionValue(steps[current]?.at ?? 0);
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);
  const ang = useMotionValue(0);
  const flip = useMotionValue(1);
  const done = steps[step]?.id === "done";
  const following = steps[step]?.id === "way";
  const followRef = useRef(following);
  followRef.current = following;
  // the camera: where it looks, how close and how steeply
  const camTX = useMotionValue(W / 2);
  const camTY = useMotionValue(H / 2);
  const zoomT = useMotionValue(1);
  const tiltT = useMotionValue(28);
  const camX = useSpring(camTX, { stiffness: 46, damping: 15 });
  const camY = useSpring(camTY, { stiffness: 46, damping: 15 });
  const zoom = useSpring(zoomT, { stiffness: 40, damping: 14 });
  const tilt = useSpring(tiltT, { stiffness: 40, damping: 14 });
  const plane = useTransform(
    [camX, camY, zoom, tilt],
    ([x, y, z, t]: number[]) => `translate(${AX - x}px, ${AY - y}px) rotateX(${t}deg) scale(${z})`,
  );
  const planeOrigin = useTransform([camX, camY], ([x, y]: number[]) => `${x}px ${y}px`);
  // markers stand up out of the map and keep their size, like pins in a navigation app
  const cam = { x: camX, y: camY, z: zoom, t: tilt };
  const heading = useTransform(ang, (a) => `translate(-50%, -50%) rotate(${a}deg)`);
  const [pop, setPop] = useState<{ k: number; at: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // overview when the van isn't moving, close behind it when it is
  useEffect(() => {
    const snap = reduce;
    const set = (mv: typeof camTX, v: number) => (snap ? mv.jump(v) : mv.set(v));
    if (following) {
      set(zoomT, 1.75);
      set(tiltT, 48);
      set(camTX, vx.get());
      set(camTY, vy.get());
    } else {
      set(zoomT, 0.94);
      set(tiltT, done ? 24 : 32);
      set(camTX, W / 2 + 6);
      set(camTY, H * 0.66);
    }
    if (snap) {
      camX.jump(camTX.get());
      camY.jump(camTY.get());
      zoom.jump(zoomT.get());
      tilt.jump(tiltT.get());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [following, done, reduce]);

  useEffect(() => {
    const r = route.current;
    if (!r) return;
    const L = r.getTotalLength();
    setLen(L);
    let lastX = 0;
    const place = (d: number) => {
      const c = Math.max(0, Math.min(1, d));
      const pt = r.getPointAtLength(c * L);
      const ah = r.getPointAtLength(Math.min(L, c * L + 4));
      const bh = r.getPointAtLength(Math.max(0, c * L - 4));
      if (Math.abs(pt.x - lastX) > 0.3) flip.set(pt.x < lastX ? -1 : 1);
      lastX = pt.x;
      vx.set(pt.x);
      vy.set(pt.y);
      ang.set((Math.atan2(ah.y - bh.y, ah.x - bh.x) * 180) / Math.PI);
      if (followRef.current) {
        camTX.set(pt.x);
        camTY.set(pt.y);
      }
    };
    place(dist.get());
    return dist.on("change", place);
  }, [dist, vx, vy, flip, ang, camTX, camTY]);
  const dash = useTransform(dist, (d) => len * (1 - Math.max(0, Math.min(1, d))));
  // minutes to your door, from how much of the route is left
  const [mins, setMins] = useState(1);
  useEffect(() => {
    const f = (d: number) =>
      setMins((m) => {
        const n = Math.max(1, Math.round((1 - d) * 22));
        return m === n ? m : n;
      });
    f(dist.get());
    return dist.on("change", f);
  }, [dist]);
  // how many other drop-offs are still ahead
  const [ahead, setAhead] = useState(STOPS.filter((s) => s > (steps[current]?.at ?? 0) + 0.001).length);
  useEffect(
    () =>
      dist.on("change", (d) => {
        const n = STOPS.filter((s) => s > d + 0.001).length;
        setAhead((a) => (a === n ? a : n));
      }),
    [dist],
  );

  /** drive to a point, easing in and out like a vehicle, and slowing for the stops in between */
  const drive = async (to: number) => {
    if (reduce) {
      dist.set(to);
      return;
    }
    const from = dist.get();
    const legs = [
      ...STOPS.filter((s) => (to > from ? s > from + 0.001 && s < to - 0.001 : s < from - 0.001 && s > to + 0.001)),
      to,
    ];
    if (to < from) legs.sort((a, b) => b - a);
    let at = from;
    for (const leg of legs) {
      const d = Math.abs(leg - at);
      sfx.whoosh(500, 900, { dur: Math.min(0.9, 0.3 + d * 1.6), gain: 0.02 });
      await animate(dist, leg, {
        duration: Math.max(0.35, d * 2.6),
        ease: [0.45, 0, 0.3, 1],
      }).then(() => undefined);
      at = leg;
      if (leg !== to) {
        sfx.tick({ freq: 1600, gain: 0.03 });
        if (to > from) {
          setPop({ k: Date.now(), at: leg });
          sfx.note(1046, { at: 0.25, dur: 0.15, gain: 0.025, bell: 0.4 });
        }
        await new Promise((r) => setTimeout(r, to > from ? 1000 : 120));
      }
    }
  };
  const goStep = async (i: number) => {
    const s = steps[i];
    if (!s) return;
    setStep(i);
    onStep?.(i);
    sfx.tick({ freq: 2400, gain: 0.03 });
    await drive(s.at);
    if (s.id === "done") {
      sfx.note(784, { dur: 0.25, gain: 0.045, bell: 0.5 });
      sfx.note(1175, { at: 0.1, dur: 0.5, gain: 0.04, bell: 0.6 });
    }
  };

  // autoplay: the whole journey, from leaving the depot to the door, then a look back
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 520) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(100);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1000);
      while (ok()) {
        dist.set(steps[2].at);
        setStep(2);
        setNoted(false);
        await wait(1200);
        if (!ok()) return;
        // live: it sets off
        setStep(3);
        await drive(steps[3].at);
        await wait(900);
        if (!ok()) return;
        await go("[data-note]");
        await tap();
        setNoted(true);
        sfx.note(988, { dur: 0.15, gain: 0.03 });
        await wait(1100);
        if (!ok()) return;
        setGhost(false);
        setStep(4);
        await drive(1);
        sfx.note(784, { dur: 0.25, gain: 0.045, bell: 0.5 });
        sfx.note(1175, { at: 0.1, dur: 0.5, gain: 0.04, bell: 0.6 });
        await wait(2600);
        if (!ok()) return;
        // look back at when it was packed
        await go('[data-step="1"]');
        await tap();
        await goStep(1);
        await wait(1500);
        setGhost(false);
        await wait(600);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const s = steps[step];
  const vanColor = done ? "#30d158" : "#0071e3";

  return (
    <div
      className={`relative w-full max-w-[400px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 20px 18px",
        }}
      >
        {/* when */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              color: done ? "#248a3d" : "#86868b",
              transition: "color 0.4s",
            }}
          >
            {done ? "Delivered" : title}
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#86868b",
            }}
          >
            <Ico d={I.pkg} size={13} />
            {items}
          </span>
        </div>
        <div
          style={{
            position: "relative",
            height: 40,
            overflow: "hidden",
            marginTop: 2,
          }}
          aria-live="polite"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={s.eta}
              initial={{ y: 30, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -30, opacity: 0, filter: "blur(4px)" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                filter: { duration: 0.25 },
              }}
              style={{
                position: "absolute",
                inset: 0,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.eta}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ fontSize: 13.5, color: "#6e6e73", marginTop: 2 }}>
          {done
            ? s.note
            : step === 3
              ? ahead
                ? `${ahead} stop${ahead > 1 ? "s" : ""} before yours`
                : "You're next"
              : s.note}
        </div>

        {/* the map: a ground plane the camera looks across, with pins standing up out of it */}
        <div
          ref={wrap}
          style={{
            position: "relative",
            marginTop: 14,
            borderRadius: 20,
            overflow: "hidden",
            background: "#dde1e6",
            height: HV * k,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: HV,
              transform: `scale(${k})`,
              transformOrigin: "0 0",
              perspective: 520,
              perspectiveOrigin: `${AX}px ${HV * 0.28}px`,
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: W,
                height: H,
                transformStyle: "preserve-3d",
                transform: plane,
                transformOrigin: planeOrigin,
              }}
            >
              <svg
                viewBox={`-160 -200 ${W + 320} ${H + 300}`}
                width={W + 320}
                height={H + 300}
                style={{
                  position: "absolute",
                  left: -160,
                  top: -200,
                  display: "block",
                  overflow: "visible",
                }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ot-water" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#cfe2f7" />
                    <stop offset="0.5" stopColor="#dcebfb">
                      {!reduce && (
                        <animate attributeName="offset" values="0.2;0.8;0.2" dur="7s" repeatCount="indefinite" />
                      )}
                    </stop>
                    <stop offset="1" stopColor="#cfe2f7" />
                  </linearGradient>
                </defs>
                {/* the ground is the blocks; streets are drawn over it */}
                <rect x={-160} y={-200} width={W + 320} height={H + 300} fill="#dde1e6" />
                <path
                  d="M -160 150 C -60 120 40 128 80 150 S 170 196 236 190 C 300 186 380 200 480 186 L 480 120 L 480 260 L -160 260 Z"
                  fill="url(#ot-water)"
                />
                <rect x="146" y="8" width="70" height="44" rx="10" fill="#d4ead0" />
                <rect x="256" y="86" width="24" height="48" rx="8" fill="#d4ead0" />
                <rect x="-120" y="-150" width="110" height="80" rx="14" fill="#d4ead0" />
                {[
                  [158, 18],
                  [172, 30],
                  [188, 20],
                  [200, 36],
                  [166, 42],
                  [204, 16],
                  [262, 96],
                  [270, 112],
                  [264, 124],
                  [-100, -130],
                  [-80, -110],
                  [-50, -126],
                  [-30, -96],
                  [-70, -88],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#bcdcb4" />
                ))}
                {/* buildings: little raised roofs */}
                {[
                  [8, 10, 34, 20],
                  [48, 12, 40, 16],
                  [10, 60, 30, 24],
                  [70, 58, 36, 14],
                  [70, 76, 36, 12],
                  [142, 70, 34, 30],
                  [184, 72, 36, 26],
                  [256, 10, 30, 22],
                  [292, 12, 40, 34],
                  [142, 122, 36, 12],
                  [184, 120, 36, 16],
                  [10, 116, 40, 18],
                  [70, 118, 40, 16],
                  [-60, 60, 50, 30],
                  [-120, 10, 50, 24],
                  [360, 70, 60, 30],
                  [360, 10, 40, 30],
                  [150, -60, 60, 30],
                  [240, -70, 60, 40],
                  [20, -60, 80, 30],
                  [360, 120, 50, 40],
                  [-110, 100, 60, 30],
                ].map(([x, y, w, h], i) => (
                  <g key={i}>
                    <rect x={x} y={y + 2.5} width={w} height={h} rx="4" fill="#c9ced6" />
                    <rect x={x} y={y} width={w} height={h} rx="4" fill="#ebedf1" />
                  </g>
                ))}
                {/* streets */}
                <g stroke="#ffffff" strokeLinecap="round" fill="none">
                  <path
                    d="M -160 44 H 500 M -160 110 H 500 M 124 -200 V 400 M 234 -200 V 400 M 234 62 H 500 M 296 62 V 400 M 60 -200 V 400 M -30 -200 V 400 M 400 -200 V 400 M -160 -20 H 500"
                    strokeWidth="10"
                  />
                  <path
                    d="M -160 140 L 124 140 M 180 -200 V 110 M 270 110 V 400 M -160 86 H 124 M 340 -200 V 62 M -160 -100 H 500"
                    strokeWidth="5"
                  />
                </g>
                {/* a few other cars going about their day */}
                {!reduce &&
                  [
                    ["M -160 110 H 500", "11s", "#ffffff"],
                    ["M 234 400 V -200", "9s", "#ffffff"],
                    ["M 500 44 H -160", "13s", "#f4f4f6"],
                    ["M 60 -200 V 400", "10s", "#ffffff"],
                  ].map(([d, dur, c], i) => (
                    <rect
                      key={i}
                      x="-3.5"
                      y="-1.8"
                      width="7"
                      height="3.6"
                      rx="1.8"
                      fill={c}
                      stroke="#b8bec7"
                      strokeWidth="0.8"
                    >
                      <animateMotion path={d} dur={dur} begin={`${-i * 2.3}s`} repeatCount="indefinite" rotate="auto" />
                    </rect>
                  ))}
                {/* the route: the way ahead marching towards you, the part driven solid */}
                <path
                  ref={route}
                  d={ROUTE}
                  stroke="#9cc0f4"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="1 8"
                >
                  {!reduce && (
                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.1s" repeatCount="indefinite" />
                  )}
                </path>
                <motion.path
                  d={ROUTE}
                  stroke={vanColor}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={len}
                  style={{ strokeDashoffset: dash, transition: "stroke 0.6s" }}
                />
                {/* arriving: a glint runs the whole way */}
                {done && !reduce && (
                  <motion.path
                    key="glint"
                    d={ROUTE}
                    stroke="#ffffff"
                    strokeOpacity={0.9}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`28 ${len + 40}`}
                    initial={{ strokeDashoffset: 28 }}
                    animate={{ strokeDashoffset: -len }}
                    transition={{
                      duration: 1.1,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.2,
                    }}
                  />
                )}
              </svg>

              {/* the van's heading, lying on the road */}
              {!done && (
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: vx,
                    top: vy,
                    width: 46,
                    height: 46,
                    transform: heading,
                    borderRadius: 23,
                    background: `conic-gradient(from 60deg, transparent 0deg, ${vanColor}55 30deg, transparent 60deg)`,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* soft shadows where the pins stand */}
              {[
                [34, 44],
                [296, 142],
              ].map(([x, y]) => (
                <div
                  key={x}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: x - 10,
                    top: y - 4,
                    width: 20,
                    height: 8,
                    borderRadius: "50%",
                    background: "radial-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0))",
                  }}
                />
              ))}
              {!done && (
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: vx,
                    top: vy,
                    width: 22,
                    height: 9,
                    x: "-50%",
                    y: "-50%",
                    borderRadius: "50%",
                    background: "radial-gradient(rgba(0,40,100,0.32), rgba(0,0,0,0))",
                  }}
                />
              )}
            </motion.div>
          </div>
          {/* pins drawn flat on top, placed where the camera sees their spot on the map */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: HV,
              transform: `scale(${k})`,
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          >
            {/* other drop-offs: a check once the van has been */}
            {STOPS.map((t) => {
              const r = route.current;
              if (!r) return null;
              const pt = r.getPointAtLength(t * len);
              const been = ahead < STOPS.length - STOPS.indexOf(t) || done;
              return (
                <Pin key={t} x={pt.x} y={pt.y} cam={cam}>
                  <motion.div
                    animate={{
                      scale: been ? 1 : 0.8,
                      backgroundColor: been ? "#30d158" : "#ffffff",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    style={{
                      position: "absolute",
                      left: -8,
                      top: -17,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      boxShadow: been ? "0 0 0 2px #fff" : "inset 0 0 0 2px #86868b",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {been && <Ico d={I.check} size={9} />}
                  </motion.div>
                </Pin>
              );
            })}
            {/* a parcel hops out at each stop */}
            <AnimatePresence>
              {pop && route.current && (
                <Pin
                  key={pop.k}
                  x={route.current.getPointAtLength(pop.at * len).x}
                  y={route.current.getPointAtLength(pop.at * len).y}
                  cam={cam}
                >
                  <motion.div
                    initial={{ y: 0, scale: 0.3, opacity: 0 }}
                    animate={{
                      y: [-6, -30, -26],
                      scale: 1,
                      opacity: [0, 1, 1],
                    }}
                    exit={{ opacity: 0, y: -40, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.6, ease: [0.3, 1.4, 0.5, 1] }}
                    onAnimationComplete={() => window.setTimeout(() => setPop(null), 400)}
                    style={{
                      position: "absolute",
                      left: -13,
                      top: -30,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: "#c69a5b",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 6px 10px -4px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Ico d={I.pkg} size={15} />
                  </motion.div>
                </Pin>
              )}
            </AnimatePresence>

            {/* depot */}
            <Pin x={34} y={44} cam={cam}>
              <div
                style={{
                  position: "absolute",
                  left: -13,
                  top: -28,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: "#fff",
                  color: "#6e6e73",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 2px 6px -2px rgba(0,0,0,0.25)",
                }}
              >
                <Ico d={I.store} size={13} />
              </div>
            </Pin>
            {/* your door */}
            <Pin x={296} y={142} cam={cam}>
              {!reduce && !done && (
                <motion.span
                  animate={{ scale: [0.8, 2.4], opacity: [0.28, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    left: -16,
                    top: -34,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: "#1d1d1f",
                  }}
                />
              )}
              <AnimatePresence>
                {done && (
                  <motion.span
                    key="ripple"
                    initial={{ scale: 0.6, opacity: 0.6 }}
                    animate={{ scale: 3.4, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      left: -16,
                      top: -34,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: "#30d158",
                    }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                animate={{
                  backgroundColor: done ? "#30d158" : "#1d1d1f",
                  scale: done ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.45 }}
                style={{
                  position: "absolute",
                  left: -16,
                  top: -34,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 0 0 3px #fff, 0 6px 12px -4px rgba(0,0,0,0.35)",
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={done ? "c" : "h"}
                    initial={{ scale: 0, rotate: -60 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    style={{ display: "grid" }}
                  >
                    <Ico d={done ? I.check : I.home} size={15} />
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </Pin>
            {/* the van */}
            <Pin x={vx} y={vy} cam={cam}>
              {!done && !reduce && (
                <motion.span
                  animate={{ scale: [1, 2.1], opacity: [0.32, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    left: -16,
                    top: -34,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: vanColor,
                  }}
                />
              )}
              <motion.div
                animate={{ opacity: done ? 0 : 1, scale: done ? 0.4 : 1 }}
                style={{
                  position: "absolute",
                  left: -16,
                  top: -34,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: "#fff",
                  color: vanColor,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 6px 14px -4px rgba(0,60,140,0.55)",
                }}
              >
                <motion.span style={{ display: "grid", scaleX: flip }}>
                  <Ico d={I.truck} size={17} />
                </motion.span>
              </motion.div>
              {/* minutes away, riding above it */}
              <AnimatePresence>
                {following && (
                  <motion.div
                    key="eta"
                    initial={{ opacity: 0, y: 6, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: -60,
                      x: "-50%",
                      padding: "3px 8px",
                      borderRadius: 9,
                      background: "#1d1d1f",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 650,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      boxShadow: "0 6px 12px -6px rgba(0,0,0,0.5)",
                    }}
                  >
                    {mins} min
                  </motion.div>
                )}
              </AnimatePresence>
            </Pin>
          </div>
          {/* haze towards the horizon */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "24%",
              background: "linear-gradient(rgba(240,242,245,0.95), rgba(240,242,245,0))",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* the steps */}
        <div
          role="list"
          aria-label="Delivery progress"
          style={{ position: "relative", display: "flex", marginTop: 16 }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${50 / steps.length}%`,
              right: `${50 / steps.length}%`,
              top: 9,
              height: 2,
              borderRadius: 1,
              background: "#e5e5ea",
            }}
          />
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              scaleX: step / (steps.length - 1),
              backgroundColor: vanColor,
            }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            style={{
              position: "absolute",
              left: `${50 / steps.length}%`,
              right: `${50 / steps.length}%`,
              top: 9,
              height: 2,
              borderRadius: 1,
              transformOrigin: "0 50%",
            }}
          />
          {steps.map((st, i) => {
            const past = i <= step;
            const now = i === step;
            return (
              <button
                key={st.id}
                type="button"
                role="listitem"
                data-step={i}
                aria-current={now ? "step" : undefined}
                aria-label={`${st.label}${i <= current ? `, ${st.time}` : ""}`}
                onClick={() => {
                  touched.current = true;
                  void goStep(i);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  background: "transparent",
                  padding: 0,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <motion.span
                  animate={{
                    scale: now ? 1.25 : 1,
                    backgroundColor: past ? vanColor : "#ffffff",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    boxShadow: past ? "0 0 0 3px #fff" : "inset 0 0 0 2px #d2d2d7, 0 0 0 3px #fff",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                  }}
                >
                  {past && !now && <Ico d={I.check} size={10} />}
                  {now && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: "#fff",
                      }}
                    />
                  )}
                </motion.span>
                <span
                  style={{
                    fontSize: 11.5,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontWeight: now ? 650 : 500,
                    color: past ? "#1d1d1f" : "#a1a1a6",
                    minHeight: "1.2em",
                  }}
                >
                  {st.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#a1a1a6",
                    fontVariantNumeric: "tabular-nums",
                    marginTop: -4,
                  }}
                >
                  {i <= Math.max(current, step) ? st.time : " "}
                </span>
              </button>
            );
          })}
        </div>

        {/* the driver */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "#e9f1ff",
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <img
              src={driver.avatar}
              alt=""
              width={30}
              height={30}
              draggable={false}
              style={{ width: 30, height: 30 }}
            />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>{driver.name}, your driver</div>
            <div style={{ position: "relative", height: 17, overflow: "hidden" }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={noted ? "n" : "o"}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    fontSize: 12.5,
                    color: noted ? "#248a3d" : "#86868b",
                    whiteSpace: "nowrap",
                  }}
                >
                  {noted ? "Note sent: leave it at the door" : "Van 4, plate KX 21 BLU"}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <motion.button
            type="button"
            aria-label={`Call ${driver.name}`}
            whileTap={{ scale: 0.88 }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              border: 0,
              background: "#f5f5f7",
              color: "#1d1d1f",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Ico d={I.phone} size={16} />
          </motion.button>
          <motion.button
            type="button"
            data-note
            aria-label="Ask the driver to leave it at the door"
            aria-pressed={noted}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              touched.current = true;
              setNoted((n) => !n);
              sfx.note(988, { dur: 0.15, gain: 0.03 });
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            animate={{
              backgroundColor: noted ? "#e8f8ec" : "#f5f5f7",
              color: noted ? "#248a3d" : "#1d1d1f",
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              border: 0,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Ico d={I.chat} size={16} />
          </motion.button>
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}

type Cam = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  z: MotionValue<number>;
  t: MotionValue<number>;
};
const PERSP = 520;
/** where a spot on the tilted map lands on screen: the same scale, tilt and perspective the map gets, done by hand */
const project = (X: number, Y: number, cx: number, cy: number, z: number, t: number) => {
  const r = (t * Math.PI) / 180;
  const dx = (X - cx) * z;
  const dy = (Y - cy) * z;
  const x0 = AX + dx;
  const y0 = AY + dy * Math.cos(r);
  const depth = dy * Math.sin(r);
  const f = PERSP / (PERSP - depth);
  const oy = HV * 0.28;
  return [AX + (x0 - AX) * f, oy + (y0 - oy) * f, f] as const;
};
function Pin({
  x,
  y,
  cam,
  children,
}: {
  x: number | MotionValue<number>;
  y: number | MotionValue<number>;
  cam: Cam;
  children: ReactNode;
}) {
  const fx = useMotionValue(typeof x === "number" ? x : x.get());
  const fy = useMotionValue(typeof y === "number" ? y : y.get());
  useEffect(() => {
    if (typeof x === "number") fx.set(x);
    else {
      fx.set(x.get());
      return x.on("change", (v) => fx.set(v));
    }
  }, [x, fx]);
  useEffect(() => {
    if (typeof y === "number") fy.set(y);
    else {
      fy.set(y.get());
      return y.on("change", (v) => fy.set(v));
    }
  }, [y, fy]);
  const transform = useTransform([fx, fy, cam.x, cam.y, cam.z, cam.t], ([X, Y, cx, cy, z, t]: number[]) => {
    const [sx, sy, f] = project(X, Y, cx, cy, z, t);
    return `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) scale(${(0.82 + 0.18 * f).toFixed(3)})`;
  });
  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        transform,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </motion.div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
