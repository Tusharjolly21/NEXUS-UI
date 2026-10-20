"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Person { id: string; name: string; hue: number }

const PEOPLE: Person[] = [
  { id: "mo", name: "Mom", hue: 340 }, { id: "da", name: "Dad", hue: 210 }, { id: "ri", name: "Riya", hue: 280 },
  { id: "ar", name: "Arjun", hue: 30 }, { id: "sa", name: "Sam", hue: 160 }, { id: "le", name: "Lea", hue: 5 },
  { id: "ka", name: "Kai", hue: 195 }, { id: "no", name: "Noor", hue: 120 }, { id: "ma", name: "Maya", hue: 255 },
  { id: "jo", name: "Jo", hue: 45 }, { id: "te", name: "Teo", hue: 300 }, { id: "iv", name: "Ivy", hue: 90 },
];

// How important each person is in each group (0 = not in it).
const GROUPS: Record<string, Record<string, number>> = {
  Family: { mo: 5, da: 5, ri: 4, ar: 3, jo: 2, iv: 2 },
  "Close friends": { sa: 5, le: 4, ka: 4, no: 3, ma: 3, te: 2, ar: 2 },
  Work: { ma: 5, ka: 4, te: 3, no: 3, iv: 2, jo: 2, le: 2, sa: 1 },
};

interface Placed { id: string; x: number; y: number; r: number }

/** Pack circles around the centre: a few hundred steps of pull-to-centre plus overlap removal. */
function pack(weights: Record<string, number>): Placed[] {
  const items = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([id, w], i) => {
      const a = i * 2.4;
      return { id, r: 14 + w * 7, x: Math.cos(a) * (i * 12), y: Math.sin(a) * (i * 12) };
    });
  for (let step = 0; step < 300; step++) {
    for (const p of items) { p.x *= 0.96; p.y *= 0.96; }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, m = a.r + b.r + 4;
      if (d < m) { const o = (m - d) / 2 / d; a.x -= dx * o; a.y -= dy * o; b.x += dx * o; b.y += dy * o; }
    }
  }
  return items;
}

/**
 * Contacts packed into one bubble cluster, sized by how close they are. Switch
 * groups and everyone springs to new positions and sizes, people outside the
 * group shrink away, and a soft liquid backdrop re-forms around the cluster.
 */
export default function BubbleCluster({ autoplay = false }: { autoplay?: boolean }) {
  const fid = "b" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const groups = Object.keys(GROUPS);
  const [group, setGroup] = useState(groups[0]);
  const touched = useRef(false);
  const layouts = useMemo(() => Object.fromEntries(groups.map((g) => [g, pack(GROUPS[g])])) as Record<string, Placed[]>, []);  // eslint-disable-line react-hooks/exhaustive-deps
  const placed = layouts[group];

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setGroup(groups[++k % groups.length]);
    }, 2400);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const spring = { type: "spring", stiffness: 140, damping: 16 } as const;
  const C = { x: 210, y: 140 };

  return (
    <div className="flex flex-col items-center gap-4" onPointerDown={() => (touched.current = true)}>
      <div className="relative h-[280px] w-[420px] max-w-full">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={fid}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
        </svg>
        <div className="absolute inset-0" style={{ filter: `url(#${fid})` }} aria-hidden="true">
          {PEOPLE.map((p) => {
            const q = placed.find((x) => x.id === p.id);
            return (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-[#0071e3]"
                initial={false}
                animate={q ? { x: C.x + q.x - q.r - 10, y: C.y + q.y - q.r - 10, width: q.r * 2 + 20, height: q.r * 2 + 20, opacity: 1 } : { x: C.x - 10, y: C.y - 10, width: 20, height: 20, opacity: 0 }}
                transition={spring}
              />
            );
          })}
        </div>
        {PEOPLE.map((p, i) => {
          const q = placed.find((x) => x.id === p.id);
          return (
            <motion.span
              key={p.id}
              role="img"
              aria-label={p.name}
              aria-hidden={!q}
              className="absolute flex items-center justify-center overflow-hidden rounded-full font-semibold text-white shadow-[0_0_0_3px_#fff]"
              style={{ background: `linear-gradient(140deg, hsl(${p.hue} 85% 68%), hsl(${(p.hue + 40) % 360} 75% 48%))` }}
              initial={false}
              animate={q ? { x: C.x + q.x - q.r, y: C.y + q.y - q.r, width: q.r * 2, height: q.r * 2, opacity: 1, fontSize: Math.max(11, q.r * 0.42) } : { x: C.x - 6, y: C.y - 6, width: 12, height: 12, opacity: 0, fontSize: 1 }}
              transition={{ ...spring, delay: i * 0.015 }}
            >
              {p.name}
            </motion.span>
          );
        })}
      </div>
      <div role="group" aria-label="Group" className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px]">
        {groups.map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => { touched.current = true; setGroup(g); }} className="relative z-10 h-8 rounded-[9px] px-4 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]">
            {group === g && <motion.span layoutId="bubble-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
