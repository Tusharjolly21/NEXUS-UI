import { ding, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.32;

/** A round bubble pop for the dot, then two clean pings, C and then a higher G, each followed by a faint echo that fades outward like a radar sweep. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 420, t(0.02), 0.09, 0.1, 640);
  ding(c, o, N.C6, t(0.16), 0.08, 0.4);
  ding(c, o, N.C6, t(0.3), 0.025, 0.25);
  ding(c, o, N.G6, t(0.36), 0.07, 0.45);
  ding(c, o, N.G6, t(0.52), 0.02, 0.3);
}
