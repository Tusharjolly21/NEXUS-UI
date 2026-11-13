import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.38;

/** A motor that growls up to a high whine while the blade chops with a quick ratchet of ticks, then growls back down as the jar stops shaking. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 95, t(0.0), 0.035, 0.4, 560, "sawtooth"); // 0.00-0.38 the motor revs up
  blip(c, o, 560, t(0.38), 0.03, 0.45, 110, "sawtooth"); // 0.38-0.80 the motor slows down
  [0.0667, 0.2, 0.333, 0.467, 0.6, 0.733].forEach((at, i) => tick(c, o, t(at), 0.07 + (i % 2) * 0.02, 2600 + i * 250)); // 0.07-0.73 the blade passes edge on, six chops
  swish(c, o, t(0.1), t(0.6), 1200, 2400, 0.02); // 0.10-0.70 the liquid churns
}
