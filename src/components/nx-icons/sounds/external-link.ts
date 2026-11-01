import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.31;

/** A quick swish up and to the right, a tick at the corner, and a softer whoosh as it slides back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 700, 3200, 0.05);
  tick(c, o, t(0.25), 0.12, 3800);
  blip(c, o, N.G6, t(0.25), 0.06, 0.1);
  swish(c, o, t(0.28), t(0.22), 2600, 800, 0.03);
  tick(c, o, t(0.48), 0.1, 2800);
}
