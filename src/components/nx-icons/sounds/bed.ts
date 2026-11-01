import { ding, plink, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.52;

/** A slow breath in and a longer breath out under the blanket, with two lullaby notes drifting up like music-box chimes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 250, 700, 0.04);
  swish(c, o, t(0.55), t(0.6), 700, 220, 0.035);
  puff(c, o, t(0.1), 0.9, 180, 0.03, "lowpass");
  plink(c, o, N.E6, t(0.4), 0.05, 0.3);
  plink(c, o, N.C6, t(0.85), 0.045, 0.36);
  ding(c, o, N.G6, t(1.05), 0.03, 0.5);
}
