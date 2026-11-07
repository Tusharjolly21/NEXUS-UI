import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.63;

/** Three nylon strings of a D major strum, each plucked just as its string starts to swing: a pick tick, a woody body knock and a ring that lasts as long as that string visibly vibrates. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[146.83, 0.02, 0.9], [220, 0.17, 0.85], [369.99, 0.33, 0.85]].forEach(([f, at, d], i) => {
    // 0.02 0.17 0.33 a string is released and begins to vibrate
    puff(c, o, t(at), 0.018, 2400 + i * 900, 0.05, "bandpass");
    thud(c, o, t(at), f * 1.4, 0.05, 0.05);
    blip(c, o, f, t(at), 0.13, d, undefined, "triangle");
    blip(c, o, f * 2, t(at), 0.05, d * 0.5);
    blip(c, o, f * 3, t(at), 0.025, d * 0.2, undefined, "sawtooth");
  });
}
