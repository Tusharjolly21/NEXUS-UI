import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A dry wooden rattle: nine soft knocks as the pencils swing against each other and the cup, three for each pencil in turn, each round a little quieter than the last. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 780, t(0.175), 0.1, 0.04, 480, "triangle"); // 0.175 the left pencil swings out
  blip(c, o, 940, t(0.225), 0.09, 0.04, 590, "triangle"); // 0.225 the right pencil swings out
  blip(c, o, 860, t(0.275), 0.08, 0.04, 540, "triangle"); // 0.275 the middle pencil swings
  blip(c, o, 780, t(0.35), 0.1, 0.04, 480, "triangle"); // 0.35 the left pencil swings back
  blip(c, o, 940, t(0.4), 0.08, 0.04, 590, "triangle"); // 0.40 the right pencil swings back
  blip(c, o, 860, t(0.45), 0.07, 0.04, 540, "triangle"); // 0.45 the middle pencil swings back
  blip(c, o, 780, t(0.525), 0.07, 0.04, 480, "triangle"); // 0.525 the left pencil's last swing
  blip(c, o, 940, t(0.575), 0.05, 0.04, 590, "triangle"); // 0.575 the right pencil's last swing
  blip(c, o, 860, t(0.625), 0.04, 0.04, 540, "triangle"); // 0.625 the middle pencil's last swing
  tick(c, o, t(0.35), 0.05, 1800); // 0.35 the cup nudges
}
