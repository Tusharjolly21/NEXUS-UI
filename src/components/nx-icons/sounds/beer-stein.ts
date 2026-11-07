import { blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A hissing fizz as the foam swells, a wooden knock as the mug tips, and four small bubble pops climbing up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.45, 5400, 0.04, "highpass");
  swish(c, o, t(0.05), t(0.4), 700, 2600, 0.025);
  thud(c, o, t(0.3), 150, 0.2, 0.12);
  [N.B5, N.E6, N.A5, N.G6].forEach((f, i) => blip(c, o, f, t(0.42 + i * 0.1), 0.05, 0.05, f * 1.4));
}
