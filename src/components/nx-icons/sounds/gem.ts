import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.06;

/** A glassy run of five rising notes as the facets draw in, and a long, shining ring as it sparkles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.E6, N.G6, N.B6, N.E7, N.G7].forEach((f, i) => ding(c, o, f, t(0.04 + i * 0.05), 0.05, 0.5));
  swish(c, o, t(0.02), t(0.4), 3000, 6000, 0.015);
  tick(c, o, t(0.38), 0.06, 6000);
  ding(c, o, N.C8, t(0.42), 0.06, 0.9);
}
