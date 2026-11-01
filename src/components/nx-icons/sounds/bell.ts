import { ding, plink, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.64;

/** A glassy ding on every swing, fading as the bell settles, and a pop when the red badge lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.D6, t(0.257), 0.14, 0.9);
  ding(c, o, N.G6, t(0.386), 0.1, 0.8);
  ding(c, o, N.D6, t(0.514), 0.08, 0.7);
  ding(c, o, N.G6, t(0.643), 0.05, 0.6);
  plink(c, o, N.A5, t(0.14), 0.1);
  ding(c, o, N.D7, t(0.345), 0.05, 0.5);
}
