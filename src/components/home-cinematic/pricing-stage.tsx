import { Check } from "lucide-react";
import { SaleBadge } from "@/components/pricing/sale-badge";
import { IndiaDiscountBadge } from "@/components/pricing/india-discount-badge";
import { PlanLink } from "@/components/pricing/plan-action";
import { PillLink } from "@/components/site";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import type { DisplayPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Glow } from "./glow";

const INCLUDED = [
  `All ${CATALOG_COUNTS.components} components`,
  `Source of all ${CATALOG_COUNTS.templates} templates`,
  `All ${CATALOG_COUNTS.blocks} blocks`,
  `All ${CATALOG_COUNTS.videos} videos, with prompt and source`,
  "Every future release",
  "Component requests",
  "Priority support",
];

/**
 * Three plans on a lit stage. Pro stands forward with a light running round its edge; the free plan
 * and the one-off plan sit either side. What both paid plans include runs underneath as one panel.
 */
export function PricingStage({ pricing }: { pricing: DisplayPricing }) {
  return (
    <section aria-labelledby="pricing-title" className="cx-section relative overflow-hidden px-4 py-24 sm:py-32">
      <div aria-hidden className="cx-horizon left-1/2 top-[35%] opacity-30" />
      <div className="relative mx-auto max-w-[1152px]">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 id="pricing-title" className="pg-display text-[clamp(40px,6.4vw,64px)] leading-[1.02] text-foreground">
            Free to start. One plan for the rest.
          </h2>
          <p className="mx-auto mt-5 max-w-[500px] text-[18px] leading-[1.55] text-muted-foreground">
            Pro and All-Access unlock exactly the same things. Pay yearly, or pay once and keep it.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-3 md:gap-4 lg:gap-6">
          {/* Free */}
          <Glow as="article" className="flex flex-col rounded-[26px] bg-card p-7 shadow-[0_0_0_0.5px_var(--cx-hairline)] md:mt-6 md:mb-6">
            <div className="relative z-10 flex flex-1 flex-col">
              <h3 className="text-[16px] font-semibold text-foreground">Free</h3>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="pg-display text-[52px] leading-none text-foreground">{pricing.free}</span>
                <span className="text-[15px] text-muted-foreground">forever</span>
              </p>
              <p className="mt-4 flex-1 text-[15px] leading-[1.55] text-muted-foreground">
                {CATALOG_COUNTS.freeComponents} components with full source, for any project.
              </p>
              <PillLink href="/components" variant="white" className="mt-8 w-full">
                Start free
              </PillLink>
            </div>
          </Glow>

          {/* Pro: stands forward */}
          <div className="cx-edge shadow-[0_40px_100px_-40px_rgba(110,91,255,0.55)]">
            <article className="relative flex h-full flex-col overflow-hidden rounded-[25px] bg-card p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--cx-ink-glow),transparent)] blur-xl"
              />
              <div className="relative flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[16px] font-semibold text-foreground">Pro</h3>
                  <span className="rounded-full bg-[linear-gradient(90deg,var(--cx-blue),var(--cx-violet),var(--cx-pink))] px-2.5 py-1 text-[11.5px] font-semibold text-white">
                    Everything, yearly
                  </span>
                </div>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="pg-display text-[60px] leading-none text-foreground">{pricing.pro}</span>
                  <span className="text-[15px] text-muted-foreground">per year</span>
                </p>
                {pricing.proDiscount ? (
                  <IndiaDiscountBadge percent={pricing.proDiscount} original={pricing.proOriginal} className="mt-3" />
                ) : null}
                {pricing.proWas && pricing.proSave ? <SaleBadge was={pricing.proWas} save={pricing.proSave} className="mt-3" /> : null}
                <p className="mt-4 flex-1 text-[15px] leading-[1.55] text-muted-foreground">
                  Every component, template, block and video, plus every release while you&apos;re subscribed.
                </p>
                <PlanLink tier="pro" href="/pricing" variant="ink" className="mt-8 w-full">
                  Get Pro
                </PlanLink>
              </div>
            </article>
          </div>

          {/* All-Access */}
          <Glow as="article" className="flex flex-col rounded-[26px] bg-card p-7 shadow-[0_0_0_0.5px_var(--cx-hairline)] md:mt-6 md:mb-6">
            <div className="relative z-10 flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16px] font-semibold text-foreground">All-Access</h3>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-semibold text-foreground">Pay once</span>
              </div>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="pg-display text-[52px] leading-none text-foreground">{pricing.allAccess}</span>
                <span className="text-[15px] text-muted-foreground">once</span>
              </p>
              {pricing.allAccessDiscount ? (
                <IndiaDiscountBadge percent={pricing.allAccessDiscount} original={pricing.allAccessOriginal} className="mt-3" />
              ) : null}
              {pricing.allAccessWas && pricing.allAccessSave ? <SaleBadge was={pricing.allAccessWas} save={pricing.allAccessSave} className="mt-3" /> : null}
              <p className="mt-4 flex-1 text-[15px] leading-[1.55] text-muted-foreground">
                The same as Pro, paid once and yours for good, including what we release next.
              </p>
              <PlanLink tier="all-access" href="/pricing" variant="white" className="mt-8 w-full">
                Get lifetime
              </PlanLink>
            </div>
          </Glow>
        </div>

        {/* what both paid plans include: hairline cells */}
        <div className="mt-6 overflow-hidden rounded-[26px] shadow-[0_0_0_0.5px_var(--cx-hairline)]">
          <p className="border-b border-border bg-card px-7 py-4 text-[14px] font-semibold text-foreground">
            Both paid plans include
          </p>
          <ul className="grid grid-cols-1 gap-px bg-[var(--cx-hairline)] sm:grid-cols-2 lg:grid-cols-4">
            {INCLUDED.map((f, i) => (
              <li
                key={f}
                className={cn(
                  "flex items-center gap-3 bg-card px-7 py-4 text-[14.5px] text-foreground",
                  i === INCLUDED.length - 1 && "sm:col-span-2 lg:col-span-2",
                )}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--cx-blue),var(--cx-violet))]">
                  <Check className="size-3 text-white" strokeWidth={3} aria-hidden />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className={cn("mt-8 text-center text-[15px] text-muted-foreground")}>
          Not sure yet?{" "}
          <PillLink href="/pricing" variant="white" size="sm" plansSource="home_teaser" className="ml-2">
            Compare plans in detail
          </PillLink>
        </p>
      </div>
    </section>
  );
}
