import { chromium } from '@playwright/test';
import * as fs from 'fs';

const TARGET = 'https://www.twpornstars.com/MissBNasty';

async function main() {
  console.log(`Launching browser for ${TARGET} ...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  // --- Collect media URLs observed over the network ---
  const networkMediaUrls = new Set<string>();
  page.on('request', (req) => {
    const u = req.url();
    if (/\.(mp4|webm|m3u8|mov|flv|mkv)(\?|#|$)/i.test(u)) networkMediaUrls.add(u);
  });
  page.on('response', (res) => {
    const ct = res.headers()['content-type'] || '';
    if (ct.startsWith('video/')) networkMediaUrls.add(res.url());
  });

  // --- Load the page ---
  await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page
    .waitForLoadState('networkidle', { timeout: 45000 })
    .catch(() => console.log('(networkidle timed out, continuing anyway)'));
  await page.waitForTimeout(3000);

  // --- Scroll down repeatedly to trigger lazy loading ---
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  }

  // --- Click a "load more" style button if one exists ---
  const moreBtn = page
    .locator('button, a')
    .filter({ hasText: /load more|show more|more videos|ver más/i })
    .first();
  if (await moreBtn.isVisible().catch(() => false)) {
    console.log('Found a "load more" control, clicking it...');
    await moreBtn.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  await page.waitForTimeout(2000);

  // --- Extract everything from the DOM ---
  const domData = await page.evaluate(() => {
    const abs = (u: string | null | undefined): string | null => {
      if (!u) return null;
      try {
        return new URL(u, location.href).href;
      } catch {
        return null;
      }
    };

    const directVideos = new Set<string>();
    const embeds = new Set<string>();
    const videoPageLinks = new Set<string>();
    const thumbs = new Set<string>();

    // <video> / <source> elements
    document.querySelectorAll('video, video source').forEach((el) => {
      const src =
        (el as HTMLVideoElement).currentSrc ||
        (el as HTMLVideoElement).src ||
        el.getAttribute('src');
      const u = abs(src);
      if (u) directVideos.add(u);
    });

    // iframes (embedded players)
    document.querySelectorAll('iframe').forEach((el) => {
      const u = abs(el.getAttribute('src'));
      if (u) embeds.add(u);
    });

    // anchors
    document.querySelectorAll('a[href]').forEach((el) => {
      const u = abs((el as HTMLAnchorElement).getAttribute('href'));
      if (!u) return;
      if (/\.(mp4|webm|m3u8|mov|flv)(\?|#|$)/i.test(u)) {
        directVideos.add(u);
      } else if (/\/(video|videos|watch|clip|embed)\b/i.test(u)) {
        videoPageLinks.add(u);
      }
    });

    // thumbnails (useful as video posters)
    document.querySelectorAll('img').forEach((el) => {
      const u = abs(el.getAttribute('data-src') || el.getAttribute('data-original') || (el as HTMLImageElement).src);
      if (u) thumbs.add(u);
    });

    // any media URLs hidden inside inline scripts (players/configs)
    const scriptUrls = new Set<string>();
    document.querySelectorAll('script').forEach((s) => {
      const text = s.textContent || '';
      (text.match(/https?:\/\/[^\s"'()]+\.(?:mp4|webm|m3u8)/gi) || []).forEach((m) =>
        scriptUrls.add(m)
      );
    });

    // video elements with data attributes
    document.querySelectorAll('[data-video], [data-src*="video"], [data-mp4]').forEach((el) => {
      ['data-video', 'data-src', 'data-mp4'].forEach((attr) => {
        const u = abs(el.getAttribute(attr));
        if (u && /\.(mp4|webm|m3u8)/i.test(u)) directVideos.add(u);
      });
    });

    return {
      title: document.title,
      directVideos: [...directVideos],
      scriptUrls: [...scriptUrls],
      embeds: [...embeds],
      videoPageLinks: [...videoPageLinks],
      thumbs: [...thumbs],
      html: document.documentElement.outerHTML,
    };
  });

  const result = {
    page: TARGET,
    pageTitle: domData.title,
    directVideoUrls: [...new Set([...domData.directVideos, ...domData.scriptUrls, ...networkMediaUrls])],
    embedPlayerUrls: domData.embeds,
    videoPageUrls: domData.videoPageLinks,
    thumbnailUrls: domData.thumbs,
  };

  // --- Save results ---
  fs.writeFileSync('video_urls.json', JSON.stringify(result, null, 2));
  fs.writeFileSync('page_dump.html', domData.html);

  console.log('\n========== RESULTS ==========');
  console.log(`Page title: ${result.pageTitle}`);

  console.log(`\n--- Direct video file URLs (${result.directVideoUrls.length}) ---`);
  result.directVideoUrls.forEach((u) => console.log(u));

  console.log(`\n--- Video page links (${result.videoPageUrls.length}) ---`);
  result.videoPageUrls.forEach((u) => console.log(u));

  console.log(`\n--- Embedded player URLs (${result.embedPlayerUrls.length}) ---`);
  result.embedPlayerUrls.forEach((u) => console.log(u));

  console.log(`\n--- Thumbnails (${result.thumbnailUrls.length}) ---`);
  result.thumbnailUrls.slice(0, 20).forEach((u) => console.log(u));

  console.log('\nFull results saved to video_urls.json (HTML snapshot in page_dump.html)');

  await browser.close();
}

main().catch((e) => {
  console.error('Scrape failed:', e);
  process.exit(1);
});