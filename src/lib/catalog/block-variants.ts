/**
 * Every section shown on a block's page, in page order. The blocks wall renders each one as its own
 * tile (like the components wall), and the block page gives each section the matching anchor, so a
 * tile opens the page scrolled to its section.
 *
 * Plain data only: the live previews are exported from `@/registry/component-previews` under
 * `exportName` and loaded lazily on the client.
 */
import { movedSections, type MovedSection } from "./moved-sections";

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
  /** Usage snippet shown with the code (sections moved over from the components library). */
  usage?: string;
  /** Day the section was added (YYYY-MM-DD). The wall's New tab lists the newest ones; sections without a date are older than the tab's window. */
  addedAt?: string;
};

function v(id: string, block: string, title: string): BlockVariant {
  const pascal = id
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return { id, block, title, exportName: `PreviewBlockVariant${pascal}` };
}

/**
 * The day each Motion Kit section went in, taken from the first commit of its files. Add a new section
 * under its day (or a new day) so it shows up under the Blocks wall's New tab.
 */
const ADDED_ON: Record<string, string[]> = {
  "2026-10-20": [
    "auto-advancing-tabs", "beam-pricing", "changelog-pile", "collapsing-rail", "counting-stats", "drawn-timeline",
    "drift-gallery", "gravity-404", "halftone-planet", "instant-search-faq", "integrations-orbit", "kinetic-hero",
    "live-demo-bento", "loupe-logo-cloud", "morphing-nav", "parallax-stack-hero", "pulse-bento", "scramble-heading",
    "scroll-read-manifesto", "seat-ruler-pricing", "slide-to-pay", "spotlight-hero", "typo-catching-signup",
    "voice-note-contact", "wall-of-love",
  ],
  "2026-10-22": [
    "announce-bar", "auth-morph", "beam-timeline", "blog-with-contents", "card-rail", "circuit-hero", "clothesline",
    "cursor-crowd-hero", "filterable-logo-wall", "flip-dot-hero", "logo-stories", "morph-menu", "parallax-slider",
    "scroll-navbar", "stacking-cards", "stats-odometer", "sticky-scroll-story", "team-clock", "velocity-marquee",
    "waitlist-cta", "xray-hero",
  ],
  "2026-10-30": ["bento-features"],
  "2026-11-05": ["fluffy-footer", "broken-bridge-404", "postal-signup", "spotlight-tour", "brand-reveal"],
  "2026-11-10": ["lanyard-signup"],
  "2026-11-12": ["infinite-branches"],
  "2026-11-13": ["courier-route-tracker", "column-drift-gallery", "reflow-mosaic", "focus-rail-gallery", "model-picker"],
  "2026-11-02": ["head-to-head-compare", "receipt-hero", "sealed-and-sent", "wall-clock-contact", "wordmark-footer"],
};
const ADDED = new Map(Object.entries(ADDED_ON).flatMap(([day, slugs]) => slugs.map((slug) => [slug, day] as const)));

/** A Motion Kit section: Pro, its own registry package and source file. */
function mk(slug: string, block: string, title: string, component: string): BlockVariant {
  return {
    ...v(`mk-${slug}`, block, title),
    addedAt: ADDED.get(slug),
    premium: true,
    registryCliName: slug,
    source: `src/components/blocks/motion-kit/${slug}/${slug}.tsx`,
    component,
  };
}

/** A section that used to be a library component: keeps its own install name, files and tier. */
function moved(m: MovedSection): BlockVariant {
  return {
    id: `mk-${m.slug}`,
    block: m.block,
    title: m.name,
    exportName: m.preview,
    premium: m.premium,
    registryCliName: m.registryCliName,
    source: m.source,
    component: m.component,
    usage: m.reactSource,
  };
}

