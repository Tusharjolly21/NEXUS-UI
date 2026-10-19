"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type LayoutSwitchLayout = "grid" | "row" | "feature" | "pile";
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  z: number;
}

const PHOTOS = [
  { id: "a", title: "Salt flats", art: "radial-gradient(80% 60% at 30% 25%, #fff3d6, rgba(255,243,214,0) 60%), linear-gradient(180deg,#9ec9ff,#e8f1ff 55%,#f5e9dd)" },
  { id: "b", title: "Red canyon", art: "radial-gradient(70% 60% at 70% 20%, #ffd2a6, rgba(255,210,166,0) 60%), linear-gradient(160deg,#ff9f6b,#c4553d 60%,#5b2a2a)" },
  { id: "c", title: "Pine ridge", art: "radial-gradient(60% 50% at 50% 15%, #e7fff1, rgba(231,255,241,0) 60%), linear-gradient(180deg,#bfe3d0,#3f8f6b 60%,#173d2e)" },
  { id: "d", title: "Night pier", art: "radial-gradient(40% 30% at 70% 30%, #fff6c7, rgba(255,246,199,0) 60%), linear-gradient(180deg,#1b2140,#3a3f78 60%,#0c0f22)" },
  { id: "e", title: "Lavender", art: "radial-gradient(70% 60% at 30% 30%, #fff, rgba(255,255,255,0) 55%), linear-gradient(170deg,#e4d4ff,#a98bf0 55%,#5e4bb3)" },
  { id: "f", title: "Low tide", art: "radial-gradient(70% 50% at 60% 20%, #fffbe8, rgba(255,251,232,0) 60%), linear-gradient(180deg,#a7e3f2,#5fb6c9 55%,#d9c7a8)" },
];

const LAYOUTS: LayoutSwitchLayout[] = ["grid", "row", "feature", "pile"];
const W = 640;
const H = 320;
const G = 10;

function rects(layout: LayoutSwitchLayout, n: number): Rect[] {
  return Array.from({ length: n }, (_, i) => {
    switch (layout) {
      case "grid": {
        const w = (W - G * 2) / 3,
          h = (H - G) / 2;
        return { x: (i % 3) * (w + G), y: Math.floor(i / 3) * (h + G), w, h, r: 0, z: 1 };
      }
      case "row": {
        const w = (W - G * (n - 1)) / n,
          h = 170;
        return { x: i * (w + G), y: (H - h) / 2, w, h, r: 0, z: 1 };
      }
      case "feature": {
        if (i === 0) return { x: 0, y: 0, w: 420, h: H, r: 0, z: 1 };
        const h = (H - G * (n - 2)) / (n - 1);
        return { x: 430, y: (i - 1) * (h + G), w: W - 430, h, r: 0, z: 1 };
      }
      case "pile": {
        const rot = [-9, 6, -4, 10, -2, 3][i % 6];
        return { x: W / 2 - 120 + (i - n / 2) * 14, y: H / 2 - 85 + Math.abs(i - n / 2) * 4, w: 240, h: 170, r: rot, z: i + 1 };
      }
    }
  });
}

export interface LayoutSwitchProps {
  /** Changes layouts by itself until the user interacts. */
  autoplay?: boolean;
}

/**
 * The same photos glide between four arrangements. Nothing fades or cuts: each
 * one springs from its old box to its new one, and clicking a photo grows it to
 * fill the frame.
 */
export function LayoutSwitch({ autoplay = false }: LayoutSwitchProps) {
  const [layout, setLayout] = useState<LayoutSwitchLayout>("grid");
  const [open, setOpen] = useState<string | null>(null);
  const touched = useRef(false);
  const seg = useId();
  const boxes = rects(layout, PHOTOS.length);

  useEffect(() => {
    if (!autoplay) return;
    const order: LayoutSwitchLayout[] = ["feature", "pile", "row", "grid"];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setLayout(order[k++ % order.length]);
    }, 2300);
    return () => clearInterval(t);
  }, [autoplay]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="flex w-full flex-col items-center gap-5"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div role="group" aria-label="Layout" className="relative grid grid-cols-4 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {LAYOUTS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={layout === l}
            onClick={() => {
              touched.current = true;
              setOpen(null);
              setLayout(l);
            }}
            className="relative z-10 h-8 rounded-[9px] px-5 text-[13px] font-medium capitalize text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7]"
          >
            {layout === l && <motion.span layoutId={`${seg}-ls-seg`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]" />}
            {l}
          </button>
        ))}
      </div>
      <div className="relative w-full max-w-[640px] overflow-hidden" style={{ height: H, aspectRatio: `${W} / ${H}` }}>
        <div className="absolute left-1/2 top-0 origin-top" style={{ width: W, height: H, marginLeft: -W / 2 }}>
          {PHOTOS.map((p, i) => {
            const isOpen = open === p.id;
            const b = isOpen ? { x: 0, y: 0, w: W, h: H, r: 0, z: 50 } : boxes[i];
            return (
              <motion.button
                key={p.id}
                type="button"
                aria-label={isOpen ? `Close ${p.title}` : `Open ${p.title}`}
                onClick={() => {
                  touched.current = true;
                  setOpen(isOpen ? null : p.id);
                }}
                className="absolute left-0 top-0 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
                initial={false}
                animate={{ x: b.x, y: b.y, width: b.w, height: b.h, rotate: b.r, zIndex: b.z, opacity: open && !isOpen ? 0.25 : 1, borderRadius: isOpen ? 24 : 16 }}
                transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9, delay: open ? 0 : i * 0.025, zIndex: { duration: 0 } }}
                style={{ background: p.art, boxShadow: layout === "pile" || isOpen ? "0 18px 40px -16px rgba(0,0,0,.45)" : "0 0 0 1px rgba(0,0,0,.04)" }}
                whileHover={{ scale: open ? 1 : 1.02 }}
              >
                <AnimatePresence>
                  {(isOpen || (layout !== "row" && !open)) && (
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-3 left-3.5 text-[14px] font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,.35)]"
                    >
                      {p.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Switch layouts, or click a photo to open it.</span>
    </div>
  );
}
