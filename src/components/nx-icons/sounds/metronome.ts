import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A steady wooden tick and a lower tock alternating on every swing, five beats in all, each with a dry click on top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.12, 0.36, 0.6, 0.84, 1.08].forEach((at, i) => {
    blip(c, o, i % 2 ? N.G5 : N.D6, t(at), 0.11, 0.06);
    tick(c, o, t(at), 0.1, i % 2 ? 2800 : 3600);
    thud(c, o, t(at), i % 2 ? 150 : 190, 0.07, 0.04);
  });
  ding(c, o, N.E5, t(1.12), 0.03, 0.18);
}
