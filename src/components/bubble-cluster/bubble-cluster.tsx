"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface ClusterPerson {
  id: string;
  name: string;
  /** Hue (0-360) that tints the avatar. */
  hue: number;
}

/** Group name to { person id: closeness 1-5 }. People missing from a group are hidden in it. */
export type ClusterGroups = Record<string, Record<string, number>>;

export interface BubbleClusterProps {
  people?: ClusterPerson[];
  groups?: ClusterGroups;
  /** Steps through the groups by itself until someone presses the cluster or the switcher. */
  autoplay?: boolean;
  /** Space between bubbles, 0 to 24. Default 5. */
  gap?: number;
  /** How much closeness changes size, 0 to 2. 0 makes every bubble the same size; higher makes the closest people much bigger. Default 1. */
  sizeContrast?: number;
  /** How bouncy the bubbles are when they move, 0.5 to 2.5. Lower is smooth and settled, higher wobbles. Default 1. */
  bounce?: number;
  /** Strength of the faint liquid backdrop, 0 to 4. 0 hides it. Default 1. */
  liquid?: number;
}

const clamp = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

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

const W = 420;
const H = 290;

/** Pack circles around the centre: pull-to-centre (a little harder up and down, so the cluster is wide like its stage) plus overlap removal. */
function pack(weights: Record<string, number>, gap = 5, contrast = 1): Placed[] {
  const items = Object.entries(weights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, w], i) => {
      const a = i * 2.4;
      return { id, r: Math.max(14, 44 + (w - 3) * 8 * contrast), x: Math.cos(a) * (i * 14), y: Math.sin(a) * (i * 12) };
    });
  for (let step = 0; step < 400; step++) {
    for (const p of items) { p.x *= 0.97; p.y *= 0.94; }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, m = a.r + b.r + gap;
      if (d < m) { const o = (m - d) / 2 / d; a.x -= dx * o; a.y -= dy * o; b.x += dx * o; b.y += dy * o; }
    }
  }
  return items;
}

/** Centre the packed cluster on its own bounds and scale it to fill the stage, so every group looks balanced. */
function fit(items: Placed[]): Placed[] {
  if (!items.length) return items;
  const minX = Math.min(...items.map((p) => p.x - p.r)), maxX = Math.max(...items.map((p) => p.x + p.r));
  const minY = Math.min(...items.map((p) => p.y - p.r)), maxY = Math.max(...items.map((p) => p.y + p.r));
  const k = Math.min(1.3, Math.max(0.7, Math.min((W - 72) / (maxX - minX), (H - 64) / (maxY - minY))));
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return items.map((p) => ({ id: p.id, x: (p.x - cx) * k, y: (p.y - cy) * k, r: p.r * k }));
}


/** Scale the fixed-size stage to the width it is given, so the layout is the same on a phone. */
function useStageScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, scale] as const;
}

/**
 * Contacts packed into one bubble cluster, sized by how close they are. Switch groups and
 * everyone springs to new positions and sizes (the closest people move first), people outside
 * the group shrink away, and a faint liquid backdrop re-forms around the cluster. Hover a person
 * to read how close they are.
 */
