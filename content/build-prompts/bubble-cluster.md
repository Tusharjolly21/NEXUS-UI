# Bubble Cluster

Add the "Bubble Cluster" component from Nexus UI to my project.

Contacts packed into one cluster of avatar bubbles sized by how close they are, sitting on a liquid backdrop. Switch groups and everyone springs to new places and sizes while people outside the group shrink away.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { BubbleCluster, DEFAULT_PEOPLE, DEFAULT_GROUPS } from "@/components/bubble-cluster";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/bubble-cluster/bubble-cluster.tsx ---

```tsx
"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface ClusterPerson {
  id: string;
  name: string;
  /** Hue (0-360) of the avatar gradient. */
  hue: number;
}

/** Group name to { person id: closeness 1-5 }. People missing from a group are hidden in it. */
export type ClusterGroups = Record<string, Record<string, number>>;

export interface BubbleClusterProps {
  people?: ClusterPerson[];
  groups?: ClusterGroups;
  /** Steps through the groups by itself until someone presses the cluster or the switcher. */
  autoplay?: boolean;
}

export const DEFAULT_PEOPLE: ClusterPerson[] = [
  { id: "mo", name: "Mom", hue: 340 }, { id: "da", name: "Dad", hue: 210 }, { id: "ri", name: "Riya", hue: 280 },
  { id: "ar", name: "Arjun", hue: 30 }, { id: "sa", name: "Sam", hue: 160 }, { id: "le", name: "Lea", hue: 5 },
  { id: "ka", name: "Kai", hue: 195 }, { id: "no", name: "Noor", hue: 120 }, { id: "ma", name: "Maya", hue: 255 },
  { id: "jo", name: "Jo", hue: 45 }, { id: "te", name: "Teo", hue: 300 }, { id: "iv", name: "Ivy", hue: 90 },
];

// How important each person is in each group (0 = not in it).
export const DEFAULT_GROUPS: ClusterGroups = {
  Family: { mo: 5, da: 5, ri: 4, ar: 3, jo: 2, iv: 2 },
  "Close friends": { sa: 5, le: 4, ka: 4, no: 3, ma: 3, te: 2, ar: 2 },
  Work: { ma: 5, ka: 4, te: 3, no: 3, iv: 2, jo: 2, le: 2, sa: 1 },
};

interface Placed { id: string; x: number; y: number; r: number }

/** Pack circles around the centre: a few hundred steps of pull-to-centre plus overlap removal. */
function pack(weights: Record<string, number>): Placed[] {
  const items = Object.entries(weights)
    .filter(([, w]) => w > 0)
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

const spring = { type: "spring", stiffness: 140, damping: 16 } as const;
const C = { x: 210, y: 140 };

/**
 * Contacts packed into one bubble cluster, sized by how close they are. Switch groups and
 * everyone springs to new positions and sizes, people outside the group shrink away, and a
 * soft liquid backdrop re-forms around the cluster.
 */
export function BubbleCluster({ people = DEFAULT_PEOPLE, groups = DEFAULT_GROUPS, autoplay = false }: BubbleClusterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fid = "b" + uid;
  const names = useMemo(() => Object.keys(groups), [groups]);
  const [picked, setPicked] = useState(names[0]);
  const group = names.includes(picked) ? picked : names[0];
  const touched = useRef(false);
  const layouts = useMemo(() => Object.fromEntries(names.map((g) => [g, pack(groups[g])])) as Record<string, Placed[]>, [names, groups]);
  const placed = layouts[group] ?? [];

  useEffect(() => {
    if (!autoplay || names.length < 2) return;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setPicked((g) => names[(names.indexOf(g) + 1) % names.length]);
    }, 2400);
    return () => clearInterval(t);
  }, [autoplay, names]);

  return (
    <div
      className="flex flex-col items-center gap-4"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative h-[280px] w-[420px] max-w-full">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={fid}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
        </svg>
        {/* liquid backdrop: blurred blobs thresholded back to a sharp edge */}
        <div className="absolute inset-0" style={{ filter: `url(#${fid})` }} aria-hidden="true">
          {people.map((p) => {
            const q = placed.find((x) => x.id === p.id);
            return (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
                initial={false}
                animate={q ? { x: C.x + q.x - q.r - 10, y: C.y + q.y - q.r - 10, width: q.r * 2 + 20, height: q.r * 2 + 20, opacity: 1 } : { x: C.x - 10, y: C.y - 10, width: 20, height: 20, opacity: 0 }}
                transition={spring}
              />
            );
          })}
        </div>
        {people.map((p, i) => {
          const q = placed.find((x) => x.id === p.id);
          return (
            <motion.span
              key={p.id}
              role="img"
              aria-label={p.name}
              aria-hidden={!q}
              className="absolute flex items-center justify-center overflow-hidden rounded-full font-semibold text-white shadow-[0_0_0_3px_#fff] dark:shadow-[0_0_0_3px_#1c1c1e]"
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
      <div
        role="group"
        aria-label="Group"
        className="relative grid rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#2c2c2e]"
        style={{ gridTemplateColumns: `repeat(${names.length}, minmax(0, 1fr))` }}
      >
        {names.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => {
              touched.current = true;
              setPicked(g);
            }}
            className="relative z-10 h-8 rounded-[9px] px-4 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:outline-[#0a84ff]"
          >
            {group === g && (
              <motion.span
                layoutId={`bubble-seg-${uid}`}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366] dark:shadow-[0_2px_6px_rgba(0,0,0,.4)]"
              />
            )}
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
```

--- components/bubble-cluster/index.ts ---

```ts
export { BubbleCluster, DEFAULT_PEOPLE, DEFAULT_GROUPS } from "./bubble-cluster";
export type { BubbleClusterProps, ClusterPerson, ClusterGroups } from "./bubble-cluster";
```
