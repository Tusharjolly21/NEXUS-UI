import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.69;

/** Two brassy honks, the second higher, with a crackle of air in front of each. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.05, 330, 300], [0.32, 420, 380]].forEach(([at, f, to]) => {
    puff(c, o, t(at), 0.05, 2400, 0.03, "bandpass");
    blip(c, o, f, t(at), 0.06, 0.2, to, "sawtooth");
    blip(c, o, f * 2, t(at), 0.025, 0.16, to * 2, "square");
  });
}
