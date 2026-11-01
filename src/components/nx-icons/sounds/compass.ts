import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.76;

/** A whirl of air as the needle spins, then ticks that get softer with each overshoot, and a settling note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.4), 500, 2600, 0.04);
  [[0.39, 0.12], [0.65, 0.09], [0.91, 0.06], [1.14, 0.04]].forEach(([at, g]) => {
    tick(c, o, t(at), g + 0.04, 3600);
    blip(c, o, N.C7, t(at), g, 0.12);
  });
  ding(c, o, N.G6, t(1.28), 0.07, 0.6);
}
