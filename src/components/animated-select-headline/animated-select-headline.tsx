"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type SelectCollaborator = { name: string; color: string };

export interface AnimatedSelectHeadlineProps {
  /** Words or short phrases to cycle through. */
  words?: string[];
  /** Text before the selected word. */
  prefix?: string;
  /** Text after the selected word. */
  suffix?: string;
  /** Milliseconds between words. 0 stops the cycling (click or the arrow keys still step). */
  interval?: number;
  /** People whose cursors take turns selecting each word; colour is any CSS colour. */
  collaborators?: SelectCollaborator[];
  /** Shows the collaborator's cursor and name tag on the selection. */
  showCursor?: boolean;
  /** Shows the live width badge under the selection, like a design tool. */
  showSize?: boolean;
  /** Called with the index of the word that is now selected. */
  onChange?: (index: number) => void;
  className?: string;
  headingClassName?: string;
}

const PEOPLE: SelectCollaborator[] = [
  { name: "Maya", color: "#0071e3" },
  { name: "Leo", color: "#bf5af2" },
  { name: "Ari", color: "#ff9f0a" },
  { name: "Sam", color: "#30d158" },
];

const PAD = 10;

const rgbOf = (c: string): [number, number, number] | null => {
  const h = c.trim().replace("#", "");
  const f =
    h.length === 3
      ? h
          .split("")
          .map((x) => x + x)
          .join("")
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(f)) return null;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
/** Label colour with the better contrast on a tag of colour `c`. */
const inkOn = (c: string) => {
  const rgb = rgbOf(c);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? "#ffffff" : "#1d1d1f";
};
const tint = (c: string, a: number) => {
  const rgb = rgbOf(c);
  return rgb
    ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
    : "rgba(0,113,227,0.07)";
};

/** tailwind-merge drops a default `leading-*` whenever a later `text-*` size arrives, so the default goes last unless the caller set one. */
const withLeading = (cls: string | undefined, fallback: string) => (/(^|\s)([\w-]+:)*leading-/.test(cls ?? "") ? undefined : fallback);

/**
 * A headline where one word sits inside a design-tool selection box. Every few seconds a
 * different collaborator selects the next word: the box springs to the new width with an elastic
 * overshoot, its handles and colour follow, the size badge counts the pixels live, and the
 * collaborator's cursor trails the corner on a softer spring.
 */
