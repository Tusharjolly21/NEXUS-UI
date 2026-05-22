import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ChevronRight, Code2, Expand, Lock, Monitor } from "lucide-react";
import { getBlock, blocks } from "@/lib/catalog/blocks";
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
  const isSidebarCard = block.slug === "block-sidebar";
  const isLogoCloudCard = block.slug === "block-logo-clouds";
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <main className="mx-auto w-full max-w-[1420px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
      <nav className="mb-7 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/blocks" className="transition hover:text-foreground">
          Blocks
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{block.name}</span>
      </nav>

      <header>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {block.name}
          <span className="sr-only"> — UI Block</span>
        </h1>
        <p className="mt-4 max-w-3xl text-xl leading-8 text-muted-foreground">
          {block.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-border/70 bg-muted/50 text-muted-foreground">
            {block.category}
          </Badge>
          {block.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/70 bg-muted/50 text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <Accordion defaultValue={[]} className="mt-10">
        <AccordionItem value="installation" className="border-0">
          <AccordionTrigger className="rounded-xl bg-muted/70 px-5 py-4 text-2xl font-semibold text-foreground no-underline hover:bg-muted hover:no-underline dark:bg-white/[0.06] dark:hover:bg-white/[0.08]">
            Installation
          </AccordionTrigger>
          <AccordionContent className="rounded-b-xl border border-t-0 border-border/50 bg-muted/25 px-5 py-4 text-sm text-muted-foreground dark:bg-white/[0.03]">
            <p>
              Copy the component code from the Code tab and place it in your
              components directory. The preview below shows the block in a realistic
              hero section container.
            </p>
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
                <p className="text-xs uppercase tracking-[0.24em] text-teal-100/55">
                  WebGL motion
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  Aurora lines for immersive sections
                </p>
                <p className="mt-3 text-sm leading-6 text-teal-50/60">
                  Animated shader waves with a cooler emerald palette and smooth
                  flowing depth.
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
  return (
    <section className="grid h-full min-h-full w-full overflow-hidden bg-[#f7f7f8] p-6 text-zinc-950 lg:grid-cols-[1.08fr_0.92fr] lg:p-12">
      <div className="flex flex-col justify-end pb-10 lg:pb-24">
        <TypewriterHeading
          text="Built with Next.js"
          description="Create stunning animations that bring your website to life. Elevate your user experience with smooth transitions and eye-catching effects that captivate visitors and keep them engaged."
          typingSpeed={92}
          startDelay={300}
        />
        <div className="mt-12">
          <p className="text-sm font-medium text-zinc-500">Trusted by builders shipping with</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-zinc-800">
            <span>Nexus-ui</span>
            <span>Gamity</span>
            <span>Host IT</span>
            <span>Asteroid Kit</span>
          </div>
        </div>
      </div>
      <div className="hidden items-end justify-center pb-4 lg:flex">
        <div className="relative h-[590px] w-[300px] rounded-[3rem] border-[14px] border-black bg-white p-4 shadow-2xl shadow-zinc-950/20">
          <div className="absolute left-1/2 top-5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
          <div className="mt-16 space-y-3">
            {[
              ["🚀", "Getting Started", "Learn how to build your first animation in minutes"],
              ["⚡", "Advanced Techniques", "Take animations to the next level with pro tips"],
              ["⚙️", "Performance Tips", "Optimize motion for smooth rendering"],
              ["📚", "Animation Library", "Browse reusable text effects"],
              ["🌟", "Community Showcase", "See what others are building"],
            ].map(([icon, title, copy]) => (
              <div key={title} className="rounded-2xl bg-white p-3.5 shadow-lg shadow-zinc-950/10">
                <div className="flex gap-2.5">
                  <span className="shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TypewriterEffectDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/70">Typewriter</p>
        <div className="mt-8 min-h-[8rem]">
          <TextAnimationTypewriterEffect
            texts={[
              "Launch a sharper hero section.",
              "Write less styling.",
              "Ship motion that feels premium.",
            ]}
            className="text-4xl text-white sm:text-6xl"
            delay={400}
          />
        </div>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55">
          Loop through product messages with controlled typing, deleting,
          blinking cursor, and no layout jump.
        </p>
      </div>
    </section>
  );
}

function BlurFadeInDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-white p-6 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="w-full max-w-4xl rounded-[2rem] border border-zinc-200 bg-zinc-50 p-8 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">Blur fade in</p>
        <TextAnimationBlurFadeIn
          text={"Every word arrives with intent.\nEvery sentence feels composed.\nEvery section earns attention."}
          by="word"
          stagger={0.045}
          once={false}
          repeat
          className="mt-8 text-4xl leading-tight text-zinc-900 dark:text-white sm:text-6xl"
        />
      </div>
    </section>
  );
}

function TextGenerateTypewriterDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-[#05070d] p-6">
      <div className="w-full max-w-3xl">
        <TextGenerateTypewriter
          text="Nexus-ui is generating a production-ready hero section with animated text, clean spacing, responsive layout, and a subtle synced typing sound."
          startOnView
          typingSpeed={48}
          volume={0.22}
        />
      </div>
    </section>
  );
}

async function getBlockCode(slug: string, fallback: string) {
  const sourceBySlug: Record<string, string> = {
    "block-interactive-dots": "src/components/interactive-dots/interactive-dots.tsx",
    "block-why-choose-us": "src/components/blocks/animated-bento-grid.tsx",
    "block-faq-folder-card": "src/components/blocks/faq-folder-card.tsx",
    "block-contact-page": "src/components/blocks/contact-page.tsx",
    "block-text-animations": "src/components/blocks/text-animations/typewriter-heading.tsx",
    "block-sidebar": "src/components/blocks/sidebar/simple-sidebar.tsx",
    "block-logo-clouds": "src/components/blocks/logo-clouds/logos-blur-flip.tsx",
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
          <div className="rounded-2xl bg-muted/80 p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-white/[0.06] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="relative h-[620px] overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm dark:border-white/10 dark:bg-zinc-950 md:h-[720px] xl:h-[860px]">
              <div className="absolute inset-4 overflow-hidden rounded-lg bg-background dark:bg-zinc-950 sm:inset-6">
                <div className="h-full w-full [&>*]:!h-full [&>*]:!min-h-full [&>*]:!w-full [&>*]:!max-w-none [&>*]:!rounded-lg">
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
