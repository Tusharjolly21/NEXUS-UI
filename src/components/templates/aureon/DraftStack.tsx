"use client";
/**
 * Aureon's copy of the Motion Kit Swipe Stack. Same deck and throw, but each
 * card is a trade Aureon has drafted. Drag right to approve, left to skip.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

interface Draft { id: number; side: "Sell" | "Buy"; amount: string; what: string; why: string; tax: string }

const DATA: Omit<Draft, "id">[] = [
  { side: "Sell", amount: "$86,700", what: "Employer stock", why: "Takes it from 31% to 10% of what you own.", tax: "Split over two tax years · est. tax $7,940" },
  { side: "Buy", amount: "$47,600", what: "Total international fund", why: "You're 9% international. Your plan says 21%.", tax: "In your brokerage · no tax" },
  { side: "Sell", amount: "$11,250", what: "Tech sector fund", why: "61% overlap with your S&P fund, at 4× the fee.", tax: "Harvests a $1,380 loss" },
  { side: "Buy", amount: "$18,400", what: "Short-term Treasury fund", why: "Moves 4 months of spending out of the market.", tax: "In your 401(k) · no tax" },
];

export default function DraftStack({ accent = "#4d7c0f", autoplay = false }: { accent?: string; autoplay?: boolean }) {
  const [cards, setCards] = useState<Draft[]>(() => DATA.map((d, i) => ({ ...d, id: i })));
  const [log, setLog] = useState<{ ok: boolean; what: string } | null>(null);
  const nextId = useRef(DATA.length);
  const touched = useRef(false);
  const busy = useRef(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-16, 16]);
  const approve = useTransform(x, [20, 120], [0, 1]);
  const skip = useTransform(x, [-120, -20], [1, 0]);

  const fling = async (top: Draft | undefined, dir: 1 | -1) => {
    if (!top || busy.current) return;
    busy.current = true;
    await animate(x, dir * 520, { type: "spring", stiffness: 180, damping: 24, velocity: dir * 800 });
    setLog({ ok: dir > 0, what: `${top.side.toLowerCase()} ${top.amount}` });
    setCards((c) => c.slice(1));
    x.set(0);
    busy.current = false;
  };

  const reset = () => { setCards(DATA.map((d) => ({ ...d, id: nextId.current++ }))); setLog(null); };

  const top = cards[0];
  const flingRef = useRef(fling);
  const topRef = useRef(top);
  const resetRef = useRef(reset);
  useEffect(() => { flingRef.current = fling; topRef.current = top; resetRef.current = reset; });

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      if (!topRef.current) { resetRef.current(); return; }
      flingRef.current(topRef.current, k++ % 3 === 2 ? -1 : 1);
    }, 2000);
    return () => clearInterval(t);
  }, [autoplay]);

  const onEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) fling(top, info.offset.x > 0 ? 1 : -1);
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 26 });
  };

  return (
    <div className="flex flex-col items-center gap-5" onPointerDown={() => (touched.current = true)}>
      <div className="relative h-[250px] w-[340px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 4).map((c, i) => {
            const isTop = i === 0;
            return (
              <motion.div
                key={c.id}
                className="absolute inset-x-0 top-7 h-[200px] cursor-grab touch-none rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.35)] active:cursor-grabbing"
                style={isTop ? { x, rotate, zIndex: 10 } : { zIndex: 10 - i }}
                drag={isTop ? "x" : false}
                dragMomentum={false}
                onDragEnd={isTop ? onEnd : undefined}
                initial={{ y: -40, scale: 0.8, opacity: 0 }}
                animate={{ y: -i * 12, scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={c.side === "Sell" ? { background: "#fdf0e6", color: "#9a3412" } : { background: "#eef4e4", color: accent }}>{c.side}</span>
                  <span className="text-[12px] text-[#6e6e73]">Draft {DATA.length - cards.length + 1 + i} of {DATA.length}</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[32px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{c.amount}</span>
                </div>
                <span className="block text-[15px] font-semibold text-[#1d1d1f]">{c.what}</span>
                <span className="mt-1 block text-[14px] leading-[1.4] text-[#6e6e73]">{c.why}</span>
                <span className="mt-2 block text-[12px] font-medium tabular-nums text-[#424245]">{c.tax}</span>
                {isTop && (
                  <>
                    <motion.span className="absolute right-5 top-14 rotate-[10deg] rounded-lg border-[3px] px-2 py-0.5 text-[15px] font-bold uppercase tracking-wider" style={{ opacity: approve, borderColor: accent, color: accent }} aria-hidden="true">Approve</motion.span>
                    <motion.span className="absolute right-5 top-14 rotate-[-10deg] rounded-lg border-[3px] border-[#6e6e73] px-2 py-0.5 text-[15px] font-bold uppercase tracking-wider text-[#6e6e73]" style={{ opacity: skip }} aria-hidden="true">Skip</motion.span>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {cards.length === 0 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <span className="text-[17px] font-semibold text-[#1d1d1f]">All drafts reviewed.</span>
              <span className="text-[14px] text-[#6e6e73]">Nothing is sent until you confirm.</span>
              <button type="button" onClick={reset} className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: accent }}>Review again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Skip this draft" disabled={!top} onClick={() => { touched.current = true; fling(top, -1); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.08)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2" style={{ outlineColor: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </motion.button>
        <span className="relative h-5 w-[170px] overflow-hidden text-center text-[13px] text-[#6e6e73]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={log ? `${log.what}-${log.ok}-${cards.length}` : "none"} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
              {log ? `${log.ok ? "Approved" : "Skipped"}: ${log.what}` : `${cards.length} drafts to review`}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Approve this draft" disabled={!top} onClick={() => { touched.current = true; fling(top, 1); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2" style={{ color: accent, outlineColor: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </motion.button>
      </div>
    </div>
  );
}
