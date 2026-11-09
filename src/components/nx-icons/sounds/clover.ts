import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 6.41;

/** Four quick leaf flaps in turn, each a short sweep of air as the leaf narrows and a dry snap as it opens wide again, over a low sway of the stem and a last breath as the final leaf settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.84), 520, 330, 0.02); // 0.04-0.88 the stem sways
  swish(c, o, t(0.02), t(0.13), 3600, 1500, 0.03); // 0.02-0.14 leaf 1 narrows
  puff(c, o, t(0.28), 0.05, 5200, 0.025, "highpass"); // 0.275 leaf 1 snaps wide
  swish(c, o, t(0.16), t(0.13), 3300, 1400, 0.03); // 0.16-0.28 leaf 2 narrows
  puff(c, o, t(0.42), 0.05, 5600, 0.025, "highpass"); // 0.415 leaf 2 snaps wide
  swish(c, o, t(0.3), t(0.13), 3000, 1300, 0.03); // 0.30-0.42 leaf 3 narrows
  puff(c, o, t(0.55), 0.05, 6000, 0.025, "highpass"); // 0.555 leaf 3 snaps wide
  swish(c, o, t(0.44), t(0.13), 2800, 1200, 0.03); // 0.44-0.56 leaf 4 narrows
  puff(c, o, t(0.69), 0.05, 6400, 0.025, "highpass"); // 0.695 leaf 4 snaps wide
  swish(c, o, t(0.76), t(0.2), 2400, 1400, 0.012); // 0.76-0.97 leaf 4 settles back to rest
}
