import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.7;

/** A run of rapid square-wave scanner beeps climbing in pitch as the dots pop, and a final confirming ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3, 4].forEach((i) => blip(c, o, 700 + i * 160, t(0.06 + i * 0.07), 0.05, 0.05, undefined, "square"));
  tick(c, o, t(0.06), 0.08, 3600);
  ding(c, o, N.E7, t(0.5), 0.07, 0.4);
}
