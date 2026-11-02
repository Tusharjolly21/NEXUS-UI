import { plink, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.65;

/** Three bubbly hops that step down in pitch from the top dot to the bottom one, each landing with a small tick. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.1, 0.2].forEach((at, i) => {
    plink(c, o, [N.B5, N.G5, N.D5][i], t(at + 0.04), 0.08, 0.14);
    tick(c, o, t(at + 0.36), 0.05, 3000 + i * 300);
  });
}
