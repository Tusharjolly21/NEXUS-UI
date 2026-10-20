import type { BlockPlaygrounds } from "./types";

export type { BlockPlaygrounds, SectionPlayground } from "./types";

/**
 * Lazy loaders, one per block: a block's playground module (and the components it renders) is only
 * downloaded when someone opens a Customize tab on that block's page.
 */
export const PLAYGROUND_LOADERS: Record<string, () => Promise<{ default: BlockPlaygrounds }>> = {
  "block-pricing-section": () => import("./pricing-section"),
  "block-interactive-dots": () => import("./interactive-dots"),
  "block-logo-clouds": () => import("./logo-clouds"),
  "block-checkout-moments": () => import("./checkout-moments"),
  "block-sidebar": () => import("./sidebar"),
  "block-why-choose-us": () => import("./why-choose-us"),
  "block-faq-folder-card": () => import("./faq-folder-card"),
  "block-contact-page": () => import("./contact-page"),
  "block-text-animations": () => import("./text-animations"),
  "block-blog-content-sections": () => import("./blog-content-sections"),
  "block-navigation": () => import("./navigation"),
  "block-hero": () => import("./hero"),
  "block-features": () => import("./features"),
  "block-social-proof": () => import("./social-proof"),
  "block-newsletter": () => import("./newsletter"),
  "block-gallery": () => import("./gallery"),
  "block-changelog": () => import("./changelog"),
  "block-404": () => import("./not-found"),
};
