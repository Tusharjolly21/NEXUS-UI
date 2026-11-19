import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.46;

/** A gentle water ripple under a little bubble as the petals close, then a soft singing bowl tone as the flower blooms open on the water. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.1), 500, 900, 0.025); // 0.00-1.10 the ripple runs across the water
  blip(c, o, 600, t(0.3), 0.04, 0.08, 1100); // 0.31 the petals close: a small bubble
  ding(c, o, 412, t(0.6), 0.08, 0.9); // 0.60 the flower blooms fully open
  ding(c, o, 618, t(0.6), 0.025, 0.6); // 0.60 the bowl's upper ring
}
