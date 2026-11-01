import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.37;

/** Six rising marimba notes as the windows switch on, floor by floor, and a door click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => { blip(c, o, f, t(0.08 + i * 0.08), 0.07, 0.14); tick(c, o, t(0.07 + i * 0.08), 0.04, 4200); });
  tick(c, o, t(0.62), 0.1, 2400);
  ding(c, o, N.C7, t(0.64), 0.05, 0.4);
}
