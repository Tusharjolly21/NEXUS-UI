/**
 * Search-facing <title>/<meta description> overrides for component pages.
 * The catalog `name`/`description` stay as the on-page copy; these target the phrases
 * Search Console shows people actually typing (pages ranking ~5–30 with no clicks yet).
 */
export const COMPONENT_SEO: Record<string, { title: string; description: string }> = {
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
    title: "Draggable Cards UI — React Card Stack",
    description:
      "Draggable card stack for React: drag or fling the top card to send it to the back of a tilted deck. Supports video cards. Tailwind CSS + Framer Motion.",
  },
  "orbital-loader": {
    title: "Orb Loader — React Loading Animation",
    description:
      "Orb loader for React: glowing dots circle counter-rotating rings while status messages cycle below, with optional progress. Tailwind CSS + Framer Motion.",
  },
  "chat-messages": {
    title: "React Chat Message UI with Typing Animation",
    description:
      "Animated React chat message UI: bubbles appear one by one after a typing indicator, made for AI assistant demos. Built with Tailwind CSS and Framer Motion.",
  },
  "animated-countdown": {
    title: "Animated Countdown Timer for React",
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
    title: "React Circular Carousel Component",
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
    title: "React Phone Input with Country Code Picker",
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
};
