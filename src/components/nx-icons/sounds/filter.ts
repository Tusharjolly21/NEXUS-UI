import { plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.22;

/** A soft sifting hiss and three falling plinks, each lower than the last, as bits drop through. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 3200, 1000, 0.04);
  [[0.15, N.B6], [0.3, N.G6], [0.45, N.D6]].forEach(([at, f]) => plink(c, o, f as number, t(at as number), 0.07, 0.12));
  tick(c, o, t(0.55), 0.08, 3000);
}
