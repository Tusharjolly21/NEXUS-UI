import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.33;

/** A dot-matrix printer chattering through three lines, a carriage zip, and a stamp and cash-register ding for the total. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.1, 0.28, 0.46].forEach((s) => {
    for (let k = 0; k < 5; k++) tick(c, o, t(s + k * 0.04), 0.05, 2800 + k * 250);
  });
  swish(c, o, t(0.34), t(0.06), 1500, 3000, 0.02);
  swish(c, o, t(0.52), t(0.06), 1500, 3000, 0.02);
  thud(c, o, t(0.66), 130, 0.1, 0.06);
  ding(c, o, N.C7, t(0.68), 0.08, 0.5);
  ding(c, o, N.E7, t(0.76), 0.06, 0.5);
}
