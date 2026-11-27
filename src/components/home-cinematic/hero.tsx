import { HeroMilestone } from "@/components/home/hero-milestone";
import { HeroTutorial } from "@/components/home/hero-tutorial";
import { HeroWord } from "@/components/home/hero-word";
import { IfPro } from "@/components/pro/pro-access";
import { PillLink } from "@/components/site";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import type { DisplayPricing } from "@/lib/pricing";
import { HeroCopy, HeroProof } from "./hero-motion";
import { HeroGlobe } from "./hero-globe";
import { HeroTiles } from "./hero-tiles";

/**
 * The opening. A blueprint grid under a soft light, the headline coming into focus, and on wide screens six real
 * components to use right there, so the first thing a visitor sees is the product working. A lit horizon rises
 * from the bottom edge. Nothing in the background moves. Tucked under the floating nav so the grid starts at the top.
 */
export function CinematicHero({ pricing }: { pricing: DisplayPricing }) {
  return (
    <section className="relative -mt-[64px] overflow-hidden pb-20 pt-[128px] sm:pb-28 sm:pt-[150px]">
      <div aria-hidden className="cx-grid" />
      <div aria-hidden className="cx-bloom" />
      <HeroGlobe />
      <div aria-hidden className="cx-rim" />
      <div aria-hidden className="cx-grain" />

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

        {/* wide screens: six live components, and what the library holds */}
        <HeroCopy blur={false} className="cx-fade relative hidden lg:block">
          <HeroTiles />
          <dl className="cx-stats mt-7 grid grid-cols-3 gap-4 pt-5">
            <div className="flex flex-col">
              <dt className="font-mono text-[12.5px] text-muted-foreground">components</dt>
              <dd className="order-first text-[26px] font-semibold tracking-tight text-foreground">{CATALOG_COUNTS.components}+</dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-mono text-[12.5px] text-muted-foreground">blocks</dt>
              <dd className="order-first text-[26px] font-semibold tracking-tight text-foreground">{CATALOG_COUNTS.blocks}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-mono text-[12.5px] text-muted-foreground">free, full source</dt>
              <dd className="order-first text-[26px] font-semibold tracking-tight text-foreground">{CATALOG_COUNTS.freeComponents}</dd>
            </div>
          </dl>
        </HeroCopy>
      </div>

    </section>
  );
}
