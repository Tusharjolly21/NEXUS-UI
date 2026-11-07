import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three nylon-like plucks climbing A, E and C sharp, one for each string as it is plucked, then an open A major strum rings out underneath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [110, 164.81, 277.18].forEach((f, i) => {
    const at = t(i * 0.16);
    puff(c, o, at, 0.02, 2600, 0.05, "bandpass");
    blip(c, o, f, at, 0.13, 0.55, undefined, "triangle");
    blip(c, o, f * 2, at, 0.04, 0.2, undefined, "sawtooth");
    blip(c, o, f * 3, at, 0.02, 0.08);
  });
  [220, 329.63, 440, 554.37].forEach((f, i) => blip(c, o, f, t(0.5 + i * 0.035), 0.06, 0.6, undefined, "triangle"));
  tick(c, o, t(0.5), 0.05, 3400);
}
