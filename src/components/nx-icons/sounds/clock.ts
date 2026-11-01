import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.17;

/** A steady tick-tock, with the tick a little higher than the tock. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let i = 0; i < 6; i++) {
    tick(c, o, t(i * 0.3), 0.12, i % 2 ? 3200 : 4200);
    blip(c, o, i % 2 ? 330 : 440, t(i * 0.3), 0.04, 0.05);
  }
}
