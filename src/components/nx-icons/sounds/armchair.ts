import { blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft cushioned thump with a breath of air as someone sits, two springy squeaks as it rebounds, and a small settling bump. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.17), 0.18, 800, 0.05, "lowpass");
  thud(c, o, t(0.2), 98, 0.26, 0.15);
  blip(c, o, N.E4, t(0.46), 0.07, 0.14, N.C4, "triangle");
  blip(c, o, N.G4, t(0.54), 0.04, 0.1, 470);
  thud(c, o, t(0.66), 132, 0.1, 0.1);
  puff(c, o, t(0.7), 0.12, 600, 0.02, "lowpass");
}
