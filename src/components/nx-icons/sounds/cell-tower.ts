import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.59;

/** Electronic radar pings: a chirp as each ring of signal appears, one after the other from the inner ring outwards, and a low beacon bop as the dot throbs, the second round a step higher. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 800, t(0.04), 0.05, 0.2, 1500, "triangle"); // 0.04 the inner signal ring appears and grows
  blip(c, o, 1200, t(0.21), 0.05, 0.22, 2100, "triangle"); // 0.21 the outer signal ring appears and grows
  blip(c, o, 300, t(0.19), 0.09, 0.1, 380, "square"); // 0.20 the beacon dot throbs
  blip(c, o, 950, t(0.48), 0.05, 0.2, 1800, "triangle"); // 0.48 the inner ring appears again
  blip(c, o, 1450, t(0.65), 0.05, 0.22, 2500, "triangle"); // 0.65 the outer ring appears again
  blip(c, o, 340, t(0.61), 0.09, 0.1, 420, "square"); // 0.62 the beacon dot throbs again
  tick(c, o, t(0.03), 0.06, 7000); // 0.03 a crackle as the signal starts
  puff(c, o, t(0.47), 0.04, 6500, 0.03, "highpass"); // 0.47 a crackle as the signal starts again
}
