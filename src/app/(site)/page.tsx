import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CodeDemo } from "@/components/home/code-demo";
import { HeroInstall } from "@/components/home/hero-install";
import { HeroSpotlight } from "@/components/home/hero-spotlight";
import { HeroStickers } from "@/components/home/hero-stickers";
import { HeroTutorial } from "@/components/home/hero-tutorial";
import { HeroWord } from "@/components/home/hero-word";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { RedditLove } from "@/components/home/reddit-love";
import { IfPro } from "@/components/pro/pro-access";
import { ShippingLog } from "@/components/home/shipping-log";
import { StackStrip } from "@/components/home/stack-strip";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { VideoCard } from "@/components/videos/video-card";
import { getVideo, videos } from "@/lib/catalog/videos";
import { Band, PillLink } from "@/components/site";
import { legalConfig } from "@/lib/legal";
import { LibraryIndex, type LibraryIndexData } from "@/components/site/library-index";
import { HomeIconStrip } from "@/components/nx-icons/home-strip";
import { blockVariants } from "@/lib/catalog/block-variants";
import { getCategoryComponents, getPopulatedCategories } from "@/lib/catalog/category-seo";
import { getComponentCategoryHref } from "@/lib/catalog/taxonomy";
import { SOUNDS } from "@/lib/ui-sounds";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { homeGalleryItems } from "@/lib/catalog/gallery-items";
import { templates } from "@/lib/catalog/templates";
import { PRICES, formatPrice } from "@/lib/pricing";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata(
    { title: { absolute: `${siteConfig.siteName} — ${siteConfig.tagline}` }, description: siteConfig.description, alternates: { canonical: "/" } },
    { title: "Animated React components, blocks and templates" },
  ),
};

const HOME_VIDEOS = ["launch-reel", "feature-drop", "brand-film", "whats-new"];

// Dark and light alternate across the grid so the wall reads as a mix, not a single look.
const WALL_SLUGS = ["kiln", "cairn", "strata", "wayfare", "afterglow", "side-b"];

