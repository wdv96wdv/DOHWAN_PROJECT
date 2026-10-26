import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanTitle(title) {
  if (!title) return '';
  return title.replace(/\[.*?\]/g, '').split('|')[0].trim();
}

async function runPosterSync() {
  console.log('🚀 마라톤 포스터 이미지 크롤링 및 동기화 시작...');

  // 1. Fetch domestic URLs from sitemap
  console.log('1. marathongo sitemap.xml 파싱 중...');
  const sitemapRes = await fetch('https://marathongo.co.kr/sitemap.xml', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const sitemapXml = await sitemapRes.text();
  const allLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  // Filter 2026 and 2027 domestic race detail pages
  const targetUrls = allLocs.filter(l => 
    l.includes('/raceDetail/domestic/') && 
    (l.includes('2026') || l.includes('2027') || l.includes('2025'))
  );
  console.log(`2. 대상 국내 대회 URL ${targetUrls.length}개 발견`);

  // 2. Load all upcoming and recent marathons from Supabase without poster_url
  console.log('3. Supabase 마라톤 데이터 조회 중...');
  const { data: dbMarathons, error } = await supabase
    .from('marathons')
    .select('id, title, race_date, poster_url')
    .gte('race_date', '2026-08-01');

  if (error || !dbMarathons) {
    console.error('Supabase 조회 실패:', error);
    return;
  }
  console.log(`Supabase 대상 마라톤: ${dbMarathons.length}개`);

  // Create lookup maps: title+race_date -> item
  const mapExact = new Map();
  for (const m of dbMarathons) {
    const key = `${cleanTitle(m.title)}__${m.race_date}`;
    mapExact.set(key, m);
  }

  // 3. Process URLs with concurrency
  const CONCURRENCY = 8;
  let cursor = 0;
  let updatedCount = 0;

  async function worker() {
    while (cursor < targetUrls.length) {
      const idx = cursor++;
      const url = targetUrls[idx];
      try {
        const pageRes = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (!pageRes.ok) continue;
        const pageHtml = await pageRes.text();
        const nextMatch = pageHtml.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (!nextMatch) continue;

        const json = JSON.parse(nextMatch[1]);
        const rd = json?.props?.pageProps?.raceDetail;
        if (!rd || !rd.raceName || !rd.raceDate) continue;

        const title = cleanTitle(rd.raceName);
        const raceDate = rd.raceDate;
        const slug = rd.raceDetailUrl;
        if (!slug) continue;

        const key = `${title}__${raceDate}`;
        const matched = mapExact.get(key);

        if (matched && (!matched.poster_url || matched.poster_url.includes('thumbnail.png'))) {
          const posterUrl = `https://marathongo.co.kr/assets/image/race/domestic/${slug}.webp`;

          // Quick verify image
          const headRes = await fetch(posterUrl, { method: 'HEAD' });
          if (headRes.status === 200) {
            const { error: updateError } = await supabase
              .from('marathons')
              .update({ poster_url: posterUrl })
              .eq('id', matched.id);

            if (!updateError) {
              updatedCount++;
              console.log(`[${updatedCount}] 포스터 갱신: ${title} (${raceDate})`);
            }
          }
        }
      } catch (err) {
        // ignore individual page error
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`🎉 동기화 완료! 총 ${updatedCount}개 마라톤에 포스터 이미지 연결 완료.`);
}

runPosterSync().catch(console.error);
