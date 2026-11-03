import { plink, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.91;

/** A wobbly bubble pop, then three soft typing taps on rising pitches, C, E and B, finished by a small wave of three quick ticks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 360, t(0.02), 0.08, 0.14, 720);
  [N.C5, N.E5, N.B5].forEach((f, i) => {
    tick(c, o, t(0.22 + i * 0.12), 0.08, 3600);
    plink(c, o, f, t(0.23 + i * 0.12), 0.05, 0.12);
  });
  [0.62, 0.7, 0.78].forEach((at) => tick(c, o, t(at), 0.05, 4600));
}
