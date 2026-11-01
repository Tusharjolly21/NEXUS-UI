import { plink, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.33;

/** A rustle of paper, two pencil scratches as the lines are written, and a soft plink when the page is done. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.12, 3600, 0.03, "highpass");
  [[0.1, 0.3], [0.3, 0.25]].forEach(([at, len]) => puff(c, o, t(at), len, 5400, 0.03, "highpass"));
  [0.12, 0.2, 0.28, 0.34, 0.42, 0.5].forEach((at) => tick(c, o, t(at), 0.05, 4200));
  plink(c, o, N.G6, t(0.58), 0.08, 0.15);
}
