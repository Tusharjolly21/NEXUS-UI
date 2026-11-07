import { plink, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low sloshing wash that swells and ebbs, with five soft bubble pops climbing in pitch above it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.45), 320, 900, 0.045);
  swish(c, o, t(0.38), t(0.5), 900, 260, 0.04);
  puff(c, o, t(0.2), 0.14, 700, 0.03, "lowpass");
  blip(c, o, 620, t(0.14), 0.07, 0.05, 1100);
  blip(c, o, 780, t(0.3), 0.06, 0.05, 1400);
  blip(c, o, 940, t(0.47), 0.06, 0.05, 1700);
  plink(c, o, N.G6, t(0.62), 0.05, 0.1);
  plink(c, o, N.D6, t(0.78), 0.04, 0.12);
}
