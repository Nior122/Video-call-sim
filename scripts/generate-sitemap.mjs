import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const defaultPersonasPath = path.join(rootDir, "src", "data", "defaultPersonas.ts");

const BASE_URL = "https://dreambabe.pages.dev";

let slugs = [];

if (fs.existsSync(defaultPersonasPath)) {
  const fileContent = fs.readFileSync(defaultPersonasPath, "utf8");
  const matches = [...fileContent.matchAll(/slug:\s*["']([^"']+)["']/g)];
  slugs = [...new Set(matches.map((m) => m[1]))];
}

if (slugs.length === 0) {
  slugs = ["maya", "sofia", "chloe", "amara", "bigtittygothegg"];
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slugs
  .map(
    (slug) => `  <url>
    <loc>${BASE_URL}/dreamgirl/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const publicDir = path.join(rootDir, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");

const distDir = path.join(rootDir, "dist");
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");
}

console.log(`Successfully generated sitemap.xml with ${slugs.length} profile URLs:`, slugs);
