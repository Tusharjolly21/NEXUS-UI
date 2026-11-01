import { ding, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.78;

/** A hop, a leathery thump as it lands, and the click-clack of the latch snapping shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 500, 2200, 0.03);
  thud(c, o, t(0.55), 95, 0.26, 0.14);
  puff(c, o, t(0.55), 0.08, 700, 0.05, "lowpass");
  tick(c, o, t(0.6), 0.13, 2600);
  tick(c, o, t(0.66), 0.1, 3300);
  ding(c, o, N.G6, t(0.7), 0.04, 0.3);
}
