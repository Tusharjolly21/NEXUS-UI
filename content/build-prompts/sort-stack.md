# Sort Stack

Add the "Sort Stack" component from Nexus UI to my project.

A table that sorts like a stack of cards. Press a column and the rows lift apart, slide past each other to their new places with the furthest travellers riding highest, then close back into a table, so you can follow any row through the sort.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SortStack } from "@/components/sort-stack";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/sort-stack/index.ts ---

```ts
import type { ComponentProps } from "react";
import { SortStack } from "./sort-stack";

export { SortStack };
export type SortStackProps = ComponentProps<typeof SortStack>;
```

--- components/sort-stack/sort-stack.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Member { id: number; name: string; email: string; plan: "Pro" | "Team" | "Free"; seats: number; spend: number; active: number; activeLabel: string; tone: string }
const MEMBERS: Member[] = [
  { id: 1, name: "Anna Lee", email: "anna@orchard.co", plan: "Team", seats: 12, spend: 1440, active: 2, activeLabel: "2 min ago", tone: "#d6e4f5" },
  { id: 2, name: "Marcus Webb", email: "marcus@orchard.co", plan: "Pro", seats: 3, spend: 360, active: 180, activeLabel: "3 hr ago", tone: "#f3e0cc" },
  { id: 3, name: "Priya Shah", email: "priya@orchard.co", plan: "Team", seats: 8, spend: 960, active: 25, activeLabel: "25 min ago", tone: "#dcecd6" },
  { id: 4, name: "Leo Park", email: "leo@orchard.co", plan: "Free", seats: 1, spend: 0, active: 4320, activeLabel: "3 days ago", tone: "#ece1f2" },
  { id: 5, name: "Sofia Ruiz", email: "sofia@orchard.co", plan: "Pro", seats: 5, spend: 600, active: 60, activeLabel: "1 hr ago", tone: "#f6dada" },
  { id: 6, name: "Tom Becker", email: "tom@orchard.co", plan: "Team", seats: 20, spend: 2400, active: 1440, activeLabel: "Yesterday", tone: "#e3e3e8" },
];
type Col = "name" | "plan" | "seats" | "spend" | "active";
const COLS: { key: Col; label: string; align: "left" | "right"; first?: "asc" | "desc" }[] = [
  { key: "name", label: "Member", align: "left", first: "asc" },
  { key: "plan", label: "Plan", align: "left", first: "asc" },
  { key: "seats", label: "Seats", align: "right", first: "desc" },
  { key: "spend", label: "Spend", align: "right", first: "desc" },
  { key: "active", label: "Last active", align: "right", first: "asc" },
];
const PLAN_RANK = { Team: 0, Pro: 1, Free: 2 };
const SPRING = { type: "spring", stiffness: 420, damping: 38 } as const;
const MOVE = { type: "spring", stiffness: 260, damping: 30 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const GRID = "grid grid-cols-[minmax(0,1.7fr)_72px_56px_84px_96px] items-center gap-3";

/**
 * SortStack: a table that sorts the way you would sort a stack of cards. Press a column and the rows lift apart into
 * separate cards, slide past each other to their new places (the ones travelling furthest rising highest) and close
 * back up into a table. You can follow any row the whole way, so a sort never feels like the page was swapped.
 *
 * `rows` replaces the demo team. `autoplay` sorts a few columns on its own until the first real interaction.
 */
export function SortStack({ autoplay = false, rows = MEMBERS }: { autoplay?: boolean; rows?: Member[] }) {
  const reduce = useReducedMotion();
  const [sort, setSort] = useState<{ col: Col; dir: "asc" | "desc" }>({ col: "name", dir: "asc" });
  const [lift, setLift] = useState(false);
  const [order, setOrder] = useState<number[]>(() => sorted(rows, "name", "asc").map((r) => r.id));
  const prev = useRef<number[]>(order);
  const touched = useRef(false);
  const busy = useRef<ReturnType<typeof setTimeout>[]>([]);

  const by = (col: Col) => {
    const dir: "asc" | "desc" = sort.col === col ? (sort.dir === "asc" ? "desc" : "asc") : COLS.find((c) => c.key === col)!.first ?? "asc";
    const next = sorted(rows, col, dir).map((r) => r.id);
    setSort({ col, dir });
    busy.current.forEach(clearTimeout);
    if (reduce) { setOrder(next); return; }
    // lift the rows apart, deal them into the new order, then close the stack
    prev.current = order;
    setLift(true);
    busy.current = [
      setTimeout(() => setOrder(next), 160),
      setTimeout(() => setLift(false), 900),
    ];
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const ok = () => live && !touched.current;
    (async () => {
      await sleep(1200);
      const plan: Col[] = ["spend", "active", "plan", "name"];
      while (ok()) {
        for (const c of plan) { if (!ok()) return; byRef.current(c); await sleep(2300); }
      }
    })();
    return () => { live = false; };
  }, [autoplay, reduce]);
  const byRef = useRef(by);
  byRef.current = by;

  const take = () => { touched.current = true; };
  const list = order.map((id) => rows.find((r) => r.id === id)!);
  const dist = (id: number) => Math.abs(order.indexOf(id) - prev.current.indexOf(id));

  return (
    <div
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="w-full max-w-[680px] rounded-[24px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <div className="flex items-baseline justify-between px-3 pb-3 pt-3">
        <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Team usage</h3>
        <span className="text-[12.5px] text-[#86868b]">November</span>
      </div>
      <div role="table" aria-label="Team usage" className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div role="row" className={`${GRID} border-b border-[#e8e8ed] px-3 pb-2`}>
            {COLS.map((c) => {
              const on = sort.col === c.key;
              return (
                <div key={c.key} role="columnheader" aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={c.align === "right" ? "text-right" : ""}>
                  <button type="button" onClick={() => by(c.key)} className={`inline-flex h-7 items-center gap-1 rounded-[7px] px-1.5 text-[12.5px] font-medium outline-none transition-colors hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] ${on ? "text-[#1d1d1f]" : "text-[#86868b]"} ${c.align === "right" ? "-mr-1.5 flex-row-reverse" : "-ml-1.5"}`}>
                    <motion.span className="grid place-items-center" animate={{ rotate: on && sort.dir === "desc" ? 180 : 0, opacity: on ? 1 : 0 }} transition={SPRING}><Glyph d={ICON.arrow_up} size={10} /></motion.span>
                    {c.label}
                  </button>
                </div>
              );
            })}
          </div>
          <motion.div role="rowgroup" className="relative flex flex-col" initial={false} style={{ rowGap: 0, paddingTop: 4 }} animate={{ rowGap: lift ? 6 : 0, paddingTop: lift ? 8 : 4 }} transition={SPRING}>
            {list.map((m, i) => {
              const far = Math.min(1, dist(m.id) / 3);
              return (
                <motion.div
                  key={m.id}
                  role="row"
                  layout="position"
                  transition={{ layout: { ...MOVE, delay: reduce ? 0 : i * 0.025 }, default: SPRING }}
                  animate={{
                    backgroundColor: lift ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
                    boxShadow: lift ? `0 0 0 .5px rgba(0,0,0,.08), 0 ${6 + far * 10}px ${14 + far * 18}px -8px rgba(0,0,0,${0.16 + far * 0.12})` : "0 0 0 0px rgba(0,0,0,0), 0 0px 0px 0px rgba(0,0,0,0)",
                    scale: lift ? 0.985 + far * 0.02 : 1,
                    borderRadius: lift ? 14 : 0,
                  }}
                  style={{ zIndex: lift ? 1 + Math.round(far * 10) : 0 }}
                  className={`${GRID} relative px-3 py-2.5`}
                >
                  <div role="cell" className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11.5px] font-semibold text-[#1d1d1f]" style={{ background: m.tone }}>
                      {m.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate text-[14px] ${sort.col === "name" ? "font-semibold" : "font-medium"} text-[#1d1d1f]`}>{m.name}</span>
                      <span className="block truncate text-[12px] text-[#86868b]">{m.email}</span>
                    </span>
                  </div>
                  <div role="cell">
                    <span className={`inline-flex h-[22px] items-center rounded-full px-2 text-[11.5px] font-medium ${m.plan === "Team" ? "bg-[#e8f1fd] text-[#0058b0]" : m.plan === "Pro" ? "bg-[#f1f1f4] text-[#1d1d1f]" : "bg-transparent text-[#86868b] shadow-[inset_0_0_0_1px_#e5e5ea]"}`}>{m.plan}</span>
                  </div>
                  <Num on={sort.col === "seats"}>{m.seats}</Num>
                  <Num on={sort.col === "spend"}>{m.spend ? `$${m.spend.toLocaleString("en-US")}` : "$0"}</Num>
                  <Num on={sort.col === "active"}>{m.activeLabel}</Num>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Num({ on, children }: { on: boolean; children: ReactNode }) {
  return <div role="cell" className={`text-right text-[14px] tabular-nums transition-colors ${on ? "font-semibold text-[#1d1d1f]" : "text-[#6e6e73]"}`}>{children}</div>;
}

function sorted(rows: Member[], col: Col, dir: "asc" | "desc") {
  const k = (m: Member): number | string => (col === "name" ? m.name : col === "plan" ? PLAN_RANK[m.plan] : col === "seats" ? m.seats : col === "spend" ? m.spend : m.active);
  return [...rows].sort((a, b) => {
    const x = k(a), y = k(b);
    const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
    return dir === "asc" ? c : -c;
  });
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  arrow_up: "M27.988 50.137c1.22 0 2.11-.844 2.11-2.063V17.207l-.188-4.992l7.008 7.687l5.344 5.25c.375.375.937.563 1.476.563c1.172 0 2.04-.89 2.04-2.04c0-.562-.212-1.054-.657-1.523L29.56 6.566c-.446-.468-.985-.703-1.57-.703c-.563 0-1.102.235-1.548.703L10.88 22.152c-.445.47-.656.961-.656 1.524c0 1.148.867 2.039 2.015 2.039c.563 0 1.125-.188 1.5-.563l5.32-5.25l7.032-7.71l-.188 5.015v30.867c0 1.219.867 2.063 2.086 2.063",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}
```
