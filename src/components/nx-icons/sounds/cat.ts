import { blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Tiny ear flick ticks one after the other, a dry blink click, then a short mewing slide up and down and a faint whisker rustle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.06), 0.1, 6200);
  tick(c, o, t(0.2), 0.1, 5400);
  tick(c, o, t(0.36), 0.09, 6600);
  tick(c, o, t(0.5), 0.12, 3800);
  blip(c, o, N.A5, t(0.6), 0.07, 0.2, N.D6, "triangle");
  blip(c, o, N.D6, t(0.74), 0.05, 0.16, N.G5, "triangle");
  puff(c, o, t(0.58), 0.3, 6800, 0.02, "highpass");
}