const FAQ = [
  {
    q: "Are the components free?",
    a: `${CATALOG_COUNTS.freeComponents} of the ${CATALOG_COUNTS.components} are free, with their full source. Pro unlocks the other ${CATALOG_COUNTS.proComponents}, the full source of every template and the premium blocks.`,
  },
  {
    q: "What does Pro cost?",
    a: `${formatPrice(PRICES.pro)} a year, or ${formatPrice(PRICES.allAccess)} once for lifetime access. Both unlock the same things: every Pro component, the source of every template, the premium blocks and everything we release next.`,
  },
  {
    q: "Can I ask for a component?",
    a: "Yes. Pro and All-Access members can request components, blocks and templates from the contact page. The most-asked-for ones get built next.",
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

  // The library index: real counts, the busiest categories, a page's worth of block types, and
  // templates that aren't already on the wall further down.
  const libraryIndex: LibraryIndexData = {
    components: {
      total: CATALOG_COUNTS.components,
      free: CATALOG_COUNTS.freeComponents,
      categories: getPopulatedCategories()
        .map((c) => ({ slug: c.slug, label: c.label, count: getCategoryComponents(c.slug).length, href: getComponentCategoryHref(c.slug) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 16),
    },
    blocks: {
      total: CATALOG_COUNTS.blocks,
      sections: blockVariants.length,
      items: [
        { slug: "block-navigation", label: "Navigation" },
        { slug: "block-hero", label: "Hero" },
        { slug: "block-features", label: "Features" },
        { slug: "block-social-proof", label: "Social proof" },
        { slug: "block-pricing-section", label: "Pricing" },
        { slug: "block-faq-folder-card", label: "FAQ" },
        { slug: "block-newsletter", label: "Newsletter" },
        { slug: "block-changelog", label: "Changelog" },
        { slug: "block-404", label: "404 page" },
      ],
    },
    templates: {
      total: CATALOG_COUNTS.templates,
      items: templates
        .filter((t) => t.previewImages?.hero && !WALL_SLUGS.includes(t.slug))
        .slice(0, 3)
        .map((t) => ({ slug: t.slug, title: t.title.split(" — ")[0], image: t.previewImages!.hero })),
    },
    videos: {
      total: CATALOG_COUNTS.videos,
      items: HOME_VIDEOS.map((slug) => getVideo(slug)).filter((v): v is NonNullable<typeof v> => !!v).map((v) => ({ slug: v.slug, title: v.title, purpose: v.purpose })),
    },
    sounds: { total: Object.keys(SOUNDS).length },
    icons: { total: CATALOG_COUNTS.icons, free: CATALOG_COUNTS.freeIcons, categories: CATALOG_COUNTS.iconCategories },
  };
  const homeVideos = HOME_VIDEOS.map((slug) => getVideo(slug)).filter((v): v is NonNullable<typeof v> => !!v);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.siteName,
      alternateName: siteConfig.alternateNames,
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
      name: siteConfig.siteName,
      alternateName: siteConfig.alternateNames,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/nexus-ui-logo.png`, width: 192, height: 192 },
      ...(siteConfig.socialProfiles.length > 0 ? { sameAs: siteConfig.socialProfiles } : {}),
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: legalConfig.contactEmail },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.siteName,
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
        <HeroSpotlight />
        <HeroStickers />
        <p className="absolute right-6 top-[84px] z-20 hidden text-[13px] font-medium text-muted-foreground lg:block">
          Psst. Try throwing a sticker.
        </p>
        <div className="relative z-20 mx-auto max-w-[980px] text-center">
          <p className="pg-glass inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-rainbow-green opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-rainbow-green" />
            </span>
            {CATALOG_COUNTS.components} animated components, free to start
          </p>
          <h1 className="pg-display mt-7 text-[clamp(52px,11vw,124px)] text-foreground">
            <span className="block">Make your</span>
            <HeroWord className="block" />
            <span className="block">move.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[560px] text-[18px] leading-[1.55] text-muted-foreground">
            Copy-paste React components with real motion: inputs, docks, card decks, backgrounds and 3D. Built on
            Tailwind, Motion and the shadcn CLI.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PillLink href="/components">Browse components</PillLink>
            <HeroTutorial />
          </div>
          <HeroInstall className="mx-auto mt-6 max-w-[520px]" />
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
                className="shrink-0 text-[15px] text-link hover:underline hover:underline-offset-4"
              >
                Browse all {CATALOG_COUNTS.components} components ›
              </Link>
            }
          />
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <LibraryIndex data={libraryIndex} />
          <StackStrip />
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

      {/* Videos */}
      <Band tint="violet" id="videos">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Videos that move like the site</h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              {videos.length} product videos for launches, pricing, updates and app stores, each with its own soundtrack. Change the
              words, then render it for Reels, Shorts or YouTube.
            </p>
          </div>
          <PillLink href="/videos" variant="white" className="shrink-0 self-start md:self-auto">
            See all {videos.length} videos
          </PillLink>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {homeVideos.map((v) => (
            <li key={v.slug}>
              <VideoCard video={v} />
            </li>
          ))}
        </ul>
      </Band>

      {/* Icons */}
      <Band tint="sky" id="icons">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Icons that move, and make a sound</h2>
            <p className="mt-4 max-w-[560px] text-[18px] text-muted-foreground">
              {CATALOG_COUNTS.icons} animated icons for toolbars, players, carts and tab bars. Each tells a tiny story, has a sound scored to its animation, and
              is one file you copy. {CATALOG_COUNTS.freeIcons} are free; Pro unlocks the other {CATALOG_COUNTS.proIcons}.
            </p>
          </div>
          <PillLink href="/icons" variant="white" className="shrink-0 self-start md:self-auto">
            See all {CATALOG_COUNTS.icons} icons
          </PillLink>
        </div>
        <HomeIconStrip className="mt-12" />
        <p className="mt-6 text-[14.5px] text-muted-foreground">
          Want the sounds in your own app? Read the{" "}
          <Link href="/icons/sounds" className="text-foreground underline underline-offset-4">
            sound guide
          </Link>
          .
        </p>
      </Band>

      {/* Your code: a live component beside its source, then the three steps */}
      <section className="px-4 py-24 sm:py-28">
        <div className="mx-auto max-w-[1152px]">
          <div className="max-w-[640px]">
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">From the gallery to your repo</h2>
            <p className="mt-4 text-[18px] text-muted-foreground">
              No package to keep up to date. One command copies the source into your project, and from then on
              it&apos;s your code.
            </p>
          </div>
          <div className="mt-12">
            <CodeDemo />
          </div>
          <ol className="mt-14 grid gap-8 md:grid-cols-3">
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

      {/* What people say: real Reddit comments, looping */}
      <Band tint="sky" id="love">
        <RedditLove />
      </Band>

      {/* Release history and requests */}
      <Band tint="mint" id="new">
        <ShippingLog />
      </Band>

      {/* Plans */}
      <section className="px-4 py-24 sm:py-28">
        <div className="mx-auto max-w-[1152px]">
          <PricingTeaser />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 sm:pb-28">
        <div className="mx-auto grid max-w-[1152px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Before you start</h2>
            <p className="mt-4 text-[18px] text-muted-foreground">
              Something else?{" "}
              <Link href="/contact" className="text-link hover:underline hover:underline-offset-4">
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
        <div className="relative mx-auto max-w-[1152px] overflow-hidden rounded-tile bg-[#1d1d1f] px-6 py-24 text-center sm:py-28 dark:bg-card">
          <h2 className="pg-display mx-auto max-w-[720px] text-[clamp(40px,7vw,64px)] leading-[1.02] text-[#f5f5f7]">
            Start with the component you need today.
          </h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[17px] text-white/60">
            <IfPro
              pro={`All ${CATALOG_COUNTS.components} components, every template and every block are yours.`}
              otherwise={`${CATALOG_COUNTS.freeComponents} are free. Pro unlocks the rest, from ${formatPrice(PRICES.pro)} a year.`}
            />
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PillLink href="/components" variant="cta" className="h-14 px-8 text-[16px]">
              Browse components
            </PillLink>
            <IfPro
              pro={
                <PillLink
                  href="/dashboard"
                  variant="white"
                  className="h-14 bg-white/10 px-8 text-[16px] text-white shadow-none hover:bg-white/15"
                >
                  Open your dashboard
                </PillLink>
              }
              otherwise={
                <PillLink
                  href="/pricing"
                  variant="white"
                  className="h-14 bg-white/10 px-8 text-[16px] text-white shadow-none hover:bg-white/15"
                >
                  See plans
                </PillLink>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
