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
import { Clothesline } from "./clothesline";
import { SeatRulerPricing } from "./seat-ruler-pricing";
import { BeamPricing } from "./beam-pricing";
import { SlideToPay } from "./slide-to-pay";
import { InstantSearchFaq } from "./instant-search-faq";
import { CollapsingRail } from "./collapsing-rail";
import { VoiceNoteContact } from "./voice-note-contact";
import { TypoCatchingSignup } from "./typo-catching-signup";
import { VelocityMarquee } from "./velocity-marquee";
import { LogoStories } from "./logo-stories";
import { FilterableLogoWall } from "./filterable-logo-wall";
import { CursorCrowdHero } from "./cursor-crowd-hero";
import { XrayHero } from "./xray-hero";
import { CircuitHero } from "./circuit-hero";
import { FlipDotHero } from "./flip-dot-hero";
import { TeamClock } from "./team-clock";
import { StatsOdometer } from "./stats-odometer";
import { BlogWithContents } from "./blog-with-contents";
import { WaitlistCta } from "./waitlist-cta";
import { AuthMorph } from "./auth-morph";
import { ParallaxSlider } from "./parallax-slider";
import { CardRail } from "./card-rail";
import { StickyScrollStory } from "./sticky-scroll-story";
import { BeamTimeline } from "./beam-timeline";
import { StackingCards } from "./stacking-cards";
import { BentoFeatures } from "./bento-features";
import { PreviewBlockVariantMkScrollNavbar } from "@/registry/blocks/nexus-essentials-blocks-c";
import { MorphMenu } from "./morph-menu";
import { AnnounceBar } from "./announce-bar";

/** Gallery stages take `compact`, not `autoplay` (they always play); the block page passes autoplay. */
const asSection = (c: ComponentType<{ compact?: boolean }>) => c as unknown as ComponentType<{ autoplay?: boolean }>;

/** Motion Kit block sections by variant id, as rendered on their block's page. */
export const MOTION_KIT_SECTIONS: Record<string, ComponentType<{ autoplay?: boolean }>> = {
  "mk-morphing-nav": MorphingNavStage,
  "mk-team-clock": TeamClock as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-stats-odometer": StatsOdometer as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-blog-with-contents": BlogWithContents as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-waitlist-cta": WaitlistCta as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-auth-morph": AuthMorph as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-parallax-slider": ParallaxSlider as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-card-rail": CardRail as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-sticky-scroll-story": StickyScrollStory as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-beam-timeline": BeamTimeline as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-stacking-cards": StackingCards as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-bento-features": BentoFeatures as unknown as ComponentType<{ autoplay?: boolean }>,
  // The navbar needs a scrolling frame with a page inside it, so the section is its preview.
  "mk-scroll-navbar": asSection(PreviewBlockVariantMkScrollNavbar),
  "mk-morph-menu": MorphMenu as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-announce-bar": AnnounceBar as unknown as ComponentType<{ autoplay?: boolean }>,
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
  "mk-clothesline": Clothesline,
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
  // The marquee drifts on its own, so it has no autoplay prop to receive.
  "mk-velocity-marquee": VelocityMarquee as unknown as ComponentType<{ autoplay?: boolean }>,
  "mk-logo-stories": LogoStories,
  "mk-filterable-logo-wall": FilterableLogoWall,
  "mk-cursor-crowd-hero": CursorCrowdHero,
  "mk-xray-hero": XrayHero,
  "mk-circuit-hero": CircuitHero,
  "mk-flip-dot-hero": FlipDotHero,
};
