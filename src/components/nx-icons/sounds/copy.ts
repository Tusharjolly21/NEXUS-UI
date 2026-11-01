import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.19;

/** Two soft taps as the sheets shuffle, then a two-note done. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0), 0.12, 2800);
  blip(c, o, 700, t(0), 0.06, 0.05);
  tick(c, o, t(0.25), 0.1, 2400);
  blip(c, o, 620, t(0.25), 0.05, 0.05);
  ding(c, o, N.E6, t(0.35), 0.08, 0.4);
  ding(c, o, N.B6, t(0.55), 0.09, 0.5);
}
