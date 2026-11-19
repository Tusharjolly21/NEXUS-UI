import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 5.54;

/** A dry papery rattle of the shell at every shake, each followed a beat later by the knock of the nuts inside, fading as it calms. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.11, 0.24, 0.37, 0.5, 0.64].forEach((at, i) => puff(c, o, t(at), 0.035, 2700 + (i % 2) * 500, 0.06 - i * 0.009)); // 0.11 0.24 0.37 0.50 0.64 the shell rattles at each end of the shake
  [0.16, 0.29, 0.42, 0.54, 0.69].forEach((at, i) => blip(c, o, 760 - (i % 2) * 90, t(at), 0.04 - i * 0.006, 0.035, 640, "triangle")); // 0.16 0.29 0.42 0.54 0.69 the nuts knock inside a beat later
}
