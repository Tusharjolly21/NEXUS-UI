import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.4;

/** A friendly hello blip, a springy pop as the plus spins in, and a sparkling two-note ding on arrival. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.C6, t(0.04), 0.08, 0.12);
  blip(c, o, N.E6, t(0.16), 0.07, 0.14, N.G6);
  swish(c, o, t(0.12), t(0.3), 1400, 3600, 0.03);
  ding(c, o, N.G6, t(0.42), 0.07, 0.4);
  ding(c, o, N.C7, t(0.5), 0.05, 0.5);
}
