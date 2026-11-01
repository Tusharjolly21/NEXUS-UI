import { plink, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.92;

/** A creaky door, two windows switching on with soft tinks, and a thud as the house lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.2), 500, 1800, 0.03);
  blip(c, o, 300, t(0.08), 0.05, 0.16, 430, "triangle");
  plink(c, o, N.A5, t(0.3), 0.07);
  plink(c, o, N.B5, t(0.42), 0.07);
  thud(c, o, t(0.55), 140, 0.22, 0.1);
  tick(c, o, t(0.62), 0.1, 2600);
}
