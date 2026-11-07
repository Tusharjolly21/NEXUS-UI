import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rising shimmer of air under three glassy twinkles that step up and then fall, each timed to a star turning, with a tiny glint to finish. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.5), 2600, 7000, 0.016);
  ding(c, o, N.B6, t(0.03), 0.07, 0.5);
  ding(c, o, N.D7, t(0.21), 0.06, 0.42);
  ding(c, o, N.A6, t(0.37), 0.06, 0.5);
  blip(c, o, 4900, t(0.52), 0.02, 0.07, 6200);
  tick(c, o, t(0.6), 0.05, 7000);
}
