import { tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.78;

/** Four dry wooden stick hits on a snare, left, right, left, right, each with a soft skin thump and a short rattle of the snare wires, the last one ringing out slightly longer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.22), 190, 0.17, 0.09); // 0.22 left stick hits the skin
  puff(c, o, t(0.22), 0.07, 5200, 0.05); // 0.22 snare wires rattle
  tick(c, o, t(0.22), 0.09, 3600); // 0.22 stick tip clack
  thud(c, o, t(0.37), 235, 0.17, 0.09); // 0.37 right stick hits
  puff(c, o, t(0.37), 0.07, 5600, 0.05); // 0.37 snare rattle
  tick(c, o, t(0.37), 0.09, 4100); // 0.37 stick tip clack
  thud(c, o, t(0.52), 195, 0.18, 0.09); // 0.52 left stick hits
  puff(c, o, t(0.52), 0.07, 5200, 0.05); // 0.52 snare rattle
  tick(c, o, t(0.52), 0.09, 3600); // 0.52 stick tip clack
  thud(c, o, t(0.67), 150, 0.22, 0.2); // 0.67 right stick hits, last and heaviest
  puff(c, o, t(0.67), 0.16, 5000, 0.06); // 0.67 snare rattle rings out
  tick(c, o, t(0.67), 0.1, 4100); // 0.67 stick tip clack
}
