import { blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A crunchy bite, then a pair of squeaks as the mouse peeks out, with three hollow pops from the holes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.18), 0.05, 2800, 0.1, "bandpass");
  thud(c, o, t(0.2), 240, 0.12, 0.06);
  blip(c, o, 2100, t(0.38), 0.05, 0.07, 3100);
  blip(c, o, 2500, t(0.5), 0.045, 0.06, 3600);
  [0.1, 0.32, 0.58].forEach((at, i) => blip(c, o, 520 + i * 90, t(at), 0.05, 0.05, 380 + i * 60));
  blip(c, o, N.G4, t(0.62), 0.06, 0.12, 330);
  blip(c, o, N.C5, t(0.74), 0.05, 0.12, 440);
}
