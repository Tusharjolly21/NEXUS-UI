import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.19;

/** A whoosh as the cap flies up, a short fanfare, and a tassel tick on the catch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 500, 2600, 0.05);
  [[0.3, N.C5], [0.38, N.E5], [0.46, N.G5], [0.58, N.C6]].forEach(([at, f]) => blip(c, o, f as number, t(at as number), 0.08, 0.2));
  ding(c, o, N.C7, t(0.62), 0.07, 0.5);
  tick(c, o, t(0.7), 0.08, 3600);
}
