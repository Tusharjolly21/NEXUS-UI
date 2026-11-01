import { ding, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.86;

/** Paper whooshing as the flap lifts, a pop, and a two-note you've-got-mail chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.18), 800, 2600, 0.05);
  blip(c, o, 520, t(0.1), 0.08, 0.1, 980);
  puff(c, o, t(0.2), 0.1, 3600, 0.03, "highpass");
  ding(c, o, N.E6, t(0.28), 0.1, 0.6);
  ding(c, o, N.A6, t(0.38), 0.11, 0.7);
}
