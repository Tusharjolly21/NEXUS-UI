/**
 * The launch banner's dismiss cookie. Shared by the client banner (writes it) and the site shell
 * (reads it on the server), so it lives outside the "use client" module.
 * Bump the id when the message changes, so people who closed the old one see the new one.
 */
export const LAUNCH_BANNER_COOKIE = "nx-banner";
export const LAUNCH_BANNER_ID = "icons-1";

