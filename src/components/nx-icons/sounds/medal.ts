import { ding, plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.97;

/** A swish as the ribbon swings, then metallic clinks at each turn of the pendulum that fade away, and a sparkle for the star. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.16), 2400, 1200, 0.02);
  [[0.2, N.E7, 0.08], [0.4, N.C7, 0.06], [0.6, N.G6, 0.04]].forEach(([at, f, g]) => {
    ding(c, o, f, t(at), g, 0.9);
    tick(c, o, t(at), g + 0.04, 4800);
  });
  ding(c, o, N.C8, t(0.62), 0.05, 0.7);
  plink(c, o, N.G7, t(0.7), 0.05, 0.2);
}
