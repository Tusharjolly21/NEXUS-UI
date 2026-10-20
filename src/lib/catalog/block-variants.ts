/**
 * Every section shown on a block's page, in page order. The blocks wall renders each one as its own
 * tile (like the components wall), and the block page gives each section the matching anchor, so a
 * tile opens the page scrolled to its section.
 *
 * Plain data only: the live previews are exported from `@/registry/component-previews` under
 * `exportName` and loaded lazily on the client.
 */
export type BlockVariant = {
  /** Unique id; also the key in the tile-fit measurements. */
  id: string;
  /** Slug of the block page the section lives on. */
  block: string;
  /** Section title on the block page and the tile's name. */
  title: string;
  exportName: string;
  /**
   * Motion Kit sections are Pro on their own, whatever the block they sit in: the page withholds
   * their code without access, and they install as their own token-gated registry package.
   */
  premium?: boolean;
  /** Registry package for this one section (Motion Kit sections). */
  registryCliName?: string;
  /** Repo path of the section's source, read on the server only when the visitor has access. */
  source?: string;
  /** Component export name, for the usage snippet. */
  component?: string;
};

function v(id: string, block: string, title: string): BlockVariant {
  const pascal = id
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return { id, block, title, exportName: `PreviewBlockVariant${pascal}` };
}

/** A Motion Kit section: Pro, its own registry package and source file. */
function mk(slug: string, block: string, title: string, component: string): BlockVariant {
  return {
    ...v(`mk-${slug}`, block, title),
    premium: true,
    registryCliName: slug,
    source: `src/components/blocks/motion-kit/${slug}/${slug}.tsx`,
    component,
  };
}

