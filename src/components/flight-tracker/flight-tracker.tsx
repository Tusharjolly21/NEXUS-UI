"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";

export interface FlightTrackerProps {
  /** Departure airport code. */
  from?: string;
  /** Arrival airport code. */
  to?: string;
  /** Flight number in the top-right corner. */
  flight?: string;
  /** Departure time under the origin code. */
  departs?: string;
  /** Arrival time under the destination code. */
  arrives?: string;
  /** Total flight time in minutes; drives the "Landing in N min" countdown. */
  minutes?: number;
  /** Route length in miles; drives the remaining distance in the details. */
  miles?: number;
  /** Flies the plane along the arc on a loop (about 22 s per flight). Off by default: the plane sits at 35% of the route. */
  autoplay?: boolean;
}

const W = 300;
const ARC = "M 24 70 Q 150 -10 276 70";

/**
 * A live flight card. The plane flies along a dotted arc, banking to follow
 * the curve, with the travelled part filling in behind it. The status line and
 * countdown update as it goes; expand it for altitude and speed.
 */
export function FlightTracker({
  from = "NYC",
  to = "LON",
  flight = "MK 214",
  departs = "8:30 PM",
  arrives = "8:40 AM",
  minutes = 410,
  miles = 3459,
  autoplay = false,
}: FlightTrackerProps) {
  const reduce = useReducedMotion();
  const progress = useMotionValue(0.35);
  const pathRef = useRef<SVGPathElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const angle = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const [p, setP] = useState(0.35);
  useMotionValueEvent(progress, "change", (v) => setP(v));

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (autoplay) {
        const v = progress.get() + dt * 0.045;
        progress.set(v > 1.08 ? 0 : v);
      }
      const el = pathRef.current;
      if (el) {
        const L = el.getTotalLength();
        const t = Math.min(1, progress.get()) * L;
        const a = el.getPointAtLength(t);
        const b = el.getPointAtLength(Math.min(L, t + 1));
        px.set(a.x);
        py.set(a.y);
        angle.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, progress, px, py, angle]);

  const dash = useTransform(progress, (v) => Math.min(1, v));
  const landed = p >= 1;
  const q = Math.min(1, p);
  const mins = Math.max(0, Math.round((1 - p) * minutes));
  const status = landed ? "Landed" : p > 0.85 ? `Landing in ${mins} min` : "On time";
  const arc = Math.sin(q * Math.PI);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[340px] max-w-full overflow-hidden rounded-[24px] bg-[#1d1d1f] p-5 text-white shadow-[0_24px_50px_-24px_rgba(0,0,0,.55)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_24px_50px_-24px_rgba(0,0,0,.9)]"
    >
      <motion.div layout="position" className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Track my flight</span>
        <span className="text-[12px] tabular-nums text-white/50">{flight}</span>
      </motion.div>
      <motion.div layout="position" className="relative mt-3" style={{ height: 90 }}>
        <svg width={W} height="90" viewBox={`0 0 ${W} 90`} className="overflow-visible" aria-hidden="true">
          <path d={ARC} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
          <motion.path ref={pathRef} d={ARC} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ pathLength: dash }} />
          <circle cx="24" cy="70" r="4" fill="#fff" />
          <circle cx="276" cy="70" r="4" fill={landed ? "#30d158" : "rgba(255,255,255,.4)"} />
        </svg>
        <motion.div className="absolute left-0 top-0" style={{ x: px, y: py }}>
          <motion.svg width="22" height="22" viewBox="0 0 24 24" style={{ rotate: angle, marginLeft: -11, marginTop: -11 }} aria-hidden="true">
            <path fill="#fff" d="M22 12c0-.8-.7-1.4-1.6-1.4h-5.2L10 3.5H8l2.6 7.1H6L4.4 8.5H3l1 3.5-1 3.5h1.4L6 13.4h4.6L8 20.5h2l5.2-7.1h5.2c.9 0 1.6-.6 1.6-1.4z" />
          </motion.svg>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between">
          <span className="flex flex-col">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">{from}</span>
            <span className="text-[11px] text-white/50">{departs}</span>
          </span>
          <span className="flex flex-col items-end">
            <span className="text-[22px] font-semibold tracking-[-0.02em]">{to}</span>
            <span className="text-[11px] text-white/50">{arrives}</span>
          </span>
        </div>
      </motion.div>
      <motion.div layout="position" className="mt-4 flex items-center justify-between">
        <span className="relative flex h-5 items-center gap-1.5 overflow-hidden text-[13px] font-medium">
          <motion.span
            className="h-2 w-2 rounded-full"
            animate={{ backgroundColor: landed ? "#30d158" : p > 0.85 ? "#ff9f0a" : "#30d158", scale: reduce ? 1 : [1, 1.4, 1] }}
            transition={{ scale: reduce ? { duration: 0 } : { duration: 1.6, repeat: Infinity } }}
          />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={status.replace(/\d+/, "#")} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>
              {status}
            </motion.span>
          </AnimatePresence>
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex h-8 items-center gap-1 rounded-full bg-white/10 px-3 text-[12px] font-medium hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          {open ? "Less" : "Details"}
          <motion.svg animate={{ rotate: open ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </button>
      </motion.div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="d" layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            {[
              ["Altitude", landed ? "0 ft" : `${Math.round(arc * 38000).toLocaleString("en-US")} ft`],
              ["Speed", landed ? "0 mph" : `${Math.round(320 + arc * 240)} mph`],
              ["Distance", `${Math.round((1 - q) * miles).toLocaleString("en-US")} mi`],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-[11px] text-white/50">{k}</span>
                <span className="text-[14px] font-semibold tabular-nums">{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
