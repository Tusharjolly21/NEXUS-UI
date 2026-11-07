import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.52;

/** A soft electric lamp hum that swells as the lantern glows twice (0.24 s and 0.71 s), each with a glassy lens shimmer, and thin airy sweeps as the two rays shrink and regrow left and right. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.15), 3800, 1500, 0.03); // 0.00-0.15 the right ray shrinks to a stub
  blip(c, o, 190, t(0.2), 0.05, 0.22, 300, "triangle"); // 0.20 the lantern swells to its first glow
  ding(c, o, 2300, t(0.24), 0.035, 0.35); // 0.24 the lamp glass catches the light at the first peak
  swish(c, o, t(0.4), t(0.2), 2800, 1000, 0.03); // 0.40-0.60 the left ray draws in
  swish(c, o, t(0.4), t(0.2), 1000, 3000, 0.025); // 0.40-0.60 while the right ray grows back out
  blip(c, o, 230, t(0.67), 0.05, 0.22, 340, "triangle"); // 0.67 the lantern swells to its second glow
  ding(c, o, 2900, t(0.71), 0.03, 0.3); // 0.71 the lens shimmer at the second peak
  swish(c, o, t(0.85), t(0.15), 1000, 3400, 0.03); // 0.85-1.00 the left ray regrows to full length
}
