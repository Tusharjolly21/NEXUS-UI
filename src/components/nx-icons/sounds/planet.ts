import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low hum that swings up and back as the ring tilts, with a slow electronic orbit tone circling round and a soft ping when the moon returns. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.E4, t(0.05), 0.07, 0.35, N.A4);
  blip(c, o, N.A4, t(0.4), 0.06, 0.4, N.E4);
  swish(c, o, t(0.1), t(0.7), 600, 2200, 0.02);
  [0.1, 0.25, 0.4, 0.55, 0.7].forEach((at, i) => blip(c, o, N.C6 + i * 90, t(at), 0.025, 0.12));
  ding(c, o, N.B5, t(0.88), 0.05, 0.5);
}
