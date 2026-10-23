"use client";
// Logo Shelf: rows of app-icon tiles scroll past on shelves, in opposite directions, with a few
// gaps so it reads like a wall of integrations. Each tile is just the brand glyph in its colour on a
// rounded square; hover lifts one on a spring. Pauses off screen, on hover and under reduced motion.

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { EDGE, LOGOS, LogoHeading, Track, type Logo } from "./logos";

export type LogoCloudShelfProps = {
  /** Brands to place on the shelves: { name, Icon, color }. Defaults to twenty invented brands. */
  logos?: Logo[];
  /** Small blue label above the headline. Leave empty to hide it. */
  eyebrow?: string;
  /** Headline above the shelves. */
  title?: string;
  /** Number of shelves (1 to 5). Odd ones drift left, even ones right. */
  rows?: number;
  /** Drift speed of the first shelf, in px per second. Each next shelf is 5 faster. */
  speed?: number;
  className?: string;
};

/** Lays the brands out on the shelves with a few empty slots. A fixed seed keeps the gaps in the same places on every render and on the server. */
function buildShelves(logos: Logo[], rows: number): (Logo | null)[][] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let next = 0;
  const shelves: (Logo | null)[][] = [];
  const count = Math.max(1, Math.min(5, Math.round(rows)));
  for (let r = 0; r < count; r++) {
    const shelf: (Logo | null)[] = [];
    for (let c = 0; c < 14; c++) {
      if (rand() < 0.32) {
        shelf.push(null);
        continue;
      }
      shelf.push(logos[next % logos.length]);
      next += 1 + Math.floor(rand() * 2);
    }
    shelves.push(shelf);
  }
  return shelves;
}

export default function LogoCloudShelf({
  logos = LOGOS,
  eyebrow = "Integrations",
  title = "Works with the tools your team already lives in.",
  rows = 3,
  speed = 22,
  className,
}: LogoCloudShelfProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const shelves = React.useMemo(() => buildShelves(logos, rows), [logos, rows]);

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <LogoHeading eyebrow={eyebrow} eyebrowClassName="text-[#0071e3] dark:text-[#2997ff]" title={title} />
      <div
        ref={ref}
        className="mt-12 flex flex-col gap-3 overflow-hidden sm:mt-14"
        style={{ WebkitMaskImage: EDGE, maskImage: EDGE }}
      >
        {shelves.map((row, r) => (
          <Track
            key={r}
            items={row}
            speed={speed + r * 5}
            reverse={r % 2 === 1}
            gap={12}
            active={inView}
            render={(b: Logo | null, i: number) =>
              b ? (
                <motion.span
                  key={`${b.name}-${i}`}
                  role="img"
                  aria-label={b.name}
                  whileHover={{ y: -4, scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_18px_-10px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
                >
                  <b.Icon className="h-8 w-8" style={{ color: b.color }} />
                </motion.span>
              ) : (
                <span key={`e-${i}`} aria-hidden="true" className="h-16 w-16 shrink-0 rounded-[18px] bg-black/[0.025] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)] dark:bg-white/[0.04] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]" />
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
