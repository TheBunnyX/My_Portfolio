import { createHmac, timingSafeEqual } from "node:crypto";

// Serverless functions keep no shared memory between invocations, so the session lives in a
// signed cookie instead of the in-memory session map that server.mjs uses.
const SESSION_MS = 4 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const COOKIE_NAME = "portfolio_session";
const PLACEHOLDER_PASSWORD = "replace-with-a-long-unique-password";

// Best effort only: this map is per function instance and is lost on cold starts.
const attempts = new Map();

const username = () => process.env.ADMIN_USERNAME || "";
const password = () => process.env.ADMIN_PASSWORD || "";
const secureCookie = () => Boolean(process.env.VERCEL) || process.env.COOKIE_SECURE === "true";
const signingKey = () => createHmac("sha256", process.env.SESSION_SECRET || `${username()}:${password()}`).update("portfolio-session-v1").digest();
const sign = (value) => createHmac("sha256", signingKey()).update(value).digest();
const secureEqual = (a, b) => a.length === b.length && timingSafeEqual(a, b);

export const isConfigured = () => Boolean(username() && password() && password() !== PLACEHOLDER_PASSWORD);

export function send(response, status, body, headers = {}) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
  if (status === 204) return response.status(204).end();
  return response.status(status).json(body);
}

export const isSameOrigin = (request) => !request.headers.origin || request.headers.origin === `https://${request.headers.host}` || request.headers.origin === `http://${request.headers.host}`;

export const clientIp = (request) => String(request.headers["x-forwarded-for"] || "").split(",")[0].trim() || request.socket?.remoteAddress || "unknown";

export function isBlocked(ip) {
  return attempts.get(ip)?.blockedUntil > Date.now();
}

// Returns true once the caller has used up its attempts for the current window.
export function recordFailure(ip) {
  const now = Date.now();
  const state = attempts.get(ip);
  const count = state && state.windowStart + WINDOW_MS > now ? state.count + 1 : 1;
  attempts.set(ip, { count, windowStart: state && count > 1 ? state.windowStart : now, blockedUntil: count >= MAX_ATTEMPTS ? now + WINDOW_MS : 0 });
  return count >= MAX_ATTEMPTS;
}

export const clearFailures = (ip) => attempts.delete(ip);

export function checkCredentials(submittedUser, submittedPassword) {
  if (!isConfigured()) return false;
  const userMatches = secureEqual(sign(`user:${String(submittedUser || "")}`), sign(`user:${username()}`));
  const passwordMatches = secureEqual(sign(`password:${String(submittedPassword || "")}`), sign(`password:${password()}`));
  return userMatches && passwordMatches;
}

export function createSessionCookie() {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + SESSION_MS })).toString("base64url");
  const token = `${payload}.${sign(payload).toString("base64url")}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secureCookie() ? "; Secure" : ""}`;
}

export const clearSessionCookie = () => `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie() ? "; Secure" : ""}`;

export function hasSession(request) {
  if (!isConfigured()) return false;
  const [payload, signature] = String(request.cookies?.[COOKIE_NAME] || "").split(".");
  if (!payload || !signature) return false;
  if (!secureEqual(Buffer.from(signature, "base64url"), sign(payload))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).expires > Date.now(); } catch { return false; }
}
