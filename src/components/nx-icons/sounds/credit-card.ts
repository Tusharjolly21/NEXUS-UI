import { ding, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.97;

/** A confident tap, three notes climbing along the contactless waves, and an approved ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.G5, t(0.05), 0.08, 0.1, N.C6);
  [N.C6, N.E6, N.G6].forEach((f, i) => blip(c, o, f, t(0.35 + i * 0.15), 0.05, 0.1));
  ding(c, o, N.C7, t(0.85), 0.1, 0.5);
  ding(c, o, N.G7, t(0.9), 0.05, 0.5);
}
