/**
 * Only same-origin relative paths. Blocks open redirects like //evil.com
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  // Reject whitespace / control chars that can confuse parsers
  if (/[\s\r\n\0]/.test(next)) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next.includes("\\")) return null;
  if (next.includes("://")) return null;
  // Block protocol-relative tricks after decode
  try {
    const decoded = decodeURIComponent(next);
    if (decoded.startsWith("//") || decoded.includes("://")) return null;
  } catch {
    return null;
  }
  return next;
}

/** Stable callback/login error codes — never put raw provider text in URLs */
export const AUTH_ERROR_CODES = [
  "missing_code",
  "exchange_failed",
  "auth_callback",
  "need_login",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export function authErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "missing_code":
      return "That sign-in link was incomplete. Try logging in with email and password.";
    case "exchange_failed":
      return "That sign-in link expired or was already used. Try logging in with email and password.";
    case "auth_callback":
      return "Sign-in could not be completed. Try logging in with email and password.";
    case "need_login":
      return "Log in to continue.";
    default:
      // Ignore arbitrary query strings (phishing-friendly banners)
      return "Sign-in could not be completed. Try again.";
  }
}

export const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/share",
  "/sponsor",
  "/admin",
] as const;
// Note: /dashboard/* create/edit routes inherit the /dashboard prefix match.

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
