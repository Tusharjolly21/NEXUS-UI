import { ding, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft hush of cold wind and three tiny sparkling bells falling in turn as the flakes drift down, each a little lower than the last, then a faint settling shimmer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.55, 1800, 0.016, "bandpass");
  swish(c, o, t(0.05), t(0.6), 3000, 1600, 0.012);
  ding(c, o, N.E7, t(0.1), 0.04, 0.4);
  ding(c, o, N.B6, t(0.3), 0.04, 0.4);
  ding(c, o, N.G6 * 1.12, t(0.5), 0.04, 0.4);
  puff(c, o, t(0.78), 0.2, 5600, 0.02, "highpass");
  ding(c, o, N.C7, t(0.9), 0.03, 0.5);
}
