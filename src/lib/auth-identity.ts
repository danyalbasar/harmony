/**
 * Usernames stand in for email addresses so the app never needs a real inbox.
 * Supabase Auth is email-based under the hood, so a username is turned into a
 * private, non-routable address that only ever exists inside this project.
 *
 * Change EMAIL_DOMAIN if Supabase ever rejects the address shape.
 */

export const EMAIL_DOMAIN = "harmony.local";

export const MIN_PASSWORD_LENGTH = 8;

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateUsername(value: string) {
  const username = normalizeUsername(value);

  if (username.length < 3) return "Pick a username at least 3 characters long.";
  if (username.length > 30) return "Usernames can be at most 30 characters.";
  if (!USERNAME_PATTERN.test(username)) {
    return "Use lowercase letters, numbers, dots, dashes and underscores only.";
  }

  return null;
}

export function validatePassword(value: string) {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return null;
}

/** The placeholder address Supabase stores for a given username. */
export function usernameToEmail(username: string) {
  return `${normalizeUsername(username)}@${EMAIL_DOMAIN}`;
}
