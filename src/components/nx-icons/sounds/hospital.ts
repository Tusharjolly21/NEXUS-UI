import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.0;

/** A heartbeat: a low lub as the red cross swells, a lighter dub as it swells again, with four rising monitor beeps and tiny switch clicks as the windows light one after another. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 640, t(0.0), 0.05, 0.08, 220, "triangle"); // 0.00 the windows drop dark, a short power-down slide
  thud(c, o, t(0.15), 72, 0.26, 0.12); // 0.16 the cross swells to its first peak (lub)
  thud(c, o, t(0.49), 84, 0.2, 0.1); // 0.50 the cross swells again, smaller (dub)
  tick(c, o, t(0.32), 0.07, 4200); // 0.33 first window clicks on
  blip(c, o, 1245, t(0.33), 0.05, 0.1); // 0.33 first window lit, monitor beep
  tick(c, o, t(0.44), 0.07, 4200); // 0.45 second window clicks on
  blip(c, o, 1480, t(0.45), 0.05, 0.1); // 0.45 second window lit
  tick(c, o, t(0.56), 0.07, 4200); // 0.57 third window clicks on
  blip(c, o, 1865, t(0.57), 0.05, 0.1); // 0.57 third window lit
  tick(c, o, t(0.68), 0.07, 4200); // 0.69 fourth window clicks on
  blip(c, o, 2217, t(0.69), 0.05, 0.12); // 0.69 fourth window lit
}
