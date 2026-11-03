import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.84;

/** Four quick pen scratches as the lines are ruled one after another, each ending in a dry tick, then three rising glassy notes as the header cells light up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.09, 0.18, 0.27].forEach((at, i) => {
    swish(c, o, t(at), t(0.26), 1200 + i * 300, 2600 + i * 300, 0.03);
    tick(c, o, t(at + 0.28), 0.06, 3000 + i * 400);
  });
  [N.A5, N.E6, N.B6].forEach((f, i) => ding(c, o, f, t(0.52 + i * 0.1), 0.05, 0.35));
}
