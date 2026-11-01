import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** A climbing line of notes with ticks along the way, and a bright ding at the top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 400, t(0.03), 0.07, 0.55, 1700);
  [0.12, 0.27, 0.4].forEach((at, i) => tick(c, o, t(at), 0.06, 3400 + i * 500));
  ding(c, o, N.C7, t(0.55), 0.09, 0.5);
  ding(c, o, N.G7, t(0.62), 0.05, 0.4);
}
