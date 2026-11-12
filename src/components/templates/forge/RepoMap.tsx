"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONT_MONO, HEAT, IRON, heatColor } from "./theme";

/**
 * The repository beside Forge's editor, one square per file, grouped by package and coloured by how often each
 * file changed (cold grey to white-hot). On load the squares light up outward from the open file, the way Forge
 * reads a repo. When the lens in the editor rests on something, lines run from that line of code to the exact
 * files elsewhere in the repo it's about: the callers, the rules file that throws, the type with the new case,
 * the test that's missing. Everything is laid out in the hero stage's own pixels.
 */

/** A small seeded random, so the map is the same on every load. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PKGS = [
  { name: "checkout", files: 42, real: 612, col: 0 },
  { name: "cart", files: 66, real: 948, col: 0 },
  { name: "web", files: 96, real: 1406, col: 0 },
  { name: "money", files: 22, real: 188, col: 0 },
  { name: "pricing", files: 34, real: 421, col: 1 },
  { name: "api", files: 78, real: 803, col: 1 },
  { name: "pos", files: 44, real: 377, col: 1 },
  { name: "tests", files: 57, real: 657, col: 1 },
] as const;

type PkgName = (typeof PKGS)[number]["name"];

/** The open file: checkout/applyDiscount.ts. */
const OPEN = { pkg: "checkout" as PkgName, i: 10 };

type Target = { pkg: PkgName; i: number; flag?: boolean };
/** What each note in the editor points at, in the same order as the editor's notes. */
const TARGETS: { tone: string; files: Target[]; tags: Partial<Record<PkgName, string>> }[] = [
  {
    tone: IRON.ember,
    files: [
      { pkg: "cart", i: 3 }, { pkg: "cart", i: 9 }, { pkg: "cart", i: 14, flag: true }, { pkg: "cart", i: 22 }, { pkg: "cart", i: 31 }, { pkg: "cart", i: 40 },
      { pkg: "pos", i: 2 }, { pkg: "pos", i: 11 }, { pkg: "pos", i: 19, flag: true }, { pkg: "pos", i: 30 },
      { pkg: "web", i: 5 }, { pkg: "web", i: 17 }, { pkg: "web", i: 48 }, { pkg: "web", i: 70 },
    ],
    tags: { cart: "6 callers, 1 ignores result", pos: "4 callers, 1 ignores result", web: "4 callers" },
  },
  { tone: "#ff6b6b", files: [{ pkg: "pricing", i: 7 }], tags: { pricing: "rules.ts:41 can throw" } },
  { tone: "#f5c542", files: [{ pkg: "pricing", i: 12 }], tags: { pricing: "types.ts: new 'bogo' case" } },
  { tone: "#5cc8ff", files: [{ pkg: "tests", i: 21 }], tags: { tests: "total.test.ts: percent only" } },
];

const X0 = 650;
const COL_W = 236;
const COL_GAP = 30;
const PITCH = 15;
const SQ = 11;
const LABEL = 26;
const GAP = 30;
const PER_ROW = Math.floor((COL_W + PITCH - SQ) / PITCH);

type Cell = { x: number; y: number; heat: number; d: number };
type Block = { name: PkgName; real: number; x: number; y: number; cells: Cell[] };

function layout(h: number): Block[] {
  const rnd = seeded(42);
  const cols: Block[][] = [[], []];
  const heights = [0, 0];
  for (const p of PKGS) {
    const rows = Math.ceil(p.files / PER_ROW);
    cols[p.col].push({ name: p.name, real: p.real, x: X0 + p.col * (COL_W + COL_GAP), y: heights[p.col], cells: [] });
    heights[p.col] += LABEL + rows * PITCH + GAP;
  }
  const out: Block[] = [];
  cols.forEach((col, c) => {
    const top = Math.round((h - (heights[c] - GAP)) / 2);
    for (const b of col) {
      const p = PKGS.find((q) => q.name === b.name)!;
      b.y += top;
      for (let i = 0; i < p.files; i++) {
        const x = b.x + (i % PER_ROW) * PITCH;
        const y = b.y + LABEL + Math.floor(i / PER_ROW) * PITCH;
        // most files are cold; a few are touched every week
        const r = rnd();
        const heat = r < 0.55 ? r * 0.35 : r < 0.88 ? 0.25 + (r - 0.55) * 1.3 : 0.7 + (r - 0.88) * 2.5;
        b.cells.push({ x, y, heat: Math.round(Math.min(1, heat) * 100) / 100, d: 0 });
      }
      out.push(b);
    }
  });
  // the read sweep spreads out from the open file
  const o = out.find((b) => b.name === OPEN.pkg)!.cells[OPEN.i];
  for (const b of out) for (const c of b.cells) c.d = Math.round(Math.hypot(c.x - o.x, c.y - o.y)) / 1000;
  return out;
}

