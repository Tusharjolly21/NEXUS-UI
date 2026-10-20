"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export interface ComponentLayersProps {
  /** Colour used in the cover art and for the hovered layer's outline and leader line. */
  accent?: string;
  /** Explodes and assembles on a loop until the user interacts. */
  autoplay?: boolean;
}

const W = 260;
const H = 168;

/** The finished component, used as the top layer. */
function Player({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex items-center gap-3">
        <span className="h-14 w-14 rounded-xl" style={{ background: `linear-gradient(140deg, #ff9f0a, #ff375f 55%, ${accent})` }} />
        <span className="flex flex-col">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">Night Drive</span>
          <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Coastal Lines</span>
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="h-1 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]"><span className="block h-full w-[42%] rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" /></span>
        <div className="flex items-center justify-between">
          <span className="text-[10px] tabular-nums text-[#86868b] dark:text-[#98989d]">1:24</span>
          <span className="flex items-center gap-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5v14M18 5L9 12l9 7V5z" stroke="currentColor" strokeWidth="1.5" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 5v14M6 5l9 7-9 7V5z" stroke="currentColor" strokeWidth="1.5" /></svg>
          </span>
          <span className="text-[10px] tabular-nums text-[#86868b] dark:text-[#98989d]">-2:51</span>
        </div>
      </div>
    </div>
  );
}

/** Layout boxes: what the component is made of, without content. */
function Blocks() {
  const box = "rounded-md border border-dashed border-[#0071e3]/60 bg-[#0071e3]/[.06] dark:border-[#0a84ff]/70 dark:bg-[#0a84ff]/[.12]";
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex items-center gap-3">
        <span className={`h-14 w-14 ${box}`} />
        <span className="flex flex-1 flex-col gap-1.5">
          <span className={`h-4 w-28 ${box}`} />
          <span className={`h-3 w-20 ${box}`} />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={`h-2 ${box}`} />
        <div className="flex items-center justify-between">
          <span className={`h-3 w-7 ${box}`} />
          <span className={`h-5 w-24 ${box}`} />
          <span className={`h-3 w-7 ${box}`} />
        </div>
      </div>
    </div>
  );
}

/** Spacing: padding and gaps as tinted bands. */
function Spacing() {
  const pad = "bg-[repeating-linear-gradient(45deg,rgba(255,55,95,.22)_0_2px,transparent_2px_6px)]";
  return (
    <div className="relative h-full">
      <span className={`absolute inset-x-0 top-0 h-4 ${pad}`} />
      <span className={`absolute inset-x-0 bottom-0 h-4 ${pad}`} />
      <span className={`absolute inset-y-4 left-0 w-4 ${pad}`} />
      <span className={`absolute inset-y-4 right-0 w-4 ${pad}`} />
      <span className={`absolute left-[72px] top-4 h-14 w-3 ${pad}`} />
      <span className="absolute left-[18px] top-[4px] text-[8px] font-semibold text-[#ff375f]">16</span>
      <span className="absolute left-[70px] top-[78px] text-[8px] font-semibold text-[#ff375f]">12</span>
    </div>
  );
}

/** Surface: the card itself, with radius and shadow. */
function Surface() {
  return <div className="h-full rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_40px_-20px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_40px_-20px_rgba(0,0,0,.8)]" />;
}

/** One sheet in the exploded view. */
export interface ComponentLayer {
  name: string;
  note: string;
  render: (accent: string) => ReactNode;
  /** The base card: always visible and never outlined. */
  card?: boolean;
}

export const COMPONENT_LAYERS: ComponentLayer[] = [
  { name: "Surface", note: "radius 20 · shadow", render: () => <Surface />, card: true },
  { name: "Spacing", note: "padding 16 · gap 12", render: () => <Spacing /> },
  { name: "Layout", note: "auto layout · 3 rows", render: () => <Blocks /> },
  { name: "Content", note: "type · art · controls", render: (a) => <Player accent={a} /> },
];

const GAP = 62;

/**
 * A finished card tips into an isometric view and peels apart into the layers
 * it is made of, each with a leader-line label. Assemble stacks it back.
 */
export function ComponentLayers({ accent = "#0071e3", autoplay = false }: ComponentLayersProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const touched = useRef(false);
  const group = useId().replace(/:/g, "");

  useEffect(() => {
    if (!autoplay) return;
    const a = setTimeout(() => !touched.current && setOpen(true), 900);
    const t = setInterval(() => !touched.current && setOpen((o) => !o), 3400);
    return () => { clearTimeout(a); clearInterval(t); };
  }, [autoplay]);

  return (
    <div className="flex flex-col items-center gap-6 [--cl-line:#aeaeb2] [--cl-ring:rgba(0,0,0,.12)] [--cl-sheet:rgba(255,255,255,0.55)] dark:[--cl-line:#636366] dark:[--cl-ring:rgba(255,255,255,.18)] dark:[--cl-sheet:rgba(44,44,46,0.55)]">
      <div className="relative flex h-[330px] w-[440px] max-w-full items-center justify-center" style={{ perspective: 1400 }}>
        <motion.div
          className="relative"
          style={{ width: W, height: H, transformStyle: "preserve-3d" }}
          initial={false}
          animate={open ? { rotateX: 58, rotateZ: -38, y: 34 } : { rotateX: 0, rotateZ: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          {COMPONENT_LAYERS.map((l, i) => {
            const outlined = open && !l.card;
            return (
              <motion.div
                key={l.name}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                initial={false}
                animate={{ z: open ? i * GAP : 0, opacity: open || l.card || l.name === "Content" ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 18, delay: open ? 0.15 + i * 0.07 : (COMPONENT_LAYERS.length - i) * 0.04 }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                <div
                  className="h-full w-full rounded-[20px] transition-[background-color,box-shadow] duration-300 ease-out"
                  style={{
                    backgroundColor: outlined ? "var(--cl-sheet)" : "rgba(255,255,255,0)",
                    boxShadow: outlined ? `0 0 0 1px ${hover === i ? accent : "var(--cl-ring)"}` : "0 0 0 0px rgba(0,0,0,0)",
                  }}
                >
                  {l.render(accent)}
                </div>
                {/* leader line + label, counter-rotated to stay readable */}
                <motion.div
                  className="pointer-events-none absolute left-full top-0 flex items-center"
                  initial={false}
                  animate={{ opacity: open ? 1 : 0, x: open ? 0 : -10 }}
                  transition={{ delay: open ? 0.45 + i * 0.07 : 0 }}
                >
                  <span className="h-px w-10" style={{ background: hover === i ? accent : "var(--cl-line)" }} />
                  <span className="ml-1.5 flex flex-col whitespace-nowrap rounded-lg bg-white px-2 py-1 shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                    <span className="text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{l.name}</span>
                    <span className="text-[9px] text-[#86868b] dark:text-[#98989d]">{l.note}</span>
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <div role="group" aria-label="View" className="relative grid grid-cols-2 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {["Assemble", "Explode"].map((label, i) => (
          <button key={label} type="button" aria-pressed={open === (i === 1)} onClick={() => { touched.current = true; setOpen(i === 1); }} className="relative z-10 h-8 rounded-[9px] px-5 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7] dark:focus-visible:outline-[#0a84ff]">
            {open === (i === 1) && <motion.span layoutId={`${group}-layers-seg`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]" />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
