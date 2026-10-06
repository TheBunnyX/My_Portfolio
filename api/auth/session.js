import { hasSession, isSameOrigin, send } from "../_lib/auth.js";

export default function handler(request, response) {
  if (!isSameOrigin(request)) return send(response, 403, { error: "Invalid request origin." });
  if (request.method !== "GET") return send(response, 404, { error: "Not found." });
  return hasSession(request) ? send(response, 200, { authenticated: true }) : send(response, 401, { authenticated: false });
}
