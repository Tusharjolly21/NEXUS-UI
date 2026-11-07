import { ding, plink, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A ripple of quick rising plucks as the thought pulse runs along the folds, then a bright electric zap and a ringing bell for the spark. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.G4, N.A4, N.D5, N.B5, N.E6].forEach((f, i) => plink(c, o, f, t(0.08 + i * 0.12), 0.06, 0.16));
  blip(c, o, 420, t(0.08), 0.03, 0.55, 1500, "triangle");
  tick(c, o, t(0.56), 0.12, 7200);
  blip(c, o, 3200, t(0.58), 0.05, 0.07, 1700, "sawtooth");
  ding(c, o, N.C8, t(0.62), 0.05, 0.6);
  thud(c, o, t(0.86), 160, 0.06, 0.06);
}
