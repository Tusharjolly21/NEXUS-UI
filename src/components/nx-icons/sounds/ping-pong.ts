import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A tiny paddle swish and a bright woody tok as the paddle hits the ball, the ball whistling away and falling back, a second softer tok as it lands on the paddle, and a last small settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), 0.16, 2000, 4200, 0.035); // 0.09 the paddle flicks upward
  tick(c, o, t(0.17), 0.16, 3800); // 0.17 the paddle meets the ball
  blip(c, o, 1700, t(0.17), 0.1, 0.04, 1100, "triangle"); // 0.17 bright woody tok
  swish(c, o, t(0.18), 0.2, 3000, 6000, 0.02); // 0.27 the ball whistles up and away
  swish(c, o, t(0.54), 0.28, 6000, 2400, 0.02); // 0.66 it comes dropping back
  blip(c, o, 1500, t(0.814), 0.09, 0.04, 950, "triangle"); // 0.814 the ball lands on the paddle
  tick(c, o, t(0.814), 0.1, 3000); // 0.814 softer click
  swish(c, o, t(0.9), 0.2, 1200, 700, 0.012); // 0.99 the ball floats back to its rest height
}
