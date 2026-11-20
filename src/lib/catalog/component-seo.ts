/**
 * Search-facing <title>/<meta description> overrides for component pages.
 * The catalog `name`/`description` stay as the on-page copy; these target the phrases
 * Search Console shows people actually typing (pages ranking ~5–30 with no clicks yet).
 */
export const COMPONENT_SEO: Record<string, { title: string; description: string }> = {
  "dither-field": {
    title: "React Dither Effect: Free Dithered Background",
    description:
      "Free React dither background: two colours, every shade. A field of dots that reacts to the pointer and sends out a ring on press. Canvas, no dependencies.",
  },
  "count-up-digits": {
    title: "React Count Up Animation: Rolling Digits",
    description:
      "Free React count up animation that rolls its digits like an odometer, on springs. Starts in view, replays on press, screen reader friendly. Framer Motion.",
  },
  "bento-grid": {
    title: "React Bento Grid with Tailwind, Free",
    description:
      "Free React bento grid in Tailwind CSS: mixed-size tiles, a pointer light across the whole grid, spring entrance, light or dark. Copy-paste or shadcn CLI.",
  },
  "animated-accordion": {
    title: "React Accordion Component, Free with Tailwind",
    description:
      "Free React accordion that opens on a spring: single or multiple open, light or dark, keyboard accessible, copy-paste with the shadcn CLI. Framer Motion + Tailwind CSS.",
  },
  "date-wheels": {
    title: "React Date Picker: iOS-style 3D Wheels",
    description:
      "React date picker of three 3D drums for day, month and year that you fling, scroll or tap, with a magnifying glass band. Framer Motion + Tailwind CSS.",
  },
  "agent-thinking": {
    title: "React AI Thinking Indicator: Agent Steps",
    description:
      "React component for an AI agent's thinking state: a living orb, shimmering steps with sources, a folding summary and a streamed answer. Framer Motion + Tailwind CSS.",
  },
  "odometer-field": {
    title: "React Number Input: Mechanical Odometer Stepper",
    description:
      "React quantity field that rolls like a mechanical odometer, with a sliding ruler to scrub, accelerating steppers and a counting total. Framer Motion + Tailwind CSS.",
  },
  "activity-rings": {
    title: "React Activity Rings: Fitness Progress Chart",
    description:
      "React activity rings for move, exercise and running, with a second lap past the goal, sparks when a ring closes and a week to step through. Framer Motion + Tailwind CSS.",
  },
  "notification-center": {
    title: "React Notification Center: Swipe to Archive",
    description:
      "React notification centre with rolling unread counts, swipe-to-archive rows with Undo, a mark-all-read wave and new notices that drop in. Framer Motion + Tailwind CSS.",
  },
  "contribution-skyline": {
    title: "React Contribution Graph: 3D Heatmap Skyline",
    description:
      "React GitHub-style contribution heatmap that stands up into a 3D city of bars you can walk round, with streak highlighting. Framer Motion + Tailwind CSS.",
  },
  "liquid-funnel": {
    title: "React Funnel Chart: Liquid in a Glass Tube",
    description:
      "React conversion funnel drawn as liquid in a glass tube, with drops of lost users that fall and splash, and periods to switch between. Framer Motion + Tailwind CSS.",
  },
  "sleep-score": {
    title: "React Sleep Score Card: Night Sky Dashboard",
    description:
      "React sleep score card under a real night sky: a cratered moon, the Milky Way, a glowing three-channel gauge and a staircase of sleep stages. Framer Motion + Tailwind CSS.",
  },
  "shatter-mark": {
    title: "React 3D Logo Effect: Chrome Shatter",
    description:
      "React chrome logo built from thousands of triangles that shatter around your pointer and crumple home. WebGL + Framer Motion + Tailwind CSS.",
  },
  "annotate-text": {
    title: "React Text Annotation: Hand-drawn Highlights",
    description:
      "React paragraph that gets marked up as you watch: a highlighter, circled and struck words, double underlines and a box, drawn at the speed of a hand. Framer Motion + Tailwind CSS.",
  },
  "metal-card": {
    title: "React 3D Credit Card: Brushed Metal Tilt",
    description:
      "React brushed metal payment card that tilts in 3D with sliding light, engraved digits, a shifting hologram and a flip to the back. Framer Motion + Tailwind CSS.",
  },
  "receipt-button": {
    title: "React Pay Button: Prints a Receipt",
    description:
      "React pay button that sinks into a slot and prints a thermal receipt you can pull down and tear off along its teeth. Framer Motion + Tailwind CSS.",
  },
  "decay-card": {
    title: "React Image Reveal: Burning Photo Card",
    description:
      "React photo card that rots and burns away from where your pointer came in, with a charred edge and embers, to reveal the next photo. Framer Motion + Tailwind CSS.",
  },
  "ribbon-gallery": {
    title: "React Image Carousel: Waving Ribbon Gallery",
    description:
      "React photo gallery printed on one long ribbon of paper that waves like fabric, slides with momentum and swells under your pointer. Framer Motion + Tailwind CSS.",
  },
  "photo-tunnel": {
    title: "React 3D Image Gallery: Fly-through Tunnel",
    description:
      "React spatial gallery: a tunnel of photographs in the dark that you fly through with momentum, and open one to hold it up. Framer Motion + Tailwind CSS.",
  },
  "bell-toggle": {
    title: "React Toggle: Notify Me Bell",
    description:
      "React notify-me toggle with a brass bell that swings and rings when struck, and gives one dull knock when you turn it off. Framer Motion + Tailwind CSS.",
  },
  "project-index": {
    title: "React Hover Image List: Editorial Project Index",
    description:
      "React editorial project index in big type where each project's picture follows your pointer and redraws square by square as you move. Framer Motion + Tailwind CSS.",
  },
  "fuse-button": {
    title: "React Undo Button: Burning Fuse Timer",
    description:
      "React action button with a burning fuse round its outline for the undo window: undo snuffs the spark, burnout commits. Framer Motion + Tailwind CSS.",
  },
  "download-button": {
    title: "React Download Button: Liquid Fill Progress",
    description:
      "React download button whose file icon fills like a glass, with sloshing waves, bubbles and a counting percentage, then closes up to Saved. Framer Motion + Tailwind CSS.",
  },
  "focus-field": {
    title: "React Focus Timer: Dithered Pixel Field",
    description:
      "React focus-mode card on a drifting field of dithered squares that flee your pointer, with a countdown and held notifications you can bat away. Framer Motion + Tailwind CSS.",
  },
  "liquid-tabs": {
    title: "React Tabs: Liquid Gooey Tab Indicator",
    description:
      "React settings tabs where the chosen tab is a bump in the card that runs across like a drop of liquid and settles with an overshoot. Framer Motion + Tailwind CSS.",
  },
  "liquid-status": {
    title: "React Stat Cards: Liquid Glass Vessels",
    description:
      "React status cards where each icon is a glass vessel of glowing liquid filled to its number, sloshing as the card turns. Framer Motion + Tailwind CSS.",
  },
  "glyph-flow": {
    title: "React ASCII Art Card: Flowing Characters",
    description:
      "React feature card whose picture is made of characters that ripple, part around your pointer and swirl into the next shape on click. Framer Motion + Tailwind CSS.",
  },
  "depth-stack": {
    title: "React 3D Photo Stack: Depth of Field Gallery",
    description:
      "React stack of photographs receding on a diagonal that you travel along, each lifting into sharp focus while the rest falls out of focus. Framer Motion + Tailwind CSS.",
  },
  "fold-gallery": {
    title: "React Swipe Gallery: Soft Page Turn",
    description:
      "React photo gallery that turns each picture over like a soft sheet: the edges curl, the corners flare and the colours smear apart. Framer Motion + Tailwind CSS.",
  },
  "melt-type": {
    title: "React Text Effect: Melting Liquid Type",
    description:
      "React heading in heavy type that melts and swirls like stirred ink under your pointer, then settles back into sharp type. WebGL + Framer Motion + Tailwind CSS.",
  },
  "message-composer": {
    title: "React Chat Input: Message Composer with Mentions",
    description:
      "React message composer with formatting, @mention chips, photo attachments with upload rings, a voice-note recorder and scheduled send. Framer Motion + Tailwind CSS.",
  },
  "search-modal": {
    title: "React Search Modal: Command K with Previews",
    description:
      "React search field that opens into results with photos for projects and faces for people, lit matches and a gliding keyboard highlight. Framer Motion + Tailwind CSS.",
  },
  "file-drop": {
    title: "React File Upload: Animated Drag and Drop",
    description:
      "React upload area for real files: a marching border, light that gathers to your file, liquid upload fills, a shake for files too big. Framer Motion + Tailwind CSS.",
  },
  "profile-card": {
    title: "React Profile Card: 3D Avatar and Follow",
    description:
      "React profile card with a drifting cover photo, a 3D avatar that rises out of its frame and a Follow button with confetti and a rolling count. Framer Motion + Tailwind CSS.",
  },
  "orb-nav": {
    title: "React Navbar: Crystal Orb Navigation",
    description:
      "React minimal navbar whose mark is a smoked crystal orb lit by your pointer, tinting as you point at links and turning the bar into search. WebGL + Framer Motion + Tailwind CSS.",
  },
  "halo-hero": {
    title: "React Hero Section: Particle Halo",
    description:
      "React hero inside a living halo of particles that breathes, flares under your pointer and goes nova on the button, and flows into new forms. WebGL + Framer Motion + Tailwind CSS.",
  },
  "brain-atlas": {
    title: "React 3D Brain: Interactive Neuron Atlas",
    description:
      "React brain made of firing neurons you can turn in your hand; point to light a region and click to turn to it with a live signal trace. Canvas + Framer Motion + Tailwind CSS.",
  },
  "led-button": {
    title: "React LED Button: Dot-Matrix Copy Button",
    description:
      "React LED button whose label is spelled in tiny glowing lamps, with a pointer glow, ripple press and scrolling marquee. WebGL + Framer Motion + Tailwind CSS.",
  },
  "glass-compare": {
    title: "React Before After Image Slider with Glass",
    description:
      "React before/after image comparison slider whose divider is a bar of refracting glass that bends, smears and sprays droplets. Framer Motion + Tailwind CSS.",
  },
  "silk-print": {
    title: "React 3D Product Card: Animated Silk Cloth",
    description:
      "React product card with a WebGL silk scarf that ripples in the breeze, turns on its rod and changes colourway. Framer Motion + Tailwind CSS.",
  },
  "glyph-rain": {
    title: "React 404 Page: Matrix-style Glyph Rain",
    description:
      "React 404 hero of falling characters that settle into a hidden message where your pointer lingers. WebGL + Framer Motion + Tailwind CSS.",
  },
  "magic-calendar": {
    title: "Animated React Calendar Component with Festival Effects",
    description:
      "React month calendar that celebrates about fifty world festivals with snow, fireworks, lanterns and candles. Canvas + Framer Motion + Tailwind CSS.",
  },
  "airmail-globe": {
    title: "React Globe Message Composer: Airmail Plane",
    description:
      "React message composer that folds a postcard into a paper plane and flies it round a real sunlit globe. WebGL + Framer Motion + Tailwind CSS.",
  },
  "order-tracking": {
    title: "React Order Tracking: Live Delivery Map",
    description:
      "React delivery tracker with a courier riding a city map from pickup to drop-off, a rolling ETA, stages and a live feed. Framer Motion + Tailwind CSS.",
  },
  "image-galleries": {
    title: "React Image Gallery: Drift, Mosaic and Focus Rail",
    description:
      "Three animated React image galleries: drifting columns with a lightbox, a reflowing mosaic and an expanding focus rail. Framer Motion + Tailwind CSS.",
  },
  "model-picker": {
    title: "React AI Model Picker: Model and Effort Menu",
    description:
      "React model picker for AI apps: featured models, an effort submenu and more models by provider in one animated pill. Framer Motion + Tailwind CSS.",
  },
  "sand-drift-gallery": {
    title: "React Image Carousel: Sand Particle Gallery",
    description:
      "React infinite image carousel whose pictures blow away into sand at the edges as you drag and fling it. WebGL + Framer Motion + Tailwind CSS.",
  },
  "diffusion-loader": {
    title: "React AI Image Loader: Diffusion Placeholder",
    description:
      "React image-generation loader that resolves from noise to a sharp picture step by step, like a diffusion model. WebGL + Framer Motion + Tailwind CSS.",
  },
  "warp-cta": {
    title: "React Warp Speed Button: Animated Deploy CTA",
    description:
      "React CTA button that spools up a starfield into warp streaks on hover and jumps on click. WebGL + Framer Motion + Tailwind CSS.",
  },
  "print-styles": {
    title: "React Image Filter Picker: Halftone and Riso",
    description:
      "React image style picker that prints a picture as 1-bit, newsprint halftone or risograph, with a print head and loupe. Framer Motion + Tailwind CSS.",
  },
  "inspect-text": {
    title: "React Text Effect: Design Tool Inspector",
    description:
      "React intro paragraph where every word is a layer with a selection frame, size tags and red measurement lines. Framer Motion + Tailwind CSS.",
  },
  "soap-bubble": {
    title: "React Kudos Button: Hold to Blow a Soap Bubble",
    description:
      "React kudos button you hold to blow a thin-film soap bubble that floats off and pops. WebGL shader + Framer Motion + Tailwind CSS.",
  },
  "ink-drop-picker": {
    title: "React Color Picker: Ink Drop Fluid Simulation",
    description:
      "React accent colour picker that drops ink into water with a GPU fluid simulation, then flows the colour into the UI. Framer Motion + Tailwind CSS.",
  },
  "tear-off-coupon": {
    title: "React Coupon Component: Tear-off Promo Code",
    description:
      "React promo code coupon with a holographic ticket and a stub you tear off hole by hole to reveal the code. Framer Motion + Tailwind CSS.",
  },
  "breadcrumb-branch": {
    title: "React Breadcrumb Navigation: Animated Branch",
    description:
      "React breadcrumb that grows as a living tree branch with leaves, buds and a hopping sparrow. Framer Motion + Tailwind CSS.",
  },
  "eclipse-toggle": {
    title: "React Dark Mode Toggle: Animated Sunset Switch",
    description:
      "React dark mode toggle: the sun sets behind the hills and turns into the moon, with golden hour, stars and sound. Drag or tap it. Framer Motion + Tailwind CSS.",
  },
  "bubble-tags": {
    title: "React Tag Input with Animated Bubbles",
    description:
      "React tag input component: each tag is a soap bubble that floats up, drifts and pops with sound when removed. Keyboard friendly. Framer Motion + Tailwind.",
  },
  "lens-search": {
    title: "React Search Bar with an Animated Lens",
    description:
      "React search bar: the magnifier grows into a lens that glides down the results, magnifies each row and parks on matches. Combobox with sound. Framer Motion.",
  },
  "peel-delete": {
    title: "React Hold to Delete Button with Undo",
    description:
      "React hold-to-delete: holding the bin peels the note off like a sticker, with a rasp, a rip and an Undo timer. Keyboard friendly. Framer Motion + Tailwind.",
  },
  "upload-morph": {
    title: "React File Upload Progress Animation",
    description:
      "React file upload progress: the cloud icon morphs into a progress ring with a rising arrow, then lands as a check. Real progress and sound. Framer Motion.",
  },
  "neon-star-rating": {
    title: "React Neon Star Rating Component",
    description:
      "React star rating in neon: star-shaped tubes flicker on with a buzz and glow amber on a brick wall. Radio group with arrow keys. Framer Motion + Tailwind.",
  },
  "voice-morph": {
    title: "React Voice Message Button Animation",
    description:
      "React voice message button: the mic splits into a live waveform, then the bars fold into a send arrow that shoots up. Chat UI with sound. Framer Motion.",
  },
  "gold-star-rating": {
    title: "React Star Rating: 3D Gold Stars with Sound",
    description:
      "React star rating component: five 3D gold stars that spin in one by one with a metallic ting, lean to your pointer and work with arrow keys. Framer Motion.",
  },
  "milestone-timeline": {
    title: "React Project Timeline Component",
    description:
      "React timeline component for project roadmaps: milestones marked done, current or upcoming, on a rail that fills to the current one. Tailwind CSS.",
  },
  "hover-highlight-text": {
    title: "React Hover Highlight Text Animation",
    description:
      "React hover highlight text: a spotlight follows the cursor and reveals an outlined copy of your heading with spring easing. Tailwind CSS + Framer Motion.",
  },
  "cinematic-logo-cloud": {
    title: "React Marquee Logo Cloud Component",
    description:
      "React logo cloud for social proof: brand logos blur-fade into a grid or scroll in an infinite marquee. Built with Tailwind CSS and Framer Motion.",
  },
  "beam-sweep-field": {
    title: "Beam Sweep — React Light Beam Background",
    description:
      "Beam sweep background for React: light columns sweep across a fine grid over a horizon glow, with a default hero you can replace. Framer Motion and Tailwind.",
  },
  "image-trail": {
    title: "Cursor Image Trail Effect for React",
    description:
      "React image trail effect: images spawn along the cursor path and fade out with a blur. Works with touch input. Built with Tailwind CSS and Framer Motion.",
  },
  "draggable-card-stack": {
    title: "React Card Stack UI: Draggable Cards You Can Fling",
    description:
      "Draggable card stack for React: drag or fling the top card to send it to the back of a tilted deck. Supports video cards. Tailwind CSS + Framer Motion.",
  },
  "orbital-loader": {
    title: "Orb Loader — React Loading Animation",
    description:
      "Orb loader for React: glowing dots circle counter-rotating rings while status messages cycle below, with optional progress. Tailwind CSS + Framer Motion.",
  },
  "chat-messages": {
    title: "React Chat UI with Typing Animation",
    description:
      "Animated React chat message UI: bubbles appear one by one after a typing indicator, made for AI assistant demos. Built with Tailwind CSS and Framer Motion.",
  },
  "animated-countdown": {
    title: "React Countdown Timer: Animated Countdown",
    description:
      "Animated React countdown timer: days, hours, minutes and seconds roll over with a blur-fade, in four styles. Tailwind CSS and Framer Motion for Next.js.",
  },
  "animated-select-headline": {
    title: "React Rotating Words Headline Animation",
    description:
      "React rotating words headline: a hero heading swaps its keyword on a timer with a blur-fade, ending on gradient words. Tailwind CSS and Framer Motion.",
  },
  "ask-nexus-input": {
    title: "AI Search Input — React Disintegrate Effect",
    description:
      "React AI prompt input with rotating placeholder suggestions. On submit, the text breaks into canvas particles and drifts away. Built with Framer Motion.",
  },
  "avatar-group": {
    title: "React Avatar Group — Animated Avatar Stack",
    description:
      "Animated React avatar group: overlapping avatars with entrance animations, hover lift, name tooltips and colored initials as fallback. Uses Framer Motion.",
  },
  "card-stack-rotator": {
    title: "React Testimonial Card Stack Carousel",
    description:
      "React testimonial carousel: stacked quote cards rotate on a timer with spring motion and pause on hover. Highlight words with **asterisks**. Framer Motion.",
  },
  "cinematic-card-deck": {
    title: "React Scroll Stacking Cards Animation",
    description:
      "React scroll card deck: cards tilt away in 3D as you scroll to reveal the next, with progress dots and cursor parallax. Tailwind CSS and Framer Motion.",
  },
  "circular-carousel": {
    title: "React Carousel: Circular Card Carousel",
    description:
      "Circular carousel for React: cards move along an arc around a slide counter, with arrows, dots, arrow keys and autoplay. Tailwind CSS + Framer Motion.",
  },
  "code-block": {
    title: "React Code Block with Syntax Highlighting",
    description:
      "React code block with built-in syntax highlighting, line numbers, a copy button, a window-style header and a bottom fade. Dark and light themes, no Shiki.",
  },
  "command-palette": {
    title: "Command Palette for React — Cmd+K Menu",
    description:
      "Cmd+K command palette for React built on cmdk and Radix Dialog: type-to-filter search, arrow-key navigation and Framer Motion open and close transitions.",
  },
  "compare": {
    title: "Before and After Image Slider for React",
    description:
      "React before/after image slider: move the cursor, or drag on touch screens, to reveal one image over the other, with optional labels. Built with Tailwind CSS.",
  },
  "depth-testimonials": {
    title: "React Testimonial Carousel — Stacked Cards",
    description:
      "React testimonial carousel with stacked cards: the front quote is in focus and cards cycle to the back with spring motion. Auto-advances, pauses on hover.",
  },
  "dot-grid-hero": {
    title: "Interactive Particle Hero Section — React",
    description:
      "React hero section with an interactive particle grid: colored dashes scatter from the cursor and spring back. Canvas-based, Tailwind CSS, Framer Motion.",
  },
  "editorial-blog-rail": {
    title: "React Blog Section with Featured Post",
    description:
      "React blog section: a featured story with gradient cover art beside a numbered list of recent posts, with dark mode. Tailwind CSS and Framer Motion.",
  },
  "glowing-effect-cards": {
    title: "Glowing Border Cards — React Hover Effect",
    description:
      "React glowing effect cards: a multicolor border glow follows the cursor on hover, shown in a 2-1-2 bento grid. Built with Tailwind CSS and Framer Motion.",
  },
  "gooey-search-input": {
    title: "Gooey Search Input — React SVG Goo Effect",
    description:
      "Expandable React search input: a pill and icon bubble merge through an SVG goo filter, then spring open into a text field. Framer Motion and Tailwind CSS.",
  },
  "images-badge": {
    title: "React Badge Animation — Hover Image Stack",
    description:
      "Animated React badge that stacks avatars or images in a pill and fans them out on hover with spring motion. Built with Framer Motion and Tailwind CSS.",
  },
  "infinite-moving-cards": {
    title: "Infinite Moving Cards — React Card Marquee",
    description:
      "Infinite moving cards for React: a looping marquee of testimonial or feature cards that pauses on hover. Built with Tailwind CSS and Framer Motion.",
  },
  "interactive-globe-explorer": {
    title: "React Globe Component — Interactive 3D Map",
    description:
      "Interactive 3D globe for React built on react-globe.gl and three.js: a scrollable office list rotates the globe to each city, with map pins and copy buttons.",
  },
  "mac-keyboard": {
    title: "Mac Keyboard Component for React with Sound",
    description:
      "Interactive Mac keyboard for React: keycaps press with Framer Motion, play synthesized Web Audio clicks, and light up as you type on a real keyboard.",
  },
  "meteors": {
    title: "Meteor Effect — React Meteor Background",
    description:
      "React meteor effect: glowing meteor beams streak diagonally across cards and hero sections. Built with Framer Motion and Tailwind CSS; set density and angle.",
  },
  "nebula-cta-glow": {
    title: "React CTA Section with Glow Animation",
    description:
      "React call-to-action block: a soft cyan glow pulses behind a white button on a dark card. A short Tailwind CSS and Framer Motion snippet to restyle.",
  },
  "orbit-footer": {
    title: "React Footer Component with Newsletter",
    description:
      "React website footer with link columns, newsletter signup, a status pill and a large wordmark that rises into view. Tailwind CSS and Framer Motion.",
  },
  "phone-input": {
    title: "React Phone Number Input with Country Picker",
    description:
      "React phone number input with a searchable country code dropdown, flag emoji and a simple length check. Built with Tailwind CSS and Framer Motion.",
  },
  "pulse-dashboard-kpis": {
    title: "React KPI Dashboard Cards with Sparklines",
    description:
      "React KPI cards for dashboards: metric values, delta chips that know when lower is better, and animated SVG sparklines with a 7d/30d/90d period switcher.",
  },
  "scroll-progress-bar": {
    title: "React Scroll Progress Bar Component",
    description:
      "Vertical scroll progress bar for React: a thin rail fills with spring smoothing as a section scrolls, with step markers. Tailwind CSS and Framer Motion.",
  },
  "scroll-reveal-text": {
    title: "Scroll Reveal Text Animation for React",
    description:
      "React scroll text reveal: words, characters or lines go from muted gray to full color with a blur dissolve as the section scrolls. Built with Framer Motion.",
  },
  "scrolling-testimonials": {
    title: "Scrolling Testimonials — React Marquee Wall",
    description:
      "React testimonial wall with infinite vertical scrolling columns, per-column speed and direction, pause on hover and star ratings. Pure CSS with Tailwind.",
  },
  "shader-flow": {
    title: "Shader Flow — Animated Gradient Background",
    description:
      "React animated gradient background: blurred color blobs drift slowly like a shader, with optional cursor parallax and three intensity levels. Framer Motion.",
  },
  "shooting-stars-grid": {
    title: "Shooting Stars Grid Background for React",
    description:
      "React shooting stars background: light streaks run along grid lines over twinkling stars, for hero sections. Tailwind CSS, Framer Motion, dark mode.",
  },
  "signup-form": {
    title: "React Signup Form Component with Validation",
    description:
      "React signup form on shadcn/ui Input, Label and Button: name, email and password fields with validation, loading and success states, and social logins.",
  },
  "sparkles": {
    title: "Sparkles Effect — React Particle Background",
    description:
      "React sparkles effect: drifting, twinkling particles for hero text, cards and backgrounds, with optional pointer glow and click bursts. Uses Framer Motion.",
  },
  "split-contact-glass": {
    title: "React Contact Form Section — Split Layout",
    description:
      "React contact section: a glass panel with email, location and live local time, and a form with topic chips and a character counter. Built with Tailwind CSS.",
  },
  "squiggly-text": {
    title: "Squiggly Text — React Wobbly Text Effect",
    description:
      "React squiggly text effect: SVG turbulence and displacement filters make headline letters wobble like hand-drawn animation. Works with any font.",
  },
  "starfield-hero": {
    title: "Starfield Hero — React Hero Animation",
    description:
      "React starfield hero: canvas particles twinkle, scatter from the cursor and spring back, with a title and two CTA buttons. Tailwind CSS + Framer Motion.",
  },
  "step-flow": {
    title: "React Step Flow — How It Works Section",
    description:
      "React how-it-works section: hover or click a numbered step to slide a highlight onto it and swap its image. Tailwind CSS and Framer Motion, dark mode.",
  },
  "text-generate-effect": {
    title: "Text Generate Effect — React Text Animation",
    description:
      "React text generate effect: words, characters or lines fade in one by one with optional blur and lift, on mount or on scroll. Built with Framer Motion.",
  },
  "text-reveal-card": {
    title: "Text Reveal Card — React Hover Effect",
    description:
      "React text reveal card: hidden text wipes in behind the cursor on hover, and tap or focus reveals it too. Built with Tailwind CSS and Framer Motion.",
  },
  "typewriter-effect": {
    title: "Typewriter Effect for React — Typing Text",
    description:
      "React typewriter effect that types text letter by letter with a blinking cursor, then deletes and rotates through phrases. Built with Framer Motion.",
  },
  "vector-tilt-scene": {
    title: "React Tilt Card — 3D Hover Tilt Effect",
    description:
      "React tilt card: a glass panel rotates in 3D toward the cursor with Framer Motion springs and CSS perspective, then settles back when the mouse leaves.",
  },
  "warp-speed-card": {
    title: "Warp Speed Text Hover Effect for React",
    description:
      "React warp speed hover effect: wrap a phrase and a tiny space scene with streaking light beams appears behind it. Built with Tailwind CSS and Framer Motion.",
  },
  "workbench-sidebar": {
    title: "Collapsible Sidebar for React Dashboards",
    description:
      "Collapsible React sidebar for SaaS apps: workspace switcher, search, nav with a sliding active highlight, projects, usage meter and user card. Framer Motion.",
  },
  "liquid-pagination": {
    title: "React Pagination with a Liquid Page Indicator",
    description:
      "Animated React pagination: the current page is a drop of water that stretches to the page you pick and pulls itself round. Keyboard friendly. Framer Motion.",
  },
  "step-player": {
    title: "React Stepper: Animated Onboarding Steps",
    description:
      "React stepper for onboarding: the current step stretches into a bar that fills as it plays, then eases to the next. Play, pause or jump to any step.",
  },
  "elastic-stepper": {
    title: "React Number Stepper with Spring Animation",
    description:
      "React plus and minus number stepper: the value rolls up or down, a dot track stretches to it, and it rubber-bands past either limit. Framer Motion.",
  },
  "tick-slider": {
    title: "React Range Slider with Animated Ticks",
    description:
      "React range slider drawn as ticks that fill up to the value, swell around the pointer and tick softly as you drag. Keyboard ready, Tailwind and Framer Motion.",
  },
  "travelling-tooltip": {
    title: "React Tooltip That Glides Between Buttons",
    description:
      "Animated React tooltip for toolbars: one tooltip glides from button to button, resizing to each label and showing its shortcut. Tailwind CSS, Framer Motion.",
  },
  "standing-calendar": {
    title: "React Calendar Heatmap in 3D",
    description:
      "React calendar heatmap that stands up in 3D: each day of the contribution grid rises as a column as tall as its count. Hover a day to read its value.",
  },
  "range-calendar": {
    title: "React Date Range Picker with a Liquid Ribbon",
    description:
      "Animated React date range picker: drag and the selection stretches like a ribbon, snapping day by day, while the nights count rolls. Framer Motion.",
  },
  "seek-search": {
    title: "React Expandable Search Bar with Suggestions",
    description:
      "Animated React search bar: a round button opens into a field as one object, and suggestions drop in underneath and filter as you type. Escape closes it.",
  },
  "falloff-accordion": {
    title: "React Accordion: Animated Image Accordion",
    description:
      "React image accordion: the photo strip you point at opens and its neighbours give way on a smooth falloff, with a caption that rises. Framer Motion.",
  },
  "goo-reorder": {
    title: "React Draggable List: Drag and Drop with Liquid Reorder",
    description:
      "React drag and drop list that reorders like ink: rows stay joined by a liquid neck that stretches and pinches off as one moves, with keyboard support.",
  },
  "glass-login-stack": {
    title: "React Login Form: Glass Card with Passkey",
    description:
      "Free React login form: a frosted card over a slow aurora that tilts toward the pointer, with passkey sign-in first, then email and password. Tailwind CSS.",
  },
  "copy-button": {
    title: "React Copy to Clipboard Button, Animated",
    description:
      "Free React copy to clipboard button: the icon morphs into a check under a ripple with a Copied tooltip, plus a command line copy. Framer Motion.",
  },
  "toast-stack": {
    title: "Animated React Toast Notifications That Stack",
    description:
      "Free React toast notifications: new toasts drop onto a stack and spring into shape, hover fans them out, and a fling sends one skidding away. Framer Motion.",
  },
  "squeeze-progress": {
    title: "React Progress Bar with a Springy Pause",
    description:
      "Animated React progress bar with a big percentage: pause it and the tip bunches into a springy squiggle as the panel warms; resume and it carries on.",
  },
  "upload-dropzone": {
    title: "React File Upload Dropzone, Animated",
    description:
      "React file upload dropzone: a stack of sheets fans out while a file hovers, the tray swallows the drop, and each row fills a progress ring. Framer Motion.",
  },
  "consent-dock": {
    title: "React Cookie Consent Banner",
    description:
      "React cookie consent banner that does not nag: choose and it drains into a small corner button, customise and the switches fall in a domino run.",
  },
  "aspect-crop": {
    title: "React Image Crop: Aspect Ratio Picker",
    description:
      "React image crop with an aspect ratio picker: the crop frame keeps its area at every ratio and springs to the new shape, with rule-of-thirds lines.",
  },
  "skeleton-morph": {
    title: "React Skeleton Loader That Morphs into Content",
    description:
      "React skeleton loader cut to the exact shape of the content, with one light sweep, that dissolves into the real content in reading order. Framer Motion.",
  },
  "context-menu": {
    title: "React Context Menu, Liquid Right-Click Menu",
    description:
      "Animated React context menu: right-click, long-press or Shift+F10 and a drop flows out into the menu, with a highlight that glides between rows.",
  },
  "vinyl-player": {
    title: "React Audio Player Styled as a Turntable",
    description:
      "React audio player you play like a turntable: the tonearm swings on, grab the record to scrub or fling it to coast, and skipping slides a new record in.",
  },
  "mercury-switch": {
    title: "React Toggle Switch with a Mercury Knob",
    description:
      "React toggle switch whose knob is a bead of chrome mercury, shaded per pixel, that reaches across when you flip it. For settings pages. Framer Motion.",
  },
  "notification-stack": {
    title: "React Notification Stack with Swipe to Dismiss",
    description:
      "React notifications that pile into a stack, spread out on hover with timers paused, swipe away sideways, and turn a loading toast into a success.",
  },
  "todo-list": {
    title: "React Todo List with Animated Check-Off",
    description:
      "Animated React todo list: ticking a task draws a check, strikes it through and drops it into a Completed drawer, with quick add and undo. Framer Motion.",
  },
  "otp-input": {
    title: "React OTP Input with Verify Animation",
    description:
      "Free React OTP input: six boxes where digits spring in as you type, ripple while the code is checked, shake on a wrong code and fold into Verified.",
  },
  "fan-deck": {
    title: "Fan Deck: React Color Palette Swatch Picker",
    description:
      "React fan deck of paint-chip colour swatches: the deck tips over and fans into a half circle, hover lifts a chip and a click copies its hex. Framer Motion + Tailwind CSS.",
  },
  "slosh-slider": {
    title: "React Range Slider with a Liquid Slosh",
    description:
      "React range slider whose liquid fill lags behind the handle, leans with your drag speed and sloshes back before it settles. Framer Motion + Tailwind CSS.",
  },
  "wake-slider": {
    title: "React Range Slider Made of Springy Bars",
    description:
      "React range slider built from 56 thin bars: drag across it and the bars spring up in your wake, taller the faster you move, then ripple back down.",
  },
  "bolting-sliders": {
    title: "React Settings Sliders with a Leaping Knob",
    description:
      "React settings sliders where a click makes the knob leap to the spot in an arc with a fading trail, then land with a squash. Drag and arrow keys work too.",
  },
  "effort-slider": {
    title: "React Effort Slider with a Galaxy Thumb",
    description:
      "React slider for an AI effort setting, from Faster to Smarter. The thumb is a spiral galaxy that grows richer as you go, and the top level bursts into sparks.",
  },
  "card-carousel-3d": {
    title: "React 3D Card Carousel with Drag and Fling",
    description:
      "Free React 3D carousel: product cards stand round a cylinder, coast when you fling it and click into place. Wheel, arrow keys, dots and tap all work.",
  },
  "smear-carousel": {
    title: "React Carousel with Smeared Neighbour Cards",
    description:
      "React carousel where the cards either side are pulled into long flowing streaks. Drag, fling or use the arrow keys, and it settles on a card with a spring.",
  },
  "marble-progress": {
    title: "React Onboarding Checklist with Marble Progress",
    description:
      "React onboarding checklist that keeps score with marbles: tick a step and a marble rolls down ramps into a jar, untick it and it pops. The jar glows when done.",
  },
  "domino-progress": {
    title: "React Progress Stepper Made of Dominoes",
    description:
      "React deploy-pipeline progress made of standing dominoes: each finished step tips onto the next. Pause, resume and reset, with a live region for screen readers.",
  },
  "vine-progress": {
    title: "React Progress Bar That Grows as a Vine",
    description:
      "React onboarding checklist with a vine for a progress bar: it grows to your current step, unfurls a leaf per step and flowers when you finish. Leaves rustle on hover.",
  },
  "genie-uploader": {
    title: "React File Upload with a Genie Drop Animation",
    description:
      "React file upload that swallows files like a macOS window minimising: drop or pick files, they pour into a cloud with per-file progress, retry and a size limit.",
  },
  "mercury-upload": {
    title: "React File Upload with a Mercury Progress Bar",
    description:
      "React file upload where the file pours in as mercury: a bead falls into a pool that spreads as progress, then pulls together into a bead with a check.",
  },
  "ripple-toast": {
    title: "React Toast Notifications That Splash Like Water",
    description:
      "React toast notifications that drop in like a bead of water, splash into a pill and send out a ring. Up to three stack, and dismissed ones lift away.",
  },
  "skeleton-morph-rows": {
    title: "React Skeleton Loader Rows That Become the Content",
    description:
      "React skeleton loader that turns into the content instead of being swapped for it: each grey shape stretches to its real box and dissolves, row by row.",
  },
  "dart-rating": {
    title: "React Rating Input Where You Throw a Dart",
    description:
      "React rating input from 1 to 10: hold to aim, release to throw, and the ring the dart lands in is the score. Number keys work, and it is a real slider for screen readers.",
  },
  "animated-tabs": {
    title: "React Animated Tabs: Sliding Segmented Control",
    description:
      "Free React tabs component: a sliding segmented control swaps the panel, rows slide in from the side you moved towards and the panel resizes to fit.",
  },
  "mercury-tabs": {
    title: "React Tabs Component with a Liquid Metal Indicator",
    description:
      "React tab bar whose selected tab sits in a frame of liquid metal, with reflections that drift and split round its corners as you pick another tab.",
  },
  "ink-theme-switch": {
    title: "React Dark Mode Toggle with an Ink Pour Transition",
    description:
      "React dark mode toggle: the dark panel pours out of the switch as a growing ink circle and drains back in. The sun folds into a crescent moon.",
  },
  "window-seat-toggle": {
    title: "React Dark Mode Toggle: Pull Down an Aeroplane Shade",
    description:
      "React light and dark theme switch drawn as an aeroplane window: pull the shade down and the cabin light follows your finger.",
  },
  "background-gradient": {
    title: "React Animated Gradient Ring Background for Cards",
    description:
      "Free React card or button wrapper with a slowly turning conic-gradient ring and soft glow. Hover spins it up, press squashes and springs it back.",
  },
  "background-boxes": {
    title: "React Background Boxes: Isometric Grid on Canvas",
    description:
      "Free React isometric grid background drawn on canvas: the cell under the pointer pops up like a key, overshoots and settles with a ripple around it.",
  },
  "mesh-net": {
    title: "React Mesh Background That Lights Up Near the Cursor",
    description:
      "React background of a distorted triangle net that hides in the dark until the cursor comes near, then springs and lights up like a torch passing over it.",
  },
  "cubes-grid": {
    title: "React 3D Cubes Grid Background with a Ripple",
    description:
      "React background of 3D cubes that ripple into a travelling wave under the cursor, on one canvas with one animation loop. Light or dark variants.",
  },
  "tag-pit": {
    title: "React Tag Picker with Pill Tags You Can Throw",
    description:
      "React tag input for an interests picker: every tag is a pill dropped into a tray. Grab and throw them, shake the tray, tap to pick, and Continue unlocks at a minimum.",
  },
  "cursor-buddy": {
    title: "React Cursor Effect: A Character Whose Eyes Follow You",
    description:
      "React cursor effect: a soft little character whose eyes follow the pointer, blink, flinch when you come close, doze off when idle and hop when you click it.",
  },
  "morph-cursor": {
    title: "React Custom Cursor That Morphs into Buttons",
    description:
      "React custom cursor like the iPad pointer: a soft dot melts into the shape of whatever you can press, sits behind it as a highlight and becomes a caret over text.",
  },
  "encrypted-text": {
    title: "React Scramble Text Effect: Text That Decodes Itself",
    description:
      "Free React scramble text effect: characters shuffle in fixed-width cells, then a lock wave drops each into place with a spring. Start on load, hover, click or scroll.",
  },
  "motion-layer-scroller": {
    title: "React Parallax Scroll Effect with Paper-Cut Layers",
    description:
      "Free React parallax scroll: a landscape of paper-cut layers where each ridge rises at its own speed as you scroll, then settles on a soft spring. Pass your own layers.",
  },
  "bending-rail": {
    title: "React Slider with a Rail That Bends to the Knob",
    description:
      "React slider whose rail follows the knob: pull the knob off the groove and the rail bends toward it while a ghost knob keeps the value, then it twangs straight.",
  },
  "capsule-toggles": {
    title: "React Toggle Switch: A Ball Sealed in a Glass Capsule",
    description:
      "Free React toggle switches built as a ball in a glass capsule. Flip one and the ball stretches into a pill, takes on the row's colour and glows as it lands.",
  },
  "stretch-nav": {
    title: "React Navbar with a Stretching Pill Indicator",
    description:
      "React pill navigation: the active capsule leads with its front edge and the back edge catches up, so it stretches to the next item. A hover pill follows the pointer.",
  },
  "svg-noise-shader": {
    title: "React Noise Gradient Background with SVG Grain",
    description:
      "Free React grainy gradient background built from SVG feTurbulence: film grain over soft pools of colour that lean toward the pointer, and a press melts the surface.",
  },
  "tracing-spotlight-panel": {
    title: "React Spotlight Card with a Tracing Border Glow",
    description:
      "Free React spotlight card: a soft light trails the pointer on a spring and the border glows where it is closest. Leave and it runs laps round the border.",
  },
  "time-scrubber": {
    title: "React Time Scrubber: A Ruler Time Picker You Fling",
    description:
      "React time scrubber: a time picker drawn as a ruler you drag or fling under a fixed needle. It coasts, ticks at every interval and lands exactly on a snap point.",
  },
  "flight-tracker": {
    title: "React Flight Tracker UI: Live Flight Card with Plane Arc",
    description:
      "React flight tracker UI: a live flight card where a plane banks along a dotted arc, the flown part fills in and the status counts down. Expand for altitude and speed.",
  },
  "wheel-selector": {
    title: "React Radial Menu: Draggable Wheel Selector",
    description:
      "React radial selector: a ring of icon nodes you drag, fling or step with arrow keys, snapping to the nearest stop with a little overshoot. Free, Framer Motion + Tailwind CSS.",
  },
  "cursor-text-reveal": {
    title: "React Text Reveal on Hover: Cursor Ink Lens",
    description:
      "React text reveal where an ink lens follows the cursor and shows a second sentence through it, trailing droplets on springs. Free, Framer Motion + Tailwind CSS.",
  },
  "nebula-glass-card": {
    title: "React Glassmorphism Card: Tilting Nebula Glass",
    description:
      "React glassmorphism card over a drifting nebula that tilts toward the pointer, with a moving rim light and a press effect. Free, Framer Motion + Tailwind CSS.",
  },
  "glow-button": {
    title: "React Glow Button: Cursor-Tracking Rim Light",
    description:
      "React call-to-action button with a rim glow that turns to face the pointer while the button drifts toward the cursor. Free, Framer Motion + Tailwind CSS.",
  },
  "three-d-folder": {
    title: "React 3D Folder Card: Opens on Hover to Fan Papers",
    description:
      "React 3D folder card whose flap swings open on hover, focus or tap and fans up to three papers, each opening a preview. Free, Framer Motion + Tailwind CSS.",
  },
  "real-time-cursors": {
    title: "React Live Cursors: Shared Board Collaboration UI",
    description:
      "React shared-cursor UI for a design board: arrows glide and lean with speed, name tags trail and swing, clicks and comments land. Free, Framer Motion + Tailwind CSS.",
  },
  "terminal": {
    title: "React Terminal Component: Interactive Typing Window",
    description:
      "React macOS-style terminal that types a script with human timing, then lets you type commands like help, ls and echo. Free, Framer Motion + Tailwind CSS.",
  },
  "floating-dock": {
    title: "React Dock Component: macOS-style Floating Dock",
    description:
      "React macOS-style dock: tiles swell under the pointer and push neighbours aside, tooltips name each one, a click bounces the tile. Free, Framer Motion + Tailwind CSS.",
  },
  "stateful-button": {
    title: "React Button with Loading, Success and Error States",
    description:
      "React async button with idle, loading, success and error states: it squashes on press, a light sweeps while it loads, the label rolls. Free, Framer Motion + Tailwind CSS.",
  },
  "expandable-cards": {
    title: "React Expandable Cards: Grid That Grows to Detail",
    description:
      "React expandable cards: pick one in the grid and it grows in one spring into a full card with a long description and a call to action. Free, Framer Motion + Tailwind CSS.",
  },
  "spectra-frame": {
    title: "React Image Gallery: Black and White to Color Hover",
    description:
      "React photo grid that rests in black and white; point at a photo and colour blooms out from where the pointer entered. Free, Framer Motion + Tailwind CSS.",
  },
  "profile-orbit": {
    title: "React Team Section: Profile Card with Orbiting Avatars",
    description:
      "React team profile card with members orbiting on a tilted ring: drag, use arrows or tap a face to spin that person to the front. Free, Framer Motion + Tailwind CSS.",
  },
  "feature-tools-card": {
    title: "React Integrations Card: Tools Orbiting a Hub",
    description:
      "React integrations card: tool icons ride a slow ring round a hub, wired by lines that carry packets, and lean toward the pointer. Free, Framer Motion + Tailwind CSS.",
  },
  "link-preview": {
    title: "React Link Preview: Hover Card on Inline Links",
    description:
      "React link preview that lifts a card out of the text on hover or keyboard focus and draws its own cover from the title and site. Free, Framer Motion + Tailwind CSS.",
  },
  "radio-cards": {
    title: "React Radio Cards: Pricing Plan Picker",
    description:
      "React plan picker built on real radio inputs: the selection ring glides between cards, the chosen card opens, the button label rolls. Free, Framer Motion + Tailwind CSS.",
  },
  "password-strength": {
    title: "React Password Strength Meter with Rules Checklist",
    description:
      "React password field with a four-segment strength meter, a rolling label, rules that tick off as you type and an eye toggle. Free, Framer Motion + Tailwind CSS.",
  },
  "rotating-headline": {
    title: "React Rotating Headline: Animated Hero Words",
    description:
      "React hero headline whose words arrive one by one out of a blur and keep rolling to the next, with a subline and a replay button. Free, Framer Motion + Tailwind CSS.",
  },
  "feedback-pill": {
    title: "React Feedback Widget: Pill That Morphs to a Form",
    description:
      "React feedback widget: a small pill morphs into a note form, shows a spinner while sending, then shrinks into a thank-you. Free, Framer Motion + Tailwind CSS.",
  },
  "stagger-menu": {
    title: "React Dropdown Menu: Staggered Share Menu",
    description:
      "React dropdown menu that unfolds with items arriving one after another, a gliding highlight, arrow-key navigation and a rolling label. Free, Framer Motion + Tailwind CSS.",
  },
  "progress-button": {
    title: "React Progress Button: Fills as the Work Runs",
    description:
      "React progress button that stretches into its own progress bar with a live percentage, then turns green with a drawn check. Free, Framer Motion + Tailwind CSS.",
  },
  "venom-button": {
    title: "React Button Effect: Black Pill with Reaching Tendrils",
    description:
      "React glossy black pill button that oozes pseudopods toward the cursor, lunges when close, then stretches, snaps and melts back. Free, Framer Motion + Tailwind CSS.",
  },
  "web-sling-button": {
    title: "React Web Sling Button: Silk Splat Click Effect",
    description:
      "React call-to-action button on a light stage where the cursor shoots silk: click to splat it on, hold and pull to tilt the button. Free, Framer Motion + Tailwind CSS.",
  },
  "dust-snap": {
    title: "React Dust Disintegration Text Effect",
    description:
      "React text effect where a word turns to dust: it shivers, darkens and crumbles into a cloud of particles. Free, Framer Motion + Tailwind CSS.",
  },
  "shredder-delete": {
    title: "React Delete Animation: Paper Shredder Effect",
    description:
      "React delete animation: drag a document onto an office shredder, or press Delete on a focused row, and it feeds through as strips. Free, Framer Motion + Tailwind CSS.",
  },
  "pumpkin-reveal": {
    title: "React 3D Pumpkin: Cracking Halloween Reveal",
    description:
      "React 3D jack-o'-lantern on a dead branch: it turns on its rope, glowing cracks grow where you hit it, and the third hit splits it open. Free, Framer Motion + Tailwind CSS.",
  },
  "catch-undo": {
    title: "React Undo Button Animation: Silk Catches Deleted Row",
    description:
      "React undo animation: a deleted row drops out of the list as time slows, then Undo shoots a silk web that catches and pulls it back. Free, Framer Motion + Tailwind CSS.",
  },
  "status-morph": {
    title: "React Status Bar Animation: Wi-Fi and Battery Morph",
    description:
      "React iPhone-style status bar that morphs when tapped: the battery drains and rounds into a ring, the signal bars sink into dots. Free, Framer Motion + Tailwind CSS.",
  },
  "word-magnet": {
    title: "React Text Hover Effect: Words Pushed Like Magnets",
    description:
      "React headline where the pointer shoves nearby words away, each tilting the way it was pushed, then springing home with a wobble. Tailwind CSS + TypeScript.",
  },
  "forge-ai-command-bar": {
    title: "React AI Command Bar: Ask, Edit or Build Prompt Panel",
    description:
      "React AI command bar with Ask, Edit and Build modes, suggestions, and a panel where the prompt becomes a heading and steps tick off. Tailwind CSS + TypeScript.",
  },
  "slide-to-confirm": {
    title: "React Slide to Confirm Button with Stretchy Knob",
    description:
      "React slide-to-confirm track for payments: the knob stretches with drag speed and squashes on stop, with a shimmering label. Tailwind CSS + TypeScript.",
  },
  "emoji-reactions": {
    title: "React Emoji Reactions: Chips and Spring Picker",
    description:
      "React emoji reactions: chips pop and roll their counts when tapped, and a spring picker adds new reactions with a layout animation. Tailwind CSS + TypeScript.",
  },
  "like-burst": {
    title: "React Like Button Animation: Heart Burst and Counter",
    description:
      "React like button: the heart squashes and fills with a ring shockwave and particle burst, and the count rolls digit by digit. Tailwind CSS + TypeScript.",
  },
  "hold-to-record": {
    title: "React Voice Note Recorder: Hold to Record Button",
    description:
      "React hold-to-record voice note button: a halo swells with your voice, a live waveform scrolls in, and sliding left morphs the dot. Tailwind CSS + TypeScript.",
  },
  "dot-sphere": {
    title: "React Dot Sphere: Interactive Canvas Particle Globe",
    description:
      "React canvas sphere of dots that part around the pointer, spin when dragged and coast back to idle, with a ripple on tap. Tailwind CSS + TypeScript.",
  },
  "dynamic-island": {
    title: "React Dynamic Island: Morphing Pill for Timer and Calls",
    description:
      "React Dynamic Island pill that grows into a timer, a playing song or an incoming call, stretching width first and height after. Tailwind CSS + TypeScript.",
  },
  "hold-to-confirm": {
    title: "React Hold to Confirm Button for Destructive Actions",
    description:
      "React destructive button you press and hold: the fill sweeps across, early release springs back, finishing shows an undo toast. Tailwind CSS + TypeScript.",
  },
  "before-after": {
    title: "React Before and After Image Slider with Springy Handle",
    description:
      "React image comparison slider with a springy handle, fading corner labels, arrow-key control and Before, Split, After buttons. Tailwind CSS + TypeScript.",
  },
  "price-odometer": {
    title: "React Pricing Card: Seat Slider with Odometer Total",
    description:
      "React seat-based pricing card whose total rolls like an odometer, with a Save badge that pops in for yearly billing. Tailwind CSS + TypeScript.",
  },
  "tilt-pass": {
    title: "React 3D Tilt Card: Membership Pass with Holo Sheen",
    description:
      "React membership pass that tilts toward the pointer with a moving glare and holographic sheen, then flips to a scannable back. Tailwind CSS + TypeScript.",
  },
  "shared-element-cards": {
    title: "React Shared Element Transition: Cards Open to a Sheet",
    description:
      "React story cards that open into a sheet with a shared-element transition; artwork and title travel into place. Escape closes. Tailwind CSS + TypeScript.",
  },
  "ruler-picker": {
    title: "React Ruler Picker: Fling-to-Select Duration Input",
    description:
      "React duration picker drawn as a ruler you fling: it glides with momentum, snaps to whole units, and the big number rolls. Tailwind CSS + TypeScript.",
  },
  "animated-icons": {
    title: "React Animated Icons: Menu, Play, Heart, Bell, Theme Toggle",
    description:
      "React animated toggle icons: menu to close, play to pause, a bursting heart, a ringing bell, sun to moon, bookmark, mute and lock. Tailwind CSS + TypeScript.",
  },
  "folder-peek": {
    title: "React Folder Hover Effect: Documents Fan Out on Peek",
    description:
      "React folder that tips its front panel back on hover or focus while a document, photo and chart fan out, then tuck back in. Tailwind CSS + TypeScript.",
  },
  "magnify-dock": {
    title: "React macOS Dock: Magnifying App Icon Bar",
    description:
      "React macOS-style dock: icons swell as the pointer passes, show a label above, bounce when launched and keep a running dot. Tailwind CSS + TypeScript.",
  },
  "upload-chips": {
    title: "React File Upload Drop Zone with Progress Chips",
    description:
      "React drop zone that lifts and tints on drag-over, then turns each file into a chip with a progress bar, ring and a check. Tailwind CSS + TypeScript.",
  },
  "island-morph": {
    title: "React Dynamic Island Morph: Timer, Call and Music Player",
    description:
      "React black pill that morphs between a timer, an incoming call and a full music player, with content blurring in once it lands. Tailwind CSS + TypeScript.",
  },
  "lanyard-badge": {
    title: "React Lanyard Badge: Draggable Conference Badge",
    description:
      "React conference badge on a strap: grab and throw it, and it swings back as a damped pendulum, twisting with sideways speed. Tailwind CSS + TypeScript.",
  },
  "glass-lens": {
    title: "React Magnifying Glass: Draggable Glass Lens Effect",
    description:
      "React glass lens puck you drag over content: it magnifies the centre and splits colour toward the rim, with no shader needed. Tailwind CSS + TypeScript.",
  },
  "ascii-wake": {
    title: "React ASCII Cursor Trail: Pointer Wake of Characters",
    description:
      "React cursor trail of characters that thickens where you linger and thins with age, with switchable glyph sets. Tailwind CSS + TypeScript.",
  },
  "liquid-dial": {
    title: "React Floating Action Button: Liquid Speed Dial",
    description:
      "React floating action button whose actions bud out like liquid, with a highlight of two blobs that pulls into a thread. Tailwind CSS + TypeScript.",
  },
  "voice-orb": {
    title: "React Voice Assistant Orb: Listening, Thinking, Speaking",
    description:
      "React voice orb with four assistant states: hold to talk, then a dotted ring becomes a glow, a thinking sphere and a churning voice. Tailwind CSS + TypeScript.",
  },
  "sagging-field": {
    title: "React Text Input That Sags Under the Weight of Typing",
    description:
      "React text field that bends as you type: letters ride the curve on springs, overflow falls off, and Let it go drops it all. Tailwind CSS + TypeScript.",
  },
  "tear-off-ticket": {
    title: "React Event Ticket: Tear-Off Stub with Perforation",
    description:
      "React event ticket whose stub you pull along the perforation; let go early and it snaps back, pull through and it drops. Tailwind CSS + TypeScript.",
  },
  "throw-wheel": {
    title: "React 3D Card Carousel: Fling-Able Throw Wheel",
    description:
      "React 3D drum of cards you can fling: cards turn edge-on and blur with speed, then straighten one by one as one snaps front. Tailwind CSS + TypeScript.",
  },
  "pixel-select": {
    title: "React Dropdown Select That Builds and Dissolves in Pixels",
    description:
      "React dropdown that builds itself from a pixel grid tinted with the chosen colour, then dissolves into falling pixels on pick. Tailwind CSS + TypeScript.",
  },
  "scrub-inputs": {
    title: "React Scrubbable Number Input: Drag Labels to Change",
    description:
      "React design-tool number fields: drag a label sideways to change the value, Shift for big steps, Alt for fine, with a delta badge. Tailwind CSS + TypeScript.",
  },
  "lit-keyboard": {
    title: "React Keyboard Component: Lit Keys with Click Sounds",
    description:
      "React tilted keyboard that lights up under typing with a slow afterglow and a mechanical click, with record and replay of a run. Tailwind CSS + TypeScript.",
  },
  "ripple-field": {
    title: "React Dot Grid Ripple: Click Wave Across a Field",
    description:
      "React grid of dots: click and a ring travels outward, each dot it crosses bursts into colour, gets kicked away and springs home. Tailwind CSS + TypeScript.",
  },
  "dot-globe": {
    title: "React Dotted Globe with Flight Arcs: Drag to Spin",
    description:
      "React dotted globe with flight arcs drawn along great circles; drag to spin with coasting, or pick a city to face it. Tailwind CSS + TypeScript.",
  },
  "component-layers": {
    title: "React Exploded View: Isometric Component Layers",
    description:
      "React music player card that tips isometric and peels into surface, spacing, layout and content layers with leader-line labels. Tailwind CSS + TypeScript.",
  },
  "money-goo": {
    title: "React Money Transfer UI: Liquid Drag-to-Pay Gooey Effect",
    description:
      "React peer-to-peer payment: drag an amount out of your avatar on a liquid neck, drop it on a friend, and both balances roll. Tailwind CSS + TypeScript.",
  },
  "weather-puck": {
    title: "React Weather Time of Day Slider: Draggable Puck",
    description:
      "React puck you drag across dots to set the time of day: dots lift and warm, and the scene relights from dawn to night. Tailwind CSS + TypeScript.",
  },
  "metal-orbs": {
    title: "React Liquid Metal Metaballs on Canvas",
    description:
      "React liquid-metal metaballs shaded per pixel with a chrome reflection: they bulge, pool and merge, in joined, apart or orbit modes. Tailwind CSS + TypeScript.",
  },
  "layout-switch": {
    title: "React Photo Gallery Layout Switch: Grid, Row, Feature, Pile",
    description:
      "React photo set that glides between grid, row, feature and pile layouts on springs; click one to fill the frame, Escape to return. Tailwind CSS + TypeScript.",
  },
  "receipt-unfold": {
    title: "React Invoice Animation: Folded Receipt That Unfolds",
    description:
      "React Get invoice button: a folded slip rises, unfolds panel by panel on 3D hinges, and the total gets circled by hand. Tailwind CSS + TypeScript.",
  },
  "page-curl": {
    title: "React Page Curl Effect: Peel Back a Corner",
    description:
      "React page curl: grab a corner and peel it back; the fold is computed live from the pointer and reveals what sits underneath. Tailwind CSS + TypeScript.",
  },
  "sign-and-seal": {
    title: "React Signature Pad: Sign a Card, Sealed Under Plastic",
    description:
      "React signature pad on a membership card: sign with the pointer on canvas, pause, and a clear plastic sleeve slides down. Tailwind CSS + TypeScript.",
  },
  "streak-counter": {
    title: "React Streak Counter: Daily Streak with Flame and Week Strip",
    description:
      "React streak counter: log a day and the number rolls up, the week strip slides, and the flame bursts into embers. Tailwind CSS + TypeScript.",
  },
  "glass-bubbles": {
    title: "React Hanging Glass Bubbles: Swinging Icon Orbs",
    description:
      "React glass orbs hung on threads: sweep the pointer through and they swing, collide and spin their icons before settling. Tailwind CSS + TypeScript.",
  },
  "box-spill": {
    title: "React Physics Box: Open It and the Contents Spill Out",
    description:
      "React cardboard box on canvas: open it and flaps spring back as contents burst out, bounce and pile up; pack up to fly home. Tailwind CSS + TypeScript.",
  },
  "curved-reel": {
    title: "React Curved Poster Carousel: Endless Bent Reel",
    description:
      "React endless reel of posters bent around a curve: centre cards pinch back, edges swing forward. It drifts, and you can drag or fling. Tailwind CSS + TypeScript.",
  },
  "crumple-to-trash": {
    title: "React Delete Animation: Crumple Page into Trash Bin",
    description:
      "React move-to-trash animation: the page scrunches into a ball, arcs into a bin whose lid flips, and Undo throws it back flat. Tailwind CSS + TypeScript.",
  },
  "tape-shelf": {
    title: "React Cassette Shelf: 3D Tape Collection Browser",
    description:
      "React cassette cases spine-out on a tilted 3D shelf: hover slides one up, picking one swings it round with reels turning. Tailwind CSS + TypeScript.",
  },
  "packet-router": {
    title: "React LLM Router Diagram: Cost, Balanced, Quality Traffic",
    description:
      "React diagram of requests flowing from a router to four AI models; switch Cost, Balanced or Quality and the traffic re-balances. Tailwind CSS + TypeScript.",
  },
  "stamp-swirl": {
    title: "React Postage Stamps with Swirling Artwork on Hover",
    description:
      "React perforated postage stamps whose artwork swirls like wet ink; hover or focus lifts one out and slides in its name and year. Tailwind CSS + TypeScript.",
  },
  "bubble-cluster": {
    title: "React Bubble Cluster: Contacts Sized by Closeness",
    description:
      "React contacts packed into a cluster of soft bubbles sized by closeness; switch groups and everyone springs to new sizes. Tailwind CSS + TypeScript.",
  },
  "sticker-toss": {
    title: "React Draggable Logo Sticker: Peel Off and Throw",
    description:
      "React round logo sticker you peel off a header and throw: it stretches in flight, its ring of text spins, and it springs back. Tailwind CSS + TypeScript.",
  },
  "context-meter": {
    title: "React AI Context Window Meter: Token Dot Grid",
    description:
      "React context-window token meter drawn as a 40 by 5 dot grid; hover a category to light its dots, and Compact chat frees space. Tailwind CSS + TypeScript.",
  },
  "mood-wheel": {
    title: "React Mood Picker: Draggable Emotion Wheel",
    description:
      "React mood wheel: drag, scroll or arrow through feelings on the rim, and the chosen word fills the sentence while the orb recolours. Tailwind CSS + TypeScript.",
  },
  "swipe-stack": {
    title: "React Swipe Cards: Approve or Flag Payments Stack",
    description:
      "React swipe card stack for reviewing payments: drag right to approve, left to flag, with a tilt, a stamp and the next card rising. Tailwind CSS + TypeScript.",
  },
  "matrix-loaders": {
    title: "React Dot Matrix Loaders: Wave, Ripple, Spiral and Rain",
    description:
      "React six 5 by 5 dot-matrix loaders on one shared pulse: only each dot's phase changes, giving wave, ripple, spiral, rain, sweep. Tailwind CSS + TypeScript.",
  },
  "todo-tower": {
    title: "React To-Do List Animation: Tasks Stacked Like Bricks",
    description:
      "React to-do list stacked like bricks: tick or drag a task out and the pile drops with a bounce; overhanging bricks tip off. Tailwind CSS + TypeScript.",
  },
  "peek-login": {
    title: "React Login Form with Peeking Mascot That Follows Cursor",
    description:
      "React sign-in card with a little face whose eyes follow the pointer and your email, covers its eyes for passwords and peeks. Tailwind CSS + TypeScript.",
  },
  "heat-field": {
    title: "React Heat Map Cursor Effect: Dots Melt Under Pointer",
    description:
      "React field of grey dots that melts into a heat map under the cursor, yellow through red to violet; hold to leave cooling heat. Tailwind CSS + TypeScript.",
  },
  "particle-mark": {
    title: "React Particle Logo: Dots Scatter from the Cursor",
    description:
      "React word drawn as hundreds of dots that scatter from the pointer and spring home, warming to the accent colour; click for a shockwave. Tailwind CSS + TypeScript.",
  },
  "generate-image": {
    title: "React AI Image Generation UI: Noise-to-Image Reveal",
    description:
      "React image generation card: the picture arrives coarse to fine as noise eases off, under glass with a denoising counter. Tailwind CSS + TypeScript.",
  },
  "magnet-select": {
    title: "React Status Picker with Liquid Orb Selection",
    description:
      "React status picker where the selection is a liquid orb: a bead reaches for the option you point at and slides over with a tail. Tailwind CSS + TypeScript.",
  },
  "hop-labels": {
    title: "React Floating Label Input: Label Hops into the Border",
    description:
      "React outlined text fields with a floating label that hops along its letters into the border on focus, parting the outline. Tailwind CSS + TypeScript.",
  },
  "pull-to-refresh": {
    title: "React Pull to Refresh: Rubber-Band Balance Card",
    description:
      "React pull-to-refresh balance card: it rubber-bands while a ring draws itself, closes past the line, spins, then springs back. Tailwind CSS + TypeScript.",
  },
  "runaway-button": {
    title: "React Cancel Subscription Dialog with Runaway Button",
    description:
      "React cancel-subscription dialog whose cancel button slips away from the pointer, then gives up after a few tries. Tailwind CSS + TypeScript.",
  },
  "fold-note": {
    title: "React Folding Card: Credit Note That Folds in 3D",
    description:
      "React printed credit note you fold on its centre crease: drag the right half over in 3D, and past halfway it snaps shut. Tailwind CSS + TypeScript.",
  },
  "assign-picker": {
    title: "React Assignee Picker: Multi-Select with Flying Avatars",
    description:
      "React assignee pill with a multi-select menu: ticked people's avatars fly into the pill, which stacks them with a count. Tailwind CSS + TypeScript.",
  },
  "bend-text": {
    title: "React Text on a String: Pull and Twang Bending Text",
    description:
      "React line of type on a string you can grab and pull; let go and an underdamped spring twangs it back flat. Tailwind CSS + TypeScript.",
  },
  "pressure-text": {
    title: "React Variable Font Hover Effect: Pressure Text",
    description:
      "React headline that bulges where you hover: letters near the pointer swell on a variable font's weight axis and take the accent. Tailwind CSS + TypeScript.",
  },
  "liquid-gauge": {
    title: "React Storage Meter: Liquid Gauge in a Glass Orb",
    description:
      "React storage meter as liquid in a glass orb with two rolling waves, rising bubbles and a surface that leans toward the pointer. Tailwind CSS + TypeScript.",
  },
  "thermo-dial": {
    title: "React Thermostat Dial: Draggable Temperature Ring",
    description:
      "React thermostat ring you drag or step with arrow keys: ticks light to the set point, glow shifts cool to warm, number rolls. Tailwind CSS + TypeScript.",
  },
  "pull-cord": {
    title: "React Light Switch: Pull Cord with Rope Physics",
    description:
      "React light switch on a cord: grab the bead of a small verlet rope, pull past the slack and let go to toggle the light. Tailwind CSS + TypeScript.",
  },
  "scratch-reveal": {
    title: "React Scratch Card: Scratch Off Foil to Reveal Prize",
    description:
      "React scratch card: rub silver foil away, shedding dust, and once enough is gone the rest lifts off with a confetti burst. Tailwind CSS + TypeScript.",
  },
  "polaroid-develop": {
    title: "React Polaroid Effect: Shake an Instant Photo to Develop",
    description:
      "React instant photo you drag and shake to develop: the faster it moves, the quicker the haze clears and colour comes through. Tailwind CSS + TypeScript.",
  },
  "wallet-stack": {
    title: "React Wallet Card Stack: Payment Cards in a Leather Wallet",
    description:
      "React payment cards in a wallet, each peeking higher than the last; pick one to slide out, then flip it over in 3D. Tailwind CSS + TypeScript.",
  },
  "traffic-bars": {
    title: "React Stacked Bar Chart: Traffic by Source with Tooltip",
    description:
      "React stacked bar chart of daily visits by source: the hovered column is ringed, others dim, and Day to Week flies slices. Tailwind CSS + TypeScript.",
  },
  "stock-line": {
    title: "React Stock Price Chart: Scrubbable Line with Rolling Price",
    description:
      "React trading-style price chart: scrub along the line, a dot rides it, the price rolls, and range changes morph the line. Tailwind CSS + TypeScript.",
  },
  "pulse-monitor": {
    title: "React Heart Rate Card: Bedside ECG Monitor Trace",
    description:
      "React heart-rate card with a sweeping ECG trace, a heart that beats on each spike and 24 hourly range bars you can scrub. Tailwind CSS + TypeScript.",
  },
  "spend-donut": {
    title: "React Budget Donut Chart: Slice Slides Out on Hover",
    description:
      "React monthly budget donut: the slice you point at slides out and thickens while the centre rolls to its amount. Tailwind CSS + TypeScript.",
  },
  "usage-stack": {
    title: "React Usage-Based Pricing: Request Blocks Drop in a Bin",
    description:
      "React usage pricing you can see: every 10,000 requests is a block dropping into a bin, coloured by tier as you slide volume. Tailwind CSS + TypeScript.",
  },
  "cloth-banner": {
    title: "React Announcement Banner: Cloth Pinned to a Rail",
    description:
      "React announcement printed on cloth and pinned by five pins: it sways, drapes under your hand, and drops if yanked hard. Tailwind CSS + TypeScript.",
  },
  "ferrofluid-record": {
    title: "React Record Button: Ferrofluid Drop with Spikes",
    description:
      "React record button drawn as ferrofluid on canvas: it grows spikes toward the cursor and bristles with a simulated voice. Tailwind CSS + TypeScript.",
  },
  "sand-timer": {
    title: "React Hourglass Timer: Canvas Sand Simulation",
    description:
      "React session timer as a real hourglass: every grain is simulated on canvas, funneling through at the rate the time runs out. Tailwind CSS + TypeScript.",
  },
  "zipper-reveal": {
    title: "React Zipper Reveal: Unzip a Pouch to Show a Code",
    description:
      "React fabric pouch you unzip to reveal an invite code: teeth part in a V above the slider and the pull tab swings. Tailwind CSS + TypeScript.",
  },
  "slingshot-send": {
    title: "React Chat Composer: Slingshot Send Button",
    description:
      "React chat composer with a slingshot send button: pull the stone back, let go, and the message arcs into the thread. Tailwind CSS + TypeScript.",
  },
  "domino-select": {
    title: "React Select All Checkbox: Rows Topple Like Dominoes",
    description:
      "React mail list where select-all topples the rows like dominoes, each tipping onto the next, then springing up ticked. Tailwind CSS + TypeScript.",
  },
  "lenticular-pass": {
    title: "React Lenticular Effect: Day and Night Event Pass",
    description:
      "React event pass printed lenticular: tilt it with the pointer and the day pass turns into night, strip by strip, with light. Tailwind CSS + TypeScript.",
  },
  "origami-pricing": {
    title: "React Pricing Card Folded Like Paper: Origami Animation",
    description:
      "React pricing card folded like a paper map: tap and it opens in two folds, features first, then quote and call to action. Tailwind CSS + TypeScript.",
  },
  "empty-projects": {
    title: "React Empty State: Projects Screen with Template Stack",
    description:
      "React empty projects screen with three starter templates that fan out on hover; picking one flies it in as your first project. Tailwind CSS + TypeScript.",
  },
  "no-results": {
    title: "React No Results State That Fixes the Search in One Tap",
    description:
      "React no-results state that explains why nothing matched and fixes it: the missing letter slides in and filter chips peel away. Tailwind CSS + TypeScript.",
  },
  "empty-chart": {
    title: "React Empty Chart State: Dashed Line Becomes Real Data",
    description:
      "React empty chart as a breathing dashed line; connect a source and it bends into real numbers while the area fills. Tailwind CSS + TypeScript.",
  },
  "empty-team": {
    title: "React Empty Team State: Invite Teammates to Seats",
    description:
      "React empty team page with dotted seats and an invite field: type an email and the avatar lifts into the next free seat. Tailwind CSS + TypeScript.",
  },
  "streaming-answer": {
    title: "React AI Answer Card: Thinking Steps, Sources, Streaming",
    description:
      "React AI answer card: thinking steps tick off and fold to a summary, sources slide in, the answer streams word by word. Tailwind CSS + TypeScript.",
  },
  "diff-review": {
    title: "React AI Edit Diff Review: Accept or Reject Changes",
    description:
      "React inline review of AI edits: removals struck red, additions green; Accept all, Reject all, or click a single change. Tailwind CSS + TypeScript.",
  },
  "agent-run": {
    title: "React AI Agent Run UI: Live Steps, Clock and Stop",
    description:
      "React live view of an AI agent: each step shows what it is doing and folds to a tick, with a running clock and a Stop button. Tailwind CSS + TypeScript.",
  },
  "ghost-autocomplete": {
    title: "React AI Autocomplete: Ghost Text Suggestion Input",
    description:
      "React inline AI autocomplete: a grey suggestion fades in after the cursor when you pause, and Tab inks it in left to right. Tailwind CSS + TypeScript.",
  },
  "morphing-dialog": {
    title: "React Morphing Dialog: Modal That Grows from Its Button",
    description:
      "React dialogs that grow out of the button that opened them and shrink back on close; Share opens a link, Delete asks for a name. Tailwind CSS + TypeScript.",
  },
  "sound-mark": {
    title: "React Water Ripple Logo Effect: Standing Wave Mark",
    description:
      "React brand mark under water with a vibrating rod: a standing ripple bends the mark like light; hold to turn it up, tap to ripple. Tailwind CSS + TypeScript.",
  },
  "ripple-now-playing": {
    title: "React Music Player Card: Album Art Under Water",
    description:
      "React player card whose cover sits under water: every beat drops a ring through the artwork, and pausing stills the water. Tailwind CSS + TypeScript.",
  },
  "chladni-upload": {
    title: "React Upload Progress: Chladni Plate Sand Pattern",
    description:
      "React upload progress made of sand on a vibrating plate: each stage plays a higher note and the sand settles into a new pattern. Tailwind CSS + TypeScript.",
  },
  "tank-recorder": {
    title: "React Voice Memo Button: Glass Water Tank Waves",
    description:
      "React voice memo button over a glass tank: while you hold to record, your voice shakes a pin and real waves bounce off the glass. Tailwind CSS + TypeScript.",
  },
  "frost-input": {
    title: "React Frost Input: Sign-Up Field That Freezes",
    description:
      "React sign-up field that freezes: frost crystals grow across the glass on focus, each key cracks the ice, and sending shatters it. Tailwind CSS + TypeScript.",
  },
  "black-hole-delete": {
    title: "React Delete Animation: Black Hole Swallows the Message",
    description:
      "React inbox delete: swipe or close a message and a black hole opens, the list bends around it like a lens, and it is stretched in. Tailwind CSS + TypeScript.",
  },
  "portal-card": {
    title: "React Portal Card: Draw a Circle to Open a Portal",
    description:
      "React dark card where holding and drawing a circle tears open a ring of molten sparks, showing another world through it. Tailwind CSS + TypeScript.",
  },
  "particle-reveal": {
    title: "React Particle Text Reveal: Headline Made of Dots",
    description:
      "React headline of thousands of dots that gather out of a scatter on springs; the cursor pushes and combs them into streaks. Tailwind CSS + TypeScript.",
  },
  "morphing-text": {
    title: "React Morphing Text: Words That Melt into the Next",
    description:
      "React keyword that melts into the next: two blurred copies meet under an SVG alpha threshold so letters flow into new letters. Tailwind CSS + TypeScript.",
  },
  "code-snippet": {
    title: "React Code Block Component: Copy Button and Highlighting",
    description:
      "React code block with a macOS-style header, a switchable language label, a Copy button that morphs to a tick, and token highlighting. Tailwind CSS + TypeScript.",
  },
  "workflow-network": {
    title: "React Workflow Diagram: Trigger Fanning Out on Wires",
    description:
      "React workflow diagram: one trigger fans out along curved wires on a dotted canvas, light filling each wire to its target. Tailwind CSS + TypeScript.",
  },
  "testimonial-wall": {
    title: "React Testimonial Wall: Endless Reviews in Drifting Columns",
    description:
      "React wall of reviews in columns that drift in opposite directions; cards swell at the middle and recede toward the edges. Tailwind CSS + TypeScript.",
  },
  "tethered-submit": {
    title: "React Sign-Up Button That Shows What Is Still Missing",
    description:
      "React sign-up button that explains why it is not ready: a hairline draws to the first field that needs something, with a hint. Tailwind CSS + TypeScript.",
  },
  "dependent-form": {
    title: "React Conditional Form Fields: Billing Form That Adapts",
    description:
      "React billing form whose fields follow your answers: choose Business and company fields unfold along a line showing the link. Tailwind CSS + TypeScript.",
  },
  "glass-edit": {
    title: "React Inline Edit: Click Text to Edit on a Glass Pane",
    description:
      "React inline editing: point at text and it sinks into a recess, click and it lifts onto glass while the card steps back. Tailwind CSS + TypeScript.",
  },
  "live-summary": {
    title: "React Booking Form with a Live Receipt Summary",
    description:
      "React booking form that writes its own receipt: each choice flies a line to the summary, and only changed digits roll. Tailwind CSS + TypeScript.",
  },
  "scoped-search": {
    title: "React Search Filters: Type from:anna and Get a Chip",
    description:
      "React search field that understands filters: type from:anna or is:unread and the words lift out of the text into a chip. Tailwind CSS + TypeScript.",
  },
  "ink-autosave": {
    title: "React Autosave Indicator: Saved Text Dries Like Ink",
    description:
      "React note that shows save state as ink: saved text is dry black, new text is wet blue, and pausing dries it left to right. Tailwind CSS + TypeScript.",
  },
  "sort-stack": {
    title: "React Sortable Table: Rows Slide Like a Stack of Cards",
    description:
      "React table that sorts like a stack of cards: press a column and rows lift apart, slide to new places, then close back up. Tailwind CSS + TypeScript.",
  },
  "reading-spine": {
    title: "React Reading Progress Bar: Section Ticks and Scrubber",
    description:
      "React article scroll bar: a slim rail with a tick per section and a capsule for your place, with a glass label as you scrub. Tailwind CSS + TypeScript.",
  },
  "pluck-frame": {
    title: "React Elastic Frame: Pluckable Border String",
    description:
      "React rounded frame drawn as one elastic string: the pointer catches an edge, stretches it out, and it slips off and rings. Tailwind CSS + TypeScript.",
  },
  "ai-composer": {
    title: "React AI Prompt Box: Growing Composer with Model Picker",
    description:
      "React AI prompt box that grows as you type, cycles suggestions when empty, lets you pick a model and attach photos from a menu. Tailwind CSS + TypeScript.",
  },
  "glass-drop": {
    title: "React Logo Intro Animation: Liquid Glass Droplet",
    description:
      "React logo intro in liquid glass: a droplet lands as a bubble that magnifies the logo, swells into a glass tile, then clears. Tailwind CSS + TypeScript.",
  },
  "lightfall": {
    title: "React WebGL Background: Lanes of Light Falling Down a Wall",
    description:
      "React WebGL background: lanes of light pour down a wall and across a glossy floor, with pulses streaking along every lane. Tailwind CSS + TypeScript.",
  },
  "global-deploy": {
    title: "React Deploy Map: Regions Lighting Up on a World Map",
    description:
      "React deploy map on real coastlines: press Deploy or click to ship from the nearest region, glowing arcs spread region to region. Tailwind CSS + TypeScript.",
  },
  "card-reader-verify": {
    title: "React ID Verification UI: Drag a Card into a Reader",
    description:
      "React ID check: drag the card into the reader, the strip sweeps, checks run, and it springs out with a Verified stamp. Tailwind CSS + TypeScript.",
  },
  "intelligence-glow": {
    title: "React AI Glow Effect: Hold to Summon the Assistant",
    description:
      "React press-and-hold assistant: light ripples from your finger around a phone edge, a Writing Tools panel rises, the draft rewrites. Tailwind CSS + TypeScript.",
  },
  "cloud-sync": {
    title: "React Backup Button: Glass Cloud That Swallows Apps",
    description:
      "React backup button shaped like a glass cloud: apps leave orbit and sink in, the cloud wobbles, and coloured light rises inside. Tailwind CSS + TypeScript.",
  },
  "smart-light": {
    title: "React Smart Light Control: Dim and Colour Temperature",
    description:
      "React light control with a real room behind it: drag to dim the pendant, slide amber to cool white, or tap a scene. Tailwind CSS + TypeScript.",
  },
  "storage-clean": {
    title: "React Storage Cleanup UI: Bar Crumbles into the Trash",
    description:
      "React storage panel: press a recommendation and that slice of the bar crumbles into particles into the trash, with Undo. Tailwind CSS + TypeScript.",
  },
  "ring-gallery": {
    title: "React 3D Ring Gallery: Photos Like Turbine Leaves",
    description:
      "React ring of photos standing on edge like turbine leaves: scroll, swipe or drag to spin and settle, with a tilting camera. Tailwind CSS + TypeScript.",
  },
  "liquid-send": {
    title: "React Message Box with Liquid Metal Send Button",
    description:
      "React message box whose send button is ringed in liquid chrome drawn by a WebGL shader, with stripes of drifting light. Tailwind CSS + TypeScript.",
  },
  "folder-tree": {
    title: "React File Tree: Finder-Style Folder Tree Animation",
    description:
      "React project tree like the Finder sidebar: opening a folder pours its files out on springs, closing draws them back in. Tailwind CSS + TypeScript.",
  },
  "add-to-bag": {
    title: "React Add to Cart Animation: Product Flies into the Bag",
    description:
      "React add-to-cart moment: the product lifts off and arcs into the bag, which squashes on landing as the badge rolls up. Tailwind CSS + TypeScript.",
  },
  "molten-hold": {
    title: "React Hold to Confirm: Pour Molten Metal Button",
    description:
      "React hold-to-confirm where molten metal pours along a channel with a glowing meniscus that shivers as it runs. Tailwind CSS + TypeScript.",
  },
  "liquid-smoke": {
    title: "React Smoke Cursor Effect: GPU Fluid Simulation",
    description:
      "React fluid you stir with the pointer, solved on the GPU: smoke pours from the cursor, curls into eddies and fades. Tailwind CSS + TypeScript.",
  },
  "frozen-card": {
    title: "React Freeze Card UI: Banking Card with Frost Effect",
    description:
      "React banking card screen where you can freeze your debit card: it tilts toward the pointer with a glare and holographic sheen. Tailwind CSS + TypeScript.",
  },
  "seat-crowd": {
    title: "React Pricing Seat Picker: A Crowd of Little People",
    description:
      "React seat picker for pricing: drag or fling the ruler and your team appears on stage, each person hopping in on an arc. Tailwind CSS + TypeScript.",
  },
  "flap-clock": {
    title: "React Split-Flap World Clock for Teams",
    description:
      "React team world clock on a split-flap board: each row is a city with local time on flaps and whether they are asleep or working. Tailwind CSS + TypeScript.",
  },
  "image-press": {
    title: "React Image Compressor UI: A Toy Press That Shrinks Photos",
    description:
      "React image compressor: drop a photo on the press, turn the dial to Tiny or Balanced, and it really shrinks it before upload. Tailwind CSS + TypeScript.",
  },
  "jelly-splitter": {
    title: "React Bill Splitter: Chop a Slab of Jelly into Shares",
    description:
      "React bill splitter where the bill is glossy jelly on a plate: a cleaver follows you, click to chop and split the pieces. Tailwind CSS + TypeScript.",
  },
  "forecast-status": {
    title: "React App Review Status Card Shown as Weather",
    description:
      "React app-review status card shown as weather: lilac sky while waiting, clouds and rain in review, the sun out when approved. Tailwind CSS + TypeScript.",
  },
  "paperclip-attach": {
    title: "React Message Composer with Paperclip File Attach",
    description:
      "React message composer that clips attachments with a real paperclip: the file flies in and slides under the wire. Tailwind CSS + TypeScript.",
  },
  "aquarium-prompt": {
    title: "React AI Prompt Box in a Pixel-Art Aquarium",
    description:
      "React AI prompt box floating in a pixel-art aquarium, with a shoal of pixel fish schooling behind the frosted glass. Tailwind CSS + TypeScript.",
  },
  "elemental-picker": {
    title: "React Mode Picker: Capsules That Burn, Glow and Freeze",
    description:
      "React mode capsules where the chosen one comes alive: choose Ember and flames lick up its sides with flying embers and smoke. Tailwind CSS + TypeScript.",
  },
  "oracle-orb": {
    title: "React AI Answer Orb: Crystal Ball with Liquid Nebula",
    description:
      "React crystal ball for AI answers: a glass sphere holds a drifting nebula of violet, pink and amber with stars caught inside. Tailwind CSS + TypeScript.",
  },
  "clock-picker": {
    title: "React Time Picker: Drag the Hands of a Real Clock Face",
    description:
      "React time picker on a clock face: drag either hand on a spring, the hour hand creeps as the minute hand moves. Tailwind CSS + TypeScript.",
  },
  "bloom-gift-card": {
    title: "React Gift Card Animation: Flower Blooms to Show Amount",
    description:
      "React gift card with a flower bud: tilt it, press and hold to open, and the bud blooms in 3D to show the amount. Tailwind CSS + TypeScript.",
  },
  "piano-text": {
    title: "React Interactive Text: Play Words Like Piano Keys",
    description:
      "React words you can play: every letter is a key on a scale, and gliding the pointer across plays each note as the letter dances. Tailwind CSS + TypeScript.",
  },
  "highlight-popover": {
    title: "React Text Selection Toolbar: Highlight Popover",
    description:
      "React text selection toolbar: select text in an article and a dark pill rises from it like a drop of ink. Tailwind CSS + TypeScript.",
  },
  "pixel-atlas": {
    title: "React Pixel World Map: Live Activity Heat in Glowing Pixels",
    description:
      "React live map drawn in glowing pixels: every place warms the land around it, from slate through violet and magenta to cream. Tailwind CSS + TypeScript.",
  },
  "glass-recorder": {
    title: "React Voice Button for AI Apps: Liquid Glass Recorder",
    description:
      "React voice button of liquid glass that bends the light behind it: the drop swells toward the pointer like liquid to a finger. Tailwind CSS + TypeScript.",
  },
  "murmur": {
    title: "React AI Landing Screen: Swallows Over a Field of Type",
    description:
      "React landing screen for a writing assistant: four swallows fly around the prompt over a sky drawn live as a field of type. Tailwind CSS + TypeScript.",
  },
  "loupe-lens": {
    title: "React Glass Lens: WebGL Loupe over Printed Objects",
    description:
      "React glass ball you drag across a table of tiny printed things: a fragment shader magnifies and refracts the rim like real glass. Tailwind CSS + TypeScript.",
  },
  "face-scan-morph": {
    title: "React Face Scan Animation: Pay with Your Face Morph",
    description:
      "React pay-with-your-face confirmation: tap and the scan corners curl into a spinning ring while the face glances and blinks. Tailwind CSS + TypeScript.",
  },
  "home-scenes": {
    title: "React Smart Home Scenes Card: Tap to Run a Scene",
    description:
      "A home dashboard where every change arrives as a wave of light. Framer Motion + Tailwind CSS.",
  },
  "action-stack": {
    title: "React Floating Action Menu: A Stack of Actions",
    description:
      "A plus button that opens into a short list of actions. Framer Motion + Tailwind CSS.",
  },
  "address-field": {
    title: "React Recipient Address Field with Handle Lookup",
    description:
      "A recipient field that checks what you type. Framer Motion + Tailwind CSS.",
  },
  "withdrawal-sheet": {
    title: "React Withdrawal Status Sheet with Details",
    description:
      "A withdrawal receipt that tells you where the money is. Framer Motion + Tailwind CSS.",
  },
  "coin-focus": {
    title: "React Crypto Holdings List: Tap a Coin to Focus",
    description:
      "A coin list where tapping a holding gives it the room. Framer Motion + Tailwind CSS.",
  },
  "notch-send": {
    title: "React Send Email Animation: Out Through the Notch",
    description:
      "Sending an email that leaves through the notch. Framer Motion + Tailwind CSS.",
  },
  "row-editor": {
    title: "React Editable Table Rows: Pencil to Edit Inline",
    description:
      "A table you edit in place. Framer Motion + Tailwind CSS.",
  },
  "status-picker": {
    title: "React Presence Status Picker on an Avatar",
    description:
      "A presence dot that opens into its own picker. Framer Motion + Tailwind CSS.",
  },
  "invite-reveal": {
    title: "React Invite Code Reveal Button with Copy",
    description:
      "An invite code that arrives like a ticket. Framer Motion + Tailwind CSS.",
  },
  "days-slider": {
    title: "React Days Slider: A Capsule You Drag",
    description:
      "A slider whose fill carries its own value. Framer Motion + Tailwind CSS.",
  },
  "fold-balance": {
    title: "React Balance Card with a Fold-Down Corner",
    description:
      "Fold the corner to hide your balance. Framer Motion + Tailwind CSS.",
  },
  "card-wear": {
    title: "React Credit Card That Wears with Time",
    description:
      "A card that wears the way a real one does. Framer Motion + Tailwind CSS.",
  },
  "time-chips": {
    title: "React Chat Time Zone Chips: Show Times in Yours",
    description:
      "A chat that reads times in your zone. Framer Motion + Tailwind CSS.",
  },
  "income-stream": {
    title: "React Income Stream Chart with Hover Scrub",
    description:
      "Income drawn as a stream. Framer Motion + Tailwind CSS.",
  },
  "race-bars": {
    title: "React Bar Chart Race with a Timeline",
    description:
      "Holdings, racing through the years. Framer Motion + Tailwind CSS.",
  },
  "persona-reminder": {
    title: "React Reminder Card with Voice Personas",
    description:
      "A reminder that sounds like someone. Framer Motion + Tailwind CSS.",
  },
  "private-send": {
    title: "React Send Privately Toggle for Payments",
    description:
      "Sending with a one-time address. Framer Motion + Tailwind CSS.",
  },
  "dust-delete": {
    title: "React Delete Photo Animation: Turn It to Dust",
    description:
      "Deleting a photo by turning it to dust. Framer Motion + Tailwind CSS.",
  },
  "wave-confirm": {
    title: "React Send Button That Waves to Confirm",
    description:
      "A payment confirmation that ripples when it goes through. Framer Motion + Tailwind CSS.",
  },
  "balance-matrix": {
    title: "React Balance Dot Matrix with Money In and Out",
    description:
      "A balance drawn as a field of dots on frosted glass, one column per day lit as high as the balance stood. Framer Motion + Tailwind CSS.",
  },
  "focus-mode": {
    title: "React Focus Mode Switch That Clears Notifications",
    description:
      "A focus switch that gathers your notifications. Framer Motion + Tailwind CSS.",
  },
  "target-bars": {
    title: "React Bar Chart with a Target Line and Ranges",
    description:
      "A sales chart of glass boxes. Framer Motion + Tailwind CSS.",
  },
  "spend-strip": {
    title: "React Monthly Spend Strip by Category",
    description:
      "A quiet month of spending: one soft grey bar per day under the total and a thin budget line. Framer Motion + Tailwind CSS.",
  },
  "stack-reel": {
    title: "React Scrolling Card Reel: A Stack You Roll",
    description:
      "A reel of health cards. The middle one is open with its details; the rest fold to slim pills that fade towards the edges. Framer Motion + Tailwind CSS.",
  },
  "folder-path": {
    title: "React Folder Browser with a Path Bar",
    description:
      "A folder browser that moves like a stack of pages. Framer Motion + Tailwind CSS.",
  },
  "widget-morph": {
    title: "React Widget That Morphs Between Tabs",
    description:
      "A wide widget card that turns into four. Framer Motion + Tailwind CSS.",
  },
  "folder-upload": {
    title: "React Folder Upload with Per-File Progress",
    description:
      "An upload card built around a glass folder. Framer Motion + Tailwind CSS.",
  },
  "charge-menu": {
    title: "React Battery Menu with a Plug-and-Unplug Cell",
    description:
      "A battery menu with the charge as a glass cell lying on its side, the liquid inside glowing green. Framer Motion + Tailwind CSS.",
  },
  "focus-board": {
    title: "React Focus Dashboard: Sleep, Sound and Plans",
    description:
      "A quiet dark dashboard. Switch the range and the energy bars regrow; point at one and the big number rolls to it. Framer Motion + Tailwind CSS.",
  },
  "cover-planner": {
    title: "React Shift Cover Planner with Approvals",
    description:
      "Approving time off without leaving the team short. Each day is a column of dots, one per person on shift, with the minimum marked. Framer Motion + Tailwind CSS.",
  },
  "wave-trimmer": {
    title: "React Audio Trimmer with a Waveform",
    description:
      "A trimmer for a clip of real synthesised music. Framer Motion + Tailwind CSS.",
  },
};
