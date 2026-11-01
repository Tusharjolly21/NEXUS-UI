import { ding, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3;

/** A zip running down the door, a rustle of canvas, a chorus of crickets, and two twinkling stars. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.05, 0.08, 0.11, 0.14, 0.17, 0.2, 0.23].forEach((at, i) => tick(c, o, t(at), 0.05, 4800 - i * 350));
  swish(c, o, t(0.02), t(0.25), 3600, 1200, 0.025);
  puff(c, o, t(0.3), 0.12, 1500, 0.04, "lowpass");
  [0.5, 0.58, 0.78, 0.86].forEach((at, i) => blip(c, o, 3300 + (i % 2) * 200, t(at), 0.025, 0.05));
  [0.62, 0.9].forEach((at) => ding(c, o, N.E7, t(at), 0.03, 0.35));
}
