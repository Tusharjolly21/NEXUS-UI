import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.2;

/** A bell stroke that is cut short, a handful of damped wobbles as it swings, and a soft muting thud. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.A6, t(0.04), 0.09, 0.28);
  ding(c, o, N.E6, t(0.16), 0.05, 0.2);
  ding(c, o, N.C6, t(0.27), 0.03, 0.16);
  swish(c, o, t(0.12), t(0.36), 2000, 600, 0.03);
  thud(c, o, t(0.52), 120, 0.2, 0.14);
  puff(c, o, t(0.54), 0.08, 800, 0.04, "lowpass");
}
