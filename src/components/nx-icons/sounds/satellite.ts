import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four soft servo whirrs as the panels tilt and swing back, a latch click at each turn, and two quick radio beeps as the signal arcs go out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.0, 0.22, 380, 520], [0.225, 0.22, 520, 400], [0.45, 0.22, 400, 480], [0.675, 0.22, 480, 360]].forEach(([at, len, a, b]) => blip(c, o, a, t(at), 0.02, len, b, "sawtooth")); // 0.00-0.90 the panels whirr through four swings
  [0.225, 0.45, 0.675, 0.9].forEach((at, i) => tick(c, o, t(at), 0.1 - i * 0.015, 3000)); // 0.23 0.45 0.68 0.90 the panels turn round
  blip(c, o, 1760, t(0.22), 0.07, 0.09); // 0.22 the first signal arc starts to draw
  blip(c, o, 2217, t(0.42), 0.07, 0.09); // 0.42 the second signal arc starts to draw
  ding(c, o, 2960, t(0.5), 0.02, 0.3); // 0.50 the first arc is fully drawn
  ding(c, o, 3520, t(0.7), 0.02, 0.25); // 0.70 the second arc is fully drawn
}
