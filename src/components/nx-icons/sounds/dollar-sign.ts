import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.08;

/** A rising scratch as the S is drawn, two small clacks as the bars drop in, then a cash-register ding and a soft thud as the sign pops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 800, 3000, 0.03);
  tick(c, o, t(0.32), 0.1, 3400);
  tick(c, o, t(0.35), 0.1, 2800);
  ding(c, o, N.E6, t(0.58), 0.08, 0.45);
  ding(c, o, N.G6, t(0.64), 0.07, 0.45);
  ding(c, o, N.C7, t(0.72), 0.07, 0.6);
  thud(c, o, t(0.7), 130, 0.1, 0.08);
}
