import { blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.83;

/** A latch click, a rising swish as the arrow slips out, a fading breath of air, and a falling goodbye in two notes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.1, 2200);
  swish(c, o, t(0.06), t(0.26), 800, 3200, 0.05);
  puff(c, o, t(0.3), 0.2, 1400, 0.025, "lowpass");
  blip(c, o, N.E5, t(0.5), 0.07, 0.16);
  blip(c, o, N.C5, t(0.62), 0.07, 0.24);
}