const baseVariants: BlockVariant[] = [
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
  v("logos-shelf", "block-logo-clouds", "Logo Shelf"),
  mk("loupe-logo-cloud", "block-logo-clouds", "Loupe Logo Cloud", "LoupeLogoCloud"),
  mk("logo-stories", "block-logo-clouds", "Logo Stories", "LogoStories"),
  mk("filterable-logo-wall", "block-logo-clouds", "Filterable Logo Wall", "FilterableLogoWall"),

  v("checkout-pay", "block-checkout-moments", "Pay & Confirm"),
  v("checkout-verify", "block-checkout-moments", "Verify Payment"),
  v("checkout-tip", "block-checkout-moments", "Tip & Rate"),
  mk("slide-to-pay", "block-checkout-moments", "Slide to Pay", "SlideToPay"),
  mk("courier-route-tracker", "block-checkout-moments", "Courier Route Tracker", "CourierRouteTracker"),

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
  mk("team-clock", "block-contact-page", "Team Clock", "TeamClock"),
  mk("wall-clock-contact", "block-contact-page", "Wall Clock Contact", "WallClockContact"),

  v("text-typewriter-heading", "block-text-animations", "Typewriter Heading"),
  v("text-typewriter-effect", "block-text-animations", "Text Animation Typewriter Effect"),
  v("text-blur-fade-in", "block-text-animations", "Text Animation Blur Fade In"),
  v("text-generate", "block-text-animations", "Text Generate Typewriter"),
  mk("scramble-heading", "block-text-animations", "Scramble Heading", "ScrambleHeading"),
  mk("scroll-read-manifesto", "block-text-animations", "Scroll-read Manifesto", "ScrollReadManifesto"),

  v("blog-centered", "block-blog-content-sections", "Blog Content Centered"),
  v("blog-toc", "block-blog-content-sections", "Blog Content With TOC"),
  v("blog-editorial", "block-blog-content-sections", "Blog Content Editorial"),
  v("blog-featured-posts", "block-blog-content-sections", "Blog Header Featured Posts"),
  v("blog-hover-card", "block-blog-content-sections", "Blog Hover Image Card"),
  mk("blog-with-contents", "block-blog-content-sections", "Blog With Contents", "BlogWithContents"),

  mk("morphing-nav", "block-navigation", "Morphing Nav", "MorphingNav"),
  mk("announce-bar", "block-navigation", "Announcement Bar", "AnnounceBar"),
  mk("morph-menu", "block-navigation", "Morphing Mega Menu", "MorphMenu"),
  mk("scroll-navbar", "block-navigation", "Scroll-aware Navbar", "ScrollNavbar"),
  mk("model-picker", "block-navigation", "Model Picker", "ModelPickerSection"),

  mk("spotlight-hero", "block-hero", "Spotlight Hero", "SpotlightHero"),
  mk("parallax-stack-hero", "block-hero", "Parallax Stack Hero", "ParallaxStackHero"),
  mk("kinetic-hero", "block-hero", "Kinetic Hero", "KineticHero"),
  mk("cursor-crowd-hero", "block-hero", "Cursor Crowd Hero", "CursorCrowdHero"),
  mk("xray-hero", "block-hero", "X-ray Hero", "XrayHero"),
  mk("circuit-hero", "block-hero", "Circuit Hero", "CircuitHero"),
  mk("flip-dot-hero", "block-hero", "Flip-dot Hero", "FlipDotHero"),
  mk("receipt-hero", "block-hero", "Receipt Hero", "ReceiptHero"),
  mk("brand-reveal", "block-hero", "Brand Reveal", "BrandReveal"),
  mk("infinite-branches", "block-hero", "Infinite Branches", "InfiniteBranches"),

  mk("auto-advancing-tabs", "block-features", "Auto-advancing Tabs", "AutoAdvancingTabs"),
  mk("drawn-timeline", "block-features", "Drawn Timeline", "DrawnTimeline"),
  mk("integrations-orbit", "block-features", "Integrations Orbit", "IntegrationsOrbit"),
  mk("stacking-cards", "block-features", "Stacking Cards", "StackingCards"),
  mk("bento-features", "block-features", "Bento Features", "BentoFeatures"),
  mk("beam-timeline", "block-features", "Beam Timeline", "BeamTimeline"),
  mk("sticky-scroll-story", "block-features", "Sticky Scroll Story", "StickyScrollStory"),
  mk("sealed-and-sent", "block-features", "Sealed and Sent", "SealedAndSent"),
  mk("spotlight-tour", "block-features", "Spotlight Tour", "SpotlightTour"),

  mk("counting-stats", "block-social-proof", "Counting Stats", "CountingStats"),
  mk("wall-of-love", "block-social-proof", "Wall of Love", "WallOfLove"),
  mk("clothesline", "block-social-proof", "Clothesline", "Clothesline"),
  mk("velocity-marquee", "block-social-proof", "Velocity Marquee", "VelocityMarquee"),
  mk("stats-odometer", "block-social-proof", "Stats Odometer", "StatsOdometer"),

  mk("typo-catching-signup", "block-newsletter", "Typo-catching Signup", "TypoCatchingSignup"),
  mk("postal-signup", "block-newsletter", "Postal Signup", "PostalSignup"),

  mk("drift-gallery", "block-gallery", "Drift Gallery", "DriftGallery"),
  mk("card-rail", "block-gallery", "Card Rail", "CardRail"),
  mk("parallax-slider", "block-gallery", "Parallax Slider", "ParallaxSlider"),
  mk("column-drift-gallery", "block-gallery", "Column Drift Gallery", "ColumnDriftGallery"),
  mk("reflow-mosaic", "block-gallery", "Reflow Mosaic", "ReflowMosaic"),
  mk("focus-rail-gallery", "block-gallery", "Focus Rail Gallery", "FocusRailGallery"),
  mk("changelog-pile", "block-changelog", "Changelog Pile", "ChangelogPile"),
  mk("gravity-404", "block-404", "Gravity 404", "Gravity404"),
  mk("broken-bridge-404", "block-404", "Broken Bridge 404", "BrokenBridge404"),
  mk("head-to-head-compare", "block-comparison", "Head-to-Head Compare", "HeadToHeadCompare"),
];

/** Every section, each block's moved-in sections following its own. */
export const blockVariants: BlockVariant[] = (() => {
  const rest = movedSections.map(moved);
  const out: BlockVariant[] = [];
  const seen = new Set<string>();
  for (const v of baseVariants) {
    out.push(v);
    const next = baseVariants[baseVariants.indexOf(v) + 1];
    if (!next || next.block !== v.block) {
      if (!seen.has(v.block)) out.push(...rest.filter((r) => r.block === v.block));
      seen.add(v.block);
    }
  }
  // Blocks made only of moved sections.
  out.push(...rest.filter((r) => !seen.has(r.block)));
  // Motion Kit sections on blocks that are otherwise made of moved sections go after them.
  for (const extra of [
    mk("waitlist-cta", "block-cta", "Waitlist CTA", "WaitlistCta"),
    mk("auth-morph", "block-signup", "Sign In / Sign Up", "AuthMorph"),
    mk("lanyard-signup", "block-signup", "Lanyard Signup", "LanyardSignup"),
    mk("wordmark-footer", "block-footer", "Wordmark Footer", "WordmarkFooter"),
    mk("fluffy-footer", "block-footer", "Fluffy Footer", "FluffyFooter"),
  ]) {
    let at = -1;
    out.forEach((x, i) => { if (x.block === extra.block) at = i; });
    out.splice(at + 1, 0, extra);
  }
  return out;
})();

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
