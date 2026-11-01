import { ding, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.03;

/** A swoosh as it descends, a regal low chord as it lands, and three high sparkles for the jewels. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 3000, 700, 0.04);
  thud(c, o, t(0.23), 100, 0.2, 0.12);
  blip(c, o, N.C4, t(0.24), 0.06, 0.7, undefined, "triangle");
  blip(c, o, N.G4, t(0.24), 0.05, 0.7, undefined, "triangle");
  blip(c, o, N.C5, t(0.24), 0.04, 0.7, undefined, "triangle");
  [0.55, 0.65, 0.75].forEach((at, i) => ding(c, o, [N.E7, N.G7, N.C8][i], t(at), 0.05, 0.5));
}
