import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.36;

/** Two rising sweeps as the chevrons float away in turn, two falling sweeps as they glide back, and a pair of rising notes with a faint shimmer as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.26), 700, 2600, 0.05);
  swish(c, o, t(0.14), t(0.26), 900, 3000, 0.04);
  swish(c, o, t(0.4), t(0.3), 2600, 800, 0.035);
  swish(c, o, t(0.52), t(0.3), 2800, 900, 0.03);
  plink(c, o, N.E5, t(0.66), 0.07, 0.12);
  plink(c, o, N.B5, t(0.78), 0.06, 0.16);
  ding(c, o, N.G7, t(0.8), 0.03, 0.4);
}
