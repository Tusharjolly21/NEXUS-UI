import { tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.66;

/** Eight light ticks, one for every tick of the ring, the last a little brighter and higher. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let i = 0; i < 8; i++) tick(c, o, t(i * 0.1125), i === 7 ? 0.14 : 0.08, 3000 + i * 260);
}
