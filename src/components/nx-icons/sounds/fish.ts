import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.51;

/** Watery tail swishes on each lash and little rising bubble burbles as each bubble leaves the mouth. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.14), 400, 1200, 0.045); // 0.09 tail lashes up to 14 degrees
  swish(c, o, t(0.19), t(0.17), 1300, 450, 0.05); // 0.27 tail swings across to -14
  swish(c, o, t(0.38), t(0.17), 450, 1300, 0.05); // 0.45 tail swings back
  swish(c, o, t(0.56), t(0.17), 1300, 500, 0.045); // 0.63 tail swings to -8
  swish(c, o, t(0.74), t(0.15), 600, 350, 0.025); // 0.82 tail comes to rest
  blip(c, o, 320, t(0.11), 0.06, 0.07, 760); // 0.10 first bubble leaves the mouth
  blip(c, o, 420, t(0.31), 0.06, 0.07, 980); // 0.30 second bubble
  blip(c, o, 540, t(0.51), 0.06, 0.07, 1250); // 0.50 third bubble
}
