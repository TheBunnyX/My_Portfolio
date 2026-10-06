import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { get, put } from "@vercel/blob";

// Vercel's filesystem is read-only at runtime, so edits made in the admin panel are stored in
// Vercel Blob. data/content.json ships with the deployment as the starting content.
const BLOB_PATH = process.env.CONTENT_BLOB_PATH || "portfolio/content.json";
const BLOB_ACCESS = process.env.BLOB_ACCESS === "public" ? "public" : "private";
const seedFile = join(process.cwd(), "data", "content.json");

export const hasBlobStore = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function loadSeed() {
  if (!existsSync(seedFile)) return null;
  try { return JSON.parse(readFileSync(seedFile, "utf8").replace(/^﻿/, "")); } catch { return null; }
}

export async function loadContent() {
  if (hasBlobStore()) {
    const result = await get(BLOB_PATH, { access: BLOB_ACCESS, useCache: false });
    if (result?.stream) return JSON.parse(await new Response(result.stream).text());
  }
  return loadSeed();
}

export async function saveContent(content) {
  await put(BLOB_PATH, JSON.stringify(content), { access: BLOB_ACCESS, contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}
