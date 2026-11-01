import { plink, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.84;

/** Four quick scattered ticks at different pitches as the bars slide, then a firm clack and two plinks as the grid locks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.05, 4200], [0.1, 3000], [0.15, 3800], [0.2, 2600]].forEach(([at, f]) => tick(c, o, t(at), 0.09, f));
  tick(c, o, t(0.4), 0.15, 2400);
  thud(c, o, t(0.4), 190, 0.1, 0.05);
  plink(c, o, N.E6, t(0.42), 0.06, 0.1);
  plink(c, o, N.B6, t(0.5), 0.05, 0.12);
}
