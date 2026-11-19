import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.61;

/** A rubber stamp press as the ring squeezes down, a smooth turning whirr while the C spins inside, and a neat latch click when it lands back in place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.2), 132, 0.16, 0.12); // 0.22 the ring presses down like a stamp
  puff(c, o, t(0.21), 0.06, 900, 0.03); // 0.22 a soft squash of ink
  swish(c, o, t(0.11), t(0.61), 1300, 2900, 0.03); // 0.11-0.72 the C turns a full circle
  tick(c, o, t(0.72), 0.09, 3600); // 0.72 the C overshoots and catches
  blip(c, o, 1240, t(0.9), 0.035, 0.06, 1180); // 0.90 the C clicks home
}
