import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.95;

/** A little scrape as the chain halves pull apart, then a bright metallic clink and a sparkle as they connect. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.26), 1500, 800, 0.03);
  tick(c, o, t(0.3), 0.18, 3000);
  ding(c, o, N.E7, t(0.3), 0.07, 0.35);
  ding(c, o, N.G7, t(0.38), 0.04, 0.25);
}
