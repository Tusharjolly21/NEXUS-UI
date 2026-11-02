import { ding, plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.81;

/** Seven quick ticks falling in pitch as the line circles the ring, a swish to the left, a lighter swish as the arrow returns, and a soft two note click as the shaft draws in, and a faint bell on top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3, 4, 5, 6].forEach((i) => tick(c, o, t(0.02 + i * 0.05), 0.05, 4800 - i * 330));
  swish(c, o, t(0.14), t(0.26), 3000, 700, 0.05);
  swish(c, o, t(0.5), t(0.3), 700, 2200, 0.03);
  plink(c, o, N.A5, t(0.72), 0.06, 0.12);
  plink(c, o, N.E5, t(0.8), 0.06, 0.16);
  ding(c, o, N.G6, t(0.86), 0.03, 0.3);
}
