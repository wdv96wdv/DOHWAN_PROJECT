/**
 * Bot / crawler HTML shell with route-specific meta.
 *
 * Used by:
 *   - Vercel Edge middleware rewrite for bots on /marathon/:id, /marathon, /about
 *   - Direct GET /api/seo?path=/marathon/9110 (manual verification)
 *
 * Browsers are NOT sent here (middleware only rewrites bot UAs), so the SPA
 * continues to work normally via vercel.json → index.html.
 *
 * On Vercel, Vite build output is the deployment root; we prefer injecting into
 * the live index.html shell so script hashes stay correct. Fallback builds a
 * minimal document if fetch fails.
 */

const SITE = 'https://dorunning.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';

const STATIC_META = {
  '/about': {
    title: '두러닝 소개 | 전국 마라톤 정보 허브',
    description:
      '두러닝은 전국 마라톤·러닝 대회 일정을 모으고, 접수 전 필요한 정보와 공식 신청 링크를 한곳에서 제공하는 러너 전용 플랫폼입니다.',
    ogTitle: '두러닝 – 전국 마라톤 대회 일정 및 러닝 허브',
    ogDescription:
      '서울부터 지방까지, 다가오는 러닝 대회 일정과 접수 정보를 모았습니다.',
  },
  '/marathon': {
    title: '전국 마라톤 일정·접수 D-Day 캘린더 (2026) | 두러닝',
    description:
      '2026 전국 마라톤·러닝 대회 일정 총정리. 서울·수도권 및 지방 지역별, 거리별(10K·하프·풀) 실시간 접수 상태와 공식 신청 링크를 한곳에서 확인하세요.',
    ogTitle: '전국 마라톤 일정·접수 D-Day 캘린더 | 두러닝',
    ogDescription:
      '2026 다가오는 전국 마라톤 대회 일정, 실시간 접수 현황, 공식 신청 링크 총정리.',
  },
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function todayKst() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function fetchMarathon(id) {
  const url = `${SUPABASE_URL}/rest/v1/marathons?id=eq.${encodeURIComponent(id)}&select=id,title,location,race_date,start_date,end_date,type,poster_url,link`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function typeLabel(type) {
  if (!type) return '';
  if (Array.isArray(type)) return type.filter(Boolean).join(', ');
  return String(type);
}

async function resolveMeta(pathname) {
  const canonical = `${SITE}${pathname === '/' ? '/' : pathname}`;

  if (STATIC_META[pathname]) {
    const s = STATIC_META[pathname];
    return {
      title: s.title,
      description: s.description,
      ogTitle: s.ogTitle || s.title,
      ogDescription: s.ogDescription || s.description,
      ogImage: DEFAULT_OG_IMAGE,
      canonical,
      h1: s.title,
    };
  }

  const detailMatch = pathname.match(/^\/marathon\/([^/]+)\/?$/);
  if (detailMatch) {
    const id = detailMatch[1];
    if (!id || !String(id).trim()) {
      return {
        notFound: true,
        title: '페이지를 찾을 수 없습니다 | 두러닝',
        description: '요청하신 마라톤 상세 페이지가 없습니다.',
        ogTitle: '페이지를 찾을 수 없습니다 | 두러닝',
        ogDescription: '요청하신 마라톤 상세 페이지가 없습니다.',
        ogImage: DEFAULT_OG_IMAGE,
        canonical: `${SITE}/marathon`,
        h1: '페이지를 찾을 수 없습니다',
      };
    }
    const m = await fetchMarathon(id);
    if (!m) {
      return {
        notFound: true,
        title: '페이지를 찾을 수 없습니다 | 두러닝',
        description: '요청하신 마라톤 대회 정보를 찾을 수 없습니다.',
        ogTitle: '페이지를 찾을 수 없습니다 | 두러닝',
        ogDescription: '요청하신 마라톤 대회 정보를 찾을 수 없습니다.',
        ogImage: DEFAULT_OG_IMAGE,
        canonical: `${SITE}/marathon`,
        h1: '페이지를 찾을 수 없습니다',
      };
    }
    const types = typeLabel(m.type);
    const title = `${m.title} 일정·접수·코스 정보 (공식링크) | 두러닝`;

    const descItems = [];
    if (m.race_date) descItems.push(`개최일: ${m.race_date}`);
    if (m.start_date || m.end_date) {
      const regPeriod = [m.start_date, m.end_date].filter(Boolean).join(' ~ ');
      descItems.push(`접수: ${regPeriod}`);
    }
    if (m.location) descItems.push(`장소: ${m.location}`);
    if (types) descItems.push(`종목: ${types}`);

    const descDetail = descItems.length ? `[${descItems.join(' | ')}] ` : '';
    const description = `${descDetail}${m.title} 마라톤 상세 정보. 일정, 접수 방법, 코스 안내 및 공식 참가신청 링크를 두러닝에서 확인하세요.`;

    const ogDescription = descItems.length
      ? descItems.join(' · ')
      : `${m.title} 대회 일정 및 공식 신청 안내`;

    return {
      title,
      description,
      ogTitle: title,
      ogDescription,
      ogImage: m.poster_url || DEFAULT_OG_IMAGE,
      canonical,
      h1: m.title || '마라톤 상세',
      eventName: m.title,
      raceDate: m.race_date,
      startDate: m.start_date,
      endDate: m.end_date,
      location: m.location,
      types,
      officialLink: m.link,
    };
  }

  // Unknown path under this handler — fall back to home-ish meta for safety
  return {
    title: '두러닝 – 전국 마라톤 대회 일정',
    description:
      '두러닝은 전국 마라톤·러닝 대회 일정을 모으고, 신청 전에 필요한 정보를 한곳에서 확인하게 해 주는 러닝 허브입니다.',
    ogTitle: '두러닝 – 전국 마라톤 대회 일정',
    ogDescription:
      '서울부터 지방까지, 다가오는 러닝 대회 일정과 접수 정보를 모았습니다.',
    ogImage: DEFAULT_OG_IMAGE,
    canonical,
    h1: '두러닝 – 전국 마라톤 대회 일정',
  };
}

function articleHtml(meta) {
  const rows = [];
  if (meta.raceDate) rows.push(`<li>개최일: ${escapeHtml(meta.raceDate)}</li>`);
  if (meta.location) rows.push(`<li>장소: ${escapeHtml(meta.location)}</li>`);
  if (meta.types) rows.push(`<li>종목: ${escapeHtml(meta.types)}</li>`);
  const official = meta.officialLink
    ? `<p><a href="${escapeAttr(meta.officialLink)}">공식 접수/안내 페이지</a></p>`
    : '';
  return `<article data-seo-prerender="1">
    <h1>${escapeHtml(meta.h1 || meta.title)}</h1>
    <p>${escapeHtml(meta.description)}</p>
    ${rows.length ? `<ul>${rows.join('')}</ul>` : ''}
    ${official}
    <p><a href="${escapeAttr(meta.canonical)}">두러닝에서 자세히 보기</a></p>
  </article>`;
}

function eventJsonLd(meta) {
  if (!meta.eventName || !meta.raceDate) return '';
  const past = meta.raceDate < todayKst();
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: meta.eventName,
    description: meta.description,
    startDate: meta.raceDate,
    endDate: meta.endDate || meta.raceDate,
    eventStatus: past ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: meta.location || '대한민국',
      address: {
        '@type': 'PostalAddress',
        addressLocality: meta.location || '',
        addressCountry: 'KR',
      },
    },
    image: meta.ogImage,
    url: meta.canonical,
    organizer: { '@type': 'Organization', name: '두러닝', url: SITE },
  };
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function breadcrumbJsonLd(meta) {
  if (!meta.eventName) return '';
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '두러닝',
        item: SITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '마라톤 일정',
        item: `${SITE}/marathon`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: meta.eventName,
        item: meta.canonical,
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function injectIntoHtml(html, meta) {
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  if (/<meta\s+name=["']description["']/i.test(out)) {
    out = out.replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="description" content="${escapeAttr(meta.description)}" />`
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `<meta name="description" content="${escapeAttr(meta.description)}" />\n</head>`
    );
  }

  if (/<link\s+rel=["']canonical["']/i.test(out)) {
    out = out.replace(
      /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
      `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />\n</head>`
    );
  }

  const replacements = [
    [/property=["']og:url["']\s+content=["'][^"']*["']/i, `property="og:url" content="${escapeAttr(meta.canonical)}"`],
    [/property=["']og:title["']\s+content=["'][^"']*["']/i, `property="og:title" content="${escapeAttr(meta.ogTitle)}"`],
    [/property=["']og:description["']\s+content=["'][^"']*["']/i, `property="og:description" content="${escapeAttr(meta.ogDescription)}"`],
    [/property=["']og:image["']\s+content=["'][^"']*["']/i, `property="og:image" content="${escapeAttr(meta.ogImage)}"`],
    [/property=["']twitter:url["']\s+content=["'][^"']*["']/i, `property="twitter:url" content="${escapeAttr(meta.canonical)}"`],
    [/name=["']twitter:title["']\s+content=["'][^"']*["']/i, `name="twitter:title" content="${escapeAttr(meta.ogTitle)}"`],
    [/property=["']twitter:title["']\s+content=["'][^"']*["']/i, `property="twitter:title" content="${escapeAttr(meta.ogTitle)}"`],
    [/name=["']twitter:description["']\s+content=["'][^"']*["']/i, `name="twitter:description" content="${escapeAttr(meta.ogDescription)}"`],
    [/property=["']twitter:description["']\s+content=["'][^"']*["']/i, `property="twitter:description" content="${escapeAttr(meta.ogDescription)}"`],
    [/name=["']twitter:image["']\s+content=["'][^"']*["']/i, `name="twitter:image" content="${escapeAttr(meta.ogImage)}"`],
    [/property=["']twitter:image["']\s+content=["'][^"']*["']/i, `property="twitter:image" content="${escapeAttr(meta.ogImage)}"`],
  ];
  for (const [re, rep] of replacements) {
    if (re.test(out)) out = out.replace(re, rep);
  }

  const jsonLd = eventJsonLd(meta);
  if (jsonLd) {
    out = out.replace(/<\/head>/i, `${jsonLd}\n</head>`);
  }
  const breadcrumbLd = breadcrumbJsonLd(meta);
  if (breadcrumbLd) {
    out = out.replace(/<\/head>/i, `${breadcrumbLd}\n</head>`);
  }

  // Unique visible copy for crawlers. display:none is ignored for indexing.
  const crawlerBlock = articleHtml(meta);
  if (/data-seo-prerender=["']1["']/.test(out)) {
    out = out.replace(/<(div|article)[^>]*data-seo-prerender=["']1["'][^>]*>[\s\S]*?<\/\1>/i, crawlerBlock);
  } else if (/<div id=["']root["']><\/div>/i.test(out)) {
    out = out.replace(/<div id=["']root["']><\/div>/i, `${crawlerBlock}\n  <div id="root"></div>`);
  }

  const fallbackNoscript = `<!-- Fallback SEO content for non-JS crawlers -->
  <noscript>
    ${crawlerBlock}
  </noscript>`;
  if (/<!-- Fallback SEO content for non-JS crawlers -->[\s\S]*?<\/noscript>/i.test(out)) {
    out = out.replace(/<!-- Fallback SEO content for non-JS crawlers -->[\s\S]*?<\/noscript>/i, fallbackNoscript);
  }

  return out;
}

function minimalHtml(meta) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeAttr(meta.description)}" />
  <link rel="canonical" href="${escapeAttr(meta.canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeAttr(meta.canonical)}" />
  <meta property="og:title" content="${escapeAttr(meta.ogTitle)}" />
  <meta property="og:description" content="${escapeAttr(meta.ogDescription)}" />
  <meta property="og:image" content="${escapeAttr(meta.ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(meta.ogTitle)}" />
  <meta name="twitter:description" content="${escapeAttr(meta.ogDescription)}" />
  <meta name="twitter:image" content="${escapeAttr(meta.ogImage)}" />
</head>
<body>
  <h1>${escapeHtml(meta.h1 || meta.title)}</h1>
  <p>${escapeHtml(meta.description)}</p>
  <p><a href="${escapeAttr(meta.canonical)}">페이지 보기</a></p>
  <script>location.replace(${JSON.stringify(meta.canonical)});</script>
</body>
</html>`;
}

async function buildSeoHtml(pathname, origin, resolvedMeta) {
  const meta = resolvedMeta || (await resolveMeta(pathname));
  try {
    const indexUrl = new URL('/index.html', origin || SITE);
    const indexRes = await fetch(indexUrl.toString(), {
      headers: { Accept: 'text/html' },
    });
    if (indexRes.ok) {
      const html = await indexRes.text();
      // Avoid recursive loops if somehow we got the seo endpoint
      if (html && html.includes('<div id="root"')) {
        return injectIntoHtml(html, meta);
      }
    }
  } catch (err) {
    console.warn('index.html fetch failed, using minimal shell:', err?.message || err);
  }
  return minimalHtml(meta);
}

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'dorunning.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;

  let pathname = '/';
  try {
    const u = new URL(req.url, origin);
    pathname = u.searchParams.get('path') || u.pathname || '/';
    // Strip /api/seo prefix if called without ?path=
    if (pathname.startsWith('/api/seo')) {
      pathname = u.searchParams.get('path') || '/';
    }
  } catch {
    pathname = '/';
  }

  // Normalize
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

  try {
    const meta = await resolveMeta(pathname);
    const html = await buildSeoHtml(pathname, origin, meta);
    res.statusCode = meta.notFound ? 404 : 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', meta.notFound ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=86400');
    res.setHeader('X-Dorunning-SEO', '1');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(html);
  } catch (err) {
    console.error('seo handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('SEO render failed');
  }
}

// Named exports for middleware (bundlers that can import this file)
export { buildSeoHtml, resolveMeta, injectIntoHtml };
