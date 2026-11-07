import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.7;

/** A wobbling theremin-like chirp that follows the head's tilts, two bubbly boings as the antennae swing out, a wet pip as the eyes blink and a glassy glint when they open. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 700, t(0.04), 0.05, 0.24, 1100, "sine"); // 0.04 the head tilts one way
  blip(c, o, 1100, t(0.29), 0.05, 0.24, 650, "sine"); // 0.29 it tilts back
  blip(c, o, 650, t(0.54), 0.045, 0.24, 900, "sine"); // 0.54 and again
  blip(c, o, 900, t(0.79), 0.04, 0.22, 600, "sine"); // 0.79 it settles
  blip(c, o, 1500, t(0.2), 0.07, 0.07, 2400, "triangle"); // 0.22 the left antenna swings out
  blip(c, o, 1900, t(0.3), 0.065, 0.07, 3000, "triangle"); // 0.32 the right antenna swings out
  blip(c, o, 2200, t(0.49), 0.06, 0.05, 1300, "sine"); // 0.50 the eyes blink shut
  tick(c, o, t(0.5), 0.05, 6500); // 0.50 wet click of the blink
  ding(c, o, 3300, t(0.65), 0.05, 0.3); // 0.65 the eyes glint as they open
  blip(c, o, 1200, t(0.89), 0.035, 0.07, 1700, "triangle"); // 0.90 the antenna's last small bob
}
