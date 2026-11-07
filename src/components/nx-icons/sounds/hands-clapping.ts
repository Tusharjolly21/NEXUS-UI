import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.71;

/** Two cupped palm claps, each a quick flam of noise over a hollow pop, landing exactly as the hands meet, with a tiny glint of the spark, and a soft whoosh of the hands in between. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.14), 700, 1600, 0.012); // 0.00-0.14 the hands swing apart
  swish(c, o, t(0.16), t(0.15), 800, 2800, 0.04); // 0.16-0.31 the hands swing together
  puff(c, o, t(0.315), 0.03, 2200, 0.1, "bandpass"); // 0.32 the first palm touches
  puff(c, o, t(0.325), 0.06, 1700, 0.17, "bandpass"); // 0.32 the clap
  puff(c, o, t(0.325), 0.025, 6400, 0.07, "highpass"); // 0.32 the sizzle of the skin
  blip(c, o, 720, t(0.32), 0.1, 0.07, 320, "sine"); // 0.32 the hollow pop of the cupped hands
  blip(c, o, 4200, t(0.33), 0.035, 0.07, 3200); // 0.33 the spark glints
  swish(c, o, t(0.33), t(0.17), 1600, 600, 0.015); // 0.33-0.50 the hands swing apart
  swish(c, o, t(0.5), t(0.15), 700, 2900, 0.04); // 0.50-0.65 the hands swing together
  puff(c, o, t(0.655), 0.03, 2400, 0.11, "bandpass"); // 0.66 the second palm touches
  puff(c, o, t(0.665), 0.06, 1900, 0.18, "bandpass"); // 0.66 the clap
  puff(c, o, t(0.665), 0.025, 6800, 0.075, "highpass"); // 0.66 the sizzle of the skin
  blip(c, o, 680, t(0.66), 0.11, 0.07, 300, "sine"); // 0.66 the hollow pop of the cupped hands
  blip(c, o, 4800, t(0.67), 0.04, 0.08, 3600); // 0.67 the bigger spark glints
}
