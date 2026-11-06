"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TwentyFirstLogo } from "@/components/home/twenty-first-logo";

/**
 * Real figures from the nexus-ui profile on 21st.dev. Update these when you re-check the page.
 * `digits` is what the odometer rolls to; `spoken` is what a screen reader hears.
 */
const PROFILE_URL = "https://21st.dev/@nexus-ui";
const AS_OF = "November 2026";
const STATS = [
  { digits: "930.2", suffix: "K", label: "views", spoken: "930.2 thousand views" },
  { digits: "3.8", suffix: "K", label: "bookmarks", spoken: "3.8 thousand bookmarks" },
  { digits: "30", suffix: "", label: "components listed", spoken: "30 components listed" },
] as const;

const EASE = [0.2, 0.8, 0.2, 1] as const;
const BLUE = "oklch(0.485 0.291 264.121)";

/** One odometer column: the digits 0 to 9 stacked, slid so the target one shows. */
function Reel({ digit, index, inView, still }: { digit: number; index: number; inView: boolean; still: boolean }) {
  return (
    <span className="relative inline-block h-[1.04em] overflow-hidden align-top">
      <span className="invisible block h-[1.04em] leading-[1.04]">{digit}</span>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={still ? { y: `-${digit * 10}%` } : { y: "0%" }}
        animate={{ y: inView || still ? `-${digit * 10}%` : "0%" }}
        transition={{ duration: 1.5 + index * 0.18, ease: EASE, delay: 0.35 }}
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
    <span aria-hidden className="pg-display inline-flex items-baseline text-[clamp(52px,7.4vw,92px)] tabular-nums text-foreground">
      {digits.split("").map((c, k) =>
        /\d/.test(c) ? <Reel key={k} digit={Number(c)} index={i++} inView={inView} still={still} /> : <span key={k}>{c}</span>,
      )}
      {suffix && (
        <span className="ml-[0.03em]" style={{ color: BLUE }}>
          {suffix}
        </span>
      )}
    </span>
  );
}

/**
 * The homepage milestone, kept quiet: the Nexus UI and 21st marks, one headline, three numbers between
 * hairlines. When it scrolls into view the line between the marks draws and the numbers roll up like an
 * odometer. That is the only motion. Reduced motion shows the finished page.
 */
export function TwentyFirstMilestone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const still = !!useReducedMotion();
  const go = inView || still;

  return (
    <section id="21st" aria-labelledby="milestone-title" className="scroll-mt-20 px-4 pb-24 pt-4 sm:pb-28">
      <div ref={ref} className="mx-auto max-w-[1152px]">
        <div className="flex items-center gap-4" aria-hidden>
          <motion.img
            src="/nexus-ui-logo.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-[11px]"
            initial={still ? false : { opacity: 0, scale: 0.8 }}
            animate={go ? { opacity: 1, scale: 1 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          <motion.span
            className="block h-px w-14 origin-left bg-foreground/30 sm:w-24"
            initial={still ? false : { scaleX: 0 }}
            animate={go ? { scaleX: 1 } : undefined}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          />
          <motion.div
            className="text-foreground"
            initial={still ? false : { opacity: 0, x: -8 }}
            animate={go ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
          >
            <TwentyFirstLogo className="h-6 w-auto sm:h-7" />
          </motion.div>
        </div>

        <h2 id="milestone-title" className="pg-display mt-8 max-w-[780px] text-[clamp(38px,6vw,64px)] leading-[1.02] text-foreground">
          Almost a million views on 21st.dev
        </h2>
        <p className="mt-4 max-w-[520px] text-[18px] leading-[1.55] text-muted-foreground">
          21st.dev is a community library where developers browse and copy React components.
        </p>

        <dl className="mt-12 grid grid-cols-1 border-t border-border sm:mt-14 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={s.label} className={`border-b border-border py-7 sm:border-b-0 sm:py-9 ${i > 0 ? "sm:border-l sm:pl-8" : ""} ${i < 2 ? "sm:pr-8" : ""}`}>
              <dt className="sr-only">{s.spoken}</dt>
              <dd>
                <Odometer digits={s.digits} suffix={s.suffix} inView={inView} still={still} />
                <span className="mt-1 block text-[16px] text-muted-foreground">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 self-start text-[15px] font-medium text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            See our profile on 21st.dev
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <p className="text-[13px] text-muted-foreground">Counts from our 21st.dev profile, {AS_OF}.</p>
        </div>
      </div>
    </section>
  );
}
