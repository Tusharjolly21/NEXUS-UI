import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A smooth rising sweep that follows the beam for one full turn, a soft tick each time it crosses an axis, a sonar ping as it hits the blip and a lower echo as the blip swells. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.0), 450, 1300, 0.03); // 0.00-1.00 the beam sweeps one full turn
  [0.125, 0.375, 0.625, 0.875].forEach((at) => tick(c, o, t(at), 0.06, 3000)); // 0.13 0.38 0.63 0.88 the beam crosses an axis line
  blip(c, o, 1320, t(0.18), 0.12, 0.5); // 0.18 the beam hits the blip: ping
  blip(c, o, 880, t(0.38), 0.06, 0.4); // 0.38 the blip swells to its biggest: echo
  tick(c, o, t(1.0), 0.07, 2400); // 1.00 the beam is home again
}
