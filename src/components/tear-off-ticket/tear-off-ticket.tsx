"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";

export interface TearOffTicketProps {
  title?: string;
  venue?: string;
  date?: string;
  seat?: string;
  /** Tears itself and resets on a loop until the user grabs the stub. */
  autoplay?: boolean;
}

const PULL = 150; // px of drag needed to tear through

/**
 * Pull the stub away from the ticket. The perforation gives way from the top
 * down (the stub pivots on its last tooth); release early and it snaps back,
 * pull far enough and it hangs for a beat, then drops.
 */
export function TearOffTicket({ title = "Light & Matter", venue = "Hall 3 · North Gallery", date = "Sat 14 Nov · 11:00", seat = "Row C · Seat 12", autoplay = false }: TearOffTicketProps) {
  const p = useMotionValue(0); // 0..1 tear progress
  const rotate = useTransform(p, [0, 1], [0, 26]);
  const teethOpacity = useTransform(p, [0, 1], [1, 0.4]);
  const [torn, setTorn] = useState(false);
  const [gone, setGone] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const touched = useRef(false);
  const tearT = useRef<number | undefined>(undefined);

  const tear = () => {
    setTorn(true);
    animate(p, 1, { duration: 0.1 });
    tearT.current = window.setTimeout(() => setGone(true), 650);
  };

  const reset = () => {
    clearTimeout(tearT.current);
    setGone(false);
    setTorn(false);
    p.set(0);
  };

  const autoReset = useEffectEvent(() => reset());
  const autoTear = useEffectEvent(() => tear());

  useEffect(() => {
    if (!autoplay) return;
    let wait: number | undefined;
    let ctl: ReturnType<typeof animate> | null = null;
    let alive = true;
    const stopped = () => !alive || touched.current;
    const run = () => {
      if (stopped()) return;
      autoReset();
      wait = window.setTimeout(() => {
        if (stopped()) return;
        ctl = animate(p, 0.55, { duration: 0.7, ease: "easeInOut" });
        ctl.then(() => {
          if (stopped()) return;
          ctl = animate(p, 0.2, { type: "spring", stiffness: 300, damping: 14 });
          ctl.then(() => {
            if (stopped()) return;
            ctl = animate(p, 1, { duration: 0.6, ease: "easeIn" });
            ctl.then(() => { if (!stopped()) autoTear(); });
          });
        });
      }, 900);
    };
    const first = window.setTimeout(run, 0);
    const t = setInterval(run, 5200);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(t);
      clearTimeout(wait);
      ctl?.stop();
    };
  }, [autoplay, p]);

  useEffect(() => () => clearTimeout(tearT.current), []);

  const teeth = Array.from({ length: 11 });

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative flex h-[180px] w-[420px] max-w-full select-none">
        {/* Main ticket */}
        <div className="relative flex h-full flex-1 overflow-hidden rounded-l-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-24px_rgba(0,0,0,.8)]">
          <div className="w-[118px] flex-none" style={{ background: "radial-gradient(90% 70% at 30% 25%, #ffd7b0, rgba(255,215,176,0) 60%), radial-gradient(80% 80% at 80% 90%, #a9c7ff, rgba(169,199,255,0) 60%), #efe7ff" }} />
          <div className="flex flex-1 flex-col justify-between p-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">Exhibition</span>
              <span className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
              <span>{venue}</span>
              <span>{date}</span>
            </div>
          </div>
          {/* Perforation on the ticket side */}
          <span className="absolute inset-y-2 right-0 flex flex-col justify-between" aria-hidden="true">
            {teeth.map((_, i) => <span key={i} className="h-[6px] w-[3px] rounded-l-full bg-[#f5f5f7] dark:bg-black" />)}
          </span>
        </div>

        {/* Stub */}
        <AnimatePresence>
          {!gone && (
            <motion.div
              key="stub"
              role="button"
              tabIndex={0}
              aria-label={torn ? "Stub torn off" : "Tear off the stub. Drag it right or press Enter."}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !torn) { e.preventDefault(); touched.current = true; tear(); } }}
              onPointerDown={(e) => {
                if (torn) return;
                touched.current = true;
                (e.currentTarget as Element).setPointerCapture(e.pointerId);
                start.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (!start.current || torn) return;
                const pull = Math.max(0, e.clientX - start.current.x) + Math.max(0, e.clientY - start.current.y) * 0.6;
                const v = Math.min(1, pull / PULL);
                p.set(v);
                if (v >= 1) { start.current = null; tear(); }
              }}
              onPointerUp={() => {
                if (!start.current) return;
                start.current = null;
                if (!torn) animate(p, 0, { type: "spring", stiffness: 420, damping: 16 });
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={torn ? { rotate: [26, 64, 44, 56, 50] } : { opacity: 1, x: 0 }}
              exit={{ y: 420, rotate: 110, opacity: 0, transition: { duration: 0.9, ease: [0.55, 0, 1, 0.45] } }}
              transition={torn ? { duration: 0.65, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 26 }}
              style={{ rotate: torn ? undefined : rotate, originX: 0, originY: 1 }}
              className="relative flex h-full w-[118px] flex-none cursor-grab touch-none flex-col items-center justify-center gap-2 rounded-r-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-24px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#0a84ff]"
            >
              <motion.span className="absolute inset-y-2 left-0 flex flex-col justify-between" style={{ opacity: teethOpacity }} aria-hidden="true">
                {teeth.map((_, i) => <span key={i} className="h-[6px] w-[3px] rounded-r-full bg-[#f5f5f7] dark:bg-black" />)}
              </motion.span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">Admit one</span>
              <span className="grid grid-cols-5 gap-[2px]" aria-hidden="true">
                {Array.from({ length: 25 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[7px] w-[7px] rounded-[1px] ${(i * 7) % 3 === 0 || i % 6 === 0 ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#e8e8ed] dark:bg-[#3a3a3c]"}`}
                  />
                ))}
              </span>
              <span className="text-[11px] font-medium tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{seat}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex h-9 items-center">
        <AnimatePresence mode="wait">
          {gone ? (
            <motion.button key="reset" type="button" onClick={() => { touched.current = true; reset(); }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]">
              New ticket
            </motion.button>
          ) : (
            <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
              Pull the stub to the right.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
