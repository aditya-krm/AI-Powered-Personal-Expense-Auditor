/**
 * Authentication utilities for the web dashboard
 */

/**
 * Checks if authentication is enabled (WEB_ACCESS_TOKEN is configured)
 */
export function isAuthEnabled(): boolean {
  return !!process.env.WEB_ACCESS_TOKEN;
}

/**
 * Validates an authentication token against the configured WEB_ACCESS_TOKEN
 * @param token - The token to validate
 * @returns true if authentication is disabled or the token is valid
 */
export function isValidAuthToken(token: string | undefined): boolean {
  const expectedToken = process.env.WEB_ACCESS_TOKEN;
  
  // If auth is not enabled, allow access
  if (!expectedToken) {
    return true;
  }
  
  // Validate token
  return token === expectedToken;
}