export const blockVariants: BlockVariant[] = [
  v("pricing-radio-plan", "block-pricing-section", "Radio Plan Selector"),
  v("pricing-four-tier", "block-pricing-section", "Four Tier Billing Switch"),
  v("pricing-advanced-columns", "block-pricing-section", "Advanced Pricing Columns"),
  v("pricing-spotlight-cards", "block-pricing-section", "Spotlight Pricing Cards"),
  mk("seat-ruler-pricing", "block-pricing-section", "Seat Ruler Pricing", "SeatRulerPricing"),
  mk("beam-pricing", "block-pricing-section", "Beam Pricing", "BeamPricing"),

  v("backgrounds-interactive-dots", "block-interactive-dots", "Interactive Dots"),
  v("backgrounds-layered-wave", "block-interactive-dots", "Layered Wave Background"),
  v("backgrounds-particle-noise", "block-interactive-dots", "Particle Noise"),
  v("backgrounds-aurora-lines", "block-interactive-dots", "Aurora Wavy Lines"),
  mk("halftone-planet", "block-interactive-dots", "Halftone Planet", "HalftonePlanet"),

  v("logos-blur-flip", "block-logo-clouds", "Blur Flip Grid"),
  v("logos-blur-reveal", "block-logo-clouds", "Blur Hover Reveal"),
  v("logos-marquee", "block-logo-clouds", "Infinite Marquee"),
  v("logos-spotlight", "block-logo-clouds", "Cursor Spotlight"),
  v("logos-swap", "block-logo-clouds", "Swap Animation"),
  v("logos-single-row", "block-logo-clouds", "Single Row Lift"),
  mk("loupe-logo-cloud", "block-logo-clouds", "Loupe Logo Cloud", "LoupeLogoCloud"),

  v("checkout-pay", "block-checkout-moments", "Pay & Confirm"),
  v("checkout-verify", "block-checkout-moments", "Verify Payment"),
  v("checkout-tip", "block-checkout-moments", "Tip & Rate"),
  mk("slide-to-pay", "block-checkout-moments", "Slide to Pay", "SlideToPay"),

  v("sidebar-simple", "block-sidebar", "Simple Sidebar with Hover"),
  v("sidebar-collapsible", "block-sidebar", "Collapsible Sidebar"),
  v("sidebar-grouped", "block-sidebar", "Grouped Sidebar"),
  mk("collapsing-rail", "block-sidebar", "Collapsing Rail", "CollapsingRail"),

  v("bento-mentorship", "block-why-choose-us", "Mentorship Bento"),
  v("bento-ats", "block-why-choose-us", "ATS Bento Grid"),
  v("bento-spotlight", "block-why-choose-us", "Spotlight Bento Grid"),
  mk("pulse-bento", "block-why-choose-us", "Pulse Bento", "PulseBento"),
  mk("live-demo-bento", "block-why-choose-us", "Live Demo Bento", "LiveDemoBento"),

  v("faq-folder", "block-faq-folder-card", "Questions & Answers FAQ"),
  v("faq-searchable", "block-faq-folder-card", "Searchable FAQ"),
  v("faq-chat", "block-faq-folder-card", "Chat FAQ"),
  mk("instant-search-faq", "block-faq-folder-card", "Instant Search FAQ", "InstantSearchFaq"),

  v("contact-global-signal", "block-contact-page", "Global Signal Contact"),
  v("contact-centered", "block-contact-page", "Centered Intake Contact"),
  v("contact-gradient-proof", "block-contact-page", "Gradient Proof Contact"),
  v("contact-image-story", "block-contact-page", "Image Story Contact"),
  mk("voice-note-contact", "block-contact-page", "Voice Note Contact", "VoiceNoteContact"),

  v("text-typewriter-heading", "block-text-animations", "Typewriter Heading"),
  v("text-typewriter-effect", "block-text-animations", "Text Animation Typewriter Effect"),
  v("text-blur-fade-in", "block-text-animations", "Text Animation Blur Fade In"),
  v("text-generate", "block-text-animations", "Text Generate Typewriter with typing sound"),
  mk("scramble-heading", "block-text-animations", "Scramble Heading", "ScrambleHeading"),
  mk("scroll-read-manifesto", "block-text-animations", "Scroll-read Manifesto", "ScrollReadManifesto"),

  v("blog-centered", "block-blog-content-sections", "Blog Content Centered"),
  v("blog-toc", "block-blog-content-sections", "Blog Content With TOC"),
  v("blog-editorial", "block-blog-content-sections", "Blog Content Editorial"),
  v("blog-featured-posts", "block-blog-content-sections", "Blog Header Featured Posts"),
  v("blog-hover-card", "block-blog-content-sections", "Blog Hover Image Card"),

  mk("morphing-nav", "block-navigation", "Morphing Nav", "MorphingNav"),

  mk("spotlight-hero", "block-hero", "Spotlight Hero", "SpotlightHero"),
  mk("parallax-stack-hero", "block-hero", "Parallax Stack Hero", "ParallaxStackHero"),

  mk("auto-advancing-tabs", "block-features", "Auto-advancing Tabs", "AutoAdvancingTabs"),
  mk("drawn-timeline", "block-features", "Drawn Timeline", "DrawnTimeline"),
  mk("integrations-orbit", "block-features", "Integrations Orbit", "IntegrationsOrbit"),

  mk("counting-stats", "block-social-proof", "Counting Stats", "CountingStats"),
  mk("wall-of-love", "block-social-proof", "Wall of Love", "WallOfLove"),

  mk("typo-catching-signup", "block-newsletter", "Typo-catching Signup", "TypoCatchingSignup"),
];

/** Motion Kit sections, in page order, for one block. */
export function motionKitSectionsOf(blockSlug: string) {
  return blockVariants.filter((x) => x.block === blockSlug && x.registryCliName);
}

/** The Motion Kit section that installs as this registry package, if any. */
export function getVariantByRegistryName(name: string) {
  return blockVariants.find((x) => x.registryCliName === name) ?? null;
}

/** URL fragment for a section title, shared by the wall's links and the block page's anchors. */
export function variantAnchor(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function variantsOf(blockSlug: string) {
  return blockVariants.filter((x) => x.block === blockSlug);
}
