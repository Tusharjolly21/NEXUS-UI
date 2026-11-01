import { ding, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.65;

/** A pop as the bubble opens, three rising blips for the typing dots, a second round as they bounce, and a received ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 400, t(0.02), 0.1, 0.1, 820);
  [0.2, 0.3, 0.4].forEach((at, i) => blip(c, o, [N.E5, N.G5, N.B5][i], t(at), 0.06, 0.09));
  [0.6, 0.7, 0.8].forEach((at, i) => blip(c, o, [N.G5, N.B5, N.D6][i], t(at), 0.05, 0.09));
  ding(c, o, N.D7, t(1.05), 0.07, 0.4);
}
