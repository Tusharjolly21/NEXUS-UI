import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 7.11;

/** A thin thread zip as the ball rolls and the yarn unspools, a soft woolly bump at each turn of the roll, then a quieter zip back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.285), 2500, 4200, 0.03); // 0.00-0.29 the ball rolls forward, the thread pulls out
  puff(c, o, t(0.285), 0.1, 500, 0.09); // 0.29 the roll turns: soft woolly bump
  swish(c, o, t(0.285), t(0.24), 4000, 2500, 0.016); // 0.29-0.52 the ball rolls back
  puff(c, o, t(0.52), 0.08, 450, 0.06); // 0.52 the second turn
  puff(c, o, t(0.74), 0.06, 420, 0.04); // 0.74 a last little rock
}
