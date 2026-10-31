import { ding, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.24;

/** A buzz-buzz vibration with a three-note ringtone played twice as the screen lights. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let i = 0; i < 8; i++) blip(c, o, 180, t(i * 0.125), 0.09, 0.09, 150, "sawtooth");
  [N.E6, N.G6, N.C7].forEach((f, i) => ding(c, o, f, t(0.1 + i * 0.16), 0.07, 0.5));
  [N.E6, N.G6, N.C7].forEach((f, i) => ding(c, o, f, t(0.62 + i * 0.16), 0.05, 0.5));
}
