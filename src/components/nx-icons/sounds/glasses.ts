import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.55;

/** A slide down the nose, a tap as they are pushed back up, and two glints of light off the lenses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.18), 1800, 700, 0.025);
  tick(c, o, t(0.21), 0.1, 3400);
  thud(c, o, t(0.21), 200, 0.04, 0.03);
  swish(c, o, t(0.3), t(0.2), 700, 1800, 0.02);
  ding(c, o, N.E7, t(0.4), 0.05, 0.3);
  ding(c, o, N.B6 * 2, t(0.5), 0.04, 0.3);
  tick(c, o, t(0.66), 0.06, 2800);
}
