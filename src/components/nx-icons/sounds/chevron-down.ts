import { blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.05;

/** Two soft marimba nods stepping downwards, each with a tiny tick, one after the other. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.C6, t(0.1), 0.08, 0.14);
  tick(c, o, t(0.08), 0.05, 4000);
  blip(c, o, N.G5, t(0.22), 0.08, 0.16);
  tick(c, o, t(0.2), 0.05, 3400);
}
