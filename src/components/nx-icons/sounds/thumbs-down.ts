import { blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.95;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.05;

/** A sad wobbling slide downwards, a heavy thump as the thumb lands, and a small low bounce. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.A4, t(0.04), 0.08, 0.38, 200, "triangle");
  thud(c, o, t(0.42), 90, 0.18, 0.14);
  tick(c, o, t(0.42), 0.08, 2000);
  thud(c, o, t(0.6), 110, 0.07, 0.06);
}
