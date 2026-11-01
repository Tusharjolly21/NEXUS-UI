import { ding, plink, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.56;

/** A swish as the ribbon drops, a soft thump as it squashes in, and a plink when it fills. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 3000, 900, 0.04);
  thud(c, o, t(0.3), 130, 0.14, 0.08);
  plink(c, o, N.G6, t(0.36), 0.08, 0.15);
  ding(c, o, N.C7, t(0.42), 0.05, 0.4);
}
