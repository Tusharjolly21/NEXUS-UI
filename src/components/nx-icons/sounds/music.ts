import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.09;

/** A cheerful marimba tune, C, E, G and a high C, hopping along with the notes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[N.C6, 0], [N.E6, 0.2], [N.G6, 0.4], [N.C7, 0.6]].forEach(([f, at]) => {
    blip(c, o, f, t(at), 0.1, 0.22);
    blip(c, o, f * 2, t(at), 0.025, 0.08);
    tick(c, o, t(at), 0.05, 4000);
  });
  ding(c, o, N.C7, t(0.62), 0.04, 0.4);
}
