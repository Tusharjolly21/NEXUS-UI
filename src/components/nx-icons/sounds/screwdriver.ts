import { tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.0;

/** Three quick ratchets as the handle turns, each ending in a clink and a dull seat of the screw one step lower, then a faster backward ratchet as everything unwinds. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.05, 0.25, 0.45].forEach((s, i) => {
    tick(c, o, t(s + 0.02), 0.07, 4300 - i * 200); // a turn begins: ratchet click
    tick(c, o, t(s + 0.05), 0.07, 4000 - i * 200); // ratchet click
    tick(c, o, t(s + 0.08), 0.07, 3700 - i * 200); // ratchet click
    tick(c, o, t(s + 0.1), 0.14, 2400 - i * 150); // the turn ends, the screw sits one step lower
    thud(c, o, t(s + 0.1), 230 - i * 20, 0.1, 0.05); // dull seat of the thread
  });
  [0.81, 0.86, 0.9, 0.94, 0.99].forEach((at, i) => tick(c, o, t(at), 0.07, 3500 - i * 150)); // 0.81-0.99 unwinding, fastest near 0.9
  tick(c, o, t(1.1), 0.06, 1800); // 1.10 the screw is back at the top
}
