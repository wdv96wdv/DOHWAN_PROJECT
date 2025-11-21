import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

async function generateSitemap() {
  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/login', changefreq: 'weekly', priority: 0.8 },
    { url: '/register', changefreq: 'weekly', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/calendar', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
    { url: '/course', changefreq: 'monthly', priority: 0.7 },
    { url: '/event', changefreq: 'monthly', priority: 0.7 },
    { url: '/marathon', changefreq: 'monthly', priority: 0.7 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.7 },
    { url: '/wishlist', changefreq: 'monthly', priority: 0.7 },
    { url: '/board/list', changefreq: 'daily', priority: 0.9 },
    // Add other pages here
  ];

  const sitemapPath = resolve('public', 'sitemap.xml');
  const writeStream = createWriteStream(sitemapPath);
  const stream = new SitemapStream({ hostname: 'https://dorunning.vercel.app' });
  stream.pipe(writeStream);

  links.forEach(link => stream.write(link));
  stream.end();

  await streamToPromise(stream); // 스트림이 끝날 때까지 기다림
  console.log('sitemap.xml 생성 완료!');
}

generateSitemap();
