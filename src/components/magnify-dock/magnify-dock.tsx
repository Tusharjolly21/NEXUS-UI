"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, transform as mapRange, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface DockApp {
  id: string;
  label: string;
  /** Tile background (any CSS background), shown when there is no `icon` or it fails to load. */
  bg: string;
  /** Glyph drawn on the tile, shown when there is no `icon` or it fails to load. */
  glyph: ReactNode;
  /** Image of the app icon (a square with its own rounded corners). It replaces the tile and glyph. */
  icon?: string;
}

const G = (d: string, fill = false) => (
  <svg width="56%" height="56%" viewBox="0 0 24 24" fill={fill ? "#fff" : "none"} stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

// Each app has its own icon file in /public/dock-icons; the gradient tile and glyph show if the file is missing.
const APPS: DockApp[] = [
  { id: "intelligence", label: "Apple Intelligence", icon: "/dock-icons/apple-intelligence.webp", bg: "linear-gradient(135deg,#ffb340,#ff375f 55%,#bf5af2)", glyph: G("M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z") },
  { id: "maps", label: "Maps", icon: "/dock-icons/maps.webp", bg: "linear-gradient(180deg,#7ee08f,#34c759)", glyph: G("M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11zM12 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0") },
  { id: "music", label: "Music", icon: "/dock-icons/music.webp", bg: "linear-gradient(180deg,#ff6482,#ff2d55)", glyph: G("M9 18V6l10-2v12M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0z") },
  { id: "tv", label: "TV", icon: "/dock-icons/tv.webp", bg: "linear-gradient(180deg,#3a3a3c,#000)", glyph: G("M4 7h16v10H4zM9 20h6") },
  { id: "claude", label: "Claude", icon: "/dock-icons/claude.webp", bg: "linear-gradient(180deg,#e8855f,#cc5d3a)", glyph: G("M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7") },
  { id: "chrome", label: "Chrome", icon: "/dock-icons/chrome.webp", bg: "linear-gradient(180deg,#fff,#e5e5ea)", glyph: G("M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0") },
];

const BASE = 46;
const MAX = 76;
const RANGE = 150;
const GAP = 10;
const PAD = 10;

function Icon({ app, mouseX, fit, running, onLaunch }: { app: DockApp; mouseX: MotionValue<number>; fit: MotionValue<number>; running: boolean; onLaunch: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const sizeRaw = useTransform([dist, fit], ([d, k]: number[]) => mapRange(d, [-RANGE * k, 0, RANGE * k], [BASE * k, MAX * k, BASE * k]));
  const size = useSpring(sizeRaw, { stiffness: 320, damping: 22, mass: 0.2 });
  const [hover, setHover] = useState(false);
  const [bounce, setBounce] = useState(0);
  const [iconFailed, setIconFailed] = useState(false);
  const showIcon = !!app.icon && !iconFailed;

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95, transition: { duration: 0.1 } }}
            className="pointer-events-none absolute -top-10 whitespace-nowrap rounded-lg bg-white/90 px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_16px_-6px_rgba(0,0,0,.3)] backdrop-blur-md dark:bg-[#2c2c2e]/90 dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
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
        style={{ width: size, height: size, background: showIcon ? "transparent" : app.bg }}
        className={`flex items-center justify-center rounded-[22%] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${showIcon ? "" : "shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_6px_14px_-6px_rgba(0,0,0,.4)]"}`}
      >
        <motion.span key={bounce} className="flex h-full w-full items-center justify-center" animate={bounce ? { y: [0, -22, 0, -10, 0] } : undefined} transition={{ duration: 0.9, ease: "easeOut" }}>
          {showIcon ? (
            // The icon file is a finished app icon, so it fills the button; the shadow lifts it off the dock.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.icon}
              alt=""
              draggable={false}
              onError={() => setIconFailed(true)}
              className="pointer-events-none h-full w-full select-none drop-shadow-[0_6px_8px_rgba(0,0,0,.28)]"
            />
          ) : (
            app.glyph
          )}
        </motion.span>
      </motion.button>
      <motion.span className="mt-1 h-1 w-1 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" initial={false} animate={{ opacity: running ? 0.7 : 0, scale: running ? 1 : 0 }} />
    </div>
  );
}

export interface MagnifyDockProps {
  apps?: DockApp[];
  /** Sweeps an invisible pointer across the dock until someone hovers it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

export function MagnifyDock({ apps = APPS, autoplay = false, enableSound = true }: MagnifyDockProps) {
  const play = useSound(enableSound);
  const mouseX = useMotionValue(Infinity);
  const [running, setRunning] = useState<string[]>(["intelligence"]);
  const bar = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const frame = useRef<HTMLDivElement>(null);
  const fit = useMotionValue(1);
  const [k, setK] = useState(1);

  // On a narrow screen the dock would run off the edge, so everything in it (icons, gaps, swell) is
  // sized down together until it fits. `fit` is 1 whenever there is room.
  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    const measure = () => {
      const need = apps.length * BASE + (apps.length - 1) * GAP + PAD * 2 + (MAX - BASE) * 2;
      const next = Math.min(1, f.clientWidth / need);
      fit.set(next);
      setK(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(f);
    return () => ro.disconnect();
  }, [apps.length, fit]);

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
    <div ref={frame} className="flex h-[150px] w-full items-end justify-center">
      <div
        ref={bar}
        style={{ height: 66 * k, gap: GAP * k, paddingInline: PAD * k, paddingBottom: 6 * k, borderRadius: 22 * k }}
        onPointerMove={(e) => { hovering.current = true; mouseX.set(e.clientX); }}
        onPointerLeave={() => { hovering.current = false; mouseX.set(Infinity); }}
        className="flex items-end bg-white/70 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-20px_rgba(0,0,0,.35)] backdrop-blur-2xl dark:bg-[#2c2c2e]/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-20px_rgba(0,0,0,.7)]"
        role="toolbar"
        aria-label="Dock"
      >
        {apps.map((app) => (
          <Icon key={app.id} app={app} mouseX={mouseX} fit={fit} running={running.includes(app.id)} onLaunch={() => {
            play("pop");
            setRunning((r) => (r.includes(app.id) ? r : [...r, app.id]));
          }} />
        ))}
      </div>
    </div>
  );
}
