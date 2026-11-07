import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A wobbling sci-fi hum that glides up and down, five rapid rising beeps for the rim lights, and a shimmering swell as the beam pulses. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 240, t(0.02), 0.06, 0.5, 420, "triangle");
  blip(c, o, 420, t(0.5), 0.06, 0.5, 220, "triangle");
  [N.A5, N.B5, N.D6, N.E6, N.A6].forEach((f, i) => blip(c, o, f, t(0.2 + i * 0.12), 0.045, 0.07));
  swish(c, o, t(0.3), t(0.8), 700, 2600, 0.03);
  ding(c, o, N.E7, t(1.0), 0.04, 0.3);
}
