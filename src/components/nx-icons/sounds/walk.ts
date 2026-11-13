import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two dull footfalls at the end of each stride, a scuff of cloth as the legs pass, and a thin swish as the speed lines stream. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.08), t(0.25), 2200, 800, 0.012); // 0.08-0.33 the speed lines stream
  puff(c, o, t(0.25), 0.06, 1500, 0.035, "bandpass"); // 0.25 the legs pass each other
  thud(c, o, t(0.5), 125, 0.13, 0.1); // 0.50 the front foot lands
  puff(c, o, t(0.75), 0.06, 1500, 0.035, "bandpass"); // 0.75 the legs pass again
  thud(c, o, t(1.0), 150, 0.13, 0.1); // 1.00 the other foot lands
}
