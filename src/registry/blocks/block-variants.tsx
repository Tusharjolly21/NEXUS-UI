"use client";

/**
 * Live previews for every section shown on the block pages, one export per entry in
 * `@/lib/catalog/block-variants`. The blocks wall loads them lazily as tiles, and the block pages
 * render the same demos, so a tile always shows exactly the section it opens.
 */

import type { ReactNode } from "react";
import {
  AdvancedPricingColumns,
  PricingPlanGrid,
  RadioPlanPricing,
  SpotlightPricingCards,
} from "@/components/blocks/pricing-section";
import { InteractiveDotsHeroCustomizer } from "@/components/library/interactive-dots-hero-customizer";
import { LayeredWaveHeroCustomizer } from "@/components/library/layered-wave-hero-customizer";
import { ParticleNoiseHeroCustomizer } from "@/components/library/particle-noise-hero-customizer";
import { WavyLines } from "@/components/wavy-lines";
import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";
import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";
import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";
import { PayAndConfirm, TipAndRate, VerifyPayment } from "@/components/blocks/checkout-moments";
import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";
import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";
import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";
import { WhyChooseUsBentoHeroCustomizer } from "@/components/library/why-choose-us-bento-hero-customizer";
import { AtsBentoGridHeroCustomizer } from "@/components/library/ats-bento-grid-hero-customizer";
import { SpotlightBentoGridCustomizer } from "@/components/library/spotlight-bento-grid-customizer";
import { ChatFaqSection, FaqFolderCard, SearchableFaqSection } from "@/components/blocks/faq-folder-card";
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
  BlogContentWithToc,
  BlogHeaderFeaturedPosts,
  BlogHoverImageCardShowcase,
} from "@/components/blocks/blog-content-sections";

/** A quiet stage for the checkout cards, which are cards rather than full-width sections. */
export function CheckoutStage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[640px] grid-cols-[minmax(0,1fr)] content-center justify-items-center bg-[#f5f5f7] p-4 sm:p-8 dark:bg-black">
      {children}
    </div>
  );
}

/** Wavy lines behind a short hero, in deep navy with Apple-blue strands. */
export function AuroraWavyLinesDemo() {
  return (
    <div className="relative h-full min-h-[640px] overflow-hidden bg-[#050b18]">
      <WavyLines
        lineColor="#2997ff"
        backgroundColorStart="#050b18"
        backgroundColorEnd="#0b1f3a"
        speed={1.2}
        radius={12}
        className="h-full min-h-[640px] w-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,transparent_0%,rgba(0,0,0,.2)_46%,rgba(0,0,0,.7)_100%)]" />
      <div className="pointer-events-none absolute bottom-10 left-10 max-w-md">
        <p className="text-[14px] font-medium text-[#a1a1a6]">Tidal, ocean sensor network</p>
        <p className="mt-3 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#f5f5f7]">
          Readings from 4,000 buoys, live.
        </p>
        <p className="mt-3 text-pretty text-[16px] leading-[1.5] text-[#a1a1a6]">
          Swell, temperature and salinity, streamed every ninety seconds.
        </p>
      </div>
    </div>
  );
}

export function FlippingWordsDemo() {
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

export function TypewriterEffectDemo() {
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

export function BlurFadeInDemo() {
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

export function TextGenerateTypewriterDemo() {
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

export function PreviewBlockVariantPricingRadioPlan() {
  return <RadioPlanPricing />;
}

export function PreviewBlockVariantPricingFourTier() {
  return <PricingPlanGrid />;
}

export function PreviewBlockVariantPricingAdvancedColumns() {
  return <AdvancedPricingColumns />;
}

export function PreviewBlockVariantPricingSpotlightCards() {
  return <SpotlightPricingCards />;
}

export function PreviewBlockVariantBackgroundsInteractiveDots() {
  return <InteractiveDotsHeroCustomizer />;
}

export function PreviewBlockVariantBackgroundsLayeredWave() {
  return <LayeredWaveHeroCustomizer />;
}

export function PreviewBlockVariantBackgroundsParticleNoise() {
  return <ParticleNoiseHeroCustomizer />;
}

export function PreviewBlockVariantBackgroundsAuroraLines() {
  return <AuroraWavyLinesDemo />;
}

export function PreviewBlockVariantLogosBlurFlip() {
  return <LogosBlurFlip />;
}

export function PreviewBlockVariantLogosBlurReveal() {
  return <LogoCloudBlur />;
}

export function PreviewBlockVariantLogosMarquee() {
  return <LogoCloudMarquee />;
}

export function PreviewBlockVariantLogosSpotlight() {
  return <LogoCloudSpotlight />;
}

export function PreviewBlockVariantLogosSwap() {
  return <LogoCloudSwap />;
}

export function PreviewBlockVariantLogosSingleRow() {
  return <LogoCloudSingleRow />;
}

export function PreviewBlockVariantCheckoutPay() {
  return <CheckoutStage><PayAndConfirm /></CheckoutStage>;
}

export function PreviewBlockVariantCheckoutVerify() {
  return <CheckoutStage><VerifyPayment hint="Demo code: 424242" /></CheckoutStage>;
}

export function PreviewBlockVariantCheckoutTip() {
  return <CheckoutStage><TipAndRate /></CheckoutStage>;
}

export function PreviewBlockVariantSidebarSimple() {
  return <SimpleSidebar />;
}

export function PreviewBlockVariantSidebarCollapsible() {
  return <CollapsibleSidebar />;
}

export function PreviewBlockVariantSidebarGrouped() {
  return <GroupedSidebar />;
}

export function PreviewBlockVariantBentoMentorship() {
  return <WhyChooseUsBentoHeroCustomizer />;
}

export function PreviewBlockVariantBentoAts() {
  return <AtsBentoGridHeroCustomizer />;
}

export function PreviewBlockVariantBentoSpotlight() {
  return <SpotlightBentoGridCustomizer />;
}

export function PreviewBlockVariantFaqFolder() {
  return <FaqFolderCard />;
}

export function PreviewBlockVariantFaqSearchable() {
  return <SearchableFaqSection />;
}

export function PreviewBlockVariantFaqChat() {
  return <ChatFaqSection />;
}

export function PreviewBlockVariantContactGlobalSignal() {
  return <GlobalSignalContact />;
}

export function PreviewBlockVariantContactCentered() {
  return <CenteredContactForm />;
}

export function PreviewBlockVariantContactGradientProof() {
  return <GradientProofContact />;
}

export function PreviewBlockVariantContactImageStory() {
  return <ImageStoryContact />;
}

export function PreviewBlockVariantTextTypewriterHeading() {
  return <FlippingWordsDemo />;
}

export function PreviewBlockVariantTextTypewriterEffect() {
  return <TypewriterEffectDemo />;
}

export function PreviewBlockVariantTextBlurFadeIn() {
  return <BlurFadeInDemo />;
}

export function PreviewBlockVariantTextGenerate() {
  return <TextGenerateTypewriterDemo />;
}

export function PreviewBlockVariantBlogCentered() {
  return <BlogContentCentered />;
}

export function PreviewBlockVariantBlogToc() {
  return <BlogContentWithToc />;
}

export function PreviewBlockVariantBlogEditorial() {
  return <BlogContentEditorial />;
}

export function PreviewBlockVariantBlogFeaturedPosts() {
  return <BlogHeaderFeaturedPosts />;
}

export function PreviewBlockVariantBlogHoverCard() {
  return <BlogHoverImageCardShowcase />;
}
