import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.54;

/** A low hello and a higher reply overlapping, then a soft shared chime as the pair settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.A4, t(0.04), 0.07, 0.2);
  blip(c, o, N.E5, t(0.2), 0.07, 0.22);
  swish(c, o, t(0.04), t(0.3), 600, 1800, 0.02);
  ding(c, o, N.C6, t(0.44), 0.05, 0.5);
  ding(c, o, N.G6, t(0.44), 0.04, 0.5);
}
