import { ding, plink, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.47;

/** Three wet plops, each higher than the last, as the paint dabs land, with a little splash. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.12, 0.24].forEach((at, i) => { plink(c, o, [N.C6, N.E6, N.A6][i], t(at + 0.06), 0.09, 0.14); puff(c, o, t(at + 0.06), 0.06, 1800, 0.03, "bandpass"); });
  ding(c, o, N.E7, t(0.48), 0.05, 0.4);
}
