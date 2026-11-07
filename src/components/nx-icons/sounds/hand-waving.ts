import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 7.88;

/** Soft cloth-like whooshes that alternate in pitch with each swing of the hand, getting smaller as it settles, and two airy breaths as the wave lines come back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.15), 500, 1200, 0.025); // 0.00-0.15 the hand swings out, small
  swish(c, o, t(0.154), t(0.24), 1500, 450, 0.06); // 0.15-0.40 the big swing to the other side, fastest at 0.28
  swish(c, o, t(0.396), t(0.22), 450, 1400, 0.055); // 0.40-0.62 back again, fastest at 0.51
  swish(c, o, t(0.616), t(0.2), 1300, 450, 0.045); // 0.62-0.81 a smaller swing, fastest at 0.72
  swish(c, o, t(0.814), t(0.15), 450, 1100, 0.032); // 0.81-0.97 smaller still
  swish(c, o, t(0.968), t(0.13), 1000, 500, 0.015); // 0.97-1.10 the hand comes to rest
  blip(c, o, 1700, t(0.76), 0.02, 0.08, 2200, "triangle"); // 0.76 the left wave line comes back
  blip(c, o, 1900, t(0.88), 0.02, 0.08, 2400, "triangle"); // 0.88 the right wave line comes back
}
