"use client";
// Aurora copy of the Motion Kit Folder Peek: the files inside are the repo's
// detected config files, and the caption is a prop.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export interface FolderPeekProps {
  title?: string;
  meta?: string;
  color?: string;
  /** Opens and closes by itself until the user hovers it. */
  autoplay?: boolean;
}

const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
const File = ({ name, lines }: { name: string; lines: [string, string][] }) => (
  <div className="flex h-full flex-col gap-1 p-2.5 text-left" style={{ fontFamily: MONO }}>
    <span className="mb-1 truncate text-[9px] font-semibold text-[#1d1d1f]">{name}</span>
    {lines.map(([t, c], i) => (
      <span key={i} className="truncate text-[7.5px] leading-[1.35]" style={{ color: c }}>{t}</span>
    ))}
  </div>
);
const Doc = () => <File name="package.json" lines={[["{", "#6e6e73"], ['"next": "16.0"', "#047857"], ['"react": "19.0"', "#047857"], ['"build": "next build"', "#1d1d1f"], ["}", "#6e6e73"]]} />;
const Photo = () => <File name="aurora.toml" lines={[["[build]", "#b45309"], ['framework = "nextjs"', "#1d1d1f"], ["[rollout]", "#b45309"], ["canary = 5", "#1d1d1f"], ['regions = "all"', "#1d1d1f"]]} />;
const Chart = () => <File name="app/page.tsx" lines={[["export default", "#7c3aed"], ["function Page() {", "#1d1d1f"], ["  return <Hero />", "#047857"], ["}", "#1d1d1f"]]} />;

const FILES: { node: ReactNode; open: { x: number; y: number; rotate: number }; rest: { x: number; y: number; rotate: number } }[] = [
  { node: <Doc />, rest: { x: -14, y: 18, rotate: -4 }, open: { x: -74, y: -70, rotate: -14 } },
  { node: <Photo />, rest: { x: 0, y: 12, rotate: 0 }, open: { x: 0, y: -92, rotate: 2 } },
  { node: <Chart />, rest: { x: 14, y: 18, rotate: 4 }, open: { x: 74, y: -66, rotate: 15 } },
];

export default function RepoPeek({ title = "acme-web", meta = "Next.js detected · 214 files", color = "#047857", autoplay = false, hint = "Hover or focus to peek inside." }: FolderPeekProps & { hint?: string }) {
  const [open, setOpen] = useState(false);
  const hovering = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current || hovering.current) return;
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
        onClick={() => { touched.current = true; setOpen((o) => !o); }}
        whileTap={{ scale: 0.97 }}
        className="relative h-[150px] w-[210px] rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 "
        style={{ perspective: 800, outlineColor: color }}
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
      <span className="text-[13px] text-[#6e6e73]">{hint}</span>
    </div>
  );
}
