import { ding, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low rushing flicker with a run of dry crackles and pops, ending with three tiny spark pings drifting upward. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.8), 300, 900, 0.05);
  [0.06, 0.17, 0.26, 0.4, 0.47, 0.62].forEach((at, i) => tick(c, o, t(at), 0.12, 2400 + i * 700));
  puff(c, o, t(0.12), 0.05, 1600, 0.07, "bandpass");
  puff(c, o, t(0.33), 0.06, 1200, 0.07, "bandpass");
  ding(c, o, N.E7, t(0.5), 0.03, 0.25);
  ding(c, o, N.C7, t(0.62), 0.03, 0.25);
  ding(c, o, N.A6, t(0.74), 0.025, 0.3);
  ding(c, o, N.G7, t(0.86), 0.02, 0.3);
}
