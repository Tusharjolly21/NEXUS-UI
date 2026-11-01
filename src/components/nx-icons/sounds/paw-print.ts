import { plink, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.43;

/** A soft pad press, then four little plucks stepping down and up the scale, one for each toe, and a tiny tap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.14), 130, 0.16, 0.09);
  puff(c, o, t(0.12), 0.1, 800, 0.04, "lowpass");
  [0.2, 0.3, 0.4, 0.5].forEach((at, i) => plink(c, o, [N.G6, N.D6, N.E6, N.C6][i], t(at), 0.055, 0.11));
  tick(c, o, t(0.62), 0.05, 3000);
}
