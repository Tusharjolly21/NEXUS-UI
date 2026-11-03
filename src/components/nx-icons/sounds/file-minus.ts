import { plink, blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.8;

/** A quick low shuffle as the page shudders, a sideways sweep as the minus slides in from the right, and a soft descending pair of notes with a gentle thump as it springs into place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.1, 1400, 0.04, "bandpass");
  swish(c, o, t(0.12), t(0.3), 3400, 900, 0.045);
  blip(c, o, N.D6, t(0.4), 0.06, 0.12, N.A5);
  plink(c, o, N.G5, t(0.5), 0.05, 0.2);
  thud(c, o, t(0.46), 150, 0.12, 0.08);
}
