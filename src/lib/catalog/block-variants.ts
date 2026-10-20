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
};

function v(id: string, block: string, title: string): BlockVariant {
  const pascal = id
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return { id, block, title, exportName: `PreviewBlockVariant${pascal}` };
}

export const blockVariants: BlockVariant[] = [
  v("pricing-radio-plan", "block-pricing-section", "Radio Plan Selector"),
  v("pricing-four-tier", "block-pricing-section", "Four Tier Billing Switch"),
  v("pricing-advanced-columns", "block-pricing-section", "Advanced Pricing Columns"),
  v("pricing-spotlight-cards", "block-pricing-section", "Spotlight Pricing Cards"),

  v("backgrounds-interactive-dots", "block-interactive-dots", "Interactive Dots"),
  v("backgrounds-layered-wave", "block-interactive-dots", "Layered Wave Background"),
  v("backgrounds-particle-noise", "block-interactive-dots", "Particle Noise"),
  v("backgrounds-aurora-lines", "block-interactive-dots", "Aurora Wavy Lines"),

  v("logos-blur-flip", "block-logo-clouds", "Blur Flip Grid"),
  v("logos-blur-reveal", "block-logo-clouds", "Blur Hover Reveal"),
  v("logos-marquee", "block-logo-clouds", "Infinite Marquee"),
  v("logos-spotlight", "block-logo-clouds", "Cursor Spotlight"),
  v("logos-swap", "block-logo-clouds", "Swap Animation"),
  v("logos-single-row", "block-logo-clouds", "Single Row Lift"),

  v("checkout-pay", "block-checkout-moments", "Pay & Confirm"),
  v("checkout-verify", "block-checkout-moments", "Verify Payment"),
  v("checkout-tip", "block-checkout-moments", "Tip & Rate"),

  v("sidebar-simple", "block-sidebar", "Simple Sidebar with Hover"),
  v("sidebar-collapsible", "block-sidebar", "Collapsible Sidebar"),
  v("sidebar-grouped", "block-sidebar", "Grouped Sidebar"),

  v("bento-mentorship", "block-why-choose-us", "Mentorship Bento"),
  v("bento-ats", "block-why-choose-us", "ATS Bento Grid"),
  v("bento-spotlight", "block-why-choose-us", "Spotlight Bento Grid"),

  v("faq-folder", "block-faq-folder-card", "Questions & Answers FAQ"),
  v("faq-searchable", "block-faq-folder-card", "Searchable FAQ"),
  v("faq-chat", "block-faq-folder-card", "Chat FAQ"),

  v("contact-global-signal", "block-contact-page", "Global Signal Contact"),
  v("contact-centered", "block-contact-page", "Centered Intake Contact"),
  v("contact-gradient-proof", "block-contact-page", "Gradient Proof Contact"),
  v("contact-image-story", "block-contact-page", "Image Story Contact"),

  v("text-typewriter-heading", "block-text-animations", "Typewriter Heading"),
  v("text-typewriter-effect", "block-text-animations", "Text Animation Typewriter Effect"),
  v("text-blur-fade-in", "block-text-animations", "Text Animation Blur Fade In"),
  v("text-generate", "block-text-animations", "Text Generate Typewriter with typing sound"),

  v("blog-centered", "block-blog-content-sections", "Blog Content Centered"),
  v("blog-toc", "block-blog-content-sections", "Blog Content With TOC"),
  v("blog-editorial", "block-blog-content-sections", "Blog Content Editorial"),
  v("blog-featured-posts", "block-blog-content-sections", "Blog Header Featured Posts"),
  v("blog-hover-card", "block-blog-content-sections", "Blog Hover Image Card"),
];

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
