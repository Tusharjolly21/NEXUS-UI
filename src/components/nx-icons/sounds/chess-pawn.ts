import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.93;

/** A wooden chess piece lifting with a faint breath of air, a firm wooden knock as it lands on the board, and a lighter tock as it settles from its small second bounce. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 600, 1100, 0.014); // 0.00-0.24 the pawn is lifted off the board
  thud(c, o, t(0.44), 240, 0.2, 0.07); // 0.44 the pawn lands, squash
  tick(c, o, t(0.44), 0.1, 2400); // 0.44 hard wooden knock
  thud(c, o, t(0.8), 210, 0.08, 0.05); // 0.80 it settles after the small second hop
  tick(c, o, t(0.8), 0.05, 2200); // 0.80 light tock
}
