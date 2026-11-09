import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A metal shutter rattling: a run of rolling clicks as the slats climb into the frame, a clunk at the top, then a quicker rattle down and two heavy thumps as the slats land on the floor. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.42, 700, 2000, 0.03); // 0.00 to 0.42 the door slats roll up
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => tick(c, o, t(0.03 + i * 0.05), 0.07, 2100 + i * 110)); // 0.03 to 0.38 slats ratchet over the roller
  thud(c, o, t(0.4), 170, 0.12, 0.07); // 0.40 the first slat reaches the top
  swish(c, o, t(0.62), 0.4, 2000, 700, 0.03); // 0.62 to 1.02 the slats roll back down
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => tick(c, o, t(0.65 + i * 0.05), 0.07, 2900 - i * 110)); // 0.65 to 1.0 rattle on the way down
  thud(c, o, t(0.99), 95, 0.3, 0.14); // 1.00 the first slat lands on the floor
  thud(c, o, t(1.06), 130, 0.2, 0.1); // 1.07 the second slat lands
}
