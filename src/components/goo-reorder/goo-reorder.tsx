"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Reorder } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface GooReorderItem {
  id: string;
  label: string;
  /** Colour of the numbered badge. */
  color: string;
}

export const DEFAULT_GOO_ITEMS: GooReorderItem[] = [
  { id: "a", label: "Draft the brief", color: "#ff9f0a" },
  { id: "b", label: "Review with design", color: "#5ac8fa" },
  { id: "c", label: "Ship to beta", color: "#30d158" },
  { id: "d", label: "Write the changelog", color: "#bf5af2" },
  { id: "e", label: "Announce it", color: "#ff375f" },
];

export interface GooReorderProps {
  /** Starting order of the rows. */
  items?: GooReorderItem[];
  /** Called with the new order after the user drags or moves a row. */
  onReorder?: (items: GooReorderItem[]) => void;
  /** Swaps two random rows every 1.6s until someone touches the list. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/**
 * A reorderable list made of liquid. Drag a row and it stays joined to its
 * neighbours by a neck of ink that stretches as it leaves and pinches off as
 * it lands. The goo comes from one SVG filter; the text is composited back on
 * top so it stays sharp.
 */
export function GooReorder({ items: initial = DEFAULT_GOO_ITEMS, onReorder, autoplay = false, enableSound = true }: GooReorderProps) {
  const play = useSound(enableSound);
  const [items, setItems] = useState(initial);
  const id = useId().replace(/:/g, "");
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      // Draw the random picks outside the state updater so it stays pure.
      const ra = Math.random();
      const rb = Math.random();
      setItems((l) => {
        if (l.length < 2) return l;
        const a = Math.floor(ra * l.length);
        let b = Math.floor(rb * l.length);
        if (b === a) b = (a + 2) % l.length;
        const n = [...l];
        [n[a], n[b]] = [n[b], n[a]];
        return n;
      });
    }, 1600);
    return () => clearInterval(t);
  }, [autoplay]);

  const commit = (next: GooReorderItem[]) => {
    setItems(next);
    onReorder?.(next);
  };

  const move = (e: KeyboardEvent, i: number) => {
    const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : null;
    if (to === null) return;
    e.preventDefault();
    touched.current = true;
    if (to < 0 || to >= items.length) return;
    play("drop", 0.6);
    const n = [...items];
    const [it] = n.splice(i, 1);
    n.splice(to, 0, it);
    commit(n);
  };

  return (
    <div
      className="flex flex-col items-center gap-3"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={`goo-${id}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={(next) => {
          // Fires once per row the dragged item passes, so each swap gets one soft tick.
          play("tick", 0.4);
          commit(next);
        }}
        aria-label="Reorderable list"
        className="m-0 flex w-[280px] list-none flex-col gap-[10px] p-0"
        style={{ filter: `url(#goo-${id})` }}
      >
        {items.map((it, i) => (
          <Reorder.Item
            key={it.id}
            value={it}
            tabIndex={0}
            aria-label={`${it.label}, position ${i + 1} of ${items.length}. Use the up and down arrow keys to move.`}
            onKeyDown={(e: KeyboardEvent) => move(e, i)}
            onDragStart={() => play("lift", 0.7)}
            onDragEnd={() => play("drop", 0.7)}
            whileDrag={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="flex h-[48px] cursor-grab select-none items-center gap-3 rounded-[24px] bg-[#1d1d1f] px-4 text-[14px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0a84ff] active:cursor-grabbing dark:bg-[#3a3a3c]"
          >
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold text-[#1d1d1f]" style={{ background: it.color }}>
              {i + 1}
            </span>
            <span className="flex-1 truncate">{it.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-50" aria-hidden="true">
              {[6, 12, 18].map((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
            </svg>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Drag a row up or down.</span>
    </div>
  );
}
