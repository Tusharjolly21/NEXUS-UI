import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft thump and a small click as the fingertip taps down, then a glassy bell and two higher echoes as the ripple spreads, with a faint sweep outward. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.19), 230, 0.12, 0.09);
  tick(c, o, t(0.18), 0.12, 4400);
  swish(c, o, t(0.2), t(0.36), 500, 2600, 0.02);
  ding(c, o, N.A5, t(0.2), 0.06, 0.5);
  ding(c, o, N.E7, t(0.3), 0.035, 0.45);
  ding(c, o, N.B6, t(0.42), 0.03, 0.4);
}
