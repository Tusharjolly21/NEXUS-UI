import type { BlockPlaygrounds } from "./types";

export type { BlockPlaygrounds, SectionPlayground } from "./types";

/** Adds the sections that came over from the components library to a block's own playgrounds. */
async function withMoved(block: string, own?: Promise<{ default: BlockPlaygrounds }>): Promise<{ default: BlockPlaygrounds }> {
  const [mine, moved] = await Promise.all([own ?? Promise.resolve({ default: {} }), import("./moved")]);
  return { default: { ...mine.default, ...moved.movedFor(block) } };
}

/**
 * Lazy loaders, one per block: a block's playground module (and the components it renders) is only
 * downloaded when someone opens a Customize tab on that block's page.
 */
export const PLAYGROUND_LOADERS: Record<string, () => Promise<{ default: BlockPlaygrounds }>> = {
  "block-pricing-section": () => withMoved("block-pricing-section", import("./pricing-section")),
  "block-interactive-dots": () => import("./interactive-dots"),
  "block-logo-clouds": () => withMoved("block-logo-clouds", import("./logo-clouds")),
  "block-checkout-moments": () => import("./checkout-moments"),
  "block-sidebar": () => withMoved("block-sidebar", import("./sidebar")),
  "block-why-choose-us": () => withMoved("block-why-choose-us", import("./why-choose-us")),
  "block-faq-folder-card": () => withMoved("block-faq-folder-card", import("./faq-folder-card")),
  "block-contact-page": () => withMoved("block-contact-page", import("./contact-page")),
  "block-text-animations": () => import("./text-animations"),
  "block-blog-content-sections": () => withMoved("block-blog-content-sections", import("./blog-content-sections")),
  "block-navigation": () => withMoved("block-navigation", import("./navigation")),
  "block-hero": () => withMoved("block-hero", import("./hero")),
  "block-features": () => withMoved("block-features", import("./features")),
  "block-social-proof": () => withMoved("block-social-proof", import("./social-proof")),
  "block-newsletter": () => import("./newsletter"),
  "block-gallery": () => import("./gallery"),
  "block-changelog": () => import("./changelog"),
  "block-404": () => import("./not-found"),
  "block-comparison": () => withMoved("block-comparison"),
  "block-cta": () => withMoved("block-cta"),
  "block-footer": () => withMoved("block-footer"),
  "block-signup": () => withMoved("block-signup"),
};
