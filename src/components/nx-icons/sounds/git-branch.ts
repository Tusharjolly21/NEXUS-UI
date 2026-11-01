import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.31;

/** Commit blips climbing in pitch as each node pops, and a bright ding as the branch merges in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.05, N.A5], [0.18, N.D6], [0.5, N.B6]].forEach(([at, f]) => { blip(c, o, f as number, t(at as number), 0.08, 0.14); tick(c, o, t(at as number), 0.05, 3800); });
  swish(c, o, t(0.26), t(0.3), 900, 2400, 0.025);
  ding(c, o, N.C7, t(0.66), 0.08, 0.5);
}
