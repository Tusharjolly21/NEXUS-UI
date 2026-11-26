import "@/components/home-cinematic/cinematic.css";
import { ClosingHorizon } from "@/components/home-cinematic/closing-horizon";
import { Faq } from "@/components/home-cinematic/faq";
import { CinematicHero } from "@/components/home-cinematic/hero";
import { PricingStage } from "@/components/home-cinematic/pricing-stage";
import { RepoStory } from "@/components/home-cinematic/repo-story";
import { ShelfBento } from "@/components/home-cinematic/shelf-bento";
import { LiveWall } from "@/components/home-cinematic/live-wall";
import { Numbers } from "@/components/home-cinematic/numbers";
import { TemplateRows, type TemplateShot } from "@/components/home-cinematic/template-rows";
import { HeroInstall } from "@/components/home/hero-install";
import { RedditLove } from "@/components/home/reddit-love";
import { ShippingLog } from "@/components/home/shipping-log";
import { StackStrip } from "@/components/home/stack-strip";
import { IfPro } from "@/components/pro/pro-access";
import { PillLink } from "@/components/site";
import type { LibraryIndexData } from "@/components/site/library-index";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { homeCategories, homeDrops, homeStoryItems, homeWallItems } from "@/lib/catalog/home-data";
import { templates } from "@/lib/catalog/templates";
import { getVideo } from "@/lib/catalog/videos";
import { legalConfig } from "@/lib/legal";
import { GLOBAL_PRICING, type DisplayPricing } from "@/lib/pricing";
import { siteConfig } from "@/lib/seo";
import { SOUNDS } from "@/lib/ui-sounds";

const HOME_VIDEOS = ["launch-reel", "feature-drop", "brand-film", "whats-new"];

// Dark and light alternate along the template rows so they read as a mix, not a single look.
const WALL_SLUGS = ["kiosk", "wharf", "plotline", "kiln", "cairn", "strata"];

function buildFaq(pricing: DisplayPricing) {
  return [
    {
      q: "Are the components free?",
      a: `${CATALOG_COUNTS.freeComponents} of the ${CATALOG_COUNTS.components} are free, with their full source. Pro unlocks the other ${CATALOG_COUNTS.proComponents}, the full source of every template and the premium blocks.`,
    },
    {
      q: "What does Pro cost?",
      a: `${pricing.pro} a year, or ${pricing.allAccess} once for lifetime access. Both unlock the same things: every Pro component, the source of every template, the premium blocks and everything we release next.`,
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
}

/**
 * The homepage, for the prices it is given. It reads no request data, so a static copy of it can be built once
 * and cached (src/app/(static)); the regular route (src/app/(site)/page.tsx) hands it the visitor's own prices.
 */
export function HomeContent({ pricing }: { pricing: DisplayPricing }) {
  const faq = buildFaq(pricing);
  const wall = homeWallItems(16);
  // The template rows: the hand-picked wall first, then more finished sites to fill both rows.
  const withHero = templates.filter((t) => t.previewImages?.hero);
  const rowTemplates = [
    ...WALL_SLUGS.map((slug) => withHero.find((t) => t.slug === slug)).filter((t): t is (typeof templates)[number] => !!t),
    ...withHero.filter((t) => !WALL_SLUGS.includes(t.slug)),
  ].slice(0, 14);
  const inRows = new Set(rowTemplates.map((t) => t.slug));

  // The library index: real counts, the busiest categories, a page's worth of block types, and
  // templates that aren't already in the rows above it.
  const libraryIndex: LibraryIndexData = {
    components: {
      total: CATALOG_COUNTS.components,
      free: CATALOG_COUNTS.freeComponents,
      categories: homeCategories(),
    },
    blocks: {
      total: CATALOG_COUNTS.blockCategories,
      sections: CATALOG_COUNTS.blocks,
      items: [
        { slug: "block-navigation", label: "Navigation" },
        { slug: "block-hero", label: "Hero" },
        { slug: "block-features", label: "Features" },
        { slug: "block-dashboard", label: "Dashboards" },
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
        .filter((t) => t.previewImages?.hero && !inRows.has(t.slug))
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
      mainEntity: buildFaq(GLOBAL_PRICING).map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
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
  ];

  const shots: TemplateShot[] = rowTemplates.map((t) => ({ slug: t.slug, title: t.title.split(" — ")[0], image: t.previewImages!.hero, category: t.category }));
  const half = Math.ceil(shots.length / 2);

  return (
    <div className="cx">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <CinematicHero pricing={pricing} />

      <LiveWall items={wall} total={CATALOG_COUNTS.components} />

      {/* Everything below sits in one framed column: a hairline between sections, rails down the sides */}
      <div className="relative">
        <div aria-hidden className="cx-page-rails" />

      <Numbers
        figures={[
          { value: CATALOG_COUNTS.components, label: "Animated components", href: "/components", icon: "components", note: `${CATALOG_COUNTS.freeComponents} free with source` },
          { value: CATALOG_COUNTS.blocks, label: "Blocks", href: "/blocks", icon: "blocks", note: `Across ${CATALOG_COUNTS.blockCategories} categories` },
          { value: CATALOG_COUNTS.templates, label: "Full-site templates", href: "/templates", icon: "templates", note: "Open any one live" },
          { value: CATALOG_COUNTS.icons, label: "Icons that move", href: "/icons", icon: "icons", note: `${CATALOG_COUNTS.freeIcons} free` },
          { value: CATALOG_COUNTS.videos, label: "Product videos", href: "/videos", icon: "videos", note: "With soundtracks" },
        ]}
      />


      <TemplateRows rows={[shots.slice(0, half), shots.slice(half)]} total={CATALOG_COUNTS.templates} />

      <RepoStory items={homeStoryItems()} />

      {/* Everything else in the library */}
      <ShelfBento data={libraryIndex}>
        <StackStrip />
      </ShelfBento>

      <section id="love" className="cx-section px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-[1152px]">
          <RedditLove />
        </div>
      </section>

      <section id="new" className="cx-section px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-[1152px]">
          <ShippingLog drops={homeDrops()} />
        </div>
      </section>

      <PricingStage pricing={pricing} />

      <Faq items={faq} />

      {/* Closing: a lit horizon rises under the last call to action */}
      <ClosingHorizon>
        <h2 className="pg-display text-[clamp(44px,8vw,96px)] leading-[0.98] text-foreground">
          Start with the component you need today.
        </h2>
        <p className="mx-auto mt-6 max-w-[480px] text-[18px] leading-[1.55] text-muted-foreground">
          <IfPro
            pro={`All ${CATALOG_COUNTS.components} components, every template and every block are yours.`}
            otherwise={`${CATALOG_COUNTS.freeComponents} are free, with full source. Pro unlocks the rest, from ${pricing.pro} a year.`}
          />
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PillLink href="/components">Browse components</PillLink>
          <IfPro
            pro={
              <PillLink href="/dashboard" variant="white">
                Open your dashboard
              </PillLink>
            }
            otherwise={
              <PillLink href="/pricing" variant="white" plansSource="closing">
                See plans
              </PillLink>
            }
          />
        </div>
        <HeroInstall className="mx-auto mt-8 max-w-[520px]" />
      </ClosingHorizon>
      </div>
    </div>
  );
}
