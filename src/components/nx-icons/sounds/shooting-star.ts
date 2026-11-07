import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A thin whoosh that falls across the sky, followed by three glassy twinkles that step up and a final high sparkle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 5200, 900, 0.06);
  ding(c, o, N.D7, t(0.52), 0.05, 0.4);
  ding(c, o, N.G7, t(0.64), 0.045, 0.4);
  ding(c, o, N.B6, t(0.76), 0.04, 0.45);
  tick(c, o, t(0.52), 0.06, 7600);
  tick(c, o, t(0.8), 0.05, 8200);
}
