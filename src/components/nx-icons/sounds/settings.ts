import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.92;

/** A ratchet of clicks as the gears bite, slowing down, with a clunk when they overshoot. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.04, 0.09, 0.15, 0.22].forEach((at, i) => {
    tick(c, o, t(at), 0.14, 2600);
    blip(c, o, 170 - i * 8, t(at), 0.07, 0.05);
  });
  thud(c, o, t(0.3), 120, 0.12, 0.1);
  tick(c, o, t(0.34), 0.1, 2400);
  tick(c, o, t(0.5), 0.07, 2400);
}
