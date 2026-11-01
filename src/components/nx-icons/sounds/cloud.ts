import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.65;

/** A slow, airy chord that swells and floats upward, a breath of wind, and one faint high chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.G5, N.B5, N.D6, N.G6].forEach((f, i) => blip(c, o, f, t(0.05 + i * 0.08), 0.035, 0.9, undefined, "triangle"));
  swish(c, o, t(0.02), t(0.8), 1200, 3200, 0.015);
  ding(c, o, N.D7, t(0.55), 0.04, 0.8);
}
