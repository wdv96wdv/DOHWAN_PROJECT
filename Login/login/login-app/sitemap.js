import { SitemapStream } from 'sitemap';
import { createWriteStream, existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase 설정 (src/utils/supabaseClient.js 참고)
const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
const supabase = createClient(supabaseUrl, supabaseKey);

const HOSTNAME = 'https://dorunning.vercel.app';

/** Paths robots.txt Disallow — never put these in the sitemap. */
const ROBOTS_DISALLOW = new Set([
  '/login',
  '/join',
  '/user',
  '/wishlist',
  '/record',
  '/admin',
  '/boards/insert',
  '/recommend/result',
]);

function isDisallowed(urlPath) {
  if (ROBOTS_DISALLOW.has(urlPath)) return true;
  if (urlPath.startsWith('/boards/update/')) return true;
  if (urlPath.startsWith('/admin')) return true;
  if (urlPath.startsWith('/user')) return true;
  return false;
}

function hasValidId(id) {
  if (id === null || id === undefined) return false;
  const s = String(id).trim();
  return s.length > 0 && s !== 'null' && s !== 'undefined';
}

async function writeSitemapFile(filePath, links) {
  const stream = new SitemapStream({ hostname: HOSTNAME });
  const writeStream = createWriteStream(filePath);
  stream.pipe(writeStream);
  for (const link of links) {
    stream.write(link);
  }
  stream.end();
  await new Promise((resolvePromise, reject) => {
    writeStream.on('finish', resolvePromise);
    writeStream.on('error', reject);
  });
}

async function generateSitemap() {
  console.log('데이터 수집 중...');

  // Align with public/robots.txt — no auth/personal routes
  const staticLinks = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/calendar', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
    { url: '/course', changefreq: 'monthly', priority: 0.7 },
    { url: '/event', changefreq: 'monthly', priority: 0.7 },
    { url: '/marathon', changefreq: 'daily', priority: 0.9 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { url: '/boards', changefreq: 'daily', priority: 0.8 },
    { url: '/performance', changefreq: 'weekly', priority: 0.8 },
    { url: '/recommend', changefreq: 'weekly', priority: 0.8 },
  ].filter((l) => !isDisallowed(l.url));

  // 1. 마라톤 데이터
  const { data: marathons, error: marathonError } = await supabase
    .from('marathons')
    .select('id, created_at, poster_url');

  if (marathonError) {
    console.warn('marathons fetch warning:', marathonError.message);
  }

  const marathonLinks = (marathons || [])
    .filter((m) => hasValidId(m.id))
    .map((m) => ({
      url: `/marathon/${m.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: m.created_at,
      img: m.poster_url ? [{ url: m.poster_url }] : undefined,
    }));

  // 2. 게시판 상세 (robots allow /boards/:id; only insert/update disallowed)
  const { data: boards, error: boardError } = await supabase
    .from('boards')
    .select('id, created_at');

  if (boardError) {
    console.warn('boards fetch warning:', boardError.message);
  }

  const boardLinks = (boards || [])
    .filter((b) => hasValidId(b.id))
    .map((b) => ({
      url: `/boards/${b.id}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: b.created_at,
    }))
    .filter((l) => !isDisallowed(l.url));

  const allLinks = [...staticLinks, ...marathonLinks, ...boardLinks];

  // Always update public/ so the committed source stays in sync for local/dev.
  const publicPath = resolve('public', 'sitemap.xml');
  await writeSitemapFile(publicPath, allLinks);
  console.log(`wrote ${publicPath}`);

  // postbuild runs after `vite build`, which already copied public/ → dist/.
  // Rewrite dist/sitemap.xml so the deploy artifact is the regenerated file.
  const distDir = resolve('dist');
  if (existsSync(distDir)) {
    const distPath = resolve(distDir, 'sitemap.xml');
    copyFileSync(publicPath, distPath);
    console.log(`copied → ${distPath} (Vercel serves this from build output)`);
  } else {
    console.log('dist/ not found — skipped dist copy (run via postbuild after vite build to ship it)');
  }

  console.log(`sitemap.xml 생성 완료! (총 ${allLinks.length}개: static ${staticLinks.length}, marathon ${marathonLinks.length}, board ${boardLinks.length})`);
  process.exit(0);
}

generateSitemap().catch((err) => {
  console.error('사이트맵 생성 오류:', err);
  process.exit(1);
});
