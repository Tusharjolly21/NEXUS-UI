import { thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.48;

/** Two soft footsteps: a faint scuff as each print lifts, then a dull shoe thud as it lands, the second a little higher than the first. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.12), 0.08, 1800, 0.03, "bandpass"); // 0.12 the left print lifts
  thud(c, o, t(0.42), 130, 0.14, 0.12); // 0.42 the left print lands
  puff(c, o, t(0.42), 0.05, 2400, 0.04, "lowpass"); // 0.42 grit under the sole
  puff(c, o, t(0.47), 0.08, 1800, 0.03, "bandpass"); // 0.47 the right print lifts
  thud(c, o, t(0.77), 155, 0.14, 0.12); // 0.77 the right print lands
  puff(c, o, t(0.77), 0.05, 2600, 0.04, "lowpass"); // 0.77 grit under the sole
}
