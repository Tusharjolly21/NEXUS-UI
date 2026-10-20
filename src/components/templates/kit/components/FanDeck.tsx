"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface Chip { name: string; hex: string }

const CHIPS: Chip[] = [
  { name: "Ember", hex: "#E5484D" },
  { name: "Coral", hex: "#F76B4B" },
  { name: "Marigold", hex: "#F5A524" },
  { name: "Butter", hex: "#F7CE46" },
  { name: "Pistachio", hex: "#A3D977" },
  { name: "Fern", hex: "#46A758" },
  { name: "Lagoon", hex: "#12A594" },
  { name: "Glacier", hex: "#3DB9CF" },
  { name: "Cobalt", hex: "#0071E3" },
  { name: "Iris", hex: "#5B5BD6" },
  { name: "Orchid", hex: "#9E4CC4" },
  { name: "Rosewood", hex: "#C2298A" },
];

const CW = 46;
const CH = 210;
const PIVOT = 22; // distance of the rivet from the bottom of each chip

/**
 * A paint-chip deck. Closed, it stands upright as one stack. Open it and the
 * deck tips onto its side, then the chips fan out one by one around the rivet
 * into a colour-graded half circle. Hover lifts a chip; click copies its hex.
 */
export default function FanDeck({ chips = CHIPS, autoplay = false }: { chips?: Chip[]; autoplay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [copied, setCopied] = useState<Chip | null>(null);
  const touched = useRef(false);
  const n = chips.length;

  useEffect(() => {
    if (!autoplay) return;
    const a = setTimeout(() => !touched.current && setOpen(true), 700);
    const t = setInterval(() => !touched.current && setOpen((o) => !o), 3600);
    return () => { clearTimeout(a); clearInterval(t); };
  }, [autoplay]);

  const copy = async (c: Chip) => {
    try { await navigator.clipboard.writeText(c.hex); } catch { /* clipboard may be blocked */ }
    setCopied(c);
    setTimeout(() => setCopied((x) => (x === c ? null : x)), 1400);
  };

  return (
    <div className="flex flex-col items-center gap-4" onPointerDown={() => (touched.current = true)}>
      <div className="relative h-[270px] w-[440px] max-w-full">
        {/* rivet point sits at the bottom centre of the stage */}
        <motion.div
          className="absolute"
          style={{ left: 220 - CW / 2, top: 250 - CH + PIVOT, width: CW, height: CH, originX: 0.5, originY: (CH - PIVOT) / CH }}
          initial={false}
          animate={{ rotate: open ? -90 : 0, y: open ? 0 : -6 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        >
          {chips.map((c, i) => {
            const angle = open ? (i / (n - 1)) * 180 : i * 0.6;
            const lifted = open && hover === i;
            return (
              <motion.button
                key={c.hex}
                type="button"
                aria-label={`${c.name} ${c.hex}. Copy`}
                tabIndex={open ? 0 : -1}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onClick={() => copy(c)}
                className="absolute inset-0 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{ originX: 0.5, originY: (CH - PIVOT) / CH, zIndex: i }}
                initial={false}
                animate={{ rotate: angle }}
                transition={{ type: "spring", stiffness: 170, damping: 19, delay: open ? 0.18 + i * 0.045 : (n - i) * 0.02 }}
              >
                <motion.span
                  className="absolute inset-0 flex flex-col overflow-hidden rounded-[10px] bg-white text-left shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_14px_-6px_rgba(0,0,0,.3)]"
                  animate={{ y: lifted ? -16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                >
                  <span className="h-[62%] w-full" style={{ background: c.hex }} />
                  <span className="flex flex-1 flex-col items-center justify-start gap-1 pt-2">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#1d1d1f] [writing-mode:vertical-rl]">{c.name}</span>
                  </span>
                  <span className="absolute bottom-[16px] left-1/2 -ml-[5px] h-2.5 w-2.5 rounded-full bg-[linear-gradient(180deg,#e5e5ea,#8e8e93)] shadow-[inset_0_1px_0_#fff]" />
                </motion.span>
              </motion.button>
            );
          })}
        </motion.div>
        <AnimatePresence>
          {copied && (
            <motion.span
              role="status"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-1/2 top-2 flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_20px_-10px_rgba(0,0,0,.3)]"
              style={{ x: "-50%" }}
            >
              <span className="h-5 w-5 rounded-full" style={{ background: copied.hex }} />
              {copied.hex} copied
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => { touched.current = true; setOpen((o) => !o); }}
        aria-expanded={open}
        className="h-9 rounded-full bg-[#1d1d1f] px-5 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        {open ? "Close deck" : "Fan out"}
      </motion.button>
    </div>
  );
}
