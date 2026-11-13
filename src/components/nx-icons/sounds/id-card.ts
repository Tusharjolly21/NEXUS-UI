import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A card flick as it lifts, then three quick pen-like blips as the lines are rewritten, and a tiny tick as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.21), 1800, 3200, 0.02); // 0.00-0.21 the card lifts and tilts
  blip(c, o, 1900, t(0.42), 0.045, 0.05, 2300, "square"); // 0.42 the first line is written
  blip(c, o, 2100, t(0.52), 0.045, 0.05, 2500, "square"); // 0.52 the second line is written
  blip(c, o, 1700, t(0.62), 0.045, 0.05, 2000, "square"); // 0.62 the third line is written
  tick(c, o, t(0.6), 0.1, 3600); // 0.60 the card lands flat
}
