import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A four-on-the-floor kick with hi-hat ticks between, and a sparkling run of glassy bells that climbs as the tiles glint. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.05, 0.3, 0.55, 0.8].forEach((at) => thud(c, o, t(at), 95, 0.22, 0.1));
  [0.175, 0.425, 0.675, 0.925].forEach((at) => tick(c, o, t(at), 0.07, 8000));
  [N.D6, N.A6, N.E6, N.B6, N.G7].forEach((f, i) => ding(c, o, f, t(0.15 + i * 0.17), 0.045, 0.35));
  swish(c, o, t(0.1), t(0.9), 2000, 6000, 0.015);
}
