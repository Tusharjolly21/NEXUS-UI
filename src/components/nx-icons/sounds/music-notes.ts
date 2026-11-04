import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.64;

/** Three soft plucked notes, one as each musical note reaches the top of its drift, each with a faint bell above it and a breath of air rising beneath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.5), 1100, 2600, 0.012);
  plink(c, o, N.E5, t(0.4), 0.07, 0.2);
  ding(c, o, N.B6, t(0.43), 0.025, 0.4);
  swish(c, o, t(0.85), t(0.5), 1100, 2600, 0.012);
  plink(c, o, N.A5, t(1.2), 0.07, 0.2);
  ding(c, o, N.E7, t(1.23), 0.02, 0.4);
  swish(c, o, t(1.65), t(0.5), 1100, 2600, 0.012);
  plink(c, o, N.G5, t(2.0), 0.07, 0.2);
  ding(c, o, N.D7, t(2.03), 0.02, 0.3);
}
