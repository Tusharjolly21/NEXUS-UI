import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.21;

/** Five pentatonic plucks, one for each petal as it turns, a rising sweep, and a twinkling bloom of three bells. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C5, N.D5, N.E5, N.G5, N.A5].forEach((f, i) => plink(c, o, f, t(0.08 + i * 0.1), 0.07, 0.18));
  swish(c, o, t(0.05), t(0.55), 1200, 3800, 0.02);
  ding(c, o, N.C7, t(0.68), 0.06, 0.55);
  ding(c, o, N.E7, t(0.78), 0.04, 0.45);
}
