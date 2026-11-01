import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.28;

/** A quick tick, then a falling blip as the cross turns and shrinks away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.13, 3600);
  blip(c, o, N.G6, t(0.04), 0.08, 0.3, N.C6);
  swish(c, o, t(0.08), t(0.3), 3000, 800, 0.025);
  tick(c, o, t(0.46), 0.07, 2600);
}
