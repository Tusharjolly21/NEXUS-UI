"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

/**
 * A year of invented activity drawn as a contribution calendar: 53 weeks of squares in five shades of green.
 * The numbers come from a seeded generator, so the graph is identical on every load and on the server. The
 * squares pop in diagonally once the graph is a third in view, hovering one shows a tooltip, and the graph
 * starts scrolled to the latest week on narrow screens.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const HEADER = 18; // room for month labels above the grid

type Day = { date: Date; count: number };

/** Small deterministic random number generator (Lehmer), returns values in (0, 1). */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/** The 52 weeks before the last day, starting on a Sunday, up to and including the last day. */
function buildDays(): Day[] {
  const random = seededRandom(2026);
  const last = new Date(2026, 10, 4);
  const first = new Date(last);
  first.setDate(last.getDate() - 7 * 52 - last.getDay());

  const days: Day[] = [];
  for (const date = new Date(first); date <= last; date.setDate(date.getDate() + 1)) {
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    // Busier in some months than others, quieter at weekends.
    const season = 0.6 + 0.4 * Math.sin((date.getMonth() / 12) * Math.PI * 2 + 1);
    const activity = random() * season * (weekend ? 0.55 : 1);
    days.push({ date: new Date(date), count: activity < 0.18 ? 0 : Math.round(activity * 14) });
  }
  return days;
}

/** The same year for every visitor, built once. */
const DAYS = buildDays();

const level = (count: number) => (count === 0 ? 0 : count < 4 ? 1 : count < 7 ? 2 : count < 10 ? 3 : 4);

/** Month labels sit above the first week that starts in the first seven days of a month. */
function monthLabels(days: Day[], weeks: number) {
  const labels: { week: number; name: string }[] = [];
  for (let week = 0; week < weeks - 2; week++) {
    const date = days[week * 7]?.date;
    const previous = labels[labels.length - 1];
    if (date && date.getDate() <= 7 && (!previous || week - previous.week > 3)) {
      labels.push({ week, name: MONTHS[date.getMonth()] });
    }
  }
  return labels;
}

type Tip = { x: number; y: number; text: string };

export function ContributionGraph() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const [tip, setTip] = useState<Tip | null>(null);

  // Start at the newest week; the graph is wider than the screen on phones.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  const total = DAYS.reduce((sum, day) => sum + day.count, 0);
  const weeks = Math.ceil(DAYS.length / 7);

  return (
    <div ref={rootRef} className="relative">
      <div ref={scrollerRef} className="overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <svg
          viewBox={`0 0 ${weeks * STEP} ${7 * STEP + HEADER}`}
          className="block w-full min-w-[600px]"
          role="img"
          aria-label={`Contribution calendar: ${total.toLocaleString("en-US")} contributions in the last year`}
          onMouseLeave={() => setTip(null)}
        >
          {monthLabels(DAYS, weeks).map(({ week, name }) => (
            <text key={week} x={week * STEP} y="10" fontSize="10" fill="var(--dim)">
              {name}
            </text>
          ))}
          {DAYS.map((day, index) => {
            const week = Math.floor(index / 7);
            const weekday = index % 7;
            return (
              <motion.rect
                key={index}
                x={week * STEP}
                y={HEADER + weekday * STEP}
                width={CELL}
                height={CELL}
                rx="2.5"
                fill={`var(--c${level(day.count)})`}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.4 }}
                animate={inView ? { opacity: 1, scale: 1 } : undefined}
                transition={{ delay: (week + weekday) * 0.012, type: "spring", stiffness: 380, damping: 24 }}
                style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}
                onMouseEnter={(event) => {
                  const root = rootRef.current;
                  if (!root) return;
                  const frame = root.getBoundingClientRect();
                  const cell = event.currentTarget.getBoundingClientRect();
                  const { count, date } = day;
                  setTip({
                    x: cell.left - frame.left + cell.width / 2,
                    y: cell.top - frame.top,
                    text: `${count || "No"} contribution${count === 1 ? "" : "s"} on ${MONTHS[date.getMonth()]} ${date.getDate()}`,
                  });
                }}
              />
            );
          })}
        </svg>
      </div>

      <AnimatePresence>
        {tip && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, y: 4, left: tip.x, top: tip.y - 34 }}
            animate={{ opacity: 1, y: 0, left: tip.x, top: tip.y - 34 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 40 }}
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-[8px] px-2 py-1 text-[12px] font-medium"
            style={{ x: "-50%", background: "var(--fg)", color: "var(--page)" }}
          >
            {tip.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px]" style={{ color: "var(--dim)" }}>
        <span className="tabular-nums">{total.toLocaleString("en-US")} contributions in the last year</span>
        <span className="flex items-center gap-1" aria-hidden>
          Less
          {[0, 1, 2, 3, 4].map((shade) => (
            <span key={shade} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: `var(--c${shade})` }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
