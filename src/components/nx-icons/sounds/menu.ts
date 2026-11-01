import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.17;

/** Three soft ticks falling in pitch, one for each line that slides. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.08, 0.16].forEach((at, i) => {
    tick(c, o, t(at + 0.02), 0.11, 4200 - i * 700);
    blip(c, o, [N.E6, N.C6, N.G5][i], t(at + 0.02), 0.07, 0.14);
  });
  swish(c, o, t(0.22), t(0.25), 1200, 2400, 0.02);
}
