import { blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two quick low barks as the head tilts, a soft thump as an ear flops, then four panting puffs of breath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.G4, t(0.04), 0.1, 0.12, N.E4, "sawtooth");
  blip(c, o, N.A4, t(0.2), 0.09, 0.12, N.G4, "sawtooth");
  thud(c, o, t(0.42), 150, 0.16, 0.1);
  [0.55, 0.65, 0.75, 0.85].forEach((at, i) => puff(c, o, t(at), 0.07, 1800 + i * 300, 0.045, "bandpass"));
}
