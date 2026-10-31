import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.92;

/** A rising whoosh as the arrow leaves, a two-note chime as the cloud takes it, and a soft bloop as the next one rises. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.46), 300, 2200, 0.06);
  ding(c, o, N.E6, t(0.52), 0.1, 0.6);
  ding(c, o, N.A6, t(0.62), 0.08, 0.6);
  blip(c, o, 300, t(0.9), 0.06, 0.2, 480);
}
