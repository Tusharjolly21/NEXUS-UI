import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.37;

/** A whoosh as the arrow spins away, compass clicks as it swings past, then a bright two-note lock when it settles on its heading. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.3), 2200, 600, 0.04);
  swish(c, o, t(0.35), t(0.3), 600, 2400, 0.04);
  [0.1, 0.22, 0.4, 0.52].forEach((at) => tick(c, o, t(at), 0.1, 3600));
  blip(c, o, N.C5, t(0.68), 0.05, 0.08);
  ding(c, o, N.G5, t(0.72), 0.08, 0.4);
  ding(c, o, N.D6, t(0.77), 0.06, 0.35);
  ding(c, o, N.A6, t(0.82), 0.04, 0.3);
}
