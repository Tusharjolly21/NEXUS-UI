import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.98;

/** Two descending warning beeps timed to the amber flashes, with a rattle as the sign shakes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.19, 0.59].forEach((at) => {
    blip(c, o, 660, t(at), 0.1, 0.22, 520, "triangle");
    blip(c, o, 664, t(at), 0.07, 0.22, 524, "square");
  });
  thud(c, o, t(0.05), 80, 0.12, 0.2);
  [0.13, 0.27, 0.4, 0.53, 0.67].forEach((at, i) => tick(c, o, t(at), 0.07 - i * 0.008, 2200));
}
