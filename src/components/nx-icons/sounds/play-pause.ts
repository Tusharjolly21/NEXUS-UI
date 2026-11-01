import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.92;

/** A satisfying click, a springy rising blip as the triangle morphs into bars, and a soft ring pulse. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.16, 2600);
  thud(c, o, t(0.02), 220, 0.06, 0.05);
  blip(c, o, N.C6, t(0.05), 0.09, 0.2, N.G6);
  swish(c, o, t(0.05), t(0.35), 1200, 3000, 0.03);
  ding(c, o, N.E7, t(0.18), 0.04, 0.3);
}
