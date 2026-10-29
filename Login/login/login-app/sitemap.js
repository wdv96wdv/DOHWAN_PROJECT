import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
const supabase = createClient(supabaseUrl, supabaseKey);

const HOSTNAME = 'https://dorunning.app';

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

function todayKst() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function daysAgoKst(days) {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fetchAllRows(table, columns) {
  const pageSize = 1000;
  const all = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) {
      console.warn(`${table} fetch warning:`, error.message);
      break;
    }
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
  }
  return all;
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
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
  ].filter(l => !isDisallowed(l.url));

  // 1. 마라톤 데이터
  // 종료된 지 오래된 대회는 사이트맵에서 빼서 크롤 예산을 예정/최근 대회에 집중
  const marathons = await fetchAllRows('marathons', 'id, created_at, race_date, poster_url');
  const today = todayKst();
  const keepAfter = daysAgoKst(60); // 종료 후 2달(60일)까지 사이트맵 유지
  const validMarathons = (marathons || []).filter(m => hasValidId(m.id));
  const sitemapMarathons = validMarathons.filter(m => {
    if (!m.race_date) return true;
    return m.race_date >= keepAfter;
  });
  const skippedPast = validMarathons.length - sitemapMarathons.length;

  const marathonLinks = sitemapMarathons.map(m => {
    const upcoming = !m.race_date || m.race_date >= today;
    return {
      url: `/marathon/${m.id}`,
      changefreq: upcoming ? 'daily' : 'weekly',
      priority: upcoming ? 0.8 : 0.5,
      lastmod: m.race_date || m.created_at,
      img: m.poster_url ? [{ url: m.poster_url }] : undefined,
    };
  });

  // 2. 게시판 데이터
  const boards = await fetchAllRows('boards', 'id, created_at');

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

  console.log(`sitemap.xml 생성 완료! (총 ${allLinks.length}개: static ${staticLinks.length}, marathon ${marathonLinks.length}, board ${boardLinks.length}, skippedPast ${skippedPast})`);
  process.exit(0);
}

generateSitemap().catch(err => {
  console.error('사이트맵 생성 오류:', err);
  process.exit(1);
});
