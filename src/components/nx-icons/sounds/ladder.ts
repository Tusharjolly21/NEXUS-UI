import { ding, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Five dry wooden taps climbing in pitch, one for each rung that lights, finished by a short bright chime at the top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.A4, N.C5, N.E5, N.G5, N.B5].forEach((f, i) => {
    tick(c, o, t(0.02 + i * 0.13), 0.1, 1800 + i * 300);
    blip(c, o, f, t(0.02 + i * 0.13), 0.08, 0.1, f * 1.04, "triangle");
  });
  ding(c, o, N.D7, t(0.72), 0.05, 0.5);
}
