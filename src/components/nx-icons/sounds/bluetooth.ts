import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.55;

/** A pairing call and answer, two quick chirps, then a bright long ding as the devices connect. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.2), 2500, 1400, 0.02);
  swish(c, o, t(0.25), t(0.2), 1400, 2500, 0.02);
  blip(c, o, N.E6, t(0.18), 0.07, 0.12);
  blip(c, o, N.B6, t(0.32), 0.07, 0.12);
  ding(c, o, N.G7, t(0.55), 0.07, 0.6);
}
