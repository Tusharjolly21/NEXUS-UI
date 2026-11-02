import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.62;

/** Two bubbly pops, a high one then a lower one, each followed by a short curling swoosh as the tail swings down, and a soft closing bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  plink(c, o, N.G6, t(0.04), 0.08, 0.14);
  swish(c, o, t(0.12), t(0.2), 2800, 900, 0.025);
  plink(c, o, N.D6, t(0.24), 0.08, 0.14);
  swish(c, o, t(0.32), t(0.2), 2600, 800, 0.025);
  ding(c, o, N.A5, t(0.58), 0.06, 0.4);
  ding(c, o, N.E5, t(0.7), 0.04, 0.4);
}
