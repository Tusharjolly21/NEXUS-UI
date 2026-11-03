import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.36;

/** A wide airy burst as the ring spreads, then four bubbly notes, one for each arrowhead, that hop around the compass and land on a round low bell at the centre. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.4), 500, 2600, 0.03);
  [N.D6, N.A5, N.E5, N.G5].forEach((f, i) => plink(c, o, f, t(0.14 + i * 0.1), 0.07, 0.13));
  ding(c, o, N.C5, t(0.58), 0.07, 0.5);
}
