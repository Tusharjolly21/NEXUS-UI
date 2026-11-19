import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.1;

/** A soft brush of fur as the fox tilts its head, a small curious rising chirp as it tilts the other way, and a faint flick of the blink. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.21), 1800, 2600, 0.025); // 0.00-0.21 the head tilts, fur brushing
  blip(c, o, 720, t(0.43), 0.07, 0.14, 1180, "triangle"); // 0.43 a curious chirp as the head swings back
  tick(c, o, t(0.49), 0.03, 6500); // 0.49 the eyes blink shut
  swish(c, o, t(0.45), t(0.22), 2600, 1700, 0.02); // 0.45-0.67 the head tilts the other way
  puff(c, o, t(0.67), 0.1, 1500, 0.02); // 0.67 the head settles upright
}
