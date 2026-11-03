"use client";

import type { ComponentType } from "react";
import { ArcSpinnerIcon } from "./icons/arc-spinner";
import { TickSpinnerIcon } from "./icons/tick-spinner";
import { WaveDotsIcon } from "./icons/wave-dots";
import { PulseDotsIcon } from "./icons/pulse-dots";
import { RippleIcon } from "./icons/ripple";
import { OrbitIcon } from "./icons/orbit";
import { BouncingBallIcon } from "./icons/bouncing-ball";
import { HourglassIcon } from "./icons/hourglass";
import { ClockIcon } from "./icons/clock";
import { WifiScanIcon } from "./icons/wifi-scan";
import { BellIcon } from "./icons/bell";
import { HeartIcon } from "./icons/heart";
import { SearchIcon } from "./icons/search";
import { MailIcon } from "./icons/mail";
import { HomeIcon } from "./icons/home";
import { DownloadIcon } from "./icons/download";
import { ShareIcon } from "./icons/share";
import { CheckCircleIcon } from "./icons/check-circle";
import { CopyIcon } from "./icons/copy";
import { SettingsIcon } from "./icons/settings";
import { TrashIcon } from "./icons/trash";
import { ShoppingCartIcon } from "./icons/shopping-cart";
import { BatteryIcon } from "./icons/battery";
import { CameraIcon } from "./icons/camera";
import { CoinIcon } from "./icons/coin";
import { TruckIcon } from "./icons/truck";
import { SendIcon } from "./icons/send";
import { StatusIcon } from "./icons/status";
import { LockIcon } from "./icons/lock";
import { EyeIcon } from "./icons/eye";
import { ShieldIcon } from "./icons/shield";
import { UserIcon } from "./icons/user";
import { InfoIcon } from "./icons/info";
import { AlertTriangleIcon } from "./icons/alert-triangle";
import { CalendarIcon } from "./icons/calendar";
import { AlarmClockIcon } from "./icons/alarm-clock";
import { ToggleIcon } from "./icons/toggle";
import { StarIcon } from "./icons/star";
import { FolderIcon } from "./icons/folder";
import { CloudUploadIcon } from "./icons/cloud-upload";
import { VolumeIcon } from "./icons/volume";
import { MicIcon } from "./icons/mic";
import { SunIcon } from "./icons/sun";
import { MoonIcon } from "./icons/moon";
import { CloudRainIcon } from "./icons/cloud-rain";
import { ZapIcon } from "./icons/zap";
import { CreditCardIcon } from "./icons/credit-card";
import { GiftIcon } from "./icons/gift";
import { MessageIcon } from "./icons/message";
import { PhoneIcon } from "./icons/phone";
import { ThumbsUpIcon } from "./icons/thumbs-up";
import { MapPinIcon } from "./icons/map-pin";
import { CompassIcon } from "./icons/compass";
import { RocketIcon } from "./icons/rocket";
import { LightbulbIcon } from "./icons/lightbulb";
import { CoffeeIcon } from "./icons/coffee";
import { ArrowRightIcon } from "./icons/arrow-right";
import { RefreshIcon } from "./icons/refresh";
import { UndoIcon } from "./icons/undo";
import { PencilIcon } from "./icons/pencil";
import { ScissorsIcon } from "./icons/scissors";
import { LinkIcon } from "./icons/link";
import { PaperclipIcon } from "./icons/paperclip";
import { SlidersIcon } from "./icons/sliders";
import { CodeIcon } from "./icons/code";
import { PlusIcon } from "./icons/plus";
import { CloseIcon } from "./icons/close";
import { MenuIcon } from "./icons/menu";
import { BarChartIcon } from "./icons/bar-chart";
import { PlayPauseIcon } from "./icons/play-pause";
import { SkipForwardIcon } from "./icons/skip-forward";
import { ShuffleIcon } from "./icons/shuffle";
import { RepeatIcon } from "./icons/repeat";
import { HeadphonesIcon } from "./icons/headphones";
import { MusicIcon } from "./icons/music";
import { ImageIcon } from "./icons/image";
import { ShoppingBagIcon } from "./icons/shopping-bag";
import { TagIcon } from "./icons/tag";
import { WalletIcon } from "./icons/wallet";
import { PackageIcon } from "./icons/package";
import { FileIcon } from "./icons/file";
import { SaveIcon } from "./icons/save";
import { ClipboardIcon } from "./icons/clipboard";
import { PrinterIcon } from "./icons/printer";
import { ArchiveIcon } from "./icons/archive";
import { FilterIcon } from "./icons/filter";
import { GridIcon } from "./icons/grid";
import { ListIcon } from "./icons/list";
import { MoreIcon } from "./icons/more";
import { ExternalLinkIcon } from "./icons/external-link";
import { ArrowUpIcon } from "./icons/arrow-up";
import { TrendingUpIcon } from "./icons/trending-up";
import { PowerIcon } from "./icons/power";
import { LaptopIcon } from "./icons/laptop";
import { MegaphoneIcon } from "./icons/megaphone";
import { BookmarkIcon } from "./icons/bookmark";
import { TrophyIcon } from "./icons/trophy";
import { KeyIcon } from "./icons/key";
import { UmbrellaIcon } from "./icons/umbrella";
import { FlameIcon } from "./icons/flame";
import { PillIcon } from "./icons/pill";
import { HeartPulseIcon } from "./icons/heart-pulse";
import { DumbbellIcon } from "./icons/dumbbell";
import { ThermometerIcon } from "./icons/thermometer";
import { PizzaIcon } from "./icons/pizza";
import { IceCreamIcon } from "./icons/ice-cream";
import { CakeIcon } from "./icons/cake";
import { GamepadIcon } from "./icons/gamepad";
import { DiceIcon } from "./icons/dice";
import { PuzzleIcon } from "./icons/puzzle";
import { AtomIcon } from "./icons/atom";
import { FlaskIcon } from "./icons/flask";
import { MagnetIcon } from "./icons/magnet";
import { GlobeIcon } from "./icons/globe";
import { BusIcon } from "./icons/bus";
import { PlaneIcon } from "./icons/plane";
import { BuildingIcon } from "./icons/building";
import { GraduationCapIcon } from "./icons/graduation-cap";
import { BookIcon } from "./icons/book";
import { CalculatorIcon } from "./icons/calculator";
import { WrenchIcon } from "./icons/wrench";
import { PaletteIcon } from "./icons/palette";
import { TerminalIcon } from "./icons/terminal";
import { GitBranchIcon } from "./icons/git-branch";
import { SnowflakeIcon } from "./icons/snowflake";
import { ArrowDownIcon } from "./icons/arrow-down";
import { ArrowLeftIcon } from "./icons/arrow-left";
import { ChevronDownIcon } from "./icons/chevron-down";
import { ChevronRightIcon } from "./icons/chevron-right";
import { CheckIcon } from "./icons/check";
import { MinusIcon } from "./icons/minus";
import { MaximizeIcon } from "./icons/maximize";
import { MinimizeIcon } from "./icons/minimize";
import { HelpCircleIcon } from "./icons/help-circle";
import { EyeOffIcon } from "./icons/eye-off";
import { UnlockIcon } from "./icons/unlock";
import { LogInIcon } from "./icons/log-in";
import { LogOutIcon } from "./icons/log-out";
import { UserPlusIcon } from "./icons/user-plus";
import { UsersIcon } from "./icons/users";
import { InboxIcon } from "./icons/inbox";
import { ReplyIcon } from "./icons/reply";
import { SmileIcon } from "./icons/smile";
import { ThumbsDownIcon } from "./icons/thumbs-down";
import { AtSignIcon } from "./icons/at-sign";
import { HashIcon } from "./icons/hash";
import { FingerprintIcon } from "./icons/fingerprint";
import { QrCodeIcon } from "./icons/qr-code";
import { BugIcon } from "./icons/bug";
import { FlagIcon } from "./icons/flag";
import { VideoIcon } from "./icons/video";
import { TvIcon } from "./icons/tv";
import { MonitorIcon } from "./icons/monitor";
import { KeyboardIcon } from "./icons/keyboard";
import { MouseIcon } from "./icons/mouse";
import { SpeakerIcon } from "./icons/speaker";
import { BluetoothIcon } from "./icons/bluetooth";
import { CpuIcon } from "./icons/cpu";
import { DatabaseIcon } from "./icons/database";
import { ServerIcon } from "./icons/server";
import { CloudIcon } from "./icons/cloud";
import { HardDriveIcon } from "./icons/hard-drive";
import { PlugIcon } from "./icons/plug";
import { PiggyBankIcon } from "./icons/piggy-bank";
import { ReceiptIcon } from "./icons/receipt";
import { BriefcaseIcon } from "./icons/briefcase";
import { PieChartIcon } from "./icons/pie-chart";
import { TargetIcon } from "./icons/target";
import { MedalIcon } from "./icons/medal";
import { CrownIcon } from "./icons/crown";
import { GemIcon } from "./icons/gem";
import { StoreIcon } from "./icons/store";
import { PercentIcon } from "./icons/percent";
import { RadioIcon } from "./icons/radio";
import { WatchIcon } from "./icons/watch";
import { LeafIcon } from "./icons/leaf";
import { TreeIcon } from "./icons/tree";
import { FlowerIcon } from "./icons/flower";
import { DropletIcon } from "./icons/droplet";
import { WindIcon } from "./icons/wind";
import { RainbowIcon } from "./icons/rainbow";
import { SunriseIcon } from "./icons/sunrise";
import { MountainIcon } from "./icons/mountain";
import { AnchorIcon } from "./icons/anchor";
import { CarIcon } from "./icons/car";
import { BicycleIcon } from "./icons/bicycle";
import { TrainIcon } from "./icons/train";
import { TentIcon } from "./icons/tent";
import { BedIcon } from "./icons/bed";
import { LampIcon } from "./icons/lamp";
import { UtensilsIcon } from "./icons/utensils";
import { AppleIcon } from "./icons/apple";
import { WineIcon } from "./icons/wine";
import { SoccerBallIcon } from "./icons/soccer-ball";
import { PawPrintIcon } from "./icons/paw-print";
import { FeatherIcon } from "./icons/feather";
import { HammerIcon } from "./icons/hammer";
import { ShirtIcon } from "./icons/shirt";
import { GlassesIcon } from "./icons/glasses";
import { BalloonIcon } from "./icons/balloon";
import { AlignLeftIcon } from "./icons/align-left";
import { AlignCenterIcon } from "./icons/align-center";
import { AlignRightIcon } from "./icons/align-right";
import { AlignJustifyIcon } from "./icons/align-justify";
import { BoldIcon } from "./icons/bold";
import { ItalicIcon } from "./icons/italic";
import { UnderlineIcon } from "./icons/underline";
import { TypeIcon } from "./icons/type";
import { StrikethroughIcon } from "./icons/strikethrough";
import { QuoteIcon } from "./icons/quote";
import { CameraOffIcon } from "./icons/camera-off";
import { VideoOffIcon } from "./icons/video-off";
import { MicOffIcon } from "./icons/mic-off";
import { WifiOffIcon } from "./icons/wifi-off";
import { BellOffIcon } from "./icons/bell-off";
import { CloudOffIcon } from "./icons/cloud-off";
import { ZapOffIcon } from "./icons/zap-off";
import { MenuCloseIcon } from "./icons/menu-close";
import { MenuBackIcon } from "./icons/menu-back";
import { PlusCloseIcon } from "./icons/plus-close";
import { SearchCloseIcon } from "./icons/search-close";
import { VolumeMuteIcon } from "./icons/volume-mute";
import { CheckboxIcon } from "./icons/checkbox";
import { RadioButtonIcon } from "./icons/radio-button";
import { ArrowUpRightIcon } from "./icons/arrow-up-right";
import { ArrowDownRightIcon } from "./icons/arrow-down-right";
import { ArrowUpLeftIcon } from "./icons/arrow-up-left";
import { ArrowDownLeftIcon } from "./icons/arrow-down-left";
import { ChevronsDownIcon } from "./icons/chevrons-down";
import { ChevronsUpIcon } from "./icons/chevrons-up";
import { ChevronsLeftIcon } from "./icons/chevrons-left";
import { ChevronsRightIcon } from "./icons/chevrons-right";
import { ArrowUpCircleIcon } from "./icons/arrow-up-circle";
import { ArrowDownCircleIcon } from "./icons/arrow-down-circle";
import { ArrowLeftCircleIcon } from "./icons/arrow-left-circle";
import { ArrowRightCircleIcon } from "./icons/arrow-right-circle";
import { MoreVerticalIcon } from "./icons/more-vertical";
import { CornerDownRightIcon } from "./icons/corner-down-right";
import { LayersIcon } from "./icons/layers";
import { LayoutIcon } from "./icons/layout";
import { ColumnsIcon } from "./icons/columns";
import { TableIcon } from "./icons/table";
import { CropIcon } from "./icons/crop";
import { MoveIcon } from "./icons/move";
import { PenToolIcon } from "./icons/pen-tool";
import { MousePointerIcon } from "./icons/mouse-pointer";
import { TriangleIcon } from "./icons/triangle";
import { HexagonIcon } from "./icons/hexagon";
import { RulerIcon } from "./icons/ruler";
import { EyedropperIcon } from "./icons/eyedropper";
import { GitCommitIcon } from "./icons/git-commit";
import { GitMergeIcon } from "./icons/git-merge";
import { GitPullRequestIcon } from "./icons/git-pull-request";
import { CommandIcon } from "./icons/command";
import { BracesIcon } from "./icons/braces";
import { FileCodeIcon } from "./icons/file-code";
import { SitemapIcon } from "./icons/sitemap";
import { ContainerIcon } from "./icons/container";
import { SigmaIcon } from "./icons/sigma";
import { WebhookIcon } from "./icons/webhook";
import { RewindIcon } from "./icons/rewind";
import { FastForwardIcon } from "./icons/fast-forward";
import { CastIcon } from "./icons/cast";
import { AirplayIcon } from "./icons/airplay";
import { ApertureIcon } from "./icons/aperture";
import { DiscIcon } from "./icons/disc";
import { FilmIcon } from "./icons/film";
import { TabletIcon } from "./icons/tablet";
import { BatteryChargingIcon } from "./icons/battery-charging";
import { FilePlusIcon } from "./icons/file-plus";
import { FileMinusIcon } from "./icons/file-minus";
import { FolderPlusIcon } from "./icons/folder-plus";
import { FolderMinusIcon } from "./icons/folder-minus";
import { BookOpenIcon } from "./icons/book-open";
import { UserCheckIcon } from "./icons/user-check";
import { UserMinusIcon } from "./icons/user-minus";
import { PhoneCallIcon } from "./icons/phone-call";
import { PhoneMissedIcon } from "./icons/phone-missed";
import { PhoneIncomingIcon } from "./icons/phone-incoming";
import { PhoneOutgoingIcon } from "./icons/phone-outgoing";
import { PhoneForwardedIcon } from "./icons/phone-forwarded";
import { PhoneOffIcon } from "./icons/phone-off";
import { VoicemailIcon } from "./icons/voicemail";
import { MailOpenIcon } from "./icons/mail-open";
import { RssIcon } from "./icons/rss";
import { MessageCircleIcon } from "./icons/message-circle";
import { InfinityIcon } from "./icons/infinity";
import { BarsSpinnerIcon } from "./icons/bars-spinner";
import { DualRingIcon } from "./icons/dual-ring";
import { ActivityIcon } from "./icons/activity";
import { ScrollDownIcon } from "./icons/scroll-down";
import { DollarSignIcon } from "./icons/dollar-sign";
import { TrendingDownIcon } from "./icons/trending-down";
import { BarChartHorizontalIcon } from "./icons/bar-chart-horizontal";
import { CloudLightningIcon } from "./icons/cloud-lightning";
import { CloudDrizzleIcon } from "./icons/cloud-drizzle";
import { NavigationIcon } from "./icons/navigation";
import { FrownIcon } from "./icons/frown";
import { MehIcon } from "./icons/meh";
import { ZoomInIcon } from "./icons/zoom-in";

