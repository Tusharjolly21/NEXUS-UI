import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A plastic tip tick, then four watery sloshes that get smaller as the water settles, each a short bubbly glide. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.18), 0.05, 1800); // 0.18 the bottle tips
  blip(c, o, 300, t(0.23), 0.06, 0.1, 520); // 0.23 the water slides to the left
  blip(c, o, 340, t(0.43), 0.055, 0.1, 580); // 0.43 the water slides back
  blip(c, o, 380, t(0.61), 0.04, 0.09, 600); // 0.61 a smaller slosh
  blip(c, o, 420, t(0.79), 0.025, 0.08, 620); // 0.79 a last small slosh
  swish(c, o, t(0.25), t(0.5), 500, 900, 0.01); // 0.25-0.75 water rushing in the bottle
}
