import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft palm thump as the ball is set upward, a light whirr that peaks as the spin is fastest, and a quick rustle of three small ticks as it dips onto the net, then a gentle settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.0), 160, 0.2, 0.1); // 0.0 the hand sets the ball upward
  puff(c, o, t(0.0), 0.05, 1500, 0.06, "lowpass"); // 0.0 soft palm slap
  swish(c, o, t(0.1), 0.7, 500, 1300, 0.04); // 0.41 the spin whirrs, fastest mid turn
  tick(c, o, t(0.605), 0.1, 3600); // 0.605 the ball touches the net tape
  tick(c, o, t(0.62), 0.07, 3200); // 0.62 net mesh ticks
  tick(c, o, t(0.635), 0.05, 2800); // 0.635 last mesh tick
  blip(c, o, 330, t(0.612), 0.06, 0.06, 250); // 0.612 low tup of the tape
  swish(c, o, t(0.66), 0.24, 700, 500, 0.02); // 0.77 the ball floats back into place
}
