import { ding, plink, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick dry swish as the brush pulls back, then a long soft bristle drag with a rising squeaky glide under it, ending in one clear tap as the stroke lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 2800, 900, 0.03);
  puff(c, o, t(0.3), 0.6, 3600, 0.03, "bandpass");
  swish(c, o, t(0.3), t(0.62), 800, 3000, 0.055);
  blip(c, o, N.E5, t(0.34), 0.045, 0.55, N.B5, "triangle");
  tick(c, o, t(0.94), 0.08, 3600);
  plink(c, o, N.G5, t(0.96), 0.08, 0.2);
  ding(c, o, N.E7, t(1.02), 0.025, 0.2);
}
