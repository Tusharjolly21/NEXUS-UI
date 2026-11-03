import { ding, plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.38;

/** A soft bubble as the source dot pulses, two rising pings as the waves go out one after the other, a thin broadcast sweep, then a glassy two-note chime when the screen lights up to receive. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.A4, t(0.02), 0.07, 0.1, N.D5);
  plink(c, o, N.E5, t(0.12), 0.07, 0.18);
  plink(c, o, N.A5, t(0.3), 0.07, 0.2);
  swish(c, o, t(0.1), t(0.45), 900, 3200, 0.022);
  ding(c, o, N.E6, t(0.52), 0.06, 0.7);
  ding(c, o, N.B6, t(0.64), 0.04, 0.6);
}
