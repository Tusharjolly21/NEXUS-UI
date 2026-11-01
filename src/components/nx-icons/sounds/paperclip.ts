import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.51;

/** A springy snap as the clip pops up, then three wobbling boings that settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.12, 3200);
  [[0.05, 540, 880], [0.25, 700, 520], [0.45, 600, 660], [0.65, 620, 600]].forEach(([at, f, to], i) => blip(c, o, f, t(at), 0.08 - i * 0.015, 0.14, to));
  swish(c, o, t(0.05), t(0.3), 2500, 1200, 0.02);
}
