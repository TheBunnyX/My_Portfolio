import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";

const root = resolve(".");
const isDev = process.argv.includes("--dev");
const envPath = join(root, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const secureCookie = process.env.COOKIE_SECURE === "true";
if (!username || !password || password === "replace-with-a-long-unique-password") {
  throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before starting the server.");
}

const passwordHash = pbkdf2Sync(password, "portfolio-admin-v1", 210000, 32, "sha256");
const sessions = new Map();
const attempts = new Map();
const SESSION_MS = 4 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_CONTENT_BYTES = 20 * 1024 * 1024;
const contentFile = resolve(root, process.env.CONTENT_DATA_FILE || join("data", "content.json"));

const mimeTypes = { ".css": "text/css", ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".webp": "image/webp" };
const parseCookies = (request) => Object.fromEntries((request.headers.cookie || "").split(";").filter(Boolean).map((item) => { const [key, ...value] = item.trim().split("="); return [key, decodeURIComponent(value.join("="))]; }));
const readJson = (request, maxBytes = 10_000) => new Promise((resolveJson, reject) => { let body = ""; let size = 0; request.on("data", (chunk) => { size += chunk.length; if (size > maxBytes) { reject(new Error("Request too large")); request.destroy(); return; } body += chunk; }); request.on("end", () => { try { resolveJson(JSON.parse(body || "{}")); } catch { reject(new Error("Invalid JSON")); } }); request.on("error", reject); });
const secureEqual = (a, b) => a.length === b.length && timingSafeEqual(a, b);
const clientIp = (request) => request.socket.remoteAddress || "unknown";
// Vite forwards development requests from port 5173 to this local API port.
// SameSite cookies still prevent cross-site requests there; production keeps a strict origin check.
const isSameOrigin = (request) => isDev || !request.headers.origin || request.headers.origin === `http://${request.headers.host}` || request.headers.origin === `https://${request.headers.host}`;

function send(response, status, body, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers });
  response.end(JSON.stringify(body));
}
function getSession(request) {
  const token = parseCookies(request).portfolio_session;
  const session = token && sessions.get(token);
  if (!session || session.expires < Date.now()) { if (token) sessions.delete(token); return null; }
  return { token, session };
}
function loadContent() {
  if (!existsSync(contentFile)) return null;
  try { return JSON.parse(readFileSync(contentFile, "utf8")); } catch { return null; }
}
function saveContent(content) {
  mkdirSync(dirname(contentFile), { recursive: true });
  const temporaryFile = `${contentFile}.${randomBytes(6).toString("hex")}.tmp`;
  writeFileSync(temporaryFile, JSON.stringify(content, null, 2), { encoding: "utf8", mode: 0o600 });
  renameSync(temporaryFile, contentFile);
}
function handleApi(request, response) {
  if (!isSameOrigin(request)) return send(response, 403, { error: "Invalid request origin." });
  if (request.method === "GET" && request.url === "/api/content") return send(response, 200, { content: loadContent() });
  if (request.method === "POST" && request.url === "/api/content") {
    if (!getSession(request)) return send(response, 401, { error: "Authentication required." });
    return readJson(request, MAX_CONTENT_BYTES).then(({ content }) => {
      if (!content || typeof content !== "object" || Array.isArray(content)) return send(response, 400, { error: "Invalid content." });
      saveContent(content);
      return send(response, 200, { saved: true });
    }).catch((error) => send(response, error.message === "Request too large" ? 413 : 400, { error: error.message === "Request too large" ? "Content is too large to save." : "Invalid content." }));
  }
  if (request.method === "GET" && request.url === "/api/auth/session") return getSession(request) ? send(response, 200, { authenticated: true }) : send(response, 401, { authenticated: false });
  if (request.method === "POST" && request.url === "/api/auth/logout") { const active = getSession(request); if (active) sessions.delete(active.token); return send(response, 204, {}, { "Set-Cookie": "portfolio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" }); }
  if (request.method !== "POST" || request.url !== "/api/auth/login") return send(response, 404, { error: "Not found." });
  const ip = clientIp(request); const state = attempts.get(ip); const now = Date.now();
  if (state?.blockedUntil > now) return send(response, 429, { error: "Too many attempts. Try again later." });
  readJson(request).then(({ username: submittedUser, password: submittedPassword }) => {
    const submittedHash = pbkdf2Sync(String(submittedPassword || ""), "portfolio-admin-v1", 210000, 32, "sha256");
    if (submittedUser !== username || !secureEqual(submittedHash, passwordHash)) {
      const count = state && state.windowStart + WINDOW_MS > now ? state.count + 1 : 1;
      attempts.set(ip, { count, windowStart: now, blockedUntil: count >= MAX_ATTEMPTS ? now + WINDOW_MS : 0 });
      return send(response, count >= MAX_ATTEMPTS ? 429 : 401, { error: count >= MAX_ATTEMPTS ? "Too many attempts. Try again later." : "Invalid admin credentials." });
    }
    attempts.delete(ip); const token = randomBytes(32).toString("base64url"); sessions.set(token, { expires: now + SESSION_MS });
    send(response, 200, { authenticated: true }, { "Set-Cookie": `portfolio_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secureCookie ? "; Secure" : ""}` });
  }).catch(() => send(response, 400, { error: "Invalid request." }));
}
function serveStatic(request, response) {
  const requested = request.url === "/admin" || request.url === "/admin/" ? "/admin/index.html" : request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const file = normalize(join(root, "dist", requested));
  if (!file.startsWith(join(root, "dist")) || !existsSync(file) || !statSync(file).isFile()) return response.writeHead(404).end("Not found");
  response.writeHead(200, { "Content-Type": mimeTypes[extname(file)] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY" });
  createReadStream(file).pipe(response);
}

const publicPort = Number(process.env.PORT || (isDev ? 5173 : 3000));
const authPort = Number(process.env.AUTH_PORT || 8787);
const port = isDev ? authPort : publicPort;
const server = createServer((request, response) => request.url.startsWith("/api/") ? handleApi(request, response) : serveStatic(request, response));
server.listen(port, "127.0.0.1", () => console.log(`Portfolio server listening on http://127.0.0.1:${port}`));
if (isDev) {
  const vite = spawn(process.execPath, [join(root, "node_modules", "vite", "bin", "vite.js"), "--host", "0.0.0.0", "--port", String(publicPort)], { stdio: "inherit", cwd: root });
  vite.on("exit", (code) => process.exit(code || 0));
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
