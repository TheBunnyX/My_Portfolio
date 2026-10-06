import { checkCredentials, clearFailures, clientIp, createSessionCookie, isBlocked, isConfigured, isSameOrigin, recordFailure, send } from "../_lib/auth.js";

export default function handler(request, response) {
  if (!isSameOrigin(request)) return send(response, 403, { error: "Invalid request origin." });
  if (request.method !== "POST") return send(response, 404, { error: "Not found." });
  if (!isConfigured()) return send(response, 503, { error: "Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD." });

  const ip = clientIp(request);
  if (isBlocked(ip)) return send(response, 429, { error: "Too many attempts. Try again later." });

  let body;
  try { body = request.body || {}; } catch { return send(response, 400, { error: "Invalid request." }); }

  if (!checkCredentials(body.username, body.password)) {
    const blocked = recordFailure(ip);
    return send(response, blocked ? 429 : 401, { error: blocked ? "Too many attempts. Try again later." : "Invalid admin credentials." });
  }

  clearFailures(ip);
  return send(response, 200, { authenticated: true }, { "Set-Cookie": createSessionCookie() });
}
