import type { ComponentType } from "react";
import { MorphingNavStage } from "./stages";
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
};
