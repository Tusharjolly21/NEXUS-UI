import { ding, blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.82;

/** A heavy low thump as the letter swells, a buzzy sawtooth note that bulges and fades, then a softer second thud as the weight settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.04), 96, 0.3, 0.18);
  blip(c, o, N.E4 / 2, t(0.05), 0.07, 0.4, N.E4 / 2 * 1.5, "sawtooth");
  blip(c, o, N.E4, t(0.08), 0.04, 0.35, N.E4 * 1.5, "triangle");
  puff(c, o, t(0.1), 0.25, 400, 0.04, "lowpass");
  thud(c, o, t(0.52), 120, 0.16, 0.14);
  ding(c, o, N.G4, t(0.6), 0.05, 0.4);
}
