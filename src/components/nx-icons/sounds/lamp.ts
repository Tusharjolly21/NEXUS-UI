import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.04;

/** A pull-chain going ka-chunk, then a warm pad of low notes blooming as the light fades up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.08, 5200);
  tick(c, o, t(0.09), 0.14, 2000);
  thud(c, o, t(0.09), 140, 0.1, 0.06);
  blip(c, o, N.D5, t(0.22), 0.05, 0.7, undefined, "triangle");
  blip(c, o, N.A5, t(0.22), 0.04, 0.7, undefined, "triangle");
  blip(c, o, N.D6, t(0.32), 0.03, 0.55, undefined, "triangle");
  swish(c, o, t(0.2), t(0.4), 500, 1800, 0.015);
}
