import { blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.88;

/** Five soft triangle-wave notes stepping up the scale as the wave of bars rolls across, over a faint rising breath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.15), t(0.9), 800, 2600, 0.015);
  [N.E4, N.A4, N.D5, N.G5, N.B5].forEach((f, i) => blip(c, o, f, t(0.3 + i * 0.15), 0.07, 0.22, undefined, "triangle"));
}
