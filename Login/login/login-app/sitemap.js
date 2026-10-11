import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
const supabase = createClient(supabaseUrl, supabaseKey);

const HOSTNAME = 'https://dorunning.vercel.app';

/** robots.txt 차단 경로 및 삭제된 페이지 - 사이트맵 제외 */
const ROBOTS_DISALLOW = new Set([
  '/login',
  '/join',
  '/user',
  '/wishlist',
  '/record',
  '/admin',
  '/boards/insert',
  '/recommend',
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

async function generateSitemap() {
  console.log('사이트맵 생성 시작...');

  // 공개 정적 페이지 목록
  const staticLinks = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/marathon', changefreq: 'daily', priority: 0.9 },
    { url: '/boards', changefreq: 'daily', priority: 0.8 },
    { url: '/course', changefreq: 'weekly', priority: 0.8 },
    { url: '/event', changefreq: 'weekly', priority: 0.8 },
    { url: '/performance', changefreq: 'weekly', priority: 0.8 },
    { url: '/calendar', changefreq: 'weekly', priority: 0.7 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
  ].filter(l => !isDisallowed(l.url));

  // 1. 마라톤 데이터
  const { data: marathons, error: marathonError } = await supabase
    .from('marathons')
    .select('id, created_at, poster_url');

  if (marathonError) {
    console.warn('marathons fetch warning:', marathonError.message);
  }

  const marathonLinks = (marathons || [])
    .filter(m => hasValidId(m.id))
    .map(m => ({
      url: `/marathon/${m.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: m.created_at,
      img: m.poster_url ? [{ url: m.poster_url }] : undefined,
    }));

  // 2. 게시판 데이터
  const { data: boards, error: boardError } = await supabase
    .from('boards')
    .select('id, created_at');

  if (boardError) {
    console.warn('boards fetch warning:', boardError.message);
  }

  const boardLinks = (boards || [])
    .filter(b => hasValidId(b.id))
    .map(b => ({
      url: `/boards/${b.id}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: b.created_at,
    }))
    .filter(l => !isDisallowed(l.url));

  const allLinks = [...staticLinks, ...marathonLinks, ...boardLinks];

  const stream = new SitemapStream({ hostname: HOSTNAME });
  allLinks.forEach(link => stream.write(link));
  stream.end();

  const xmlBuffer = await streamToPromise(stream);
  const publicPath = resolve('public', 'sitemap.xml');

  // public/sitemap.xml 완전 덮어쓰기 (잔여 바이트 방지)
  writeFileSync(publicPath, xmlBuffer.toString());
  console.log(`wrote ${publicPath}`);

  // dist/ 가 있으면 배포용 결과물 동기화
  const distDir = resolve('dist');
  if (existsSync(distDir)) {
    const distPath = resolve(distDir, 'sitemap.xml');
    copyFileSync(publicPath, distPath);
    console.log(`copied → ${distPath}`);
  }

  console.log(`sitemap.xml 생성 완료! (총 ${allLinks.length}개: static ${staticLinks.length}, marathon ${marathonLinks.length}, board ${boardLinks.length})`);
  process.exit(0);
}

generateSitemap().catch(err => {
  console.error('사이트맵 생성 오류:', err);
  process.exit(1);
});
