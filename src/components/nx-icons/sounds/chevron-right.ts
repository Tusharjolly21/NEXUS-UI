import { plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.5;

/** A quick whip to the right followed by a two-step question-and-answer, rising on A and B. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.18), 900, 3200, 0.04);
  plink(c, o, N.A5, t(0.22), 0.07, 0.12);
  plink(c, o, N.B5, t(0.34), 0.07, 0.16);
  swish(c, o, t(0.3), t(0.2), 2800, 900, 0.015);
}
