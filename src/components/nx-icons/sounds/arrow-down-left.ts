import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.9;

/** A falling swish as the arrow dives off, a lighter sweep as it comes back head first, a row of five rising ticks while the shaft draws in, and a single glassy ping for the glint. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 2800, 600, 0.055);
  swish(c, o, t(0.4), t(0.3), 700, 2200, 0.035);
  [0.46, 0.53, 0.6, 0.67, 0.74].forEach((at, i) => tick(c, o, t(at), 0.05 + i * 0.01, 2400 + i * 450));
  ding(c, o, N.B6, t(0.68), 0.055, 0.45);
  blip(c, o, N.E6, t(0.82), 0.04, 0.08);
  plink(c, o, N.C6, t(0.88), 0.035, 0.1);
}
