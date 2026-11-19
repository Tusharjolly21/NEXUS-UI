import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.25;

/** A light swish as the hand rocks, a dry finger flick as the V opens wide, two bright twinkles as the sparkle pops and a smaller flick as the fingers close. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 1200, 2000, 0.02); // 0.00-0.22 the hand rocks
  tick(c, o, t(0.27), 0.1, 6000); // 0.27 the fingers spread wide
  ding(c, o, 2790, t(0.36), 0.05, 0.35); // 0.36 the sparkle appears
  ding(c, o, 3730, t(0.4), 0.03, 0.25); // 0.40 the sparkle at full size
  tick(c, o, t(0.7), 0.05, 4800); // 0.70 the fingers draw back in
}
