"use client";

import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export type CountUpDigitsProps = {
  /** The number to count up to. */
  value?: number;
  /** Where the count starts. */
  from?: number;
  /** Decimal places to show. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Group digits with commas, as in 12,480. */
  grouping?: boolean;
  /** Start when scrolled into view (default) or right away. */
  startOn?: "view" | "mount";
  /** Spring stiffness. Higher lands faster. */
  stiffness?: number;
  /** Counts again when pressed, and with `autoplay` on, by itself until the visitor touches it. */
  replayOnPress?: boolean;
  /** Counts again every few seconds until the visitor touches it. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Text size and colour. Digits are sized in em, so set the font size here. */
  className?: string;
};

type Cell = { char: string; place: number | null; lead: number };

const DIGIT_HEIGHT = 1.12; // em

/** Splits "12,480.5" into cells; each digit knows its place value in the scaled number, separators the place of the digit to their left. */
function cellsFor(value: number, decimals: number, grouping: boolean): Cell[] {
  const text = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  });
  const out: Cell[] = [];
  let digitsSeen = 0;
  const digitCount = text.replace(/[^0-9]/g, "").length;
  for (const ch of text) {
    if (/[0-9]/.test(ch)) {
      const fromRight = digitCount - 1 - digitsSeen;
      out.push({ char: ch, place: 10 ** fromRight, lead: 10 ** fromRight });
      digitsSeen++;
    } else {
      out.push({ char: ch, place: null, lead: 10 ** (digitCount - digitsSeen) });
    }
  }
  return out;
}

function Column({ scaled, place, onesPlace, instant }: { scaled: MotionValue<number>; place: number; onesPlace: number; instant: boolean }) {
  const whole = useTransform(scaled, (v) => Math.floor(v / place));
  const rolled = useSpring(whole, instant ? { stiffness: 100000, damping: 1000, mass: 1 } : { stiffness: 260, damping: 30, mass: 0.8 });
  // A column on the left of the number stays hidden until the count reaches it, so 0 to 12,480 does not start as 00,000.
  const opacity = useTransform(scaled, (v) => (place <= onesPlace || v >= place ? 1 : 0));
  return (
    <motion.span aria-hidden="true" className="relative inline-block overflow-hidden" style={{ height: `${DIGIT_HEIGHT}em`, width: "0.62em", opacity }}>
      <span className="invisible block text-center" style={{ lineHeight: `${DIGIT_HEIGHT}em` }}>
        0
      </span>
      {Array.from({ length: 10 }, (_, n) => (
        <Digit key={n} n={n} rolled={rolled} />
      ))}
    </motion.span>
  );
}

function Digit({ n, rolled }: { n: number; rolled: MotionValue<number> }) {
  const y = useTransform(rolled, (latest) => {
    const here = latest % 10;
    const offset = (10 + n - here) % 10;
    let em = offset * DIGIT_HEIGHT;
    if (offset > 5) em -= 10 * DIGIT_HEIGHT;
    return `${em}em`;
  });
  return (
    <motion.span className="absolute inset-0 text-center" style={{ y, lineHeight: `${DIGIT_HEIGHT}em` }}>
      {n}
    </motion.span>
  );
}

/**
 * A number that counts up by rolling its digits, like an odometer. Each column is driven by a spring, so a
 * digit that has a long way to go spins quickly and settles with a small overshoot, while the ones column barely moves.
 * Columns on the left stay hidden until the count reaches them. The final number is in the page text for screen readers.
 */
export default function CountUpDigits({
  value = 12480,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  grouping = true,
  startOn = "view",
  stiffness = 70,
  replayOnPress = true,
  autoplay = false,
  className = "text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]",
}: CountUpDigitsProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const factor = 10 ** decimals;
  const scaled = useMotionValue(from * factor);
  const driver = useSpring(scaled, { stiffness, damping: 24, mass: 1 });
  const touched = useRef(false);
  const [run, setRun] = useState(0);

  const cells = useMemo(() => cellsFor(value, decimals, grouping), [value, decimals, grouping]);
  const finalText = `${prefix}${cells.map((c) => c.char).join("")}${suffix}`;
  const onesPlace = factor;
  const ready = startOn === "mount" || inView;

  useEffect(() => {
    if (reduced) {
      scaled.set(value * factor);
      driver.jump(value * factor);
      return;
    }
    if (!ready) return;
    scaled.set(from * factor);
    driver.jump(from * factor);
    const id = window.requestAnimationFrame(() => scaled.set(value * factor));
    return () => window.cancelAnimationFrame(id);
  }, [ready, run, value, from, factor, reduced, scaled, driver]);

  useEffect(() => {
    if (!autoplay || reduced || !ready) return;
    const timer = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(timer);
        return;
      }
      setRun((n) => n + 1);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [autoplay, reduced, ready]);

  const replay = () => {
    touched.current = true;
    if (!reduced) setRun((n) => n + 1);
  };

  const body = (
    <>
      <span className="sr-only">{finalText}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {prefix && <span>{prefix}</span>}
        {cells.map((cell, i) =>
          cell.place === null ? (
            <Separator key={i} char={cell.char} scaled={driver} lead={cell.lead} />
          ) : (
            <Column key={i} scaled={driver} place={cell.place} onesPlace={onesPlace} instant={!!reduced} />
          ),
        )}
        {suffix && <span>{suffix}</span>}
      </span>
    </>
  );

  return (
    <span ref={ref} className="inline-flex">
      {replayOnPress ? (
        <button
          type="button"
          onClick={replay}
          title="Press to count again"
          className={`inline-flex cursor-pointer items-baseline rounded-lg tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${className}`}
        >
          {body}
        </button>
      ) : (
        <span className={`inline-flex items-baseline tabular-nums ${className}`}>{body}</span>
      )}
    </span>
  );
}

function Separator({ char, scaled, lead }: { char: string; scaled: MotionValue<number>; lead: number }) {
  const opacity = useTransform(scaled, (v) => (v >= lead ? 1 : 0));
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}
