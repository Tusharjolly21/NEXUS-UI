import { ding, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.11;

/** A ribbon being pulled, a cork-pop as the lid flies off, and a shower of glittering confetti. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.14), 1500, 4200, 0.05);
  puff(c, o, t(0.14), 0.07, 900, 0.14, "lowpass");
  blip(c, o, 180, t(0.14), 0.18, 0.08, 700);
  for (let i = 0; i < 7; i++) ding(c, o, [N.C7, N.E7, N.G7, N.D7, N.A6, N.C8, N.E7][i], t(0.2 + i * 0.07), 0.04 * (1 - i * 0.08), 0.35);
}
