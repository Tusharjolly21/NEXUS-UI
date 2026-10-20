"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Cat { id: string; label: string; color: string; tokens: number }

const BASE: Cat[] = [
  { id: "sys", label: "System prompt", color: "#1d1d1f", tokens: 4.2 },
  { id: "tools", label: "Tools", color: "#5e5ce6", tokens: 12.8 },
  { id: "files", label: "Files", color: "#ff9f0a", tokens: 46.1 },
  { id: "conv", label: "Conversation", color: "#0071e3", tokens: 38.4 },
  { id: "mem", label: "Memory", color: "#30d158", tokens: 3.9 },
];

const LIMIT = 200; // K tokens
const COLS = 40;
const ROWS = 5;
const PER = LIMIT / (COLS * ROWS); // K per dot

/**
 * A context-window meter drawn as a dot grid. Hover a category to light only
 * its dots. The conversation keeps growing; press Compact and its dots drop
 * out of the grid and everything after them closes the gap.
 */
export default function ContextMeter({ autoplay = false }: { autoplay?: boolean }) {
  const [cats, setCats] = useState(BASE);
  const [hover, setHover] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const touched = useRef(false);
  const total = cats.reduce((a, c) => a + c.tokens, 0);

  const dots = useMemo(() => {
    const out: { cat: Cat; k: string }[] = [];
    cats.forEach((c) => {
      const n = Math.round(c.tokens / PER);
      for (let i = 0; i < n; i++) out.push({ cat: c, k: `${c.id}-${i}` });
    });
    return out.slice(0, COLS * ROWS);
  }, [cats]);

  useEffect(() => {
    const t = setInterval(() => {
      if (dropping) return;
      setCats((cs) => cs.map((c) => (c.id === "conv" && cs.reduce((a, x) => a + x.tokens, 0) < LIMIT - 8 ? { ...c, tokens: c.tokens + 2.2 } : c)));
    }, 380);
    return () => clearInterval(t);
  }, [dropping]);

  const compact = () => {
    setDropping(true);
    setTimeout(() => {
      setCats((cs) => cs.map((c) => (c.id === "conv" ? { ...c, tokens: 6.2 } : c)));
      setDropping(false);
    }, 650);
  };

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) return;
      setCats((cs) => {
        const tot = cs.reduce((a, x) => a + x.tokens, 0);
        if (tot > LIMIT * 0.9) setTimeout(compact, 0);
        return cs;
      });
    }, 1000);
    const h = setInterval(() => !touched.current && setHover((p) => { const ids = [null, "files", "tools", "conv"]; return ids[(ids.indexOf(p) + 1) % ids.length]; }), 1700);
    return () => { clearInterval(t); clearInterval(h); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const pct = Math.round((total / LIMIT) * 100);

  return (
    <div className="w-[400px] rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]" onPointerDown={() => (touched.current = true)} onPointerEnter={() => (touched.current = true)}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">Context window</span>
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: pct > 85 ? "#d70015" : pct > 70 ? "#b25000" : "#86868b" }}>{pct}%</span>
      </div>
      <div className="mb-3 flex items-baseline gap-1">
        <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{total.toFixed(1)}K</span>
        <span className="text-[13px] text-[#86868b]">of {LIMIT}K tokens</span>
      </div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const d = dots[i];
          const dim = hover && d && d.cat.id !== hover;
          const falling = dropping && d?.cat.id === "conv";
          return (
            <motion.span
              key={d ? d.k : `e${i}`}
              layout="position"
              className="aspect-square rounded-full"
              initial={d ? { scale: 0 } : false}
              animate={
                falling
                  ? { y: 26 + (i % 7) * 3, opacity: 0, scale: 0.4, transition: { duration: 0.5, delay: (i % COLS) * 0.008, ease: "easeIn" } }
                  : { scale: 1, y: 0, opacity: d ? (dim ? 0.18 : 1) : 1, backgroundColor: d ? d.cat.color : "#e8e8ed" }
              }
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          );
        })}
      </div>
      <ul className="mt-4 flex list-none flex-col gap-0.5 p-0">
        {cats.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onPointerEnter={() => setHover(c.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(c.id)}
              onBlur={() => setHover(null)}
              className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1">{c.label}</span>
              <span className="relative h-4 overflow-hidden tabular-nums text-[#6e6e73]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={c.tokens.toFixed(1)} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                    {c.tokens.toFixed(1)}K
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f3] pt-3">
        <span className="text-[12px] text-[#86868b]">{(LIMIT - total).toFixed(1)}K left</span>
        <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => { touched.current = true; compact(); }} className="h-8 rounded-full bg-[#1d1d1f] px-3.5 text-[12px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]">
          Compact chat
        </motion.button>
      </div>
    </div>
  );
}
