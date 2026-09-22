/**
 * Edge middleware: for known social / search crawlers, rewrite public content
 * routes to /api/seo so the first HTML response has the correct
 * title / description / canonical / OG tags.
 *
 * Normal browsers fall through to the Vite SPA (vercel.json → index.html).
 * Home `/` keeps the static index.html OG from the copy/positioning PR.
 *
 * Not full SSR — only meta + a small crawler-visible block inside the SPA shell.
 */
import { next, rewrite } from '@vercel/edge';

// Kakao / Facebook / Twitter / Naver / Google + common link-preview agents
const BOT_UA =
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|kakaotalk|kakaobot|line\/|naver|yeti|googlebot|bingbot|duckduckbot|baiduspider|yandex|sogou|exabot|ia_archiver|semrush|ahrefs|mj12bot|dotbot|bytespider|petalbot|applebot|storebot-google|google-inspectiontool|chrome-lighthouse|embedly|quora link preview|redditbot|pinterest|vkshare|w3c_validator|preview/i;

export const config = {
  matcher: ['/about', '/marathon', '/marathon/:path*'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return next();
  }

  const url = new URL(request.url);
  let pathname = url.pathname || '/';
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Only the routes we can serve useful meta for
  const isAbout = pathname === '/about';
  const isList = pathname === '/marathon';
  const isDetail = /^\/marathon\/[^/]+$/.test(pathname);
  if (!isAbout && !isList && !isDetail) {
    return next();
  }

  const dest = new URL('/api/seo', url.origin);
  dest.searchParams.set('path', pathname);
  return rewrite(dest);
}
