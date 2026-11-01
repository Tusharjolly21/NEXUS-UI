import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.95;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.08;

/** A swish as the arrow slips through, a wooden thunk as the door takes it, and a two-note welcome chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 800, 2800, 0.05);
  thud(c, o, t(0.38), 150, 0.16, 0.09);
  tick(c, o, t(0.38), 0.1, 2000);
  ding(c, o, N.G5, t(0.52), 0.07, 0.5);
  ding(c, o, N.C6, t(0.64), 0.07, 0.6);
}
