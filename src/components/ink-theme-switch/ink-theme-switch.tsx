"use client";
import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, type MotionValue } from "framer-motion";

const W = 320;
const H = 300;
/** Toggle centre, measured from the panel's right and top edges. */
const FROM_RIGHT = 38;
const TY = 34;
/** Radius that covers the whole panel from the toggle, plus a margin. */
const MAX_R = Math.hypot(W - FROM_RIGHT, H - TY) + 20;

const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  const p = (n: number) => Math.round(n * 1000) / 1000;
  return { x1: p(12 + Math.cos(a) * 8), y1: p(12 + Math.sin(a) * 8), x2: p(12 + Math.cos(a) * 10.5), y2: p(12 + Math.sin(a) * 10.5) };
});

const ROWS: [string, boolean][] = [
  ["Notifications", true],
  ["Auto-update", false],
  ["Share analytics", true],
];

function pour(r: MotionValue<number>, toDark: boolean) {
  return animate(r, toDark ? MAX_R : 0, {
    duration: toDark ? 0.9 : 0.7,
    ease: toDark ? [0.65, 0, 0.35, 1] : [0.5, 0, 0.75, 0],
  });
}

/** The sample settings screen, drawn in one of its two themes. It ignores the site theme on purpose. */
function Panel({ dark, hidden }: { dark: boolean; hidden: boolean }) {
  const c = dark
    ? { bg: "#111113", card: "#1c1c1e", ink: "#f5f5f7", sub: "#a1a1a6", line: "rgba(255,255,255,.08)", accent: "#0a84ff" }
    : { bg: "#f5f5f7", card: "#ffffff", ink: "#1d1d1f", sub: "#6e6e73", line: "rgba(0,0,0,.06)", accent: "#0071e3" };
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-4" style={{ background: c.bg }} aria-hidden={hidden}>
      <div className="flex h-9 items-center justify-between">
        <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: c.ink }}>
          Settings
        </span>
      </div>
      <div className="rounded-[16px] p-3" style={{ background: c.card }}>
        {ROWS.map(([t, on], i) => (
          <div key={t} className="flex items-center justify-between py-2" style={{ borderTop: i ? `1px solid ${c.line}` : undefined }}>
            <span className="text-[14px]" style={{ color: c.ink }}>
              {t}
            </span>
            <span
              className="flex h-[22px] w-[38px] flex-none items-center rounded-full p-[2px]"
              style={{ background: on ? "#30d158" : dark ? "#3a3a3c" : "#e5e5ea", justifyContent: on ? "flex-end" : "flex-start" }}
            >
              <span className="h-[18px] w-[18px] rounded-full bg-white shadow" />
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-[16px] p-3" style={{ background: c.card }}>
        <span className="h-10 w-10 flex-none rounded-full" style={{ background: `linear-gradient(140deg, ${c.accent}, #bf5af2)` }} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[14px] font-medium" style={{ color: c.ink }}>
            Sam Alvarez
          </span>
          <span className="truncate text-[12px]" style={{ color: c.sub }}>
            Pro plan · renews in 12 days
          </span>
        </span>
      </div>
    </div>
  );
}

export interface InkThemeSwitchProps {
  /** Start with the panel in dark mode. Only this component's own panel is themed; the page is never touched. */
  defaultDark?: boolean;
  /** Called with the new value when the user flips the switch. */
  onChange?: (dark: boolean) => void;
  /** Flips between light and dark every 2.2s until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the panel. */
  className?: string;
}

/**
 * Theme switch that floods. Toggle dark mode and the dark version of the UI
 * pours out of the switch as an ink circle, easing in and out, until it
 * covers everything; switch back and it drains into the button. The sun
 * pulls in its rays and becomes a moon on the way. It themes only its own
 * panel and never changes the site theme or the document's classes.
 */
export function InkThemeSwitch({ defaultDark = false, onChange, autoplay = false, className = "" }: InkThemeSwitchProps) {
  const [dark, setDark] = useState(defaultDark);
  const r = useMotionValue(defaultDark ? MAX_R : 0);
  const id = useId().replace(/:/g, "");
  const clip = useMotionTemplate`circle(${r}px at calc(100% - ${FROM_RIGHT}px) ${TY}px)`;
  const touched = useRef(false);
  const anim = useRef<ReturnType<typeof animate> | undefined>(undefined);

  useEffect(() => () => anim.current?.stop(), []);

  useEffect(() => {
    if (!autoplay) return;
    let on = defaultDark;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      on = !on;
      setDark(on);
      anim.current = pour(r, on);
    }, 2200);
    return () => clearInterval(t);
  }, [autoplay, defaultDark, r]);

  const flip = () => {
    touched.current = true;
    const to = !dark;
    setDark(to);
    anim.current = pour(r, to);
    onChange?.(to);
  };

  return (
    <div
      className={`relative max-w-full overflow-hidden rounded-[26px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_48px_-28px_rgba(0,0,0,.4)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-28px_rgba(0,0,0,.9)] ${className}`}
      style={{ width: W, height: H }}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <Panel dark={false} hidden={dark} />
      <motion.div className="absolute inset-0" style={{ clipPath: clip, WebkitClipPath: clip }}>
        <Panel dark hidden={!dark} />
      </motion.div>
      <motion.button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        onClick={flip}
        whileTap={{ scale: 0.88 }}
        className="absolute flex h-9 w-9 items-center justify-center rounded-full outline-none focus-visible:ring-2"
        style={{ right: FROM_RIGHT - 18, top: TY - 18, ["--tw-ring-color" as string]: dark ? "#0a84ff" : "#0071e3" }}
        initial={false}
        animate={{ backgroundColor: dark ? "#2c2c2e" : "#ffffff", boxShadow: dark ? "0 0 0 1px rgba(255,255,255,.12)" : "0 0 0 1px rgba(0,0,0,.08)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <mask id={`moon-${id}`}>
              <rect width="24" height="24" fill="#fff" />
              <motion.circle
                r="7"
                fill="#000"
                initial={false}
                animate={{ cx: dark ? 16 : 30, cy: dark ? 8 : -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              />
            </mask>
          </defs>
          <motion.circle
            cx="12"
            cy="12"
            fill={dark ? "#ffd60a" : "#ff9f0a"}
            mask={`url(#moon-${id})`}
            initial={false}
            animate={{ r: dark ? 8 : 5 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          />
          <motion.g
            initial={false}
            animate={{ scale: dark ? 0 : 1, rotate: dark ? -90 : 0, opacity: dark ? 0 : 1 }}
            style={{ originX: "12px", originY: "12px" }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            stroke="#ff9f0a"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {RAYS.map((l, i) => (
              <line key={i} {...l} />
            ))}
          </motion.g>
        </svg>
      </motion.button>
    </div>
  );
}
