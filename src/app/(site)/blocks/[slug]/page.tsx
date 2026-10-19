import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ChevronRight, Code2, Expand, File, Folder, Lock, Monitor } from "lucide-react";
import { getBlock, blocks, type BlockManifestEntry } from "@/lib/catalog/blocks";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block/code-block";
import { InteractiveDotsHeroCustomizer } from "@/components/library/interactive-dots-hero-customizer";
import { LayeredWaveHeroCustomizer } from "@/components/library/layered-wave-hero-customizer";
import { ParticleNoiseHeroCustomizer } from "@/components/library/particle-noise-hero-customizer";
import { WavyLines } from "@/components/wavy-lines";
import { BentoHeroCustomizer } from "@/components/library/bento-hero-customizer";
import { BentoGridSkeletonHeroCustomizer } from "@/components/library/bento-grid-skeleton-hero-customizer";
import { MotionLayerScrollerHeroCustomizer } from "@/components/library/motion-layer-scroller-hero-customizer";
import { BentoShowcaseHeroCustomizer } from "@/components/library/bento-showcase-hero-customizer";
import { WhyChooseUsBentoHeroCustomizer } from "@/components/library/why-choose-us-bento-hero-customizer";
import { AtsBentoGridHeroCustomizer } from "@/components/library/ats-bento-grid-hero-customizer";
import { SpotlightBentoGridCustomizer } from "@/components/library/spotlight-bento-grid-customizer";
import { UsageSnippet } from "@/components/library/usage-snippet";
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
  TextAnimationBlurFadeIn,
  TextAnimationTypewriterEffect,
  TextGenerateTypewriter,
  TypewriterHeading,
} from "@/components/blocks/text-animations";
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
import { createMetadata, siteConfig } from "@/lib/seo";
import { SHADCN_REGISTRY_SCOPE, shadcnRegistryUrl } from "@/lib/registry-scope";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) return {};
  return createMetadata({
    title: `${block.name} — Next.js UI Block`,
    description: block.description,
    openGraph: { title: `${block.name} · ${siteConfig.name}` },
    alternates: { canonical: `/blocks/${slug}` },
  });
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isPremium = user ? await hasPremiumAccess(user.id) : false;
  const locked = block.premium && !isPremium;
  const installDetails = getBlockInstallDetails(block.slug, block.registryCliName ?? block.slug);

  const Preview = block.Preview;
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
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[128px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <Link href="/blocks" className="hover:text-foreground">
              Blocks
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span aria-current="page" className="font-medium text-foreground">
              {block.name}
            </span>
          </nav>
          <h1 className="pg-display mt-6 text-[clamp(44px,8vw,76px)] text-foreground">
            {block.name}
            <span className="sr-only"> — UI Block</span>
          </h1>
          <p className="mt-5 max-w-[680px] text-[19px] leading-[1.55] text-muted-foreground">{block.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="About this block">
            <li className={block.premium ? "rounded-full bg-foreground px-3 py-1 text-[13px] font-semibold text-background" : "rounded-full bg-tint-mint px-3 py-1 text-[13px] font-semibold text-[#126b3a]"}>
              {block.premium ? "Pro" : "Free"}
            </li>
            <li className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground">{block.category}</li>
            <li className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground">
              {block.variants.length} {block.variants.length === 1 ? "variant" : "variants"}
            </li>
          </ul>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1184px] px-4 pb-24">
      <Accordion defaultValue={[]}>
        <AccordionItem value="installation" className="border-0">
          <AccordionTrigger className="pg-float rounded-tile bg-card px-6 py-5 text-[20px] font-semibold text-foreground no-underline hover:no-underline">
            Installation
          </AccordionTrigger>
          <AccordionContent className="mt-2 rounded-tile bg-card px-6 py-5 text-[15px] text-muted-foreground">
            <BlockInstallation block={block} details={installDetails} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {isInteractiveBackgroundCard ? (
        <>
          <PreviewCodeSection title="Interactive Dots" code={code} locked={locked}>
            <InteractiveDotsHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Layered Wave Background"
            code={layeredWaveCode}
            usageCode={LAYERED_WAVE_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LayeredWaveHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Particle Noise"
            code={particleNoiseCode}
            usageCode={PARTICLE_NOISE_USAGE}
            className="mt-16"
            locked={locked}
          >
            <ParticleNoiseHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Aurora Wavy Lines"
            code={wavyLinesCode}
            usageCode={WAVY_LINES_USAGE}
            className="mt-16"
            locked={locked}
          >
            <div className="relative h-full min-h-full overflow-hidden rounded-lg bg-[#031412]">
              <WavyLines
                lineColor="#5eead4"
                backgroundColorStart="#031413"
                backgroundColorEnd="#123c2d"
                speed={1.35}
                radius={12}
                className="h-full min-h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,transparent_0%,rgba(0,0,0,.18)_46%,rgba(0,0,0,.72)_100%)]" />
              <div className="pointer-events-none absolute bottom-8 left-8 max-w-sm">
                <p className="text-[13px] font-medium text-teal-50/70">Tidal · Ocean sensor network</p>
                <p className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] text-white">
                  Readings from 4,000 buoys, live.
                </p>
                <p className="mt-3 text-pretty text-sm leading-6 text-teal-50/70">
                  Swell, temperature and salinity, streamed every ninety seconds.
                </p>
              </div>
            </div>
          </PreviewCodeSection>
        </>
      ) : isAnimatedBentoCard ? (
        <PreviewCodeSection title={block.name} code={code} locked={locked}>
          <BentoHeroCustomizer />
        </PreviewCodeSection>
      ) : isBentoSkeletonCard ? (
        <PreviewCodeSection title={block.name} code={code} locked={locked}>
          <BentoGridSkeletonHeroCustomizer />
        </PreviewCodeSection>
      ) : isMotionLayerScrollerCard ? (
        <PreviewCodeSection title={block.name} code={code} locked={locked}>
          <MotionLayerScrollerHeroCustomizer />
        </PreviewCodeSection>
      ) : isBentoShowcaseCard ? (
        <PreviewCodeSection title={block.name} code={code} locked={locked}>
          <BentoShowcaseHeroCustomizer />
        </PreviewCodeSection>
      ) : isWhyChooseUsCard ? (
        <>
          <PreviewCodeSection title={block.name} code={code} locked={locked}>
            <WhyChooseUsBentoHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="ATS Bento Grid"
            code={atsBentoCode}
            usageCode={ATS_BENTO_USAGE}
            locked={locked}
            className="mt-16"
          >
            <AtsBentoGridHeroCustomizer />
          </PreviewCodeSection>
          <PreviewCodeSection
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
          <PreviewCodeSection title="Questions & Answers FAQ" code={code} locked={locked}>
            <FaqFolderCard />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Searchable FAQ"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <SearchableFaqSection />
          </PreviewCodeSection>
          <PreviewCodeSection
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
          <PreviewCodeSection title="Global Signal Contact" code={code} locked={locked}>
            <GlobalSignalContact />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Centered Intake Contact"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <CenteredContactForm />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Gradient Proof Contact"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <GradientProofContact />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Image Story Contact"
            code={code}
            className="mt-16"
            locked={locked}
          >
            <ImageStoryContact />
          </PreviewCodeSection>
        </>
      ) : isTextAnimationsCard ? (
        <>
          <PreviewCodeSection title="Typewriter Heading" code={code} usageCode={TYPEWRITER_HEADING_USAGE} locked={locked}>
            <FlippingWordsDemo />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Text Animation Typewriter Effect"
            code={typewriterEffectCode}
            usageCode={TYPEWRITER_EFFECT_USAGE}
            className="mt-16"
            locked={locked}
          >
            <TypewriterEffectDemo />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Text Animation Blur Fade In"
            code={blurFadeInCode}
            usageCode={BLUR_FADE_IN_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlurFadeInDemo />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Text Generate Typewriter with typing sound"
            code={textGenerateCode}
            usageCode={TEXT_GENERATE_TYPEWRITER_USAGE}
            className="mt-16"
            locked={locked}
          >
            <TextGenerateTypewriterDemo />
          </PreviewCodeSection>
        </>
      ) : isBlogContentSectionsCard ? (
        <>
          <PreviewCodeSection
            title="Blog Content Centered"
            code={code}
            usageCode={BLOG_CONTENT_CENTERED_USAGE}
            locked={locked}
          >
            <BlogContentCentered />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Blog Content With TOC"
            code={blogContentWithTocCode}
            usageCode={BLOG_CONTENT_WITH_TOC_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogContentWithToc />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Blog Content Editorial"
            code={blogContentEditorialCode}
            usageCode={BLOG_CONTENT_EDITORIAL_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogContentEditorial />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Blog Header Featured Posts"
            code={blogHeaderFeaturedPostsCode}
            usageCode={BLOG_HEADER_FEATURED_POSTS_USAGE}
            className="mt-16"
            locked={locked}
          >
            <BlogHeaderFeaturedPosts />
          </PreviewCodeSection>
          <PreviewCodeSection
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
            title="Radio Plan Selector"
            code={code}
            usageCode={RADIO_PLAN_PRICING_USAGE}
            locked={locked}
          >
            <RadioPlanPricing />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Four Tier Billing Switch"
            code={billingPricingVariantsCode}
            usageCode={PRICING_PLAN_GRID_USAGE}
            className="mt-16"
            locked={locked}
          >
            <PricingPlanGrid />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Advanced Pricing Columns"
            code={billingPricingVariantsCode}
            usageCode={ADVANCED_PRICING_COLUMNS_USAGE}
            className="mt-16"
            locked={locked}
          >
            <AdvancedPricingColumns />
          </PreviewCodeSection>
          <PreviewCodeSection
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
          <PreviewCodeSection title="Simple Sidebar with Hover" code={code} locked={locked}>
            <SimpleSidebar />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Collapsible Sidebar"
            code={collapsibleSidebarCode}
            usageCode={COLLAPSIBLE_SIDEBAR_USAGE}
            className="mt-16"
            locked={locked}
          >
            <CollapsibleSidebar />
          </PreviewCodeSection>
          <PreviewCodeSection
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
          <PreviewCodeSection title="Blur Flip Grid" code={code} locked={locked}>
            <LogosBlurFlip />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Blur Hover Reveal"
            code={logoBlurCode}
            usageCode={LOGO_BLUR_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudBlur />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Infinite Marquee"
            code={logoMarqueeCode}
            usageCode={LOGO_MARQUEE_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudMarquee />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Cursor Spotlight"
            code={logoSpotlightCode}
            usageCode={LOGO_SPOTLIGHT_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudSpotlight />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Swap Animation"
            code={logoSwapCode}
            usageCode={LOGO_SWAP_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudSwap />
          </PreviewCodeSection>
          <PreviewCodeSection
            title="Single Row Lift"
            code={logoSingleRowCode}
            usageCode={LOGO_SINGLE_ROW_USAGE}
            className="mt-16"
            locked={locked}
          >
            <LogoCloudSingleRow />
          </PreviewCodeSection>
        </>
      ) : isCheckoutMomentsCard ? (
        <>
          <PreviewCodeSection title="Pay & Confirm" code={code} usageCode={CHECKOUT_PAY_USAGE} locked={locked}>
            <CheckoutStage>
              <PayAndConfirm />
            </CheckoutStage>
          </PreviewCodeSection>
          <PreviewCodeSection
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
) : (
        <PreviewCodeSection title={block.name} code={code} locked={locked}>
          <Preview />
        </PreviewCodeSection>
      )}

      <section className="mt-10 grid gap-4 border-t border-border/50 pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Variants</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {block.variants.map((variant) => (
              <Badge key={variant} variant="outline" className="border-border/70 text-muted-foreground">
                {variant}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-white/[0.04]">
          {locked ? (
            <>
              <p className="text-sm font-semibold text-foreground">Pro block</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Upgrade to Pro to access the full source code for this block.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Code access enabled</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Use the Code tab above to inspect and copy this block into your project.
              </p>
            </>
          )}
        </div>
      </section>
      </main>
    </>
  );
}

function FlippingWordsDemo() {
  const notes = [
    ["Oct 14", "Branch previews", "Every pull request gets its own URL, torn down on merge."],
    ["Oct 07", "Faster cold starts", "Median boot fell from 410 ms to 160 ms on the new runtime."],
    ["Sep 30", "Audit log export", "Stream every workspace event to your own bucket as JSONL."],
    ["Sep 22", "Keyboard-first search", "Press / anywhere to jump to a project, page, or teammate."],
  ];
  return (
    <section className="grid h-full min-h-full w-full overflow-hidden bg-[#f5f5f7] px-5 py-10 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-14">
      <div className="flex flex-col justify-center">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Changelog</p>
        <TypewriterHeading
          text="Release notes people read."
          description="Ship a headline that types itself out, then let the summary settle in underneath. The layout is reserved up front, so nothing below it jumps."
          typingSpeed={78}
          startDelay={300}
          cursorColor="#0071e3"
          className="mt-3"
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center rounded-full bg-[#0071e3] px-5 text-[15px] font-medium text-white">
            Read the latest
          </span>
          <span className="inline-flex h-11 items-center rounded-full bg-[#e8e8ed] px-5 text-[15px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
            Subscribe by email
          </span>
        </div>
      </div>
      <ol className="mt-10 hidden flex-col justify-center gap-2 lg:mt-0 lg:flex">
        {notes.map(([date, title, copy]) => (
          <li key={title} className="grid grid-cols-[64px_1fr] gap-4 rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <span className="pt-0.5 text-[12.5px] tabular-nums text-[#86868b] dark:text-[#98989d]">{date}</span>
            <span>
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">{title}</span>
              <span className="mt-1 block text-[13.5px] leading-5 text-[#6e6e73] dark:text-[#a1a1a6]">{copy}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TypewriterEffectDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-black px-5 py-12 text-[#f5f5f7] sm:px-8">
      <div className="w-full max-w-3xl">
        <p className="text-[13px] font-medium text-[#a1a1a6]">Hosting for small teams</p>
        <h3 className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
          Push to main.
        </h3>
        <div className="mt-2 min-h-[2.6em] text-[34px] leading-[1.05] sm:text-5xl">
          <TextAnimationTypewriterEffect
            texts={["Preview every branch.", "Roll back in one click.", "Sleep through deploys."]}
            className="text-[34px] text-[#86868b] sm:text-5xl"
            delay={500}
          />
        </div>
        <p className="mt-8 max-w-xl text-pretty text-[16px] leading-7 text-[#a1a1a6]">
          Cycles through short claims, typing and deleting each one. The line keeps its height, so the copy below
          never shifts.
        </p>
      </div>
    </section>
  );
}

function BlurFadeInDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-white px-5 py-12 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8">
      <div className="w-full max-w-3xl">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">From the founders</p>
        <TextAnimationBlurFadeIn
          text={"We built the tool we kept wishing for.\nIt does fewer things than the others.\nEach of them, properly."}
          by="word"
          stagger={0.045}
          once={false}
          repeat
          className="mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-5xl"
        />
        <p className="mt-8 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Ana Ruiz and Tom Becker, co-founders</p>
      </div>
    </section>
  );
}

function TextGenerateTypewriterDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-[#f5f5f7] px-5 py-12 dark:bg-black sm:px-8">
      <div className="w-full max-w-2xl">
        <div className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-[#0071e3] px-4 py-3 text-[15px] text-white">
          Why did churn go up last quarter?
        </div>
        <TextGenerateTypewriter
          text="Churn rose 1.8 points, almost entirely from annual plans that renewed in August. Most of those accounts never invited a second teammate, so the fastest lever is an invite prompt in week one."
          startOnView
          typingSpeed={40}
          volume={0.22}
          className="mt-4"
        />
      </div>
    </section>
  );
}

type BlockInstallDetails = {
  registryName: string;
  files: string[];
  notes: string[];
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
    "components/brand/nexus-mark.tsx",
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
    "TextGenerateTypewriter plays /sounds/sound.ogg by default. Add your own audio file at public/sounds/sound.ogg or pass a different soundSrc value.",
  ],
  "block-why-choose-us": [
    "SpotlightBentoGrid renders Unsplash images with next/image. Add images.unsplash.com to images.remotePatterns in next.config.mjs before using that variant.",
  ],
  "block-contact-page": [
    "The forms simulate a successful send out of the box. Pass an async onSubmit(values) to any contact variant to post to your own API or form service; throw or return { error } to show a message.",
  ],
};

function getBlockInstallDetails(slug: string, registryName: string): BlockInstallDetails {
  return {
    registryName,
    files: BLOCK_INSTALL_FILES[slug] ?? [],
    notes: BLOCK_INSTALL_NOTES[slug] ?? [],
  };
}

function BlockInstallation({
  block,
  details,
}: {
  block: BlockManifestEntry;
  details: BlockInstallDetails;
}) {
  const config = block.premium
    ? `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "${SHADCN_REGISTRY_SCOPE}": {
      "url": "${shadcnRegistryUrl()}",
      "headers": {
        "Authorization": "Bearer YOUR_NEXUS_API_KEY"
      }
    }
  }
}`
    : `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "${SHADCN_REGISTRY_SCOPE}": "${shadcnRegistryUrl()}"
  }
}`;
  const command = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${details.registryName}`;

  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-6">
        Install the complete <span className="font-medium text-foreground">{block.name}</span> family
        with its {block.variants.length} {block.variants.length === 1 ? "variant" : "variants"}.
        The registry command adds the source files, required utility imports, and npm packages used by this block.
      </p>

      <ol className="space-y-5">
        <InstallationStep number="1" title="Prepare a shadcn project">
          <p>
            Use a Next.js project with Tailwind CSS and the <span className="font-mono text-foreground">@/</span> alias.
            If shadcn is not configured yet, run:
          </p>
          <InstallCode value="npx shadcn@latest init" />
        </InstallationStep>

        <InstallationStep number="2" title={block.premium ? "Connect the registry with your API key" : "Connect the Nexus UI registry"}>
          <p>
            Replace your <span className="font-mono text-foreground">components.json</span> with this,
            or add the <span className="font-mono text-foreground">registries</span> key to your existing one.
            {block.premium && <> Replace <span className="font-mono text-foreground">YOUR_NEXUS_API_KEY</span> with the key from your Nexus UI dashboard.</>}
          </p>
          <InstallCode value={config} />
        </InstallationStep>

        <InstallationStep number="3" title="Install the full block family">
          <p>
            Run this command from your project root. It installs every variant shown on this page.
          </p>
          <InstallCode value={command} />
        </InstallationStep>

        {details.files.length > 0 && (
          <InstallationStep number="4" title="Files added to your project">
            <p>The component package installs these block source files:</p>
            <BlockFileTree files={details.files} />
          </InstallationStep>
        )}

        <InstallationStep number={details.files.length > 0 ? "5" : "4"} title="Copy the example into your page">
          <p>
            Switch to the <span className="font-medium text-foreground">Code</span> tab on the variant you want.
            On the left you&apos;ll see a ready-to-use snippet — copy it and paste it into{" "}
            <span className="font-mono text-foreground">app/page.tsx</span>:
          </p>
          <InstallCode value={`// app/page.tsx\nimport YourBlock from "@/components/...";\n\nexport default function Page() {\n  return (\n    <main>\n      <YourBlock />\n    </main>\n  );\n}`} />
          <p className="mt-2 text-xs leading-5">
            The exact import path is shown in the Code tab sidebar for each variant.
          </p>
        </InstallationStep>
      </ol>

      {details.notes.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <p className="font-medium text-foreground">Required setup for this block</p>
          <ul className="mt-3 space-y-2 leading-6">
            {details.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-amber-500">-</span>
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
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)]">
      <span className="grid size-7 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
        {number}
      </span>
      <div className="space-y-1.5 leading-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {children}
      </div>
    </li>
  );
}

function InstallCode({ value }: { value: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6 text-foreground">
      {value}
    </pre>
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
    <div className="mt-3 rounded-xl border border-border bg-background p-4 font-mono text-xs text-foreground">
      {rows.map((row, index) => (
        <div
          key={`${row.type}-${row.label}-${index}`}
          className="flex items-center gap-2 py-0.5"
          style={{ paddingLeft: `${row.depth * 16}px` }}
        >
          {row.type === "folder" ? (
            <Folder className="size-3.5 shrink-0 text-sky-500" />
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

function PreviewCodeSection({
  title,
  code,
  usageCode,
  className,
  children,
  locked = false,
}: {
  title: string;
  code: string;
  usageCode?: string;
  className?: string;
  children: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <section className={className ?? "mt-14"}>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      <Tabs defaultValue="preview" className="mt-7 gap-0">
        <div className="flex items-end justify-between gap-3">
          <TabsList className="h-11 rounded-xl bg-muted p-1">
            <TabsTrigger value="preview" className="h-9 gap-2 rounded-lg px-4 text-base">
              <Monitor className="size-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="h-9 gap-2 rounded-lg px-4 text-base" disabled={locked}>
              {locked ? <Lock className="size-4" /> : <Code2 className="size-4" />}
              Code
            </TabsTrigger>
          </TabsList>

          <button
            type="button"
            aria-label="Full screen preview"
            className="grid size-10 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm transition hover:text-foreground dark:bg-white/[0.04]"
          >
            <Expand className="size-4" />
          </button>
        </div>

        <TabsContent value="preview" className="mt-4">
          <div className="min-w-0 overflow-hidden rounded-2xl bg-muted/80 p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-white/[0.06] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="relative isolate h-[620px] min-w-0 overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm [contain:paint] dark:border-white/10 dark:bg-black md:h-[720px] xl:h-[860px]">
              <div className="absolute inset-4 min-w-0 overflow-hidden rounded-lg bg-background [contain:paint] dark:bg-black sm:inset-6">
                <div className="h-full min-h-0 w-full min-w-0 overflow-hidden [&>*]:!h-full [&>*]:!min-h-0 [&>*]:!w-full [&>*]:!max-w-none [&>*]:!overflow-hidden [&>*]:!rounded-lg">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          {locked ? (
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 p-8">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/60 backdrop-blur-[2px]">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
                  <Lock className="size-6 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">Pro block</p>
                  <p className="mt-1 text-sm text-muted-foreground">Upgrade to access the full source code</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
                  >
                    Upgrade to Pro
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    View plans
                  </Link>
                </div>
              </div>
              <div
                className="h-48 w-full blur-xl filter"
                aria-hidden
                contentEditable={false}
                suppressContentEditableWarning
              >
                <CodeBlock
                  code={code}
                  language="tsx"
                  theme="dark"
                  header={{ enabled: false }}
                  codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
                  border={{ radius: "16px" }}
                />
              </div>
            </div>
          ) : (
            <div className="grid max-w-full gap-4 overflow-hidden xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <UsageSnippet code={usageCode ?? defaultUsageForTitle(title)} />
              <div className="min-w-0 max-w-full overflow-hidden rounded-2xl">
                <div className="max-h-[720px] max-w-full overflow-auto">
                  <CodeBlock
                    code={code}
                    language="tsx"
                    theme="dark"
                    header={{
                      enabled: true,
                      showDots: true,
                      title: `${title}.tsx`,
                      copy: {
                        enabled: true,
                        label: "Copy code",
                        copiedLabel: "Copied",
                        copiedDurationMs: 1400,
                      },
                    }}
                    codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
                    border={{ radius: "16px" }}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
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
  if (title === "Text Generate Typewriter with typing sound") return TEXT_GENERATE_TYPEWRITER_USAGE;
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
        text="Nexus-ui is generating a production-ready landing section with sound."
        soundSrc="/sounds/sound.ogg"
      startOnView
      typingSpeed={22}
      volume={0.18}
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

const LOGO_MARQUEE_USAGE = `// npm install react-fast-marquee
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";

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

const LOGO_SINGLE_ROW_USAGE = `import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";

export default function Page() {
  return <LogoCloudSingleRow />;
}`;

/** Centres a Checkout Moments card on the Playground page grey. */
function CheckoutStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] content-center justify-items-center overflow-y-auto bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#0b0b10]">{children}</div>
  );
}

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
