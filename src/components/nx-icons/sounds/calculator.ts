import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.37;

/** Six crisp key clicks, each a little different, and a ding when the sum is done. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3, 4, 5].forEach((i) => { tick(c, o, t(0.06 + i * 0.08), 0.1, 2600 + (i % 3) * 500); blip(c, o, 500 + i * 60, t(0.06 + i * 0.08), 0.04, 0.05); });
  ding(c, o, N.C7, t(0.58), 0.08, 0.5);
  ding(c, o, N.G6, t(0.52), 0.05, 0.4);
}
