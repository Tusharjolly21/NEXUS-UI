import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.06;

/** A whistle as the drop falls, a round plip and ripple pings as it lands, and a soft sweep as the next drop slides in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.34), 2200, 700, 0.03);
  blip(c, o, 900, t(0.41), 0.1, 0.12, 360);
  ding(c, o, N.G6, t(0.44), 0.05, 0.35);
  ding(c, o, N.D7, t(0.58), 0.03, 0.3);
  swish(c, o, t(0.52), t(0.32), 700, 2000, 0.02);
  tick(c, o, t(0.88), 0.06, 3200);
}
