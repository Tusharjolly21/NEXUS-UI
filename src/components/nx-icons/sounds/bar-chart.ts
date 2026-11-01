import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.24;

/** Three rising marimba notes as the bars grow, with a bright ding when they reach the top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C6, N.D6, N.G6].forEach((f, i) => { plink(c, o, f, t(0.1 + i * 0.12), 0.09, 0.16); swish(c, o, t(0.02 + i * 0.12), t(0.22), 600 + i * 400, 1800 + i * 600, 0.015); });
  ding(c, o, N.E7, t(0.62), 0.08, 0.5);
}
