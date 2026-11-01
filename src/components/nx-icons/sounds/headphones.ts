import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.56;

/** Two deep bass thumps with a hi-hat tick in between, in step with the pulsing ear cups. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.2, 0.6].forEach((at) => { thud(c, o, t(at), 70, 0.3, 0.2); blip(c, o, N.G4 / 2, t(at), 0.07, 0.18, N.G4 / 3); });
  [0.0, 0.1, 0.3, 0.4, 0.5, 0.7].forEach((at, i) => tick(c, o, t(at), i % 2 ? 0.07 : 0.1, 6500));
  ding(c, o, N.E6, t(0.2), 0.03, 0.3);
}
