import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.27;

/** A quick backwards zip as the arrow winds back, and a click as it snaps home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 3000, 700, 0.06);
  [0.04, 0.12, 0.2].forEach((at, i) => tick(c, o, t(at), 0.07, 4200 - i * 500));
  swish(c, o, t(0.32), t(0.26), 800, 2400, 0.04);
  tick(c, o, t(0.6), 0.13, 2800);
  blip(c, o, N.E6, t(0.6), 0.05, 0.08);
}
