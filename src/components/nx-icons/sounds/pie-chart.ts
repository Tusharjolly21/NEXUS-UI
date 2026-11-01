import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.09;

/** A bloop as the slice pops out, a ding at the top of its travel, a bloop back in and a soft thump as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.2), 1000, 2400, 0.025);
  blip(c, o, N.C6, t(0.04), 0.08, 0.16, N.G6);
  ding(c, o, N.E7, t(0.26), 0.06, 0.5);
  blip(c, o, N.G6, t(0.44), 0.07, 0.16, N.C6);
  thud(c, o, t(0.6), 150, 0.1, 0.06);
  tick(c, o, t(0.6), 0.09, 2800);
}
