import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.39;

/** A rushing whoosh as the triangle spins, three bright glassy notes in rising fifths as each corner lights, and a low soft thump as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.6), 400, 2200, 0.05);
  [N.C5, N.G5, N.E6].forEach((f, i) => ding(c, o, f, t(0.3 + i * 0.16), 0.06, 0.35));
  thud(c, o, t(0.86), 130, 0.12, 0.1);
}
