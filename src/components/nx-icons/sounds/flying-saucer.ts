import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.64;

/** A wobbling electronic hum that swoops with each tilt of the saucer, five rising beeps as the rim lights dip in turn, and two crackly buzzes as the landing legs flicker. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 300, t(0.04), 0.06, 0.26, 460, "triangle"); // 0.04 the saucer tilts left and rises
  blip(c, o, 460, t(0.3), 0.06, 0.26, 280, "triangle"); // 0.30 it tilts back
  blip(c, o, 280, t(0.56), 0.06, 0.26, 420, "triangle"); // 0.56 tilts right
  blip(c, o, 420, t(0.82), 0.055, 0.26, 260, "triangle"); // 0.82 settles back
  swish(c, o, t(0.04), t(1.0), 500, 1100, 0.012); // 0.04 the hover whirr
  [1000, 1250, 1560, 1950, 2450].forEach((f, i) => blip(c, o, f, t(0.175 + i * 0.12), 0.06, 0.07)); // each rim light dips at 0.175, 0.295, 0.415, 0.535, 0.655
  blip(c, o, 220, t(0.27), 0.05, 0.07, 120, "square"); // 0.27 the legs flicker out
  tick(c, o, t(0.27), 0.07, 5000); // 0.27 electric crackle
  blip(c, o, 200, t(0.82), 0.05, 0.07, 110, "square"); // 0.82 the legs flicker again
  tick(c, o, t(0.82), 0.07, 5000); // 0.82 electric crackle
}
