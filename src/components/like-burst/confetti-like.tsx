"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const DEFAULT_CONFETTI_COLORS = ["#ff375f", "#ff9f0a", "#bf5af2", "#0a84ff", "#30d158", "#ffd60a"];

export interface ConfettiLikeProps {
  /** Like count without your like; yours adds one. */
  count?: number;
  /** Whether it starts liked. */
  defaultLiked?: boolean;
  /** Heart and ring colour, as a hex value. */
  accent?: string;
  /** Confetti colours, used in turn around the burst. */
  colors?: string[];
  /** Called with the new state and the displayed count when the user toggles it. */
  onChange?: (liked: boolean, count: number) => void;
  /** Likes and unlikes itself every 1.5s until someone presses it. */
  autoplay?: boolean;
  /** Extra classes for the button. */
  className?: string;
}

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/** `#rgb` or `#rrggbb` to a transparent rgba of the same colour, so the fill can fade in. */
function clear(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(n)) return "rgba(255,55,95,0)";
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
}

function Digits({ value }: { value: number }) {
  const s = value.toLocaleString("en-US");
  return (
    <span className="inline-flex overflow-hidden tabular-nums" aria-hidden="true">
      {s.split("").map((c, i) => (
        <span key={s.length - i} className="relative inline-flex">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * Like button. The heart squashes, fills and throws out a ring and a burst
 * of confetti; only the digits that change roll over. Unlike and it deflates
 * quietly.
 */
export function ConfettiLike({
  count = 1300,
  defaultLiked = false,
  accent = "#ff375f",
  colors = DEFAULT_CONFETTI_COLORS,
  onChange,
  autoplay = false,
  className = "",
}: ConfettiLikeProps) {
  const [liked, setLiked] = useState(defaultLiked);
  const [burst, setBurst] = useState(0);
  const touched = useRef(false);
  const dark = useIsDark();
  const shown = count + (liked ? 1 : 0);
  const palette = colors.length ? colors : DEFAULT_CONFETTI_COLORS;

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      // The burst only renders while liked, so bumping it on unlike is harmless.
      setLiked((l) => !l);
      setBurst((b) => b + 1);
    }, 1500);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const press = () => {
    touched.current = true;
    const next = !liked;
    setLiked(next);
    if (next) setBurst((b) => b + 1);
    onChange?.(next, count + (next ? 1 : 0));
  };

  return (
    <motion.button
      type="button"
      aria-pressed={liked}
      aria-label={`Like, ${shown.toLocaleString("en-US")} likes`}
      onClick={press}
      whileTap={{ scale: 0.92 }}
      className={`relative flex h-12 items-center gap-2.5 rounded-full bg-white pl-4 pr-5 text-[17px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_10px_24px_-14px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#0a84ff] ${className}`}
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <AnimatePresence>
          {liked && (
            <motion.span
              key={`ring${burst}`}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: accent }}
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 2.4, opacity: 0, borderWidth: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        {liked &&
          Array.from({ length: 10 }, (_, k) => {
            const a = (k / 10) * Math.PI * 2;
            return (
              <motion.span
                key={`${burst}-${k}`}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                style={{ background: palette[k % palette.length], marginLeft: -3, marginTop: -3 }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: Math.cos(a) * 26, y: Math.sin(a) * 26, scale: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1] }}
              />
            );
          })}
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          animate={liked ? { scale: [1, 0.6, 1.3, 1], rotate: [0, -10, 6, 0] } : { scale: [1, 0.85, 1] }}
          transition={{ duration: 0.45 }}
          aria-hidden="true"
        >
          <motion.path
            d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={false}
            animate={{ fill: liked ? accent : clear(accent), stroke: liked ? accent : dark ? "#f5f5f7" : "#1d1d1f" }}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>
      </span>
      <Digits value={shown} />
    </motion.button>
  );
}
