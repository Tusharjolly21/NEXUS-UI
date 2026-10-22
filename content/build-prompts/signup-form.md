Build a signup card with floating-label fields, a live password checklist, inline errors that shake the field that needs fixing, and a submit button that squeezes into a spinner and swells back out green. A matching login card shares the same parts. The feel is calm and Apple-light, with dark mode.

## Stack

- React 18/19 client components (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useReducedMotion`).
- Files in `components/signup-form/`: `signup-form.tsx` (`SignupForm`, `SignupFormProps`, `SignupFormValues`), `login-form.tsx` (`LoginForm`, `LoginFormProps`, `LoginFormValues`), `form-parts.tsx` (`FloatField`, `Rule`, `SubmitMorph`, `SocialRow`, `Divider`, `playScript`, `typeSteps`, shared card class), `brand-icons.tsx` (inline GitHub, Apple, Google SVGs) and `index.ts`.

## API

`SignupFormValues = { firstName, lastName, email, password, confirmPassword }`.

- `title` "Create your account"; `subtitle` "Start building polished interfaces with motion-first components." (`""` hides it).
- `submitLabel` "Create account"; `loadingLabel` "Creating account..." and `successLabel` "Account created" are the button's accessible names in those states.
- `showNameField` `true`; `showConfirmPasswordField` `true`; `minPasswordLength` `8` (clamped to at least 6); `defaultValues`.
- `onSubmit(values)`: sync or async, called after validation with trimmed values. A promise shows the spinner; throwing an `Error` shows its message. Without it, success is simulated after 1100ms.
- `showSocialLogins` `true`; `onSocialLogin("github" | "apple" | "google")`; `onSignIn` (shows "Already have an account? Sign in").
- `autoplay` `false`; `className`.

## Layout and look

- Card (`motion.form`, `noValidate`): `w-full max-w-md`, radius 24px, padding 24px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`). Ink `#1d1d1f` (dark `#f5f5f7`), soft text `#6e6e73` (dark `#a1a1a6`).
- Heading 22px semibold; subtitle 4px below, 14px, soft.
- Social row, 20px below: three `h-11 flex-1` buttons, gap 8px, radius 12px, white (dark `#2c2c2e`), ring `black/8%` (dark `white/10`), hover `#f5f5f7` (dark `#3a3a3c`), 13.5px medium, 18px icon, name hidden under 400px; labels like "Sign up with GitHub". Then a divider "or with email": 12px soft text between 1px lines.
- Fields sit 16px below (20px without social), 10px gap; names in a two-column grid.
- Field: 52px tall, radius 14px, background `#f5f5f7` (dark `#2c2c2e`), ring `black/4%`. Focus: white background (dark unchanged), 2px ring `#0071e3` (dark `#0a84ff`). Error: 2px ring `#ff3b30`. The label is absolute, left 14px, vertically centred, 15px soft (error `#d70015`, dark `#ff6961`). Input is transparent, 15px, `px-3.5 pb-1.5 pt-5`.
- Email shows a 20px `#30d158` circle with a white check once it matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Password fields end in an 18px eye button (`aria-pressed`) whose slash draws while revealed.
- Below a field: error text 12.5px `#d70015` (dark `#ff6961`), else the hint. The password hint is two rules, "{min}+ characters" and "A letter and a number", each a 14px dot and label.
- Submit: 20px below, centred `h-12` pill, 15px semibold white, `#0071e3` (dark `#0a84ff`), hover `#0077ed`, shadow `0 10px 24px -12px rgba(0,113,227,.9)`.
- Status line: 12px below, `min-h-[18px]`, centred 13px; links `#0066cc` (dark `#64b5ff`).

## Motion

- Card enters from `opacity 0, y 10`, spring 260/26.
- Label animates to `y −19, scale 0.76` when focused or filled, else `y −10.5, scale 1`; spring 520/30.
- Shake: when a field's counter rises, `x [0, −8, 7, −5, 3, 0]` over 0.42s. Errors fade in from `y −4`.
- Email check pops scale 0 to 1, spring 600/16.
- Rule: dot goes from `rgba(134,134,139,.25)` to `#30d158` with scale `[1, 1.3, 1]` over 0.35s while a white check draws in 0.25s; the label turns `#248a3d` (dark `#30d158`).
- Submit morph: `layout` spring 420/26. Loading is a 48px circle with a 20px spinner (track `rgba(255,255,255,.35)`, white arc) rotating 0.8s linear forever. Success is full width, `#30d158`, shadow `0 10px 24px -12px rgba(48,209,88,.9)`, a check drawn in 0.35s after 0.1s, then `successLabel`. Tap scale 0.97 while idle.
- Reduced motion: no entrance, shake, label travel or spinner rotation.

## Interaction and states

- Validation runs on submit, all at once: names under 2 characters ("Enter your first name." / "Enter your last name."), bad email ("Enter a valid email address."), short password ("Use at least {min} characters."), mismatch ("Passwords don't match."). Failing fields shake and the first is focused; typing clears that field's error.
- Valid submit goes loading, then success, which stays; the status line reads "Check your inbox to confirm your email.". A thrown error returns to idle and shows its message, or "Unable to create account. Please try again.", as a red alert.
- Inputs and social buttons are disabled while busy.
- Autoplay: after 600ms type "Mei" (70ms a letter), "Tanaka" (60), "mei@studio.dev" (45), "Kite-flying-42" (65), the confirm field if shown (30); loading 450ms later, success after 1200ms, reset after 2400ms, repeat. Any pointer down or edit stops it for good.

## Accessibility

- Real `<label for>`, `aria-invalid`, `aria-describedby`, `role="alert"` errors, hidden "(met)" / "(not met)" on rules, 2px blue focus rings.

## Examples on the page

- Signup Form: `SignupForm` with `showConfirmPasswordField={false}`, an async `onSubmit`, `onSocialLogin` and `onSignIn` (routes to login). The demo adds `autoplay`.
- Login Form: `LoginForm` with `onSubmit`, `onForgotPassword` and `onSignUp`. Defaults: "Welcome back", "Sign in to your account to continue.", "Sign in", "Signing in...", "Signed in". Only email and password (`current-password`, no checklist); a right-aligned "Forgot password?" link under the fields; submit; then "or" and the social row; then "New here? Create an account". Password needs 6 characters ("Password must be at least 6 characters."). A thrown error shows its message (or "Unable to sign in. Please check your details.") and shakes the password field. Autoplay types "ada@northwind.co", then "orbit-2026".

## Acceptance checklist

- [ ] Labels spring up on focus or fill; rules tick green with a pop.
- [ ] An empty submit shakes every bad field and focuses the first.
- [ ] Submit squeezes to a spinner, then swells to a green "Account created".
- [ ] A thrown error restores the button and shows the message.
- [ ] The Login Form matches the layout and messages above.
- [ ] Dark mode swaps every surface and text colour.
