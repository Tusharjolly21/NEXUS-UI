import { ding, plink, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.11;

/** Four bubbly plucks that climb one per loop as each lights up, then a soft thump and a bright tick for the key press with a low bell under it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.A4, N.E5, N.A5, N.D6].forEach((f, i) => plink(c, o, f, t(0.12 + i * 0.14), 0.08, 0.14));
  swish(c, o, t(0.08), t(0.55), 700, 2600, 0.02);
  thud(c, o, t(0.66), 150, 0.2, 0.1);
  tick(c, o, t(0.67), 0.12, 4400);
  ding(c, o, N.G5, t(0.7), 0.05, 0.4);
}
