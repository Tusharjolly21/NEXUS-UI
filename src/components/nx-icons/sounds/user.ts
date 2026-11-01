import { plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.56;

/** A friendly hello blip, then two notes rising as the green online dot pops, with a shimmer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.04), 0.1, 0.12, 880);
  plink(c, o, N.G5, t(0.2), 0.1);
  plink(c, o, N.C6, t(0.4), 0.12);
  swish(c, o, t(0.34), t(0.5), 3600, 7000, 0.02);
}
