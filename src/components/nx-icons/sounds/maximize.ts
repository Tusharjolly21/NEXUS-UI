import { blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.4;

/** A rising swish as the corners push outward, a big pop at full stretch, and a soft thud as everything settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.24), 700, 4200, 0.05);
  blip(c, o, N.E6, t(0.25), 0.1, 0.1, N.A6);
  thud(c, o, t(0.26), 150, 0.1, 0.06);
  thud(c, o, t(0.48), 100, 0.12, 0.08);
}
