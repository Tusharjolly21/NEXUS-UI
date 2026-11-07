import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A deep foghorn note as the lamp wakes, then two bell strikes that pan the beam, high then lower then high again, with a thin sweep behind each. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 98, t(0.02), 0.09, 0.3, 92, "sawtooth");
  blip(c, o, 147, t(0.02), 0.04, 0.3, 138, "triangle");
  swish(c, o, t(0.22), t(0.3), 1200, 3600, 0.025);
  ding(c, o, N.B5, t(0.3), 0.08, 0.5);
  swish(c, o, t(0.52), t(0.3), 3600, 1200, 0.025);
  ding(c, o, N.E6, t(0.6), 0.08, 0.5);
  ding(c, o, N.D6, t(0.84), 0.05, 0.4);
}
