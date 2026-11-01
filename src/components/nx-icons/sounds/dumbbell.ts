import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.7;

/** A metal clank as it leaves the floor, a strained whoosh up, a clank at the top, and a heavy thud when it is set down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.14, 3000);
  ding(c, o, N.E7, t(0.02), 0.04, 0.3);
  swish(c, o, t(0.05), t(0.28), 400, 1800, 0.04);
  tick(c, o, t(0.34), 0.12, 2600);
  ding(c, o, N.A6, t(0.34), 0.05, 0.3);
  swish(c, o, t(0.52), t(0.28), 1800, 400, 0.03);
  thud(c, o, t(0.8), 70, 0.18, 0.2);
  tick(c, o, t(0.8), 0.14, 2400);
  ding(c, o, N.E7, t(0.8), 0.04, 0.3);
}
