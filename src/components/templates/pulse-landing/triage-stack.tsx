"use client";
/**
 * Triage deck, adapted from the kit Swipe Stack. Same physics (drag, tilt,
 * stamp, fling, next card rises); the cards are incoming issues instead of
 * payments. Drag right to accept into the cycle, left to close.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

interface Issue { id: number; key: string; title: string; source: string; who: string; when: string; label: string; prio: 1 | 2 | 3 }

const DATA: Omit<Issue, "id">[] = [
  { key: "PUL-231", title: "CSV export times out over 50k rows", source: "Support", who: "Ines (Support)", when: "12m", label: "Bug", prio: 2 },
  { key: "PUL-232", title: "Crash on Android 13 when opening a cycle", source: "Error tracker", who: "Auto-filed", when: "40m", label: "Crash", prio: 1 },
  { key: "PUL-233", title: "Let us pin a roadmap view as default", source: "Chat", who: "Theo (Sales)", when: "2h", label: "Request", prio: 3 },
  { key: "PUL-234", title: "Duplicate of PUL-198: rate-limit exports", source: "Support", who: "Ines (Support)", when: "3h", label: "Bug", prio: 3 },
  { key: "PUL-235", title: "Webhook signatures fail after key rotation", source: "Error tracker", who: "Auto-filed", when: "5h", label: "Bug", prio: 1 },
];

const PRIO = { 1: { l: "Urgent", c: "#b91c1c", bg: "rgba(220,38,38,.1)" }, 2: { l: "High", c: "#b25000", bg: "rgba(255,159,10,.16)" }, 3: { l: "Normal", c: "#515154", bg: "#f0f0f2" } } as const;
const PATTERN = [1, 1, -1, -1, 1];

export default function TriageStack({ accent = "#dc2626", autoplay = false }: { accent?: string; autoplay?: boolean }) {
  const [cards, setCards] = useState<Issue[]>(() => DATA.map((d, i) => ({ ...d, id: i })));
  const [log, setLog] = useState<{ ok: boolean; key: string } | null>(null);
  const [counts, setCounts] = useState({ in: 0, out: 0 });
  const nextId = useRef(DATA.length);
  const touched = useRef(false);
  const step = useRef(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-16, 16]);
  const accept = useTransform(x, [20, 120], [0, 1]);
  const close = useTransform(x, [-120, -20], [1, 0]);
  const cardsRef = useRef(cards);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  const fling = async (dir: 1 | -1) => {
    const top = cardsRef.current[0];
    if (!top) return;
    await animate(x, dir * 520, { type: "spring", stiffness: 180, damping: 24, velocity: dir * 800 });
    setLog({ ok: dir > 0, key: top.key });
    setCounts((c) => (dir > 0 ? { ...c, in: c.in + 1 } : { ...c, out: c.out + 1 }));
    setCards((c) => c.slice(1));
    x.set(0);
  };

  const reset = () => { setCards(DATA.map((d) => ({ ...d, id: nextId.current++ }))); setCounts({ in: 0, out: 0 }); setLog(null); };

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      if (cardsRef.current.length === 0) { reset(); return; }
      fling(PATTERN[step.current++ % PATTERN.length] as 1 | -1);
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
      <div className="relative h-[250px] w-[340px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 4).map((c, i) => {
            const top = i === 0;
            const p = PRIO[c.prio];
            return (
              <motion.div
                key={c.id}
                className="absolute inset-x-0 top-8 flex h-[196px] touch-none flex-col rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.35)]"
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
                  <span className="text-[12px] font-semibold tabular-nums text-[#6e6e73]" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>{c.key}</span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: p.c, background: p.bg }}>{p.l}</span>
                </div>
                <span className="mt-3 text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#1d1d1f]">{c.title}</span>
                <div className="mt-auto flex items-center justify-between text-[13px]">
                  <span className="text-[#515154]">{c.who} · via {c.source}</span>
                  <span className="text-[#6e6e73]">{c.when}</span>
                </div>
                {top && (
                  <>
                    <motion.span className="absolute right-5 top-12 rotate-[-10deg] rounded-lg border-[3px] border-[#1a7f37] bg-white px-2 py-0.5 text-[14px] font-bold uppercase tracking-wider text-[#1a7f37]" style={{ opacity: accept }} aria-hidden="true">To cycle</motion.span>
                    <motion.span className="absolute left-5 top-12 rotate-[10deg] rounded-lg border-[3px] border-[#515154] bg-white px-2 py-0.5 text-[14px] font-bold uppercase tracking-wider text-[#515154]" style={{ opacity: close }} aria-hidden="true">Close</motion.span>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {cards.length === 0 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="text-[17px] font-semibold text-[#1d1d1f]">Inbox zero.</span>
              <span className="text-[13px] text-[#6e6e73]">{counts.in} into the cycle, {counts.out} closed.</span>
              <button type="button" onClick={reset} className="h-9 rounded-full px-4 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ background: accent, outlineColor: accent }}>Load new issues</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Close issue" disabled={!cards.length} onClick={() => fling(-1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#515154] shadow-[0_0_0_1px_rgba(0,0,0,.08)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </motion.button>
        <span className="relative h-5 w-[170px] overflow-hidden text-center text-[13px] text-[#6e6e73]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={log ? `${log.key}-${log.ok}` : `n${cards.length}`} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
              {log ? `${log.key} ${log.ok ? "added to cycle 34" : "closed"}` : `${cards.length} waiting in triage`}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Accept issue into the cycle" disabled={!cards.length} onClick={() => fling(1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1a7f37] shadow-[0_0_0_1px_rgba(0,0,0,.08)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </motion.button>
      </div>
    </div>
  );
}
