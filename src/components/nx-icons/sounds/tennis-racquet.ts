import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.3;

/** A quiet backswing, a rising whoosh that peaks as the racquet meets the ball with a hollow pock and a string twang, the ball whistling away, then a small pop as it comes back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.22, 800, 500, 0.03); // 0.1 racquet winds back
  swish(c, o, t(0.262), 0.24, 900, 2800, 0.07); // 0.37 forward swing whoosh peaks at the contact
  blip(c, o, 880, t(0.38), 0.13, 0.06, 540, "triangle"); // 0.38 the ball meets the strings, hollow pock
  tick(c, o, t(0.38), 0.1, 3200); // 0.38 felt on the strings
  ding(c, o, 1320, t(0.385), 0.035, 0.22); // 0.385 strings twang as the head swells
  swish(c, o, t(0.4), 0.3, 3200, 1400, 0.03); // 0.53 the ball whistles away off the corner
  blip(c, o, 520, t(0.86), 0.07, 0.09, 900); // 0.86 the ball pops back in at its spot
}
