import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.44;

/** A four-note rising arpeggio as it spins, a rush of air, and three sparkles as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C6, N.E6, N.G6, N.C7].forEach((f, i) => plink(c, o, f, t(0.12 + i * 0.18), 0.1 - i * 0.012));
  swish(c, o, t(0.05), t(0.7), 1200, 6000, 0.02);
  [0.7, 0.8, 0.9].forEach((at, i) => ding(c, o, [N.E7, N.G7, N.C8][i], t(at), 0.04, 0.4));
}
