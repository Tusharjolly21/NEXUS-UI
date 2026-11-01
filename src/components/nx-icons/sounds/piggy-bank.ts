import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.85;

/** A coin whistling down, a bright ting as it lands, a ceramic thud, and two little oinks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 3600, t(0.02), 0.03, 0.3, 2400);
  ding(c, o, N.E7, t(0.4), 0.1, 0.5);
  tick(c, o, t(0.4), 0.1, 3600);
  ding(c, o, N.A6, t(0.43), 0.05, 0.4);
  thud(c, o, t(0.46), 100, 0.18, 0.12);
  blip(c, o, 420, t(0.6), 0.06, 0.16, 300, "triangle");
  blip(c, o, 380, t(0.74), 0.05, 0.1, 290, "triangle");
}
