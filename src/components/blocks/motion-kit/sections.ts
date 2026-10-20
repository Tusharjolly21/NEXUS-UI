import type { ComponentType } from "react";
import { PreviewCinematicLogoCloudRedesign } from "@/registry/redesign/cinematic-logo-cloud";
import { PreviewStepFlowRedesign } from "@/registry/redesign/step-flow";
import { PreviewHeroAuroraSpotlightRedesign } from "@/registry/redesign/hero-aurora-spotlight";
import { PreviewBentoSignalGridRedesign } from "@/registry/redesign/bento-signal-grid";
import { PreviewFloatGlassNavbarRedesign } from "@/registry/redesign/float-glass-navbar";
import { PreviewOrbitFooterRedesign } from "@/registry/redesign/orbit-footer";
import { PreviewTogglePricingProRedesign } from "@/registry/redesign/toggle-pricing-pro";
import { PreviewSplitSignupConvertRedesign } from "@/registry/redesign/split-signup-convert";
import { PreviewWorkbenchSidebarRedesign } from "@/registry/redesign/workbench-sidebar";
import { PreviewLatticeFeatureGridRedesign } from "@/registry/redesign/lattice-feature-grid";
import { PreviewMotionFaqDisclosureRedesign } from "@/registry/redesign/motion-faq-disclosure";
import { PreviewNebulaCtaGlowRedesign } from "@/registry/redesign/nebula-cta-glow";
import { PreviewEditorialBlogRailRedesign } from "@/registry/redesign/editorial-blog-rail";
import { PreviewSplitContactGlassRedesign } from "@/registry/redesign/split-contact-glass";
import { PreviewDotGridHeroRedesign } from "@/registry/redesign/dot-grid-hero";
import { PreviewStarfieldHeroRedesign } from "@/registry/redesign/starfield-hero";
import { PreviewShootingStarsGridRedesign } from "@/registry/redesign/shooting-stars-grid";
import { PreviewAnimatedBentoGridRedesign } from "@/registry/redesign/animated-bento-grid";
import { PreviewBentoGridSkeletonRedesign } from "@/registry/redesign/bento-grid-skeleton";
import { PreviewScrollingTestimonialsRedesign } from "@/registry/redesign/scrolling-testimonials";
import { MorphingNavStage } from "./stages";
import { KineticHeroStage } from "./kinetic-hero-stage";
import { DriftGallery } from "./drift-gallery";
import { ChangelogPile } from "./changelog-pile";
import { Gravity404 } from "./gravity-404";
import { SpotlightHero } from "./spotlight-hero";
import { HalftonePlanet } from "./halftone-planet";
import { ParallaxStackHero } from "./parallax-stack-hero";
import { LoupeLogoCloud } from "./loupe-logo-cloud";
import { PulseBento } from "./pulse-bento";
import { LiveDemoBento } from "./live-demo-bento";
import { AutoAdvancingTabs } from "./auto-advancing-tabs";
import { ScrambleHeading } from "./scramble-heading";
import { ScrollReadManifesto } from "./scroll-read-manifesto";
import { DrawnTimeline } from "./drawn-timeline";
import { IntegrationsOrbit } from "./integrations-orbit";
import { CountingStats } from "./counting-stats";
import { WallOfLove } from "./wall-of-love";
import { SeatRulerPricing } from "./seat-ruler-pricing";
import { BeamPricing } from "./beam-pricing";
import { SlideToPay } from "./slide-to-pay";
import { InstantSearchFaq } from "./instant-search-faq";
import { CollapsingRail } from "./collapsing-rail";
import { VoiceNoteContact } from "./voice-note-contact";
import { TypoCatchingSignup } from "./typo-catching-signup";

/** Gallery stages take `compact`, not `autoplay` (they always play); the block page passes autoplay. */
const asSection = (c: ComponentType<{ compact?: boolean }>) => c as unknown as ComponentType<{ autoplay?: boolean }>;

/** Motion Kit block sections by variant id, as rendered on their block's page. */
export const MOTION_KIT_SECTIONS: Record<string, ComponentType<{ autoplay?: boolean }>> = {
  "mk-morphing-nav": MorphingNavStage,
  "mk-spotlight-hero": SpotlightHero,
  "mk-halftone-planet": HalftonePlanet,
  "mk-parallax-stack-hero": ParallaxStackHero,
  "mk-loupe-logo-cloud": LoupeLogoCloud,
  "mk-pulse-bento": PulseBento,
  "mk-live-demo-bento": LiveDemoBento,
  "mk-auto-advancing-tabs": AutoAdvancingTabs,
  "mk-scramble-heading": ScrambleHeading,
  "mk-scroll-read-manifesto": ScrollReadManifesto,
  "mk-drawn-timeline": DrawnTimeline,
  "mk-integrations-orbit": IntegrationsOrbit,
  "mk-counting-stats": CountingStats,
  "mk-wall-of-love": WallOfLove,
  "mk-seat-ruler-pricing": SeatRulerPricing,
  "mk-beam-pricing": BeamPricing,
  "mk-slide-to-pay": SlideToPay,
  "mk-instant-search-faq": InstantSearchFaq,
  "mk-collapsing-rail": CollapsingRail,
  "mk-voice-note-contact": VoiceNoteContact,
  "mk-typo-catching-signup": TypoCatchingSignup,
  "mk-kinetic-hero": KineticHeroStage,
  "mk-drift-gallery": DriftGallery,
  "mk-changelog-pile": ChangelogPile,
  "mk-gravity-404": Gravity404,
  // Sections moved over from the components library render as their gallery stage.
  "mk-cinematic-logo-cloud": asSection(PreviewCinematicLogoCloudRedesign),
  "mk-step-flow": asSection(PreviewStepFlowRedesign),
  "mk-hero-aurora-spotlight": asSection(PreviewHeroAuroraSpotlightRedesign),
  "mk-bento-signal-grid": asSection(PreviewBentoSignalGridRedesign),
  "mk-float-glass-navbar": asSection(PreviewFloatGlassNavbarRedesign),
  "mk-orbit-footer": asSection(PreviewOrbitFooterRedesign),
  "mk-toggle-pricing-pro": asSection(PreviewTogglePricingProRedesign),
  "mk-split-signup-convert": asSection(PreviewSplitSignupConvertRedesign),
  "mk-workbench-sidebar": asSection(PreviewWorkbenchSidebarRedesign),
  "mk-lattice-feature-grid": asSection(PreviewLatticeFeatureGridRedesign),
  "mk-motion-faq-disclosure": asSection(PreviewMotionFaqDisclosureRedesign),
  "mk-nebula-cta-glow": asSection(PreviewNebulaCtaGlowRedesign),
  "mk-editorial-blog-rail": asSection(PreviewEditorialBlogRailRedesign),
  "mk-split-contact-glass": asSection(PreviewSplitContactGlassRedesign),
  "mk-dot-grid-hero": asSection(PreviewDotGridHeroRedesign),
  "mk-starfield-hero": asSection(PreviewStarfieldHeroRedesign),
  "mk-shooting-stars-grid": asSection(PreviewShootingStarsGridRedesign),
  "mk-animated-bento-grid": asSection(PreviewAnimatedBentoGridRedesign),
  "mk-bento-grid-skeleton": asSection(PreviewBentoGridSkeletonRedesign),
  "mk-scrolling-testimonials": asSection(PreviewScrollingTestimonialsRedesign),
};
