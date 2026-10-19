import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { PillLink, RainbowWord } from "@/components/site";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { createMetadata, siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";

const { components, templates, blocks } = CATALOG_COUNTS;
const freeBlocks = blocksManifest.filter((b) => !b.premium).length;

const TEMPLATE_PRICE = 49;
const PRO_PRICE = 99;
const ALL_ACCESS_PRICE = 149;

export const metadata: Metadata = {
  ...createMetadata({
    description: `Every Nexus UI component is free. Pro ($${PRO_PRICE} for 12 months) and All-Access ($${ALL_ACCESS_PRICE} once) unlock the source of all ${templates} Next.js templates and the premium blocks.`,
    alternates: { canonical: "/pricing" },
  }),
  title: { absolute: "Pricing — Nexus UI" },
};

type Plan = {
  name: string;
  price: string;
  term: string;
  pitch: string;
  features: string[];
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    term: "free forever",
    pitch: "Every component, free to use anywhere.",
    features: [
      `All ${components} components with full source`,
      `${freeBlocks} of the ${blocks} section blocks`,
      `Live previews of all ${templates} templates`,
      "Commercial and client projects",
      "Install with the shadcn CLI",
    ],
  },
  {
    name: "Pro",
    price: `$${PRO_PRICE}`,
    term: "for 12 months",
    pitch: "Every template and block for a year of building.",
    featured: true,
    features: [
      "Everything in Starter",
      `Full source of all ${templates} templates`,
      `All ${blocks} section blocks`,
      "Every update for 12 months",
      "Email support",
    ],
  },
  {
    name: "All-Access",
    price: `$${ALL_ACCESS_PRICE}`,
    term: "one payment",
    pitch: "Everything in Pro, and it never runs out.",
    features: [
      "Everything in Pro",
      "Lifetime access and updates",
      "Every future template",
      "Early access to new drops",
      "Priority support, 24 to 48 hours",
    ],
  },
];

type Cell = string | boolean;
const COMPARE: [string, Cell, Cell, Cell][] = [
  ["Animated components", `All ${components}`, `All ${components}`, `All ${components}`],
  ["Section blocks", `${freeBlocks} free`, `All ${blocks}`, `All ${blocks}`],
  ["Template source", "Preview only", true, true],
  ["Commercial and client use", true, true, true],
  ["Updates", "Free items", "12 months", "Lifetime"],
  ["Future templates", false, "During your 12 months", true],
  ["Support", "Community", "Email", "Priority"],
];

