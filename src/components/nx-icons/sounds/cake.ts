import { ding, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.42;

/** A match strike, a whoosh as the candle catches, and the first four notes of a birthday song. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.12, 5000, 0.05, "highpass");
  swish(c, o, t(0.1), t(0.2), 700, 2200, 0.04);
  [[0.3, N.G5], [0.42, N.G5], [0.54, N.A5], [0.7, N.G5]].forEach(([at, f]) => blip(c, o, f as number, t(at as number), 0.08, 0.16));
  ding(c, o, N.C7, t(0.86), 0.05, 0.4);
}
