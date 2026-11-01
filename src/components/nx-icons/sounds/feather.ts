import { ding, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.32;

/** Three light airy sweeps as the feather swings, with three soft chimes floating downwards. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.35), 800, 2600, 0.02);
  swish(c, o, t(0.4), t(0.35), 2400, 700, 0.018);
  swish(c, o, t(0.75), t(0.3), 900, 2000, 0.015);
  ding(c, o, N.B6, t(0.3), 0.035, 0.7);
  ding(c, o, N.G6, t(0.6), 0.03, 0.7);
  ding(c, o, N.E6, t(0.92), 0.025, 0.8);
}
