import { ding, plink, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.56;

/** Six heavy crates landing: three low thumps in a row for the floor, two slightly higher for the middle, then a brighter knock and a small bell when the top crate settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.2, 0.29, 0.38].forEach((at, i) => thud(c, o, t(at), 95 + i * 12, 0.26, 0.14));
  [0.52, 0.6].forEach((at, i) => thud(c, o, t(at), 130 + i * 14, 0.22, 0.12));
  thud(c, o, t(0.77), 170, 0.2, 0.1);
  plink(c, o, N.B5, t(0.78), 0.08, 0.14);
  tick(c, o, t(0.86), 0.05, 2600);
  ding(c, o, N.D7, t(0.88), 0.035, 0.3);
}
