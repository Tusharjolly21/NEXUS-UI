import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.94;

/** A warm rising swell, three glowing notes climbing as the sun fills with gold, and a handful of sparkles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 196, t(0), 0.07, 1.0, 392, "triangle");
  ding(c, o, N.G5, t(0.1), 0.07, 0.9);
  ding(c, o, N.D6, t(0.3), 0.07, 0.9);
  ding(c, o, N.G6, t(0.5), 0.06, 0.9);
  [0.7, 0.85, 1.0].forEach((at, i) => ding(c, o, N.C8 - i * 300, t(at), 0.03, 0.4));
  swish(c, o, t(0.05), t(0.6), 800, 3500, 0.02);
}
