import { ding, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.35;

/** A fast alarm bell clattering between two notes as the clock shakes, fading as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let i = 0; i < 8; i++) ding(c, o, i % 2 ? N.D7 : N.C7, t(0.03 + i * 0.1), 0.08 * (1 - i * 0.07), 0.14);
  tick(c, o, t(0.02), 0.1, 3000);
}
