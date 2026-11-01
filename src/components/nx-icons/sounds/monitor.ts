import { ding, plink, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.01;

/** A power-button thunk, a rising hum, and a two-note start-up chime with a pop as the window opens. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.0), 90, 0.14, 0.12);
  blip(c, o, 70, t(0.04), 0.05, 0.5, 200, "triangle");
  swish(c, o, t(0.05), t(0.35), 800, 3600, 0.03);
  ding(c, o, N.G5, t(0.2), 0.07, 0.7);
  ding(c, o, N.D6, t(0.34), 0.07, 0.7);
  plink(c, o, N.G6, t(0.5), 0.08, 0.14);
}
