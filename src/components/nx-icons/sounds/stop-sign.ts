import { ding, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A sheet-metal sign rattles: a swish as it swings, then four dull tonks at each end of the wobble that get quieter as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 500, 1700, 0.03); // 0.00-0.18 the sign swings out
  thud(c, o, t(0.18), 170, 0.12, 0.1); // 0.18 first extreme (-7 deg)
  ding(c, o, 277, t(0.18), 0.09, 0.32);
  ding(c, o, 262, t(0.405), 0.06, 0.28); // 0.405 swings back (+5 deg)
  ding(c, o, 247, t(0.585), 0.04, 0.24); // 0.585 third reversal
  ding(c, o, 233, t(0.765), 0.025, 0.2); // 0.765 last small reversal
}
