import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** A small paddle swish and a bright woody tok as the paddle meets the ball, the ball whistling away, a soft whoosh as the paddle swings back, the ball dropping in again and a light tap when it arrives. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.14), 1800, 4200, 0.035); // 0.04 to 0.18 the paddle winds back and swings
  tick(c, o, t(0.17), 0.16, 3800); // 0.17 the paddle meets the ball
  blip(c, o, 1700, t(0.17), 0.1, 0.04, 1100, "triangle"); // 0.17 bright woody tok
  swish(c, o, t(0.18), t(0.26), 3000, 6000, 0.02); // 0.18 to 0.44 the ball whistles out of the box
  swish(c, o, t(0.2), t(0.22), 900, 500, 0.012); // 0.20 to 0.42 the paddle swings back to rest
  swish(c, o, t(0.55), t(0.26), 6000, 2400, 0.02); // 0.55 to 0.81 the ball drops back in
  blip(c, o, 1300, t(0.81), 0.05, 0.04, 900, "triangle"); // 0.81 the ball arrives beside the blade
  tick(c, o, t(0.81), 0.07, 2600); // 0.81 a light tap
  tick(c, o, t(0.95), 0.03, 2000); // 0.95 it rolls back to rest
}
