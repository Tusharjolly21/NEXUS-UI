import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.73;

/** A papery flick as the flap folds shut, a soft thump, a long rising slide as the letter is drawn up, and two warm bells, E then a high C, as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.04), 0.1, 4800, 0.05, "highpass");
  thud(c, o, t(0.2), 160, 0.12, 0.08);
  swish(c, o, t(0.3), t(0.34), 700, 3000, 0.035);
  ding(c, o, N.E6, t(0.66), 0.06, 0.4);
  ding(c, o, N.C7, t(0.78), 0.04, 0.45);
  puff(c, o, t(0.84), 0.08, 3600, 0.02, "bandpass");
}
