import { plink, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A small pick-up tick, a smooth slide across, a wooden clack as the card lands in the next column, and the same glide back with a softer tap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.03), 0.08, 3800);
  swish(c, o, t(0.06), t(0.34), 900, 2600, 0.04);
  thud(c, o, t(0.5), 230, 0.12, 0.06);
  plink(c, o, 790, t(0.52), 0.08, 0.14);
  swish(c, o, t(0.76), t(0.3), 2400, 800, 0.032);
  thud(c, o, t(1.04), 190, 0.08, 0.05);
  tick(c, o, t(1.06), 0.05, 3000);
}
