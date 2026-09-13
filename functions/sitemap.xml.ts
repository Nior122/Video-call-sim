import { DEFAULT_PERSONAS } from "../src/data/defaultPersonas";

export async function onRequestGet({ request }: any) {
  const url = new URL(request.url);
  const baseUrl = "https://dreambabe.pages.dev";

  let slugs = DEFAULT_PERSONAS.map((p) => p.slug);

  // Attempt to fetch latest dynamic personas from API if reachable
  try {
    const apiRes = await fetch(`${url.origin}/api/personas`, {
      headers: { Accept: "application/json" }
    });
    if (apiRes.ok) {
      const data: any = await apiRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const dynamicSlugs = data.map((p: any) => p.slug).filter(Boolean);
        if (dynamicSlugs.length > 0) {
          slugs = Array.from(new Set([...slugs, ...dynamicSlugs]));
        }
      }
    }
  } catch (_) {
    // Fall back to default personas
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slugs
  .map(
    (slug) => `  <url>
    <loc>${baseUrl}/dreamgirl/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
