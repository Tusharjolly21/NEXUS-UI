import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { CommentDeck } from "@/components/pricing/comment-deck";
import { MembersRow } from "@/components/pricing/members-row";
import { PlanAction, PlanNotice, PlanTag } from "@/components/pricing/plan-action";
import { PillLink, RainbowWord } from "@/components/site";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { createMetadata, siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { PRICES, formatPrice } from "@/lib/pricing";

const { components, freeComponents, proComponents, templates, freeTemplates, blocks, videos, freeVideos, icons, freeIcons, proIcons } = CATALOG_COUNTS;
const freeBlocks = blocksManifest.filter((b) => !b.premium).length;

const PRO_PRICE = formatPrice(PRICES.pro);
const ALL_ACCESS_PRICE = formatPrice(PRICES.allAccess);

export const metadata: Metadata = {
  ...createMetadata({
    description: `${freeComponents} Nexus UI components are free. Pro (${PRO_PRICE} a year) and All-Access (${ALL_ACCESS_PRICE} once) unlock the ${proComponents} Pro components, the source of all ${templates} Next.js templates and the premium blocks.`,
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
    pitch: "The free components, free to use anywhere.",
    features: [
      `${freeComponents} components with full source`,
      `${freeBlocks} of the ${blocks} section blocks`,
      `${freeTemplates} full templates, plus a first look at all ${templates}`,
      `${freeVideos} of the ${videos} videos with their prompt and source`,
      `${freeIcons} animated icons, with their sounds`,
      "Commercial and client projects",
      "Install with the shadcn CLI",
    ],
  },
  {
    name: "Pro",
    price: PRO_PRICE,
    term: "per year",
    pitch: "Everything Nexus UI makes, renewed yearly.",
    featured: true,
    features: [
      "Everything in Starter",
      `All ${components} components, including ${proComponents} Pro`,
      `Full source of all ${templates} templates`,
      `All ${blocks} section blocks`,
      `All ${videos} videos: prompt, source, live editing and render script`,
      `All ${icons} animated icons: ${proIcons} more, with their sounds`,
      "Every new template, block and component as it ships",
      "Request components, blocks and templates",
      "Priority support, 24 to 48 hours",
      "Cancel anytime",
    ],
  },
  {
    name: "All-Access",
    price: ALL_ACCESS_PRICE,
    term: "one payment",
    pitch: "Exactly what Pro unlocks, paid once and yours for good.",
    features: [
      "Everything in Pro",
      "Every future release, for life",
      "Requests and priority support, for life",
      "One payment, never renews",
    ],
  },
];

type Cell = string | boolean;
const COMPARE: [string, Cell, Cell, Cell][] = [
  ["Animated components", `${freeComponents} free`, `All ${components}`, `All ${components}`],
  ["Section blocks", `${freeBlocks} free`, `All ${blocks}`, `All ${blocks}`],
  ["Template source", "Preview only", true, true],
  ["Videos", `${freeVideos} free`, `All ${videos}`, `All ${videos}`],
  ["Animated icons and sounds", `${freeIcons} free`, `All ${icons}`, `All ${icons}`],
  ["Commercial and client use", true, true, true],
  ["New templates, blocks and components", "Free items", true, true],
  ["Requests", false, true, true],
  ["Support", "Community", "Priority", "Priority"],
  ["Access", "Forever", "While subscribed", "Forever"],
  ["Billing", "Free", "Yearly, cancel anytime", "Once"],
];

const FAQ = [
  {
    q: "Are the components free?",
    a: `${freeComponents} of the ${components} are free, with full source, for personal, commercial and client projects. Pro unlocks the other ${proComponents}: you can preview every one of them, but their source, install and playground come with Pro, along with the template source and the premium blocks.`,
  },
  {
    q: "What's the difference between Pro and All-Access?",
    a: `Only how you pay. Both unlock every template, every block, everything we release next, requests and priority support. Pro is ${PRO_PRICE} a year and renews until you cancel. All-Access is ${ALL_ACCESS_PRICE} once and never expires.`,
  },
  {
    q: "What happens if I cancel Pro?",
    a: "You keep access until the end of the year you've paid for, and you keep using whatever you built. After that you can't download premium items or get updates unless you subscribe again.",
  },
  {
    q: "Can I buy a single template?",
    a: `Templates aren't sold one by one. ${freeTemplates} are free; Pro unlocks all ${templates}, plus everything we add later, for ${PRO_PRICE} a year, or ${ALL_ACCESS_PRICE} once for lifetime.`,
  },
  {
    q: "Can I request a component or template?",
    a: "Yes. Pro and All-Access members can send requests from the contact page. The most-asked-for ones get built next, and both plans get them as they ship.",
  },
  {
    q: "Can I upgrade from Pro to All-Access?",
    a: "Yes, any time. Buy All-Access, then cancel Pro from Billing or email us and we'll stop the renewal for you.",
  },
  {
    q: "Are taxes included in the price?",
    a: `No. ${PRO_PRICE} a year and ${ALL_ACCESS_PRICE} once are the prices before tax. Checkout adds GST, VAT or sales tax where your country requires it and shows the full total before you pay. Payments are handled by Dodo Payments, our merchant of record, who collect and remit the tax. In some countries you can pay in your local currency.`,
  },
  {
    q: "Can I get a refund?",
    a: "All-Access: a full refund if you ask within 7 days. Pro: if something doesn't work as described, write within 7 days and we'll fix it or refund you.",
  },
  {
    q: "What comes with a video?",
    a: `Every video plays in your browser with its own soundtrack. ${freeVideos} of the ${videos} come with everything: the build prompt, the React source, live editing of every word and colour, and a script that renders your edit to MP4. Pro unlocks the same for the rest.`,
  },
  {
    q: "Are the animated icons free?",
    a: `${freeIcons} of the ${icons} are free, with their sounds, for personal, commercial and client projects, with no sign-in. The other ${proIcons} are Pro: you can preview and play every one of them, but their code and sound come with Pro. The icon engine, the sound engine and the sound guide are free.`,
  },
  {
    q: "How do I get the code after paying?",
    a: "Sign in with the same email. Pro components show their code and playground right on their pages, every template page gets a Download source button, and Pro components and premium blocks install with the shadcn CLI using your API key.",
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
      { "@type": "Offer", name: "Pro", price: String(PRICES.pro), priceCurrency: "USD" },
      { "@type": "Offer", name: "All-Access", price: String(PRICES.allAccess), priceCurrency: "USD" },
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
            {freeComponents} components and {freeTemplates} templates are free. One plan unlocks every Pro component, all {templates} templates and every block.
          </p>
          <PlanNotice />
        </div>
      </section>

      <section aria-label="Plans" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={cn("pg-float relative flex flex-col rounded-tile p-7", p.featured ? "bg-card ring-2 ring-action" : "bg-card")}
              >
                {p.name !== "Starter" ? <PlanTag tier={p.name === "Pro" ? "pro" : "all-access"} featured={!!p.featured} /> : null}
                <h2 className="text-[17px] font-semibold text-foreground">{p.name}</h2>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[48px] font-semibold leading-none tracking-[-0.035em] text-foreground">{p.price}</span>
                  <span className="text-[15px] text-muted-foreground">{p.term}</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">{p.pitch}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[15px] text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-action" aria-hidden />
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
                    <PlanAction tier="pro">Get Pro</PlanAction>
                  ) : (
                    <PlanAction tier="all-access" variant="cta">
                      Get All-Access
                    </PlanAction>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[640px] text-center text-[14px] leading-[1.55] text-muted-foreground">
            Prices are in US dollars and don&apos;t include tax. GST, VAT or sales tax is added at checkout based on your country, so the total can be higher than the price shown. In some countries you can pay in your local currency.
          </p>
          <p className="mt-4 text-center text-[15px] text-muted-foreground">
            Need something we don&apos;t have yet? Both plans include requests.{" "}
            <Link href="/contact" className="text-link hover:underline hover:underline-offset-4">
              Request a component ›
            </Link>
          </p>
          <MembersRow />
        </div>
      </section>

      {/* What people say, as a pull quote and a deck of comments */}
      <section className="overflow-hidden px-4 pb-28">
        <div className="mx-auto max-w-[1152px]">
          <CommentDeck />
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
