import { blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.08;

/** A thin, rising scan as the line draws with two monitor beeps on the spike, then a soft lub and a quieter dub for the two beats. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.6), 1500, 4200, 0.02);
  blip(c, o, N.E6, t(0.3), 0.05, 0.06, undefined, "square");
  blip(c, o, N.G6, t(0.4), 0.04, 0.06, undefined, "square");
  thud(c, o, t(0.74), 120, 0.2, 0.12);
  thud(c, o, t(0.98), 95, 0.12, 0.1);
}
