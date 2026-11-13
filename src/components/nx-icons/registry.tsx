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
import { MusicNotesIcon } from "./icons/music-notes";
import { SailBoatIcon } from "./icons/sailboat";
import { LighthouseIcon } from "./icons/lighthouse";
import { MotorcycleIcon } from "./icons/motorcycle";
import { TrafficSignalIcon } from "./icons/traffic-signal";
import { GasPumpIcon } from "./icons/gas-pump";
import { SignpostIcon } from "./icons/signpost";
import { SuitcaseIcon } from "./icons/suitcase";
import { BridgeIcon } from "./icons/bridge";
import { CableCarIcon } from "./icons/cable-car";
import { ChargingStationIcon } from "./icons/charging-station";
import { GhostIcon } from "./icons/ghost";
import { SwordIcon } from "./icons/sword";
import { TreasureChestIcon } from "./icons/treasure-chest";
import { JoystickIcon } from "./icons/joystick";
import { DiscoBallIcon } from "./icons/disco-ball";
import { FlyingSaucerIcon } from "./icons/flying-saucer";
import { BombIcon } from "./icons/bomb";
import { BoxingGloveIcon } from "./icons/boxing-glove";
import { SkullIcon } from "./icons/skull";
import { AlienIcon } from "./icons/alien";
import { BirdIcon } from "./icons/bird";
import { CatIcon } from "./icons/cat";
import { DogIcon } from "./icons/dog";
import { FishIcon } from "./icons/fish";
import { ButterflyIcon } from "./icons/butterfly";
import { CactusIcon } from "./icons/cactus";
import { CampfireIcon } from "./icons/campfire";
import { PlanetIcon } from "./icons/planet";
import { ShootingStarIcon } from "./icons/shooting-star";
import { WavesIcon } from "./icons/waves";
import { ArmchairIcon } from "./icons/armchair";
import { DoorOpenIcon } from "./icons/door-open";
import { LadderIcon } from "./icons/ladder";
import { SirenIcon } from "./icons/siren";
import { SecurityCameraIcon } from "./icons/security-camera";
import { MetronomeIcon } from "./icons/metronome";
import { ToolboxIcon } from "./icons/toolbox";
import { BroomIcon } from "./icons/broom";
import { VinylRecordIcon } from "./icons/vinyl-record";
import { GuitarIcon } from "./icons/guitar";
import { PianoKeysIcon } from "./icons/piano-keys";
import { EqualizerIcon } from "./icons/equalizer";
import { WaveformIcon } from "./icons/waveform";
import { CassetteTapeIcon } from "./icons/cassette-tape";
import { MicrophoneStageIcon } from "./icons/microphone-stage";
import { FilmSlateIcon } from "./icons/film-slate";
import { StethoscopeIcon } from "./icons/stethoscope";
import { ToothIcon } from "./icons/tooth";
import { DnaIcon } from "./icons/dna";
import { BrainIcon } from "./icons/brain";
import { FirstAidKitIcon } from "./icons/first-aid-kit";
import { HandshakeIcon } from "./icons/handshake";
import { BankIcon } from "./icons/bank";
import { GavelIcon } from "./icons/gavel";
import { HamburgerIcon } from "./icons/hamburger";
import { BreadIcon } from "./icons/bread";
import { PopsicleIcon } from "./icons/popsicle";
import { MartiniIcon } from "./icons/martini";
import { BeerSteinIcon } from "./icons/beer-stein";
import { ChefHatIcon } from "./icons/chef-hat";
import { CheeseIcon } from "./icons/cheese";
import { PaintBucketIcon } from "./icons/paint-bucket";
import { PaintBrushIcon } from "./icons/paint-brush";
import { MagicWandIcon } from "./icons/magic-wand";
import { EraserIcon } from "./icons/eraser";
import { HighlighterIcon } from "./icons/highlighter";
import { PenNibIcon } from "./icons/pen-nib";
import { SwatchesIcon } from "./icons/swatches";
import { StampIcon } from "./icons/stamp";
import { RobotIcon } from "./icons/robot";
import { TestTubeIcon } from "./icons/test-tube";
import { SpeedometerIcon } from "./icons/speedometer";
import { GitForkIcon } from "./icons/git-fork";
import { AppWindowIcon } from "./icons/app-window";
import { VrHeadsetIcon } from "./icons/vr-headset";
import { FlashlightIcon } from "./icons/flashlight";
import { StopwatchIcon } from "./icons/stopwatch";
import { HandWavingIcon } from "./icons/hand-waving";
import { HandsClappingIcon } from "./icons/hands-clapping";
import { CellTowerIcon } from "./icons/cell-tower";
import { HandPointingIcon } from "./icons/hand-pointing";
import { SparkleIcon } from "./icons/sparkle";
import { ConfettiIcon } from "./icons/confetti";
import { TranslateIcon } from "./icons/translate";
import { BroadcastIcon } from "./icons/broadcast";
import { SignatureIcon } from "./icons/signature";
import { NotebookIcon } from "./icons/notebook";
import { KanbanIcon } from "./icons/kanban";
import { PushPinIcon } from "./icons/push-pin";
import { FloppyDiskIcon } from "./icons/floppy-disk";
import { ListChecksIcon } from "./icons/list-checks";
import { BanknoteIcon } from "./icons/banknote";
import { ChartDonutIcon } from "./icons/chart-donut";
import { ChartScatterIcon } from "./icons/chart-scatter";
import { ScalesIcon } from "./icons/scales";
import { CloudSnowIcon } from "./icons/cloud-snow";
import { TornadoIcon } from "./icons/tornado";
import { MeteorIcon } from "./icons/meteor";
import { CloudSunIcon } from "./icons/cloud-sun";
import { CroissantIcon } from "./icons/croissant";
import { DonutIcon } from "./icons/donut";
import { CookieIcon } from "./icons/cookie";
import { PopcornIcon } from "./icons/popcorn";
import { SandwichIcon } from "./icons/sandwich";
import { SoupBowlIcon } from "./icons/soup-bowl";
import { CarrotIcon } from "./icons/carrot";
import { AvocadoIcon } from "./icons/avocado";
import { OrangeSliceIcon } from "./icons/orange-slice";
import { MilkCartonIcon } from "./icons/milk-carton";
import { WheatIcon } from "./icons/wheat";
import { LollipopIcon } from "./icons/lollipop";
import { BasketballIcon } from "./icons/basketball";
import { AmericanFootballIcon } from "./icons/american-football";
import { TennisRacquetIcon } from "./icons/tennis-racquet";
import { BaseballIcon } from "./icons/baseball";
import { BowlingBallIcon } from "./icons/bowling-ball";
import { GolfIcon } from "./icons/golf";
import { VolleyballIcon } from "./icons/volleyball";
import { PingPongIcon } from "./icons/ping-pong";
import { SkateboardIcon } from "./icons/skateboard";
import { KayakIcon } from "./icons/kayak";
import { TramIcon } from "./icons/tram";
import { TaxiIcon } from "./icons/taxi";
import { ScooterIcon } from "./icons/scooter";
import { TractorIcon } from "./icons/tractor";
import { BulldozerIcon } from "./icons/bulldozer";
import { CraneIcon } from "./icons/crane";
import { AmbulanceIcon } from "./icons/ambulance";
import { FireTruckIcon } from "./icons/fire-truck";
import { HotAirBalloonIcon } from "./icons/hot-air-balloon";
import { HelicopterIcon } from "./icons/helicopter";
import { HospitalIcon } from "./icons/hospital";
import { FactoryIcon } from "./icons/factory";
import { WarehouseIcon } from "./icons/warehouse";
import { CastleIcon } from "./icons/castle";
import { WindmillIcon } from "./icons/windmill";
import { BarnIcon } from "./icons/barn";
import { UniversityIcon } from "./icons/university";
import { StadiumIcon } from "./icons/stadium";
import { HardHatIcon } from "./icons/hard-hat";
import { ShovelIcon } from "./icons/shovel";
import { AxeIcon } from "./icons/axe";
import { DrillIcon } from "./icons/drill";
import { ScrewdriverIcon } from "./icons/screwdriver";
import { PliersIcon } from "./icons/pliers";
import { BackpackIcon } from "./icons/backpack";
import { HandbagIcon } from "./icons/handbag";
import { BinocularsIcon } from "./icons/binoculars";
import { TelescopeIcon } from "./icons/telescope";
import { MicroscopeIcon } from "./icons/microscope";
import { FireExtinguisherIcon } from "./icons/fire-extinguisher";
import { SofaIcon } from "./icons/sofa";
import { WashingMachineIcon } from "./icons/washing-machine";
import { SunglassesIcon } from "./icons/sunglasses";
import { BaseballCapIcon } from "./icons/baseball-cap";
import { UsbIcon } from "./icons/usb";
import { WebcamIcon } from "./icons/webcam";
import { ProjectorIcon } from "./icons/projector";
import { HeadsetIcon } from "./icons/headset";
import { DroneIcon } from "./icons/drone";
import { RouterIcon } from "./icons/router";
import { BarcodeIcon } from "./icons/barcode";
import { SimCardIcon } from "./icons/sim-card";
import { RemoteControlIcon } from "./icons/remote-control";
import { SatelliteDishIcon } from "./icons/satellite-dish";
import { RadiationIcon } from "./icons/radiation";
import { BiohazardIcon } from "./icons/biohazard";
import { VirusIcon } from "./icons/virus";
import { BoneIcon } from "./icons/bone";
import { SyringeIcon } from "./icons/syringe";
import { SatelliteIcon } from "./icons/satellite";
import { RadarIcon } from "./icons/radar";
import { SolarPanelIcon } from "./icons/solar-panel";
import { RabbitIcon } from "./icons/rabbit";
import { TurtleIcon } from "./icons/turtle";
import { OwlIcon } from "./icons/owl";
import { PenguinIcon } from "./icons/penguin";
import { BeeIcon } from "./icons/bee";
import { SnailIcon } from "./icons/snail";
import { HorseIcon } from "./icons/horse";
import { WhaleIcon } from "./icons/whale";
import { FrogIcon } from "./icons/frog";
import { SharkIcon } from "./icons/shark";
import { SproutIcon } from "./icons/sprout";
import { CloverIcon } from "./icons/clover";
import { TulipIcon } from "./icons/tulip";
import { PalmTreeIcon } from "./icons/palm-tree";
import { MushroomIcon } from "./icons/mushroom";
import { VolcanoIcon } from "./icons/volcano";
import { AcornIcon } from "./icons/acorn";
import { DressIcon } from "./icons/dress";
import { HoodieIcon } from "./icons/hoodie";
import { SneakerIcon } from "./icons/sneaker";
import { ScanViewfinderIcon } from "./icons/scan-viewfinder";
import { HistoryIcon } from "./icons/history";
import { CrosshairIcon } from "./icons/crosshair";
import { ExpandIcon } from "./icons/expand";
import { CollapseIcon } from "./icons/collapse";
import { ImportIcon } from "./icons/import";
import { StaplerIcon } from "./icons/stapler";
import { BallpointPenIcon } from "./icons/ballpoint-pen";
import { ChartCandleIcon } from "./icons/chart-candle";
import { ChartRadarIcon } from "./icons/chart-radar";
import { ChartTreemapIcon } from "./icons/chart-treemap";
import { ChartBubbleIcon } from "./icons/chart-bubble";
import { FolderOpenIcon } from "./icons/folder-open";
import { StickyNoteIcon } from "./icons/sticky-note";
import { AbacusIcon } from "./icons/abacus";
import { CertificateIcon } from "./icons/certificate";
import { ProjectorScreenIcon } from "./icons/projector-screen";
import { ProtractorIcon } from "./icons/protractor";
import { TapeMeasureIcon } from "./icons/tape-measure";
import { ShredderIcon } from "./icons/shredder";
import { PencilCupIcon } from "./icons/pencil-cup";
import { AddressBookIcon } from "./icons/address-book";
import { TallyMarksIcon } from "./icons/tally-marks";
import { TimelineIcon } from "./icons/timeline";
import { GlueStickIcon } from "./icons/glue-stick";
import { SpiritLevelIcon } from "./icons/spirit-level";
import { DrumIcon } from "./icons/drum";
import { ViolinIcon } from "./icons/violin";
import { TrumpetIcon } from "./icons/trumpet";
import { XylophoneIcon } from "./icons/xylophone";
import { TambourineIcon } from "./icons/tambourine";
import { HarpIcon } from "./icons/harp";
import { TurntableIcon } from "./icons/turntable";
import { TheaterMasksIcon } from "./icons/theater-masks";
import { ChessPawnIcon } from "./icons/chess-pawn";
import { PlayingCardsIcon } from "./icons/playing-cards";
import { CameraLensIcon } from "./icons/camera-lens";
import { FilmReelIcon } from "./icons/film-reel";
import { EaselIcon } from "./icons/easel";
import { PaintRollerIcon } from "./icons/paint-roller";
import { TopHatIcon } from "./icons/top-hat";
import { RubiksCubeIcon } from "./icons/rubiks-cube";
import { SlotMachineIcon } from "./icons/slot-machine";
import { CrystalBallIcon } from "./icons/crystal-ball";
import { KiteIcon } from "./icons/kite";
import { BowArrowIcon } from "./icons/bow-arrow";
import { BucketIcon } from "./icons/bucket";
import { DeskFanIcon } from "./icons/desk-fan";
import { HandMirrorIcon } from "./icons/hand-mirror";
import { CandleIcon } from "./icons/candle";
import { ToothbrushIcon } from "./icons/toothbrush";
import { KettleIcon } from "./icons/kettle";
import { FryingPanIcon } from "./icons/frying-pan";
import { BlenderIcon } from "./icons/blender";
import { ClothesHangerIcon } from "./icons/clothes-hanger";
import { DiamondRingIcon } from "./icons/diamond-ring";
import { BathtubIcon } from "./icons/bathtub";
import { WardrobeIcon } from "./icons/wardrobe";
import { ChairIcon } from "./icons/chair";
import { ClothesIronIcon } from "./icons/clothes-iron";
import { LipstickIcon } from "./icons/lipstick";
import { PerfumeIcon } from "./icons/perfume";
import { NecktieIcon } from "./icons/necktie";
import { HouseplantIcon } from "./icons/houseplant";
import { CookingPotIcon } from "./icons/cooking-pot";
import { HairDryerIcon } from "./icons/hair-dryer";
import { StopSignIcon } from "./icons/stop-sign";
import { ParkingSignIcon } from "./icons/parking-sign";
import { PassportIcon } from "./icons/passport";
import { TicketIcon } from "./icons/ticket";
import { FoldedMapIcon } from "./icons/folded-map";
import { LifeBuoyIcon } from "./icons/life-buoy";
import { FerryIcon } from "./icons/ferry";
import { SurfboardIcon } from "./icons/surfboard";
import { FerrisWheelIcon } from "./icons/ferris-wheel";
import { CamperVanIcon } from "./icons/camper-van";
import { SteeringWheelIcon } from "./icons/steering-wheel";
import { BarrierGateIcon } from "./icons/barrier-gate";
import { ParachuteIcon } from "./icons/parachute";
import { LanternIcon } from "./icons/lantern";
import { WindsockIcon } from "./icons/windsock";
import { ControlTowerIcon } from "./icons/control-tower";
import { BusStopIcon } from "./icons/bus-stop";
import { HighwayIcon } from "./icons/highway";
import { PyramidIcon } from "./icons/pyramid";
import { FishingRodIcon } from "./icons/fishing-rod";
import { EarIcon } from "./icons/ear";
import { FootprintsIcon } from "./icons/footprints";
import { BandageIcon } from "./icons/bandage";
import { IdCardIcon } from "./icons/id-card";
import { ShoppingBasketIcon } from "./icons/shopping-basket";
import { ThoughtBubbleIcon } from "./icons/thought-bubble";
import { ChatBubblesIcon } from "./icons/chat-bubbles";
import { NewspaperIcon } from "./icons/newspaper";
import { RibbonIcon } from "./icons/ribbon";
import { WalkIcon } from "./icons/walk";
import { AccessibilityIcon } from "./icons/accessibility";
import { ContactlessPayIcon } from "./icons/contactless-pay";
import { CashRegisterIcon } from "./icons/cash-register";
import { LungsIcon } from "./icons/lungs";
import { HeartBrokenIcon } from "./icons/heart-broken";
import { KettlebellIcon } from "./icons/kettlebell";
import { BathroomScaleIcon } from "./icons/bathroom-scale";
import { FaceMaskIcon } from "./icons/face-mask";
import { WaterBottleIcon } from "./icons/water-bottle";
import { MoneyBagIcon } from "./icons/money-bag";

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
  "music-notes": MusicNotesIcon,
  "sailboat": SailBoatIcon,
  "lighthouse": LighthouseIcon,
  "motorcycle": MotorcycleIcon,
  "traffic-signal": TrafficSignalIcon,
  "gas-pump": GasPumpIcon,
  "signpost": SignpostIcon,
  "suitcase": SuitcaseIcon,
  "bridge": BridgeIcon,
  "cable-car": CableCarIcon,
  "charging-station": ChargingStationIcon,
  "ghost": GhostIcon,
  "sword": SwordIcon,
  "treasure-chest": TreasureChestIcon,
  "joystick": JoystickIcon,
  "disco-ball": DiscoBallIcon,
  "flying-saucer": FlyingSaucerIcon,
  "bomb": BombIcon,
  "boxing-glove": BoxingGloveIcon,
  "skull": SkullIcon,
  "alien": AlienIcon,
  "bird": BirdIcon,
  "cat": CatIcon,
  "dog": DogIcon,
  "fish": FishIcon,
  "butterfly": ButterflyIcon,
  "cactus": CactusIcon,
  "campfire": CampfireIcon,
  "planet": PlanetIcon,
  "shooting-star": ShootingStarIcon,
  "waves": WavesIcon,
  "armchair": ArmchairIcon,
  "door-open": DoorOpenIcon,
  "ladder": LadderIcon,
  "siren": SirenIcon,
  "security-camera": SecurityCameraIcon,
  "metronome": MetronomeIcon,
  "toolbox": ToolboxIcon,
  "broom": BroomIcon,
  "vinyl-record": VinylRecordIcon,
  "guitar": GuitarIcon,
  "piano-keys": PianoKeysIcon,
  "equalizer": EqualizerIcon,
  "waveform": WaveformIcon,
  "cassette-tape": CassetteTapeIcon,
  "microphone-stage": MicrophoneStageIcon,
  "film-slate": FilmSlateIcon,
  "stethoscope": StethoscopeIcon,
  "tooth": ToothIcon,
  "dna": DnaIcon,
  "brain": BrainIcon,
  "first-aid-kit": FirstAidKitIcon,
  "handshake": HandshakeIcon,
  "bank": BankIcon,
  "gavel": GavelIcon,
  "hamburger": HamburgerIcon,
  "bread": BreadIcon,
  "popsicle": PopsicleIcon,
  "martini": MartiniIcon,
  "beer-stein": BeerSteinIcon,
  "chef-hat": ChefHatIcon,
  "cheese": CheeseIcon,
  "paint-bucket": PaintBucketIcon,
  "paint-brush": PaintBrushIcon,
  "magic-wand": MagicWandIcon,
  "eraser": EraserIcon,
  "highlighter": HighlighterIcon,
  "pen-nib": PenNibIcon,
  "swatches": SwatchesIcon,
  "stamp": StampIcon,
  "robot": RobotIcon,
  "test-tube": TestTubeIcon,
  "speedometer": SpeedometerIcon,
  "git-fork": GitForkIcon,
  "app-window": AppWindowIcon,
  "vr-headset": VrHeadsetIcon,
  "flashlight": FlashlightIcon,
  "stopwatch": StopwatchIcon,
  "hand-waving": HandWavingIcon,
  "hands-clapping": HandsClappingIcon,
  "cell-tower": CellTowerIcon,
  "hand-pointing": HandPointingIcon,
  "sparkle": SparkleIcon,
  "confetti": ConfettiIcon,
  "translate": TranslateIcon,
  "broadcast": BroadcastIcon,
  "signature": SignatureIcon,
  "notebook": NotebookIcon,
  "kanban": KanbanIcon,
  "push-pin": PushPinIcon,
  "floppy-disk": FloppyDiskIcon,
  "list-checks": ListChecksIcon,
  "banknote": BanknoteIcon,
  "chart-donut": ChartDonutIcon,
  "chart-scatter": ChartScatterIcon,
  "scales": ScalesIcon,
  "cloud-snow": CloudSnowIcon,
  "tornado": TornadoIcon,
  "meteor": MeteorIcon,
  "cloud-sun": CloudSunIcon,
  "croissant": CroissantIcon,
  "donut": DonutIcon,
  "cookie": CookieIcon,
  "popcorn": PopcornIcon,
  "sandwich": SandwichIcon,
  "soup-bowl": SoupBowlIcon,
  "carrot": CarrotIcon,
  "avocado": AvocadoIcon,
  "orange-slice": OrangeSliceIcon,
  "milk-carton": MilkCartonIcon,
  "wheat": WheatIcon,
  "lollipop": LollipopIcon,
  "basketball": BasketballIcon,
  "american-football": AmericanFootballIcon,
  "tennis-racquet": TennisRacquetIcon,
  "baseball": BaseballIcon,
  "bowling-ball": BowlingBallIcon,
  "golf": GolfIcon,
  "volleyball": VolleyballIcon,
  "ping-pong": PingPongIcon,
  "skateboard": SkateboardIcon,
  "kayak": KayakIcon,
  "tram": TramIcon,
  "taxi": TaxiIcon,
  "scooter": ScooterIcon,
  "tractor": TractorIcon,
  "bulldozer": BulldozerIcon,
  "crane": CraneIcon,
  "ambulance": AmbulanceIcon,
  "fire-truck": FireTruckIcon,
  "hot-air-balloon": HotAirBalloonIcon,
  "helicopter": HelicopterIcon,
  "hospital": HospitalIcon,
  "factory": FactoryIcon,
  "warehouse": WarehouseIcon,
  "castle": CastleIcon,
  "windmill": WindmillIcon,
  "barn": BarnIcon,
  "university": UniversityIcon,
  "stadium": StadiumIcon,
  "hard-hat": HardHatIcon,
  "shovel": ShovelIcon,
  "axe": AxeIcon,
  "drill": DrillIcon,
  "screwdriver": ScrewdriverIcon,
  "pliers": PliersIcon,
  "backpack": BackpackIcon,
  "handbag": HandbagIcon,
  "binoculars": BinocularsIcon,
  "telescope": TelescopeIcon,
  "microscope": MicroscopeIcon,
  "fire-extinguisher": FireExtinguisherIcon,
  "sofa": SofaIcon,
  "washing-machine": WashingMachineIcon,
  "sunglasses": SunglassesIcon,
  "baseball-cap": BaseballCapIcon,
  "usb": UsbIcon,
  "webcam": WebcamIcon,
  "projector": ProjectorIcon,
  "headset": HeadsetIcon,
  "drone": DroneIcon,
  "router": RouterIcon,
  "barcode": BarcodeIcon,
  "sim-card": SimCardIcon,
  "remote-control": RemoteControlIcon,
  "satellite-dish": SatelliteDishIcon,
  "radiation": RadiationIcon,
  "biohazard": BiohazardIcon,
  "virus": VirusIcon,
  "bone": BoneIcon,
  "syringe": SyringeIcon,
  "satellite": SatelliteIcon,
  "radar": RadarIcon,
  "solar-panel": SolarPanelIcon,
  "rabbit": RabbitIcon,
  "turtle": TurtleIcon,
  "owl": OwlIcon,
  "penguin": PenguinIcon,
  "bee": BeeIcon,
  "snail": SnailIcon,
  "horse": HorseIcon,
  "whale": WhaleIcon,
  "frog": FrogIcon,
  "shark": SharkIcon,
  "sprout": SproutIcon,
  "clover": CloverIcon,
  "tulip": TulipIcon,
  "palm-tree": PalmTreeIcon,
  "mushroom": MushroomIcon,
  "volcano": VolcanoIcon,
  "acorn": AcornIcon,
  "dress": DressIcon,
  "hoodie": HoodieIcon,
  "sneaker": SneakerIcon,
  "scan-viewfinder": ScanViewfinderIcon,
  "history": HistoryIcon,
  "crosshair": CrosshairIcon,
  "expand": ExpandIcon,
  "collapse": CollapseIcon,
  "import": ImportIcon,
  "stapler": StaplerIcon,
  "ballpoint-pen": BallpointPenIcon,
  "chart-candle": ChartCandleIcon,
  "chart-radar": ChartRadarIcon,
  "chart-treemap": ChartTreemapIcon,
  "chart-bubble": ChartBubbleIcon,
  "folder-open": FolderOpenIcon,
  "sticky-note": StickyNoteIcon,
  "abacus": AbacusIcon,
  "certificate": CertificateIcon,
  "projector-screen": ProjectorScreenIcon,
  "protractor": ProtractorIcon,
  "tape-measure": TapeMeasureIcon,
  "shredder": ShredderIcon,
  "pencil-cup": PencilCupIcon,
  "address-book": AddressBookIcon,
  "tally-marks": TallyMarksIcon,
  "timeline": TimelineIcon,
  "glue-stick": GlueStickIcon,
  "spirit-level": SpiritLevelIcon,
  "drum": DrumIcon,
  "violin": ViolinIcon,
  "trumpet": TrumpetIcon,
  "xylophone": XylophoneIcon,
  "tambourine": TambourineIcon,
  "harp": HarpIcon,
  "turntable": TurntableIcon,
  "theater-masks": TheaterMasksIcon,
  "chess-pawn": ChessPawnIcon,
  "playing-cards": PlayingCardsIcon,
  "camera-lens": CameraLensIcon,
  "film-reel": FilmReelIcon,
  "easel": EaselIcon,
  "paint-roller": PaintRollerIcon,
  "top-hat": TopHatIcon,
  "rubiks-cube": RubiksCubeIcon,
  "slot-machine": SlotMachineIcon,
  "crystal-ball": CrystalBallIcon,
  "kite": KiteIcon,
  "bow-arrow": BowArrowIcon,
  "bucket": BucketIcon,
  "desk-fan": DeskFanIcon,
  "hand-mirror": HandMirrorIcon,
  "candle": CandleIcon,
  "toothbrush": ToothbrushIcon,
  "kettle": KettleIcon,
  "frying-pan": FryingPanIcon,
  "blender": BlenderIcon,
  "clothes-hanger": ClothesHangerIcon,
  "diamond-ring": DiamondRingIcon,
  "bathtub": BathtubIcon,
  "wardrobe": WardrobeIcon,
  "chair": ChairIcon,
  "clothes-iron": ClothesIronIcon,
  "lipstick": LipstickIcon,
  "perfume": PerfumeIcon,
  "necktie": NecktieIcon,
  "houseplant": HouseplantIcon,
  "cooking-pot": CookingPotIcon,
  "hair-dryer": HairDryerIcon,
  "stop-sign": StopSignIcon,
  "parking-sign": ParkingSignIcon,
  "passport": PassportIcon,
  "ticket": TicketIcon,
  "folded-map": FoldedMapIcon,
  "life-buoy": LifeBuoyIcon,
  "ferry": FerryIcon,
  "surfboard": SurfboardIcon,
  "ferris-wheel": FerrisWheelIcon,
  "camper-van": CamperVanIcon,
  "steering-wheel": SteeringWheelIcon,
  "barrier-gate": BarrierGateIcon,
  "parachute": ParachuteIcon,
  "lantern": LanternIcon,
  "windsock": WindsockIcon,
  "control-tower": ControlTowerIcon,
  "bus-stop": BusStopIcon,
  "highway": HighwayIcon,
  "pyramid": PyramidIcon,
  "fishing-rod": FishingRodIcon,
  "ear": EarIcon,
  "footprints": FootprintsIcon,
  "bandage": BandageIcon,
  "id-card": IdCardIcon,
  "shopping-basket": ShoppingBasketIcon,
  "thought-bubble": ThoughtBubbleIcon,
  "chat-bubbles": ChatBubblesIcon,
  "newspaper": NewspaperIcon,
  "ribbon": RibbonIcon,
  "walk": WalkIcon,
  "accessibility": AccessibilityIcon,
  "contactless-pay": ContactlessPayIcon,
  "cash-register": CashRegisterIcon,
  "lungs": LungsIcon,
  "heart-broken": HeartBrokenIcon,
  "kettlebell": KettlebellIcon,
  "bathroom-scale": BathroomScaleIcon,
  "face-mask": FaceMaskIcon,
  "water-bottle": WaterBottleIcon,
  "money-bag": MoneyBagIcon,
};
