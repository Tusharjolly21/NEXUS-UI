# Courier Route Tracker

Add the "Courier Route Tracker" section from Nexus UI to my project.

A live delivery tracker. A courier rides a street map to the door, pausing at the drop-offs before yours while the route fills in behind them; the arrival time rolls down digit by digit, stages check off, updates drop into a feed, and on arrival a proof-of-delivery card lands. Hover the map for each point, hover a stage for its detail. Shows the delivered state under reduced motion.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { CourierRouteTracker } from "@/components/blocks/motion-kit/courier-route-tracker";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/courier-route-tracker/index.ts ---

```ts
export { CourierRouteTracker, DEFAULT_COURIER_STAGES, DEFAULT_COURIER_UPDATES } from "./courier-route-tracker";
export type { CourierRouteStage, CourierRouteTrackerProps, CourierRouteUpdate } from "./courier-route-tracker";
```

--- components/blocks/motion-kit/courier-route-tracker/courier-route-tracker.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DROPOFF, MapBase, PICKUP, ROUTE, ROUTE_ARROWS, STOPS } from "./route-map";

export interface CourierRouteStage {
  name: string;
  /** Time shown under the name, for example "Nov 12, 6:48 PM". The last stage gets the arrival time. */
  when?: string;
  /** One line that opens under the stage on hover or focus. */
  detail?: string;
}

export interface CourierRouteUpdate {
  text: string;
  /** When it drops into the feed: a fraction of the route (0 to 1), or the index of a drop-off stop. */
  at?: number;
  stop?: number;
}

export interface CourierRouteTrackerProps {
  orderId?: string;
  orderTitle?: string;
  address?: string;
  courier?: { name: string; initials: string; rating?: string; vehicle?: string };
  /** Stages in order. Every stage but the last starts checked; the last one checks on arrival. */
  stages?: CourierRouteStage[];
  updates?: CourierRouteUpdate[];
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

export const DEFAULT_COURIER_STAGES: CourierRouteStage[] = [
  { name: "Order placed", when: "Nov 12, 6:48 PM", detail: "Paid by card, receipt sent" },
  { name: "Packed", when: "Nov 13, 8:10 AM", detail: "3 items, 1.8 kg, padded box" },
  { name: "Left the hub", when: "9:32 AM", detail: "Eastside hub, bay 6" },
  { name: "Out for delivery", when: "11:58 AM", detail: "Three stops, yours is the last" },
  { name: "Delivered", detail: "Photo proof on arrival" },
];

export const DEFAULT_COURIER_UPDATES: CourierRouteUpdate[] = [
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
export function CourierRouteTracker({
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
}: CourierRouteTrackerProps) {
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
      <section ref={section} aria-label="Order tracking" className={cn("w-full bg-[#f5f5f7] px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}>
        <div className="mx-auto grid max-w-[1100px] gap-3.5 rounded-[28px] bg-white p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.03),0_30px_60px_-30px_rgba(20,20,40,0.25)] md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] dark:bg-[#141418] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_60px_-30px_rgba(0,0,0,0.8)]">
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

--- components/blocks/motion-kit/courier-route-tracker/route-map.tsx ---

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
