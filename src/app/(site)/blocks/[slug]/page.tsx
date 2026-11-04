import { TypingSoundPanel } from "@/components/site/typing-sound-panel";
import { notFound } from "next/navigation";
import { PreviewShield } from "@/components/pro/preview-shield";
import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import { MOTION_KIT_SECTIONS } from "@/components/blocks/motion-kit/sections";
import { GuideClose, GuideCode, GuideToggle, InstallRow } from "./_install";
import { sessionHasPro } from "@/lib/component-access";
import path from "node:path";
import { ArrowUpRight, ChevronRight, File, Folder } from "lucide-react";
import { getBlock, blocks, type BlockManifestEntry } from "@/lib/catalog/blocks";
import { InteractiveDotsHeroCustomizer } from "@/components/library/interactive-dots-hero-customizer";
import { LayeredWaveHeroCustomizer } from "@/components/library/layered-wave-hero-customizer";
import { ParticleNoiseHeroCustomizer } from "@/components/library/particle-noise-hero-customizer";
import { BentoHeroCustomizer } from "@/components/library/bento-hero-customizer";
import { BentoGridSkeletonHeroCustomizer } from "@/components/library/bento-grid-skeleton-hero-customizer";
import { MotionLayerScrollerHeroCustomizer } from "@/components/library/motion-layer-scroller-hero-customizer";
import { BentoShowcaseHeroCustomizer } from "@/components/library/bento-showcase-hero-customizer";
import { WhyChooseUsBentoHeroCustomizer } from "@/components/library/why-choose-us-bento-hero-customizer";
import { AtsBentoGridHeroCustomizer } from "@/components/library/ats-bento-grid-hero-customizer";
import { SpotlightBentoGridCustomizer } from "@/components/library/spotlight-bento-grid-customizer";
import {
  ChatFaqSection,
  FaqFolderCard,
  SearchableFaqSection,
} from "@/components/blocks/faq-folder-card";
import {
  CenteredContactForm,
  GlobalSignalContact,
  GradientProofContact,
  ImageStoryContact,
} from "@/components/blocks/contact-page";
import {
  BlogContentCentered,
  BlogContentEditorial,
  BlogHeaderFeaturedPosts,
  BlogHoverImageCardShowcase,
  BlogContentWithToc,
} from "@/components/blocks/blog-content-sections";
import {
  AdvancedPricingColumns,
  PricingPlanGrid,
  RadioPlanPricing,
  SpotlightPricingCards,
} from "@/components/blocks/pricing-section";
import { PayAndConfirm, TipAndRate, VerifyPayment } from "@/components/blocks/checkout-moments";
import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";
import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";
import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";
import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";
import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";
import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";
import LogoCloudShelf from "@/components/blocks/logo-clouds/logo-cloud-shelf";
import { createMetadata, shortDescription, siteConfig } from "@/lib/seo";
import { COMPONENT_SEO } from "@/lib/catalog/component-seo";
import { getMovedSection } from "@/lib/catalog/moved-sections";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import {
  API_KEY_ENV_VAR,
  REGISTRIES_PRO,
  envLocalLine,
  installCommand as shadcnAddCommand,
  registryAddCommand,
} from "@/lib/registry-config";
import { InstallCard, RainbowWord } from "@/components/site";
import { motionKitSectionsOf, variantAnchor, variantsOf } from "@/lib/catalog/block-variants";
import {
  AuroraWavyLinesDemo,
  BlurFadeInDemo,
  CheckoutStage,
  FlippingWordsDemo,
  TextGenerateTypewriterDemo,
  TypewriterEffectDemo,
} from "@/registry/blocks/block-variants";
import { BlockSection } from "./_section";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) return {};
  return createMetadata(
    {
      title: `${block.name} — Next.js UI Block`,
      description: shortDescription(block.description),
      openGraph: { title: `${block.name} · ${siteConfig.siteName}` },
      alternates: { canonical: `/blocks/${slug}` },
    },
    { title: block.name, pro: !!block.premium },
  );
}

