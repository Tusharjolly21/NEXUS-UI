import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.23;

/** A lens motor whirring as it zooms, a clunk as it locks, then two rising record beeps. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.36), 500, 2600, 0.04);
  [0.06, 0.12, 0.18, 0.24, 0.3].forEach((at) => tick(c, o, t(at), 0.04, 4200));
  tick(c, o, t(0.4), 0.12, 2400);
  thud(c, o, t(0.4), 180, 0.07, 0.05);
  blip(c, o, N.A6, t(0.48), 0.07, 0.1);
  blip(c, o, N.E7, t(0.8), 0.07, 0.18);
}
