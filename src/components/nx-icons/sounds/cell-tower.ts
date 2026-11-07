import { plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low beacon blip, then two rising pings, one for each pair of signal arcs, and the same pattern again a step higher with a second beacon blip. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 330, t(0.02), 0.06, 0.1, undefined, "triangle");
  plink(c, o, N.D5, t(0.06), 0.08, 0.2);
  plink(c, o, N.A5, t(0.23), 0.08, 0.2);
  swish(c, o, t(0.05), t(0.4), 1100, 2600, 0.015);
  blip(c, o, 330, t(0.46), 0.06, 0.1, undefined, "triangle");
  plink(c, o, 698, t(0.5), 0.07, 0.2);
  plink(c, o, N.C6, t(0.67), 0.07, 0.3);
}
