import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.33;

/** Three soft clicks down the list, one for each bullet, with a little swoosh as each line slides. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.1, 0.2].forEach((at, i) => {
    tick(c, o, t(at + 0.04), 0.09, 3600 - i * 400);
    blip(c, o, [N.E6, N.C6, N.G5][i], t(at + 0.04), 0.06, 0.12);
    swish(c, o, t(at + 0.06), t(0.2), 2800, 1200, 0.015);
  });
  tick(c, o, t(0.55), 0.06, 2600);
}
