import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.46;

/** Two quick sliding zips as the bars pull back into the C and shoot through it again, each ending in a crisp stop, and a soft knock as the C kicks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.26), 3300, 1500, 0.03); // 0.00-0.26 the upper bar pulls back
  swish(c, o, t(0.27), t(0.25), 1700, 4100, 0.035); // 0.26-0.52 the upper bar shoots back through the C
  tick(c, o, t(0.525), 0.07, 5600); // 0.52 the upper bar stops at full length
  thud(c, o, t(0.52), 205, 0.07, 0.07); // 0.52 the C kicks back
  swish(c, o, t(0.4), t(0.27), 1900, 4600, 0.03); // 0.38-0.68 the lower bar shoots through
  tick(c, o, t(0.675), 0.06, 6300); // 0.68 the lower bar stops
  blip(c, o, 430, t(0.72), 0.03, 0.08, 470, "triangle"); // 0.72 the C rocks back the other way
}
