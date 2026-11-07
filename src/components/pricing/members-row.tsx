"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flag } from "@/components/pricing/flag";
import { MEMBERS, discBackground, initials } from "@/components/pricing/members";

/**
 * People who bought All-Access (the lifetime plan), shown by name under the plans with their permission.
 * One flat, quiet row: an initial in a spectrum-coloured disc, the name, the country. It reads as
 * intentional with two names and simply wraps onto more lines as the list grows, so there is no
 * count and no fan to outgrow. Newest first. Keep it to real buyers who said yes to being shown.
 *
 * Motion: one soft rise-in as the section scrolls into view, staggered by a few tens of milliseconds.
 * With reduced motion they are simply there.
 */
// The full row stays hidden until there are enough names: two read as "few buyers". Below this the names
// show only as the small MemberStack under the buy buttons.
const MIN_FOR_ROW = 5;

function Member({ m, i, inView }: { m: (typeof MEMBERS)[number]; i: number; inView: boolean }) {
  const reduced = !!useReducedMotion();
  return (
    <motion.li
      className="flex items-center gap-3 rounded-full bg-card py-2 pl-2 pr-6 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_10px_24px_-18px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.09)]"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.1 + i * 0.07 }}
    >
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold uppercase tracking-[-0.2px] text-white"
        style={{ background: discBackground(i) }}
      >
        {initials(m.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-semibold leading-tight tracking-[-0.2px] text-foreground">{m.name}</span>
        <span className="mt-1 block leading-none">
          <Flag code={m.code} country={m.country} className="h-[14px] w-[21px]" />
        </span>
      </span>
    </motion.li>
  );
}

export function MembersRow() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (MEMBERS.length < MIN_FOR_ROW) return null;
  return (
    <section aria-labelledby="members" className="mx-auto flex max-w-[1000px] flex-col items-center px-6 pb-24 pt-2">
      <div className="text-center">
        <h2 id="members" className="pg-display text-[clamp(30px,4vw,40px)] leading-[1.05] text-foreground">
          Recently joined <span className="whitespace-nowrap">All-Access</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[460px] text-[16px] leading-[1.55] text-muted-foreground">
          They paid once and get every component, block and template, including the ones we haven&apos;t made yet.
        </p>
      </div>
      <div ref={ref} className="mt-8 flex justify-center">
        <ul className="flex flex-wrap items-center justify-center gap-3">
          {MEMBERS.map((m, i) => (
            <Member key={m.name} m={m} i={i} inView={inView} />
          ))}
        </ul>
      </div>
    </section>
  );
}
