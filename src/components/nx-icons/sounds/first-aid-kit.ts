import { ding, blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A latch click and a hollow pop as the lid lifts, a soft thump as it drops shut, and two warm bell tones for the pulsing cross. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.04), 0.14, 3400);
  blip(c, o, 260, t(0.07), 0.12, 0.1, 620, "triangle");
  puff(c, o, t(0.1), 0.06, 1800, 0.04, "bandpass");
  thud(c, o, t(0.6), 135, 0.2, 0.09);
  ding(c, o, N.E4, t(0.44), 0.08, 0.42);
  ding(c, o, N.A5, t(0.5), 0.04, 0.3);
  ding(c, o, N.G6, t(0.86), 0.06, 0.5);
}
