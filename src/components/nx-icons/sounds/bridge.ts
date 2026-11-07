import { plink, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A bright run of five taut cable plucks hopping up from left to right, a low drone of the span, and a heavy thump with a short wobble as the deck settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.E4, N.A4, N.G4, N.D5, N.C5].forEach((f, i) => plink(c, o, f, t(0.04 + i * 0.1), 0.08, 0.3));
  blip(c, o, 82, t(0.05), 0.06, 0.5, 78, "triangle");
  thud(c, o, t(0.66), 85, 0.3, 0.2);
  blip(c, o, 120, t(0.74), 0.04, 0.12, 100);
  blip(c, o, 110, t(0.88), 0.03, 0.1, 100);
  swish(c, o, t(0.1), t(0.45), 600, 2400, 0.012);
}
