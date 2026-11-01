import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.2;

/** A ratcheting rattle as the awning rolls down, a thud, and the two ting-a-ling notes of a shop-door bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.1, 0.16, 0.22, 0.28, 0.34].forEach((at, i) => tick(c, o, t(at), 0.06, 3600 - i * 250));
  swish(c, o, t(0.02), t(0.32), 3000, 1000, 0.03);
  thud(c, o, t(0.4), 100, 0.12, 0.08);
  ding(c, o, N.E7, t(0.5), 0.08, 0.5);
  ding(c, o, N.G7, t(0.58), 0.07, 0.5);
  ding(c, o, N.E7, t(0.66), 0.05, 0.4);
  tick(c, o, t(0.9), 0.1, 2600);
}
