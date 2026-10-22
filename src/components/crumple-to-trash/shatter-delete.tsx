"use client";
import { useEffect, useEffectEvent, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const CW = 300;
const CH = 112;

type Shard = { pts: [number, number][]; cx: number; cy: number };

/** Split the card into jittered triangles (6×3 grid, two triangles per cell). Deterministic per seed. */
function triangulate(seed: number): Shard[] {
  let s = seed;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const cols = 6;
  const rows = 3;
  const grid: [number, number][][] = [];
  for (let j = 0; j <= rows; j++) {
    const row: [number, number][] = [];
    for (let i = 0; i <= cols; i++) {
      const edgeX = i === 0 || i === cols;
      const edgeY = j === 0 || j === rows;
      row.push([(i / cols) * 100 + (edgeX ? 0 : (r() - 0.5) * 12), (j / rows) * 100 + (edgeY ? 0 : (r() - 0.5) * 22)]);
    }
    grid.push(row);
  }
  const out: Shard[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = grid[j][i];
      const b = grid[j][i + 1];
      const c = grid[j + 1][i + 1];
      const d = grid[j + 1][i];
      const tris: [number, number][][] = (i + j) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      for (const t of tris) out.push({ pts: t, cx: (t[0][0] + t[1][0] + t[2][0]) / 3, cy: (t[0][1] + t[1][1] + t[2][1]) / 3 });
    }
  return out;
}

function Card({ fileName, meta, badge, badgeColor }: { fileName: string; meta: string; badge: string; badgeColor: string }) {
  return (
    <div className="flex h-full w-full items-center gap-4 rounded-[20px] bg-white px-5 shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
      <span
        className="flex h-14 w-12 flex-none flex-col items-center justify-end rounded-[8px] pb-1.5 text-[10px] font-bold text-white"
        style={{ background: badgeColor }}
        aria-hidden="true"
      >
        {badge}
      </span>
      {/* Right padding leaves room for the Delete button that sits over the card. */}
      <span className="flex min-w-0 flex-1 flex-col pr-[76px]">
        <span className="truncate text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{fileName}</span>
        <span className="truncate text-[12px] text-[#86868b] dark:text-[#98989d]">{meta}</span>
      </span>
    </div>
  );
}

export interface ShatterDeleteProps {
  /** File name on the card. */
  fileName?: string;
  /** Secondary line under the name. */
  meta?: string;
  /** Text on the file-type badge. */
  badge?: string;
  /** Colour of the file-type badge. */
  badgeColor?: string;
  /** Called when the user presses Delete. The card shatters; the component only plays the effect. */
  onDelete?: () => void;
  /** Called when the user presses Undo and the shards fly back together. */
  onUndo?: () => void;
  /** Shatters and mends the card every 2.3s until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

type Phase = "whole" | "broken" | "mending";

/**
 * Delete that you feel. The card cracks from the point you clicked, the
 * shards drift apart for a beat and then fall with gravity and spin. Undo
 * pulls every shard back up into place and the seams close.
 */
export function ShatterDelete({
  fileName = "Q3-board-report.pdf",
  meta = "2.4 MB · edited 2 days ago",
  badge = "PDF",
  badgeColor = "#ff3b30",
  onDelete,
  onUndo,
  autoplay = false,
  enableSound = true,
}: ShatterDeleteProps) {
  const play = useSound(enableSound);
  const [state, setState] = useState<Phase>("whole");
  const [hit, setHit] = useState({ x: 70, y: 50 });
  const [seed, setSeed] = useState(7);
  const shards = useMemo(() => triangulate(seed), [seed]);
  const touched = useRef(false);
  const stateRef = useRef<Phase>(state);
  const mendTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cardBox = useRef<HTMLDivElement>(null);
  /** Which control should take focus when it mounts (after a keyboard or pointer action by the user). */
  const focusNext = useRef<"undo" | "delete" | null>(null);
  const card = { fileName, meta, badge, badgeColor };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => () => clearTimeout(mendTimer.current), []);

  const smash = (x = 82, y = 50) => {
    setHit({ x, y });
    setSeed((s) => s + 13);
    setState("broken");
  };

  const mend = () => {
    setState("mending");
    clearTimeout(mendTimer.current);
    mendTimer.current = setTimeout(() => setState("whole"), 900);
  };

  const autoSound = useEffectEvent((name: "knock" | "swipe", volume?: number) => play.auto(name, volume));

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const s = stateRef.current;
      if (s === "whole") {
        autoSound("knock");
        setHit({ x: 60 + Math.random() * 30, y: 30 + Math.random() * 40 });
        setSeed((n) => n + 13);
        setState("broken");
      } else if (s === "broken") {
        autoSound("swipe", 0.8);
        setState("mending");
        clearTimeout(mendTimer.current);
        mendTimer.current = setTimeout(() => setState("whole"), 900);
      }
    }, 2300);
    return () => clearInterval(t);
  }, [autoplay]);

  const del = (e: ReactMouseEvent<HTMLButtonElement>) => {
    touched.current = true;
    focusNext.current = "undo";
    play("knock");
    const box = cardBox.current?.getBoundingClientRect();
    // Keyboard activation has no pointer position (detail 0): crack from the button.
    if (!box || e.detail === 0) smash(85, 50);
    else smash(((e.clientX - box.left) / box.width) * 100, ((e.clientY - box.top) / box.height) * 100);
    onDelete?.();
  };

  const undo = () => {
    touched.current = true;
    focusNext.current = "delete";
    play("swipe", 0.8);
    mend();
    onUndo?.();
  };

  return (
    <div
      className="flex h-[300px] w-[320px] max-w-full flex-col items-center justify-center gap-6"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div ref={cardBox} className="relative" style={{ width: CW, height: CH, maxWidth: "100%" }}>
        {state === "whole" ? (
          <div className="absolute inset-0">
            <Card {...card} />
            <motion.button
              ref={(el) => {
                if (el && focusNext.current === "delete") {
                  focusNext.current = null;
                  el.focus();
                }
              }}
              type="button"
              onClick={del}
              whileTap={{ scale: 0.9 }}
              style={{ y: "-50%" }}
              aria-label={`Delete ${fileName}`}
              className="absolute right-4 top-1/2 rounded-full bg-[#fff1f0] px-3.5 py-2 text-[13px] font-semibold text-[#d70015] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#3a1a1a] dark:text-[#ff6961] dark:focus-visible:ring-[#0a84ff]"
            >
              Delete
            </motion.button>
          </div>
        ) : (
          shards.map((sh, i) => {
            const dx = sh.cx - hit.x;
            const dy = sh.cy - hit.y;
            const dist = Math.hypot(dx, dy) || 1;
            const delay = dist / 260;
            const fall = state === "broken";
            const clip = `polygon(${sh.pts.map(([x, y]) => `${x}% ${y}%`).join(",")})`;
            return (
              <motion.div
                key={`${seed}-${i}`}
                className="absolute inset-0"
                style={{ clipPath: clip, WebkitClipPath: clip, transformOrigin: `${sh.cx}% ${sh.cy}%` }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={
                  fall
                    ? {
                        x: [0, (dx / dist) * 6, (dx / dist) * 40 + ((i % 3) - 1) * 20],
                        y: [0, (dy / dist) * 6, 360 + (i % 5) * 30],
                        rotate: [0, 0, (i % 2 ? 1 : -1) * (40 + (i % 7) * 15)],
                        opacity: [1, 1, 0],
                      }
                    : { x: 0, y: 0, rotate: 0, opacity: 1 }
                }
                transition={
                  fall
                    ? { duration: 1.15, delay, times: [0, 0.14, 1], ease: [0.45, 0, 0.8, 0.6] }
                    : { type: "spring", stiffness: 260, damping: 24, delay: (1 - dist / 120) * 0.25 }
                }
                aria-hidden="true"
              >
                <Card {...card} />
              </motion.div>
            );
          })
        )}
        {state === "broken" && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {shards.slice(0, 14).map((sh, i) => (
              <motion.line
                key={i}
                x1={hit.x}
                y1={hit.y}
                x2={sh.cx}
                y2={sh.cy}
                className="stroke-[#1d1d1f] dark:stroke-white"
                strokeOpacity=".25"
                strokeWidth=".5"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            ))}
          </svg>
        )}
      </div>
      <AnimatePresence>
        {state === "broken" && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.35 } }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-4 rounded-full bg-[#1d1d1f] py-2 pl-4 pr-2 text-[13px] text-white dark:bg-[#3a3a3c]"
          >
            File deleted
            <button
              ref={(el) => {
                if (el && focusNext.current === "undo") {
                  focusNext.current = null;
                  el.focus();
                }
              }}
              type="button"
              onClick={undo}
              className="rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <span role="status" className="sr-only">
        {state === "broken" ? `${fileName} deleted` : ""}
      </span>
    </div>
  );
}
