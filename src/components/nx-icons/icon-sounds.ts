import { playDef, type SoundDef } from "@/lib/ui-sounds";
import type { Time } from "./sound-kit";
import * as s_arc_spinner from "./sounds/arc-spinner";
import * as s_tick_spinner from "./sounds/tick-spinner";
import * as s_wave_dots from "./sounds/wave-dots";
import * as s_pulse_dots from "./sounds/pulse-dots";
import * as s_ripple from "./sounds/ripple";
import * as s_orbit from "./sounds/orbit";
import * as s_bouncing_ball from "./sounds/bouncing-ball";
import * as s_hourglass from "./sounds/hourglass";
import * as s_clock from "./sounds/clock";
import * as s_wifi_scan from "./sounds/wifi-scan";
import * as s_bell from "./sounds/bell";
import * as s_heart from "./sounds/heart";
import * as s_search from "./sounds/search";
import * as s_mail from "./sounds/mail";
import * as s_home from "./sounds/home";
import * as s_download from "./sounds/download";
import * as s_share from "./sounds/share";
import * as s_check_circle from "./sounds/check-circle";
import * as s_copy from "./sounds/copy";
import * as s_settings from "./sounds/settings";
import * as s_trash from "./sounds/trash";
import * as s_shopping_cart from "./sounds/shopping-cart";
import * as s_battery from "./sounds/battery";
import * as s_camera from "./sounds/camera";
import * as s_coin from "./sounds/coin";
import * as s_truck from "./sounds/truck";
import * as s_send from "./sounds/send";
import * as s_status from "./sounds/status";
import * as s_lock from "./sounds/lock";
import * as s_eye from "./sounds/eye";
import * as s_shield from "./sounds/shield";
import * as s_user from "./sounds/user";
import * as s_info from "./sounds/info";
import * as s_alert_triangle from "./sounds/alert-triangle";
import * as s_calendar from "./sounds/calendar";
import * as s_alarm_clock from "./sounds/alarm-clock";
import * as s_toggle from "./sounds/toggle";
import * as s_star from "./sounds/star";
import * as s_folder from "./sounds/folder";
import * as s_cloud_upload from "./sounds/cloud-upload";
import * as s_volume from "./sounds/volume";
import * as s_mic from "./sounds/mic";
import * as s_sun from "./sounds/sun";
import * as s_moon from "./sounds/moon";
import * as s_cloud_rain from "./sounds/cloud-rain";
import * as s_zap from "./sounds/zap";
import * as s_credit_card from "./sounds/credit-card";
import * as s_gift from "./sounds/gift";
import * as s_message from "./sounds/message";
import * as s_phone from "./sounds/phone";
import * as s_thumbs_up from "./sounds/thumbs-up";
import * as s_map_pin from "./sounds/map-pin";
import * as s_compass from "./sounds/compass";
import * as s_rocket from "./sounds/rocket";
import * as s_lightbulb from "./sounds/lightbulb";
import * as s_coffee from "./sounds/coffee";
import * as s_arrow_right from "./sounds/arrow-right";
import * as s_refresh from "./sounds/refresh";
import * as s_undo from "./sounds/undo";
import * as s_pencil from "./sounds/pencil";
import * as s_scissors from "./sounds/scissors";
import * as s_link from "./sounds/link";
import * as s_paperclip from "./sounds/paperclip";
import * as s_sliders from "./sounds/sliders";
import * as s_code from "./sounds/code";
import * as s_plus from "./sounds/plus";
import * as s_close from "./sounds/close";
import * as s_menu from "./sounds/menu";
import * as s_bar_chart from "./sounds/bar-chart";
import * as s_play_pause from "./sounds/play-pause";
import * as s_skip_forward from "./sounds/skip-forward";
import * as s_shuffle from "./sounds/shuffle";
import * as s_repeat from "./sounds/repeat";
import * as s_headphones from "./sounds/headphones";
import * as s_music from "./sounds/music";
import * as s_image from "./sounds/image";
import * as s_shopping_bag from "./sounds/shopping-bag";
import * as s_tag from "./sounds/tag";
import * as s_wallet from "./sounds/wallet";
import * as s_package from "./sounds/package";

