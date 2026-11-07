import { ding, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.35;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A squeaky marker glide that slides up and settles, a soft felt hiss under it, and a pair of tiny cap clicks at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.2), 2400, 800, 0.025);
  blip(c, o, N.D5, t(0.3), 0.04, 0.6, N.A5, "triangle");
  swish(c, o, t(0.3), t(0.7), 1200, 2600, 0.04);
  puff(c, o, t(0.3), 0.7, 4200, 0.02, "bandpass");
  tick(c, o, t(0.96), 0.08, 3000);
  tick(c, o, t(1.02), 0.06, 4200);
  ding(c, o, N.B6, t(1.0), 0.04, 0.3);
  ding(c, o, N.E6, t(1.06), 0.03, 0.25);
}
