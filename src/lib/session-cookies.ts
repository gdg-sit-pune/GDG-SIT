// Cookie names shared by the server code, the proxy and the navbar.
// Kept in their own tiny file so the proxy doesn't load Firebase.

/** httpOnly Firebase session cookie. The only thing that actually grants access. */
export const SESSION_COOKIE = '__session'

/**
 * Readable hint that an organizer is signed in, used only to show the "Admin" button
 * in the navbar. Grants nothing: every admin page and action verifies SESSION_COOKIE.
 */
export const ADMIN_HINT_COOKIE = 'gdg_admin'

/** How long an admin stays signed in */
export const SESSION_DAYS = 5
