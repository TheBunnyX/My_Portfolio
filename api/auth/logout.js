import { clearSessionCookie, isSameOrigin, send } from "../_lib/auth.js";

export default function handler(request, response) {
  if (!isSameOrigin(request)) return send(response, 403, { error: "Invalid request origin." });
  if (request.method !== "POST") return send(response, 404, { error: "Not found." });
  return send(response, 204, {}, { "Set-Cookie": clearSessionCookie() });
}
