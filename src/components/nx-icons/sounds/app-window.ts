import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.71;

/** Three LED-like clicks as the title bar dots light in turn, a hollow pop as the picture block grows into the window, then a fine scratch with a tick as each text line is drawn in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.07 / 0.21 / 0.35 title bar dots light one after another
  [1800, 2400, 3000].forEach((f, i) => {
    blip(c, o, f, t(0.07 + i * 0.14), 0.06, 0.05, f * 1.15, "triangle");
    tick(c, o, t(0.07 + i * 0.14), 0.06, 5200);
  });
  // 0.38 picture block pops into the window, 0.65 it reaches its overshoot and settles
  blip(c, o, 300, t(0.38), 0.12, 0.1, 900);
  thud(c, o, t(0.38), 200, 0.08, 0.06);
  tick(c, o, t(0.65), 0.05, 2600);
  // 0.45-0.8 first text line draws, 0.6-0.92 second text line draws
  tick(c, o, t(0.45), 0.07, 3400);
  swish(c, o, t(0.46), t(0.32), 2800, 4800, 0.024);
  tick(c, o, t(0.6), 0.07, 4200);
  swish(c, o, t(0.61), t(0.3), 3200, 5200, 0.022);
  // 0.92 second line finishes
  tick(c, o, t(0.92), 0.04, 5000);
}
