"use client";
/**
 * Copy of the Motion Kit Swipe Stack, re-skinned for Lumis: actions an agent
 * has drafted and is waiting to send. Drag right (or press the check) to send,
 * left to hold it back for a person.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

interface Draft { id: number; action: string; who: string; note: string; agent: string; sure: number }

const DATA: Omit<Draft, "id">[] = [
  { action: "Refund €42.90", who: "Marta Silva", note: "Order #4471 arrived cracked. Photos attached, within policy.", agent: "Support agent", sure: 96 },
  { action: "Reminder #2", who: "Fernhill Bakery", note: "Invoice 1186 is 9 days late. Friendly tone, no fee yet.", agent: "Finance agent", sure: 91 },
  { action: "Book Tue 10:30", who: "Daniel Okoye", note: "Asked for a boiler service. Crew B is free that morning.", agent: "Phone agent", sure: 88 },
  { action: "Send pricing", who: "Halvorsen & Co", note: "Inbound lead scored 82. Matches your ideal customer.", agent: "Sales agent", sure: 79 },
  { action: "Reply to review", who: "Google review, 2★", note: "Apologises for the wait, offers a call. No discount promised.", agent: "Support agent", sure: 72 },
];

export default function ReviewStack({ accent = "#a21caf", autoplay = false }: { accent?: string; autoplay?: boolean }) {
  const [cards, setCards] = useState<Draft[]>(() => DATA.map((d, i) => ({ ...d, id: i })));
  const [log, setLog] = useState<{ ok: boolean; action: string } | null>(null);
  const nextId = useRef(DATA.length);
  const touched = useRef(false);
  const cardsRef = useRef(cards);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-16, 16]);
  const send = useTransform(x, [20, 120], [0, 1]);
  const hold = useTransform(x, [-120, -20], [1, 0]);

  useEffect(() => { cardsRef.current = cards; }, [cards]);

  const fling = async (dir: 1 | -1) => {
    const top = cardsRef.current[0];
    if (!top) return;
    await animate(x, dir * 520, { type: "spring", stiffness: 180, damping: 24, velocity: dir * 800 });
    setLog({ ok: dir > 0, action: top.action });
    setCards((c) => c.slice(1));
    x.set(0);
  };

  const reset = () => setCards(DATA.map((d) => ({ ...d, id: nextId.current++ })));

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      if (cardsRef.current.length === 0) { reset(); return; }
      fling(k++ % 4 === 3 ? -1 : 1);
    }, 1900);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const onEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) fling(info.offset.x > 0 ? 1 : -1);
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 26 });
  };

  return (
    <div className="flex flex-col items-center gap-5" onPointerDown={() => (touched.current = true)}>
      <div className="relative h-[236px] w-[340px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 4).map((c, i) => {
            const top = i === 0;
            return (
              <motion.div
                key={c.id}
                className="absolute inset-x-0 top-6 h-[188px] cursor-grab touch-pan-y rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.35)] active:cursor-grabbing"
                style={top ? { x, rotate, zIndex: 10 } : { zIndex: 10 - i }}
                drag={top ? "x" : false}
                dragMomentum={false}
                onDragEnd={top ? onEnd : undefined}
                initial={{ y: -40, scale: 0.8, opacity: 0 }}
                animate={{ y: -i * 12, scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${accent}14`, color: accent }}>{c.agent}</span>
                  <span className="text-[12px] tabular-nums text-[#6e6e73]">{c.sure}% sure</span>
                </div>
                <span className="mt-3 block text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1d1d1f]">{c.action}</span>
                <span className="mt-1 block text-[14px] font-medium text-[#1d1d1f]">{c.who}</span>
                <span className="mt-1 block text-[13px] leading-[1.4] text-[#6e6e73]">{c.note}</span>
                {top && (
                  <>
                    <motion.span className="absolute right-5 top-14 rotate-[10deg] rounded-lg border-[3px] border-[#248a3d] px-2 py-0.5 text-[15px] font-bold uppercase tracking-wider text-[#248a3d]" style={{ opacity: send }} aria-hidden="true">Send</motion.span>
                    <motion.span className="absolute right-5 top-14 rotate-[-10deg] rounded-lg border-[3px] border-[#d70015] px-2 py-0.5 text-[15px] font-bold uppercase tracking-wider text-[#d70015]" style={{ opacity: hold }} aria-hidden="true">Hold</motion.span>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {cards.length === 0 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="text-[17px] font-semibold text-[#1d1d1f]">Queue clear. Agents carry on.</span>
              <button type="button" onClick={reset} className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ ["--tw-ring-color" as string]: accent }}>Load more drafts</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Hold this draft for a person" disabled={!cards.length} onClick={() => fling(-1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#d70015] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none disabled:opacity-40 focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </motion.button>
        <span className="relative h-5 w-[170px] overflow-hidden text-center text-[13px] text-[#6e6e73]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={log ? `${log.action}-${log.ok}-${cards.length}` : "none"} className="block truncate" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
              {log ? `${log.ok ? "Sent" : "Held"}: ${log.action}` : `${cards.length} drafts waiting`}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Approve and send this draft" disabled={!cards.length} onClick={() => fling(1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#248a3d] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none disabled:opacity-40 focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </motion.button>
      </div>
    </div>
  );
}
