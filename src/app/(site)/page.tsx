import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus } from "lucide-react";
import { HeroStickers } from "@/components/home/hero-stickers";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { Band, InstallCard, PillLink, RainbowWord, StatRow } from "@/components/site";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { homeGalleryItems } from "@/lib/catalog/gallery-items";
import { templates } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({ alternates: { canonical: "/" } }),
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
};

const WALL_SLUGS = ["noir-studio", "helix-ai-platform", "launchfolio-portfolio", "ocean-flow", "aether-portfolio", "nexus-ai-launch"];

const FAQ = [
  {
    q: "Are the components really free?",
    a: `Yes. All ${CATALOG_COUNTS.components} components are free, with their full source. Pro adds the full source of every template and a licence for client work.`,
  },
  {
    q: "Do they work with the Next.js App Router?",
    a: "Yes. They're written for the App Router, with client directives only where the motion needs them.",
  },
  {
    q: "Can I change them?",
    a: "Yes. The JSX, Tailwind classes and animation timings land in your repo, so you can edit anything.",
  },
  {
    q: "Do they follow light and dark mode?",
    a: "Yes. They use theme tokens, so they follow your site's theme.",
  },
];

const STEPS = [
  { title: "Find it", body: "Search by name, or filter the gallery by how a component moves." },
  { title: "Tweak it", body: "Change speed, colour and size in the playground and watch it update." },
  { title: "Add it", body: "One shadcn command drops the source into your project. It's yours to edit." },
];

export default function Home() {
  const items = homeGalleryItems();
  const wall = WALL_SLUGS.map((slug) => templates.find((t) => t.slug === slug)).filter(
    (t): t is (typeof templates)[number] => !!t?.previewImages?.hero,
  );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteConfig.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/nexus-ui-logo.png`, width: 192, height: 192 },
      ...(siteConfig.socialProfiles.length > 0 ? { sameAs: siteConfig.socialProfiles } : {}),
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "contact@nexus-ui.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero: tucked under the floating nav so the dot grid runs behind it */}
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-20 pt-[148px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <HeroStickers />
        <p className="absolute right-6 top-[84px] z-20 hidden text-[13px] font-medium text-muted-foreground lg:block">
          Psst. Try throwing a sticker.
        </p>
        <div className="relative z-20 mx-auto max-w-[980px] text-center">
          <p className="pg-glass inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground">
            <span className="size-2 rounded-full bg-rainbow-green" aria-hidden />
            {CATALOG_COUNTS.components} animated components, free to start
          </p>
          <h1 className="pg-display mt-7 text-[clamp(52px,11vw,124px)] text-foreground">
            <span className="block">Make your</span>
            <RainbowWord className="block">landing page</RainbowWord>
            <span className="block">move.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[560px] text-[18px] leading-[1.55] text-muted-foreground">
            Copy-paste React components with real motion: inputs, docks, card decks, backgrounds and 3D. Built on
            Tailwind, Motion and the shadcn CLI.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PillLink href="/components">Browse components</PillLink>
            <PillLink href="#gallery" variant="white" className="pl-2.5">
              <span className="grid size-6 place-items-center rounded-full bg-foreground text-background" aria-hidden>
                <Play className="size-3 fill-current" />
              </span>
              See it move
            </PillLink>
          </div>
          <InstallCard command="npx shadcn@latest add @nexus-labs/gooey-input" className="mx-auto mt-6 max-w-[520px]" />
        </div>
      </section>

      <section id="gallery" aria-label="Components by interaction" className="scroll-mt-20 px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <ComponentGallery
            items={items}
            limit={13}
            mobileLimit={8}
            aside={
              <Link
                href="/components"
                className="shrink-0 text-[14px] font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground"
              >
                Browse all {CATALOG_COUNTS.components} components
              </Link>
            }
          />
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <StatRow
            items={[
              { value: CATALOG_COUNTS.components, label: "components, all free" },
              { value: CATALOG_COUNTS.templates, label: "full-page templates" },
              { value: CATALOG_COUNTS.blocks, label: "section blocks" },
              { value: "1", label: "command to install" },
            ]}
          />
        </div>
      </section>

      {/* Templates */}
      <Band tint="butter" id="templates">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Made with Nexus UI</h2>
            <p className="mt-4 max-w-[480px] text-[18px] text-muted-foreground">
              {CATALOG_COUNTS.templates} complete landing pages built from these components. Open any of them live; the
              source comes with Pro.
            </p>
          </div>
          <PillLink href="/templates" variant="white" className="shrink-0 self-start md:self-auto">
            See all {CATALOG_COUNTS.templates} templates
          </PillLink>
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wall.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/templates/${t.slug}`}
                className="pg-float group block overflow-hidden rounded-[20px] bg-card transition-transform duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <div className="flex gap-1.5 border-b border-border px-3 py-2.5" aria-hidden>
                  <span className="size-2 rounded-full bg-[#ff605c]" />
                  <span className="size-2 rounded-full bg-[#ffbd44]" />
                  <span className="size-2 rounded-full bg-[#00ca4e]" />
                </div>
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <Image
                    src={t.previewImages!.hero}
                    alt={`${t.title.split(" — ")[0]} template`}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <p className="truncate text-[15px] font-semibold tracking-[-0.2px] text-foreground">{t.title.split(" — ")[0]}</p>
                  <p className="shrink-0 text-[13px] text-muted-foreground">{t.category}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Band>

      {/* Steps: a real sequence, so they're numbered */}
      <section className="px-4 py-24 sm:py-28">
        <div className="mx-auto max-w-[1152px]">
          <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">From the gallery to your repo</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-foreground pt-5">
                <p className="pg-display text-[40px] text-foreground">{i + 1}</p>
                <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.4px] text-foreground">{s.title}</h3>
                <p className="mt-1 text-[15px] text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 sm:pb-28">
        <div className="mx-auto grid max-w-[1152px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Before you start</h2>
            <p className="mt-4 text-[18px] text-muted-foreground">
              Something else?{" "}
              <Link href="/contact" className="text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
                Write to us
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

      {/* Closing */}
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
