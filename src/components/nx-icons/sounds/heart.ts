import { plink, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.02;

/** A deep lub-dub heartbeat, then three tiny bubbly notes as the hearts float away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.1), 70, 0.2, 0.18);
  thud(c, o, t(0.45), 62, 0.15, 0.16);
  [[0.2, N.G6], [0.32, N.B6], [0.44, N.D7]].forEach(([at, f]) => plink(c, o, f, t(at), 0.05));
}
