import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.19;

/** An electric motor whine rises as the boom lifts, a latch click at the top, then the whine falls and the arm lands with a thud. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 180, t(0.0), 0.06, 0.42, 380, "sawtooth"); // 0.00-0.42 motor lifts the arm
  swish(c, o, t(0.0), t(0.42), 300, 900, 0.02);
  tick(c, o, t(0.42), 0.14, 2000); // 0.42 arm reaches the top and latches
  blip(c, o, 380, t(0.64), 0.05, 0.33, 170, "sawtooth"); // 0.64-0.97 motor lowers the arm
  swish(c, o, t(0.64), t(0.33), 900, 300, 0.02);
  thud(c, o, t(0.97), 120, 0.2, 0.14); // 0.97 the arm lands on its rest
  tick(c, o, t(1.1), 0.06, 1700); // 1.10 final settle
}
