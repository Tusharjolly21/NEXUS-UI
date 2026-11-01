import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.64;

/** The lid sliding up, then a deep cardboard thunk as it drops back, with a tick of the handle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 500, 1600, 0.04);
  puff(c, o, t(0.1), 0.2, 2200, 0.025, "bandpass");
  thud(c, o, t(0.55), 90, 0.32, 0.18);
  puff(c, o, t(0.55), 0.1, 900, 0.05, "lowpass");
  tick(c, o, t(0.6), 0.1, 2600);
}
