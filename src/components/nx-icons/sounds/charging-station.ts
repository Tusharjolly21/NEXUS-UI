import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.01;

/** An electric zap each time the bolt pulses (0.22 s, 0.68 s), a whining zip as the cable pays out to the plug, a click as the plug seats (0.6 s), and a rising electronic whine as the level bar fills, ending in a small chime when it is full. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.45), 3000, 900, 0.035); // 0.00-0.45 the cable pays out toward the plug (fastest at the start)
  blip(c, o, 120, t(0.2), 0.07, 0.1, 60, "sawtooth"); // 0.22 the bolt pulses to its first peak
  tick(c, o, t(0.22), 0.1, 4200); // 0.22 spark of the first pulse
  tick(c, o, t(0.6), 0.14, 3000); // 0.60 the plug seats with a click
  thud(c, o, t(0.6), 170, 0.1, 0.05); // 0.60 plug clunk
  blip(c, o, 140, t(0.66), 0.07, 0.1, 70, "sawtooth"); // 0.68 the bolt pulses to its second peak
  tick(c, o, t(0.68), 0.09, 4500); // 0.68 spark of the second pulse
  blip(c, o, 300, t(0.32), 0.04, 0.55, 1500, "triangle"); // 0.32-0.87 the charge level climbs as the bar fills
  swish(c, o, t(0.3), t(0.55), 700, 3800, 0.025); // 0.30-0.85 the fill whine rises
  ding(c, o, 2600, t(0.85), 0.045, 0.3); // 0.85 the level bar is full: a small chime
}
