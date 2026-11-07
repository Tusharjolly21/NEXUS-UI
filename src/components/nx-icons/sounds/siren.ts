import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.46;

/** A harsh electronic siren: four rising wails, a higher one for each left-hand flash and a lower one for each right-hand flash, each with a faint relay click as the dome lights. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3].forEach((i) => {
    const hi = i % 2 === 0; // flashes at 0.12 left, 0.37 right, 0.62 left, 0.87 right
    const f0 = hi ? 700 : 520;
    const f1 = hi ? 1180 : 880;
    const at = 0.09 + i * 0.25; // the wail swells into each flash
    tick(c, o, t(at + 0.01), 0.05, 4000); // relay click as the dome lights
    blip(c, o, f0, t(at), 0.07, 0.17, f1, "sawtooth");
    blip(c, o, f0 * 1.006, t(at), 0.04, 0.17, f1 * 1.006, "square");
  });
}
