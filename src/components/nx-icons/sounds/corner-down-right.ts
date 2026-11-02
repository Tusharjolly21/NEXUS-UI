import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.18;

/** A falling swish as the line draws down, a tiny click at the corner, a flatter sweep along the bottom, then a firm snap as the arrowhead clicks in and two bells for the flash. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.2), 2400, 900, 0.045);
  tick(c, o, t(0.22), 0.08, 2800);
  swish(c, o, t(0.24), t(0.22), 900, 2000, 0.04);
  tick(c, o, t(0.5), 0.13, 3600);
  blip(c, o, N.B5, t(0.5), 0.07, 0.1);
  ding(c, o, N.E6, t(0.56), 0.05, 0.45);
  ding(c, o, N.B6, t(0.64), 0.025, 0.3);
}
