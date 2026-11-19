import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.86;

/** A heavy watery bloop at each end of the rocking slice, sloshing a little softer every time until it lies level. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 250, 500, 0.02); // 0.00-0.20 the slice tips over on its rind
  blip(c, o, 196, t(0.2), 0.11, 0.12, 150); // 0.20 the juice sloshes to the right
  blip(c, o, 233, t(0.42), 0.09, 0.11, 175); // 0.42 it rocks back the other way
  blip(c, o, 207, t(0.62), 0.06, 0.1, 160); // 0.62 a smaller rock
  blip(c, o, 247, t(0.82), 0.035, 0.09, 190); // 0.82 the last little slosh
}
