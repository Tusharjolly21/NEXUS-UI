import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.93;

/** A thin glassy sweep as the ring unwinds, two tiny ticks as the handle stretches, then a clear high ping when the X is drawn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.34), 4200, 1200, 0.035);
  tick(c, o, t(0.1), 0.07, 6000);
  tick(c, o, t(0.2), 0.07, 5000);
  blip(c, o, N.G6, t(0.18), 0.04, 0.22, N.C6, "sine");
  ding(c, o, N.D7, t(0.34), 0.06, 0.45);
  ding(c, o, N.A6, t(0.44), 0.03, 0.3);
}
