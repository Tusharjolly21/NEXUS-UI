import { plink, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.1;

/** A whistle as the apple drops, three thuds each smaller than the last as it bounces, a crisp snap, and a leaf-rustle pluck. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 2000, 600, 0.03);
  thud(c, o, t(0.25), 110, 0.22, 0.12);
  thud(c, o, t(0.63), 120, 0.12, 0.09);
  thud(c, o, t(0.9), 140, 0.05, 0.06);
  puff(c, o, t(0.26), 0.08, 700, 0.04, "lowpass");
  puff(c, o, t(0.3), 0.2, 4600, 0.02, "highpass");
  plink(c, o, N.A6, t(0.48), 0.05, 0.12);
}
