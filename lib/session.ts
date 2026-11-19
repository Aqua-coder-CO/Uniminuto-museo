import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "mac_session";
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("Falta SESSION_SECRET");
  }
  return value;
}

export function passwordsMatch(input: string, expected: string): boolean {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + TWELVE_HOURS_MS;
  const payload = String(expiresAt);
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return false;
  }

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TWELVE_HOURS_MS / 1000,
};
