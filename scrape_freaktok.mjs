import { chromium } from '@playwright/test';
import * as fs from 'fs';

const TARGET = 'https://freaktok.com/';
const MAX_URLS = 10;

function isMediaUrl(u) {
  return /\.(mp4|webm|m3u8|mov|flv|mkv)(\?|#|$)/i.test(u);
}

async function validateVideoUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Range: 'bytes=0-1024',
        Referer: 'https://freaktok.com/',
      },
      redirect: 'follow',
    });
    const ct = res.headers.get('content-type') || '';
    const ok = res.status === 200 || res.status === 206;
    const isVideo =
      ct.startsWith('video/') || isMediaUrl(url) || ct.includes('mpegurl') || ct.includes('octet-stream');
    return ok && isVideo;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`Launching browser for ${TARGET} ...`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    console.log('Using Microsoft Edge (headless)');
  } catch {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
      console.log('Using Google Chrome (headless)');
    } catch {
      console.log('No Edge/Chrome found, falling back to bundled Chromium...');
      browser = await chromium.launch({ headless: true });
    }
  }
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  // --- Collect media URLs observed over the network ---
  const networkMediaUrls = new Set();
  page.on('request', (req) => {
    const u = req.url();
    if (isMediaUrl(u)) networkMediaUrls.add(u);
  });
  page.on('response', (res) => {
    const ct = res.headers()['content-type'] || '';
    if (ct.startsWith('video/') || ct.includes('mpegurl')) networkMediaUrls.add(res.url());
  });

  // --- Load the page ---
  await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 90000 });

  // Wait for any challenge to auto-resolve (up to 90s)
  for (let i = 0; i < 30; i++) {
    const title = await page.title().catch(() => '');
    if (!/just a moment|attention required|checking your browser|verify you are human/i.test(title)) {
      console.log(`Challenge cleared after ~${i * 3}s. Title: ${title}`);
      break;
    }
    await page.waitForTimeout(3000);
  }
  const finalTitle = await page.title().catch(() => '');
  console.log(`Current page title: ${finalTitle}`);

  await page
    .waitForLoadState('networkidle', { timeout: 45000 })
    .catch(() => console.log('(networkidle timed out, continuing anyway)'));
  await page.waitForTimeout(3000);

  // --- Scroll down repeatedly to trigger lazy loading and video previews ---
  for (let i = 0; i < 15; i++) {
    await page.evaluate('window.scrollBy(0, Math.floor(window.innerHeight * 0.8))');
    await page.waitForTimeout(1200);
  }

  // --- Hover over video tiles to trigger preview playback (network URLs) ---
  const tiles = page.locator('video, [class*="video"], [class*="thumb"], [class*="item"], a[href*="video"]');
  const tileCount = Math.min(await tiles.count().catch(() => 0), 30);
  for (let i = 0; i < tileCount; i++) {
    await tiles.nth(i).scrollIntoViewIfNeeded().catch(() => {});
    await tiles.nth(i).hover().catch(() => {});
    await page.waitForTimeout(300);
  }

  await page.waitForTimeout(3000);

  // --- Extract everything from the DOM (string-based evaluate) ---
  const domData = await page.evaluate(`(() => {
    const abs = (u) => {
      if (!u) return null;
      try { return new URL(u, location.href).href; } catch { return null; }
    };

    const directVideos = new Set();
    const embeds = new Set();
    const videoPageLinks = new Set();
    const thumbs = new Set();

    document.querySelectorAll('video, video source').forEach((el) => {
      const src = el.currentSrc || el.src || el.getAttribute('src');
      const u = abs(src);
      if (u && !u.startsWith('blob:')) directVideos.add(u);
    });

    document.querySelectorAll('iframe').forEach((el) => {
      const u = abs(el.getAttribute('src'));
      if (u) embeds.add(u);
    });

    document.querySelectorAll('a[href]').forEach((el) => {
      const u = abs(el.getAttribute('href'));
      if (!u) return;
      if (/\\.(mp4|webm|m3u8|mov|flv)(\\?|#|$)/i.test(u)) {
        directVideos.add(u);
      } else if (/\\/(video|videos|watch|clip|embed)\\b/i.test(u)) {
        videoPageLinks.add(u);
      }
    });

    document.querySelectorAll('img').forEach((el) => {
      const u = abs(el.getAttribute('data-src') || el.getAttribute('data-original') || el.src);
      if (u) thumbs.add(u);
    });

    const scriptUrls = new Set();
    document.querySelectorAll('script').forEach((s) => {
      const text = s.textContent || '';
      (text.match(/https?:\\/\\/[^\\s"'()\\\\]+\\.(?:mp4|webm|m3u8)/gi) || []).forEach((m) => scriptUrls.add(m));
    });

    document.querySelectorAll('[data-video], [data-src], [data-mp4], [data-poster], [data-file]').forEach((el) => {
      ['data-video', 'data-src', 'data-mp4', 'data-file'].forEach((attr) => {
        const u = abs(el.getAttribute(attr));
        if (u && /\\.(mp4|webm|m3u8)/i.test(u)) directVideos.add(u);
      });
    });

    return {
      title: document.title,
      directVideos: [...directVideos],
      scriptUrls: [...scriptUrls],
      embeds: [...embeds],
      videoPageLinks: [...videoPageLinks],
      thumbs: [...thumbs],
    };
  })()`);

  // --- Merge candidates (prefer direct mp4/webm, then m3u8, then network) ---
  const candidates = [...new Set([...domData.directVideos, ...domData.scriptUrls, ...networkMediaUrls])];
  const preferred = candidates.filter((u) => /\.(mp4|webm)(\?|#|$)/i.test(u));
  const rest = candidates.filter((u) => !preferred.includes(u));
  const ordered = [...preferred, ...rest];

  console.log(`\nFound ${candidates.length} candidate media URLs. Validating...`);

  // --- Validate each candidate until we have MAX_URLS valid ones ---
  const validUrls = [];
  for (const url of ordered) {
    if (validUrls.length >= MAX_URLS) break;
    if (await validateVideoUrl(url)) {
      validUrls.push(url);
      console.log(`VALID (${validUrls.length}/${MAX_URLS}): ${url}`);
    } else {
      console.log(`invalid: ${url.slice(0, 120)}`);
    }
  }

  // --- Save results ---
  const result = {
    page: TARGET,
    pageTitle: domData.title,
    validVideoUrls: validUrls,
    candidateCount: candidates.length,
    videoPageUrls: domData.videoPageLinks,
    embedPlayerUrls: domData.embeds,
  };
  fs.writeFileSync('freaktok_videos.json', JSON.stringify(result, null, 2));

  console.log('\n========== RESULTS ==========');
  console.log(`Page title: ${domData.title}`);
  console.log(`\n--- Valid video URLs (${validUrls.length}) ---`);
  validUrls.forEach((u) => console.log(u));
  console.log('\nResults saved to freaktok_videos.json');

  await browser.close();

  if (validUrls.length === 0) {
    console.log('\nNo direct media found on the homepage. Video page links to visit next:');
    domData.videoPageLinks.slice(0, 15).forEach((u) => console.log(u));
  }
}

main().catch((e) => {
  console.error('Scrape failed:', e);
  process.exit(1);
});
