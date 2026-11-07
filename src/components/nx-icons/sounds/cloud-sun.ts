import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A gentle breeze, then a warm two-note chime that rises as the sun comes out and a softer third note that falls back as the cloud drifts across again. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.55), 500, 1800, 0.022);
  ding(c, o, N.G5, t(0.12), 0.05, 0.55);
  ding(c, o, N.D6, t(0.3), 0.05, 0.55);
  ding(c, o, N.B5, t(0.52), 0.04, 0.5);
  swish(c, o, t(0.55), t(0.5), 1700, 500, 0.018);
  plink(c, o, N.E6, t(0.78), 0.04, 0.2);
}
