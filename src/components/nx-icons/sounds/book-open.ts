import { ding, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.86;

/** A dry paper rustle as the page lifts, a long soft sweep as it turns over the spine, a flutter of small taps, then a warm two-note bell as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.1, 4200, 0.045, "highpass");
  swish(c, o, t(0.1), t(0.5), 1400, 3800, 0.045);
  puff(c, o, t(0.3), 0.14, 3000, 0.04, "bandpass");
  tick(c, o, t(0.52), 0.06, 4200);
  tick(c, o, t(0.58), 0.05, 3600);
  puff(c, o, t(0.72), 0.08, 2400, 0.03, "bandpass");
  ding(c, o, N.E5, t(0.76), 0.05, 0.5);
  ding(c, o, N.B5, t(0.84), 0.04, 0.45);
  ding(c, o, N.D6, t(0.92), 0.035, 0.4);
  ding(c, o, N.G6, t(1.0), 0.025, 0.35);
}
