import { ding, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.9;

/** A sonar ping each time the dot comes round, and a soft heartbeat from the centre. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.G6, t(0), 0.07, 0.7);
  thud(c, o, t(0.75), 150, 0.06, 0.1);
}
