import { ding, plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.58;

/** A soft swish as the bars slide together, two quick rising plucks as they cross into an X, and a short bright bell as it locks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 700, 2400, 0.04);
  tick(c, o, t(0.04), 0.07, 5200);
  plink(c, o, N.E5, t(0.1), 0.07, 0.12);
  plink(c, o, N.A5, t(0.22), 0.07, 0.14);
  ding(c, o, N.E6, t(0.36), 0.07, 0.4);
}
