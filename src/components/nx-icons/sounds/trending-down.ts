import { blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.32;

/** A falling whistle as the line slides downhill with four notes stepping down, then a thud as the arrowhead lands and the chart sags. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.6), 2400, 500, 0.035);
  [N.E6, N.C6, N.A5, N.E5].forEach((f, i) => blip(c, o, f, t(0.1 + i * 0.13), 0.06, 0.1));
  thud(c, o, t(0.62), 100, 0.18, 0.12);
  blip(c, o, N.G4, t(0.78), 0.05, 0.14);
}
