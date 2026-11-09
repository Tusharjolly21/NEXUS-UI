import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft leather swing and a creak at the end of each pendulum swing, each smaller than the last, then a tiny tick and a two-note glassy shimmer as the clasp glints. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 500, 900, 0.025); // 0.00-0.22 the bag swings out
  blip(c, o, 340, t(0.22), 0.09, 0.12, 280); // 0.22 end of the first swing, a leather creak
  blip(c, o, 320, t(0.46), 0.08, 0.12, 270); // 0.46 swing back, creak
  blip(c, o, 300, t(0.68), 0.055, 0.1, 260); // 0.68 third, smaller swing
  tick(c, o, t(0.5), 0.09, 6200); // 0.50 the glint starts to grow on the clasp
  ding(c, o, 3900, t(0.72), 0.09, 0.3); // 0.72 the glint is at its brightest
  ding(c, o, 5800, t(0.74), 0.045, 0.2); // 0.74 its higher overtone
}
