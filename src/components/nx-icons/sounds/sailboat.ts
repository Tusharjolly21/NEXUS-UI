import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.03;

/** Slow sea wash under the hull, a wooden creak that follows each rock of the boat, and soft canvas flaps as the main sail and then the jib fill (0.24 s) and snap slack (0.48 s, 0.71 s). */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.06), t(0.4), 240, 620, 0.035); // 0.06-0.46 the wave line lifts and the hull rocks over
  swish(c, o, t(0.46), t(0.42), 620, 220, 0.03); // 0.46-0.88 the sea settles back
  blip(c, o, 190, t(0.05), 0.045, 0.16, 150, "triangle"); // 0.05 the hull tips to port (fast part of its first lean)
  blip(c, o, 150, t(0.24), 0.055, 0.17, 250, "triangle"); // 0.24 the hull swings over to starboard, its fastest rock
  blip(c, o, 250, t(0.44), 0.04, 0.15, 175, "triangle"); // 0.44 rocks back
  blip(c, o, 175, t(0.63), 0.025, 0.14, 210, "triangle"); // 0.63 a smaller rock
  puff(c, o, t(0.24), 0.1, 800, 0.07, "bandpass"); // 0.24 the main sail fills to its widest
  puff(c, o, t(0.29), 0.09, 1100, 0.05, "bandpass"); // 0.29 the jib fills (it is 0.05 s behind)
  puff(c, o, t(0.475), 0.07, 1300, 0.055, "bandpass"); // 0.475 the main sail snaps slack
  puff(c, o, t(0.525), 0.06, 1500, 0.04, "bandpass"); // 0.525 the jib snaps slack
  puff(c, o, t(0.71), 0.06, 1000, 0.03, "bandpass"); // 0.71 a last small flutter of the main sail
}
