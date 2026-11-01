import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.87;

/** A whoosh as the glass swings, a tap, and a bright glint on the lens. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.2), 1200, 2600, 0.03);
  tick(c, o, t(0.2), 0.1, 3200);
  ding(c, o, N.G7, t(0.3), 0.06, 0.5);
  swish(c, o, t(0.4), t(0.2), 2600, 1200, 0.025);
  tick(c, o, t(0.6), 0.08, 3000);
}
