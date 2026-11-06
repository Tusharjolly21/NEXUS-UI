"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { pillClassName } from "@/components/site";
import { TWENTY_FIRST_BLUE, TwentyFirstLogo } from "@/components/home/twenty-first-logo";

/**
 * Real figures from the nexus-ui profile on 21st.dev. Update these when you re-check the page.
 * `digits` is what the odometer rolls to; `spoken` is what a screen reader hears.
 */
const PROFILE_URL = "https://21st.dev/@nexus-ui";
const AS_OF = "November 2026";
const STATS = [
  { digits: "930.2", suffix: "K", label: "views", spoken: "930.2 thousand views" },
  { digits: "3.8", suffix: "K", label: "bookmarks", spoken: "3.8 thousand bookmarks" },
] as const;

const EASE = [0.2, 0.8, 0.2, 1] as const;
const BLUE = TWENTY_FIRST_BLUE;

/** The Nexus UI mark, drawn as SVG so the hub and spokes can animate: three spokes meeting at a blue node. */
function NexusMark({ inView, still }: { inView: boolean; still: boolean }) {
  const spokes = [
    { x: 255, y: 105 },
    { x: 106, y: 359 },
    { x: 406, y: 359 },
  ];
  return (
    <svg viewBox="0 0 512 512" role="img" aria-label="Nexus UI" className="size-full overflow-visible">
      <rect width="512" height="512" rx="118" fill="#0d0d0f" />
      {spokes.map((s, i) => (
        <g key={i}>
          <motion.line
            x1="255"
            y1="258"
            x2={s.x}
            y2={s.y}
            stroke="#f4f1ec"
            strokeWidth="17"
            strokeLinecap="round"
            initial={still ? false : { pathLength: 0 }}
            animate={inView || still ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: EASE }}
          />
          <motion.circle
            cx={s.x}
            cy={s.y}
            r="24"
            fill="#f4f1ec"
            initial={still ? false : { scale: 0 }}
            animate={inView || still ? { scale: 1 } : undefined}
            style={{ transformOrigin: `${s.x}px ${s.y}px` }}
            transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.7 + i * 0.12 }}
          />
        </g>
      ))}
      <circle cx="255" cy="258" r="41" fill="#f4f1ec" />
      <motion.circle
        cx="255"
        cy="258"
        r="34"
        fill="#7b9bff"
        initial={still ? false : { scale: 0 }}
        animate={inView || still ? { scale: 1 } : undefined}
        style={{ transformOrigin: "255px 258px" }}
        transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
      />
    </svg>
  );
}

