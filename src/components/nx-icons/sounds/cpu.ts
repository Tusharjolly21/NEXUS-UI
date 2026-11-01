import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.88;

/** Digital chirps in fast pairs circle round the four sides of the chip, ending on a clean ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.15, N.C6], [0.27, N.G6], [0.39, N.E6], [0.51, N.C7]].forEach(([at, f]) => {
    blip(c, o, f, t(at), 0.05, 0.05, undefined, "square");
    blip(c, o, f * 1.5, t(at + 0.04), 0.04, 0.05, undefined, "square");
    tick(c, o, t(at), 0.05, 5200);
  });
  ding(c, o, N.G6, t(0.66), 0.06, 0.4);
}
