import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.99;

/** A faint sweep of air with a fine click each time the thin blue arm crosses a mark on the rim, quick on the way open, a firmer click where it turns round at 150 degrees and again at 30, then a soft ping as it settles at 60. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 900, 2600, 0.02); // 0.00-0.40 the arm swings open to 150 degrees
  [0.095, 0.138, 0.174, 0.208, 0.243, 0.282, 0.334].forEach((at, i) => tick(c, o, t(at), 0.05, 3000 + i * 200)); // marks at 72 to 144 degrees as the arm opens
  tick(c, o, t(0.4), 0.11, 2200); // 0.40 the arm turns round at 150 degrees
  swish(c, o, t(0.4), t(0.35), 2600, 800, 0.02); // 0.40-0.75 the arm swings back to 30 degrees
  [0.45, 0.489, 0.517, 0.541, 0.564, 0.586, 0.609, 0.633, 0.661, 0.7].forEach((at, i) => tick(c, o, t(at), 0.05, 4200 - i * 200)); // marks on the way back
  tick(c, o, t(0.75), 0.11, 1900); // 0.75 the arm turns round at 30 degrees
  swish(c, o, t(0.75), t(0.25), 800, 1800, 0.015); // 0.75-1.00 the arm returns to 60 degrees
  [0.824, 0.891].forEach((at) => tick(c, o, t(at), 0.05, 2800)); // marks passed on the way home
  ding(c, o, 1560, t(1.0), 0.05, 0.3); // 1.00 the arm settles at 60 degrees: a soft ping
}
