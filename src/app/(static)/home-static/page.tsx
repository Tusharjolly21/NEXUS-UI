import HomePage, { metadata as homeMetadata } from "@/app/(site)/page";

/**
 * The homepage as a signed-out visitor sees it, built once and cached. Visitors never type this
 * URL: next.config.mjs rewrites "/" here when the request has no sign-in cookie. The address bar
 * keeps "/" and the canonical stays "/", so there is no second page to index (no noindex either:
 * crawlers fetch "/" and are served this very HTML, so noindex here would hide the homepage).
 */
export const metadata = homeMetadata;
export const revalidate = 3600;
export default HomePage;