const cellOf = (blocks: Block[], t: { pkg: PkgName; i: number }) => {
  const b = blocks.find((q) => q.name === t.pkg)!;
  return b.cells[t.i % b.cells.length];
};

export function RepoMap({ active, w, h, origin }: { active: number; w: number; h: number; origin: (note: number) => [number, number] }) {
  const blocks = useMemo(() => layout(h), [h]);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLit(true), 350);
    return () => clearTimeout(t);
  }, []);
  const open = cellOf(blocks, OPEN);
  const note = active >= 0 ? TARGETS[active] : null;
  const [ox, oy] = active >= 0 ? origin(active) : [0, 0];

  return (
    <svg className="absolute inset-0 overflow-visible" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ fontFamily: FONT_MONO }}>
      {blocks.map((b) => {
        const tag = note?.tags[b.name];
        return (
          <g key={b.name}>
            <text x={b.x} y={b.y + 13} fontSize={12} fill={IRON.text} fontWeight={600}>{b.name}/</text>
            {/* the file count, or what the lens found here */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.text
                key={tag ? `${active}-${b.name}` : "count"}
                x={b.x + (b.name.length + 2) * 7.3}
                y={b.y + 13}
                fontSize={tag ? 11.5 : 12}
                fill={tag ? note!.tone : IRON.muted}
                fontWeight={tag ? 600 : 400}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {tag ?? `${b.real.toLocaleString("en-US")} files`}
              </motion.text>
            </AnimatePresence>
            {b.cells.map((c, i) => (
              <rect
                key={i}
                x={c.x}
                y={c.y}
                width={SQ}
                height={SQ}
                rx={2}
                fill={lit ? heatColor(c.heat) : "#1d1f23"}
                style={{ transition: `fill .45s ease ${(c.d * 1.6).toFixed(3)}s` }}
              />
            ))}
          </g>
        );
      })}

      {/* the open file */}
      <rect x={open.x - 3} y={open.y - 3} width={SQ + 6} height={SQ + 6} rx={4} fill="none" stroke={IRON.text} strokeWidth={1.5} />

      <AnimatePresence>
        {note ? (
          <motion.g key={active} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
            {note.files.map((t, k) => {
              const c = cellOf(blocks, t);
              const tx = c.x + SQ / 2;
              const ty = c.y + SQ / 2;
              const d = `M ${ox} ${oy} C ${ox + 150} ${oy}, ${tx - 110} ${ty}, ${tx} ${ty}`;
              return (
                <g key={k}>
                  <motion.path d={d} fill="none" stroke={note.tone} strokeWidth={1.25} strokeOpacity={0.7} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: k * 0.035, ease: [0.22, 1, 0.36, 1] }} />
                  <motion.rect
                    x={c.x - 2}
                    y={c.y - 2}
                    width={SQ + 4}
                    height={SQ + 4}
                    rx={3}
                    fill={HEAT[HEAT.length - 1]}
                    stroke={t.flag ? "#ff4d4d" : note.tone}
                    strokeWidth={t.flag ? 2.5 : 1.5}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 18, delay: 0.4 + k * 0.035 }}
                    style={{ transformOrigin: `${tx}px ${ty}px` }}
                  />
                </g>
              );
            })}
            <circle cx={ox} cy={oy} r={4} fill={note.tone} />
          </motion.g>
        ) : null}
      </AnimatePresence>
    </svg>
  );
}

/** The legend under the map: what the colours mean. */
export function HeatLegend() {
  return (
    <span className="flex items-center gap-2 text-[12px]" style={{ color: IRON.muted, fontFamily: FONT_MONO }}>
      changed least
      <span className="flex gap-[3px]" aria-hidden="true">
        {HEAT.map((c) => <span key={c} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />)}
      </span>
      most, last 90 days
    </span>
  );
}
