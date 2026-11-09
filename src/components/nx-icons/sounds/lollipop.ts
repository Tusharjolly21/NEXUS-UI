import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A ratchet of glassy ticks that speeds up and slows down with the spinning spiral, and three small boings as the stick tilts side to side. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.312), 0.1, 3600); // 0.31 spiral passes a quarter turn
  tick(c, o, t(0.45), 0.1, 3900); // 0.45 half turn at top speed
  tick(c, o, t(0.588), 0.1, 3600); // 0.59 three quarters
  tick(c, o, t(0.9), 0.08, 3200); // 0.90 the spiral closes the full turn
  blip(c, o, 520, t(0.225), 0.06, 0.12, 330); // 0.225 stick tilts left
  blip(c, o, 340, t(0.45), 0.06, 0.12, 560); // 0.45 stick tilts right
  blip(c, o, 520, t(0.675), 0.05, 0.12, 360); // 0.675 stick tilts back
  swish(c, o, t(0.1), t(0.7), 1800, 3200, 0.012); // 0.10 to 0.80 the spiral whirrs
}
