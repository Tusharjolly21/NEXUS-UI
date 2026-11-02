import { plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.15;

/** A sweeping swish as the bars swing, three stepped notes that fall back toward the start, and a small pluck at the arrow tip. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.32), 2200, 600, 0.04);
  blip(c, o, N.G5, t(0.06), 0.06, 0.1, N.E5, "triangle");
  blip(c, o, N.E5, t(0.2), 0.06, 0.1, N.D5, "triangle");
  plink(c, o, N.C5, t(0.34), 0.08, 0.2);
  tick(c, o, t(0.52), 0.06, 4000);
}
