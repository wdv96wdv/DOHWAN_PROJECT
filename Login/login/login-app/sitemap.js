import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('사이트맵 생성 시작...');

  // 공개적으로 색인되어야 하는 정적 페이지 목록 (로그인/가입/개인기록 등 제외)
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
  ];

  // 1. 마라톤 데이터 가져오기 (유효한 ID만 포함)
  const { data: marathons, error: marathonErr } = await supabase
    .from('marathons')
    .select('id, created_at, poster_url');

  if (marathonErr) {
    console.warn('마라톤 데이터 조회 오류:', marathonErr);
  }

  const marathonLinks = (marathons || [])
    .filter(m => m && m.id != null && String(m.id).trim() !== '')
    .map(m => ({
      url: `/marathon/${m.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: m.created_at,
      img: m.poster_url ? [{ url: m.poster_url }] : []
    }));

  // 2. 게시판 데이터 가져오기 (유효한 ID만 포함)
  const { data: boards, error: boardErr } = await supabase
    .from('boards')
    .select('id, created_at');

  if (boardErr) {
    console.warn('게시판 데이터 조회 오류:', boardErr);
  }

  const boardLinks = (boards || [])
    .filter(b => b && b.id != null && String(b.id).trim() !== '')
    .map(b => ({
      url: `/boards/${b.id}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: b.created_at
    }));

  const allLinks = [...staticLinks, ...marathonLinks, ...boardLinks];

  const stream = new SitemapStream({ hostname: 'https://dorunning.vercel.app' });
  allLinks.forEach(link => stream.write(link));
  stream.end();

  const xmlBuffer = await streamToPromise(stream);
  const sitemapPath = resolve('public', 'sitemap.xml');

  // 파일 전체를 안전하게 덮어써서 이전 잔여 바이트 발생 방지
  writeFileSync(sitemapPath, xmlBuffer.toString());

  console.log(`sitemap.xml 생성 완료! (총 ${allLinks.length}개의 경로)`);
  process.exit(0);
}

generateSitemap().catch(err => {
  console.error('사이트맵 생성 오류:', err);
  process.exit(1);
});
