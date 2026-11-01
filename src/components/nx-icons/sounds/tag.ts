import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.06;

/** A string of small metallic tinks, each lower and softer, as the tag swings and settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.0, N.E7, 0.1], [0.2, N.C7, 0.08], [0.4, N.A6, 0.06], [0.6, N.E6, 0.05], [0.78, N.C6, 0.04]].forEach(([at, f, g]) => {
    ding(c, o, f, t(at + 0.02), g, 0.25);
    tick(c, o, t(at + 0.02), g + 0.03, 4800);
  });
  swish(c, o, t(0.02), t(0.8), 2200, 800, 0.012);
}
