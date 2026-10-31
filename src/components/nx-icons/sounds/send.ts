import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.76;

/** A whoosh as the plane takes off, a two-note sent chime, and a soft swoop as it flies back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.4), 500, 3200, 0.07);
  ding(c, o, N.D6, t(0.42), 0.1, 0.5);
  ding(c, o, N.A6, t(0.5), 0.11, 0.7);
  swish(c, o, t(0.45), t(0.48), 2200, 700, 0.025);
  tick(c, o, t(0.93), 0.1, 2800);
}
