import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 7.1;

/** Fabric snapping in the wind: a run of cloth flaps that follow the wave down the flag and soften as it hangs still. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.0), 600, 900, 0.025); // 0.00-1.00 wind across the flag
  [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].forEach((at, i) => puff(c, o, t(at), 0.05, 1600 + (i % 2) * 500, 0.07 - Math.abs(i - 3) * 0.012)); // 0.13-0.88 the cloth snaps at each crest of the wave
}
