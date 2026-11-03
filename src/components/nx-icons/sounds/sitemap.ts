import { ding, plink, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.52;

/** A low bell for the root box, a falling sweep as the trunk draws down, a split sweep for the branches, and three rising plucks as each child box drops in with a soft landing tap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.G4, t(0.04), 0.07, 0.4);
  swish(c, o, t(0.12), t(0.3), 1800, 600, 0.03);
  swish(c, o, t(0.35), t(0.3), 700, 2400, 0.03);
  [N.E5, N.A5, N.D6].forEach((f, i) => {
    plink(c, o, f, t(0.66 + i * 0.09), 0.07, 0.13);
    thud(c, o, t(0.66 + i * 0.09), 160, 0.06, 0.05);
  });
  ding(c, o, N.A6, t(0.94), 0.035, 0.3);
}
