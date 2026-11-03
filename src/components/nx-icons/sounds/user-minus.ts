import { plink, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.82;

/** A soft hum as the person steps back, a falling sweep as the minus slides in, a low note that slumps from E to A, a soft pluck on C, and a small thud when it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 340, t(0.02), 0.05, 0.12, 270, "triangle");
  swish(c, o, t(0.1), t(0.4), 3200, 900, 0.03);
  blip(c, o, N.E5, t(0.4), 0.07, 0.16, N.A4, "triangle");
  plink(c, o, N.C5, t(0.52), 0.04, 0.2);
  thud(c, o, t(0.6), 150, 0.12, 0.1);
}
