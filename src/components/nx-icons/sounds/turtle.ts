import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four slow plods: a dry scrape as each foot drags forward, then a hollow shell tock and a low thump as it plants, the pairs alternating in pitch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.1), 800, 380, 0.05); // 0.10-0.20 the first foot pair drags forward
  thud(c, o, t(0.2), 135, 0.1, 0.1); // 0.20 the first pair plants
  blip(c, o, 430, t(0.2), 0.05, 0.06, 300); // 0.20 the shell tocks
  swish(c, o, t(0.3), t(0.1), 700, 330, 0.05); // 0.30-0.40 the second pair drags forward
  thud(c, o, t(0.4), 112, 0.1, 0.1); // 0.40 the second pair plants
  blip(c, o, 370, t(0.4), 0.05, 0.06, 260); // 0.40 the shell tocks lower
  swish(c, o, t(0.5), t(0.1), 800, 380, 0.045); // 0.50-0.60 the first pair drags forward again
  thud(c, o, t(0.6), 135, 0.09, 0.1); // 0.60 plant
  blip(c, o, 430, t(0.6), 0.045, 0.06, 300); // 0.60 tock
  swish(c, o, t(0.7), t(0.1), 700, 330, 0.04); // 0.70-0.80 the second pair drags
  thud(c, o, t(0.8), 112, 0.08, 0.1); // 0.80 last plant
  blip(c, o, 370, t(0.8), 0.04, 0.06, 260); // 0.80 last tock
  puff(c, o, t(0.9), 0.06, 900, 0.015, "lowpass"); // 0.90 the tail settles
}
