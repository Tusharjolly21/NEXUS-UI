import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.26;

/** A soft hinge creak as the lid opens, a magnetic click, and a two-note start-up chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 220, t(0.02), 0.04, 0.4, 460, "triangle");
  swish(c, o, t(0.02), t(0.4), 700, 1800, 0.02);
  tick(c, o, t(0.46), 0.12, 2600);
  thud(c, o, t(0.46), 160, 0.06, 0.05);
  ding(c, o, N.G5, t(0.55), 0.07, 0.5);
  ding(c, o, N.C6, t(0.66), 0.07, 0.6);
}
