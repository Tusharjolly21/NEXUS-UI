import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.48;

/** A soft hum as the person nods, a quick pen-stroke sweep and dry tick while the tick draws, then three bright notes, E, B and a high E, as it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 300, t(0.02), 0.05, 0.12, 380, "triangle");
  swish(c, o, t(0.1), t(0.28), 1800, 3600, 0.02);
  tick(c, o, t(0.14), 0.05, 4200);
  plink(c, o, N.E5, t(0.3), 0.08, 0.14);
  plink(c, o, N.B5, t(0.4), 0.07, 0.14);
  ding(c, o, N.E6, t(0.5), 0.07, 0.5);
}
