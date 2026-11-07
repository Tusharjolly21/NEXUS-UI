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

import * as s_layers from "./sounds/layers";
import * as s_layout from "./sounds/layout";
import * as s_columns from "./sounds/columns";
import * as s_table from "./sounds/table";
import * as s_crop from "./sounds/crop";
import * as s_move from "./sounds/move";
import * as s_pen_tool from "./sounds/pen-tool";
import * as s_mouse_pointer from "./sounds/mouse-pointer";
import * as s_triangle from "./sounds/triangle";
import * as s_hexagon from "./sounds/hexagon";
import * as s_ruler from "./sounds/ruler";
import * as s_eyedropper from "./sounds/eyedropper";
import * as s_git_commit from "./sounds/git-commit";
import * as s_git_merge from "./sounds/git-merge";
import * as s_git_pull_request from "./sounds/git-pull-request";
import * as s_command from "./sounds/command";
import * as s_braces from "./sounds/braces";
import * as s_file_code from "./sounds/file-code";
import * as s_sitemap from "./sounds/sitemap";
import * as s_container from "./sounds/container";
import * as s_sigma from "./sounds/sigma";
import * as s_webhook from "./sounds/webhook";
import * as s_rewind from "./sounds/rewind";
import * as s_fast_forward from "./sounds/fast-forward";
import * as s_cast from "./sounds/cast";
import * as s_airplay from "./sounds/airplay";
import * as s_aperture from "./sounds/aperture";
import * as s_disc from "./sounds/disc";
import * as s_film from "./sounds/film";
import * as s_tablet from "./sounds/tablet";
import * as s_battery_charging from "./sounds/battery-charging";
import * as s_file_plus from "./sounds/file-plus";
import * as s_file_minus from "./sounds/file-minus";
import * as s_folder_plus from "./sounds/folder-plus";
import * as s_folder_minus from "./sounds/folder-minus";
import * as s_book_open from "./sounds/book-open";
import * as s_user_check from "./sounds/user-check";
import * as s_user_minus from "./sounds/user-minus";
import * as s_phone_call from "./sounds/phone-call";
import * as s_phone_missed from "./sounds/phone-missed";
import * as s_phone_incoming from "./sounds/phone-incoming";
import * as s_phone_outgoing from "./sounds/phone-outgoing";
import * as s_phone_forwarded from "./sounds/phone-forwarded";
import * as s_phone_off from "./sounds/phone-off";
import * as s_voicemail from "./sounds/voicemail";
import * as s_mail_open from "./sounds/mail-open";
import * as s_rss from "./sounds/rss";
import * as s_message_circle from "./sounds/message-circle";
import * as s_infinity from "./sounds/infinity";
import * as s_bars_spinner from "./sounds/bars-spinner";
import * as s_dual_ring from "./sounds/dual-ring";
import * as s_activity from "./sounds/activity";
import * as s_scroll_down from "./sounds/scroll-down";
import * as s_dollar_sign from "./sounds/dollar-sign";
import * as s_trending_down from "./sounds/trending-down";
import * as s_bar_chart_horizontal from "./sounds/bar-chart-horizontal";
import * as s_cloud_lightning from "./sounds/cloud-lightning";
import * as s_cloud_drizzle from "./sounds/cloud-drizzle";
import * as s_navigation from "./sounds/navigation";
import * as s_frown from "./sounds/frown";
import * as s_meh from "./sounds/meh";
import * as s_zoom_in from "./sounds/zoom-in";

import * as s_music_notes from "./sounds/music-notes";

