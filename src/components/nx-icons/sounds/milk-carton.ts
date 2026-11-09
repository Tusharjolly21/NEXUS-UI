import { ding, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A cardboard creak as the carton tips, a bubbly glug when the milk starts to pour, one clear drip as the drop lands, and a dull knock when the carton sits upright again. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 240, t(0.0), 0.06, 0.3, 160, "sawtooth"); // 0.00 to 0.30 cardboard creaks as it tips
  blip(c, o, 300, t(0.32), 0.08, 0.09, 620); // 0.32 the milk glugs out
  blip(c, o, 340, t(0.44), 0.07, 0.09, 700); // 0.44 second glug as the drop leaves
  ding(c, o, 2200, t(0.9), 0.06, 0.2); // 0.90 the drop lands
  swish(c, o, t(0.72), t(0.26), 600, 300, 0.03); // 0.72 to 0.98 the carton swings back
  thud(c, o, t(0.98), 140, 0.12, 0.08); // 0.98 the carton sits down
}
