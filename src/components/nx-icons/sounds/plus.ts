import { ding, plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.51;

/** A rising pop as it turns, with a bubbly note and a fizz as the green ring spreads. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  plink(c, o, N.E6, t(0.04), 0.09, 0.14);
  blip(c, o, N.C6, t(0.04), 0.07, 0.4, N.G6);
  swish(c, o, t(0.1), t(0.4), 1800, 4200, 0.03);
  ding(c, o, N.C7, t(0.5), 0.06, 0.4);
}