export function BubbleCluster({ people = DEFAULT_PEOPLE, groups = DEFAULT_GROUPS, autoplay = false, gap = 5, sizeContrast = 1, bounce = 1, liquid = 1 }: BubbleClusterProps) {
  const gapPx = clamp(gap, 0, 24);
  const contrast = clamp(sizeContrast, 0, 2);
  const spring = { type: "spring", stiffness: 170, damping: 17 / clamp(bounce, 0.5, 2.5) } as const;
  const liquidK = clamp(liquid, 0, 4);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fid = "b" + uid;
  const names = useMemo(() => Object.keys(groups), [groups]);
  const [picked, setPicked] = useState(names[0]);
  const [hover, setHover] = useState<string | null>(null);
  const group = names.includes(picked) ? picked : names[0];
  const touched = useRef(false);
  const layouts = useMemo(() => Object.fromEntries(names.map((g) => [g, fit(pack(groups[g], gapPx, contrast))])) as Record<string, Placed[]>, [names, groups, gapPx, contrast]);
  const placed = layouts[group] ?? [];
  const weights = groups[group] ?? {};
  const [stageRef, scale] = useStageScale();
  const who = hover ? people.find((p) => p.id === hover) : undefined;
  const caption = who && weights[who.id] ? `${who.name} · ${weights[who.id]} of 5 close` : `${placed.length} people · bigger is closer`;

  useEffect(() => {
    if (!autoplay || names.length < 2) return;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setPicked((g) => names[(names.indexOf(g) + 1) % names.length]);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, names]);

  return (
    <div
      className="flex w-[420px] max-w-full flex-col items-center gap-3"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div ref={stageRef} className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <div className="absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <filter id={fid}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
            </filter>
          </svg>
          {/* liquid backdrop: blurred blobs thresholded back to a sharp edge, then lightened to a faint tint */}
          <div
            className="absolute inset-0 opacity-[var(--bc-o)] dark:opacity-[var(--bc-od)]"
            style={{ ["--bc-o" as string]: Math.min(1, 0.1 * liquidK), ["--bc-od" as string]: Math.min(1, 0.2 * liquidK) }}
            aria-hidden="true"
          >
            <div className="absolute inset-0" style={{ filter: `url(#${fid})` }}>
              {people.map((p) => {
                const q = placed.find((x) => x.id === p.id);
                return (
                  <motion.span
                    key={p.id}
                    className="absolute rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
                    initial={false}
                    animate={q ? { x: W / 2 + q.x - q.r - 12, y: H / 2 + q.y - q.r - 12, width: q.r * 2 + 24, height: q.r * 2 + 24, opacity: 1 } : { x: W / 2 - 12, y: H / 2 - 12, width: 24, height: 24, opacity: 0 }}
                    transition={spring}
                  />
                );
              })}
            </div>
          </div>
          <div role="list" aria-label={`${group}, sized by closeness`}>
            {people.map((p) => {
              const q = placed.find((x) => x.id === p.id);
              const rank = q ? placed.indexOf(q) : 0;
              const fs = q ? Math.min(21, Math.max(13.5, q.r * 0.36)) : 13;
              // Show the whole name when it fits inside the bubble, otherwise the first letter.
              const label = q && q.r * 2 - 14 >= p.name.length * fs * 0.6 ? p.name : p.name.charAt(0);
              return (
                <motion.span
                  key={p.id}
                  role="listitem"
                  aria-label={q ? `${p.name}, ${weights[p.id]} of 5 close` : p.name}
                  aria-hidden={!q}
                  onPointerEnter={() => q && setHover(p.id)}
                  onPointerLeave={() => setHover((h) => (h === p.id ? null : h))}
                  className="absolute flex cursor-default select-none items-center justify-center rounded-full font-semibold tracking-[-0.01em] text-[hsl(var(--h)_62%_25%)] shadow-[inset_0_0_0_1px_hsl(var(--h)_60%_45%/0.16),0_12px_24px_-14px_hsl(var(--h)_70%_35%/0.55)] bg-[linear-gradient(165deg,hsl(var(--h)_95%_97%),hsl(var(--h)_80%_89%))] dark:text-[hsl(var(--h)_90%_90%)] dark:bg-[linear-gradient(165deg,hsl(var(--h)_32%_32%),hsl(var(--h)_36%_22%))] dark:shadow-[inset_0_0_0_1px_hsl(var(--h)_70%_75%/0.18),0_12px_24px_-14px_rgba(0,0,0,0.7)]"
                  style={{ ["--h" as string]: p.hue, pointerEvents: q ? "auto" : "none" }}
                  initial={false}
                  animate={q ? { x: W / 2 + q.x - q.r, y: H / 2 + q.y - q.r, width: q.r * 2, height: q.r * 2, opacity: 1, fontSize: fs } : { x: W / 2 - 6, y: H / 2 - 6, width: 12, height: 12, opacity: 0, fontSize: 1 }}
                  whileHover={q ? { scale: 1.07 } : undefined}
                  whileTap={q ? { scale: 0.96 } : undefined}
                  transition={{ ...spring, delay: rank * 0.02 }}
                >
                  {label}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>
      <p aria-hidden="true" className="min-h-[18px] text-center text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
        {caption}
      </p>
      <div
        role="group"
        aria-label="Group"
        className="relative grid rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#2c2c2e]"
        style={{ gridTemplateColumns: `repeat(${names.length}, auto)` }}
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
            className="relative z-10 h-8 whitespace-nowrap rounded-[9px] px-3.5 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:outline-[#0a84ff]"
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
