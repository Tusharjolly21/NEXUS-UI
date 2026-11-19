import { ding, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.84;

/** A plastic click as the button goes in, then a classic two note chime, ding on the first ring of sound and dong on the second. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.1), 0.06, 2400); // 0.10 the button clicks in
  ding(c, o, 740, t(0.12), 0.11, 0.6); // 0.12 the first ring of sound: ding
  ding(c, o, 587, t(0.42), 0.11, 0.8); // 0.42 the second ring: dong
}
