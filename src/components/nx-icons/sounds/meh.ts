import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.04;

/** A flat, low double hum like a shrug, two small sideways swishes as the eyes glance, and a dry tick at the blink. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.2), 900, 1500, 0.02);
  blip(c, o, N.G4, t(0.15), 0.08, 0.14, undefined, "triangle");
  swish(c, o, t(0.45), t(0.2), 1500, 900, 0.02);
  blip(c, o, N.G4, t(0.5), 0.08, 0.14, undefined, "triangle");
  tick(c, o, t(0.78), 0.08, 2500);
  blip(c, o, N.E4, t(0.8), 0.05, 0.18, undefined, "triangle");
}
