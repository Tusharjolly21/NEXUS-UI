import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.28;

/** Two layered sweeps, a slow one rising and a faster pair falling in the opposite direction, with a high ping and a lower ping marking each ring coming round. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0), 0.08, 4200);
  swish(c, o, t(0.03), t(1.1), 500, 2200, 0.035);
  swish(c, o, t(0.03), t(0.55), 3200, 900, 0.022);
  swish(c, o, t(0.63), t(0.55), 3200, 900, 0.022);
  blip(c, o, N.D6, t(0.02), 0.05, 0.12);
  blip(c, o, N.G5, t(0.62), 0.05, 0.12);
}
