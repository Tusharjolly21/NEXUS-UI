import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.77;

/** A cold hush of wind that drifts down with the flakes, soft cloud puffs as the cloud bobs, and a tiny glassy tinkle as each flake slips out the bottom and fades back in from the cloud. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), 0.45, 3200, 1800, 0.032); // 0.25 flakes drift down
  swish(c, o, t(0.56), 0.5, 3200, 1800, 0.032); // 0.78 flakes drift down again after returning
  swish(c, o, t(0.9), 0.3, 2400, 1500, 0.02); // 1.03 flakes settle into place
  puff(c, o, t(0.13), 0.1, 450, 0.025, "lowpass"); // 0.15 cloud lifts
  puff(c, o, t(0.44), 0.1, 400, 0.02, "lowpass"); // 0.45 cloud sinks back
  puff(c, o, t(0.74), 0.1, 450, 0.02, "lowpass"); // 0.75 cloud lifts again
  puff(c, o, t(1.04), 0.1, 400, 0.015, "lowpass"); // 1.05 cloud settles
  ding(c, o, 4400, t(0.54), 0.035, 0.25); // 0.54 first flake leaves the bottom and returns from the top
  ding(c, o, 5200, t(0.64), 0.03, 0.25); // 0.64 middle flake
  ding(c, o, 4700, t(0.74), 0.03, 0.25); // 0.74 last flake
}
