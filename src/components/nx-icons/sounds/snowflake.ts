import { ding, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** Glassy pings falling like snow, with a soft shimmer as the crystals turn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.05, N.E7], [0.2, N.C7], [0.35, N.G6], [0.5, N.E6], [0.68, N.C6]].forEach(([at, f], i) => ding(c, o, f as number, t(at as number), 0.07 - i * 0.008, 0.5));
  puff(c, o, t(0.0), 0.9, 6000, 0.012, "highpass");
}
