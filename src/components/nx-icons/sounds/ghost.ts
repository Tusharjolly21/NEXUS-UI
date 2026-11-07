import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A thin airy wail that wavers down and up like a ghost moaning, with a soft whoosh under it and two tiny clicks for the blinks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.95), 260, 900, 0.035);
  blip(c, o, N.E5 * 0.8, t(0.04), 0.05, 0.5, N.C5 * 0.7, "triangle");
  blip(c, o, N.C5 * 0.7, t(0.5), 0.045, 0.5, N.E5 * 0.75, "triangle");
  tick(c, o, t(0.3), 0.05, 6500);
  tick(c, o, t(0.78), 0.05, 6500);
  ding(c, o, N.B6, t(0.85), 0.035, 0.3);
}
