import { ding, plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.62;

/** Pairs of notes sliding in from high and low and meeting in the middle, one pair per line, ending on a single warm bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.E6, t(0.04), 0.045, 0.14, N.A5, "triangle");
  blip(c, o, N.A4, t(0.04), 0.045, 0.14, N.A5 / 2, "triangle");
  blip(c, o, N.G5, t(0.2), 0.05, 0.14, N.D5, "sine");
  blip(c, o, N.C5, t(0.2), 0.05, 0.14, N.D5, "sine");
  swish(c, o, t(0.05), t(0.4), 2600, 900, 0.02);
  plink(c, o, N.D6, t(0.42), 0.06, 0.15);
  ding(c, o, N.G5, t(0.55), 0.07, 0.45);
}
