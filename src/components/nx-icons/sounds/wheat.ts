import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A breathy wind that swells and falls with each sway, and four dry seed rustles as the grains flick one after another from the top down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.45), 600, 1500, 0.04); // 0.00 to 0.45 wind pushes the ear one way
  swish(c, o, t(0.45), t(0.45), 1500, 700, 0.032); // 0.45 to 0.90 and back
  tick(c, o, t(0.32), 0.07, 4600); // 0.32 top grain flicks
  tick(c, o, t(0.38), 0.07, 4200); // 0.38 first pair flicks
  tick(c, o, t(0.44), 0.07, 3800); // 0.44 second pair flicks
  tick(c, o, t(0.5), 0.07, 3400); // 0.50 bottom pair flicks
  puff(c, o, t(0.62), 0.1, 3800, 0.015, "highpass"); // 0.62 grains rustle back to rest
  puff(c, o, t(0.86), 0.06, 2400, 0.02, "lowpass"); // 0.86 the stalk comes to rest
}
