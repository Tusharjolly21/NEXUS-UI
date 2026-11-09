import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** Cord and cloth swishes that fade as the tassel swings out, back, and settles, with four marble-like bell tones rising as the columns light up one after another. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.18, 2600, 4200, 0.04); // 0.09 the tassel swings out fastest
  swish(c, o, t(0.19), 0.18, 4200, 2400, 0.045); // 0.27 swings back across
  swish(c, o, t(0.37), 0.18, 2400, 3800, 0.032); // 0.45 swings out again
  swish(c, o, t(0.55), 0.18, 3600, 2400, 0.022); // 0.63 a smaller swing back
  swish(c, o, t(0.73), 0.17, 2400, 3000, 0.012); // 0.81 the last small swing settles
  ding(c, o, 698, t(0.17), 0.07, 0.4); // 0.17 the first column lights
  ding(c, o, 831, t(0.31), 0.07, 0.4); // 0.31 the second column lights
  ding(c, o, 988, t(0.45), 0.07, 0.4); // 0.45 the third column lights
  ding(c, o, 1175, t(0.59), 0.07, 0.4); // 0.59 the fourth column lights
}
