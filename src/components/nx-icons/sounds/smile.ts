import { plink, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.27;

/** A little blink tick, then a giggle of three rising bubbly notes as the smile widens. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.18), 0.07, 4400);
  plink(c, o, N.C6, t(0.06), 0.06, 0.08);
  [N.B5, N.D6, N.G6].forEach((f, i) => plink(c, o, f, t(0.3 + i * 0.08), 0.07, 0.1));
}
