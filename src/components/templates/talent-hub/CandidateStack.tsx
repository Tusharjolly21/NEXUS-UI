"use client";
/**
 * Copy of the Motion Kit Swipe Stack, re-skinned for TalentHub: a shortlist of
 * vetted candidates. Drag right (or press the check) to book an interview,
 * left to pass with a reason.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

interface Candidate { id: number; name: string; role: string; city: string; overlap: string; rate: string; skills: string[]; hue: number }

const DATA: Omit<Candidate, "id">[] = [
  { name: "Ana Ribeiro", role: "Senior full-stack engineer", city: "Lisbon", overlap: "5 h overlap", rate: "$4,200 / mo", skills: ["TypeScript", "Postgres", "7 yrs"], hue: 200 },
  { name: "Mateo Quiroga", role: "Backend engineer", city: "Buenos Aires", overlap: "7 h overlap", rate: "$3,800 / mo", skills: ["Go", "AWS", "5 yrs"], hue: 170 },
  { name: "Kasia Nowak", role: "Frontend engineer", city: "Kraków", overlap: "4 h overlap", rate: "$3,900 / mo", skills: ["React", "Design systems", "6 yrs"], hue: 260 },
  { name: "Thabo Mokoena", role: "DevOps engineer", city: "Cape Town", overlap: "4 h overlap", rate: "$4,000 / mo", skills: ["Kubernetes", "Terraform", "8 yrs"], hue: 30 },
];

export default function CandidateStack({ accent = "#0369a1", autoplay = false }: { accent?: string; autoplay?: boolean }) {
  const [cards, setCards] = useState<Candidate[]>(() => DATA.map((d, i) => ({ ...d, id: i })));
  const [log, setLog] = useState<{ ok: boolean; name: string } | null>(null);
  const nextId = useRef(DATA.length);
  const touched = useRef(false);
  const cardsRef = useRef(cards);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const yes = useTransform(x, [20, 120], [0, 1]);
  const no = useTransform(x, [-120, -20], [1, 0]);

  useEffect(() => { cardsRef.current = cards; }, [cards]);

  const fling = async (dir: 1 | -1) => {
    const top = cardsRef.current[0];
    if (!top) return;
    await animate(x, dir * 520, { type: "spring", stiffness: 180, damping: 24, velocity: dir * 800 });
    setLog({ ok: dir > 0, name: top.name.split(" ")[0] });
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
      fling(k++ % 3 === 2 ? -1 : 1);
    }, 2000);
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
            return (
              <motion.div
                key={c.id}
                className="absolute inset-x-0 top-6 h-[200px] cursor-grab touch-pan-y rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.35)] active:cursor-grabbing"
                style={top ? { x, rotate, zIndex: 10 } : { zIndex: 10 - i }}
                drag={top ? "x" : false}
                dragMomentum={false}
                onDragEnd={top ? onEnd : undefined}
                initial={{ y: -40, scale: 0.8, opacity: 0 }}
                animate={{ y: -i * 12, scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: `linear-gradient(140deg,hsl(${c.hue} 70% 50%),hsl(${c.hue + 40} 70% 32%))` }} aria-hidden="true">
                    {c.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{c.name}</span>
                    <span className="truncate text-[13px] text-[#6e6e73]">{c.role}</span>
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.skills.map((s) => <span key={s} className="rounded-full bg-[#f0f0f3] px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f]">{s}</span>)}
                </div>
                <div className="mt-4 flex items-center justify-between text-[13px]">
                  <span className="font-medium" style={{ color: accent }}>{c.city} · {c.overlap}</span>
                  <span className="tabular-nums text-[#6e6e73]">{c.rate}</span>
                </div>
                {top && (
                  <>
                    <motion.span className="absolute right-5 top-5 rotate-[10deg] rounded-lg border-[3px] border-[#248a3d] px-2 py-0.5 text-[14px] font-bold uppercase tracking-wider text-[#248a3d]" style={{ opacity: yes }} aria-hidden="true">Interview</motion.span>
                    <motion.span className="absolute right-5 top-5 rotate-[-10deg] rounded-lg border-[3px] border-[#d70015] px-2 py-0.5 text-[14px] font-bold uppercase tracking-wider text-[#d70015]" style={{ opacity: no }} aria-hidden="true">Pass</motion.span>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {cards.length === 0 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <span className="text-[17px] font-semibold text-[#1d1d1f]">Interviews booked.</span>
              <span className="text-[13px] text-[#6e6e73]">Your talent partner sends times within the hour.</span>
              <button type="button" onClick={reset} className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ ["--tw-ring-color" as string]: accent }}>See the shortlist again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Pass on this candidate" disabled={!cards.length} onClick={() => fling(-1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#d70015] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none disabled:opacity-40 focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </motion.button>
        <span className="relative h-5 w-[170px] overflow-hidden text-center text-[13px] text-[#6e6e73]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={log ? `${log.name}-${log.ok}-${cards.length}` : "none"} className="block truncate" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
              {log ? (log.ok ? `Interview with ${log.name}` : `Passed on ${log.name}`) : `${cards.length} on your shortlist`}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Book an interview with this candidate" disabled={!cards.length} onClick={() => fling(1)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#248a3d] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none disabled:opacity-40 focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: accent }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </motion.button>
      </div>
    </div>
  );
}
