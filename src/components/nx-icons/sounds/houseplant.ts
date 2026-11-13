import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.48;

/** A gentle leafy rustle as the plant sways, with a small rising chirp each time a leaf swells in turn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.5), 900, 600, 0.02); // 0.00-0.50 the plant sways left then right
  puff(c, o, t(0.3), 0.14, 3800, 0.045); // 0.30 the first leaf swells
  blip(c, o, 500, t(0.35), 0.04, 0.1, 760); // 0.35 the first leaf is at its biggest
  puff(c, o, t(0.45), 0.14, 3400, 0.04); // 0.45 the second leaf swells
  blip(c, o, 560, t(0.5), 0.035, 0.1, 840); // 0.50 the second leaf is at its biggest
  puff(c, o, t(0.6), 0.14, 3000, 0.035); // 0.60 the third leaf swells
  blip(c, o, 620, t(0.65), 0.03, 0.1, 920); // 0.65 the third leaf is at its biggest
  swish(c, o, t(0.5), t(0.5), 600, 800, 0.015); // 0.50-1.00 the sway settles
}
