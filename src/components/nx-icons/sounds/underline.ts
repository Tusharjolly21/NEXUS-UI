import { ding, blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.77;

/** A soft thump as the letter dips, then a pen scratching across the page with a gentle rising pitch, finished by one clear bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.04), 150, 0.12, 0.08);
  puff(c, o, t(0.2), 0.45, 5200, 0.04, "bandpass");
  puff(c, o, t(0.3), 0.3, 3800, 0.025, "highpass");
  blip(c, o, N.E5, t(0.2), 0.04, 0.45, N.C6, "triangle");
  swish(c, o, t(0.2), t(0.45), 1800, 4200, 0.02);
  ding(c, o, N.E6, t(0.68), 0.06, 0.4);
}
