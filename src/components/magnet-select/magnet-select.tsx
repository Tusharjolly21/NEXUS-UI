"use client";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface MagnetOption {
  id: string;
  label: string;
  /** SVG path data for a 24×24 stroked icon. */
  d: string;
}

export const DEFAULT_MAGNET_OPTIONS: MagnetOption[] = [
  { id: "focus", label: "Focusing", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "meet", label: "In a meeting", d: "M15 10l5-3v10l-5-3zM3 7h12v10H3z" },
  { id: "lunch", label: "At lunch", d: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 6h3v12" },
  { id: "travel", label: "Travelling", d: "M2 16l20-6-8-1-4-6-2 1 2 6-6 2-2-2-1 1 2 4z" },
  { id: "sick", label: "Off sick", d: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11zM9 11h6M12 8v6" },
  { id: "away", label: "Away", d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" },
  { id: "here", label: "Available", d: "M5 12.5l4.5 4.5L19 7.5" },
];

export interface MagnetSelectProps {
  /** Options; the last one sits in the centre, the rest on a ring around it. */
  options?: MagnetOption[];
  /** id of the option selected at first. Defaults to the last (centre) option. */
  defaultValue?: string;
  /** Called with the option id whenever the selection changes. */
  onChange?: (id: string) => void;
  /** Accessible name of the radio group. */
  label?: string;
  /** Points at and picks options by itself until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/** Centre of the 300×300 stage and ring radius. */
const C = 150;
const R = 82;

type Point = { x: number; y: number };

function layout(n: number): Point[] {
  const ring = Math.max(1, n - 1);
  return Array.from({ length: n }, (_, i) =>
    i === n - 1
      ? { x: C, y: C }
      : { x: C + Math.cos((i / ring) * Math.PI * 2 - Math.PI / 2) * R, y: C + Math.sin((i / ring) * Math.PI * 2 - Math.PI / 2) * R },
  );
}

function Option({
  o,
  p,
  ox,
  oy,
  on,
  hover,
  btnRef,
  onHover,
  onPick,
  onKeyDown,
}: {
  o: MagnetOption;
  p: Point;
  ox: MotionValue<number>;
  oy: MotionValue<number>;
  on: boolean;
  hover: boolean;
  btnRef: (el: HTMLButtonElement | null) => void;
  onHover: (on: boolean) => void;
  onPick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  // Options near the moving orb get nudged out of its way: up to 14px, fading out 95px away.
  const x = useTransform([ox, oy] as MotionValue<number>[], ([cx, cy]: number[]) => {
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
    if (d < 1 || on) return 0;
    return (dx / d) * Math.max(0, 1 - d / 95) * 14;
  });
  const y = useTransform([ox, oy] as MotionValue<number>[], ([cx, cy]: number[]) => {
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
    if (d < 1 || on) return 0;
    return (dy / d) * Math.max(0, 1 - d / 95) * 14;
  });
  return (
    <motion.button
      ref={btnRef}
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={o.label}
      tabIndex={on ? 0 : -1}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      onClick={onPick}
      onKeyDown={onKeyDown}
      className="absolute flex h-[52px] w-[52px] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
      style={{ left: p.x - 26, top: p.y - 26, x, y }}
      animate={{ scale: hover && !on ? 1.08 : 1 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={on ? "stroke-white" : "stroke-[#6e6e73] dark:stroke-[#a1a1a6]"}
        style={{ transition: "stroke .2s" }}
      >
        <path d={o.d} />
      </svg>
    </motion.button>
  );
}

/**
 * A status picker where the selection is a liquid magnet rather than a
 * highlight. Point at an option and a bead of the orb reaches toward it;
 * pick it and the orb slides over, pushing the options it passes out of the
 * way, while a bridge of liquid stretches and snaps behind it.
 */
export function MagnetSelect({ options = DEFAULT_MAGNET_OPTIONS, defaultValue, onChange, label = "Status", autoplay = false, enableSound = true }: MagnetSelectProps) {
  const play = useSound(enableSound);
  const pos = useMemo(() => layout(options.length), [options.length]);
  const [sel, setSel] = useState(() => {
    const i = options.findIndex((o) => o.id === defaultValue);
    return i >= 0 ? i : options.length - 1;
  });
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const start = pos[sel] ?? { x: C, y: C };
  // The orb, a slower tail that stretches the liquid bridge, and a quick probe that reaches toward the hovered option.
  const ox = useSpring(start.x, { stiffness: 140, damping: 16 });
  const oy = useSpring(start.y, { stiffness: 140, damping: 16 });
  const tailX = useSpring(start.x, { stiffness: 95, damping: 15 });
  const tailY = useSpring(start.y, { stiffness: 95, damping: 15 });
  const probeX = useSpring(start.x, { stiffness: 220, damping: 20 });
  const probeY = useSpring(start.y, { stiffness: 220, damping: 20 });
  const touched = useRef(false);
  const selRef = useRef(sel);
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const s = pos[sel];
    if (!s) return;
    ox.set(s.x);
    oy.set(s.y);
    tailX.set(s.x);
    tailY.set(s.y);
  }, [sel, pos, ox, oy, tailX, tailY]);

  useEffect(() => {
    const s = pos[sel];
    if (!s) return;
    const t = hover !== null && hover !== sel && pos[hover] ? pos[hover] : s;
    probeX.set(s.x + (t.x - s.x) * 0.55);
    probeY.set(s.y + (t.y - s.y) * 0.55);
  }, [hover, sel, pos, probeX, probeY]);

  const pick = (i: number) => {
    if (i !== sel) play("tick", 0.6);
    setSel(i);
    const o = options[i];
    if (o) onChange?.(o.id);
  };

  useEffect(() => {
    if (!autoplay) return;
    const order = [0, 2, 4, 1, 6, 3, 5].filter((i) => i < options.length);
    let k = 0;
    let pending: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const i = order[k++ % order.length];
      setHover(i);
      pending = setTimeout(() => {
        if (!touched.current) {
          if (i !== selRef.current) play.auto("tick", 0.6);
          setSel(i);
          setHover(null);
        }
      }, 650);
    }, 1700);
    return () => {
      clearInterval(t);
      clearTimeout(pending);
    };
  }, [autoplay, options.length, play]);

  const onKey = (e: KeyboardEvent) => {
    const n = options.length;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (sel + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (sel - 1 + n) % n;
    if (next === null) return;
    e.preventDefault();
    touched.current = true;
    pick(next);
    buttons.current[next]?.focus();
  };

  return (
    <div
      className="flex flex-col items-center gap-3"
      onPointerDown={() => {
        touched.current = true;
      }}
      onPointerEnter={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative h-[300px] w-[300px]" role="radiogroup" aria-label={label}>
        <svg className="absolute inset-0" width="300" height="300" aria-hidden="true">
          <defs>
            <filter id={`mag-${id}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
              <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
            </filter>
            <linearGradient id={`mg-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff6fd8" />
              <stop offset=".5" stopColor="#7b61ff" />
              <stop offset="1" stopColor="#30d158" />
            </linearGradient>
          </defs>
          {pos.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="26" className="fill-[#f0f0f3] dark:fill-[#2c2c2e]" />
          ))}
          <g filter={`url(#mag-${id})`} fill={`url(#mg-${id})`}>
            <motion.circle cx={ox} cy={oy} r="30" />
            <motion.circle cx={tailX} cy={tailY} r="16" />
            <motion.circle cx={probeX} cy={probeY} r="13" />
          </g>
        </svg>
        {options.map((o, i) => (
          <Option
            key={o.id}
            o={o}
            p={pos[i]}
            ox={ox}
            oy={oy}
            on={sel === i}
            hover={hover === i}
            btnRef={(el) => {
              buttons.current[i] = el;
            }}
            onHover={(h) => setHover(h ? i : null)}
            onPick={() => {
              touched.current = true;
              pick(i);
            }}
            onKeyDown={onKey}
          />
        ))}
      </div>
      <motion.span
        key={sel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
        aria-live="polite"
      >
        {options[sel]?.label}
      </motion.span>
    </div>
  );
}
