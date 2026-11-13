import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.82;

/** A low motor hum and five ratchet clicks as the wheel moves a step, finished by a soft clunk when the gondolas stop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 150, 420, 0.035); // 0.00-0.90 motor turns the wheel
  tick(c, o, t(0.255), 0.12, 2200); // 0.255 a sixth of the step
  tick(c, o, t(0.361), 0.12, 2600); // 0.361
  tick(c, o, t(0.45), 0.12, 2200); // 0.45 half way
  tick(c, o, t(0.539), 0.12, 2600); // 0.539
  tick(c, o, t(0.645), 0.12, 2200); // 0.645
  thud(c, o, t(0.88), 100, 0.14, 0.12); // 0.90 the wheel comes to rest
}
