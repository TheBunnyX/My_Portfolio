import { hasSession, isSameOrigin, send } from "./_lib/auth.js";
import { hasBlobStore, loadContent, saveContent } from "./_lib/store.js";

export default async function handler(request, response) {
  if (!isSameOrigin(request)) return send(response, 403, { error: "Invalid request origin." });

  if (request.method === "GET") {
    try {
      return send(response, 200, { content: await loadContent() });
    } catch (error) {
      console.error("Unable to load content:", error);
      return send(response, 500, { error: "Unable to load saved content." });
    }
  }

  if (request.method !== "POST") return send(response, 404, { error: "Not found." });
  if (!hasSession(request)) return send(response, 401, { error: "Authentication required." });
  if (!hasBlobStore()) return send(response, 503, { error: "Content storage is not configured. Connect a Vercel Blob store to this project." });

  let content;
  try { content = request.body?.content; } catch { return send(response, 400, { error: "Invalid content." }); }
  if (!content || typeof content !== "object" || Array.isArray(content)) return send(response, 400, { error: "Invalid content." });

  try {
    await saveContent(content);
    return send(response, 200, { saved: true });
  } catch (error) {
    console.error("Unable to save content:", error);
    return send(response, 500, { error: "Unable to save content." });
  }
}
