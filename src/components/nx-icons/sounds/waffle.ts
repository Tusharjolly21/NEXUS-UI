import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.0;

/** A light whoosh as the butter hops up, then a soft buttery splat with a crisp waffle crunch as it lands, and a small pat on the rebound. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.26), 500, 1300, 0.015); // 0.00-0.26 the butter hops up
  thud(c, o, t(0.47), 210, 0.09, 0.08); // 0.47 the butter lands
  puff(c, o, t(0.47), 0.05, 700, 0.05, "lowpass"); // 0.47 a buttery splat
  tick(c, o, t(0.48), 0.06, 2900); // 0.48 the crisp waffle crunches under it
  puff(c, o, t(0.63), 0.03, 800, 0.02, "lowpass"); // 0.63 a small pat on the rebound
}
