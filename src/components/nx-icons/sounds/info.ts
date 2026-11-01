import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** A little pop, a bubbly plip as the dot lands, a rising sweep as the stem draws, and a soft note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.02), 0.09, 0.1, 780);
  plink(c, o, N.A5, t(0.2), 0.12);
  tick(c, o, t(0.2), 0.08, 4200);
  swish(c, o, t(0.26), t(0.28), 900, 2200, 0.025);
  ding(c, o, N.E6, t(0.56), 0.07, 0.5);
}
