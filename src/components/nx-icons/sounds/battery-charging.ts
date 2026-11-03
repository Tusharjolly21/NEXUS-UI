import { ding, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.47;

/** A rising electric whine as the battery fills, tiny sparks crackling with each bolt flash, a bright full-charge chime, and a soft falling sweep as the charge drains away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 220, t(0.02), 0.05, 0.6, 1500, "triangle");
  puff(c, o, t(0.08), 0.03, 6000, 0.05, "highpass");
  puff(c, o, t(0.22), 0.03, 6500, 0.05, "highpass");
  puff(c, o, t(0.38), 0.03, 7000, 0.05, "highpass");
  puff(c, o, t(0.52), 0.03, 7000, 0.05, "highpass");
  ding(c, o, N.C7, t(0.62), 0.07, 0.6);
  ding(c, o, N.G6, t(0.7), 0.05, 0.5);
  ding(c, o, N.E7, t(0.8), 0.035, 0.5);
  swish(c, o, t(0.8), t(0.45), 3200, 600, 0.025);
}
