import { plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.85;

/** Four dry wheel clicks stepping down in pitch with a falling swish, then a soft two-note settle as the new wheel and chevron drop back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.05, 0.15, 0.25, 0.35].forEach((at, i) => tick(c, o, t(at), 0.1, 4800 - i * 450));
  swish(c, o, t(0.05), t(0.4), 2600, 700, 0.025);
  plink(c, o, N.B5, t(0.55), 0.05, 0.12);
  plink(c, o, N.E6, t(0.68), 0.045, 0.14);
}
