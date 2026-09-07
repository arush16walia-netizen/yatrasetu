import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Zero-proxy rotating check-in token.
 *
 * Every 15 seconds a new 8-char token is derived from the event's static
 * check-in code via HMAC. The event board displays a QR of `CODE.TOKEN`;
 * forwarded screenshots expire with the window. The server accepts the
 * current window plus two windows of grace for clock skew.
 */

const WINDOW_MS = 15_000;
const GRACE_WINDOWS = 2;

function secret(): string {
  return process.env.AUTH_SECRET ?? "yatra-setu-rotating-dev-secret";
}

function tokenForWindow(checkinCode: string, windowIndex: number): string {
  return createHmac("sha256", secret())
    .update(`${checkinCode.toUpperCase()}:${windowIndex}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
}

/** The token valid right now. */
export function currentRotatingToken(checkinCode: string): string {
  return tokenForWindow(checkinCode, Math.floor(Date.now() / WINDOW_MS));
}

/** Seconds until the current token expires (for the board countdown). */
export function windowRemaining(): number {
  return Math.ceil((WINDOW_MS - (Date.now() % WINDOW_MS)) / 1000);
}

/** Check across the current and grace windows. */
export function verifyRotatingToken(checkinCode: string, token: string): boolean {
  const now = Math.floor(Date.now() / WINDOW_MS);
  const candidate = token.trim().toUpperCase();
  if (candidate.length !== 8) return false;
  for (let w = now - GRACE_WINDOWS; w <= now; w++) {
    if (timingSafeEqual(Buffer.from(tokenForWindow(checkinCode, w)), Buffer.from(candidate))) {
      return true;
    }
  }
  return false;
}
