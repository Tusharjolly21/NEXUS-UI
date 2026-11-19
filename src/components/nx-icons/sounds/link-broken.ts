import { ding, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.71;

/** A sharp metal snap as the link jolts apart, an electric crackle while the sparks burst out, and two small chain rattles as the halves shudder back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.0), 0.12, 3900); // 0.00 the link snaps
  ding(c, o, 2230, t(0.01), 0.05, 0.12); // 0.01 a bright metal ring from the break
  [0.13, 0.17, 0.2, 0.25, 0.29].forEach((at, i) => puff(c, o, t(at), 0.025, 6200 - i * 400, 0.04, "highpass")); // 0.13-0.29 the sparks crackle outward
  tick(c, o, t(0.336), 0.06, 2900); // 0.34 the halves swing back past rest
  tick(c, o, t(0.504), 0.035, 3300); // 0.50 a last little rattle
}
