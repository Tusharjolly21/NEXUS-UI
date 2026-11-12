"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

/**
 * Lumis's hero: one person's working week. The grey hatched blocks are the boring half (the support inbox,
 * chasing invoices, qualifying leads, rebooking missed calls) sitting between the real work. One job at a time,
 * every block of that job lifts out of the week and drops into the agents' lane underneath, and the hole it leaves
 * turns into free time. The count of hours handed back climbs as it goes, then the week resets. Pressing a job in
 * the lane hands that one over straight away.
 */

export type Job = "support" | "invoices" | "leads" | "calls";
const JOBS: { id: Job; label: string; agent: string }[] = [
  { id: "support", label: "Support inbox", agent: "Answers support email" },
  { id: "invoices", label: "Chase invoices", agent: "Chases unpaid invoices" },
  { id: "leads", label: "Qualify leads", agent: "Qualifies new leads" },
  { id: "calls", label: "Rebook calls", agent: "Books jobs from calls" },
];

type Block = { id: string; day: number; start: number; len: number; job?: Job; label: string };
const B = (day: number, start: number, len: number, label: string, job?: Job): Block => ({ id: `${day}-${start}`, day, start, len, job, label });

const WEEK: Block[] = [
  B(0, 9, 2, "Support inbox", "support"), B(0, 11, 1, "Customer calls"), B(0, 13, 1, "Chase invoices", "invoices"), B(0, 14, 1, "Qualify leads", "leads"), B(0, 15, 2, "Product review"),
  B(1, 9, 2, "Support inbox", "support"), B(1, 11, 1, "Hiring"), B(1, 13, 1, "Rebook calls", "calls"), B(1, 14, 1, "Support inbox", "support"), B(1, 15, 1, "Customer visit"),
  B(2, 9, 1, "Support inbox", "support"), B(2, 10, 1, "Chase invoices", "invoices"), B(2, 11, 2, "Planning"), B(2, 14, 1, "Qualify leads", "leads"), B(2, 15, 1, "Rebook calls", "calls"),
  B(3, 9, 2, "Support inbox", "support"), B(3, 11, 1, "Customer calls"), B(3, 13, 1, "Qualify leads", "leads"), B(3, 14, 1, "Chase invoices", "invoices"), B(3, 15, 1, "Support inbox", "support"),
  B(4, 9, 1, "Support inbox", "support"), B(4, 10, 1, "Rebook calls", "calls"), B(4, 11, 1, "Team lunch"), B(4, 13, 1, "Chase invoices", "invoices"), B(4, 14, 2, "Qualify leads", "leads"),
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const H0 = 9;
const H1 = 17;

const hoursOf = (j: Job) => WEEK.filter((b) => b.job === j).reduce((n, b) => n + b.len, 0);

export default function WeekHandover({ ink, accent, free, line }: { ink: string; accent: string; free: string; line: string }) {
  const still = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1100);
  const [handed, setHanded] = useState<Job[]>([]);
  const [lifting, setLifting] = useState<Job | null>(null);
  const touched = useRef(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const handOver = (j: Job) => {
    if (handed.includes(j)) return;
    setLifting(j);
    window.setTimeout(() => { setHanded((h) => (h.includes(j) ? h : [...h, j])); setLifting(null); }, still ? 0 : 650);
  };

  // Left alone, it hands the jobs over one by one, holds the empty week for a moment, then starts again.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (Date.now() - touched.current < 8000) return;
      const next = JOBS.find((j) => !handed.includes(j.id));
      if (next) handOver(next.id);
      else setHanded([]);
    }, handed.length === 0 ? 1400 : handed.length === JOBS.length ? 5200 : 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handed]);

  const days = w < 640 ? 3 : 5;
  const gutter = w < 640 ? 34 : 46;
  const colW = (w - gutter) / days;
  const rowH = w < 640 ? 30 : 36;
  const calH = (H1 - H0) * rowH;
  const saved = handed.reduce((n, j) => n + hoursOf(j), 0);

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold" style={{ color: ink }}>Ana&rsquo;s week, operations lead</span>
            <span className="text-[13px] text-[#6b6660]">Grey is the work nobody misses. Watch where it goes.</span>
          </div>
          <div className="flex items-baseline gap-2">
            <motion.span key={saved} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[34px] font-semibold leading-none tabular-nums tracking-[-0.04em]" style={{ color: ink }}>{saved}</motion.span>
            <span className="text-[13px] text-[#6b6660]">hours a week back</span>
          </div>
        </div>

        {/* the calendar */}
        <div ref={box} className="relative w-full" style={{ height: calH + 26 }} role="img" aria-label={`A working week. ${saved} hours of repetitive work have been handed to agents.`}>
          {DAYS.slice(0, days).map((d, i) => (
            <span key={d} className="absolute top-0 text-[12.5px] font-semibold" style={{ left: gutter + i * colW + 6, color: ink }}>{d}</span>
          ))}
          <div className="absolute inset-x-0 bottom-0" style={{ top: 26 }}>
            {Array.from({ length: H1 - H0 + 1 }, (_, k) => (
              <div key={k} className="absolute inset-x-0" style={{ top: k * rowH }}>
                <div className="ml-auto h-px" style={{ width: w - gutter, background: line }} />
                {k < H1 - H0 ? <span className="absolute left-0 top-1 text-[11px] tabular-nums text-[#8a847c]">{String(H0 + k).padStart(2, "0")}:00</span> : null}
              </div>
            ))}
            {WEEK.filter((b) => b.day < days).map((b) => {
              const gone = b.job && handed.includes(b.job);
              const lift = b.job && lifting === b.job;
              const style = { left: gutter + b.day * colW + 3, top: (b.start - H0) * rowH + 3, width: colW - 6, height: b.len * rowH - 6 };
              return (
                <div key={b.id} className="absolute" style={style}>
                  {/* the free time a handed-over block leaves behind */}
                  <AnimatePresence>
                    {gone ? (
                      <motion.div key="free" className="absolute inset-0 flex items-start rounded-[8px] px-2 py-1.5 text-[11.5px] font-semibold" style={{ background: free, color: ink }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.25 }}>
                        Free
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  {!gone ? (
                    <motion.div
                      layoutId={`blk-${b.id}`}
                      className="absolute inset-0 overflow-hidden rounded-[8px] px-2 py-1.5 text-[11.5px] font-medium leading-[1.2]"
                      style={
                        b.job
                          ? { background: "repeating-linear-gradient(-45deg, #e6e2dc 0 6px, #ece9e4 6px 12px)", color: "#57524b", boxShadow: lift ? `0 0 0 2px ${accent}, 0 12px 24px -12px rgba(0,0,0,.35)` : "inset 0 0 0 1px rgba(0,0,0,.06)" }
                          : { background: "#ffffff", color: ink, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }
                      }
                      animate={{ y: lift ? -6 : 0, scale: lift ? 1.03 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    >
                      {colW > 90 || b.len > 1 ? b.label : null}
                    </motion.div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* the agents' lane: handed-over blocks land here and keep running */}
        <div className="grid grid-cols-2 gap-2 rounded-[18px] p-2 md:grid-cols-4" style={{ background: ink }}>
          {JOBS.map((j) => {
            const on = handed.includes(j.id);
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => { touched.current = Date.now(); handOver(j.id); }}
                disabled={on}
                aria-pressed={on}
                className="flex min-h-[74px] flex-col items-start gap-2 rounded-[12px] p-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white"
                style={{ background: on ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.03)", boxShadow: on ? "none" : "inset 0 0 0 1px rgba(255,255,255,.12)" }}
              >
                <span className="flex w-full items-center justify-between gap-2 text-[12.5px] font-semibold text-white">
                  {j.agent}
                  <span className="text-[11.5px] font-medium tabular-nums" style={{ color: on ? accent : "rgba(255,255,255,.5)" }}>{on ? `${hoursOf(j.id)} h` : "Hand over"}</span>
                </span>
                <span className="flex flex-wrap gap-1">
                  {on
                    ? WEEK.filter((b) => b.job === j.id && b.day < days).map((b) => (
                        <motion.span key={b.id} layoutId={`blk-${b.id}`} className="block h-3 w-5 rounded-[3px]" style={{ background: accent }} transition={{ type: "spring", stiffness: 220, damping: 26 }} />
                      ))
                    : <span className="text-[11.5px] text-white/45">Runs all week once it&rsquo;s handed over</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
}
