import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.63;

/** Paper swooshes out and then back in, lands with a flat slap, flutters and settles with a last small rustle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.14), 900, 3000, 0.035); // 0.00-0.14 the paper is swept out
  swish(c, o, t(0.2), t(0.34), 3200, 700, 0.045); // 0.20-0.54 the paper is thrown in, fastest early
  thud(c, o, t(0.58), 200, 0.14, 0.07); // 0.58 the paper slaps down
  puff(c, o, t(0.58), 0.09, 2800, 0.07, "bandpass"); // 0.58 the sheets crack against each other
  puff(c, o, t(0.8), 0.1, 3400, 0.025, "highpass"); // 0.80 the paper settles back
}
