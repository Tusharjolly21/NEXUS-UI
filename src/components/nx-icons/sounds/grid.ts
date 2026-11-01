import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.43;

/** Four rising marimba pops, one for each tile, on the beat of each pop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C6, N.E6, N.G6, N.C7].forEach((f, i) => { blip(c, o, f, t(0.1 + i * 0.08), 0.08, 0.14); tick(c, o, t(0.08 + i * 0.08), 0.06, 4200); });
  ding(c, o, N.G7, t(0.44), 0.04, 0.35);
}
