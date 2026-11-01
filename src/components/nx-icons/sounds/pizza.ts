import { ding, blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.38;

/** A sizzle under the slice, three pops as the toppings land, and a satisfying nom. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.7, 5200, 0.025, "highpass");
  [0.12, 0.22, 0.32].forEach((at, i) => blip(c, o, [N.C6, N.E6, N.G6][i], t(at), 0.08, 0.1));
  thud(c, o, t(0.62), 140, 0.14, 0.08);
  ding(c, o, N.C7, t(0.64), 0.06, 0.4);
}