export default async function BlockDetailPage({ params }: Props) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: block.name,
    description: block.description,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Next.js",
    url: `${siteConfig.url}/blocks/${slug}`,
    isAccessibleForFree: !block.premium,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blocks", item: `${siteConfig.url}/blocks` },
      { "@type": "ListItem", position: 3, name: block.name, item: `${siteConfig.url}/blocks/${slug}` },
    ],
  };
  // Decided on the server: locked sections get no source or usage code at all (see PreviewCodeSection).
  const isPremium = await sessionHasPro();
  const locked = block.premium && !isPremium;
  // Motion Kit sections carry their own tier (most are Pro, even inside a free block; a few that
  // came over from the components library are free). Locked ones get no source at all.
  const mkSections = motionKitSectionsOf(block.slug);
  const sectionLocked = (v: { premium?: boolean }) => v.premium !== false && !isPremium;
  const mkCode = new Map(
    await Promise.all(
      mkSections
        .filter((v) => !sectionLocked(v))
        .map(async (v) => [v.id, await readSourceFile(v.source ?? "", "")] as const),
    ),
  );
  const installDetails = getBlockInstallDetails(block.slug, block.registryCliName ?? block.slug);

  const Preview = block.Preview;
  const sections = variantsOf(block.slug);
  const [titleLead, ...titleWords] = block.name.split(" ");
  const titleRest = titleWords.join(" ");
  const installCommand = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${installDetails.registryName}`;
  const code = await getBlockCode(block.slug, block.reactSource);
  const isInteractiveBackgroundCard = block.slug === "block-interactive-dots";
  const isAnimatedBentoCard = block.slug === "block-animated-bento";
  const isBentoSkeletonCard = block.slug === "block-bento-skeleton";
  const isMotionLayerScrollerCard = block.slug === "block-motion-layer-scroller";
  const isBentoShowcaseCard = block.slug === "block-bento-showcase";
  const isWhyChooseUsCard = block.slug === "block-why-choose-us";
  const isFaqFolderCard = block.slug === "block-faq-folder-card";
  const isContactPageCard = block.slug === "block-contact-page";
  const isTextAnimationsCard = block.slug === "block-text-animations";
  const isBlogContentSectionsCard = block.slug === "block-blog-content-sections";
  const isPricingSectionCard = block.slug === "block-pricing-section";
  const isSidebarCard = block.slug === "block-sidebar";
  const isLogoCloudCard = block.slug === "block-logo-clouds";
  const isCheckoutMomentsCard = block.slug === "block-checkout-moments";
  const layeredWaveCode = isInteractiveBackgroundCard
    ? await readSourceFile("src/components/layered-wave-background/layered-wave-background.tsx", "")
    : "";
  const particleNoiseCode = isInteractiveBackgroundCard
    ? await readSourceFile("src/components/particle-noise/particle-noise.tsx", "")
    : "";
  const wavyLinesCode = isInteractiveBackgroundCard
    ? await readSourceFile("src/components/wavy-lines/wavy-lines.tsx", "")
    : "";
  const atsBentoCode = isWhyChooseUsCard
    ? await readSourceFile("src/components/blocks/ats-bento-grid.tsx", "")
    : "";
  const spotlightCode = isWhyChooseUsCard
    ? await readSourceFile("src/components/blocks/spotlight-bento-grid.tsx", "")
    : "";
  const collapsibleSidebarCode = isSidebarCard
    ? await readSourceFile("src/components/blocks/sidebar/collapsible-sidebar.tsx", "")
    : "";
  const groupedSidebarCode = isSidebarCard
    ? await readSourceFile("src/components/blocks/sidebar/grouped-sidebar.tsx", "")
    : "";
  const logoBlurCode = isLogoCloudCard
    ? await readSourceFile("src/components/blocks/logo-clouds/logo-cloud-blur.tsx", "")
    : "";
  const logoMarqueeCode = isLogoCloudCard
    ? await readSourceFile("src/components/blocks/logo-clouds/logo-cloud-marquee.tsx", "")
    : "";
  const logoSpotlightCode = isLogoCloudCard
    ? await readSourceFile("src/components/blocks/logo-clouds/logo-cloud-spotlight.tsx", "")
    : "";
  const logoSwapCode = isLogoCloudCard
    ? await readSourceFile("src/components/blocks/logo-clouds/logo-cloud-swap.tsx", "")
    : "";
  const logoSingleRowCode = isLogoCloudCard
    ? await readSourceFile("src/components/blocks/logo-clouds/logo-cloud-single-row.tsx", "")
    : "";
  const logoShelfCode = isLogoCloudCard
    ? await readSourceFile("src/components/blocks/logo-clouds/logo-cloud-shelf.tsx", "")
    : "";
  const typewriterEffectCode = isTextAnimationsCard
    ? await readSourceFile("src/components/blocks/text-animations/text-animation-typewriter-effect.tsx", "")
    : "";
  const blurFadeInCode = isTextAnimationsCard
    ? await readSourceFile("src/components/blocks/text-animations/text-animation-blur-fade-in.tsx", "")
    : "";
  const textGenerateCode = isTextAnimationsCard
    ? await readSourceFile("src/components/blocks/text-animations/text-generate-typewriter.tsx", "")
    : "";
  const blogContentWithTocCode = isBlogContentSectionsCard
    ? await readSourceFile("src/components/blocks/blog-content-sections/blog-content-with-toc.tsx", "")
    : "";
  const blogContentEditorialCode = isBlogContentSectionsCard
    ? await readSourceFile("src/components/blocks/blog-content-sections/blog-content-editorial.tsx", "")
    : "";
  const blogHeaderFeaturedPostsCode = isBlogContentSectionsCard
    ? await readSourceFile("src/components/blocks/blog-content-sections/blog-header-featured-posts.tsx", "")
    : "";
  const blogHoverImageCardCode = isBlogContentSectionsCard
    ? await readSourceFile("src/components/blocks/blog-content-sections/blog-hover-image-card.tsx", "")
    : "";
  const verifyPaymentCode = isCheckoutMomentsCard
    ? await readSourceFile("src/components/blocks/checkout-moments/verify-payment.tsx", "")
    : "";
  const tipAndRateCode = isCheckoutMomentsCard
    ? await readSourceFile("src/components/blocks/checkout-moments/tip-and-rate.tsx", "")
    : "";
  const billingPricingVariantsCode = isPricingSectionCard
    ? await readSourceFile("src/components/blocks/pricing-section/billing-pricing-variants.tsx", "")
    : "";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[128px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <Link href="/blocks" className="rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Blocks
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link
              href={`/blocks?block=${block.slug}`}
              className="rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {block.category}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span aria-current="page" className="font-medium text-foreground">
              {block.name}
            </span>
          </nav>
          <h1 className="pg-display mt-6 text-[clamp(44px,8vw,76px)] text-foreground">
            <RainbowWord>{titleLead}</RainbowWord>
            {titleRest ? ` ${titleRest}` : null}
            <span className="sr-only"> — UI Block</span>
          </h1>
          <p className="mt-5 max-w-[680px] text-[19px] leading-[1.55] text-muted-foreground">{block.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="About this block">
            <li
              className={
                block.premium
                  ? "rounded-full bg-[#1d1d1f] px-3 py-1 text-[13px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                  : "rounded-full bg-[#34c759]/12 px-3 py-1 text-[13px] font-semibold text-[#248a3d] dark:text-[#30d158]"
              }
            >
              {block.premium ? "Pro" : "Free"}
            </li>
            <li className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground">{block.category}</li>
            <li className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground">
              {sections.length || block.variants.length} {(sections.length || block.variants.length) === 1 ? "section" : "sections"}
            </li>
          </ul>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1184px] px-4 pb-24">
        <InstallRow
          nav={
            <nav aria-label="Sections in this block" className="flex flex-col rounded-[28px] bg-card p-6 shadow-[0_0_0_0.5px_var(--border)]">
              <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-foreground">In this block</h2>
              <p className="mt-1 text-[14px] text-muted-foreground">Jump to a section. Each one has its own preview and code.</p>
              <ol className="mb-6 mt-4 grid gap-1 sm:grid-cols-2">
                {sections.map((v, i) => (
                  <li key={v.id}>
                    <a
                      href={`#${variantAnchor(v.title)}`}
                      className="group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] text-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground/[0.07] text-[12px] font-semibold tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{v.title}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </a>
                  </li>
                ))}
              </ol>
              <ul className="mt-auto flex flex-wrap gap-2 border-t border-border pt-5 text-[13px] text-muted-foreground" aria-label="Every section comes with">
                {["Live preview", "Customize", "Code", "Build prompt"].map((t) => (
                  <li key={t} className="rounded-full bg-foreground/[0.05] px-3 py-1">
                    {t}
                  </li>
                ))}
              </ul>
            </nav>
          }
          install={
            <aside id="install" aria-label="Install" className="scroll-mt-28 rounded-[28px] bg-card p-6 shadow-[0_0_0_0.5px_var(--border)]">
              <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-foreground">Install</h2>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {locked
                  ? "One command adds every section. Pro blocks need your API key in the registry settings."
                  : "One command adds every section and its dependencies."}
                {installDetails.standalone.length || (!block.premium && mkSections.some((v) => v.premium !== false))
                  ? " Some sections install on their own, with the command shown in each one's code."
                  : ""}
              </p>
              <InstallCard wrap command={installCommand} className="mt-4" />
              <GuideToggle />
            </aside>
          }
          guide={<BlockInstallation block={block} details={installDetails} />}
        />

        <div className="mt-20 space-y-24">
      {isInteractiveBackgroundCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Interactive Dots" code={code} locked={locked}>
            <InteractiveDotsHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Layered Wave Background"
            code={layeredWaveCode}
            usageCode={LAYERED_WAVE_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LayeredWaveHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Particle Noise"
            code={particleNoiseCode}
            usageCode={PARTICLE_NOISE_USAGE}
            className="mt-16"
            locked={locked}
          >
            <ParticleNoiseHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Aurora Wavy Lines"
            code={wavyLinesCode}
            usageCode={WAVY_LINES_USAGE}
            className="mt-16"
            locked={locked}
          >
            <AuroraWavyLinesDemo />
          </PreviewCodeSection>
        </>
      ) : isAnimatedBentoCard ? (
        <PreviewCodeSection block={block.slug} title={block.name} code={code} locked={locked}>
          <BentoHeroCustomizer />
        </PreviewCodeSection>
      ) : isBentoSkeletonCard ? (
        <PreviewCodeSection block={block.slug} title={block.name} code={code} locked={locked}>
          <BentoGridSkeletonHeroCustomizer />
        </PreviewCodeSection>
      ) : isMotionLayerScrollerCard ? (
        <PreviewCodeSection block={block.slug} title={block.name} code={code} locked={locked}>
          <MotionLayerScrollerHeroCustomizer />
        </PreviewCodeSection>
      ) : isBentoShowcaseCard ? (
        <PreviewCodeSection block={block.slug} title={block.name} code={code} locked={locked}>
          <BentoShowcaseHeroCustomizer />
        </PreviewCodeSection>
      ) : isWhyChooseUsCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Mentorship Bento" code={code} locked={locked}>
            <WhyChooseUsBentoHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="ATS Bento Grid"
            code={atsBentoCode}
            usageCode={ATS_BENTO_USAGE}
            locked={locked}
            className="mt-16"
          >
            <AtsBentoGridHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Spotlight Bento Grid"
            code={spotlightCode}
            usageCode={SPOTLIGHT_BENTO_USAGE}
            locked={locked}
            className="mt-16"
          >
            <SpotlightBentoGridCustomizer />
          </PreviewCodeSection>
        </>
      ) : isFaqFolderCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Questions & Answers FAQ" code={code} locked={locked}>
            <FaqFolderCard />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Searchable FAQ"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <SearchableFaqSection />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Chat FAQ"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <ChatFaqSection />
          </PreviewCodeSection>
        </>
      ) : isContactPageCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Global Signal Contact" code={code} locked={locked}>
            <GlobalSignalContact />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Centered Intake Contact"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <CenteredContactForm />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Gradient Proof Contact"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <GradientProofContact />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Image Story Contact"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <ImageStoryContact />
          </PreviewCodeSection>
        </>
      ) : isTextAnimationsCard ? (
        <TypingSoundPanel>
          <PreviewCodeSection block={block.slug} title="Typewriter Heading" code={code} usageCode={TYPEWRITER_HEADING_USAGE} locked={locked}>
            <FlippingWordsDemo />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Text Animation Typewriter Effect"
            code={typewriterEffectCode}
            usageCode={TYPEWRITER_EFFECT_USAGE}
            className="mt-16"
            locked={locked}
          >
            <TypewriterEffectDemo />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Text Animation Blur Fade In"
            code={blurFadeInCode}
            usageCode={BLUR_FADE_IN_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlurFadeInDemo />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Text Generate Typewriter"
            code={textGenerateCode}
            usageCode={TEXT_GENERATE_TYPEWRITER_USAGE}
            className="mt-16"
            locked={locked}
          >
            <TextGenerateTypewriterDemo />
          </PreviewCodeSection>
        </TypingSoundPanel>
      ) : isBlogContentSectionsCard ? (
        <>
          <PreviewCodeSection
            block={block.slug}
            title="Blog Content Centered"
            code={code}
            usageCode={BLOG_CONTENT_CENTERED_USAGE}
            locked={locked}
          >
            <BlogContentCentered />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Blog Content With TOC"
            code={blogContentWithTocCode}
            usageCode={BLOG_CONTENT_WITH_TOC_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogContentWithToc />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Blog Content Editorial"
            code={blogContentEditorialCode}
            usageCode={BLOG_CONTENT_EDITORIAL_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogContentEditorial />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Blog Header Featured Posts"
            code={blogHeaderFeaturedPostsCode}
            usageCode={BLOG_HEADER_FEATURED_POSTS_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogHeaderFeaturedPosts />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Blog Hover Image Card"
            code={blogHoverImageCardCode}
            usageCode={BLOG_HOVER_IMAGE_CARD_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogHoverImageCardShowcase />
          </PreviewCodeSection>
        </>
      ) : isPricingSectionCard ? (
        <>
          <PreviewCodeSection
            block={block.slug}
            title="Radio Plan Selector"
            code={code}
            usageCode={RADIO_PLAN_PRICING_USAGE}
            locked={locked}
          >
            <RadioPlanPricing />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Four Tier Billing Switch"
            code={billingPricingVariantsCode}
            usageCode={PRICING_PLAN_GRID_USAGE}
            className="mt-16"
            locked={locked}
          >
            <PricingPlanGrid />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Advanced Pricing Columns"
            code={billingPricingVariantsCode}
            usageCode={ADVANCED_PRICING_COLUMNS_USAGE}
            className="mt-16"
            locked={locked}
          >
            <AdvancedPricingColumns />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Spotlight Pricing Cards"
            code={billingPricingVariantsCode}
            usageCode={SPOTLIGHT_PRICING_CARDS_USAGE}
            className="mt-16"
            locked={locked}
          >
            <SpotlightPricingCards />
          </PreviewCodeSection>
        </>
      ) : isSidebarCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Simple Sidebar with Hover" code={code} locked={locked}>
            <SimpleSidebar />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Collapsible Sidebar"
            code={collapsibleSidebarCode}
            usageCode={COLLAPSIBLE_SIDEBAR_USAGE}
            className="mt-16"
            locked={locked}
          >
            <CollapsibleSidebar />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Grouped Sidebar"
            code={groupedSidebarCode}
            usageCode={GROUPED_SIDEBAR_USAGE}
            className="mt-16"
            locked={locked}
          >
            <GroupedSidebar />
          </PreviewCodeSection>
        </>
      ) : isLogoCloudCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Blur Flip Grid" code={code} locked={locked}>
            <LogosBlurFlip />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Blur Hover Reveal"
            code={logoBlurCode}
            usageCode={LOGO_BLUR_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudBlur autoplay />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Infinite Marquee"
            code={logoMarqueeCode}
            usageCode={LOGO_MARQUEE_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudMarquee />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Cursor Spotlight"
            code={logoSpotlightCode}
            usageCode={LOGO_SPOTLIGHT_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudSpotlight autoplay />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Swap Animation"
            code={logoSwapCode}
            usageCode={LOGO_SWAP_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudSwap />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Single Row Lift"
            code={logoSingleRowCode}
            usageCode={LOGO_SINGLE_ROW_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudSingleRow />
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Logo Shelf"
            code={logoShelfCode}
            usageCode={LOGO_SHELF_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudShelf />
          </PreviewCodeSection>
        </>
      ) : isCheckoutMomentsCard ? (
        <>
          <PreviewCodeSection block={block.slug} title="Pay & Confirm" code={code} usageCode={CHECKOUT_PAY_USAGE} locked={locked}>
            <CheckoutStage>
              <PayAndConfirm />
            </CheckoutStage>
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Verify Payment"
            code={verifyPaymentCode}
            usageCode={CHECKOUT_VERIFY_USAGE}
            className="mt-16"
            locked={locked}
          >
            <CheckoutStage>
              <VerifyPayment hint="Demo code: 424242" />
            </CheckoutStage>
          </PreviewCodeSection>
          <PreviewCodeSection
            block={block.slug}
            title="Tip & Rate"
            code={tipAndRateCode}
            usageCode={CHECKOUT_TIP_USAGE}
            className="mt-16"
            locked={locked}
          >
            <CheckoutStage>
              <TipAndRate />
            </CheckoutStage>
          </PreviewCodeSection>
        </>
) : mkSections.length ? null : (
        <PreviewCodeSection block={block.slug} title={block.name} code={code} locked={locked}>
          <Preview />
        </PreviewCodeSection>
      )}

      {mkSections.map((v) => {
        const Section = MOTION_KIT_SECTIONS[v.id];
        if (!Section) return null;
        return (
          <PreviewCodeSection
            key={v.id}
            block={block.slug}
            title={v.title}
            code={mkCode.get(v.id) ?? ""}
            usageCode={v.usage ? movedUsage(v.registryCliName ?? "", v.usage) : motionKitUsage(v.registryCliName ?? "", v.component ?? "Section")}
            locked={sectionLocked(v)}
            pro={v.premium !== false}
          >
            <Section autoplay />
          </PreviewCodeSection>
        );
      })}

        </div>

        <section aria-label="More blocks" className="mt-24 border-t border-border pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-foreground">More blocks</h2>
            <Link href="/blocks" className="text-[15px] text-link hover:underline hover:underline-offset-4">
              See the whole wall ›
            </Link>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {blocks
              .filter((b) => b.slug !== block.slug)
              .map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/blocks/${b.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-[20px] bg-card px-5 py-4 shadow-[0_0_0_0.5px_var(--border)] transition-shadow hover:shadow-[0_0_0_0.5px_var(--border),0_14px_30px_-18px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[16px] font-semibold tracking-[-0.01em] text-foreground">{b.name}</span>
                      <span className="block text-[13px] text-muted-foreground">
                        {variantsOf(b.slug).length || b.variants.length} sections · {b.premium ? "Pro" : "Free"}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </>
  );
}





type BlockInstallDetails = {
  registryName: string;
  files: string[];
  notes: string[];
  /** Sections on this block that aren't in its package (they install on their own). */
  standalone: string[];
};

const BLOCK_INSTALL_FILES: Record<string, string[]> = {
  "block-checkout-moments": [
    "components/blocks/checkout-moments/index.ts",
    "components/blocks/checkout-moments/moment-card.tsx",
    "components/blocks/checkout-moments/pay-and-confirm.tsx",
    "components/blocks/checkout-moments/tip-and-rate.tsx",
    "components/blocks/checkout-moments/verify-payment.tsx",
    "components/one-time-code/one-time-code.tsx",
    "components/slide-to-confirm/slide-to-confirm.tsx",
    "components/tick-slider/tick-slider.tsx",
    "components/toast-stack/toast-stack.tsx",
  ],
  "block-pricing-section": [
    "components/blocks/pricing-section/billing-pricing-variants.tsx",
    "components/blocks/pricing-section/index.ts",
    "components/blocks/pricing-section/radio-plan-pricing.tsx",
  ],
  "block-text-animations": [
    "components/blocks/text-animations/index.tsx",
    "components/blocks/text-animations/text-animation-blur-fade-in.tsx",
    "components/blocks/text-animations/text-animation-flipping-words.tsx",
    "components/blocks/text-animations/text-animation-typewriter-effect.tsx",
    "components/blocks/text-animations/text-generate-typewriter.tsx",
    "components/blocks/text-animations/typewriter-heading.tsx",
  ],
  "block-logo-clouds": [
    "components/blocks/logo-clouds/logo-cloud-blur.tsx",
    "components/blocks/logo-clouds/logo-cloud-marquee.tsx",
    "components/blocks/logo-clouds/logo-cloud-shelf.tsx",
    "components/blocks/logo-clouds/logo-cloud-single-row.tsx",
    "components/blocks/logo-clouds/logo-cloud-spotlight.tsx",
    "components/blocks/logo-clouds/logo-cloud-swap.tsx",
    "components/blocks/logo-clouds/logos-blur-flip.tsx",
    "components/blocks/logo-clouds/logos.tsx",
  ],
  "block-interactive-dots": [
    "components/interactive-dots/index.ts",
    "components/interactive-dots/interactive-dots.tsx",
    "components/layered-wave-background/index.ts",
    "components/layered-wave-background/layered-wave-background.tsx",
    "components/particle-noise/index.ts",
    "components/particle-noise/particle-noise.tsx",
    "components/wavy-lines/index.ts",
    "components/wavy-lines/wavy-lines.tsx",
  ],
  "block-why-choose-us": [
    "components/blocks/animated-bento-grid.tsx",
    "components/blocks/ats-bento-grid.tsx",
    "components/blocks/spotlight-bento-grid.tsx",
  ],
  "block-faq-folder-card": ["components/blocks/faq-folder-card.tsx"],
  "block-sidebar": [
    "components/blocks/sidebar/collapsible-sidebar.tsx",
    "components/blocks/sidebar/grouped-sidebar.tsx",
    "components/blocks/sidebar/simple-sidebar.tsx",
  ],
  "block-contact-page": [
    "components/blocks/contact-page.tsx",
  ],
  "block-blog-content-sections": [
    "components/blocks/blog-content-sections/blog-content-centered.tsx",
    "components/blocks/blog-content-sections/blog-content-editorial.tsx",
    "components/blocks/blog-content-sections/blog-content-with-toc.tsx",
    "components/blocks/blog-content-sections/blog-header-featured-posts.tsx",
    "components/blocks/blog-content-sections/blog-hover-image-card.tsx",
    "components/blocks/blog-content-sections/index.tsx",
  ],
};

const BLOCK_INSTALL_NOTES: Partial<Record<string, string[]>> = {
  "block-checkout-moments": [
    "The sections ship with demo handlers (a timed fake charge, and 424242 as the right code). Pass onPay, verify and onSubmit to wire them to your payment provider.",
  ],
  "block-text-animations": [
    "Typewriter Heading and Text Animation Typewriter Effect play a key click for every character, from the shared typing sound (lib/typing-sound.ts, installed with them); Text Generate Typewriter is silent. Put sound.ogg and sprite-config.json in public/sounds for the recorded clicks; without them a short synthesised click plays. Visitors switch it with one typing-sound switch, and each component takes muted or enableSound to stay silent.",
  ],
  "block-why-choose-us": [
    "SpotlightBentoGrid renders Unsplash images with next/image. Add images.unsplash.com to images.remotePatterns in next.config.mjs before using that variant.",
  ],
  "block-contact-page": [
    "The forms simulate a successful send out of the box. Pass an async onSubmit(values) to any contact variant to post to your own API or form service; throw or return { error } to show a message.",
  ],
};

function getBlockInstallDetails(slug: string, registryName: string): BlockInstallDetails {
  const mk = motionKitSectionsOf(slug);
  // Sections that came over from the components library install on their own, so they aren't in the
  // block's package (unless the block is made only of them, like Footers).
  const own = mk.filter((v) => !v.usage);
  const packaged = own.length ? own : mk;
  return {
    registryName,
    files: BLOCK_INSTALL_FILES[slug] ?? packaged.map((v) => (v.source ?? "").replace(/^src\//, "")),
    notes: BLOCK_INSTALL_NOTES[slug] ?? [],
    standalone: own.length || BLOCK_INSTALL_FILES[slug] ? mk.filter((v) => v.usage).map((v) => v.title) : [],
  };
}

function listTitles(titles: string[]) {
  return titles.length < 2 ? titles.join("") : `${titles.slice(0, -1).join(", ")} and ${titles.at(-1)}`;
}

function BlockInstallation({
  block,
  details,
}: {
  block: BlockManifestEntry;
  details: BlockInstallDetails;
}) {
  const command = shadcnAddCommand(details.registryName);

  const stepCount = details.files.length > 0 ? 5 : 4;

  return (
    <div className="rounded-[28px] bg-card p-6 shadow-[0_0_0_0.5px_var(--border)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-foreground">Full setup guide</h2>
          <p className="mt-2 max-w-[640px] text-[15px] leading-6 text-muted-foreground">
            Add the whole <span className="font-medium text-foreground">{block.name}</span> block
            ({block.variants.length} {block.variants.length === 1 ? "section" : "sections"}) to a Next.js project in{" "}
            {stepCount} steps. The registry command brings the source files, the utilities they import and the npm
            packages they use.
          </p>
        </div>
        <GuideClose />
      </div>

      <ol className="mt-8 gap-4 lg:columns-2 [&>li]:mb-4 [&>li]:break-inside-avoid">
        <InstallationStep number="1" title="Prepare a shadcn project">
          <p>
            Use a Next.js project with Tailwind CSS and the <span className="font-mono text-foreground">@/</span> alias. In its
            root folder, run this once. It creates <span className="font-mono text-foreground">components.json</span> and the{" "}
            <span className="font-mono text-foreground">cn()</span> helper:
          </p>
          <GuideCode value="npx shadcn@latest init -d" />
          <p className="mt-3">
            Starting from nothing? The{" "}
            <Link href="/docs/installation" className="font-medium text-link hover:underline">
              Quick Start
            </Link>{" "}
            covers it.
          </p>
        </InstallationStep>

        <InstallationStep
          number="2"
          title={block.premium ? "Connect the registry with your API key" : "Connect the Nexus UI registry"}
        >
          {block.premium ? (
            <>
              <p>This is a Pro block, so the CLI has to send your API key. Do this once per project.</p>
              <ol className="mt-3 list-decimal space-y-3 pl-5 marker:font-semibold marker:text-foreground">
                <li>
                  Create a key at{" "}
                  <Link href="/dashboard/api-key" className="font-medium text-link hover:underline">
                    nexus-ui.com/dashboard/api-key
                  </Link>
                  . It starts with <span className="font-mono text-foreground">nxs_</span> and is shown only once.
                </li>
                <li>
                  Create a file named <span className="font-mono text-foreground">.env.local</span> in the project root, next to{" "}
                  <span className="font-mono text-foreground">package.json</span>, with your key:
                  <GuideCode value={envLocalLine()} label=".env.local" />
                </li>
                <li>
                  Add this entry to <span className="font-mono text-foreground">components.json</span>, inside the outermost braces. Leave{" "}
                  <span className="font-mono text-foreground">{"{name}"}</span> and{" "}
                  <span className="font-mono text-foreground">{"${" + API_KEY_ENV_VAR + "}"}</span> as written, the CLI fills them in:
                  <GuideCode value={REGISTRIES_PRO} label="components.json" />
                </li>
              </ol>
            </>
          ) : (
            <>
              <p>
                Run this once per project. It writes the Nexus UI entry into{" "}
                <span className="font-mono text-foreground">components.json</span> for you:
              </p>
              <GuideCode value={registryAddCommand()} />
              <p className="mt-3">
                Type it exactly as shown. <span className="font-mono text-foreground">{"{name}"}</span> is filled in by the CLI, so you
                never replace it.
              </p>
            </>
          )}
        </InstallationStep>

        <InstallationStep number="3" title="Install the block">
          <p>
            Run this from your project root.{" "}
            {details.standalone.length
              ? `It adds the block's own sections. ${listTitles(details.standalone)} ${details.standalone.length === 1 ? "installs on its own, with the command in its" : "install on their own, with the command in each one's"} Code tab.`
              : "It adds every section shown on this page."}
          </p>
          <GuideCode value={command} />
        </InstallationStep>

        {details.files.length > 0 && (
          <InstallationStep number="4" title="Files added to your project">
            <p>The package writes these source files:</p>
            <BlockFileTree files={details.files} />
          </InstallationStep>
        )}

        <InstallationStep number={String(stepCount)} title="Use it in a page">
          <p>
            Open the <span className="font-medium text-foreground">Code</span> tab on the section you want, copy its
            usage snippet and paste it into a page such as{" "}
            <span className="font-mono text-foreground">src/app/page.tsx</span>:
          </p>
          <GuideCode
            label="src/app/page.tsx"
            value={`import YourBlock from "@/components/...";\n\nexport default function Page() {\n  return (\n    <main>\n      <YourBlock />\n    </main>\n  );\n}`}
          />
          <p className="text-[13px]">Each section&apos;s Code tab shows its exact import path.</p>
        </InstallationStep>
      </ol>

      {details.notes.length > 0 && (
        <div className="mt-4 rounded-[20px] bg-[#ff9500]/10 p-5 text-[14px]">
          <p className="font-semibold text-foreground">Required setup for this block</p>
          <ul className="mt-3 space-y-2 leading-6 text-muted-foreground">
            {details.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-[#c76d00] dark:text-[#ff9f0a]" aria-hidden>•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InstallationStep({
  number,
  title,
  className,
  children,
}: {
  number: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li className={`min-w-0 rounded-[22px] bg-foreground/[0.025] p-5 text-[14px] text-muted-foreground ring-1 ring-foreground/[0.05] dark:bg-white/[0.03] ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-[12px] font-semibold tabular-nums text-background">
          {number}
        </span>
        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
      </div>
      <div className="mt-3 space-y-2 leading-6">{children}</div>
    </li>
  );
}

function BlockFileTree({ files }: { files: string[] }) {
  const rows: Array<{ depth: number; label: string; type: "folder" | "file" }> = [];
  let previousFolders: string[] = [];

  for (const file of [...files].sort()) {
    const parts = file.split("/");
    const folders = parts.slice(0, -1);

    folders.forEach((folder, index) => {
      if (folder !== previousFolders[index]) {
        rows.push({ depth: index, label: folder, type: "folder" });
      }
    });
    rows.push({ depth: folders.length, label: parts.at(-1) ?? file, type: "file" });
    previousFolders = folders;
  }

  return (
    <div className="mt-3 rounded-[14px] bg-foreground/[0.04] p-4 font-mono text-xs text-foreground">
      {rows.map((row, index) => (
        <div
          key={`${row.type}-${row.label}-${index}`}
          className="flex items-center gap-2 py-0.5"
          style={{ paddingLeft: `${row.depth * 16}px` }}
        >
          {row.type === "folder" ? (
            <Folder className="size-3.5 shrink-0 text-[#0071e3] dark:text-[#2997ff]" />
          ) : (
            <File className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span>{row.label}{row.type === "folder" ? "/" : ""}</span>
        </div>
      ))}
    </div>
  );
}

async function getBlockCode(slug: string, fallback: string) {
  const sourceBySlug: Record<string, string> = {
    "block-interactive-dots": "src/components/interactive-dots/interactive-dots.tsx",
    "block-why-choose-us": "src/components/blocks/animated-bento-grid.tsx",
    "block-faq-folder-card": "src/components/blocks/faq-folder-card.tsx",
    "block-contact-page": "src/components/blocks/contact-page.tsx",
    "block-text-animations": "src/components/blocks/text-animations/typewriter-heading.tsx",
    "block-blog-content-sections": "src/components/blocks/blog-content-sections/blog-content-centered.tsx",
    "block-pricing-section": "src/components/blocks/pricing-section/radio-plan-pricing.tsx",
    "block-sidebar": "src/components/blocks/sidebar/simple-sidebar.tsx",
    "block-logo-clouds": "src/components/blocks/logo-clouds/logos-blur-flip.tsx",
    "block-checkout-moments": "src/components/blocks/checkout-moments/pay-and-confirm.tsx",
  };

  const sourcePath = sourceBySlug[slug];
  if (!sourcePath) return fallback;

  return readSourceFile(sourcePath, fallback);
}

async function readSourceFile(sourcePath: string, fallback: string) {
  try {
    const filePath = path.join(process.cwd(), sourcePath);
    return await readFile(filePath, "utf8");
  } catch {
    return fallback;
  }
}

/** One section of the page, numbered and anchored to match its tile on the blocks wall. */
function PreviewCodeSection({
  block,
  title,
  code,
  usageCode,
  children,
  locked = false,
  pro = false,
}: {
  block: string;
  title: string;
  code: string;
  usageCode?: string;
  className?: string;
  children: React.ReactNode;
  locked?: boolean;
  pro?: boolean;
}) {
  const sections = variantsOf(block);
  const at = sections.findIndex((v) => v.title === title);
  const variant = at === -1 ? undefined : sections[at];
  const entry = getBlock(block);
  const registryName = variant?.registryCliName ?? entry?.registryCliName ?? block;
  // Never serialise source or usage of a locked section into the page: the client only gets "".
  return (
    <BlockSection
      id={variantAnchor(title)}
      index={at === -1 ? 1 : at + 1}
      total={Math.max(1, sections.length)}
      title={title}
      description={variant ? movedDescription(variant.id) : undefined}
      code={locked ? "" : code}
      usageCode={locked ? "" : (usageCode ?? defaultUsageForTitle(title))}
      locked={locked}
      pro={pro}
      block={block}
      sectionId={variant?.id}
      installCommand={locked ? undefined : `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryName}`}
    >
      <PreviewShield active={locked} className="w-full">
        {children}
      </PreviewShield>
    </BlockSection>
  );
}

/**
 * For a section moved over from the components library, the text its old page used in search results
 * (falling back to its catalogue description), so the block page keeps the wording that page ranked for.
 * Other sections return nothing, whatever their id.
 */
function movedDescription(id: string): string | undefined {
  const slug = id.replace(/^mk-/, "");
  const moved = getMovedSection(slug);
  if (!moved) return undefined;
  return COMPONENT_SEO[slug]?.description ?? moved.description;
}

function movedUsage(registryName: string, usage: string) {
  return `// npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryName}
${usage}`;
}

function motionKitUsage(registryName: string, component: string) {
  return `// npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryName}
import { ${component} } from "@/components/blocks/motion-kit/${registryName}";

export default function Section() {
  return <${component} />;
}`;
}

function defaultUsageForTitle(title: string) {
  if (title === "Interactive Dots") return INTERACTIVE_DOTS_USAGE;
  if (title === "Animated Bento Grid") return BENTO_USAGE;
  if (title === "Bento Grid With Skeleton Previews") return BENTO_SKELETON_USAGE;
  if (title === "Motion Layer Scroller") return MOTION_LAYER_SCROLLER_USAGE;
  if (title === "Bento Showcase Grid") return BENTO_SHOWCASE_USAGE;
  if (title === "Why Choose Us Bento Grid") return WHY_CHOOSE_US_USAGE;
  if (title === "ATS Bento Grid") return ATS_BENTO_USAGE;
  if (title === "Spotlight Bento Grid") return SPOTLIGHT_BENTO_USAGE;
  if (title === "Aurora Wavy Lines") return WAVY_LINES_USAGE;
  if (title.includes("Contact")) return CONTACT_PAGE_USAGE;
  if (title === "Typewriter Heading") return TYPEWRITER_HEADING_USAGE;
  if (title === "Text Animation Typewriter Effect") return TYPEWRITER_EFFECT_USAGE;
  if (title === "Text Animation Blur Fade In") return BLUR_FADE_IN_USAGE;
  if (title === "Text Generate Typewriter") return TEXT_GENERATE_TYPEWRITER_USAGE;
  if (title === "Blog Content Centered") return BLOG_CONTENT_CENTERED_USAGE;
  if (title === "Blog Content With TOC") return BLOG_CONTENT_WITH_TOC_USAGE;
  if (title === "Blog Content Editorial") return BLOG_CONTENT_EDITORIAL_USAGE;
  if (title === "Blog Header Featured Posts") return BLOG_HEADER_FEATURED_POSTS_USAGE;
  if (title === "Blog Hover Image Card") return BLOG_HOVER_IMAGE_CARD_USAGE;
  if (title === "Radio Plan Selector") return RADIO_PLAN_PRICING_USAGE;
  if (title === "Four Tier Billing Switch") return PRICING_PLAN_GRID_USAGE;
  if (title === "Advanced Pricing Columns") return ADVANCED_PRICING_COLUMNS_USAGE;
  if (title === "Spotlight Pricing Cards") return SPOTLIGHT_PRICING_CARDS_USAGE;
  if (title === "Simple Sidebar with Hover") return `import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";\n\nexport default function Page() {\n  return <SimpleSidebar />;\n}`;
  if (title === "Collapsible Sidebar") return COLLAPSIBLE_SIDEBAR_USAGE;
  if (title === "Grouped Sidebar") return GROUPED_SIDEBAR_USAGE;
  if (title === "Blur Flip Grid") return `import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";\n\nexport default function Page() {\n  return <LogosBlurFlip />;\n}`;
  if (title === "Blur Hover Reveal") return LOGO_BLUR_USAGE;
  if (title === "Infinite Marquee") return LOGO_MARQUEE_USAGE;
  if (title === "Cursor Spotlight") return LOGO_SPOTLIGHT_USAGE;
  if (title === "Swap Animation") return LOGO_SWAP_USAGE;
  if (title === "Single Row Lift") return LOGO_SINGLE_ROW_USAGE;
  if (title === "Logo Shelf") return LOGO_SHELF_USAGE;
  return `<${title.replaceAll(" ", "")} />`;
}

const INTERACTIVE_DOTS_USAGE = `<section className="relative min-h-[640px] overflow-hidden">
  <InteractiveDots
    mode="lines"
    dotSize={2.4}
    dotSpacing={30}
    dotColor="rgba(148, 163, 184, 0.58)"
    activeDotColor="rgba(125, 211, 252, 0.95)"
    lineColor="rgba(125, 211, 252, 0.72)"
    backgroundColor="#05070d"
    interactionRadius={130}
    repulsionStrength={48}
    lineDistance={72}
    lineOpacity={0.34}
    className="absolute inset-0 h-full"
  />

  <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col justify-center px-6">
    <h1 className="text-5xl font-semibold text-white">Your hero headline</h1>
    <p className="mt-4 max-w-xl text-white/70">Your supporting copy goes here.</p>
  </div>
</section>`;

const WAVY_LINES_USAGE = `<section className="relative min-h-[640px] overflow-hidden rounded-3xl bg-[#031412]">
  <WavyLines
    lineColor="#5eead4"
    backgroundColorStart="#031413"
    backgroundColorEnd="#123c2d"
    speed={1.35}
    radius={24}
    className="absolute inset-0 h-full w-full"
  />

  <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col justify-center px-6">
    <p className="text-sm uppercase tracking-[0.24em] text-teal-100/55">WebGL motion</p>
    <h1 className="mt-4 max-w-2xl text-5xl font-semibold text-white">Aurora lines for immersive sections</h1>
    <p className="mt-4 max-w-xl text-teal-50/65">Animated shader waves with a cooler emerald palette and smooth flowing depth.</p>
  </div>
</section>`;

const BENTO_USAGE = `<AnimatedBentoGrid
  items={[
    { id: "1", label: "Latency", value: "42ms", span: "1x1" },
    { id: "2", label: "Uptime", value: "99.99%", span: "2x1", trend: { value: 0.1, label: "vs last month" } },
    { id: "3", label: "Signals", value: "1.2M", span: "1x1" },
    { id: "4", label: "Edge", value: "12 regions", span: "1x1", trend: { value: 20, label: "new" } },
  ]}
  variant="default"
  columns={3}
/>`;

const BENTO_SKELETON_USAGE = `<BentoGridSkeleton
  cards={[
    { id: "1", title: "Ready-made sections", description: "Production-ready blocks.", tag: "Pages", span: "2x1", skeletonType: "chat" },
    { id: "2", title: "Interactive components", description: "Hooks and controls.", tag: "UI", span: "1x1", skeletonType: "dashboard" },
    { id: "3", title: "Copy-paste blocks", description: "Drop-in snippets.", tag: "DX", span: "1x1", skeletonType: "avatar" },
    { id: "4", title: "Premium animations", description: "Framer Motion layouts.", tag: "Motion", span: "1x1", skeletonType: "workflow" },
    { id: "5", title: "Responsive design", description: "Adapts to every viewport.", tag: "Mobile", span: "1x1", skeletonType: "calendar" },
    { id: "6", title: "Clean structure", description: "Typed and tree-shakeable.", tag: "Dev", span: "1x1", skeletonType: "code" },
  ]}
/>`;

const MOTION_LAYER_SCROLLER_USAGE = `<MotionLayerScroller
  heading="Motion that moves people"
  description="A scroll-driven 3D layered hero section with parallax depth."
  scrollHeight={600}
  perspective={1200}
  direction="vertical"
  showGrid={true}
  showGlow={true}
  layers={[
    { id: "bg", xRange: [-30, 30], yRange: [-20, 20], scaleRange: [0.92, 1.04], zIndex: 0 },
    { id: "main", xRange: [-50, 50], yRange: [-40, 40], scaleRange: [0.95, 1.08], zIndex: 1 },
  ]}
/>`;

const BENTO_SHOWCASE_USAGE = `<BentoShowcase />`;

const WHY_CHOOSE_US_USAGE = `import WhyChooseUsBento from "@/components/blocks/animated-bento-grid";

export default function Page() {
  return <WhyChooseUsBento />;
}`;

const ATS_BENTO_USAGE = `import { AtsBentoGrid } from "@/components/blocks/ats-bento-grid";

export default function Page() {
  return (
    <AtsBentoGrid
      title="The perfect ATS score platform"
      description="Upload resumes, track candidates, and schedule interviews from one clean bento dashboard."
    />
  );
}`;

const SPOTLIGHT_BENTO_USAGE = `import SpotlightBentoGrid from "@/components/blocks/spotlight-bento-grid";

export default function Page() {
  return <SpotlightBentoGrid />;
}`;

const CONTACT_PAGE_USAGE = `import {
  CenteredContactForm,
  GlobalSignalContact,
  GradientProofContact,
  ImageStoryContact,
} from "@/components/blocks/contact-page";

export default function ContactPage() {
  return (
    <main className="space-y-10 bg-background p-4 sm:p-8">
      <GlobalSignalContact />
      <CenteredContactForm />
      <GradientProofContact />
      <ImageStoryContact />
    </main>
  );
}`;

const TYPEWRITER_HEADING_USAGE = `import { TypewriterHeading } from "@/components/blocks/text-animations";

export default function Hero() {
  return (
    <TypewriterHeading
      text="Built with Next.js"
      description="Create stunning animations that bring your website to life. Elevate your user experience with smooth transitions and eye-catching effects that captivate visitors and keep them engaged."
    />
  );
}`;

const TYPEWRITER_EFFECT_USAGE = `import { TextAnimationTypewriterEffect } from "@/components/blocks/text-animations";

export default function HeroCopy() {
  return (
    <TextAnimationTypewriterEffect
      texts={["Launch a sharper hero.", "Write less styling.", "Ship faster."]}
      loop
      showCursor
    />
  );
}`;

const BLUR_FADE_IN_USAGE = `import { TextAnimationBlurFadeIn } from "@/components/blocks/text-animations";

export default function SectionIntro() {
  return (
    <TextAnimationBlurFadeIn
      text="Reusable motion primitives for headings, paragraphs, and product storytelling."
      by="word"
      once={false}
      repeat
      stagger={0.035}
    />
  );
}`;

const TEXT_GENERATE_TYPEWRITER_USAGE = `import { TextGenerateTypewriter } from "@/components/blocks/text-animations";

export default function AiDraft() {
  return (
      <TextGenerateTypewriter
        text="Nexus-ui is generating a production-ready landing section."
      startOnView
      typingSpeed={22}
    />
  );
}`;

const BLOG_CONTENT_CENTERED_USAGE = `import { BlogContentCentered } from "@/components/blocks/blog-content-sections";

export default function PostPage() {
  return (
    <BlogContentCentered
      title="The Future of Artificial Intelligence"
      author="Ava Sterling"
      date="February 14, 2026"
    />
  );
}`;

const BLOG_CONTENT_WITH_TOC_USAGE = `import { BlogContentWithToc } from "@/components/blocks/blog-content-sections";

export default function PostPage() {
  return <BlogContentWithToc />;
}`;

const BLOG_CONTENT_EDITORIAL_USAGE = `import { BlogContentEditorial } from "@/components/blocks/blog-content-sections";

export default function EditorialPost() {
  return <BlogContentEditorial />;
}`;

const BLOG_HEADER_FEATURED_POSTS_USAGE = `import { BlogHeaderFeaturedPosts } from "@/components/blocks/blog-content-sections";

export default function BlogIndex() {
  return (
    <BlogHeaderFeaturedPosts
      eyebrow="Our blog"
      title="Resources and insights"
      description="The latest industry notes, interviews, technologies, and resources for modern product teams."
    />
  );
}`;

const BLOG_HOVER_IMAGE_CARD_USAGE = `import { BlogHoverImageCard } from "@/components/blocks/blog-content-sections";

export default function BlogCardExample() {
  return (
    <BlogHoverImageCard
      author="Noah Williams"
      title="Designing launch pages with reusable UI systems"
      tag="Design Systems"
      date="23 May '26"
    />
  );
}`;

const RADIO_PLAN_PRICING_USAGE = `import { RadioPlanPricing } from "@/components/blocks/pricing-section";

export default function PricingSection() {
  return (
    <RadioPlanPricing
      theme="ivory"
      plans={[
        { id: "monthly", label: "Monthly", subtitle: "Flexible billing", price: 10.59, period: "/mo", includedFeatureCount: 5 },
        { id: "yearly", label: "Yearly", subtitle: "Best value", price: 8.59, period: "/mo", badge: "Best Value", includedFeatureCount: 7 },
        { id: "lifetime", label: "Lifetime", subtitle: "One time purchase", price: 90.59, period: "one-time", includedFeatureCount: 8 },
      ]}
      features={["AI advisor full time", "Unlimited auto tracking", "Priority customer support", "Enhanced security"]}
    />
  );
}`;

const PRICING_PLAN_GRID_USAGE = `import { PricingPlanGrid } from "@/components/blocks/pricing-section";

export default function PricingSection() {
  return <PricingPlanGrid />;
}`;

const ADVANCED_PRICING_COLUMNS_USAGE = `import { AdvancedPricingColumns } from "@/components/blocks/pricing-section";

export default function PricingSection() {
  return <AdvancedPricingColumns />;
}`;

const SPOTLIGHT_PRICING_CARDS_USAGE = `import { SpotlightPricingCards } from "@/components/blocks/pricing-section";

export default function PricingSection() {
  return <SpotlightPricingCards />;
}`;

const LAYERED_WAVE_USAGE = `<section className="relative min-h-[640px] overflow-hidden">
  <LayeredWaveBackground
    gradientColors={["#7c3aed", "#06b6d4", "#ec4899"]}
    backgroundColor="#020617"
    waveLayers={5}
    waveWidth={1.25}
    waveHeight={1.08}
    blurIntensity={24}
    opacity={0.72}
    speed="medium"
    direction="left"
    className="absolute inset-0 h-full"
  />

  <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col justify-center px-6">
    <h1 className="text-5xl font-semibold text-white">Launch with motion</h1>
    <p className="mt-4 max-w-xl text-white/70">Use the waves behind your own hero content.</p>
  </div>
</section>`;

const PARTICLE_NOISE_USAGE = `<section className="relative min-h-[640px] overflow-hidden bg-black">
  <ParticleNoise
    positionX={0}
    positionY={0.45}
    zoom={0.9}
    spacing={18}
    inflation={58}
    particleSize={1.1}
    density={0.95}
    animationEnabled={true}
    speed="slow"
    backgroundColor="#000000"
    dotColor="#f8fafc"
    secondaryDotColor="#94a3b8"
    opacity={0.86}
    surfaceBias={0.82}
    gridJitter={0}
    className="absolute inset-0 h-full"
  />

  <div className="relative z-10 mx-auto flex min-h-[640px] max-w-5xl flex-col justify-center px-6">
    <h1 className="text-5xl font-semibold text-white">Generative hero section</h1>
    <p className="mt-4 max-w-xl text-white/70">Place your page content above the particle field.</p>
  </div>
</section>`;

const COLLAPSIBLE_SIDEBAR_USAGE = `import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";

export default function Page() {
  return <CollapsibleSidebar />;
}`;

const GROUPED_SIDEBAR_USAGE = `import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";

export default function Page() {
  return <GroupedSidebar />;
}`;

const LOGO_BLUR_USAGE = `import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";

export default function Page() {
  return <LogoCloudBlur />;
}`;

const LOGO_MARQUEE_USAGE = `import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";

export default function Page() {
  return <LogoCloudMarquee />;
}`;

const LOGO_SPOTLIGHT_USAGE = `import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";

export default function Page() {
  return <LogoCloudSpotlight />;
}`;

const LOGO_SWAP_USAGE = `import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";

export default function Page() {
  return <LogoCloudSwap />;
}`;

const LOGO_SHELF_USAGE = `import LogoCloudShelf from "@/components/blocks/logo-clouds/logo-cloud-shelf";

export default function Page() {
  return <LogoCloudShelf />;
}`;

const LOGO_SINGLE_ROW_USAGE = `import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";

export default function Page() {
  return <LogoCloudSingleRow />;
}`;

/** Centres a Checkout Moments card on the Playground page grey. */

const CHECKOUT_PAY_USAGE = `"use client";

import { PayAndConfirm } from "@/components/blocks/checkout-moments";

export default function Checkout() {
  return (
    <PayAndConfirm
      merchant="Studio Supply"
      product={{ name: "Ceramic Pour-Over Set", variant: "Sand · 2 cups", price: 6400 }}
      onPay={async (totalCents) => {
        await fetch("/api/pay", { method: "POST", body: JSON.stringify({ totalCents }) });
      }}
    />
  );
}`;

const CHECKOUT_VERIFY_USAGE = `"use client";

import { VerifyPayment } from "@/components/blocks/checkout-moments";

export default function Approve() {
  return (
    <VerifyPayment
      destination="•••• 42"
      amount={12840}
      verify={async (code) => {
        const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
        return res.ok;
      }}
      onApproved={() => window.location.assign("/thanks")}
    />
  );
}`;

const CHECKOUT_TIP_USAGE = `"use client";

import { TipAndRate } from "@/components/blocks/checkout-moments";

export default function Feedback() {
  return (
    <TipAndRate
      courier="Maya Chen"
      orderTotal={4200}
      onSubmit={async (feedback) => {
        await fetch("/api/feedback", { method: "POST", body: JSON.stringify(feedback) });
      }}
    />
  );
}`;
