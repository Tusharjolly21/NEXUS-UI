import { blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.18;

/** A rattle inside the capsule, a pop as it splits, and a soft click as the halves snap back together. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.07, 0.13, 0.19].forEach((at, i) => { tick(c, o, t(at), 0.06, 3000 + i * 400); thud(c, o, t(at), 300, 0.02, 0.02); });
  blip(c, o, N.G6, t(0.24), 0.07, 0.1, N.C7);
  tick(c, o, t(0.24), 0.1, 3600);
  tick(c, o, t(0.58), 0.13, 2600);
  blip(c, o, N.E6, t(0.58), 0.05, 0.1);
}
