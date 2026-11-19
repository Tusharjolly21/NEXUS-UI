import { blip, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.03;

/** A soft rubbery knock and a tiny creak each time the banana rocks onto one end, settling down quietly. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.2), 150, 0.12, 0.1); // 0.20 the banana rocks onto its left end
  blip(c, o, 310, t(0.2), 0.03, 0.08, 270, "triangle"); // 0.20 a small creak
  thud(c, o, t(0.42), 135, 0.09, 0.1); // 0.42 it rolls onto the right end
  blip(c, o, 290, t(0.42), 0.022, 0.08, 255, "triangle"); // 0.42 creak
  thud(c, o, t(0.62), 145, 0.05, 0.09); // 0.62 a smaller rock
  thud(c, o, t(0.82), 130, 0.03, 0.08); // 0.82 the last little rock
}
