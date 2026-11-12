"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Tally's hero: a dinner bill settling itself. Each friend's share arcs from them into your phone, they light up
 * as it lands, and the receipt marks the bill settled. Then it runs again. The
 * scene is laid out around a 316 x 640 phone at the centre of a 620 x 680 box. Reduced motion shows it settled.
 */

const FRIENDS = [
  { n: "Maya", i: "MK", c: "#ff8a65", x: 70, y: 150 },
  { n: "Jon", i: "JR", c: "#ffd166", x: 560, y: 120 },
  { n: "Priya", i: "PS", c: "#7ee0b8", x: 545, y: 470 },
];
const FROM = { x: 310, y: 300 }; // the phone's Send button, roughly
const SHARE = "$32.50";

const noop = () => () => {};

export default function SplitScene({ children }: { children: React.ReactNode }) {
  // false while hydrating (the server can't know the setting), then the visitor's real setting
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const still = hydrated && !!reduce;
  const [k, setK] = useState(0); // which loop we're on
  const [paid, setLanded] = useState(0);
  const landed = still ? 3 : paid;

  useEffect(() => {
    if (still) return;
    const ts: number[] = [];
    ts.push(window.setTimeout(() => setLanded(0), 0));
    FRIENDS.forEach((_, i) => ts.push(window.setTimeout(() => setLanded(i + 1), 1500 + i * 260 + 900)));
    ts.push(window.setTimeout(() => setK((v) => v + 1), 7200));
    return () => ts.forEach(clearTimeout);
  }, [k, still]);

  return (
    <div className="relative h-[680px] w-[620px]">
      <div className="absolute left-1/2 top-[20px] z-10 -translate-x-1/2">{children}</div>

      {/* the coins, one per friend */}
      {!still &&
        FRIENDS.map((f, i) => {
          const mx = (FROM.x + f.x) / 2;
          const my = Math.min(FROM.y, f.y) - 90;
          return (
            <motion.span
              key={`${k}-${f.n}`}
              className="absolute left-0 top-0 z-30 flex h-11 items-center rounded-full px-3 text-[13px] font-bold tabular-nums shadow-[0_10px_24px_-8px_rgba(0,0,0,.45)]"
              style={{ background: "#ffffff", color: "#1a2a8f" }}
              initial={{ x: f.x - 30, y: f.y - 22, scale: 0.6, opacity: 0 }}
              animate={{ x: [f.x - 30, mx - 30, FROM.x - 30], y: [f.y - 22, my, FROM.y], scale: [0.6, 1.1, 0.5], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 1.5 + i * 0.26, ease: [0.3, 0.1, 0.3, 1], times: [0, 0.55, 1] }}
            >
              {SHARE}
            </motion.span>
          );
        })}

      {/* the friends */}
      {FRIENDS.map((f, i) => {
        const got = landed > i;
        return (
          <div key={f.n} className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5" style={{ left: f.x, top: f.y }}>
            <motion.span
              className="flex h-14 w-14 items-center justify-center rounded-full text-[15px] font-bold text-[#1d1d1f]"
              style={{ background: f.c }}
              animate={got ? { scale: [1, 1.18, 1], boxShadow: ["0 0 0 0px rgba(255,255,255,.6)", "0 0 0 14px rgba(255,255,255,0)", "0 0 0 0px rgba(255,255,255,0)"] } : { scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {f.i}
            </motion.span>
            <span className="whitespace-nowrap rounded-full bg-white/15 px-2.5 py-1 text-[12.5px] font-semibold text-white backdrop-blur">
              {f.n}
              <AnimatePresence>
                {got ? (
                  <motion.span key="paid" className="ml-1.5 tabular-nums text-[#d9ffe9]" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    paid {SHARE}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </span>
          </div>
        );
      })}

      {/* the bill */}
      <motion.div className="absolute bottom-[34px] left-[6px] z-20 w-[210px] rounded-[18px] bg-white p-3.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,.5)]" initial={{ rotate: -4 }} animate={{ rotate: -4 }}>
        <span className="flex items-baseline justify-between text-[13px] font-semibold text-[#1d1d1f]">Dinner at Osteria<span className="tabular-nums">$130.00</span></span>
        <span className="mt-1 block text-[12px] text-[#6e6e73]">Split 4 ways, {SHARE} each</span>
        <div className="mt-2.5 flex gap-1">
          {[0, 1, 2, 3].map((j) => (
            <motion.span key={j} className="h-1.5 flex-1 rounded-full" animate={{ background: j === 0 || landed >= j ? "#1a7f42" : "#e5e5ea" }} transition={{ duration: 0.3 }} />
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={landed === 3 ? "s" : "w"} className="mt-2 block text-[12px] font-semibold" style={{ color: landed === 3 ? "#1a7f42" : "#6e6e73" }} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            {landed === 3 ? "Settled" : `${landed} of 3 paid back`}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
