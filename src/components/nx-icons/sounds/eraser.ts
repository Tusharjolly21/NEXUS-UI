import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.3;

/** Five rubbery rubbing strokes that follow the eraser as it goes to and fro, a faint squeak at each turn, and little crumbs ticking away from it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 1600, 2600, 0.05); // 0.00-0.18 the eraser rubs to the left
  swish(c, o, t(0.18), t(0.2), 2800, 1700, 0.065); // 0.18-0.38 it rubs to the right
  swish(c, o, t(0.38), t(0.2), 1700, 2900, 0.065); // 0.38-0.58 back to the left
  swish(c, o, t(0.585), t(0.18), 2900, 1700, 0.055); // 0.585-0.765 to the right again
  swish(c, o, t(0.765), t(0.14), 1700, 2300, 0.04); // 0.765-0.90 it eases to rest
  blip(c, o, 1900, t(0.18), 0.02, 0.05, 1500, "triangle"); // 0.18 rubber squeak as it turns
  blip(c, o, 2100, t(0.38), 0.02, 0.05, 1600, "triangle"); // 0.38 rubber squeak as it turns
  blip(c, o, 1800, t(0.585), 0.018, 0.05, 1450, "triangle"); // 0.585 rubber squeak as it turns
  tick(c, o, t(0.29), 0.07, 5200); // 0.29 the first crumb springs away
  tick(c, o, t(0.41), 0.07, 6000); // 0.41 the second crumb springs away
  tick(c, o, t(0.53), 0.07, 5600); // 0.53 the third crumb springs away
  tick(c, o, t(0.65), 0.06, 6400); // 0.65 the fourth crumb springs away
}
