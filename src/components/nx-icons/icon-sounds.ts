import { playDef, type SoundDef } from "@/lib/ui-sounds";
import type { Time } from "./sound-kit";
import { MATERIAL_SOUNDS, type MaterialSoundName } from "./material-sounds";
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
import * as s_file from "./sounds/file";
import * as s_save from "./sounds/save";
import * as s_clipboard from "./sounds/clipboard";
import * as s_printer from "./sounds/printer";
import * as s_archive from "./sounds/archive";
import * as s_filter from "./sounds/filter";
import * as s_grid from "./sounds/grid";
import * as s_list from "./sounds/list";
import * as s_more from "./sounds/more";
import * as s_external_link from "./sounds/external-link";
import * as s_arrow_up from "./sounds/arrow-up";
import * as s_trending_up from "./sounds/trending-up";
import * as s_power from "./sounds/power";
import * as s_laptop from "./sounds/laptop";
import * as s_megaphone from "./sounds/megaphone";
import * as s_bookmark from "./sounds/bookmark";
import * as s_trophy from "./sounds/trophy";
import * as s_key from "./sounds/key";
import * as s_umbrella from "./sounds/umbrella";
import * as s_flame from "./sounds/flame";
import * as s_pill from "./sounds/pill";
import * as s_heart_pulse from "./sounds/heart-pulse";
import * as s_dumbbell from "./sounds/dumbbell";
import * as s_thermometer from "./sounds/thermometer";
import * as s_pizza from "./sounds/pizza";
import * as s_ice_cream from "./sounds/ice-cream";
import * as s_cake from "./sounds/cake";
import * as s_gamepad from "./sounds/gamepad";
import * as s_dice from "./sounds/dice";
import * as s_puzzle from "./sounds/puzzle";
import * as s_atom from "./sounds/atom";
import * as s_flask from "./sounds/flask";
import * as s_magnet from "./sounds/magnet";
import * as s_globe from "./sounds/globe";
import * as s_bus from "./sounds/bus";
import * as s_plane from "./sounds/plane";
import * as s_building from "./sounds/building";
import * as s_graduation_cap from "./sounds/graduation-cap";
import * as s_book from "./sounds/book";
import * as s_calculator from "./sounds/calculator";
import * as s_wrench from "./sounds/wrench";
import * as s_palette from "./sounds/palette";
import * as s_terminal from "./sounds/terminal";
import * as s_git_branch from "./sounds/git-branch";
import * as s_snowflake from "./sounds/snowflake";
import * as s_arrow_down from "./sounds/arrow-down";
import * as s_arrow_left from "./sounds/arrow-left";
import * as s_chevron_down from "./sounds/chevron-down";
import * as s_chevron_right from "./sounds/chevron-right";
import * as s_check from "./sounds/check";
import * as s_minus from "./sounds/minus";
import * as s_maximize from "./sounds/maximize";
import * as s_minimize from "./sounds/minimize";
import * as s_help_circle from "./sounds/help-circle";
import * as s_eye_off from "./sounds/eye-off";
import * as s_unlock from "./sounds/unlock";
import * as s_log_in from "./sounds/log-in";
import * as s_log_out from "./sounds/log-out";
import * as s_user_plus from "./sounds/user-plus";
import * as s_users from "./sounds/users";
import * as s_inbox from "./sounds/inbox";
import * as s_reply from "./sounds/reply";
import * as s_smile from "./sounds/smile";
import * as s_thumbs_down from "./sounds/thumbs-down";
import * as s_at_sign from "./sounds/at-sign";
import * as s_hash from "./sounds/hash";
import * as s_fingerprint from "./sounds/fingerprint";
import * as s_qr_code from "./sounds/qr-code";
import * as s_bug from "./sounds/bug";
import * as s_flag from "./sounds/flag";
import * as s_video from "./sounds/video";
import * as s_tv from "./sounds/tv";
import * as s_monitor from "./sounds/monitor";
import * as s_keyboard from "./sounds/keyboard";
import * as s_mouse from "./sounds/mouse";
import * as s_speaker from "./sounds/speaker";
import * as s_bluetooth from "./sounds/bluetooth";
import * as s_cpu from "./sounds/cpu";
import * as s_database from "./sounds/database";
import * as s_server from "./sounds/server";
import * as s_cloud from "./sounds/cloud";
import * as s_hard_drive from "./sounds/hard-drive";
import * as s_plug from "./sounds/plug";
import * as s_piggy_bank from "./sounds/piggy-bank";
import * as s_receipt from "./sounds/receipt";
import * as s_briefcase from "./sounds/briefcase";
import * as s_pie_chart from "./sounds/pie-chart";
import * as s_target from "./sounds/target";
import * as s_medal from "./sounds/medal";
import * as s_crown from "./sounds/crown";
import * as s_gem from "./sounds/gem";
import * as s_store from "./sounds/store";
import * as s_percent from "./sounds/percent";
import * as s_radio from "./sounds/radio";
import * as s_watch from "./sounds/watch";
import * as s_leaf from "./sounds/leaf";
import * as s_tree from "./sounds/tree";
import * as s_flower from "./sounds/flower";
import * as s_droplet from "./sounds/droplet";
import * as s_wind from "./sounds/wind";
import * as s_rainbow from "./sounds/rainbow";
import * as s_sunrise from "./sounds/sunrise";
import * as s_mountain from "./sounds/mountain";
import * as s_anchor from "./sounds/anchor";
import * as s_car from "./sounds/car";
import * as s_bicycle from "./sounds/bicycle";
import * as s_train from "./sounds/train";
import * as s_tent from "./sounds/tent";
import * as s_bed from "./sounds/bed";
import * as s_lamp from "./sounds/lamp";
import * as s_utensils from "./sounds/utensils";
import * as s_apple from "./sounds/apple";
import * as s_wine from "./sounds/wine";
import * as s_soccer_ball from "./sounds/soccer-ball";
import * as s_paw_print from "./sounds/paw-print";
import * as s_feather from "./sounds/feather";
import * as s_hammer from "./sounds/hammer";
import * as s_shirt from "./sounds/shirt";
import * as s_glasses from "./sounds/glasses";
import * as s_balloon from "./sounds/balloon";

