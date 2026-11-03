import { ding, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.49;

/** A phone ringing twice: two bursts of five rapid alternating tones, each ring opening with a bright bell as the sound arcs pop outward. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.5].forEach((b) => {
    [0, 0.07, 0.14, 0.21, 0.28].forEach((at, i) => blip(c, o, i % 2 ? N.E6 : N.A5, t(b + at), 0.045, 0.06, undefined, "triangle"));
    ding(c, o, N.C7, t(b + 0.02), 0.035, 0.3);
  });
  ding(c, o, N.G7, t(0.14), 0.02, 0.25);
}
