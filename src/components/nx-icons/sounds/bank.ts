import { ding, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.85;

/** Four marble columns each lift with a puff of stone dust and land back with a marble knock that rings, one after another, then a coin appears with a glint and drops with a thin falling whistle to a soft clink. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0, 1046], [0.08, 880], [0.16, 1175], [0.24, 988]].forEach(([d, f]) => {
    puff(c, o, t(d + 0.08), 0.05, 1400, 0.03, "bandpass"); // the column lifts
    const at = d + 0.4; // the column settles back
    thud(c, o, t(at), 240, 0.2, 0.08);
    ding(c, o, f, t(at), 0.05, 0.16);
    tick(c, o, t(at), 0.06, 3500);
  });
  tick(c, o, t(0.43), 0.04, 6500); // 0.43 the coin appears
  swish(c, o, t(0.54), t(0.34), 3800, 1500, 0.02); // 0.54-0.88 the coin drops
  ding(c, o, 2217, t(0.88), 0.05, 0.3); // 0.88 the coin reaches the floor and fades
  ding(c, o, 1480, t(0.88), 0.035, 0.35);
  tick(c, o, t(0.88), 0.05, 5000);
}