const FAQ = [
  {
    q: "Are the components really free?",
    a: `Yes, all ${components} of them, with full source, for personal, commercial and client projects. Plans only unlock the template source and the premium blocks.`,
  },
  {
    q: "What's the difference between Pro and All-Access?",
    a: `Pro gives you everything for 12 months for $${PRO_PRICE}. All-Access is a single $${ALL_ACCESS_PRICE} payment that never ends and includes every template we release later.`,
  },
  {
    q: "What happens when Pro's 12 months end?",
    a: "You keep using what you built or started during your term. You can't download premium items or get updates until you renew.",
  },
  {
    q: "What if I only need one template?",
    a: `Buy it on its own for $${TEMPLATE_PRICE}, from that template's page.`,
  },
  {
    q: "Can I get a refund?",
    a: "All-Access: a full refund if you ask within 7 days. Pro and single templates: if something doesn't work as described, write within 7 days and we'll fix it or refund you.",
  },
  {
    q: "How do I get the code after paying?",
    a: "Sign in with the same email. Every template page gets a Download source button, and premium blocks install with the shadcn CLI.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Nexus UI",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${siteConfig.url}/pricing`,
    offers: [
      { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: String(PRO_PRICE), priceCurrency: "USD" },
      { "@type": "Offer", name: "All-Access", price: String(ALL_ACCESS_PRICE), priceCurrency: "USD" },
    ],
  },
];

function CompareCell({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto size-5 text-[#34c759]" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/60" aria-label="Not included" />;
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}

      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-14 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px] text-center">
          <h1 className="pg-display mx-auto max-w-[900px] text-[clamp(48px,8vw,84px)] text-foreground">
            Free to start.
            <br />
            Pay once for <RainbowWord>everything</RainbowWord>.
          </h1>
          <p className="mx-auto mt-6 max-w-[580px] text-[19px] leading-[1.55] text-muted-foreground">
            Every component is free. A plan unlocks the source of all {templates} templates and the premium blocks.
          </p>
        </div>
      </section>

      <section aria-label="Plans" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={cn("pg-float relative flex flex-col rounded-tile p-7", p.featured ? "bg-tint-butter" : "bg-card")}
              >
                {p.featured ? (
                  <span className="absolute right-6 top-6 rounded-full bg-foreground px-3 py-1 text-[12px] font-semibold text-background">
                    Recommended
                  </span>
                ) : null}
                <h2 className="text-[17px] font-semibold text-foreground">{p.name}</h2>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[48px] font-bold leading-none tracking-[-0.04em] text-foreground">{p.price}</span>
                  <span className="text-[15px] text-muted-foreground">{p.term}</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">{p.pitch}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[15px] text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#34c759]" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  {p.name === "Starter" ? (
                    <PillLink href="/components" variant="white" className="w-full">
                      Browse free components
                    </PillLink>
                  ) : p.name === "Pro" ? (
                    <CheckoutButton plan="annual">Get Pro</CheckoutButton>
                  ) : (
                    <CheckoutButton plan="lifetime" variant="cta">
                      Get All-Access
                    </CheckoutButton>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-[15px] text-muted-foreground">
            Need just one template? Single templates are ${TEMPLATE_PRICE}.{" "}
            <Link href="/templates" className="font-semibold text-foreground underline underline-offset-4">
              Browse templates
            </Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="compare" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="compare" className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">
            Compare the plans
          </h2>
          <div className="pg-float mt-8 overflow-x-auto rounded-tile bg-card">
            <table className="w-full min-w-[640px] text-[15px]">
              <thead>
                <tr className="border-b border-border/70 text-left">
                  <th scope="col" className="px-6 py-4 font-medium text-muted-foreground">
                    What you get
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.name} scope="col" className="w-[22%] px-6 py-4 text-center font-semibold text-foreground">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, ...cells]) => (
                  <tr key={label} className="border-b border-border/50 last:border-0">
                    <th scope="row" className="px-6 py-4 text-left font-medium text-foreground">
                      {label}
                    </th>
                    {cells.map((c, i) => (
                      <td key={i} className="px-6 py-4 text-center text-body">
                        <CompareCell value={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:pb-28">
        <div className="mx-auto grid max-w-[1152px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Before you buy</h2>
            <p className="mt-4 text-[18px] text-muted-foreground">
              Something else?{" "}
              <Link href="/contact" className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                Write to us
              </Link>
              . The details are in the{" "}
              <Link href="/terms" className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                terms
              </Link>
              .
            </p>
          </div>
          <div className="border-t border-border">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold tracking-[-0.3px] text-foreground [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
                </summary>
                <p className="max-w-[620px] pb-5 text-[15.5px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-[1152px] overflow-hidden rounded-tile bg-[linear-gradient(to_right_bottom,var(--tint-peach),var(--tint-violet)_50%,var(--tint-sky))] px-6 py-24 text-center sm:py-28">
          <h2 className="pg-display mx-auto max-w-[720px] text-[clamp(40px,7vw,64px)] leading-[1.02] text-foreground">
            Start with the component you need today.
          </h2>
          <div className="mt-9">
            <PillLink href="/components" variant="cta" className="h-14 px-8 text-[16px]">
              Browse components
            </PillLink>
          </div>
        </div>
      </section>
    </>
  );
}
