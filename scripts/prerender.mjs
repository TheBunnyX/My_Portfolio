// Runs after `vite build`: renders the portfolio to static HTML and writes the SEO files
// (meta tags, structured data, robots.txt, sitemap.xml) into dist/.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(".");
const dist = join(root, "dist");
const ssrDir = join(root, ".ssr");

// Canonical origin: SITE_URL wins (custom domain), otherwise Vercel's production domain.
const rawSiteUrl = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const absolute = (path) => (/^https?:\/\//.test(path) ? path : `${siteUrl}${path}`);

const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isRealProfileUrl = (url) => { try { return new URL(url).pathname.replace(/\/+$/, "").length > 0; } catch { return false; } };

// Uploaded files are stored inline as data: URIs; keep them out of the static HTML so it stays small.
const stripInlineFiles = (value) => {
  if (typeof value === "string") return value.startsWith("data:") ? "" : value;
  if (Array.isArray(value)) return value.map(stripInlineFiles);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stripInlineFiles(item)]));
  return value;
};

async function loadSavedContent() {
  try {
    const { loadContent } = await import("../api/_lib/store.js");
    return await loadContent();
  } catch (error) {
    console.warn(`prerender: could not read saved content (${error.message}); using defaults.`);
    return null;
  }
}

function describe(profile) {
  const bio = String(profile.bio || "").trim();
  const firstSentence = bio.match(/^.*?[.!?](?=\s|$)/)?.[0] || bio;
  if (firstSentence.length <= 170) return firstSentence;
  return `${firstSentence.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

function buildStructuredData(content, description, imageUrl) {
  const { profile } = content;
  const personId = `${siteUrl}/#person`;
  const currentJob = (content.experiences || []).find((item) => /present/i.test(item.dates || ""));
  const person = {
    "@type": "Person",
    ...(siteUrl ? { "@id": personId, url: `${siteUrl}/` } : {}),
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(profile.location ? { homeLocation: { "@type": "Place", name: profile.location } } : {}),
    sameAs: [profile.linkedin, profile.github].filter(isRealProfileUrl),
    ...(currentJob ? { worksFor: { "@type": "Organization", name: currentJob.company } } : {}),
    alumniOf: (content.education?.schools || []).filter((item) => item.school).map((item) => ({ "@type": "CollegeOrUniversity", name: item.school })),
    knowsAbout: [...new Set((content.stack || []).flatMap((group) => (group.items || []).map((item) => item.name)).filter(Boolean))],
    hasCredential: (content.certifications || []).filter((item) => item.title).map((item) => ({
      "@type": "EducationalOccupationalCredential",
      name: item.title,
      ...(item.issuer ? { recognizedBy: { "@type": "Organization", name: item.issuer } } : {}),
    })),
  };
  const graph = [person];
  if (siteUrl) {
    graph.push(
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: `${siteUrl}/`, name: `${profile.name} | ${profile.role}`, description, inLanguage: "en", publisher: { "@id": personId } },
      { "@type": "ProfilePage", "@id": `${siteUrl}/#profilepage`, url: `${siteUrl}/`, name: `${profile.name} | ${profile.role}`, isPartOf: { "@id": `${siteUrl}/#website` }, mainEntity: { "@id": personId }, dateModified: new Date().toISOString() },
    );
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function buildHead(content) {
  const { profile } = content;
  const title = `${profile.name} | ${profile.role}`;
  const description = describe(profile);
  const socialImage = siteUrl ? absolute("/og-image.jpg") : "";
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="author" content="${escapeHtml(profile.name)}" />`,
    siteUrl && `<link rel="canonical" href="${siteUrl}/" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${escapeHtml(profile.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    siteUrl && `<meta property="og:url" content="${siteUrl}/" />`,
    socialImage && `<meta property="og:image" content="${socialImage}" />`,
    socialImage && `<meta property="og:image:width" content="1200" />`,
    socialImage && `<meta property="og:image:height" content="630" />`,
    socialImage && `<meta property="og:image:alt" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:card" content="${socialImage ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    socialImage && `<meta name="twitter:image" content="${socialImage}" />`,
    profile.image && `<link rel="preload" as="image" href="${escapeHtml(profile.image)}" fetchpriority="high" />`,
    `<script type="application/ld+json">${buildStructuredData(content, description, profile.image && siteUrl ? absolute(profile.image) : "")}</script>`,
  ];
  return tags.filter(Boolean).join("\n    ");
}

const { prepareContent, render } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);
const content = stripInlineFiles(prepareContent(await loadSavedContent()));

const indexFile = join(dist, "index.html");
const template = readFileSync(indexFile, "utf8");
if (!/<!-- seo:start[\s\S]*?seo:end -->/.test(template) || !template.includes("<!--app-html-->")) {
  throw new Error("prerender: dist/index.html is missing the seo or app-html placeholders.");
}
const html = template
  .replace(/<!-- seo:start[\s\S]*?seo:end -->/, () => buildHead(content))
  .replace("<!--app-html-->", () => render(content));
writeFileSync(indexFile, html);

const robots = ["User-agent: *", "Allow: /", "Disallow: /api/", siteUrl && `\nSitemap: ${siteUrl}/sitemap.xml`].filter(Boolean).join("\n");
writeFileSync(join(dist, "robots.txt"), `${robots}\n`);

if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`);
} else {
  if (existsSync(join(dist, "sitemap.xml"))) rmSync(join(dist, "sitemap.xml"));
  console.warn("prerender: SITE_URL is not set, so canonical, og:url, og:image and sitemap.xml were skipped.");
}

rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender: wrote dist/index.html (${(html.length / 1024).toFixed(1)} kB) for ${siteUrl || "an unknown site URL"}`);
