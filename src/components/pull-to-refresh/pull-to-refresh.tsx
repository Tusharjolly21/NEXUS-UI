"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

export interface PullToRefreshProps {
  /** Balance shown before the first refresh. */
  initialBalance?: number;
  /** Called each time a pull commits, with the new balance and the change. */
  onRefresh?: (balance: number, delta: number) => void;
  /** Pulls the card down and refreshes every 4.2 s, until someone drags it. */
  autoplay?: boolean;
}

/** How far (px) the card has to travel before letting go refreshes it. */
const LINE = 90;

/** Each character rolls in from above when it changes; keyed from the right so digits stay put as the number grows. */
export function RollingDigits({ text }: { text: string }) {
  return (
    <span className="inline-flex overflow-hidden tabular-nums">
      {text.split("").map((c, i) => (
        <span key={text.length - i} className="relative inline-flex">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28, delay: i * 0.03 }}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

function series(seed: number) {
  let s = seed;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let v = 40;
  return Array.from({ length: 24 }, () => (v = Math.max(8, Math.min(72, v + (r() - 0.42) * 14))));
}

/**
 * Pull to refresh on a balance card. Drag it down and it stretches with you
 * while a ring draws itself; past the line the ring closes and the card
 * commits, holds while it spins, then springs back with a little overshoot as
 * the balance rolls and the chart redraws.
 */
export function PullToRefresh({ initialBalance = 58834.75, onRefresh, autoplay = false }: PullToRefreshProps) {
  const y = useMotionValue(0);
  const [phase, setPhase] = useState<"idle" | "ready" | "loading">("idle");
  const [bal, setBal] = useState(initialBalance);
  const [delta, setDelta] = useState(1204.6);
  const [seed, setSeed] = useState(7);
  const stretch = useTransform(y, (v) => 1 + Math.max(0, v) / 900);
  const ring = useTransform(y, (v) => Math.min(1, Math.max(0, v) / LINE));
  const ringOpacity = useTransform(y, [0, 30], [0, 1]);
  const touched = useRef(false);
  const loading = useRef(false);
  const timer = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  const balRef = useRef(initialBalance);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useMotionValueEvent(y, "change", (v) => {
    if (phase !== "loading") setPhase(v >= LINE ? "ready" : "idle");
  });

  const refresh = useCallback(() => {
    if (loading.current) return;
    loading.current = true;
    setPhase("loading");
    animate(y, 62, { type: "spring", stiffness: 400, damping: 30 });
    timer.current = window.setTimeout(() => {
      const ch = +(Math.random() * 2400 - 600).toFixed(2);
      setDelta(ch);
      const next = +(balRef.current + ch).toFixed(2);
      balRef.current = next;
      setBal(next);
      onRefreshRef.current?.(next, ch);
      setSeed((s) => s + 11);
      animate(y, 0, { type: "spring", stiffness: 300, damping: 14 });
      setPhase("idle");
      loading.current = false;
    }, 1300);
  }, [y]);

  /** The same pull the demo does: ease down past the line, then commit. */
  const pull = useCallback(() => {
    if (loading.current) return;
    animate(y, 120, { duration: 0.7, ease: [0.3, 0, 0.3, 1], onComplete: refresh });
  }, [y, refresh]);

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => {
      if (touched.current) return window.clearInterval(t);
      pull();
    }, 4200);
    return () => window.clearInterval(t);
  }, [autoplay, pull]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      touched.current = true;
      pull();
    }
  };

  const pts = series(seed);
  const d = pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 260} ${80 - v}`).join(" ");
  const [whole, cents] = bal.toFixed(2).split(".");
  const up = delta >= 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[330px] w-[300px] overflow-hidden rounded-[28px] bg-[#f0f0f3] p-3 dark:bg-[#1c1c1e]">
        <motion.div className="absolute left-1/2 top-4 flex flex-col items-center gap-1" style={{ x: "-50%", opacity: ringOpacity }} aria-hidden="true">
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            animate={{ rotate: phase === "loading" ? 360 : 0 }}
            transition={phase === "loading" ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
          >
            <circle cx="14" cy="14" r="11" fill="none" strokeWidth="2.5" className="stroke-[#d2d2d7] dark:stroke-[#3a3a3c]" />
            <motion.circle
              cx="14"
              cy="14"
              r="11"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="stroke-[#1d1d1f] dark:stroke-[#f5f5f7]"
              style={{ pathLength: phase === "loading" ? 0.3 : ring, rotate: -90, transformOrigin: "50% 50%" }}
            />
          </motion.svg>
          <span className="text-[11px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
            {phase === "loading" ? "Refreshing" : phase === "ready" ? "Release to refresh" : "Pull to refresh"}
          </span>
        </motion.div>
        <motion.div
          drag={phase === "loading" ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.55 }}
          onDragStart={() => {
            touched.current = true;
            y.stop();
          }}
          onDragEnd={() => {
            if (y.get() >= LINE) refresh();
          }}
          tabIndex={0}
          role="group"
          aria-label="Portfolio balance. Press Enter to refresh."
          aria-busy={phase === "loading"}
          onKeyDown={onKeyDown}
          style={{ y, scaleY: stretch, transformOrigin: "50% 0%" }}
          className="relative cursor-grab touch-none rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_30px_-20px_rgba(0,0,0,.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-20px_rgba(0,0,0,.9)] dark:focus-visible:ring-[#0a84ff]"
        >
          <span className="text-[12px] font-medium text-[#86868b] dark:text-[#8e8e93]">Portfolio</span>
          <div className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            $<RollingDigits text={Number(whole).toLocaleString("en-US")} />
            <span className="text-[20px] text-[#86868b] dark:text-[#8e8e93]">
              .<RollingDigits text={cents} />
            </span>
          </div>
          <div className={`mt-1.5 text-[12px] font-medium ${up ? "text-[#248a3d] dark:text-[#30d158]" : "text-[#d70015] dark:text-[#ff453a]"}`}>
            {up ? "▲" : "▼"} ${Math.abs(delta).toLocaleString("en-US", { minimumFractionDigits: 2 })} since last refresh
          </div>
          <svg viewBox="0 0 260 84" className="mt-4 w-full" aria-hidden="true">
            <motion.path
              key={seed}
              d={d}
              fill="none"
              stroke={up ? "#30d158" : "#ff3b30"}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">
            {["1H", "4H", "1D"].map((t, k) => (
              <span key={t} className={`rounded-full py-1.5 font-medium ${k === 2 ? "bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]" : ""}`}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>
        <span className="sr-only" aria-live="polite">
          {phase === "loading" ? "Refreshing" : ""}
        </span>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">Pull the card down past the line.</span>
    </div>
  );
}
