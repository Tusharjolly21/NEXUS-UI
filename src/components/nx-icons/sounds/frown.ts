import { plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.35;

/** Three sad notes stepping down while a slow sigh falls underneath, and one tiny high drip as the tear rolls off. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.7), 1800, 500, 0.02);
  [N.E5, N.C5, N.A4].forEach((f, i) => blip(c, o, f, t(0.05 + i * 0.25), 0.08, 0.3));
  plink(c, o, N.G6, t(0.8), 0.04, 0.1);
}
