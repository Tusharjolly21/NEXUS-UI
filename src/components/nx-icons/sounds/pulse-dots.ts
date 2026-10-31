import { blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.24;

/** Three gentle, rounded notes that swell with the dots. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.G5, N.B5, N.D6].forEach((f, i) => blip(c, o, f, t(0.55 + i * 0.18), 0.08, 0.3));
}
