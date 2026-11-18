/**
 * Edge middleware: for known social / search crawlers, rewrite public content
 * routes to /api/seo so the first HTML response has the correct
 * title / description / canonical / OG tags.
 *
 * Trailing-slash URLs on these routes get a 301 to the non-slash form first,
 * so Google does not treat /marathon/ as a separate soft-404 document.
 *
 * Normal browsers fall through to the Vite SPA (vercel.json → index.html).
 * Home `/` keeps the static index.html OG from the copy/positioning PR.
 *
 * Not full SSR — only meta + a small crawler-visible block inside the SPA shell.
 */
import { next, rewrite } from '@vercel/edge';

// Crawlers only (Kakao scrap bot, Facebook, Twitter, Yeti, Google, etc.)
// CAUTION: Do NOT match general in-app browser UAs (e.g. 'KAKAOTALK', 'NAVER') as bots!
// Kakao scrap bot uses 'kakaotalk-scrap', whereas Kakao in-app browser uses 'KAKAOTALK'.
// Naver search bot uses 'Yeti', whereas Naver app browser uses 'NAVER(inapp...)'.
const BOT_UA =
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|kakaotalk-scrap|kakaostory|kakaobot|yeti|googlebot|bingbot|duckduckbot|baiduspider|yandex|sogou|exabot|ia_archiver|semrush|ahrefs|mj12bot|dotbot|bytespider|petalbot|applebot|storebot-google|google-inspectiontool|chrome-lighthouse|embedly|quora link preview|redditbot|pinterest|vkshare|w3c_validator|preview/i;


export const config = {
  // Include trailing-slash variants so /marathon/ is handled (soft 404 in GSC)
  matcher: [
    '/about',
    '/about/',
    '/marathon',
    '/marathon/',
    '/marathon/:path*',
    '/guide',
    '/guide/',
    '/guide/:path*',
    '/boards',
    '/boards/',
    '/boards/:path*',
    '/contact',
    '/contact/',
    '/course',
    '/course/',
    '/event',
    '/event/',
    '/privacy',
    '/privacy/',
    '/copyright',
    '/copyright/',
  ],
};

// Routes that the SEO handler can serve meaningful meta for
const SEO_ROUTES = [
  { test: (p) => p === '/about', name: 'about' },
  { test: (p) => p === '/marathon', name: 'marathon-list' },
  { test: (p) => /^\/marathon\/[^/]+$/.test(p), name: 'marathon-detail' },
  { test: (p) => p === '/guide', name: 'guide' },
  { test: (p) => /^\/guide\/[^/]+$/.test(p), name: 'guide-detail' },
  { test: (p) => p === '/boards', name: 'boards' },
  { test: (p) => /^\/boards\/[^/]+$/.test(p), name: 'board-detail' },
  { test: (p) => p === '/contact', name: 'contact' },
  { test: (p) => p === '/course', name: 'course' },
  { test: (p) => p === '/event', name: 'event' },
  { test: (p) => p === '/privacy', name: 'privacy' },
  { test: (p) => p === '/copyright', name: 'copyright' },
];

export default function middleware(request) {
  const url = new URL(request.url);
  let pathname = url.pathname || '/';

  // Always canonicalize trailing slash on matched routes (fixes Soft 404 on /marathon/)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    return Response.redirect(url.toString(), 301);
  }

  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return next();
  }

  // Only the routes we can serve useful meta for
  const matched = SEO_ROUTES.some((r) => r.test(pathname));
  if (!matched) {
    return next();
  }

  const dest = new URL('/api/seo', url.origin);
  dest.searchParams.set('path', pathname);
  return rewrite(dest);
}
