"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface SparkReactionOption {
  /** Stable key. */
  id: string;
  /** Accessible name, e.g. "Rocket". */
  label: string;
  /** SVG path data on a 24×24 grid, drawn as a 2px round stroke. */
  d: string;
  /** Stroke colour; also the colour of its sparks. */
  color: string;
  /** Stroke colour in dark mode, for icons drawn in a near-black. Defaults to `color`. */
  darkColor?: string;
}

export interface SparkReaction {
  /** Option id this count belongs to. */
  id: string;
  /** How many people reacted, including you. */
  count: number;
  /** Whether you are one of them. */
  mine: boolean;
}

export const DEFAULT_SPARK_OPTIONS: SparkReactionOption[] = [
  { id: "rocket", label: "Rocket", color: "#5e5ce6", d: "M12 2c3 2 5 6 4 11l-2 3h-4l-2-3C7 8 9 4 12 2zM9 16l-3 3 1-4M15 16l3 3-1-4M12 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { id: "fire", label: "Fire", color: "#ff9f0a", d: "M12 22c4 0 7-3 7-7 0-4-3-6-4-10-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 7-4 13 0 4 3 7 7 7zM12 22c-2 0-3-1.5-3-3.5S11 15 12 13c1 2 3 3.5 3 5.5S14 22 12 22z" },
  { id: "heart", label: "Heart", color: "#ff375f", d: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" },
  { id: "eyes", label: "Eyes", color: "#1d1d1f", darkColor: "#f5f5f7", d: "M7 12a3 4 0 1 0 0 .01M17 12a3 4 0 1 0 0 .01M2 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7zM12 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7z" },
  { id: "check", label: "Done", color: "#30d158", d: "M5 12.5l4.5 4.5L19 7.5" },
  { id: "party", label: "Party", color: "#bf5af2", d: "M3 21l5-14 9 9zM14 3v3M19 5l-2 2M21 10h-3M8 7l9 9" },
];

export const DEFAULT_SPARK_REACTIONS: SparkReaction[] = [
  { id: "rocket", count: 3, mine: false },
  { id: "fire", count: 2, mine: false },
];

export interface SparkReactionsProps {
  /** The message the reactions belong to. */
  message?: string;
  /** Starting reactions, in row order. */
  reactions?: SparkReaction[];
  /** Reactions offered in the picker; also the icon set for `reactions`. */
  options?: SparkReactionOption[];
  /** Called with the new row after the user adds or removes a reaction. */
  onChange?: (reactions: SparkReaction[]) => void;
  /** Reacts, opens the picker and un-reacts on a loop until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the root. */
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

/** Adds yours to a reaction (appending it if new) or takes yours away, dropping empty ones. */
function applyToggle(l: SparkReaction[], id: string): SparkReaction[] {
  const ex = l.find((r) => r.id === id);
  if (!ex) return [...l, { id, count: 1, mine: true }];
  return l
    .map((r) => (r.id === id ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) } : r))
    .filter((r) => r.count > 0);
}

function Icon({ option, dark, size = 16 }: { option: SparkReactionOption; dark: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={dark ? option.darkColor ?? option.color : option.color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={option.d} />
    </svg>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="relative inline-flex h-5 min-w-[10px] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={n}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {n}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";

/**
 * Message reactions. Tap a pill to add or remove yours: the count rolls and
 * the icon pops with a few sparks. The smiley opens a picker; a new reaction
 * slides into the row and the others make room.
 */
export function SparkReactions({
  message = "Shipped the new onboarding flow",
  reactions = DEFAULT_SPARK_REACTIONS,
  options = DEFAULT_SPARK_OPTIONS,
  onChange,
  autoplay = false,
  className = "",
}: SparkReactionsProps) {
  const [list, setList] = useState<SparkReaction[]>(reactions);
  const [picker, setPicker] = useState(false);
  const [pop, setPop] = useState<{ id: string; n: number } | null>(null);
  const touched = useRef(false);
  const addBtn = useRef<HTMLButtonElement>(null);
  const dark = useIsDark();
  const byId = new Map(options.map((o) => [o.id, o]));

  const sparkle = (id: string) => setPop((p) => ({ id, n: (p?.n ?? 0) + 1 }));

  const toggle = (id: string) => {
    touched.current = true;
    const next = applyToggle(list, id);
    setList(next);
    sparkle(id);
    onChange?.(next);
  };

  useEffect(() => {
    if (!autoplay) return;
    const bump = (id: string) => {
      setList((l) => applyToggle(l, id));
      setPop((p) => ({ id, n: (p?.n ?? 0) + 1 }));
    };
    const steps = [
      () => bump("rocket"),
      () => setPicker(true),
      () => {
        setPicker(false);
        bump("heart");
      },
      () => bump("fire"),
      () => bump("heart"),
      () => bump("rocket"),
      () => bump("fire"),
    ];
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      steps[k++ % steps.length]();
    }, 1300);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const closeOnEscape = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !picker) return;
    e.preventDefault();
    setPicker(false);
    addBtn.current?.focus();
  };

  return (
    <div
      className={`flex w-[300px] max-w-full flex-col items-start gap-2 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={(e) => {
        touched.current = true;
        closeOnEscape(e);
      }}
    >
      <div className="rounded-[20px] rounded-bl-md bg-[#f0f0f3] px-4 py-2.5 text-[15px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
        {message}
      </div>
      <motion.div layout className="relative flex flex-wrap items-center gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((r) => {
            const o = byId.get(r.id);
            if (!o) return null;
            const popping = pop?.id === r.id;
            return (
              <motion.button
                layout
                key={r.id}
                type="button"
                aria-pressed={r.mine}
                aria-label={`${o.label}, ${r.count}`}
                onClick={() => toggle(r.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: r.mine ? (dark ? "#0f2c4d" : "#e8f1fd") : dark ? "#1c1c1e" : "#ffffff",
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className={`relative flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] ${FOCUS} ${
                  r.mine
                    ? "shadow-[inset_0_0_0_1.5px_#0071e3] dark:shadow-[inset_0_0_0_1.5px_#0a84ff]"
                    : "shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
                }`}
              >
                <motion.span
                  key={popping ? `${r.id}-${pop.n}` : r.id}
                  className="relative flex"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.5, 1], rotate: [0, -12, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon option={o} dark={dark} />
                  {popping &&
                    Array.from({ length: 6 }, (_, k) => (
                      <motion.span
                        key={k}
                        className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                        style={{ background: dark ? o.darkColor ?? o.color : o.color }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: Math.cos((k / 6) * 6.28) * 16, y: Math.sin((k / 6) * 6.28) * 16, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    ))}
                </motion.span>
                <Count n={r.count} />
              </motion.button>
            );
          })}
        </AnimatePresence>
        <motion.button
          ref={addBtn}
          layout
          type="button"
          aria-label="Add reaction"
          aria-expanded={picker}
          onClick={() => {
            touched.current = true;
            setPicker((p) => !p);
          }}
          whileTap={{ scale: 0.88 }}
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#1c1c1e] dark:text-[#a1a1a6] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] ${FOCUS}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
          </svg>
        </motion.button>
        <AnimatePresence>
          {picker && (
            <motion.div
              role="group"
              aria-label="Pick a reaction"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0 top-10 z-10 flex max-w-full flex-wrap gap-1 rounded-full bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-12px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-12px_rgba(0,0,0,.8)]"
              style={{ transformOrigin: "left top" }}
            >
              {options.map((o, k) => (
                <motion.button
                  key={o.id}
                  type="button"
                  aria-label={o.label}
                  onClick={() => {
                    toggle(o.id);
                    setPicker(false);
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: k * 0.03, type: "spring", stiffness: 600, damping: 20 }}
                  whileHover={{ scale: 1.3, y: -3 }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
                >
                  <Icon option={o} dark={dark} size={18} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
