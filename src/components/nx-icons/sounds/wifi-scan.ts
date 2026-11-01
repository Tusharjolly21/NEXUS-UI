import { blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.48;

/** A rising sweep as the arcs search, then three notes climbing as each one lights up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.9), 600, 3000, 0.02);
  [N.G5, N.C6, N.E6].forEach((f, i) => blip(c, o, f, t(0.65 + i * 0.17), 0.07, 0.14));
}
