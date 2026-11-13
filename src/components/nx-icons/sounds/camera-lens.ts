import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A tiny zoom motor whirring up as the glass pulls focus and shrinks, a click at the stop, the motor whirring back down as the glass opens, a glassy tinkle and a click as it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 230, t(0.0), 0.03, 0.27, 360, "sawtooth"); // 0.00-0.27 zoom motor pulls the glass in focus
  tick(c, o, t(0.27), 0.1, 2200); // 0.27 glass reaches its smallest
  blip(c, o, 350, t(0.495), 0.03, 0.405, 230, "sawtooth"); // 0.50-0.90 motor opens the glass back out
  ding(c, o, 3300, t(0.88), 0.025, 0.25); // 0.88 glass reaches full size, tinkle
  tick(c, o, t(0.9), 0.1, 2600); // 0.90 glass locks at rest
}
