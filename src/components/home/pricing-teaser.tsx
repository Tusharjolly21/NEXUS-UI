import { Check } from "lucide-react";
import { PillLink } from "@/components/site";
import { PlanLink } from "@/components/pricing/plan-action";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { PRICES, formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    term: "forever",
    line: `${CATALOG_COUNTS.freeComponents} components with full source, for any project.`,
    href: "/components",
    cta: "Start free",
  },
  {
    name: "Pro",
    price: formatPrice(PRICES.pro),
    term: "per year",
    line: "Everything, plus every release while you're subscribed.",
    href: "/pricing",
    cta: "Get Pro",
    featured: true,
  },
  {
    name: "All-Access",
    price: formatPrice(PRICES.allAccess),
    term: "once",
    line: "The same as Pro, paid once and yours for good.",
    href: "/pricing",
    cta: "Get lifetime",
  },
] as const;

const INCLUDED = [
  `All ${CATALOG_COUNTS.components} components`,
  `Source of all ${CATALOG_COUNTS.templates} templates`,
  `All ${CATALOG_COUNTS.blocks} section blocks`,
  "Every future release",
  "Component requests",
  "Priority support",
];

/** Short version of /pricing: three plans and what the paid ones unlock. */
export function PricingTeaser() {
  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">
            Free to start. One plan for the rest.
          </h2>
          <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
            Pro and All-Access unlock exactly the same things. Pay yearly, or pay once.
          </p>
        </div>
        <PillLink href="/pricing" variant="white" className="shrink-0 self-start md:self-auto">
          Compare plans
        </PillLink>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <article
            key={p.name}
            className={cn(
              "pg-float flex flex-col rounded-tile bg-card p-7",
              "featured" in p && p.featured && "ring-2 ring-action",
            )}
          >
            <h3 className="text-[17px] font-semibold text-foreground">{p.name}</h3>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-[44px] font-semibold leading-none tracking-[-0.035em] text-foreground">
                {p.price}
              </span>
              <span className="text-[15px] text-muted-foreground">{p.term}</span>
            </p>
            <p className="mt-3 flex-1 text-[15px] text-muted-foreground">{p.line}</p>
            {p.name === "Free" ? (
              <PillLink href={p.href} variant="white" className="mt-7 w-full">
                {p.cta}
              </PillLink>
            ) : (
              <PlanLink
                tier={p.name === "Pro" ? "pro" : "all-access"}
                href={p.href}
                variant={"featured" in p && p.featured ? "ink" : "white"}
                className="mt-7 w-full"
              >
                {p.cta}
              </PlanLink>
            )}
          </article>
        ))}
      </div>

      <div className="pg-float mt-5 grid gap-6 rounded-tile bg-card p-7 md:grid-cols-[200px_1fr] md:items-center">
        <p className="text-[15px] font-semibold tracking-[-0.2px] text-foreground">Both paid plans include</p>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((f) => (
            <li key={f} className="flex gap-2.5 text-[15px] text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-action" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
