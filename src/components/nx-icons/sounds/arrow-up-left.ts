import { plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.35;

/** A rising swish as the arrow streaks away, three bubbly echoes that step down in pitch and volume, a soft sweep back in, and a quiet click as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 800, 3200, 0.05);
  plink(c, o, N.A5, t(0.1), 0.07, 0.12);
  plink(c, o, N.E5, t(0.19), 0.05, 0.12);
  plink(c, o, N.C5, t(0.28), 0.03, 0.12);
  swish(c, o, t(0.42), t(0.34), 2400, 700, 0.035);
  tick(c, o, t(0.78), 0.09, 3000);
}
