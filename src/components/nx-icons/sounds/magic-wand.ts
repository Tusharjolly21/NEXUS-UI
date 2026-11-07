import { ding, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick whoosh as the wand flicks, a bright glassy chime as the star flares, then five sparkling bells climbing in fourths and a faint shimmer of air. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 700, 3400, 0.05);
  swish(c, o, t(0.18), t(0.2), 3200, 900, 0.03);
  ding(c, o, N.E6, t(0.3), 0.1, 0.5);
  [N.B5, N.E6, N.A6, N.D7, N.G7].forEach((f, i) => ding(c, o, f, t(0.4 + i * 0.09), 0.05, 0.35));
  puff(c, o, t(0.38), 0.5, 7000, 0.015, "highpass");
}
