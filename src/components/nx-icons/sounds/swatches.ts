import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick riffle of rising card ticks as the fan opens, three soft bells of different colours, and a gentle reverse riffle as it folds shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.03, 0.08, 0.13, 0.18, 0.23, 0.28].forEach((at, i) => tick(c, o, t(at), 0.07, 3200 + i * 500));
  ding(c, o, N.D6, t(0.3), 0.06, 0.45);
  ding(c, o, N.A5, t(0.38), 0.05, 0.4);
  ding(c, o, N.E6, t(0.46), 0.045, 0.35);
  ding(c, o, N.B6, t(0.54), 0.035, 0.3);
  [0.62, 0.68, 0.74, 0.8].forEach((at, i) => tick(c, o, t(at), 0.05, 5200 - i * 600));
  swish(c, o, t(0.6), t(0.3), 2800, 800, 0.02);
}
