import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.54;

/** A rising airy shimmer, then a glassy twinkle at the moment each star swells (the big one at 0.26, then the two small ones at 0.38 and 0.54), climbing in pitch, with tiny glints as the stars shrink back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02-0.26 the big star starts to swell: shimmer rises
  swish(c, o, t(0.02), t(0.24), 2800, 7000, 0.02);
  // 0.26 big star pulses to its biggest
  blip(c, o, 1700, t(0.23), 0.02, 0.04, 2200);
  ding(c, o, 2217, t(0.26), 0.06, 0.5);
  // 0.38 first small star flares to 1.45 times
  blip(c, o, 2500, t(0.35), 0.02, 0.04, 3300);
  ding(c, o, 3322, t(0.38), 0.055, 0.45);
  // 0.54 second small star flares to 1.5 times
  blip(c, o, 3300, t(0.51), 0.02, 0.04, 4400);
  ding(c, o, 4435, t(0.54), 0.045, 0.45);
  // 0.58 and 0.74 the small stars shrink back to their size
  tick(c, o, t(0.58), 0.04, 7000);
  tick(c, o, t(0.74), 0.035, 7600);
}