import * as s_align_left from "./sounds/align-left";
import * as s_align_center from "./sounds/align-center";
import * as s_align_right from "./sounds/align-right";
import * as s_align_justify from "./sounds/align-justify";
import * as s_bold from "./sounds/bold";
import * as s_italic from "./sounds/italic";
import * as s_underline from "./sounds/underline";
import * as s_type from "./sounds/type";
import * as s_strikethrough from "./sounds/strikethrough";
import * as s_quote from "./sounds/quote";
import * as s_camera_off from "./sounds/camera-off";
import * as s_video_off from "./sounds/video-off";
import * as s_mic_off from "./sounds/mic-off";
import * as s_wifi_off from "./sounds/wifi-off";
import * as s_bell_off from "./sounds/bell-off";
import * as s_cloud_off from "./sounds/cloud-off";
import * as s_zap_off from "./sounds/zap-off";
import * as s_menu_close from "./sounds/menu-close";
import * as s_menu_back from "./sounds/menu-back";
import * as s_plus_close from "./sounds/plus-close";
import * as s_search_close from "./sounds/search-close";
import * as s_volume_mute from "./sounds/volume-mute";
import * as s_checkbox from "./sounds/checkbox";
import * as s_radio_button from "./sounds/radio-button";
import * as s_arrow_up_right from "./sounds/arrow-up-right";
import * as s_arrow_down_right from "./sounds/arrow-down-right";
import * as s_arrow_up_left from "./sounds/arrow-up-left";
import * as s_arrow_down_left from "./sounds/arrow-down-left";
import * as s_chevrons_down from "./sounds/chevrons-down";
import * as s_chevrons_up from "./sounds/chevrons-up";
import * as s_chevrons_left from "./sounds/chevrons-left";
import * as s_chevrons_right from "./sounds/chevrons-right";
import * as s_arrow_up_circle from "./sounds/arrow-up-circle";
import * as s_arrow_down_circle from "./sounds/arrow-down-circle";
import * as s_arrow_left_circle from "./sounds/arrow-left-circle";
import * as s_arrow_right_circle from "./sounds/arrow-right-circle";
import * as s_more_vertical from "./sounds/more-vertical";
import * as s_corner_down_right from "./sounds/corner-down-right";

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
  "file": s_file,
  "save": s_save,
  "clipboard": s_clipboard,
  "printer": s_printer,
  "archive": s_archive,
  "filter": s_filter,
  "grid": s_grid,
  "list": s_list,
  "more": s_more,
  "external-link": s_external_link,
  "arrow-up": s_arrow_up,
  "trending-up": s_trending_up,
  "power": s_power,
  "laptop": s_laptop,
  "megaphone": s_megaphone,
  "bookmark": s_bookmark,
  "trophy": s_trophy,
  "key": s_key,
  "umbrella": s_umbrella,
  "flame": s_flame,
  "pill": s_pill,
  "heart-pulse": s_heart_pulse,
  "dumbbell": s_dumbbell,
  "thermometer": s_thermometer,
  "pizza": s_pizza,
  "ice-cream": s_ice_cream,
  "cake": s_cake,
  "gamepad": s_gamepad,
  "dice": s_dice,
  "puzzle": s_puzzle,
  "atom": s_atom,
  "flask": s_flask,
  "magnet": s_magnet,
  "globe": s_globe,
  "bus": s_bus,
  "plane": s_plane,
  "building": s_building,
  "graduation-cap": s_graduation_cap,
  "book": s_book,
  "calculator": s_calculator,
  "wrench": s_wrench,
  "palette": s_palette,
  "terminal": s_terminal,
  "git-branch": s_git_branch,
  "snowflake": s_snowflake,
  "arrow-down": s_arrow_down,
  "arrow-left": s_arrow_left,
  "chevron-down": s_chevron_down,
  "chevron-right": s_chevron_right,
  "check": s_check,
  "minus": s_minus,
  "maximize": s_maximize,
  "minimize": s_minimize,
  "help-circle": s_help_circle,
  "eye-off": s_eye_off,
  "unlock": s_unlock,
  "log-in": s_log_in,
  "log-out": s_log_out,
  "user-plus": s_user_plus,
  "users": s_users,
  "inbox": s_inbox,
  "reply": s_reply,
  "smile": s_smile,
  "thumbs-down": s_thumbs_down,
  "at-sign": s_at_sign,
  "hash": s_hash,
  "fingerprint": s_fingerprint,
  "qr-code": s_qr_code,
  "bug": s_bug,
  "flag": s_flag,
  "video": s_video,
  "tv": s_tv,
  "monitor": s_monitor,
  "keyboard": s_keyboard,
  "mouse": s_mouse,
  "speaker": s_speaker,
  "bluetooth": s_bluetooth,
  "cpu": s_cpu,
  "database": s_database,
  "server": s_server,
  "cloud": s_cloud,
  "hard-drive": s_hard_drive,
  "plug": s_plug,
  "piggy-bank": s_piggy_bank,
  "receipt": s_receipt,
  "briefcase": s_briefcase,
  "pie-chart": s_pie_chart,
  "target": s_target,
  "medal": s_medal,
  "crown": s_crown,
  "gem": s_gem,
  "store": s_store,
  "percent": s_percent,
  "radio": s_radio,
  "watch": s_watch,
  "leaf": s_leaf,
  "tree": s_tree,
  "flower": s_flower,
  "droplet": s_droplet,
  "wind": s_wind,
  "rainbow": s_rainbow,
  "sunrise": s_sunrise,
  "mountain": s_mountain,
  "anchor": s_anchor,
  "car": s_car,
  "bicycle": s_bicycle,
  "train": s_train,
  "tent": s_tent,
  "bed": s_bed,
  "lamp": s_lamp,
  "utensils": s_utensils,
  "apple": s_apple,
  "wine": s_wine,
  "soccer-ball": s_soccer_ball,
  "paw-print": s_paw_print,
  "feather": s_feather,
  "hammer": s_hammer,
  "shirt": s_shirt,
  "glasses": s_glasses,
  "balloon": s_balloon,
  "align-left": s_align_left,
  "align-center": s_align_center,
  "align-right": s_align_right,
  "align-justify": s_align_justify,
  "bold": s_bold,
  "italic": s_italic,
  "underline": s_underline,
  "type": s_type,
  "strikethrough": s_strikethrough,
  "quote": s_quote,
  "camera-off": s_camera_off,
  "video-off": s_video_off,
  "mic-off": s_mic_off,
  "wifi-off": s_wifi_off,
  "bell-off": s_bell_off,
  "cloud-off": s_cloud_off,
  "zap-off": s_zap_off,
  "menu-close": s_menu_close,
  "menu-back": s_menu_back,
  "plus-close": s_plus_close,
  "search-close": s_search_close,
  "volume-mute": s_volume_mute,
  "checkbox": s_checkbox,
  "radio-button": s_radio_button,
  "arrow-up-right": s_arrow_up_right,
  "arrow-down-right": s_arrow_down_right,
  "arrow-up-left": s_arrow_up_left,
  "arrow-down-left": s_arrow_down_left,
  "chevrons-down": s_chevrons_down,
  "chevrons-up": s_chevrons_up,
  "chevrons-left": s_chevrons_left,
  "chevrons-right": s_chevrons_right,
  "arrow-up-circle": s_arrow_up_circle,
  "arrow-down-circle": s_arrow_down_circle,
  "arrow-left-circle": s_arrow_left_circle,
  "arrow-right-circle": s_arrow_right_circle,
  "more-vertical": s_more_vertical,
  "corner-down-right": s_corner_down_right,
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

/** The three liquid looks have a sound of their own. */
export function isLiquidLook(material: string): material is MaterialSoundName {
  return material === "mercury" || material === "liquid" || material === "glass";
}

/**
 * Plays the sound of a liquid look: `hover` is a short layer for an icon wearing it (play it with the icon's own
 * sound), `switch` is the longer one for the moment the look is picked. Silent while sounds are off unless `force` is set.
 */
export function playMaterialSound(material: string, kind: "hover" | "switch" = "hover", opts: { volume?: number; force?: boolean } = {}) {
  if (!isLiquidLook(material)) return;
  const score = MATERIAL_SOUNDS[material][kind];
  const def: SoundDef = { category: "Icons", label: `${material} ${kind}`, length: score.length + 0.5, play: (c, o) => score.play(c, o, (x) => x) };
  playDef(`nx-material:${material}:${kind}`, def, Math.min(1, (opts.volume ?? (kind === "hover" ? 0.8 : 0.9)) * score.level), opts.force ?? false);
}
