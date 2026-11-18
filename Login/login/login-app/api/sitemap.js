/**
 * Dynamic sitemap generator.
 * Fetches approved marathons from Supabase and builds a full sitemap.xml
 * including static pages, marathon detail pages, and guide pages.
 *
 * GET /api/sitemap  →  Content-Type: application/xml
 */

const SITE = 'https://www.dorunning.app';
const SUPABASE_URL = 'https://ismclnqslxnlsfmqjytc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RWdFyo-SAjkjsNnQJC2JBw_jbX6bdXd';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, opts = {}) {
  let xml = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
  if (opts.lastmod) xml += `    <lastmod>${opts.lastmod}</lastmod>\n`;
  if (opts.changefreq) xml += `    <changefreq>${opts.changefreq}</changefreq>\n`;
  if (opts.priority != null) xml += `    <priority>${opts.priority}</priority>\n`;
  xml += '  </url>\n';
  return xml;
}

// Static pages
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/marathon', changefreq: 'daily', priority: 0.9 },
  { path: '/guide', changefreq: 'daily', priority: 0.9 },
  { path: '/boards', changefreq: 'daily', priority: 0.8 },
  { path: '/course', changefreq: 'weekly', priority: 0.8 },
  { path: '/event', changefreq: 'weekly', priority: 0.8 },
  { path: '/about', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/copyright', changefreq: 'monthly', priority: 0.3 },
  { path: '/privacy', changefreq: 'monthly', priority: 0.3 },
];

// Guide articles (static slugs)
const GUIDE_PAGES = [
  { slug: 'beginner-10k-plan', lastmod: '2026-10-15' },
  { slug: 'running-shoes-guide', lastmod: '2026-10-18' },
  { slug: 'carbo-loading-diet', lastmod: '2026-10-20' },
  { slug: 'energy-gel-hydration', lastmod: '2026-10-22' },
  { slug: 'injury-prevention', lastmod: '2026-10-24' },
  { slug: 'negative-split-pacing', lastmod: '2026-10-25' },
  { slug: 'race-day-checklist', lastmod: '2026-10-27' },
  { slug: 'weather-running-gear', lastmod: '2026-10-28' },
];

async function fetchApprovedMarathons() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/marathons?status=eq.approved&select=id,race_date&order=race_date.desc&limit=2000`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const today = todayIso();
  const marathons = await fetchApprovedMarathons();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  for (const p of STATIC_PAGES) {
    xml += urlEntry(`${SITE}${p.path}`, {
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    });
  }

  // Marathon detail pages
  for (const m of marathons) {
    xml += urlEntry(`${SITE}/marathon/${m.id}`, {
      lastmod: m.race_date || today,
      changefreq: 'weekly',
      priority: 0.7,
    });
  }

  // Guide detail pages
  for (const g of GUIDE_PAGES) {
    xml += urlEntry(`${SITE}/guide/${g.slug}`, {
      lastmod: g.lastmod,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }

  xml += '</urlset>';

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(xml);
}
