import { swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.53;

/** A quick forward swish as the triangle lunges, a tick of speed lines, and a click as the bar follows. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 700, 3600, 0.06);
  tick(c, o, t(0.06), 0.1, 4800);
  tick(c, o, t(0.12), 0.08, 4200);
  swish(c, o, t(0.26), t(0.2), 3000, 900, 0.03);
  tick(c, o, t(0.5), 0.12, 3000);
}
