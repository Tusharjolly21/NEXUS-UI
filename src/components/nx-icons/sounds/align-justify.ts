import { plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.87;

/** A long stretching sweep that rises as the lines widen, four evenly spaced plucks, and a firm double click when both margins are met. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.55), 700, 3400, 0.035);
  blip(c, o, N.D5, t(0.04), 0.05, 0.5, N.D6, "triangle");
  [N.A5, N.D6, N.A5, N.E6].forEach((f, i) => plink(c, o, f, t(0.16 + i * 0.12), 0.05, 0.12));
  tick(c, o, t(0.7), 0.09, 3000);
  tick(c, o, t(0.76), 0.09, 4600);
}