/** One odometer column: the digits 0 to 9 stacked, slid so the target one shows. */
function Reel({ digit, index, inView, still }: { digit: number; index: number; inView: boolean; still: boolean }) {
  return (
    <span className="relative inline-block h-[1.04em] overflow-hidden align-top">
      {/* The real digit holds the width and the line height; the reel sits over it. */}
      <span className="invisible block h-[1.04em] leading-[1.04]">{digit}</span>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={still ? { y: `-${digit * 10}%` } : { y: "0%" }}
        animate={{ y: inView || still ? `-${digit * 10}%` : "0%" }}
        transition={{ duration: 1.5 + index * 0.18, ease: EASE, delay: 0.5 }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-[1.04em] text-center leading-[1.04]">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ digits, suffix, inView, still }: { digits: string; suffix: string; inView: boolean; still: boolean }) {
  let i = 0;
  return (
    <span aria-hidden className="pg-display inline-flex items-baseline text-[clamp(60px,10vw,116px)] tabular-nums text-foreground">
      {digits.split("").map((c, k) =>
        /\d/.test(c) ? <Reel key={k} digit={Number(c)} index={i++} inView={inView} still={still} /> : <span key={k}>{c}</span>,
      )}
      <span className="ml-[0.04em]" style={{ color: BLUE }}>
        {suffix}
      </span>
    </span>
  );
}

/** Dots travel from the 21st mark to the Nexus mark along a hairline: each one is a view arriving. */
function Thread({ inView, still }: { inView: boolean; still: boolean }) {
  const dots = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div className="relative h-14 min-w-0 flex-1 sm:h-[72px]" aria-hidden>
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px origin-right -translate-y-1/2"
        style={{ background: `linear-gradient(90deg, transparent, ${BLUE} 30%, ${BLUE} 70%, transparent)`, opacity: 0.55 }}
        initial={still ? false : { scaleX: 0 }}
        animate={inView || still ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
      />
      {!still &&
        inView &&
        dots.map((i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 -ml-[3px] -mt-[3px] block size-[6px] rounded-full"
            style={{ background: BLUE, boxShadow: `0 0 12px 2px ${BLUE}` }}
            initial={{ left: "100%", y: 0, opacity: 0 }}
            animate={{ left: ["100%", "0%"], y: [0, -7, 0, 7, 0], opacity: [0, 1, 1, 1, 0] }}
            transition={{
              duration: 4.2,
              ease: "linear",
              repeat: Infinity,
              delay: 1.4 + i * 0.46,
              times: [0, 0.5, 0.75, 0.9, 1],
              y: { duration: 4.2, ease: "easeInOut", repeat: Infinity, delay: 1.4 + i * 0.46 },
            }}
          />
        ))}
    </div>
  );
}

/**
 * A milestone band for the homepage: Nexus UI and 21st.dev, tied together by a stream of views, with the
 * profile's real view and bookmark counts rolling up like an odometer. It plays once when scrolled into
 * view; the stream then keeps drifting quietly. Reduced motion shows the finished state with nothing moving.
 */
export function TwentyFirstMilestone() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const still = !!reduce;
  const inView = seen;

  return (
    <section id="21st" aria-labelledby="milestone-title" className="scroll-mt-20 px-4 pb-24">
      <div
        ref={ref}
        className="pg-float relative mx-auto max-w-[1152px] overflow-hidden rounded-tile bg-card px-5 py-14 sm:px-10 sm:py-20"
      >
        {/* A slow blue bloom behind the numbers; it breathes once the band is on screen. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[58%] h-[520px] w-[920px] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${BLUE} 20%, transparent), transparent)` }}
          initial={still ? false : { opacity: 0, scale: 0.8 }}
          animate={inView || still ? (still ? { opacity: 1 } : { opacity: [0.55, 1, 0.55], scale: [0.92, 1.04, 0.92] }) : undefined}
          transition={still ? undefined : { duration: 7, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="relative mx-auto max-w-[860px]">
          {/* The two marks, joined */}
          <div className="flex items-center gap-3 sm:gap-5">
            <motion.div
              className="size-14 shrink-0 rounded-[16px] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_14px_28px_-14px_rgba(0,0,0,0.5)] sm:size-[72px] sm:rounded-[20px]"
              initial={still ? false : { opacity: 0, scale: 0.7 }}
              animate={inView || still ? { opacity: 1, scale: 1 } : undefined}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <NexusMark inView={inView} still={still} />
            </motion.div>
            <Thread inView={inView} still={still} />
            <motion.div
              initial={still ? false : { opacity: 0, x: 18 }}
              animate={inView || still ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
              className="shrink-0 text-foreground"
            >
              <TwentyFirstLogo className="h-7 w-auto sm:h-9" />
            </motion.div>
          </div>

          <h2 id="milestone-title" className="pg-display mt-12 text-[clamp(30px,4.6vw,46px)] leading-[1.04] text-foreground sm:mt-14">
            Almost a million views on 21st.dev
          </h2>
          <p className="mt-3 max-w-[560px] text-[17px] leading-[1.55] text-muted-foreground">
            21st.dev is a community library where developers browse and copy React components. Thirty of ours are listed there.
          </p>

          {/* The counts */}
          <dl className="mt-10 grid grid-cols-1 gap-x-12 gap-y-6 sm:mt-12 sm:grid-cols-2">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.spoken}</dt>
                <dd>
                  <Odometer digits={s.digits} suffix={s.suffix} inView={inView} still={still} />
                  <motion.span
                    className="mt-1 block text-[17px] font-medium text-muted-foreground"
                    initial={still ? false : { opacity: 0 }}
                    animate={inView || still ? { opacity: 1 } : undefined}
                    transition={{ duration: 0.6, delay: 1.7 }}
                  >
                    {s.label}
                  </motion.span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
            <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className={pillClassName("white", "md", "self-start")}>
              See us on 21st.dev
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <p className="text-[13px] text-muted-foreground">Counts from our 21st.dev profile, {AS_OF}.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
