import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.94;

/** A whoosh as the globe spins, a tick as each meridian passes, and a bright ding when it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.9), 600, 2600, 0.04);
  [0.25, 0.5, 0.75].forEach((at, i) => tick(c, o, t(at), 0.09, 3000 + i * 300));
  ding(c, o, N.G6, t(0.98), 0.07, 0.5);
}
