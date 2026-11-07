import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.62;

/** Paper flutter: four airy flaps that follow the note's sway, a dry crinkle at each turn, and a small till ding as the green centre pulses at its brightest (a fainter one on the last pulse). */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), 0.2, 2500, 4600, 0.06); // 0.12 first sway, the note tilts left at its fastest
  swish(c, o, t(0.25), 0.2, 4400, 2400, 0.056); // 0.34 sway back to the right
  swish(c, o, t(0.47), 0.2, 2600, 4400, 0.048); // 0.56 third sway
  swish(c, o, t(0.7), 0.2, 4000, 2600, 0.028); // 0.79 last small sway
  puff(c, o, t(0.22), 0.04, 6500, 0.05, "highpass"); // 0.225 the note turns, paper crinkle
  puff(c, o, t(0.45), 0.035, 6000, 0.04, "highpass"); // 0.45 turns again
  puff(c, o, t(0.675), 0.03, 5600, 0.025, "highpass"); // 0.675 last small turn
  ding(c, o, 2900, t(0.225), 0.05, 0.35); // 0.225 green centre swells to its brightest
  ding(c, o, 3700, t(0.675), 0.03, 0.3); // 0.675 second, fainter green pulse
}
