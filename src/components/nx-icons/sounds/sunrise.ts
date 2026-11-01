import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.73;

/** A warm low pad swelling as the sun rises, three bell tones as the rays pop out, and three chirps of morning birds. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 180, t(0.02), 0.05, 0.6, 340, "triangle");
  swish(c, o, t(0.05), t(0.55), 300, 1200, 0.02);
  [0.4, 0.5, 0.6].forEach((at, i) => ding(c, o, [N.D5, N.A5, N.E6][i], t(at), 0.05, 0.35));
  blip(c, o, 3100, t(0.7), 0.025, 0.06, 3600);
  blip(c, o, 3500, t(0.8), 0.025, 0.06, 3000);
  blip(c, o, 3300, t(0.88), 0.02, 0.05, 3700);
}
