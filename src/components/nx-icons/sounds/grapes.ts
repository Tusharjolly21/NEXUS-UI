import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.88;

/** Six juicy bubbly blups, one for each grape as it plumps up, falling in pitch from the top of the bunch to the bottom. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.2, 820], [0.275, 770], [0.35, 720], [0.425, 600], [0.5, 560], [0.575, 470]].forEach(([at, f]) => blip(c, o, f, t(at), 0.07, 0.07, f * 1.45)); // 0.20 0.28 0.35 0.43 0.50 0.58 each grape plumps up, top row first
  swish(c, o, t(0.0), t(0.5), 400, 700, 0.01); // 0.00-0.50 the bunch sways on its stem
}
