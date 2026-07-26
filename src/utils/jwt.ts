import type { JwtPayload } from '../types/jwt.types';

/**
 * Decode JWT without verifying signature (trust backend).
 * Returns null on malformed token.
 */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    // base64url → base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if token expired or unparseable.
 * Pure convenience over decodeJwt + Date.now().
 */
export function isJwtExpired(token: string | null | undefined): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}
