export type ComponentDescription = {
  about: string;
  useCases: string[];
};

export const componentDescriptions: Record<string, ComponentDescription> = {
  "cinematic-logo-cloud": {
    about:
      "The Cinematic Logo Cloud renders client logos in a staggered blur-fade entrance animation built with Framer Motion, with three variants — responsive grid, infinite horizontal marquee, and named marquee — covering every social proof layout. Each logo fades in sequentially, creating a choreographed reveal that frames your customer list as polished rather than functional. Compatible with Next.js App Router and dark mode via CSS custom properties, it ships with 11 pre-mapped brand logos and accepts any custom image or text-only entry. Drop it directly below the hero section to establish credibility before visitors reach the feature section.",
    useCases: [
      "Social proof strips below the hero",
      "Partnership and integration pages",
      "Trusted-by sections on pricing pages",
      "Investor and advisor brand walls",
    ],
  },
  "phone-input": {
    about:
      "The Phone Input component is an animated international phone number field with a searchable country selector, flag icons, and libphonenumber-style validation feedback. The dropdown opens with a Framer Motion spring animation and filters country codes as the user types, reducing friction for international forms. Built for Next.js App Router with full keyboard navigation and TypeScript prop types. Drop it into any signup form, checkout flow, or contact page that requires validated phone collection.",
    useCases: [
      "Signup and registration forms",
      "Checkout and payment pages",
      "Contact and callback request forms",
      "Onboarding flows requiring phone verification",
    ],
  },
  "hero-aurora-spotlight": {
    about:
      "The Aurora Hero Spotlight is a cursor-reactive spotlight layered over a flowing aurora gradient background. The spotlight tracks the cursor position using Framer Motion spring physics, creating a depth effect that responds to user interaction in real time. The aurora layer uses stacked CSS radial gradients with blur and animation to simulate shifting northern lights — a visual language that reads as technical and premium. Best for AI products, developer tools, and SaaS launch pages where the first impression needs to communicate sophistication.",
    useCases: [
      "AI product launch heroes",
      "SaaS landing page heroes",
      "Developer tool homepages",
      "Premium product launch pages",
    ],
  },
  "bento-signal-grid": {
    about:
      "The Signal Bento Grid renders animated bento tiles with breathing gradient backgrounds tuned for product metric and capability displays. Each tile has an independently animated gradient that shifts slowly, creating a living dashboard feel without per-frame JavaScript. Tiles animate into view on scroll using Framer Motion whileInView with staggered delays. The responsive CSS grid layout adapts from single-column on mobile to a multi-column bento arrangement on desktop, and each tile accepts custom content, icons, and labels.",
    useCases: [
      "Product capability showcases",
      "Platform feature sections",
      "Dashboard and metrics preview sections",
      "SaaS landing page feature grids",
    ],
  },
  "nebula-glass-card": {
    about:
      "The Nebula Glass Card is a 3D tilt card with spring physics and luminous edge lighting that responds to cursor position. As the mouse moves across the card, Framer Motion spring transitions rotate it in three dimensions, revealing depth through layered glass surfaces. The border glow tracks cursor proximity using a radial gradient that repositions as the cursor moves, creating a living edge highlight effect. Use it for pricing cards, feature callouts, or team profiles where high-end interactivity signals product polish.",
    useCases: [
      "Pricing plan cards",
      "Feature highlight panels",
      "Team member and advisor profiles",
      "Product showcase cards",
    ],
  },
  "float-glass-navbar": {
    about:
      "The Float Glass Navbar is a glass-morphism navigation bar that floats above page content with backdrop blur, creating a layered depth effect over any background. It animates into position with a Framer Motion spring entrance on mount, and navigation links have spring hover transitions. The CTA button is visually differentiated from navigation links to maintain hierarchy. Compatible with Next.js App Router, dark mode via CSS custom properties, and full keyboard navigation for accessibility.",
    useCases: [
      "SaaS product and landing page navigation",
      "Marketing site headers",
      "Portfolio and agency site navbars",
      "Component library and documentation headers",
    ],
  },
  "orbit-footer": {
    about:
      "The Orbit Footer is a compact, developer-first footer with balanced column layout, hover-animated links, and a social icon strip. Link hover animations use Framer Motion spring transitions for a polished feel. Columns are organized for typical SaaS structure: product links, resources, legal, and social. The component uses CSS custom property tokens for colors, adapting automatically to both light and dark mode without additional overrides.",
    useCases: [
      "SaaS product and landing page footers",
      "Developer tool and documentation site footers",
      "Component library site footers",
      "Marketing site footers",
    ],
  },
  "depth-testimonials": {
    about:
      "Depth Testimonials stacks testimonial panels in a layered plane arrangement with staggered Framer Motion scroll reveal animations. Each card enters the viewport with a slight depth offset, creating the impression of cards placed at different distances from the viewer. The visual hierarchy keeps the featured quote prominent while secondary testimonials provide supporting context. Best for products with strong customer proof where a flat card grid would undersell the volume of positive feedback.",
    useCases: [
      "Customer testimonial sections",
      "Case study preview blocks",
      "Partner and agency testimonial walls",
      "Review and rating displays",
    ],
  },
  "toggle-pricing-pro": {
    about:
      "Toggle Pricing Pro is an annual/monthly billing toggle with a spring-animated sliding knob and a contextual savings callout that appears when annual billing is selected. Framer Motion layout animations handle the indicator position transition smoothly. Pricing values update with a fade transition when the billing period changes. The recommended plan tier is visually anchored with a highlight ring and badge — the standard three-tier layout proven to make the middle tier feel reasonable.",
    useCases: [
      "SaaS pricing pages",
      "Plan comparison and upgrade sections",
      "Freemium to paid upgrade prompts",
      "Subscription billing selection flows",
    ],
  },
  "beam-sweep-field": {
    about:
      "The Beam Sweep Field is a slow-moving light column animation for cinematic section backgrounds. The beam travels across the section at a configurable angle and speed, creating atmospheric depth behind static content with zero JavaScript overhead — the motion runs purely via CSS animation. It works as a backdrop behind hero text, feature sections, or CTA blocks. The sweep color and opacity are configurable to fit dark and light themes.",
    useCases: [
      "Hero section cinematic backgrounds",
      "CTA section backdrop effects",
      "Feature panel background animations",
      "Premium product section atmospherics",
    ],
  },
  "vector-tilt-scene": {
    about:
      "The Vector Tilt Scene is a high-depth glass panel with 3D perspective tilt physics for hero cards and feature highlights. Mouse movement rotates the panel in three dimensions using Framer Motion spring physics, revealing layered glass surfaces at varying depths. The perspective effect makes flat content — screenshots, diagrams, feature previews — feel spatial and premium. It accepts any React content as children, so product screenshots, mockup images, and animated elements all work inside it.",
    useCases: [
      "Product screenshot frames",
      "Hero card and feature highlight panels",
      "Promotional artwork containers",
      "App preview windows",
    ],
  },
  "glass-login-stack": {
    about:
      "Glass Login Stack is a minimal authentication panel built with glass morphism styling — backdrop blur, translucent fill, and subtle inner glow — for a layered depth effect without background imagery. Input fields have spring-animated focus states that transition the border and shadow. The stacked panel arrangement creates visual depth on flat backgrounds. It integrates with any Next.js authentication provider, including NextAuth.js, Clerk, and Supabase Auth.",
    useCases: [
      "Product login and sign-in pages",
      "Authentication flows",
      "Account access and password reset forms",
      "SSO and OAuth entry points",
    ],
  },
  "split-signup-convert": {
    about:
      "Split Signup Convert is a two-column signup page with a marketing narrative panel on the left and compact form fields on the right. The left panel highlights key benefits to reduce hesitation at the point of conversion — a proven pattern for SaaS products where visitors need light persuasion before committing an email address. Form fields use spring animations on focus. Compatible with Next.js server actions and any form validation library.",
    useCases: [
      "Free trial and beta signup pages",
      "Waitlist registration forms",
      "Lead capture landing pages",
      "Onboarding entry points",
    ],
  },
  "signup-form": {
    about:
      "The Signup Form is an animated registration form with field-level validation feedback and Framer Motion spring transitions on focus and error states. Validation messages enter and exit with layout animations that keep the form height stable. Built for Next.js App Router with server action support, it accepts email, password, and any additional field configuration. A clean, conversion-optimized starting point for any product registration flow.",
    useCases: [
      "Product account creation forms",
      "Newsletter and waitlist signups",
      "Event registration forms",
      "Beta access request pages",
    ],
  },
  "workbench-sidebar": {
    about:
      "The Workbench Sidebar is a dense navigation component tuned for dashboards, developer tools, and admin panels. Navigation sections are grouped and labelled, with hover animations and an active state indicator using Framer Motion layout transitions. Icon badges and notification counts are supported. A collapse-to-icons mode uses spring layout animation for the open/close transition, keeping the sidebar usable at any viewport width.",
    useCases: [
      "SaaS product and admin dashboards",
      "Developer tool navigation",
      "Analytics platform sidebars",
      "Multi-section application navigation",
    ],
  },
  "pulse-dashboard-kpis": {
    about:
      "Pulse Dashboard KPIs renders a strip of metric cards with micro-hover lift animations and soft chart placeholder visualizations. Each card elevates with spring physics on hover and accepts a value, label, trend direction, and sparkline slot. The component is used both on marketing pages to preview product capabilities and inside actual dashboard UIs to display real-time metrics. The layout adapts from a scrollable row on mobile to a multi-column grid on desktop.",
    useCases: [
      "Product feature preview sections",
      "SaaS dashboard KPI strips",
      "Analytics tool marketing pages",
      "Metrics showcase components",
    ],
  },
  "orbital-loader": {
    about:
      "The Orbital Loader is a dual counter-rotating ring loading indicator with an independently pulsing inner glow. The outer and inner rings rotate in opposite directions using CSS animation, producing a hypnotic orbital effect with no JavaScript overhead. The center glow breathes on a separate animation cycle. Use it as a page loader, section skeleton replacement, or inline loading indicator for async operations in any React application.",
    useCases: [
      "Page and route loading states",
      "API fetch and data loading indicators",
      "Form submission spinners",
      "Async operation feedback indicators",
    ],
  },
  "milestone-timeline": {
    about:
      "The Milestone Timeline is a vertical roadmap with animated glowing node points and scroll-triggered entrance effects. Each milestone node pulses with a soft outer glow on hover using Framer Motion. The connecting timeline line and nodes are styled with CSS custom properties for color customization. Scroll triggers animate each milestone into view with a stagger, rewarding visitors who read down the page. Best for product roadmaps, company history sections, and changelog displays.",
    useCases: [
      "Product roadmap sections",
      "Company history and about pages",
      "Feature release timelines",
      "Project milestone and progress displays",
    ],
  },
  "lattice-feature-grid": {
    about:
      "The Lattice Feature Grid is a four-up feature section with scroll-triggered entrance animations and glass tile styling. Each tile fades and slides into view in sequence as the section enters the viewport, creating a cascade effect that guides the eye across the feature set. Glass surface styling uses backdrop blur and subtle borders consistent with the Nexus UI design system. Each tile accepts a custom icon, heading, and description, making it adaptable to any product feature set.",
    useCases: [
      "Product feature sections",
      "Service offering grids",
      "Platform capability displays",
      "Benefit and value proposition lists",
    ],
  },
  "motion-faq-disclosure": {
    about:
      "Motion FAQ Disclosure is a lightweight FAQ accordion with smooth height animations using Framer Motion layout transitions and a rotating expand indicator. Questions open with a content height animation that avoids the abrupt jump of CSS max-height transitions. The expand icon rotates 180 degrees to show state. Keyboard accessible and compatible with any Next.js page. Use it on landing pages to neutralize the five or six objections that stop visitors from signing up.",
    useCases: [
      "Landing page FAQ sections",
      "Pricing page objection handling",
      "Help and support pages",
      "Feature explanation accordions",
    ],
  },
  "nebula-cta-glow": {
    about:
      "Nebula CTA Glow renders a pulsing dual nebula glow behind a high-contrast call-to-action section. The two glow spots breathe on slightly offset animation cycles using CSS keyframes, creating an organic depth effect without canvas or WebGL. The section is structured for a headline, supporting text, and primary CTA button. Best placed at the end of a landing page as a final conversion push after the visitor has read the product value proposition.",
    useCases: [
      "End-of-page conversion sections",
      "Promotional and campaign banners",
      "Newsletter and trial signup blocks",
      "Upgrade and upsell CTA sections",
    ],
  },
  "glow-button": {
    about:
      "The Glow Button is a primary CTA button with a cursor-reactive glow that repositions as the mouse moves across the button surface. The glow gradient updates through a React state update, with spring physics from Framer Motion smoothing the movement for a fluid feel. The button style is configurable for size, color, and border radius. A direct drop-in upgrade to any standard Tailwind button for primary call-to-action elements that need to stand out.",
    useCases: [
      "Primary CTA buttons on hero sections",
      "Pricing plan purchase buttons",
      "Form submit and action buttons",
      "Download and install buttons",
    ],
  },
  "word-magnet": {
    about:
      "Word Magnet is a physics-based word layout where individual words repel from cursor proximity using Framer Motion spring animations. Words scatter outward as the mouse approaches and snap back with spring physics when it moves away. Each word is an independent motion element with its own spring configuration. Add it to hero sections or decorative text displays as a memorable interactive moment that rewards visitors who move their cursor into the text.",
    useCases: [
      "Hero section decorative text",
      "Interactive brand and tagline displays",
      "Portfolio and creative agency heroes",
      "Playful landing page interaction elements",
    ],
  },
  "three-d-folder": {
    about:
      "The 3D Folder Card opens and closes on hover, revealing stacked content cards inside. The fold animation uses Framer Motion spring physics combined with CSS perspective transforms to simulate a physical folder opening. Cards inside lift and fan slightly as the folder opens. A distinctive interaction pattern for feature reveals, stacked document displays, or any UI that needs to communicate multiple items contained within a single object.",
    useCases: [
      "Feature reveal interactions",
      "Document and file preview displays",
      "Stacked card and content containers",
      "Interactive pricing tier comparisons",
    ],
  },
  "draggable-card-stack": {
    about:
      "The Draggable Card Stack renders a pile of cards with physics-based drag and fling gestures. Cards can be picked up and thrown using Framer Motion gesture recognition, with spring physics determining throw trajectory and snap-back behavior. Releasing a card above a threshold dismisses it; below the threshold, it snaps back to the stack. Use it for onboarding card flows, testimonial carousels, or any UI that benefits from tactile, physical-feeling interaction.",
    useCases: [
      "Onboarding and tutorial card flows",
      "Testimonial and quote carousels",
      "Feature discovery interactions",
      "Swipeable content and review decks",
    ],
  },
  "card-carousel-3d": {
    about:
      "The 3D Card Carousel is a scroll-driven carousel where the active card scales forward while adjacent cards recede in perspective depth. Built with Framer Motion useScroll, useTransform, and spring transitions, the depth effect communicates clearly which item is active without requiring dots or arrows alone. Touch swipe and mouse drag are supported. Ideal for portfolio pieces, testimonial carousels, and product feature showcases that need a spatial, premium feel.",
    useCases: [
      "Portfolio and work showcase carousels",
      "Customer testimonial displays",
      "Product feature story carousels",
      "Case study and project listings",
    ],
  },
  "real-time-cursors": {
    about:
      "Real-Time Cursors renders multiple named, color-coded cursors moving simultaneously across the page with spring-smoothed motion. Each cursor label and color is individually configurable. The component is designed for demonstrating real-time collaboration features — multiplayer cursors, shared whiteboards, live document editing — without backend infrastructure, making it suitable for feature screenshots, product demos, and marketing landing pages.",
    useCases: [
      "Collaboration tool feature demos",
      "Multiplayer product showcases",
      "Live editing feature illustrations",
      "SaaS marketing page interactive sections",
    ],
  },
  "editorial-blog-rail": {
    about:
      "The Editorial Blog Rail is a featured article plus compact secondary headlines layout for content hub sections on product landing pages and blog index pages. The primary article card has a large image, category label, and excerpt, while secondary articles use a condensed list style. Scroll-triggered entrance animations sequence each item into view. Use it on marketing sites to surface blog content without a separate blog page, or as the layout for a documentation resource hub.",
    useCases: [
      "Blog and content hub index pages",
      "Resource and documentation section layouts",
      "Marketing site content preview sections",
      "Editorial homepage layouts",
    ],
  },
  "split-contact-glass": {
    about:
      "Split Contact Glass is a two-column contact section with a glass-styled marketing narrative panel and a compact contact capture form. The left panel states why a visitor should get in touch, reducing friction by addressing hesitation. Form fields use spring-animated focus states. Compatible with Next.js server actions for server-side form submission without an external form service. An alternative to separate contact pages that keeps the conversation on the product landing page.",
    useCases: [
      "Landing page contact and inquiry sections",
      "Enterprise and sales contact forms",
      "Demo request capture sections",
      "Partnership inquiry forms",
    ],
  },
  "svg-noise-shader": {
    about:
      "The SVG Noise Shader generates an animated feTurbulence-based noise field for textured, sci-fi background surfaces. The turbulence base frequency and octave parameters animate over time using SVG animate elements, producing an organic, shifting texture with no canvas API or WebGL dependency. It works as a hero backdrop, section overlay, or standalone visual texture element. Compatible with any modern browser that supports SVG filters.",
    useCases: [
      "AI and tech product hero backgrounds",
      "Sci-fi and cyberpunk aesthetic sections",
      "Atmospheric section dividers",
      "Game and creative tool landing pages",
    ],
  },
  "tracing-spotlight-panel": {
    about:
      "The Tracing Spotlight Panel adds a cursor-tracked highlight gradient to any panel or card. As the cursor moves over the surface, a spotlight gradient repositions with spring-smoothed motion, creating the impression of a light source following the cursor. The effect is applied via an overlay that composites above the panel background without affecting child content layout. Use it on pricing tiers, feature cards, or testimonial panels to increase hover engagement.",
    useCases: [
      "Pricing plan card hover effects",
      "Feature highlight panel interactions",
      "Testimonial and quote card styling",
      "Interactive product screenshot frames",
    ],
  },
  "forge-ai-command-bar": {
    about:
      "The Forge AI Command Bar is an animated command surface for AI copilots and chat interfaces. The input bar expands with a Framer Motion spring layout animation when focused, revealing context chips and suggested commands below the text field. Streaming response text enters with a character-by-character animation. Designed to demo AI product features and copilot interfaces, it integrates with any streaming chat API including the Vercel AI SDK.",
    useCases: [
      "AI copilot and chat product demos",
      "Natural language command interfaces",
      "AI search and query surfaces",
      "Developer tool AI feature showcases",
    ],
  },
  "gooey-search-input": {
    about:
      "The Gooey Search Input expands into a suggestion panel with a gooey morphing animation powered by SVG feMerge filter compositing. The input field and suggestion list share the gooey filter group, causing their edges to merge organically when the suggestion panel appears. Spring physics govern the expand and collapse transitions. A memorable interaction pattern that signals creative, high-craft product development for developer tools and creative platforms.",
    useCases: [
      "Site-wide and product search bars",
      "AI and command search inputs",
      "Creative tool search interfaces",
      "Developer tool query inputs",
    ],
  },
  "terminal": {
    about:
      "The Interactive Terminal is a React component that simulates a CLI interface with animated command execution and sequential output streaming. Commands animate in with a typewriter effect and output lines stream into the terminal one by one. Custom commands, multi-line output, and a configurable prompt are all supported. Add it to developer tool landing pages and documentation to demonstrate CLI workflows without running actual shell sessions.",
    useCases: [
      "CLI tool and developer tool demos",
      "Installation guide step illustrations",
      "API and SDK documentation examples",
      "DevOps and infrastructure tool landing pages",
    ],
  },
  "squiggly-text": {
    about:
      "Squiggly Text adds an animated SVG underline that ripples continuously beneath highlighted words. The SVG path is drawn relative to the text element's bounding box and animates with a horizontal ripple motion using Framer Motion. The component adapts to any font size and text length automatically. Use it in hero headings or feature callouts to draw visual attention to a keyword without disrupting the overall typographic layout.",
    useCases: [
      "Hero heading keyword emphasis",
      "Feature and benefit callout text",
      "Landing page promotional headlines",
      "Marketing copy emphasis effects",
    ],
  },
  "floating-dock": {
    about:
      "The Floating Dock is a macOS-style icon bar with magnification spring physics that scales icons based on cursor proximity. As the cursor approaches an icon, it magnifies using Framer Motion spring interpolation, while adjacent icons scale proportionally — the same effect Apple uses in macOS. The dock floats above page content with glass morphism styling. Use it in product demos to showcase a polished navigation metaphor, or as actual application navigation.",
    useCases: [
      "App navigation bars",
      "macOS-style product demos",
      "Portfolio and creative portfolio navigation",
      "Interactive landing page elements",
    ],
  },
  "stateful-button": {
    about:
      "The Stateful Message Button transitions through idle, loading, success, and error states using Framer Motion layout animations. Text and icon transitions between states keep the button width stable to prevent layout shift. The success checkmark and error cross animate in with spring physics. It accepts a standard onClick async function and manages its own state machine internally, making it a direct drop-in for any form submission or API action button in a Next.js application.",
    useCases: [
      "Form submit and save buttons",
      "API action and mutation buttons",
      "File upload and download triggers",
      "Async operation initiators",
    ],
  },
  "sparkles": {
    about:
      "The Sparkles component renders a field of randomly positioned, rotating star particles around its children. Particle positions, sizes, rotations, and colors are individually randomized on mount and re-randomized on a configurable timer using CSS animation. The effect creates a celebratory or magical visual context around headings, buttons, or icons. Zero JavaScript animation overhead during steady state — particles run on CSS keyframes after mount.",
    useCases: [
      "Hero heading decorative effects",
      "CTA button visual emphasis",
      "Achievement and reward UI displays",
      "Promotional banner decorations",
    ],
  },
  "text-generate-effect": {
    about:
      "The Text Generate Effect reveals text word by word, with each word fading in from a blur using staggered Framer Motion animations. The blur-to-clear transition on each word creates the impression of AI-generated text appearing in real time. The stagger delay is configurable to match different text lengths. Use it for hero headlines, feature descriptions, or any marketing copy that benefits from a dramatic sequential entrance rather than appearing all at once.",
    useCases: [
      "AI product hero headlines",
      "Feature description reveal animations",
      "Landing page copy entrance effects",
      "AI interface streaming text simulations",
    ],
  },
  "background-gradient": {
    about:
      "The Background Gradient component renders an animated radial or mesh gradient that shifts colors on a timer using CSS keyframe animation. Gradient stops, colors, position, and animation speed are configurable via props. Works as a hero section background, card fill, or full-page backdrop. Because the animation runs with CSS rather than JavaScript, it has no performance impact on React render cycles or scroll event handling.",
    useCases: [
      "Hero section animated backgrounds",
      "Card and panel background fills",
      "Section backdrop color effects",
      "Promotional and campaign page backgrounds",
    ],
  },
  "typewriter-effect": {
    about:
      "The Typewriter Effect is a text cycling component that types, pauses, and deletes through an array of strings character by character. Typing speed, pause duration, and deletion speed are independently configurable. A blinking cursor animates between cycles with a CSS keyframe. The component includes an aria-live region so screen readers announce the changing content. The standard hero headline pattern for products serving multiple use cases — each string can target a different audience segment.",
    useCases: [
      "Hero section value proposition cycles",
      "Multi-audience product taglines",
      "Feature benefit rotation",
      "Animated product description displays",
    ],
  },
  "text-reveal-card": {
    about:
      "The Text Reveal Card hides secondary text beneath a masked overlay that reveals on hover using CSS clip-path animation driven by cursor position. Moving the cursor across the card shifts the clip boundary, uncovering hidden content progressively. Spring physics smooth the mask transition for a fluid feel. Use it for feature cards that tease additional context, before/after reveals, and testimonial cards where the full quote is revealed on interaction.",
    useCases: [
      "Feature reveal and detail cards",
      "Testimonial card reveals",
      "Before/after content displays",
      "Product description hover effects",
    ],
  },
  "glowing-effect-cards": {
    about:
      "Glowing Effect Cards is a card grid where each card has a cursor-tracked glow border that follows mouse movement across the card surface. The glow gradient repositions as the cursor moves using a mousemove event handler, creating a spotlight that appears to emanate from the cursor's position. When multiple cards share the same parent, a single event listener coordinates the glow across the entire grid. Use it for feature sections, pricing tiers, and service grids.",
    useCases: [
      "Product feature grids",
      "Pricing plan card sets",
      "Service and offering tile grids",
      "Capability showcase sections",
    ],
  },
  "infinite-moving-cards": {
    about:
      "Infinite Moving Cards is a horizontally scrolling infinite carousel of cards using duplicated arrays and CSS animation for a seamless loop. The scroll direction, speed, and pause-on-hover behavior are configurable. Gradient fade masks at the leading and trailing edges create a clean fade-out that implies the list continues. Use it for testimonials, logo strips, integration showcases, or any linear collection too long to display in a static grid.",
    useCases: [
      "Testimonial and review carousels",
      "Integration and partner logo strips",
      "Feature highlight scrollers",
      "Certification and award displays",
    ],
  },
  "meteors": {
    about:
      "The Meteor Effect renders a shower of diagonal streaking particles behind page content using CSS animation. Each meteor is a gradient line that falls at a random angle, opacity, size, and speed. The combined effect creates atmospheric depth and a sense of motion while running entirely on CSS keyframes with zero JavaScript animation overhead. Use it as a hero backdrop, CTA section atmosphere, or full-page background for launch pages and AI products.",
    useCases: [
      "Hero section background effects",
      "Product launch page atmospherics",
      "CTA section backdrop effects",
      "AI and space-themed product backgrounds",
    ],
  },
  "background-boxes": {
    about:
      "Background Boxes renders a grid of individually colored squares that pulse and shift hue on hover. Each box transitions through color values independently, creating a retro-digital grid aesthetic popular with developer tools and AI products. The hover interaction ripples color changes outward from the cursor. Works as a hero background or section fill with content layered above at a higher z-index.",
    useCases: [
      "Developer tool hero backgrounds",
      "AI and tech product landing pages",
      "Retro-digital aesthetic section fills",
      "Interactive promotional backgrounds",
    ],
  },
  "encrypted-text": {
    about:
      "The Encrypted Text component scrambles characters randomly before revealing the final text, cycling through alphanumeric characters at configurable speed before settling. It triggers on mount by default but can also be bound to hover or scroll events. Use it for data-like reveals, loading state placeholders where real data is incoming, or as a stylistic animation for developer-focused products that want to communicate a coded, technical aesthetic.",
    useCases: [
      "Data value loading reveals",
      "Developer tool interface text",
      "Cyberpunk and tech aesthetic animations",
      "Hero heading entrance effects",
    ],
  },
  "mac-keyboard": {
    about:
      "The Mac Keyboard component renders an animated replica of a standard Apple keyboard layout with spring-animated key press physics. Individual keys depress with a Framer Motion spring transition on hover, matching the physical press feel of a real keyboard. Use it in developer tool demos to illustrate keyboard shortcuts, in documentation to highlight key bindings, or as a decorative product visual that communicates the tool is built for keyboard-first users.",
    useCases: [
      "Keyboard shortcut documentation pages",
      "Developer tool feature illustrations",
      "Interactive onboarding guides",
      "CLI and terminal tool marketing pages",
    ],
  },
  "images-badge": {
    about:
      "The Images Badge renders a compact overlapping avatar group with a spring entrance animation. Avatars stack with slight offsets and fan out slightly on hover using Framer Motion spring physics. Display count is configurable and overflows into a \"+N more\" label. Use it as a social proof element to display team size, active user counts, or collaboration participant counts. A compact, high-impact social signal for SaaS landing pages.",
    useCases: [
      "Team and collaborator count indicators",
      "Active user and customer count badges",
      "Social proof elements",
      "Collaboration feature highlights",
    ],
  },
  "dot-grid-hero": {
    about:
      "The Interactive Dot Grid Hero renders a full-viewport hero with a dot matrix background that responds to cursor proximity. Dots near the cursor glow and scale outward with Framer Motion spring physics, creating a ripple-like interaction field that radiates from the mouse. Text content layers above the grid. The effect reads as technical and precise — ideal for developer tools, API products, and infrastructure services where the visual language should communicate engineering.",
    useCases: [
      "Developer tool and API landing page heroes",
      "Infrastructure and platform product heroes",
      "Technical SaaS product heroes",
      "Component library showcase heroes",
    ],
  },
  "starfield-hero": {
    about:
      "The Interactive Starfield Hero renders a full-viewport hero with a 3D perspective star field that parallax-shifts in response to cursor movement. Stars move at slightly different rates based on their z-depth, creating genuine parallax depth. Framer Motion spring transitions smooth the cursor response. The spatial, deep-sky aesthetic suits AI products, space-themed applications, and SaaS products targeting a premium technical audience.",
    useCases: [
      "AI and machine learning product heroes",
      "Space and astronomy app landing pages",
      "Premium SaaS product heroes",
      "Product launch and reveal pages",
    ],
  },
  "compare": {
    about:
      "The Before/After Compare component renders two images with a draggable divider the user controls to reveal either side. Mouse drag, touch, and keyboard input are all supported via Framer Motion gesture recognition. The divider handle has a spring-snapping interaction that stays under the cursor precisely. Use it to demonstrate product transformations — design tool output, image processing, code generation before/after — or any visual comparison.",
    useCases: [
      "Design tool output demonstrations",
      "Image processing and AI generation showcases",
      "Before/after product feature displays",
      "Visual comparison and A/B test illustrations",
    ],
  },
  "expandable-cards": {
    about:
      "Expandable Cards are a set of cards that expand on click to reveal additional content with a smooth height animation powered by Framer Motion layout transitions. The collapsed state shows a preview snippet and the expanded state reveals full content, with surrounding cards correctly repositioned during animation. Use them for FAQs, feature breakdowns, detailed team bios, and any scenario where information should be available but not all shown simultaneously.",
    useCases: [
      "FAQ and objection handling sections",
      "Feature detail and specification cards",
      "Team member bio expansions",
      "Product comparison detail panels",
    ],
  },
  "animated-select-headline": {
    about:
      "The Animated Select Headline cycles through keyword variants in a hero heading, highlighting each active word with a Figma-style selection rectangle — thin border with corner handle markers — that blur-fades as the next word appears. Built entirely with Framer Motion layout animations, the highlight rectangle repositions and resizes smoothly for words of different lengths. A distinctive hero pattern for multi-audience products that rotates through different value propositions.",
    useCases: [
      "Multi-audience hero headlines",
      "Product value proposition rotation",
      "Feature benefit cycles",
      "Landing page headline variants",
    ],
  },
  "warp-speed-card": {
    about:
      "The Warp Speed Card confines a warp-speed starfield effect to the bounding box of a text element on hover. Hovering the target phrase reveals a dark space scene with streaking light beams rendered entirely within the text bounds — the text itself stays static. The effect uses canvas rendering clipped to the text element's dimensions, with Framer Motion handling the entrance and exit transitions. A cinematic micro-interaction that rewards cursor exploration.",
    useCases: [
      "Feature callout text interactions",
      "Hero subheading hover effects",
      "Promotional copy emphasis",
      "Interactive product description elements",
    ],
  },
  "circular-carousel": {
    about:
      "The Circular Carousel arranges content cards in an orbital ring around a central focal point. The active card stays centered and at full scale while adjacent cards arc around it at reduced scale. Framer Motion spring animations handle the orbital transitions when the active card changes. Navigation controls and auto-rotation are both supported. Compatible with any card content including images, text blocks, and interactive React elements.",
    useCases: [
      "Product feature carousels",
      "Testimonial and review rotators",
      "Team member profile carousels",
      "Portfolio and project showcases",
    ],
  },
  "chat-messages": {
    about:
      "Chat Messages renders animated conversation bubbles with typing indicators and sequential message reveal. Messages enter one by one with Framer Motion spring animations, simulating a real-time conversation at configurable speed. Typing indicator dots appear between message groups. Use it in AI product demos to show a sample conversation without a live backend, or in chat application showcases to demonstrate the conversational UI design.",
    useCases: [
      "AI product and chatbot demos",
      "Customer support tool feature sections",
      "Conversational UI mockups and showcases",
      "Messaging app landing pages",
    ],
  },
  "shader-flow": {
    about:
      "Shader Flow renders a soft animated background with flowing gradient motion that simulates a GLSL shader aesthetic using pure CSS. Gradient blobs shift position, opacity, and hue over time with CSS keyframe animation, blending into an organic, fluid movement pattern. No WebGL or canvas API — the shader-like appearance is achieved entirely with CSS gradients and animation. Works as a full-viewport background or a contained section fill.",
    useCases: [
      "Hero and landing page backgrounds",
      "Card and panel gradient fills",
      "Atmospheric section dividers",
      "Creative and design tool landing pages",
    ],
  },
  "ask-nexus-input": {
    about:
      "Ask Nexus Input is an AI query field with animated example query cycling and spring expand-on-focus behavior. When idle, the input cycles through example queries with a fade transition. On focus, the field expands with a Framer Motion spring layout animation and reveals a suggestions panel. Designed for AI search interfaces and copilot product demos, it connects to any streaming chat API via standard React event handlers.",
    useCases: [
      "AI search and query interfaces",
      "Copilot and assistant product demos",
      "Natural language command surfaces",
      "AI product hero section inputs",
    ],
  },
  "globe-pins": {
    about:
      "Globe Pins renders a rotating 3D globe on canvas from real world-atlas GeoJSON geodata, with interactive location pins displaying name, address, and contact labels. Animated arc connections draw between pins to illustrate relationships or routes. A bloom/glow rendering mode adds atmospheric depth to the globe sphere. Use it to visualize global customer locations, server regions, or worldwide product reach on a marketing or product page.",
    useCases: [
      "Global customer and user location displays",
      "Server and infrastructure region maps",
      "International product reach visualizations",
      "Partnership and office location displays",
    ],
  },
  "globe-pins-3d": {
    about:
      "Globe Pins 3D is an interactive Three.js globe with auto-rotation, location pins with label overlays, animated arc trails between locations, optional bloom post-processing, and OrbitControls for drag-to-rotate and pinch-to-zoom. More interactive than the canvas variant — users can explore the globe freely. Ideal for prominent hero sections where global scale is a core value proposition, or for interactive product showcase sections.",
    useCases: [
      "Hero section globe displays",
      "Interactive product showcase sections",
      "Geographic data visualizations",
      "Global reach and scale demonstrations",
    ],
  },
  "interactive-globe-explorer": {
    about:
      "The Interactive Globe Explorer is the most feature-complete globe variant, with hover-state country highlighting, data label overlays, scroll-driven entrance animation, and full OrbitControls. Countries highlight on cursor hover with a color fill transition and display a data label. The scroll-driven entrance rotates and scales the globe into view from below the fold. Best for data products, analytics platforms, and any product where geographic scope is a selling point.",
    useCases: [
      "Data visualization and analytics sections",
      "Geographic product reach showcases",
      "Global infrastructure displays",
      "Interactive product demo sections",
    ],
  },
  "code-block": {
    about:
      "The Code Block is a syntax-highlighted code display component with a configurable header, line numbers, copy button with feedback animation, and a trailing fade gradient. It supports dark and light themes and multiple programming languages via Prism or Shiki tokenization. A copy confirmation checkmark animates in on click and resets after a configurable duration. Use it in documentation pages, installation guides, and component detail pages to display code samples.",
    useCases: [
      "Code documentation and API reference pages",
      "Installation and setup guide steps",
      "Component usage example displays",
      "Tutorial and course content pages",
    ],
  },
  "card-stack-rotator": {
    about:
      "The Card Stack Rotator is a premium testimonial and content carousel where cards sit in a 3D stack perspective and rotate to the front with spring animations. Cards in the back stack are visible at reduced scale, communicating that more content is available. Auto-rotation advances through cards at a configurable interval and pauses on hover. Inline bold highlight text within cards uses a distinctive styled span for visual emphasis on key phrases.",
    useCases: [
      "Customer testimonial sections",
      "Feature story carousels",
      "Case study preview rotators",
      "Product benefit highlight stacks",
    ],
  },
  "scroll-reveal-text": {
    about:
      "Scroll Reveal Text is a scroll-driven word illumination effect where words in a paragraph brighten sequentially as the user scrolls through the section. Words start in a muted state and transition to full opacity as the scroll progress advances through each word's position in the text. Built with Framer Motion useScroll and useTransform, the effect creates a reading-pace animation that ties content reveal directly to user attention. Best for mission statements, product stories, and feature descriptions.",
    useCases: [
      "Mission statements and manifesto sections",
      "Feature and product story descriptions",
      "Hero section subheading reveals",
      "Scroll-driven marketing copy animations",
    ],
  },
  "animated-countdown": {
    about:
      "The Animated Countdown is a flip-style countdown timer with four visual variants — modern, digital, minimal, and classic — driven by Framer Motion spring layout animations for number transitions. It accepts any target date and updates in real time, displaying days, hours, minutes, and seconds. The flip transition between numbers animates with spring physics for a satisfying mechanical feel. Use it on product launch pages, promotional deadlines, and event countdown sections.",
    useCases: [
      "Product launch and reveal countdown pages",
      "Sale and promotion deadline displays",
      "Event registration countdown sections",
      "Waitlist deadline and urgency indicators",
    ],
  },
  "shooting-stars-grid": {
    about:
      "The Shooting Stars Grid combines an animated dot grid background with diagonal shooting star streak animations. Streaks travel across the grid at randomized speeds, angles, and lengths, with glowing node points at dot intersections. The combined effect creates a space-network aesthetic that reads as technical and dynamic. Use it behind hero content, feature sections, or as a full-page background for AI products and infrastructure tools.",
    useCases: [
      "AI and ML product hero backgrounds",
      "Technical SaaS product section fills",
      "Infrastructure tool landing pages",
      "Space and network themed page backgrounds",
    ],
  },
  "hover-highlight-text": {
    about:
      "Hover Highlight Text renders a cursor-tracked SVG spotlight that reveals outlined text beneath a filled base layer. Two versions of the text are composited — filled on top, outlined beneath — with a circular spotlight clip that tracks the cursor using Framer Motion spring physics. As the mouse moves across the text, the spotlight uncovers the outlined variant below. A cinematic interaction for hero headlines and section callouts that rewards cursor exploration.",
    useCases: [
      "Hero heading interactive effects",
      "Landing page slogan interactions",
      "Section title hover animations",
      "Promotional headline effects",
    ],
  },
  "image-trail": {
    about:
      "Image Trail spawns image thumbnails at cursor positions as the mouse moves across the page, creating a ribbon of imagery that follows cursor movement. Each image appears, scales up briefly, then fades out — building a transient trail behind the cursor. Images are Framer Motion elements with independent lifecycle animations. Use it on photography portfolio pages and image-rich landing pages as a dramatic visual effect that communicates the product's visual nature.",
    useCases: [
      "Photography portfolio heroes",
      "Creative agency landing pages",
      "Image product and gallery showcases",
      "Interactive visual brand experiences",
    ],
  },
  "animated-bento-grid": {
    about:
      "The Animated Bento Grid is a configurable feature showcase grid where each tile enters the viewport with a staggered Framer Motion spring animation. Column spans are configurable per tile, allowing the alternating wide/narrow pattern that creates diagonal visual movement through the section. Each tile accepts a custom icon, heading, description, tags, and motion delay. The bento grid layout packs multiple product capabilities into a single view without requiring visitors to scroll a long feature list.",
    useCases: [
      "Product feature showcase sections",
      "Platform capability grids",
      "SaaS landing page feature sections",
      "Service and offering displays",
    ],
  },
  "bento-grid-skeleton": {
    about:
      "The Bento Grid Skeleton renders a bento-layout grid of animated loading placeholder tiles covering common UI patterns — chat bubbles, dashboard charts, avatar cards, workflow steps, calendar views, and code blocks. Each tile pulses with a shimmer animation on a staggered delay. Use it as a loading state for data-heavy bento layouts, as a product preview that communicates dashboard capability, or as a standalone visual element for SaaS marketing sections.",
    useCases: [
      "Dashboard and product loading states",
      "SaaS product preview sections",
      "Skeleton UI loading patterns",
      "Dashboard feature marketing illustrations",
    ],
  },
  "scrolling-testimonials": {
    about:
      "Scrolling Testimonials is an infinite vertical scroll testimonial wall with a multi-column layout and independent column speeds. Columns scroll at slightly different rates to create visual interest — the varying speeds imply a large volume of real feedback. Hover pauses the animation for reading. Reverse direction is supported on alternate columns. Gradient fade masks at the top and bottom edges frame the visible portion. Avatar initials are used as a fallback when no image URL is provided.",
    useCases: [
      "High-volume customer testimonial sections",
      "Review and rating display walls",
      "Social proof sections with many quotes",
      "User community showcase sections",
    ],
  },
  "motion-layer-scroller": {
    about:
      "The Motion Layer Scroller is a scroll-driven parallax depth engine where each layer moves at an independent speed and axis as the user scrolls the page. Built with Framer Motion useScroll and useTransform, layers can move vertically, horizontally, or at angles with configurable speed multipliers. Composing multiple layers with different depths creates genuine parallax scenes from flat content. Use it for immersive hero sections, product story sections, and scroll-storytelling experiences.",
    useCases: [
      "Parallax hero and section designs",
      "Immersive product story sections",
      "Scroll-driven narrative experiences",
      "Depth-layered feature showcases",
    ],
  },
  "profile-orbit": {
    about:
      "Profile Orbit is an interactive profile carousel where five avatar cards orbit a central profile display. Clicking any orbiting avatar, the navigation arrows, or pressing arrow keys cycles through people with a smooth spring fade animation. The central card displays the full profile — name, role, quote, and bio. Use it for team sections, advisor profiles, and speaker lineups where multiple people need to be presented without a grid of equal-weight cards.",
    useCases: [
      "Team and founder profile sections",
      "Advisor and investor profile displays",
      "Speaker and event participant showcases",
      "Customer spotlight sections",
    ],
  },
  "spectra-frame": {
    about:
      "Spectra Frame is a responsive image grid where photos are desaturated to black and white by default and burst into full color on hover with an adaptive scale animation. The color reveal uses CSS filter transitions without any JavaScript per-frame work. The component has zero external dependencies and uses scoped CSS injection, with picsum placeholder images by default. Responsive columns adapt to container width, making it suitable for any grid layout within a Next.js page.",
    useCases: [
      "Photography portfolio galleries",
      "Product and brand photo showcases",
      "Creative agency portfolio grids",
      "Visual product feature galleries",
    ],
  },
  "avatar-group": {
    about:
      "Avatar Group renders a horizontally overlapping stack of user avatars with per-avatar entrance animations and hover effects powered by Framer Motion. Each avatar supports a photo via `src`, with automatic color-coded initials fallback when no image is provided. Name tooltips with enter/exit animations appear on hover. Four entrance animation styles — flip, slide, scale, and bounce — stagger across the group on mount, and four hover styles — scale, lift, rotate, and up — make the hovered avatar stand out from the stack. Use it for social proof strips, team sections, collaborator counts, and anywhere a list of people needs to be communicated compactly.",
    useCases: [
      "Social proof strips on pricing and landing pages",
      "Team member and collaborator count displays",
      "Active user and community size indicators",
      "Comment and reaction participant lists",
    ],
  },
  "feature-tools-card": {
    about:
      "The Feature Tools Card is a dark glass bento card with five integration icon slots arranged in a symmetric sm–md–lg–md–sm pyramid, a conic-gradient orbit ring that rotates continuously, and 3-D tilt and magnetic icon effects driven by cursor position — all with zero animation library dependencies. Move the mouse over the card to feel the tilt physics; hover near any icon to watch it magnetically follow the cursor. Icons default to GitHub, Notion, Gmail, Slack, and Google Drive but accept any React node, so product-specific SVGs or `<img>` tags slot straight in. Use it in integration and features sections to communicate that your platform connects with the tools your visitors already use.",
    useCases: [
      "Integration and partner showcase sections",
      "SaaS feature sections highlighting connected tools",
      "Platform capability bento grids",
      "Product landing page feature cards",
    ],
  },
  "command-palette": {
    about:
      "The Command Palette is an animated command interface triggered by the ⌘K keyboard shortcut. It opens with a Framer Motion spring animation and closes with an exit transition coordinated by AnimatePresence. Commands are grouped into navigation, action, and theme sections, and are filterable by keyboard input in real time. A backdrop blur overlay dims the page behind the palette. A production-ready implementation of the command palette pattern for keyboard-first application navigation.",
    useCases: [
      "Application and dashboard navigation",
      "Developer tool command interfaces",
      "Keyboard-first navigation patterns",
      "Power user and productivity tool UIs",
    ],
  },
};
