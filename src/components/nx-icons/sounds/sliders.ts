import { blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.74;

/** Ratchet ticks as each knob slides along its groove, with a click where each one settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.05, 0.1, 0.15].forEach((at, i) => {
    for (let k = 0; k < 4; k++) tick(c, o, t(at + k * 0.09), 0.06, 3000 + i * 500);
  });
  [0.45, 0.52, 0.58].forEach((at, i) => blip(c, o, N.C6 * (1 + i * 0.25), t(at), 0.07, 0.1));
  tick(c, o, t(0.9), 0.1, 2600);
}
