import { ding, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two airy flutters of the wings, a thin shimmer between them and a delicate two-note chime as it floats upward. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.04), 0.14, 4200, 0.03, "bandpass");
  puff(c, o, t(0.16), 0.1, 5600, 0.025, "bandpass");
  puff(c, o, t(0.42), 0.14, 4600, 0.03, "bandpass");
  puff(c, o, t(0.54), 0.1, 6000, 0.025, "bandpass");
  swish(c, o, t(0.1), t(0.6), 2600, 5200, 0.012);
  ding(c, o, N.B5, t(0.62), 0.04, 0.4);
  ding(c, o, N.G6, t(0.72), 0.035, 0.4);
}
