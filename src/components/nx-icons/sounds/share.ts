import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.34;

/** An upward whoosh as the arrow lifts out, a clear note at the top and a soft settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.28), 600, 2400, 0.05);
  ding(c, o, N.B6, t(0.3), 0.07, 0.4);
  thud(c, o, t(0.58), 140, 0.1, 0.08);
}