export type NxIconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  speed?: number;
  accent?: string;
  play?: boolean;
  /** Only the Status icon: which state to show. */
  state?: "idle" | "loading" | "success" | "error";
};

/** Every icon by slug, for the grid and the icon pages. */
export const NX_ICONS: Record<string, ComponentType<NxIconProps>> = {
  "arc-spinner": ArcSpinnerIcon,
  "tick-spinner": TickSpinnerIcon,
  "wave-dots": WaveDotsIcon,
  "pulse-dots": PulseDotsIcon,
  "ripple": RippleIcon,
  "orbit": OrbitIcon,
  "bouncing-ball": BouncingBallIcon,
  "hourglass": HourglassIcon,
  "clock": ClockIcon,
  "wifi-scan": WifiScanIcon,
  "bell": BellIcon,
  "heart": HeartIcon,
  "search": SearchIcon,
  "mail": MailIcon,
  "home": HomeIcon,
  "download": DownloadIcon,
  "share": ShareIcon,
  "check-circle": CheckCircleIcon,
  "copy": CopyIcon,
  "settings": SettingsIcon,
  "trash": TrashIcon,
  "shopping-cart": ShoppingCartIcon,
  "battery": BatteryIcon,
  "camera": CameraIcon,
  "coin": CoinIcon,
  "truck": TruckIcon,
  "send": SendIcon,
  "status": StatusIcon,
  "lock": LockIcon,
  "eye": EyeIcon,
  "shield": ShieldIcon,
  "user": UserIcon,
  "info": InfoIcon,
  "alert-triangle": AlertTriangleIcon,
  "calendar": CalendarIcon,
  "alarm-clock": AlarmClockIcon,
  "toggle": ToggleIcon,
  "star": StarIcon,
  "folder": FolderIcon,
  "cloud-upload": CloudUploadIcon,
  "volume": VolumeIcon,
  "mic": MicIcon,
  "sun": SunIcon,
  "moon": MoonIcon,
  "cloud-rain": CloudRainIcon,
  "zap": ZapIcon,
  "credit-card": CreditCardIcon,
  "gift": GiftIcon,
  "message": MessageIcon,
  "phone": PhoneIcon,
  "thumbs-up": ThumbsUpIcon,
  "map-pin": MapPinIcon,
  "compass": CompassIcon,
  "rocket": RocketIcon,
  "lightbulb": LightbulbIcon,
  "coffee": CoffeeIcon,
  "arrow-right": ArrowRightIcon,
  "refresh": RefreshIcon,
  "undo": UndoIcon,
  "pencil": PencilIcon,
  "scissors": ScissorsIcon,
  "link": LinkIcon,
  "paperclip": PaperclipIcon,
  "sliders": SlidersIcon,
  "code": CodeIcon,
  "plus": PlusIcon,
  "close": CloseIcon,
  "menu": MenuIcon,
  "bar-chart": BarChartIcon,
  "play-pause": PlayPauseIcon,
  "skip-forward": SkipForwardIcon,
  "shuffle": ShuffleIcon,
  "repeat": RepeatIcon,
  "headphones": HeadphonesIcon,
  "music": MusicIcon,
  "image": ImageIcon,
  "shopping-bag": ShoppingBagIcon,
  "tag": TagIcon,
  "wallet": WalletIcon,
  "package": PackageIcon,
  "file": FileIcon,
  "save": SaveIcon,
  "clipboard": ClipboardIcon,
  "printer": PrinterIcon,
  "archive": ArchiveIcon,
  "filter": FilterIcon,
  "grid": GridIcon,
  "list": ListIcon,
  "more": MoreIcon,
  "external-link": ExternalLinkIcon,
  "arrow-up": ArrowUpIcon,
  "trending-up": TrendingUpIcon,
  "power": PowerIcon,
  "laptop": LaptopIcon,
  "megaphone": MegaphoneIcon,
  "bookmark": BookmarkIcon,
  "trophy": TrophyIcon,
  "key": KeyIcon,
  "umbrella": UmbrellaIcon,
  "flame": FlameIcon,
  "pill": PillIcon,
  "heart-pulse": HeartPulseIcon,
  "dumbbell": DumbbellIcon,
  "thermometer": ThermometerIcon,
  "pizza": PizzaIcon,
  "ice-cream": IceCreamIcon,
  "cake": CakeIcon,
  "gamepad": GamepadIcon,
  "dice": DiceIcon,
  "puzzle": PuzzleIcon,
  "atom": AtomIcon,
  "flask": FlaskIcon,
  "magnet": MagnetIcon,
  "globe": GlobeIcon,
  "bus": BusIcon,
  "plane": PlaneIcon,
  "building": BuildingIcon,
  "graduation-cap": GraduationCapIcon,
  "book": BookIcon,
  "calculator": CalculatorIcon,
  "wrench": WrenchIcon,
  "palette": PaletteIcon,
  "terminal": TerminalIcon,
  "git-branch": GitBranchIcon,
  "snowflake": SnowflakeIcon,
  "arrow-down": ArrowDownIcon,
  "arrow-left": ArrowLeftIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-right": ChevronRightIcon,
  "check": CheckIcon,
  "minus": MinusIcon,
  "maximize": MaximizeIcon,
  "minimize": MinimizeIcon,
  "help-circle": HelpCircleIcon,
  "eye-off": EyeOffIcon,
  "unlock": UnlockIcon,
  "log-in": LogInIcon,
  "log-out": LogOutIcon,
  "user-plus": UserPlusIcon,
  "users": UsersIcon,
  "inbox": InboxIcon,
  "reply": ReplyIcon,
  "smile": SmileIcon,
  "thumbs-down": ThumbsDownIcon,
  "at-sign": AtSignIcon,
  "hash": HashIcon,
  "fingerprint": FingerprintIcon,
  "qr-code": QrCodeIcon,
  "bug": BugIcon,
  "flag": FlagIcon,
  "video": VideoIcon,
  "tv": TvIcon,
  "monitor": MonitorIcon,
  "keyboard": KeyboardIcon,
  "mouse": MouseIcon,
  "speaker": SpeakerIcon,
  "bluetooth": BluetoothIcon,
  "cpu": CpuIcon,
  "database": DatabaseIcon,
  "server": ServerIcon,
  "cloud": CloudIcon,
  "hard-drive": HardDriveIcon,
  "plug": PlugIcon,
  "piggy-bank": PiggyBankIcon,
  "receipt": ReceiptIcon,
  "briefcase": BriefcaseIcon,
  "pie-chart": PieChartIcon,
  "target": TargetIcon,
  "medal": MedalIcon,
  "crown": CrownIcon,
  "gem": GemIcon,
  "store": StoreIcon,
  "percent": PercentIcon,
  "radio": RadioIcon,
  "watch": WatchIcon,
  "leaf": LeafIcon,
  "tree": TreeIcon,
  "flower": FlowerIcon,
  "droplet": DropletIcon,
  "wind": WindIcon,
  "rainbow": RainbowIcon,
  "sunrise": SunriseIcon,
  "mountain": MountainIcon,
  "anchor": AnchorIcon,
  "car": CarIcon,
  "bicycle": BicycleIcon,
  "train": TrainIcon,
  "tent": TentIcon,
  "bed": BedIcon,
  "lamp": LampIcon,
  "utensils": UtensilsIcon,
  "apple": AppleIcon,
  "wine": WineIcon,
  "soccer-ball": SoccerBallIcon,
  "paw-print": PawPrintIcon,
  "feather": FeatherIcon,
  "hammer": HammerIcon,
  "shirt": ShirtIcon,
  "glasses": GlassesIcon,
  "balloon": BalloonIcon,
  "align-left": AlignLeftIcon,
  "align-center": AlignCenterIcon,
  "align-right": AlignRightIcon,
  "align-justify": AlignJustifyIcon,
  "bold": BoldIcon,
  "italic": ItalicIcon,
  "underline": UnderlineIcon,
  "type": TypeIcon,
  "strikethrough": StrikethroughIcon,
  "quote": QuoteIcon,
  "camera-off": CameraOffIcon,
  "video-off": VideoOffIcon,
  "mic-off": MicOffIcon,
  "wifi-off": WifiOffIcon,
  "bell-off": BellOffIcon,
  "cloud-off": CloudOffIcon,
  "zap-off": ZapOffIcon,
  "menu-close": MenuCloseIcon,
  "menu-back": MenuBackIcon,
  "plus-close": PlusCloseIcon,
  "search-close": SearchCloseIcon,
  "volume-mute": VolumeMuteIcon,
  "checkbox": CheckboxIcon,
  "radio-button": RadioButtonIcon,
  "arrow-up-right": ArrowUpRightIcon,
  "arrow-down-right": ArrowDownRightIcon,
  "arrow-up-left": ArrowUpLeftIcon,
  "arrow-down-left": ArrowDownLeftIcon,
  "chevrons-down": ChevronsDownIcon,
  "chevrons-up": ChevronsUpIcon,
  "chevrons-left": ChevronsLeftIcon,
  "chevrons-right": ChevronsRightIcon,
  "arrow-up-circle": ArrowUpCircleIcon,
  "arrow-down-circle": ArrowDownCircleIcon,
  "arrow-left-circle": ArrowLeftCircleIcon,
  "arrow-right-circle": ArrowRightCircleIcon,
  "more-vertical": MoreVerticalIcon,
  "corner-down-right": CornerDownRightIcon,
  "layers": LayersIcon,
  "layout": LayoutIcon,
  "columns": ColumnsIcon,
  "table": TableIcon,
  "crop": CropIcon,
  "move": MoveIcon,
  "pen-tool": PenToolIcon,
  "mouse-pointer": MousePointerIcon,
  "triangle": TriangleIcon,
  "hexagon": HexagonIcon,
  "ruler": RulerIcon,
  "eyedropper": EyedropperIcon,
  "git-commit": GitCommitIcon,
  "git-merge": GitMergeIcon,
  "git-pull-request": GitPullRequestIcon,
  "command": CommandIcon,
  "braces": BracesIcon,
  "file-code": FileCodeIcon,
  "sitemap": SitemapIcon,
  "container": ContainerIcon,
  "sigma": SigmaIcon,
  "webhook": WebhookIcon,
  "rewind": RewindIcon,
  "fast-forward": FastForwardIcon,
  "cast": CastIcon,
  "airplay": AirplayIcon,
  "aperture": ApertureIcon,
  "disc": DiscIcon,
  "film": FilmIcon,
  "tablet": TabletIcon,
  "battery-charging": BatteryChargingIcon,
  "file-plus": FilePlusIcon,
  "file-minus": FileMinusIcon,
  "folder-plus": FolderPlusIcon,
  "folder-minus": FolderMinusIcon,
  "book-open": BookOpenIcon,
  "user-check": UserCheckIcon,
  "user-minus": UserMinusIcon,
  "phone-call": PhoneCallIcon,
  "phone-missed": PhoneMissedIcon,
  "phone-incoming": PhoneIncomingIcon,
  "phone-outgoing": PhoneOutgoingIcon,
  "phone-forwarded": PhoneForwardedIcon,
  "phone-off": PhoneOffIcon,
  "voicemail": VoicemailIcon,
  "mail-open": MailOpenIcon,
  "rss": RssIcon,
  "message-circle": MessageCircleIcon,
  "infinity": InfinityIcon,
  "bars-spinner": BarsSpinnerIcon,
  "dual-ring": DualRingIcon,
  "activity": ActivityIcon,
  "scroll-down": ScrollDownIcon,
  "dollar-sign": DollarSignIcon,
  "trending-down": TrendingDownIcon,
  "bar-chart-horizontal": BarChartHorizontalIcon,
  "cloud-lightning": CloudLightningIcon,
  "cloud-drizzle": CloudDrizzleIcon,
  "navigation": NavigationIcon,
  "frown": FrownIcon,
  "meh": MehIcon,
  "zoom-in": ZoomInIcon,
};
