import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.42;

/** A low note that dips as the triangle sinks, a rising sweep as it lifts, then a three-bell chime stepping up and a faint shimmer as its echo ripples outward. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.G4, t(0.03), 0.06, 0.12, N.E4, "triangle");
  swish(c, o, t(0.2), t(0.32), 700, 2800, 0.04);
  ding(c, o, N.C6, t(0.42), 0.07, 0.6);
  ding(c, o, N.G6, t(0.53), 0.05, 0.5);
  ding(c, o, N.D7, t(0.66), 0.03, 0.45);
  swish(c, o, t(0.45), t(0.4), 3400, 5200, 0.012);
}
