import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.32;

/** Five round bubble pops, each pitched by its dot's height on the graph (the lowest dot lowest), landing as each dot swells in, then a pen-like scan as the trend line is drawn and a soft tick as it reaches the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 470, t(0.07), 0.08, 0.07, 640); // 0.07 first dot pops in
  blip(c, o, 650, t(0.24), 0.08, 0.07, 880); // 0.25 second dot (high) pops in
  blip(c, o, 300, t(0.385), 0.09, 0.08, 420); // 0.39 third dot (lowest) pops in
  blip(c, o, 420, t(0.53), 0.08, 0.07, 580); // 0.53 fourth dot pops in
  blip(c, o, 900, t(0.67), 0.08, 0.07, 1250); // 0.68 fifth dot (highest) pops in
  swish(c, o, t(0.81), 0.4, 1200, 4200, 0.045); // 0.81 to 1.2 the trend line draws across
  tick(c, o, t(1.19), 0.07, 4400); // 1.2 the trend line reaches its end
}