import * as s_sailboat from "./sounds/sailboat";
import * as s_lighthouse from "./sounds/lighthouse";
import * as s_motorcycle from "./sounds/motorcycle";
import * as s_traffic_signal from "./sounds/traffic-signal";
import * as s_gas_pump from "./sounds/gas-pump";
import * as s_signpost from "./sounds/signpost";
import * as s_suitcase from "./sounds/suitcase";
import * as s_bridge from "./sounds/bridge";
import * as s_cable_car from "./sounds/cable-car";
import * as s_charging_station from "./sounds/charging-station";
import * as s_ghost from "./sounds/ghost";
import * as s_sword from "./sounds/sword";
import * as s_treasure_chest from "./sounds/treasure-chest";
import * as s_joystick from "./sounds/joystick";
import * as s_disco_ball from "./sounds/disco-ball";
import * as s_flying_saucer from "./sounds/flying-saucer";
import * as s_bomb from "./sounds/bomb";
import * as s_boxing_glove from "./sounds/boxing-glove";
import * as s_skull from "./sounds/skull";
import * as s_alien from "./sounds/alien";
import * as s_bird from "./sounds/bird";
import * as s_cat from "./sounds/cat";
import * as s_dog from "./sounds/dog";
import * as s_fish from "./sounds/fish";
import * as s_butterfly from "./sounds/butterfly";
import * as s_cactus from "./sounds/cactus";
import * as s_campfire from "./sounds/campfire";
import * as s_planet from "./sounds/planet";
import * as s_shooting_star from "./sounds/shooting-star";
import * as s_waves from "./sounds/waves";
import * as s_armchair from "./sounds/armchair";
import * as s_door_open from "./sounds/door-open";
import * as s_ladder from "./sounds/ladder";
import * as s_siren from "./sounds/siren";
import * as s_security_camera from "./sounds/security-camera";
import * as s_metronome from "./sounds/metronome";
import * as s_toolbox from "./sounds/toolbox";
import * as s_broom from "./sounds/broom";
import * as s_vinyl_record from "./sounds/vinyl-record";
import * as s_guitar from "./sounds/guitar";
import * as s_piano_keys from "./sounds/piano-keys";
import * as s_equalizer from "./sounds/equalizer";
import * as s_waveform from "./sounds/waveform";
import * as s_cassette_tape from "./sounds/cassette-tape";
import * as s_microphone_stage from "./sounds/microphone-stage";
import * as s_film_slate from "./sounds/film-slate";
import * as s_stethoscope from "./sounds/stethoscope";
import * as s_tooth from "./sounds/tooth";
import * as s_dna from "./sounds/dna";
import * as s_brain from "./sounds/brain";
import * as s_first_aid_kit from "./sounds/first-aid-kit";
import * as s_handshake from "./sounds/handshake";
import * as s_bank from "./sounds/bank";
import * as s_gavel from "./sounds/gavel";
import * as s_hamburger from "./sounds/hamburger";
import * as s_bread from "./sounds/bread";
import * as s_popsicle from "./sounds/popsicle";
import * as s_martini from "./sounds/martini";
import * as s_beer_stein from "./sounds/beer-stein";
import * as s_chef_hat from "./sounds/chef-hat";
import * as s_cheese from "./sounds/cheese";
import * as s_paint_bucket from "./sounds/paint-bucket";
import * as s_paint_brush from "./sounds/paint-brush";
import * as s_magic_wand from "./sounds/magic-wand";
import * as s_eraser from "./sounds/eraser";
import * as s_highlighter from "./sounds/highlighter";
import * as s_pen_nib from "./sounds/pen-nib";
import * as s_swatches from "./sounds/swatches";
import * as s_stamp from "./sounds/stamp";
import * as s_robot from "./sounds/robot";
import * as s_test_tube from "./sounds/test-tube";
import * as s_speedometer from "./sounds/speedometer";
import * as s_git_fork from "./sounds/git-fork";
import * as s_app_window from "./sounds/app-window";
import * as s_vr_headset from "./sounds/vr-headset";
import * as s_flashlight from "./sounds/flashlight";
import * as s_stopwatch from "./sounds/stopwatch";
import * as s_hand_waving from "./sounds/hand-waving";
import * as s_hands_clapping from "./sounds/hands-clapping";
import * as s_cell_tower from "./sounds/cell-tower";
import * as s_hand_pointing from "./sounds/hand-pointing";
import * as s_sparkle from "./sounds/sparkle";
import * as s_confetti from "./sounds/confetti";
import * as s_translate from "./sounds/translate";
import * as s_broadcast from "./sounds/broadcast";
import * as s_signature from "./sounds/signature";
import * as s_notebook from "./sounds/notebook";
import * as s_kanban from "./sounds/kanban";
import * as s_push_pin from "./sounds/push-pin";
import * as s_floppy_disk from "./sounds/floppy-disk";
import * as s_list_checks from "./sounds/list-checks";
import * as s_banknote from "./sounds/banknote";
import * as s_chart_donut from "./sounds/chart-donut";
import * as s_chart_scatter from "./sounds/chart-scatter";
import * as s_scales from "./sounds/scales";
import * as s_cloud_snow from "./sounds/cloud-snow";
import * as s_tornado from "./sounds/tornado";
import * as s_meteor from "./sounds/meteor";
import * as s_cloud_sun from "./sounds/cloud-sun";

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
  "layers": s_layers,
  "layout": s_layout,
  "columns": s_columns,
  "table": s_table,
  "crop": s_crop,
  "move": s_move,
  "pen-tool": s_pen_tool,
  "mouse-pointer": s_mouse_pointer,
  "triangle": s_triangle,
  "hexagon": s_hexagon,
  "ruler": s_ruler,
  "eyedropper": s_eyedropper,
  "git-commit": s_git_commit,
  "git-merge": s_git_merge,
  "git-pull-request": s_git_pull_request,
  "command": s_command,
  "braces": s_braces,
  "file-code": s_file_code,
  "sitemap": s_sitemap,
  "container": s_container,
  "sigma": s_sigma,
  "webhook": s_webhook,
  "rewind": s_rewind,
  "fast-forward": s_fast_forward,
  "cast": s_cast,
  "airplay": s_airplay,
  "aperture": s_aperture,
  "disc": s_disc,
  "film": s_film,
  "tablet": s_tablet,
  "battery-charging": s_battery_charging,
  "file-plus": s_file_plus,
  "file-minus": s_file_minus,
  "folder-plus": s_folder_plus,
  "folder-minus": s_folder_minus,
  "book-open": s_book_open,
  "user-check": s_user_check,
  "user-minus": s_user_minus,
  "phone-call": s_phone_call,
  "phone-missed": s_phone_missed,
  "phone-incoming": s_phone_incoming,
  "phone-outgoing": s_phone_outgoing,
  "phone-forwarded": s_phone_forwarded,
  "phone-off": s_phone_off,
  "voicemail": s_voicemail,
  "mail-open": s_mail_open,
  "rss": s_rss,
  "message-circle": s_message_circle,
  "infinity": s_infinity,
  "bars-spinner": s_bars_spinner,
  "dual-ring": s_dual_ring,
  "activity": s_activity,
  "scroll-down": s_scroll_down,
  "dollar-sign": s_dollar_sign,
  "trending-down": s_trending_down,
  "bar-chart-horizontal": s_bar_chart_horizontal,
  "cloud-lightning": s_cloud_lightning,
  "cloud-drizzle": s_cloud_drizzle,
  "navigation": s_navigation,
  "frown": s_frown,
  "meh": s_meh,
  "zoom-in": s_zoom_in,
  "music-notes": s_music_notes,
  "sailboat": s_sailboat,
  "lighthouse": s_lighthouse,
  "motorcycle": s_motorcycle,
  "traffic-signal": s_traffic_signal,
  "gas-pump": s_gas_pump,
  "signpost": s_signpost,
  "suitcase": s_suitcase,
  "bridge": s_bridge,
  "cable-car": s_cable_car,
  "charging-station": s_charging_station,
  "ghost": s_ghost,
  "sword": s_sword,
  "treasure-chest": s_treasure_chest,
  "joystick": s_joystick,
  "disco-ball": s_disco_ball,
  "flying-saucer": s_flying_saucer,
  "bomb": s_bomb,
  "boxing-glove": s_boxing_glove,
  "skull": s_skull,
  "alien": s_alien,
  "bird": s_bird,
  "cat": s_cat,
  "dog": s_dog,
  "fish": s_fish,
  "butterfly": s_butterfly,
  "cactus": s_cactus,
  "campfire": s_campfire,
  "planet": s_planet,
  "shooting-star": s_shooting_star,
  "waves": s_waves,
  "armchair": s_armchair,
  "door-open": s_door_open,
  "ladder": s_ladder,
  "siren": s_siren,
  "security-camera": s_security_camera,
  "metronome": s_metronome,
  "toolbox": s_toolbox,
  "broom": s_broom,
  "vinyl-record": s_vinyl_record,
  "guitar": s_guitar,
  "piano-keys": s_piano_keys,
  "equalizer": s_equalizer,
  "waveform": s_waveform,
  "cassette-tape": s_cassette_tape,
  "microphone-stage": s_microphone_stage,
  "film-slate": s_film_slate,
  "stethoscope": s_stethoscope,
  "tooth": s_tooth,
  "dna": s_dna,
  "brain": s_brain,
  "first-aid-kit": s_first_aid_kit,
  "handshake": s_handshake,
  "bank": s_bank,
  "gavel": s_gavel,
  "hamburger": s_hamburger,
  "bread": s_bread,
  "popsicle": s_popsicle,
  "martini": s_martini,
  "beer-stein": s_beer_stein,
  "chef-hat": s_chef_hat,
  "cheese": s_cheese,
  "paint-bucket": s_paint_bucket,
  "paint-brush": s_paint_brush,
  "magic-wand": s_magic_wand,
  "eraser": s_eraser,
  "highlighter": s_highlighter,
  "pen-nib": s_pen_nib,
  "swatches": s_swatches,
  "stamp": s_stamp,
  "robot": s_robot,
  "test-tube": s_test_tube,
  "speedometer": s_speedometer,
  "git-fork": s_git_fork,
  "app-window": s_app_window,
  "vr-headset": s_vr_headset,
  "flashlight": s_flashlight,
  "stopwatch": s_stopwatch,
  "hand-waving": s_hand_waving,
  "hands-clapping": s_hands_clapping,
  "cell-tower": s_cell_tower,
  "hand-pointing": s_hand_pointing,
  "sparkle": s_sparkle,
  "confetti": s_confetti,
  "translate": s_translate,
  "broadcast": s_broadcast,
  "signature": s_signature,
  "notebook": s_notebook,
  "kanban": s_kanban,
  "push-pin": s_push_pin,
  "floppy-disk": s_floppy_disk,
  "list-checks": s_list_checks,
  "banknote": s_banknote,
  "chart-donut": s_chart_donut,
  "chart-scatter": s_chart_scatter,
  "scales": s_scales,
  "cloud-snow": s_cloud_snow,
  "tornado": s_tornado,
  "meteor": s_meteor,
  "cloud-sun": s_cloud_sun,
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
  // The icon's measured level goes on the sound itself, where it can be above 1: quiet icons (a level of 2 or 3) are
  // lifted to match the loud ones, instead of being held at full volume and staying quiet.
  const def: SoundDef = {
    category: "Icons",
    label: slug,
    length: score.length / speed + 0.5,
    play: (c, o) => {
      const lift = c.createGain();
      lift.gain.value = score.level;
      lift.connect(o);
      scoreIconSound(slug, c, lift, speed);
    },
  };
  playDef(`nx-icon:${slug}`, def, Math.min(1, opts.volume ?? 0.9), opts.force ?? false);
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
