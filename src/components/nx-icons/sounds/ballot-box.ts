import { thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.33;

/** A papery slide as the ballot drops through the slot, a hollow cardboard thump inside the box, and a second rustle as a fresh ballot rises back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.3, 2300, 0.04); // 0.00-0.32 the ballot slides down through the slot
  thud(c, o, t(0.32), 128, 0.18, 0.16); // 0.32 it lands in the box and the box squashes
  puff(c, o, t(0.33), 0.07, 640, 0.04, "lowpass"); // 0.33 hollow cardboard knock
  puff(c, o, t(0.5), 0.3, 2700, 0.035); // 0.50-0.82 a fresh ballot rises out of the slot
  puff(c, o, t(0.82), 0.04, 4800, 0.03, "highpass"); // 0.82 the paper peaks and settles
}
