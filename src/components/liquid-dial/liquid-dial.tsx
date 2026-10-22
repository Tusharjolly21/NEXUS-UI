"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface LiquidDialAction {
  id: string;
  label: string;
  /** SVG path data drawn in a 24×24 box with a 1.9 stroke. */
  d: string;
}

const ACTIONS: LiquidDialAction[] = [
  { id: "photo", label: "Photo", d: "M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { id: "note", label: "Note", d: "M6 4h9l4 4v12H6zM14 4v5h5M9 13h7M9 17h5" },
  { id: "voice", label: "Voice memo", d: "M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3" },
  { id: "link", label: "Link", d: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" },
];

const W = 360;
const H = 300;
const CX = W / 2;
const CY = H - 60;
const RADIUS = 112;
const ANGLES = [-160, -118, -62, -20];

const pos = (i: number) => {
  const a = (ANGLES[i] * Math.PI) / 180;
  return { x: CX + Math.cos(a) * RADIUS, y: CY + Math.sin(a) * RADIUS };
};

export interface LiquidDialProps {
  /** Up to four actions, laid out on an arc above the button. */
  actions?: LiquidDialAction[];
  /** Blob colour. Defaults to near-black (#1d1d1f), or #3a3a3c in dark mode. */
  color?: string;
  /** Highlight colour. Defaults to #0071e3 (#0a84ff in dark mode). */
  accent?: string;
  onSelect?: (id: string) => void;
  /** Opens and browses by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/**
 * A floating action button whose actions bud out of it like liquid. Everything
 * sits under an SVG "goo" filter (blur + alpha threshold), so blobs merge where
 * they are close. The highlight is two blobs on different springs, so it pulls
 * into a thread between actions before snapping round the new one.
 */
export function LiquidDial({ actions = ACTIONS, color, accent, onSelect, autoplay = false, enableSound = true }: LiquidDialProps) {
  const play = useSound(enableSound);
  const fid = "goo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const blob = color ?? "var(--ld-blob)";
  const hl = accent ?? "var(--ld-accent)";
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const touched = useRef(false);
  const pickedTimer = useRef(0);
  const leadX = useMotionValue(CX), leadY = useMotionValue(CY);
  const tailX = useMotionValue(CX), tailY = useMotionValue(CY);
  const hlR = useMotionValue(0);

  useEffect(() => {
    const target = hover !== null && open ? pos(hover) : { x: CX, y: CY };
    animate(leadX, target.x, { type: "spring", stiffness: 520, damping: 30 });
    animate(leadY, target.y, { type: "spring", stiffness: 520, damping: 30 });
    animate(tailX, target.x, { type: "spring", stiffness: 140, damping: 18 });
    animate(tailY, target.y, { type: "spring", stiffness: 140, damping: 18 });
    animate(hlR, hover !== null && open ? 31 : 0, { type: "spring", stiffness: 400, damping: 26 });
  }, [hover, open, leadX, leadY, tailX, tailY, hlR]);

  useEffect(() => () => window.clearTimeout(pickedTimer.current), []);

  const choose = (a: LiquidDialAction) => {
    setPicked(a.label);
    onSelect?.(a.id);
    setOpen(false);
    setHover(null);
    window.clearTimeout(pickedTimer.current);
    pickedTimer.current = window.setTimeout(() => setPicked(null), 1400);
  };

  // The autoplay loop always calls the latest `choose`/`actions`.
  const latest = useRef({ choose, actions });
  useEffect(() => {
    latest.current = { choose, actions };
  });

  useEffect(() => {
    if (!autoplay) return;
    const ts: number[] = [];
    const run = () => {
      if (touched.current) return;
      setOpen(true);
      [0, 1, 2, 3, 1].forEach((h, k) =>
        ts.push(
          window.setTimeout(() => {
            if (!touched.current) setHover(h);
          }, 650 + k * 420),
        ),
      );
      ts.push(
        window.setTimeout(() => {
          const { choose: pick, actions: list } = latest.current;
          if (touched.current || !list[1]) return;
          play.auto("tap", 0.8);
          pick(list[1]);
        }, 3000),
      );
    };
    ts.push(window.setTimeout(run, 700));
    const loop = setInterval(run, 5200);
    return () => { clearInterval(loop); ts.forEach(clearTimeout); };
  }, [autoplay, play]);

  return (
    <div
      className="relative select-none [--ld-accent:#0071e3] [--ld-blob:#1d1d1f] dark:[--ld-accent:#0a84ff] dark:[--ld-blob:#3a3a3c]"
      style={{ width: W, height: H }}
      onPointerDown={() => { touched.current = true; }}
      onPointerLeave={() => setHover(null)}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={fid}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
      </svg>

      {/* Liquid layer */}
      <div className="absolute inset-0" style={{ filter: `url(#${fid})` }} aria-hidden="true">
        {actions.map((a, i) => {
          const p = pos(i);
          return (
            <motion.span
              key={a.id}
              className="absolute rounded-full"
              style={{ width: 52, height: 52, left: -26, top: -26, background: blob }}
              initial={false}
              animate={open ? { x: p.x, y: p.y, scale: 1 } : { x: CX, y: CY, scale: 0.4 }}
              transition={{ type: "spring", stiffness: open ? 260 : 380, damping: open ? 16 : 28, delay: open ? i * 0.05 : (actions.length - i) * 0.03 }}
            />
          );
        })}
        <motion.span className="absolute rounded-full" style={{ x: tailX, y: tailY, width: 2, height: 2, left: -1, top: -1, scale: hlR, background: hl }} />
        <motion.span className="absolute rounded-full" style={{ x: leadX, y: leadY, width: 2, height: 2, left: -1, top: -1, scale: hlR, background: hl }} />
        <motion.span className="absolute rounded-full" style={{ width: 64, height: 64, left: CX - 32, top: CY - 32, background: blob }} animate={{ scale: open ? 1.04 : 1 }} />
      </div>

      {/* Crisp icon layer on top of the goo */}
      {actions.map((a, i) => {
        const p = pos(i);
        return (
          <motion.button
            key={a.id}
            type="button"
            aria-label={a.label}
            tabIndex={open ? 0 : -1}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => { play("tap", 0.8); choose(a); }}
            className="absolute flex h-[52px] w-[52px] items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black"
            style={{ left: -26, top: -26, pointerEvents: open ? "auto" : "none", ["--tw-ring-color" as string]: hl }}
            initial={false}
            animate={open ? { x: p.x, y: p.y, opacity: 1, scale: hover === i ? 1.1 : 1 } : { x: CX, y: CY, opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: open ? 260 : 380, damping: open ? 16 : 28, delay: open ? i * 0.05 + 0.04 : 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={a.d} />
            </svg>
          </motion.button>
        );
      })}
      <AnimatePresence>
        {open && hover !== null && actions[hover] && (
          <motion.span
            key={hover}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute whitespace-nowrap text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]"
            style={{ left: pos(hover).x, top: pos(hover).y - 54, x: "-50%" }}
          >
            {actions[hover].label}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close actions" : "New"}
        onClick={() => { touched.current = true; setOpen((o) => !o); setHover(null); }}
        whileTap={{ scale: 0.9 }}
        className="absolute flex h-16 w-16 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black"
        style={{ left: CX - 32, top: CY - 32, ["--tw-ring-color" as string]: hl }}
      >
        <motion.svg animate={{ rotate: open ? 135 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </motion.svg>
      </motion.button>
      <AnimatePresence>
        {picked && (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ x: "-50%" }}
            className="absolute left-1/2 top-8 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_20px_-10px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_8px_20px_-10px_rgba(0,0,0,.8)]"
          >
            New {picked.toLowerCase()}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
