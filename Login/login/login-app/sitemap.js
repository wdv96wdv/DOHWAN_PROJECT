import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase 설정 (src/utils/supabaseClient.js 참고)
const supabaseUrl = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const supabaseKey = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('데이터 수집 중...');

  const staticLinks = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/login', changefreq: 'weekly', priority: 0.5 },
    { url: '/join', changefreq: 'weekly', priority: 0.5 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/calendar', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
    { url: '/course', changefreq: 'monthly', priority: 0.7 },
    { url: '/event', changefreq: 'monthly', priority: 0.7 },
    { url: '/marathon', changefreq: 'daily', priority: 0.9 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { url: '/wishlist', changefreq: 'monthly', priority: 0.6 },
    { url: '/boards', changefreq: 'daily', priority: 0.8 },
    { url: '/performance', changefreq: 'weekly', priority: 0.8 },
    { url: '/recommend', changefreq: 'weekly', priority: 0.8 },
    { url: '/record', changefreq: 'weekly', priority: 0.7 },
  ];

  // 1. 마라톤 데이터 가져오기
  const { data: marathons } = await supabase
    .from('marathons')
    .select('id, created_at, poster_url');

  const marathonLinks = (marathons || []).map(m => ({
    url: `/marathon/${m.id}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: m.created_at,
    img: m.poster_url ? [{ url: m.poster_url }] : []
  }));

  // 2. 게시판 데이터 가져오기
  const { data: boards } = await supabase
    .from('boards')
    .select('no, created_at');

  const boardLinks = (boards || []).map(b => ({
    url: `/boards/${b.no}`,
    changefreq: 'daily',
    priority: 0.7,
    lastmod: b.created_at
  }));

  const allLinks = [...staticLinks, ...marathonLinks, ...boardLinks];

  const sitemapPath = resolve('public', 'sitemap.xml');
  const writeStream = createWriteStream(sitemapPath);
  const stream = new SitemapStream({ hostname: 'https://dorunning.vercel.app' });
  
  stream.pipe(writeStream);
  allLinks.forEach(link => stream.write(link));
  stream.end();

  // sitemap 스트림과 파일 쓰기 스트림이 모두 완료될 때까지 기다림
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  console.log(`sitemap.xml 생성 완료! (총 ${allLinks.length}개의 경로)`);
  process.exit(0);
}

generateSitemap().catch(err => {
  console.error('사이트맵 생성 오류:', err);
  process.exit(1);
});

