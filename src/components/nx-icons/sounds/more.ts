import { plink, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.85;

/** Three bubbly hops that climb in pitch, each with a tiny tick as the dot lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.1, 0.2].forEach((at, i) => {
    plink(c, o, [N.C6, N.E6, N.G6][i], t(at + 0.04), 0.08, 0.13);
    tick(c, o, t(at + 0.34), 0.06, 3400);
  });
}