type Score = { length: number; level: number; play: (c: AudioContext, o: AudioNode, t: Time) => void };

/** Every icon's score by slug. Each one is timed against that icon's own animation. */
const SCORES: Record<string, Score> = {
  "arc-spinner": s_arc_spinner,
  "tick-spinner": s_tick_spinner,
  "wave-dots": s_wave_dots,
  "pulse-dots": s_pulse_dots,
  "ripple": s_ripple,
  "orbit": s_orbit,
  "bouncing-ball": s_bouncing_ball,
  "hourglass": s_hourglass,
  "clock": s_clock,
  "wifi-scan": s_wifi_scan,
  "bell": s_bell,
  "heart": s_heart,
  "search": s_search,
  "mail": s_mail,
  "home": s_home,
  "download": s_download,
  "share": s_share,
  "check-circle": s_check_circle,
  "copy": s_copy,
  "settings": s_settings,
  "trash": s_trash,
  "shopping-cart": s_shopping_cart,
  "battery": s_battery,
  "camera": s_camera,
  "coin": s_coin,
  "truck": s_truck,
  "send": s_send,
  "status": s_status,
  "lock": s_lock,
  "eye": s_eye,
  "shield": s_shield,
  "user": s_user,
  "info": s_info,
  "alert-triangle": s_alert_triangle,
  "calendar": s_calendar,
  "alarm-clock": s_alarm_clock,
  "toggle": s_toggle,
  "star": s_star,
  "folder": s_folder,
  "cloud-upload": s_cloud_upload,
  "volume": s_volume,
  "mic": s_mic,
  "sun": s_sun,
  "moon": s_moon,
  "cloud-rain": s_cloud_rain,
  "zap": s_zap,
  "credit-card": s_credit_card,
  "gift": s_gift,
  "message": s_message,
  "phone": s_phone,
  "thumbs-up": s_thumbs_up,
  "map-pin": s_map_pin,
  "compass": s_compass,
  "rocket": s_rocket,
  "lightbulb": s_lightbulb,
  "coffee": s_coffee,
  "arrow-right": s_arrow_right,
  "refresh": s_refresh,
  "undo": s_undo,
  "pencil": s_pencil,
  "scissors": s_scissors,
  "link": s_link,
  "paperclip": s_paperclip,
  "sliders": s_sliders,
  "code": s_code,
  "plus": s_plus,
  "close": s_close,
  "menu": s_menu,
  "bar-chart": s_bar_chart,
  "play-pause": s_play_pause,
  "skip-forward": s_skip_forward,
  "shuffle": s_shuffle,
  "repeat": s_repeat,
  "headphones": s_headphones,
  "music": s_music,
  "image": s_image,
  "shopping-bag": s_shopping_bag,
  "tag": s_tag,
  "wallet": s_wallet,
  "package": s_package,
};

export function hasIconSound(slug: string) {
  return slug in SCORES;
}

/** Seconds the sound lasts at normal speed. For a loader it is one lap, so a loop can repeat it. */
export function iconSoundLength(slug: string) {
  return SCORES[slug]?.length ?? 0;
}

/** Plays an icon's sound into any audio context (an offline one, to export it, for example). */
export function scoreIconSound(slug: string, c: AudioContext, o: AudioNode, speed = 1) {
  const score = SCORES[slug];
  if (!score) return;
  const k = Math.min(4, Math.max(0.25, speed));
  score.play(c, o, (x) => x / k);
}

/**
 * Plays an icon's sound. It stays silent while the visitor has sounds switched off, unless `force` is set
 * (for a button whose job is to play the sound). `speed` should match the icon's speed prop.
 */
export function playIconSound(slug: string, opts: { speed?: number; volume?: number; force?: boolean } = {}) {
  const score = SCORES[slug];
  if (!score) return;
  const speed = Math.min(4, Math.max(0.25, opts.speed ?? 1));
  const def: SoundDef = { category: "Icons", label: slug, length: score.length / speed + 0.5, play: (c, o) => scoreIconSound(slug, c, o, speed) };
  playDef(`nx-icon:${slug}`, def, Math.min(1, (opts.volume ?? 0.9) * score.level), opts.force ?? false);
}
