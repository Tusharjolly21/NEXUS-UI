import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.71;

/** The pin lifts with a rising swish, pushes down with a falling one, and bites into the board at 0.45 with a sharp metal tack, a corkboard thud and a faint ring as the shadow ripples out, then a tiny tick as the pin rebounds and settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0-0.25 pin lifts up
  swish(c, o, t(0.0), t(0.25), 500, 1700, 0.03);
  // 0.25-0.45 pin is pressed down, speeding up
  swish(c, o, t(0.25), t(0.2), 3000, 900, 0.035);
  // 0.45 the tack bites into the board
  tick(c, o, t(0.45), 0.2, 6500);
  thud(c, o, t(0.45), 140, 0.26, 0.12);
  ding(c, o, 4200, t(0.45), 0.035, 0.2);
  // 0.47-0.9 the shadow ring ripples out
  ding(c, o, 1100, t(0.47), 0.04, 0.5);
  swish(c, o, t(0.47), t(0.4), 1200, 400, 0.015);
  // 0.61 the pin rebounds up and settles
  tick(c, o, t(0.61), 0.06, 4200);
}
