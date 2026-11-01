import { tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.78;

/** Dice rattling as they tumble, then a thud and a bounce as they land. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.1, 0.17, 0.25, 0.34, 0.44, 0.55].forEach((at, i) => { tick(c, o, t(at), 0.07 + i * 0.01, 2600 + (i % 3) * 600); thud(c, o, t(at), 260, 0.03, 0.02); });
  thud(c, o, t(0.68), 120, 0.2, 0.08);
  tick(c, o, t(0.68), 0.12, 2400);
  thud(c, o, t(0.8), 140, 0.08, 0.05);
}
