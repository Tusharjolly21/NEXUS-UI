"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

export interface DockApp {
  id: string;
  label: string;
  bg: string;
  glyph: ReactNode;
}

const G = (d: string, fill = false) => (
  <svg width="56%" height="56%" viewBox="0 0 24 24" fill={fill ? "#fff" : "none"} stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const APPS: DockApp[] = [
  { id: "home", label: "Home", bg: "linear-gradient(180deg,#5ac8fa,#007aff)", glyph: G("M4 11l8-7 8 7v9H4z") },
  { id: "mail", label: "Mail", bg: "linear-gradient(180deg,#64d2ff,#0a84ff)", glyph: G("M4 6h16v12H4zM4 7l8 6 8-6") },
  { id: "notes", label: "Notes", bg: "linear-gradient(180deg,#ffe066,#ffcc00)", glyph: G("M7 8h10M7 12h10M7 16h6") },
  { id: "music", label: "Music", bg: "linear-gradient(180deg,#ff6482,#ff2d55)", glyph: G("M9 18V6l10-2v12M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0z") },
  { id: "photos", label: "Photos", bg: "conic-gradient(from 0deg,#ff9f0a,#ffd60a,#30d158,#64d2ff,#bf5af2,#ff375f,#ff9f0a)", glyph: G("M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0") },
  { id: "maps", label: "Maps", bg: "linear-gradient(180deg,#7ee08f,#34c759)", glyph: G("M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11zM12 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0") },
  { id: "settings", label: "Settings", bg: "linear-gradient(180deg,#aeaeb2,#636366)", glyph: G("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .3-1.2-1.2.3-2-3-1-1 2h-1.6l-1-2-3 1 .3 2L5.6 8.3l-2-.3-1 3 2 1v1.6l-2 1 1 3 2-.3 1.2 1.2-.3 2 3 1 1-2h1.6l1 2 3-1-.3-2 1.2-1.2 2 .3 1-3-2-1z") },
];

const BASE = 46;
const MAX = 76;
const RANGE = 150;

function Icon({ app, mouseX, running, onLaunch }: { app: DockApp; mouseX: MotionValue<number>; running: boolean; onLaunch: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const sizeRaw = useTransform(dist, [-RANGE, 0, RANGE], [BASE, MAX, BASE]);
  const size = useSpring(sizeRaw, { stiffness: 320, damping: 22, mass: 0.2 });
  const [hover, setHover] = useState(false);
  const [bounce, setBounce] = useState(0);

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95, transition: { duration: 0.1 } }}
            className="pointer-events-none absolute -top-10 whitespace-nowrap rounded-lg bg-white/90 px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_16px_-6px_rgba(0,0,0,.3)] backdrop-blur-md"
          >
            {app.label}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        ref={ref}
        type="button"
        aria-label={app.label}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => {
          setBounce((b) => b + 1);
          onLaunch();
        }}
        style={{ width: size, height: size, background: app.bg }}
        className="flex items-center justify-center rounded-[22%] shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_6px_14px_-6px_rgba(0,0,0,.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        <motion.span key={bounce} className="flex h-full w-full items-center justify-center" animate={bounce ? { y: [0, -22, 0, -10, 0] } : undefined} transition={{ duration: 0.9, ease: "easeOut" }}>
          {app.glyph}
        </motion.span>
      </motion.button>
      <motion.span className="mt-1 h-1 w-1 rounded-full bg-[#1d1d1f]" initial={false} animate={{ opacity: running ? 0.7 : 0, scale: running ? 1 : 0 }} />
    </div>
  );
}

export default function Dock({ apps = APPS, autoplay = false }: { apps?: DockApp[]; autoplay?: boolean }) {
  const mouseX = useMotionValue(Infinity);
  const [running, setRunning] = useState<string[]>(["home"]);
  const bar = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    let ctl: { stop: () => void } | null = null;
    const sweep = () => {
      if (hovering.current || !bar.current) return;
      const r = bar.current.getBoundingClientRect();
      ctl = animate(mouseX, [r.left - 40, r.right + 40], { duration: 2.6, ease: "easeInOut", onComplete: () => !hovering.current && mouseX.set(Infinity) });
    };
    const a = setTimeout(sweep, 700);
    const b = setInterval(sweep, 4200);
    return () => { clearTimeout(a); clearInterval(b); ctl?.stop(); };
  }, [autoplay, mouseX]);

  return (
    <div className="flex h-[150px] items-end justify-center">
      <div
        ref={bar}
        onPointerMove={(e) => { hovering.current = true; mouseX.set(e.clientX); }}
        onPointerLeave={() => { hovering.current = false; mouseX.set(Infinity); }}
        className="flex h-[66px] items-end gap-2.5 rounded-[22px] bg-white/70 px-2.5 pb-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-20px_rgba(0,0,0,.35)] backdrop-blur-2xl"
        role="toolbar"
        aria-label="Dock"
      >
        {apps.map((app) => (
          <Icon key={app.id} app={app} mouseX={mouseX} running={running.includes(app.id)} onLaunch={() => setRunning((r) => (r.includes(app.id) ? r : [...r, app.id]))} />
        ))}
      </div>
    </div>
  );
}
