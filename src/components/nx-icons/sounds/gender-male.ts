import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.95;

/** Two quick rising whooshes as the arrow thrusts out, each ending in a short buzzy stop, and a soft knock as the arrow settles home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 600, 2400, 0.04); // 0.00-0.20 the arrow thrusts out
  blip(c, o, 330, t(0.2), 0.05, 0.07, 240, "square"); // 0.20 the arrow stops at full stretch
  swish(c, o, t(0.4), t(0.18), 700, 2700, 0.035); // 0.40-0.58 the arrow thrusts out again
  blip(c, o, 370, t(0.576), 0.045, 0.07, 260, "square"); // 0.58 the second stop
  thud(c, o, t(0.8), 150, 0.08, 0.08); // 0.80 the arrow settles back on the ring
}
