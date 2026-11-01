import { ding, plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.56;

/** Soft working blips while it spins, a rising whoosh as the ring closes, then a three-note success arpeggio. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let i = 0; i < 7; i++) blip(c, o, 700 + i * 70, t(0.14 + i * 0.16), 0.04, 0.06);
  swish(c, o, t(1.15), t(0.4), 600, 2600, 0.04);
  plink(c, o, N.C6, t(1.55), 0.1);
  plink(c, o, N.E6, t(1.67), 0.1);
  plink(c, o, N.G6, t(1.8), 0.12);
  ding(c, o, N.C7, t(1.9), 0.06, 0.9);
}
