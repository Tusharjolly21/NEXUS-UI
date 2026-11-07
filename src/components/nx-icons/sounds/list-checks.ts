import { ding, plink, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three paired taps, a pencil tick and a bright bell for each task that is checked off, each pair a step higher than the last. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.0, N.A4], [0.25, N.D6], [0.5, N.B6]].forEach(([at, f]) => {
    tick(c, o, t(at + 0.02), 0.08, 4600);
    plink(c, o, f, t(at + 0.06), 0.08, 0.2);
  });
  ding(c, o, N.E7, t(0.76), 0.04, 0.5);
}
