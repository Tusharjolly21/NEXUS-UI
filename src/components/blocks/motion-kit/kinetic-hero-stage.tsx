import { KineticHero } from "./kinetic-hero";

/** The block page shows sections inside a clipped frame, so the scroll-driven hero scrolls its own box there. */
export function KineticHeroStage({ autoplay }: { autoplay?: boolean }) {
  return <KineticHero contained autoplay={autoplay} />;
}
