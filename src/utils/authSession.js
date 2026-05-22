const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"];

const SESSION_EXPIRED_ERRORS = new Set([
  "TokenExpired",
  "TokenInvalid",
  "TokenMissing",
  "PasswordChanged",
  "UserNotFound",
  "AuthRequired",
  "AccountDeactivated",
  "AuthRateLimitExceeded",
]);

export function resolveApiErrorCode(error) {
  if (!error) return null;
  if (typeof error === "string") return error;
  return null;
}

/**
 * Only clear the client session when a 401 indicates the token is no longer valid,
 * not for wrong-password attempts on protected routes.
 */
export function shouldExpireSession({ path, status, hadToken, errorCode }) {
  if (status !== 401 || !hadToken) return false;
  if (PUBLIC_AUTH_PATHS.some((publicPath) => path.startsWith(publicPath))) return false;
  if (!errorCode) return true;
  return SESSION_EXPIRED_ERRORS.has(errorCode);
}

export function notifySessionExpired() {
  window.dispatchEvent(new CustomEvent("oe:auth-expired"));
}