export function AnimatedSelectHeadline({
  words = ["warp speed", "record time", "pure flow", "light speed"],
  prefix = "Build amazing websites at",
  suffix,
  interval = 2500,
  collaborators = PEOPLE,
  showCursor = true,
  showSize = true,
  onChange,
  className,
  headingClassName,
}: AnimatedSelectHeadlineProps) {
  const still = useReducedMotion() === true;
  const list = words.length ? words : [""];
  const crew = collaborators.length ? collaborators : PEOPLE;
  const [index, setIndex] = React.useState(0);
  const [hold, setHold] = React.useState(false);
  const word = list[index % list.length] ?? "";
  const who = crew[index % crew.length] ?? PEOPLE[0]!;
  const wordRef = React.useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const px = useMotionValue(0);
  const hpx = useMotionValue(0);
  const tall = useTransform(hpx, (v) => Math.round(v));
  const tail = useSpring(px, { stiffness: 110, damping: 13 });
  const size = useTransform(px, (v) => Math.round(v));
  const run = React.useRef<AnimationPlaybackControls | undefined>(undefined);
  const changed = React.useRef(onChange);
  React.useEffect(() => {
    changed.current = onChange;
  }, [onChange]);

  const go = React.useCallback(
    (step: number) => setIndex((i) => (i + step + list.length) % list.length),
    [list.length],
  );
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    changed.current?.(index);
  }, [index]);

  React.useEffect(() => {
    if (!interval || hold || list.length < 2) return;
    const t = setInterval(() => go(1), Math.max(600, interval));
    return () => clearInterval(t);
  }, [interval, hold, list.length, go]);

  // Measure the new word and spring the box to it. The first measurement jumps so nothing animates on load.
  React.useLayoutEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    const w = el.offsetWidth + PAD * 2;
    hpx.set(el.offsetHeight);
    run.current?.stop();
    if (width.get() === "auto" || still) {
      width.set(w);
      px.set(w);
      tail.jump(w);
      return;
    }
    px.set(w);
    run.current = animate(width, w, {
      type: "spring",
      stiffness: 420,
      damping: 19,
      mass: 0.9,
    });
  }, [index, word, width, px, hpx, tail, still]);
  React.useEffect(() => () => run.current?.stop(), []);

  const handle =
    "absolute size-[9px] rounded-[2px] border-[1.5px] bg-white dark:bg-[#1c1c1e]";

  return (
    <div className={cn("text-center", className)}>
      <h2
        className={cn(
          "m-0 text-balance text-[40px] font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-[52px] dark:text-[#f5f5f7]",
          headingClassName,
          withLeading(headingClassName, "leading-[1.15]"),
        )}
      >
        {prefix ? <>{prefix} </> : null}
        <motion.span
          role="button"
          tabIndex={0}
          aria-label={`${word}. Show the next word`}
          onClick={() => go(1)}
          onPointerEnter={() => setHold(true)}
          onPointerLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={() => setHold(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
              e.preventDefault();
              go(1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              go(-1);
            }
          }}
          className="relative inline-block cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
          style={{ width, paddingLeft: PAD, paddingRight: PAD }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${index}-${word}`}
              ref={wordRef}
              className="inline-block"
              initial={
                still ? false : { y: "55%", opacity: 0, filter: "blur(8px)" }
              }
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={
                still
                  ? { opacity: 0 }
                  : { y: "-55%", opacity: 0, filter: "blur(8px)" }
              }
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 border-[1.5px]"
            animate={{
              borderColor: who.color,
              backgroundColor: tint(who.color, 0.07),
            }}
            transition={{ duration: 0.25 }}
          >
            {(
              [
                "-left-[5px] -top-[5px]",
                "-right-[5px] -top-[5px]",
                "-left-[5px] -bottom-[5px]",
                "-right-[5px] -bottom-[5px]",
              ] as const
            ).map((pos, k) => (
              <motion.span
                key={k}
                className={cn(handle, pos)}
                animate={{ borderColor: who.color }}
                transition={{ duration: 0.25 }}
              />
            ))}
          </motion.span>
          {showSize ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] rounded-[5px] px-1.5 py-[1px] text-[11px] font-semibold leading-[16px] tracking-normal tabular-nums"
              style={{ x: "-50%" }}
              animate={{ backgroundColor: who.color, color: inkOn(who.color) }}
              transition={{ duration: 0.25 }}
            >
              <motion.span>{size}</motion.span> ×{" "}
              <motion.span>{tall}</motion.span>
            </motion.span>
          ) : null}
          {showCursor ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-full"
              style={{ x: tail }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={who.name}
                  className="absolute left-[-4px] top-[-6px] flex items-start"
                  initial={{ opacity: 0, scale: 0.6, x: 18, y: 14 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,.25)]"
                  >
                    <path
                      d="M2 1.5 15 8.2 9 9.6 6.4 15.6Z"
                      fill={who.color}
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="mt-[13px] -ml-[3px] rounded-full px-2 py-[2px] text-[11px] font-semibold leading-[15px] tracking-normal"
                    style={{
                      backgroundColor: who.color,
                      color: inkOn(who.color),
                    }}
                  >
                    {who.name}
                  </span>
                </motion.span>
              </AnimatePresence>
            </motion.span>
          ) : null}
        </motion.span>
        {suffix ? <> {suffix}</> : null}
      </h2>
    </div>
  );
}
