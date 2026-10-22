"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface FolderPeekProps {
  title?: string;
  meta?: string;
  color?: string;
  /** Opens and closes by itself until the user hovers it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const Doc = () => (
  <div className="flex h-full flex-col gap-1.5 p-3">
    <span className="h-2 w-12 rounded-full bg-[#1d1d1f]" />
    {[90, 75, 85, 60, 80].map((w, i) => (
      <span key={i} className="h-1.5 rounded-full bg-[#e8e8ed]" style={{ width: `${w}%` }} />
    ))}
  </div>
);
const Photo = () => <div className="h-full w-full bg-[radial-gradient(80%_70%_at_30%_30%,#ffd1a8,rgba(255,209,168,0)_60%),linear-gradient(160deg,#89b4f8,#c3a6ff)]" />;
const Chart = () => (
  <div className="flex h-full items-end gap-1.5 p-3">
    {[40, 65, 50, 85, 70].map((h, i) => (
      <span key={i} className="flex-1 rounded-t-[3px] bg-[#34c759]" style={{ height: `${h}%`, opacity: 0.45 + i * 0.12 }} />
    ))}
  </div>
);

const FILES: { node: ReactNode; open: { x: number; y: number; rotate: number }; rest: { x: number; y: number; rotate: number } }[] = [
  { node: <Doc />, rest: { x: -14, y: 18, rotate: -4 }, open: { x: -74, y: -70, rotate: -14 } },
  { node: <Photo />, rest: { x: 0, y: 12, rotate: 0 }, open: { x: 0, y: -92, rotate: 2 } },
  { node: <Chart />, rest: { x: 14, y: 18, rotate: 4 }, open: { x: 74, y: -66, rotate: 15 } },
];

export function FolderPeek({ title = "Brand assets", meta = "24 files · Updated today", color = "#0071e3", autoplay = false, enableSound = true }: FolderPeekProps) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const hovering = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    playRef.current = play;
    openRef.current = open;
  }, [play, open]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current || hovering.current) return;
      playRef.current.auto(openRef.current ? "hush" : "whoosh", openRef.current ? 0.6 : 1);
      setOpen((o) => !o);
    }, 1800);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div className="flex flex-col items-center gap-5 pt-16">
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={`${title}, ${meta}`}
        onPointerEnter={() => { hovering.current = true; touched.current = true; setOpen(true); }}
        onPointerLeave={() => { hovering.current = false; setOpen(false); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => { touched.current = true; play(open ? "hush" : "whoosh", open ? 0.6 : 1); setOpen((o) => !o); }}
        whileTap={{ scale: 0.97 }}
        className="relative h-[150px] w-[210px] rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]"
        style={{ perspective: 800 }}
      >
        {/* back panel with tab */}
        <span className="absolute inset-0 rounded-[18px] rounded-tl-none" style={{ background: color, filter: "brightness(.82)" }} />
        <span className="absolute -top-3 left-0 h-6 w-20 rounded-t-[12px]" style={{ background: color, filter: "brightness(.82)" }} />

        {FILES.map((f, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-3 -ml-[56px] h-[120px] w-[112px] overflow-hidden rounded-[10px] bg-white shadow-[0_6px_18px_-8px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.05)]"
            initial={false}
            animate={open ? f.open : f.rest}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: open ? i * 0.04 : (2 - i) * 0.03 }}
          >
            {f.node}
          </motion.span>
        ))}

        {/* front panel */}
        <motion.span
          className="absolute inset-x-0 bottom-0 flex h-[118px] flex-col justify-end rounded-[18px] p-4 text-left"
          style={{ background: color, transformOrigin: "50% 100%", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }}
          initial={false}
          animate={{ rotateX: open ? -28 : 0, y: open ? 2 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">{title}</span>
          <span className="text-[12px] text-white/90">{meta}</span>
        </motion.span>
      </motion.button>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Hover or focus to peek inside.</span>
    </div>
  );
}
