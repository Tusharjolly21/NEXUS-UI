import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.03;

/** A key sliding into a lock, a ratchet of clicks as it turns, a solid thunk, and a ding of unlocking. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.1, 3600);
  swish(c, o, t(0.0), t(0.15), 1600, 2800, 0.02);
  [0.14, 0.2, 0.26, 0.32].forEach((at, i) => tick(c, o, t(at), 0.07, 3000 - i * 200));
  thud(c, o, t(0.38), 120, 0.2, 0.1);
  tick(c, o, t(0.4), 0.14, 2200);
  ding(c, o, N.E6, t(0.46), 0.07, 0.5);
  thud(c, o, t(0.8), 130, 0.1, 0.07);
  tick(c, o, t(0.8), 0.1, 2400);
}
