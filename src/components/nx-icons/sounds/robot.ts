import { plink, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two square-wave beeps as the antenna blinks, a whirring servo that sweeps down and up as the eyes scan, and a bright two-note confirmation chirp. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1850, t(0.05), 0.045, 0.06, undefined, "square");
  blip(c, o, 1850, t(0.4), 0.045, 0.06, undefined, "square");
  blip(c, o, 190, t(0.14), 0.05, 0.18, 340, "sawtooth");
  blip(c, o, 340, t(0.34), 0.05, 0.2, 170, "sawtooth");
  blip(c, o, 170, t(0.56), 0.04, 0.16, 250, "sawtooth");
  plink(c, o, N.D6, t(0.74), 0.07, 0.12);
  plink(c, o, N.B5, t(0.84), 0.06, 0.16);
}
