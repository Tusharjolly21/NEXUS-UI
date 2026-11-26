import { HeroMilestone } from "@/components/home/hero-milestone";
import { HeroSpotlight } from "@/components/home/hero-spotlight";
import { HeroTutorial } from "@/components/home/hero-tutorial";
import { HeroWord } from "@/components/home/hero-word";
import { IfPro } from "@/components/pro/pro-access";
import { PillLink } from "@/components/site";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import type { DisplayPricing } from "@/lib/pricing";
import { HeroCopy, HeroProof } from "./hero-motion";
import { CodeToUi } from "./code-to-ui";

/** Streaks of light that run along the grid lines: [row or column index, seconds, delay]. */
const PULSES_H: [number, number, number][] = [
  [2, 7, 0.4],
  [5, 9, 3.2],
  [8, 8, 5.6],
];
const PULSES_V: [number, number, number][] = [
  [3, 8, 1.4],
  [9, 10, 4.1],
  [15, 7, 2.3],
  [21, 9, 6.2],
];

/**
 * The opening. A blueprint grid with light running along its lines, the headline coming into focus,
 * and one app window below it playing real components, so the first thing a visitor sees is the
 * product working. Tucked under the floating nav so the grid starts at the very top.
 */
export function CinematicHero({ pricing }: { pricing: DisplayPricing }) {
  return (
    <section className="relative -mt-[64px] overflow-hidden pb-20 pt-[128px] sm:pb-28 sm:pt-[150px]">
      <div aria-hidden className="cx-grid">
        {PULSES_H.map(([row, dur, delay]) => (
          <span
            key={`h${row}`}
            className="cx-pulse-h"
            style={{ top: row * 64 - 1, ["--dur" as string]: `${dur}s`, ["--delay" as string]: `${delay}s` }}
          />
        ))}
        {PULSES_V.map(([col, dur, delay]) => (
          <span
            key={`v${col}`}
            className="cx-pulse-v"
            style={{ left: col * 64 - 1, ["--dur" as string]: `${dur}s`, ["--delay" as string]: `${delay}s` }}
          />
        ))}
      </div>
      <div aria-hidden className="cx-aurora">
        <span />
        <span />
        <span />
      </div>
      <HeroSpotlight />

      <div className="relative z-20 mx-auto grid max-w-[1200px] grid-cols-1 items-center px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
        <HeroCopy className="min-w-0 text-center lg:text-left">
          <div className="cx-fade flex justify-center lg:justify-start" style={{ animationDelay: "0.1s" }}>
            <HeroMilestone />
          </div>

          <h1 className="pg-display cx-sweep mt-8 text-[clamp(46px,8.6vw,108px)] text-foreground lg:text-[clamp(64px,6.6vw,96px)]">
            <span className="cx-rise block" style={{ animationDelay: "0.15s" }}>
              Make your
            </span>
            <span className="cx-rise block" style={{ animationDelay: "0.3s" }}>
              <HeroWord className="block" />
            </span>
            <span className="cx-rise block" style={{ animationDelay: "0.45s" }}>
              move.
            </span>
          </h1>

          <p
            className="cx-fade mx-auto mt-7 max-w-[540px] text-[18px] leading-[1.55] text-muted-foreground lg:mx-0"
            style={{ animationDelay: "0.65s" }}
          >
            {CATALOG_COUNTS.components}+ copy-paste React components with real motion, plus the blocks and templates
            to put them to work. {CATALOG_COUNTS.freeComponents} are free, with full source.
          </p>

          <div
            className="cx-fade mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            style={{ animationDelay: "0.8s" }}
          >
            <PillLink href="/components">Browse components</PillLink>
            <HeroTutorial />
            <IfPro
              pro={null}
              otherwise={
                <PillLink href="/pricing" variant="white" plansSource="hero">
                  See Pro plans
                </PillLink>
              }
            />
          </div>

          <div className="cx-fade" style={{ animationDelay: "0.95s" }}>
            <IfPro
              pro={null}
              otherwise={
                <p className="mt-5 text-[13.5px] text-muted-foreground">
                  Pro unlocks everything and every new release: {pricing.pro} a year, or {pricing.allAccess} once.
                </p>
              }
            />
            <HeroProof />
          </div>
        </HeroCopy>

        {/* wide screens: code typing itself into a running component, to the right */}
        <HeroCopy className="cx-fade relative hidden lg:block">
          <CodeToUi />
        </HeroCopy>
      </div>

    </section>
  );
}
