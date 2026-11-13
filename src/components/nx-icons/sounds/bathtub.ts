import { ding, plink, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.77;

/** A tiny tick as the drop lets go of the tap, a round watery plop as it hits the bath, and a soft ripple wash that spreads and dies away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.2), 0.07, 4200); // 0.20 the drop lets go of the tap
  plink(c, o, 1300, t(0.2), 0.03, 0.05); // 0.20 a tiny drip note
  blip(c, o, 420, t(0.5), 0.1, 0.14, 950); // 0.50 the drop plops into the water
  ding(c, o, 1760, t(0.5), 0.025, 0.12); // 0.50 a bright droplet splash
  swish(c, o, t(0.5), t(0.45), 1800, 800, 0.02); // 0.50-0.95 the ripple spreads across the bath
}
